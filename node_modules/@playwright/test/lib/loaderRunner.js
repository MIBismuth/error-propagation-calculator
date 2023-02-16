"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = exports.LoaderRunner = void 0;
var _configLoader = require("./configLoader");
var _process = require("./process");
var _testLoader = require("./testLoader");
var _globals = require("./globals");
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

class LoaderRunner extends _process.ProcessRunner {
  constructor(config) {
    super();
    this._config = void 0;
    this._configLoaderPromise = void 0;
    this._config = config;
  }
  _configLoader() {
    if (!this._configLoaderPromise) this._configLoaderPromise = _configLoader.ConfigLoader.deserialize(this._config);
    return this._configLoaderPromise;
  }
  async loadTestFiles(params) {
    const loadErrors = [];
    (0, _globals.setFatalErrorSink)(loadErrors);
    const configLoader = await this._configLoader();
    const rootSuite = await (0, _testLoader.loadTestFilesInProcess)(configLoader.fullConfig(), params.files, loadErrors);
    return {
      rootSuite: rootSuite._deepSerialize(),
      loadErrors
    };
  }
}
exports.LoaderRunner = LoaderRunner;
const create = config => new LoaderRunner(config);
exports.create = create;