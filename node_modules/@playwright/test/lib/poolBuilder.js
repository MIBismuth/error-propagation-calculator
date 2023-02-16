"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PoolBuilder = void 0;
var _fixtures = require("./fixtures");
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

class PoolBuilder {
  static buildForLoader(suite) {
    new PoolBuilder('loader').buildPools(suite);
  }
  static createForWorker(project) {
    return new PoolBuilder('worker', project);
  }
  constructor(type, project) {
    this._project = void 0;
    this._testTypePools = new Map();
    this._type = void 0;
    this._type = type;
    this._project = project;
  }
  buildPools(suite) {
    suite.forEachTest(test => {
      const pool = this._buildPoolForTest(test);
      if (this._type === 'loader') test._poolDigest = pool.digest;
      if (this._type === 'worker') test._pool = pool;
    });
  }
  _buildPoolForTest(test) {
    let pool = this._buildTestTypePool(test._testType);
    const parents = [];
    for (let parent = test.parent; parent; parent = parent.parent) parents.push(parent);
    parents.reverse();
    for (const parent of parents) {
      if (parent._use.length) pool = new _fixtures.FixturePool(parent._use, pool, parent._type === 'describe');
      for (const hook of parent._hooks) pool.validateFunction(hook.fn, hook.type + ' hook', hook.location);
      for (const modifier of parent._modifiers) pool.validateFunction(modifier.fn, modifier.type + ' modifier', modifier.location);
    }
    pool.validateFunction(test.fn, 'Test', test.location);
    return pool;
  }
  _buildTestTypePool(testType) {
    if (!this._testTypePools.has(testType)) {
      const fixtures = this._project ? this._applyConfigUseOptions(this._project, testType) : testType.fixtures;
      const pool = new _fixtures.FixturePool(fixtures);
      this._testTypePools.set(testType, pool);
    }
    return this._testTypePools.get(testType);
  }
  _applyConfigUseOptions(project, testType) {
    const projectUse = project.use || {};
    const configKeys = new Set(Object.keys(projectUse));
    if (!configKeys.size) return testType.fixtures;
    const result = [];
    for (const f of testType.fixtures) {
      result.push(f);
      const optionsFromConfig = {};
      for (const [key, value] of Object.entries(f.fixtures)) {
        if ((0, _fixtures.isFixtureOption)(value) && configKeys.has(key)) optionsFromConfig[key] = [projectUse[key], value[1]];
      }
      if (Object.entries(optionsFromConfig).length) {
        // Add config options immediately after original option definition,
        // so that any test.use() override it.
        result.push({
          fixtures: optionsFromConfig,
          location: {
            file: `project#${project._id}`,
            line: 1,
            column: 1
          },
          fromConfig: true
        });
      }
    }
    return result;
  }
}
exports.PoolBuilder = PoolBuilder;