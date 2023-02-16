"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addFatalError = addFatalError;
exports.currentTestInfo = currentTestInfo;
exports.currentlyLoadingFileSuite = currentlyLoadingFileSuite;
exports.setCurrentTestInfo = setCurrentTestInfo;
exports.setCurrentlyLoadingFileSuite = setCurrentlyLoadingFileSuite;
exports.setFatalErrorSink = setFatalErrorSink;
var _util = require("./util");
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

let currentTestInfoValue = null;
function setCurrentTestInfo(testInfo) {
  currentTestInfoValue = testInfo;
}
function currentTestInfo() {
  return currentTestInfoValue;
}
let currentFileSuite;
function setCurrentlyLoadingFileSuite(suite) {
  currentFileSuite = suite;
}
function currentlyLoadingFileSuite() {
  return currentFileSuite;
}
let _fatalErrors;
function setFatalErrorSink(fatalErrors) {
  _fatalErrors = fatalErrors;
}
function addFatalError(message, location) {
  if (_fatalErrors) _fatalErrors.push({
    message: `Error: ${message}`,
    location
  });else throw new Error(`${(0, _util.formatLocation)(location)}: ${message}`);
}