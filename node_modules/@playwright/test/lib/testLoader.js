"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultTimeout = exports.TestLoader = void 0;
exports.loadTestFilesInProcess = loadTestFilesInProcess;
var _path = _interopRequireDefault(require("path"));
var _globals = require("./globals");
var _poolBuilder = require("./poolBuilder");
var _test = require("./test");
var _transform = require("./transform");
var _util = require("./util");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Copyright Microsoft Corporation. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const defaultTimeout = 30000;

// To allow multiple loaders in the same process without clearing require cache,
// we make these maps global.
exports.defaultTimeout = defaultTimeout;
const cachedFileSuites = new Map();
class TestLoader {
  constructor(fullConfig) {
    this._fullConfig = void 0;
    this._fullConfig = fullConfig;
  }
  async loadTestFile(file, environment, loadErrors) {
    if (cachedFileSuites.has(file)) return cachedFileSuites.get(file);
    const suite = new _test.Suite(_path.default.relative(this._fullConfig.rootDir, file) || _path.default.basename(file), 'file');
    suite._requireFile = file;
    suite.location = {
      file,
      line: 0,
      column: 0
    };
    (0, _globals.setCurrentlyLoadingFileSuite)(suite);
    try {
      await (0, _transform.requireOrImport)(file);
      cachedFileSuites.set(file, suite);
    } catch (e) {
      if (environment === 'worker') throw e;
      loadErrors.push((0, _util.serializeError)(e));
    } finally {
      (0, _globals.setCurrentlyLoadingFileSuite)(undefined);
    }
    {
      // Test locations that we discover potentially have different file name.
      // This could be due to either
      //   a) use of source maps or due to
      //   b) require of one file from another.
      // Try fixing (a) w/o regressing (b).

      const files = new Set();
      suite.allTests().map(t => files.add(t.location.file));
      if (files.size === 1) {
        // All tests point to one file.
        const mappedFile = files.values().next().value;
        if (suite.location.file !== mappedFile) {
          // The file is different, check for a likely source map case.
          if (_path.default.extname(mappedFile) !== _path.default.extname(suite.location.file)) suite.location.file = mappedFile;
        }
      }
    }
    return suite;
  }
}
exports.TestLoader = TestLoader;
async function loadTestFilesInProcess(config, testFiles, loadErrors) {
  const testLoader = new TestLoader(config);
  const rootSuite = new _test.Suite('', 'root');
  for (const file of testFiles) {
    const fileSuite = await testLoader.loadTestFile(file, 'loader', loadErrors);
    rootSuite._addSuite(fileSuite);
  }
  // Generate hashes.
  _poolBuilder.PoolBuilder.buildForLoader(rootSuite);
  return rootSuite;
}