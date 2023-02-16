"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildFileSuiteForProject = buildFileSuiteForProject;
exports.filterOnly = filterOnly;
exports.filterSuite = filterSuite;
exports.filterSuiteWithOnlySemantics = filterSuiteWithOnlySemantics;
exports.filterTestsRemoveEmptySuites = filterTestsRemoveEmptySuites;
var _path = _interopRequireDefault(require("path"));
var _utils = require("playwright-core/lib/utils");
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

function filterSuite(suite, suiteFilter, testFilter) {
  for (const child of suite.suites) {
    if (!suiteFilter(child)) filterSuite(child, suiteFilter, testFilter);
  }
  const filteredTests = suite.tests.filter(testFilter);
  const entries = new Set([...suite.suites, ...filteredTests]);
  suite._entries = suite._entries.filter(e => entries.has(e)); // Preserve the order.
}

function filterTestsRemoveEmptySuites(suite, filter) {
  const filteredSuites = suite.suites.filter(child => filterTestsRemoveEmptySuites(child, filter));
  const filteredTests = suite.tests.filter(filter);
  const entries = new Set([...filteredSuites, ...filteredTests]);
  suite._entries = suite._entries.filter(e => entries.has(e)); // Preserve the order.
  return !!suite._entries.length;
}
function buildFileSuiteForProject(project, suite, repeatEachIndex) {
  const relativeFile = _path.default.relative(project.testDir, suite.location.file).split(_path.default.sep).join('/');
  const fileId = (0, _utils.calculateSha1)(relativeFile).slice(0, 20);

  // Clone suite.
  const result = suite._deepClone();
  result._fileId = fileId;

  // Assign test properties with project-specific values.
  result.forEachTest((test, suite) => {
    suite._fileId = fileId;
    const repeatEachIndexSuffix = repeatEachIndex ? ` (repeat:${repeatEachIndex})` : '';
    // At the point of the query, suite is not yet attached to the project, so we only get file, describe and test titles.
    const testIdExpression = `[project=${project._id}]${test.titlePath().join('\x1e')}${repeatEachIndexSuffix}`;
    const testId = fileId + '-' + (0, _utils.calculateSha1)(testIdExpression).slice(0, 20);
    test.id = testId;
    test.repeatEachIndex = repeatEachIndex;
    test._projectId = project._id;
    test.retries = project.retries;
    for (let parentSuite = suite; parentSuite; parentSuite = parentSuite.parent) {
      if (parentSuite._retries !== undefined) {
        test.retries = parentSuite._retries;
        break;
      }
    }
    // We only compute / set digest in the runner.
    if (test._poolDigest) test._workerHash = `${project._id}-${test._poolDigest}-${repeatEachIndex}`;
  });
  return result;
}
function filterOnly(suite) {
  if (!suite._getOnlyItems().length) return;
  const suiteFilter = suite => suite._only;
  const testFilter = test => test._only;
  return filterSuiteWithOnlySemantics(suite, suiteFilter, testFilter);
}
function filterSuiteWithOnlySemantics(suite, suiteFilter, testFilter) {
  const onlySuites = suite.suites.filter(child => filterSuiteWithOnlySemantics(child, suiteFilter, testFilter) || suiteFilter(child));
  const onlyTests = suite.tests.filter(testFilter);
  const onlyEntries = new Set([...onlySuites, ...onlyTests]);
  if (onlyEntries.size) {
    suite._entries = suite._entries.filter(e => onlyEntries.has(e)); // Preserve the order.
    return true;
  }
  return false;
}