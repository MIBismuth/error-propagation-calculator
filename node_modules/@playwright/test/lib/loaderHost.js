"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoaderHost = void 0;
var _processHost = require("./processHost");
var _test = require("./test");
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

class LoaderHost extends _processHost.ProcessHost {
  constructor() {
    super(require.resolve('./loaderRunner.js'), 'loader');
  }
  async start(config) {
    await this.startRunner(config, true, {});
  }
  async loadTestFiles(files, loadErrors) {
    const result = await this.sendMessage({
      method: 'loadTestFiles',
      params: {
        files
      }
    });
    loadErrors.push(...result.loadErrors);
    return _test.Suite._deepParse(result.rootSuite);
  }
}
exports.LoaderHost = LoaderHost;