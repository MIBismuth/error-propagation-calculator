"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.kDefaultConfigFiles = exports.builtInReporters = exports.Runner = void 0;
var fs = _interopRequireWildcard(require("fs"));
var path = _interopRequireWildcard(require("path"));
var _utils = require("playwright-core/lib/utils");
var _utilsBundle = require("playwright-core/lib/utilsBundle");
var _util = require("util");
var _dispatcher = require("./dispatcher");
var _configLoader = require("./configLoader");
var _plugins = require("./plugins");
var _dockerPlugin = require("./plugins/dockerPlugin");
var _webServerPlugin = require("./plugins/webServerPlugin");
var _base = require("./reporters/base");
var _dot = _interopRequireDefault(require("./reporters/dot"));
var _empty = _interopRequireDefault(require("./reporters/empty"));
var _github = _interopRequireDefault(require("./reporters/github"));
var _html = _interopRequireDefault(require("./reporters/html"));
var _json = _interopRequireDefault(require("./reporters/json"));
var _junit = _interopRequireDefault(require("./reporters/junit"));
var _line = _interopRequireDefault(require("./reporters/line"));
var _list = _interopRequireDefault(require("./reporters/list"));
var _multiplexer = require("./reporters/multiplexer");
var _sigIntWatcher = require("./sigIntWatcher");
var _test = require("./test");
var _util2 = require("./util");
var _globals = require("./globals");
var _suiteUtils = require("./suiteUtils");
var _loaderHost = require("./loaderHost");
var _testLoader = require("./testLoader");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Copyright 2019 Google Inc. All rights reserved.
 * Modifications copyright (c) Microsoft Corporation.
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

const removeFolderAsync = (0, _util.promisify)(_utilsBundle.rimraf);
const readDirAsync = (0, _util.promisify)(fs.readdir);
const readFileAsync = (0, _util.promisify)(fs.readFile);
const kDefaultConfigFiles = ['playwright.config.ts', 'playwright.config.js', 'playwright.config.mjs'];
exports.kDefaultConfigFiles = kDefaultConfigFiles;
class Runner {
  constructor(configCLIOverrides) {
    this._configLoader = void 0;
    this._reporter = void 0;
    this._plugins = [];
    this._fatalErrors = [];
    this._configLoader = new _configLoader.ConfigLoader(configCLIOverrides);
    (0, _plugins.setRunnerToAddPluginsTo)(this);
    (0, _globals.setFatalErrorSink)(this._fatalErrors);
  }
  addPlugin(plugin) {
    this._plugins.push(plugin);
  }
  async loadConfigFromResolvedFile(resolvedConfigFile) {
    return await this._configLoader.loadConfigFile(resolvedConfigFile);
  }
  loadEmptyConfig(configFileOrDirectory) {
    return this._configLoader.loadEmptyConfig(configFileOrDirectory);
  }
  static resolveConfigFile(configFileOrDirectory) {
    const resolveConfig = configFile => {
      if (fs.existsSync(configFile)) return configFile;
    };
    const resolveConfigFileFromDirectory = directory => {
      for (const configName of kDefaultConfigFiles) {
        const configFile = resolveConfig(path.resolve(directory, configName));
        if (configFile) return configFile;
      }
    };
    if (!fs.existsSync(configFileOrDirectory)) throw new Error(`${configFileOrDirectory} does not exist`);
    if (fs.statSync(configFileOrDirectory).isDirectory()) {
      // When passed a directory, look for a config file inside.
      const configFile = resolveConfigFileFromDirectory(configFileOrDirectory);
      if (configFile) return configFile;
      // If there is no config, assume this as a root testing directory.
      return null;
    } else {
      // When passed a file, it must be a config file.
      const configFile = resolveConfig(configFileOrDirectory);
      return configFile;
    }
  }
  async _createReporter(list) {
    const defaultReporters = {
      dot: list ? ListModeReporter : _dot.default,
      line: list ? ListModeReporter : _line.default,
      list: list ? ListModeReporter : _list.default,
      github: _github.default,
      json: _json.default,
      junit: _junit.default,
      null: _empty.default,
      html: _html.default
    };
    const reporters = [];
    for (const r of this._configLoader.fullConfig().reporter) {
      const [name, arg] = r;
      if (name in defaultReporters) {
        reporters.push(new defaultReporters[name](arg));
      } else {
        const reporterConstructor = await this._configLoader.loadReporter(name);
        reporters.push(new reporterConstructor(arg));
      }
    }
    if (process.env.PW_TEST_REPORTER) {
      const reporterConstructor = await this._configLoader.loadReporter(process.env.PW_TEST_REPORTER);
      reporters.push(new reporterConstructor());
    }
    const someReporterPrintsToStdio = reporters.some(r => {
      const prints = r.printsToStdio ? r.printsToStdio() : true;
      return prints;
    });
    if (reporters.length && !someReporterPrintsToStdio) {
      // Add a line/dot/list-mode reporter for convenience.
      // Important to put it first, jsut in case some other reporter stalls onEnd.
      if (list) reporters.unshift(new ListModeReporter());else reporters.unshift(!process.env.CI ? new _line.default({
        omitFailures: true
      }) : new _dot.default());
    }
    return new _multiplexer.Multiplexer(reporters);
  }
  async runAllTests(options) {
    var _this$_reporter$onEnd, _this$_reporter2, _this$_reporter$_onEx, _this$_reporter3;
    this._reporter = await this._createReporter(!!options.listOnly);
    const config = this._configLoader.fullConfig();
    const result = await (0, _utils.raceAgainstTimeout)(() => this._run(options), config.globalTimeout);
    let fullResult;
    if (result.timedOut) {
      var _this$_reporter$onErr, _this$_reporter;
      (_this$_reporter$onErr = (_this$_reporter = this._reporter).onError) === null || _this$_reporter$onErr === void 0 ? void 0 : _this$_reporter$onErr.call(_this$_reporter, createStacklessError(`Timed out waiting ${config.globalTimeout / 1000}s for the entire test run`));
      fullResult = {
        status: 'timedout'
      };
    } else {
      fullResult = result.result;
    }
    await ((_this$_reporter$onEnd = (_this$_reporter2 = this._reporter).onEnd) === null || _this$_reporter$onEnd === void 0 ? void 0 : _this$_reporter$onEnd.call(_this$_reporter2, fullResult));

    // Calling process.exit() might truncate large stdout/stderr output.
    // See https://github.com/nodejs/node/issues/6456.
    // See https://github.com/nodejs/node/issues/12921
    await new Promise(resolve => process.stdout.write('', () => resolve()));
    await new Promise(resolve => process.stderr.write('', () => resolve()));
    await ((_this$_reporter$_onEx = (_this$_reporter3 = this._reporter)._onExit) === null || _this$_reporter$_onEx === void 0 ? void 0 : _this$_reporter$_onEx.call(_this$_reporter3));
    return fullResult;
  }
  async listTestFiles(projectNames) {
    const projects = this._collectProjects(projectNames);
    const filesByProject = await this._collectFiles(projects, []);
    const report = {
      projects: []
    };
    for (const [project, files] of filesByProject) {
      report.projects.push({
        ...sanitizeConfigForJSON(project, new Set()),
        files
      });
    }
    return report;
  }
  _collectProjects(projectNames) {
    const fullConfig = this._configLoader.fullConfig();
    if (!projectNames) return [...fullConfig.projects];
    const projectsToFind = new Set();
    const unknownProjects = new Map();
    projectNames.forEach(n => {
      const name = n.toLocaleLowerCase();
      projectsToFind.add(name);
      unknownProjects.set(name, n);
    });
    const projects = fullConfig.projects.filter(project => {
      const name = project.name.toLocaleLowerCase();
      unknownProjects.delete(name);
      return projectsToFind.has(name);
    });
    if (unknownProjects.size) {
      const names = fullConfig.projects.map(p => p.name).filter(name => !!name);
      if (!names.length) throw new Error(`No named projects are specified in the configuration file`);
      const unknownProjectNames = Array.from(unknownProjects.values()).map(n => `"${n}"`).join(', ');
      throw new Error(`Project(s) ${unknownProjectNames} not found. Available named projects: ${names.map(name => `"${name}"`).join(', ')}`);
    }
    return projects;
  }
  async _collectFiles(projects, commandLineFileFilters) {
    const extensions = ['.js', '.ts', '.mjs', '.tsx', '.jsx'];
    const testFileExtension = file => extensions.includes(path.extname(file));
    const filesByProject = new Map();
    const fileToProjectName = new Map();
    const commandLineFileMatcher = commandLineFileFilters.length ? (0, _util2.createFileMatcherFromFilters)(commandLineFileFilters) : () => true;
    for (const project of projects) {
      const allFiles = await collectFiles(project.testDir, project._respectGitIgnore);
      const testMatch = (0, _util2.createFileMatcher)(project.testMatch);
      const testIgnore = (0, _util2.createFileMatcher)(project.testIgnore);
      const testFiles = allFiles.filter(file => {
        if (!testFileExtension(file)) return false;
        const isTest = !testIgnore(file) && testMatch(file) && commandLineFileMatcher(file);
        if (!isTest) return false;
        fileToProjectName.set(file, project.name);
        return true;
      });
      filesByProject.set(project, testFiles);
    }
    return filesByProject;
  }
  async _collectTestGroups(options) {
    const config = this._configLoader.fullConfig();
    const projects = this._collectProjects(options.projectFilter);
    const filesByProject = await this._collectFiles(projects, options.testFileFilters);
    const rootSuite = await this._createFilteredRootSuite(options, filesByProject);
    const testGroups = createTestGroups(rootSuite.suites, config.workers);
    return {
      rootSuite,
      testGroups
    };
  }
  async _createFilteredRootSuite(options, filesByProject) {
    const config = this._configLoader.fullConfig();
    const allTestFiles = new Set();
    for (const files of filesByProject.values()) files.forEach(file => allTestFiles.add(file));

    // Load all tests.
    const preprocessRoot = await this._loadTests(allTestFiles);

    // Complain about duplicate titles.
    this._fatalErrors.push(...createDuplicateTitlesErrors(config, preprocessRoot));

    // Filter tests to respect line/column filter.
    filterByFocusedLine(preprocessRoot, options.testFileFilters);

    // Complain about only.
    if (config.forbidOnly) {
      const onlyTestsAndSuites = preprocessRoot._getOnlyItems();
      if (onlyTestsAndSuites.length > 0) this._fatalErrors.push(...createForbidOnlyErrors(config, onlyTestsAndSuites));
    }

    // Filter only.
    if (!options.listOnly) (0, _suiteUtils.filterOnly)(preprocessRoot);

    // Generate projects.
    const fileSuites = new Map();
    for (const fileSuite of preprocessRoot.suites) fileSuites.set(fileSuite._requireFile, fileSuite);
    const rootSuite = new _test.Suite('', 'root');
    for (const [project, files] of filesByProject) {
      const grepMatcher = (0, _util2.createTitleMatcher)(project.grep);
      const grepInvertMatcher = project.grepInvert ? (0, _util2.createTitleMatcher)(project.grepInvert) : null;
      const titleMatcher = test => {
        const grepTitle = test.titlePath().join(' ');
        if (grepInvertMatcher !== null && grepInvertMatcher !== void 0 && grepInvertMatcher(grepTitle)) return false;
        return grepMatcher(grepTitle) && options.testTitleMatcher(grepTitle);
      };
      const projectSuite = new _test.Suite(project.name, 'project');
      projectSuite._projectConfig = project;
      if (project._fullyParallel) projectSuite._parallelMode = 'parallel';
      rootSuite._addSuite(projectSuite);
      for (const file of files) {
        const fileSuite = fileSuites.get(file);
        if (!fileSuite) continue;
        for (let repeatEachIndex = 0; repeatEachIndex < project.repeatEach; repeatEachIndex++) {
          const builtSuite = (0, _suiteUtils.buildFileSuiteForProject)(project, fileSuite, repeatEachIndex);
          if (!(0, _suiteUtils.filterTestsRemoveEmptySuites)(builtSuite, titleMatcher)) continue;
          projectSuite._addSuite(builtSuite);
        }
      }
    }
    return rootSuite;
  }
  async _loadTests(testFiles) {
    if (process.env.PWTEST_OOP_LOADER) {
      const loaderHost = new _loaderHost.LoaderHost();
      await loaderHost.start(this._configLoader.serializedConfig());
      try {
        return await loaderHost.loadTestFiles([...testFiles], this._fatalErrors);
      } finally {
        await loaderHost.stop();
      }
    }
    return (0, _testLoader.loadTestFilesInProcess)(this._configLoader.fullConfig(), [...testFiles], this._fatalErrors);
  }
  _filterForCurrentShard(rootSuite, testGroups) {
    const shard = this._configLoader.fullConfig().shard;
    if (!shard) return;

    // Each shard includes:
    // - its portion of the regular tests
    // - project setup tests for the projects that have regular tests in this shard
    let shardableTotal = 0;
    for (const group of testGroups) shardableTotal += group.tests.length;
    const shardTests = new Set();

    // Each shard gets some tests.
    const shardSize = Math.floor(shardableTotal / shard.total);
    // First few shards get one more test each.
    const extraOne = shardableTotal - shardSize * shard.total;
    const currentShard = shard.current - 1; // Make it zero-based for calculations.
    const from = shardSize * currentShard + Math.min(extraOne, currentShard);
    const to = from + shardSize + (currentShard < extraOne ? 1 : 0);
    let current = 0;
    const shardProjects = new Set();
    const shardTestGroups = [];
    for (const group of testGroups) {
      // Any test group goes to the shard that contains the first test of this group.
      // So, this shard gets any group that starts at [from; to)
      if (current >= from && current < to) {
        shardProjects.add(group.projectId);
        shardTestGroups.push(group);
        for (const test of group.tests) shardTests.add(test);
      }
      current += group.tests.length;
    }
    testGroups.length = 0;
    testGroups.push(...shardTestGroups);
    if (!shardTests.size) {
      // Filtering with "only semantics" does not work when we have zero tests - it leaves all the tests.
      // We need an empty suite in this case.
      rootSuite._entries = [];
    } else {
      (0, _suiteUtils.filterSuiteWithOnlySemantics)(rootSuite, () => false, test => shardTests.has(test));
    }
  }
  async _run(options) {
    var _this$_reporter$onBeg, _this$_reporter4;
    const config = this._configLoader.fullConfig();
    // Each entry is an array of test groups that can be run concurrently. All
    // test groups from the previos entries must finish before entry starts.
    const {
      rootSuite,
      testGroups
    } = await this._collectTestGroups(options);

    // Fail when no tests.
    if (!rootSuite.allTests().length && !options.passWithNoTests) this._fatalErrors.push(createNoTestsError());
    this._filterForCurrentShard(rootSuite, testGroups);
    config._maxConcurrentTestGroups = testGroups.length;

    // Report begin
    (_this$_reporter$onBeg = (_this$_reporter4 = this._reporter).onBegin) === null || _this$_reporter$onBeg === void 0 ? void 0 : _this$_reporter$onBeg.call(_this$_reporter4, config, rootSuite);

    // Bail out on errors prior to running global setup.
    if (this._fatalErrors.length) {
      for (const error of this._fatalErrors) {
        var _this$_reporter$onErr2, _this$_reporter5;
        (_this$_reporter$onErr2 = (_this$_reporter5 = this._reporter).onError) === null || _this$_reporter$onErr2 === void 0 ? void 0 : _this$_reporter$onErr2.call(_this$_reporter5, error);
      }
      return {
        status: 'failed'
      };
    }

    // Bail out if list mode only, don't do any work.
    if (options.listOnly) return {
      status: 'passed'
    };

    // Remove output directores.
    if (!(await this._removeOutputDirs(options))) return {
      status: 'failed'
    };

    // Run Global setup.
    const result = {
      status: 'passed'
    };
    const globalTearDown = await this._performGlobalSetup(config, rootSuite, result);
    if (result.status !== 'passed') return result;
    if (config._ignoreSnapshots) {
      var _this$_reporter$onStd, _this$_reporter6;
      (_this$_reporter$onStd = (_this$_reporter6 = this._reporter).onStdOut) === null || _this$_reporter$onStd === void 0 ? void 0 : _this$_reporter$onStd.call(_this$_reporter6, _utilsBundle.colors.dim(['NOTE: running with "ignoreSnapshots" option. All of the following asserts are silently ignored:', '- expect().toMatchSnapshot()', '- expect().toHaveScreenshot()', ''].join('\n')));
    }

    // Run tests.
    try {
      const dispatchResult = await this._dispatchToWorkers(testGroups);
      if (dispatchResult === 'signal') {
        result.status = 'interrupted';
      } else {
        const failed = dispatchResult === 'workererror' || rootSuite.allTests().some(test => !test.ok());
        result.status = failed ? 'failed' : 'passed';
      }
    } catch (e) {
      var _this$_reporter$onErr3, _this$_reporter7;
      (_this$_reporter$onErr3 = (_this$_reporter7 = this._reporter).onError) === null || _this$_reporter$onErr3 === void 0 ? void 0 : _this$_reporter$onErr3.call(_this$_reporter7, (0, _util2.serializeError)(e));
      return {
        status: 'failed'
      };
    } finally {
      await (globalTearDown === null || globalTearDown === void 0 ? void 0 : globalTearDown());
    }
    return result;
  }
  async _dispatchToWorkers(stageGroups) {
    const dispatcher = new _dispatcher.Dispatcher(this._configLoader, [...stageGroups], this._reporter);
    const sigintWatcher = new _sigIntWatcher.SigIntWatcher();
    await Promise.race([dispatcher.run(), sigintWatcher.promise()]);
    if (!sigintWatcher.hadSignal()) {
      // We know for sure there was no Ctrl+C, so we remove custom SIGINT handler
      // as soon as we can.
      sigintWatcher.disarm();
    }
    await dispatcher.stop();
    if (sigintWatcher.hadSignal()) return 'signal';
    if (dispatcher.hasWorkerErrors()) return 'workererror';
    return 'success';
  }
  async _removeOutputDirs(options) {
    const config = this._configLoader.fullConfig();
    const outputDirs = new Set();
    for (const p of config.projects) {
      if (!options.projectFilter || options.projectFilter.includes(p.name)) outputDirs.add(p.outputDir);
    }
    try {
      await Promise.all(Array.from(outputDirs).map(outputDir => removeFolderAsync(outputDir).catch(async error => {
        if (error.code === 'EBUSY') {
          // We failed to remove folder, might be due to the whole folder being mounted inside a container:
          //   https://github.com/microsoft/playwright/issues/12106
          // Do a best-effort to remove all files inside of it instead.
          const entries = await readDirAsync(outputDir).catch(e => []);
          await Promise.all(entries.map(entry => removeFolderAsync(path.join(outputDir, entry))));
        } else {
          throw error;
        }
      })));
    } catch (e) {
      var _this$_reporter$onErr4, _this$_reporter8;
      (_this$_reporter$onErr4 = (_this$_reporter8 = this._reporter).onError) === null || _this$_reporter$onErr4 === void 0 ? void 0 : _this$_reporter$onErr4.call(_this$_reporter8, (0, _util2.serializeError)(e));
      return false;
    }
    return true;
  }
  async _performGlobalSetup(config, rootSuite, result) {
    let globalSetupResult = undefined;
    const pluginsThatWereSetUp = [];
    const sigintWatcher = new _sigIntWatcher.SigIntWatcher();
    const tearDown = async () => {
      await this._runAndReportError(async () => {
        if (globalSetupResult && typeof globalSetupResult === 'function') await globalSetupResult(this._configLoader.fullConfig());
      }, result);
      await this._runAndReportError(async () => {
        if (globalSetupResult && config.globalTeardown) await (await this._configLoader.loadGlobalHook(config.globalTeardown))(this._configLoader.fullConfig());
      }, result);
      for (const plugin of pluginsThatWereSetUp.reverse()) {
        await this._runAndReportError(async () => {
          var _plugin$teardown;
          await ((_plugin$teardown = plugin.teardown) === null || _plugin$teardown === void 0 ? void 0 : _plugin$teardown.call(plugin));
        }, result);
      }
    };

    // Legacy webServer support.
    this._plugins.push(...(0, _webServerPlugin.webServerPluginsForConfig)(config));

    // Docker support.
    this._plugins.push(_dockerPlugin.dockerPlugin);
    await this._runAndReportError(async () => {
      // First run the plugins, if plugin is a web server we want it to run before the
      // config's global setup.
      for (const plugin of this._plugins) {
        var _plugin$setup;
        await Promise.race([(_plugin$setup = plugin.setup) === null || _plugin$setup === void 0 ? void 0 : _plugin$setup.call(plugin, config, config._configDir, rootSuite, this._reporter), sigintWatcher.promise()]);
        if (sigintWatcher.hadSignal()) break;
        pluginsThatWereSetUp.push(plugin);
      }

      // Then do global setup.
      if (!sigintWatcher.hadSignal()) {
        if (config.globalSetup) {
          const hook = await this._configLoader.loadGlobalHook(config.globalSetup);
          await Promise.race([Promise.resolve().then(() => hook(this._configLoader.fullConfig())).then(r => globalSetupResult = r || '<noop>'), sigintWatcher.promise()]);
        } else {
          // Make sure we run the teardown.
          globalSetupResult = '<noop>';
        }
      }
    }, result);
    sigintWatcher.disarm();
    if (result.status !== 'passed' || sigintWatcher.hadSignal()) {
      await tearDown();
      result.status = sigintWatcher.hadSignal() ? 'interrupted' : 'failed';
      return;
    }
    return tearDown;
  }
  async _runAndReportError(callback, result) {
    try {
      await callback();
    } catch (e) {
      var _this$_reporter$onErr5, _this$_reporter9;
      result.status = 'failed';
      (_this$_reporter$onErr5 = (_this$_reporter9 = this._reporter).onError) === null || _this$_reporter$onErr5 === void 0 ? void 0 : _this$_reporter$onErr5.call(_this$_reporter9, (0, _util2.serializeError)(e));
    }
  }
}
exports.Runner = Runner;
function createFileMatcherFromFilter(filter) {
  const fileMatcher = (0, _util2.createFileMatcher)(filter.re || filter.exact || '');
  return (testFileName, testLine, testColumn) => fileMatcher(testFileName) && (filter.line === testLine || filter.line === null) && (filter.column === testColumn || filter.column === null);
}
function filterByFocusedLine(suite, focusedTestFileLines) {
  if (!focusedTestFileLines.length) return;
  const matchers = focusedTestFileLines.map(createFileMatcherFromFilter);
  const testFileLineMatches = (testFileName, testLine, testColumn) => matchers.some(m => m(testFileName, testLine, testColumn));
  const suiteFilter = suite => !!suite.location && testFileLineMatches(suite.location.file, suite.location.line, suite.location.column);
  const testFilter = test => testFileLineMatches(test.location.file, test.location.line, test.location.column);
  return (0, _suiteUtils.filterSuite)(suite, suiteFilter, testFilter);
}
async function collectFiles(testDir, respectGitIgnore) {
  if (!fs.existsSync(testDir)) return [];
  if (!fs.statSync(testDir).isDirectory()) return [];
  const checkIgnores = (entryPath, rules, isDirectory, parentStatus) => {
    let status = parentStatus;
    for (const rule of rules) {
      const ruleIncludes = rule.negate;
      if (status === 'included' === ruleIncludes) continue;
      const relative = path.relative(rule.dir, entryPath);
      if (rule.match('/' + relative) || rule.match(relative)) {
        // Matches "/dir/file" or "dir/file"
        status = ruleIncludes ? 'included' : 'ignored';
      } else if (isDirectory && (rule.match('/' + relative + '/') || rule.match(relative + '/'))) {
        // Matches "/dir/subdir/" or "dir/subdir/" for directories.
        status = ruleIncludes ? 'included' : 'ignored';
      } else if (isDirectory && ruleIncludes && (rule.match('/' + relative, true) || rule.match(relative, true))) {
        // Matches "/dir/donotskip/" when "/dir" is excluded, but "!/dir/donotskip/file" is included.
        status = 'ignored-but-recurse';
      }
    }
    return status;
  };
  const files = [];
  const visit = async (dir, rules, status) => {
    const entries = await readDirAsync(dir, {
      withFileTypes: true
    });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    if (respectGitIgnore) {
      const gitignore = entries.find(e => e.isFile() && e.name === '.gitignore');
      if (gitignore) {
        const content = await readFileAsync(path.join(dir, gitignore.name), 'utf8');
        const newRules = content.split(/\r?\n/).map(s => {
          s = s.trim();
          if (!s) return;
          // Use flipNegate, because we handle negation ourselves.
          const rule = new _utilsBundle.minimatch.Minimatch(s, {
            matchBase: true,
            dot: true,
            flipNegate: true
          });
          if (rule.comment) return;
          rule.dir = dir;
          return rule;
        }).filter(rule => !!rule);
        rules = [...rules, ...newRules];
      }
    }
    for (const entry of entries) {
      if (entry.name === '.' || entry.name === '..') continue;
      if (entry.isFile() && entry.name === '.gitignore') continue;
      if (entry.isDirectory() && entry.name === 'node_modules') continue;
      const entryPath = path.join(dir, entry.name);
      const entryStatus = checkIgnores(entryPath, rules, entry.isDirectory(), status);
      if (entry.isDirectory() && entryStatus !== 'ignored') await visit(entryPath, rules, entryStatus);else if (entry.isFile() && entryStatus === 'included') files.push(entryPath);
    }
  };
  await visit(testDir, [], 'included');
  return files;
}
function buildItemLocation(rootDir, testOrSuite) {
  if (!testOrSuite.location) return '';
  return `${path.relative(rootDir, testOrSuite.location.file)}:${testOrSuite.location.line}`;
}
function createTestGroups(projectSuites, workers) {
  // This function groups tests that can be run together.
  // Tests cannot be run together when:
  // - They belong to different projects - requires different workers.
  // - They have a different repeatEachIndex - requires different workers.
  // - They have a different set of worker fixtures in the pool - requires different workers.
  // - They have a different requireFile - reuses the worker, but runs each requireFile separately.
  // - They belong to a parallel suite.

  // Using the map "workerHash -> requireFile -> group" makes us preserve the natural order
  // of worker hashes and require files for the simple cases.
  const groups = new Map();
  const createGroup = test => {
    return {
      workerHash: test._workerHash,
      requireFile: test._requireFile,
      repeatEachIndex: test.repeatEachIndex,
      projectId: test._projectId,
      tests: []
    };
  };
  for (const projectSuite of projectSuites) {
    for (const test of projectSuite.allTests()) {
      let withWorkerHash = groups.get(test._workerHash);
      if (!withWorkerHash) {
        withWorkerHash = new Map();
        groups.set(test._workerHash, withWorkerHash);
      }
      let withRequireFile = withWorkerHash.get(test._requireFile);
      if (!withRequireFile) {
        withRequireFile = {
          general: createGroup(test),
          parallel: new Map(),
          parallelWithHooks: createGroup(test)
        };
        withWorkerHash.set(test._requireFile, withRequireFile);
      }

      // Note that a parallel suite cannot be inside a serial suite. This is enforced in TestType.
      let insideParallel = false;
      let outerMostSerialSuite;
      let hasAllHooks = false;
      for (let parent = test.parent; parent; parent = parent.parent) {
        if (parent._parallelMode === 'serial') outerMostSerialSuite = parent;
        insideParallel = insideParallel || parent._parallelMode === 'parallel';
        hasAllHooks = hasAllHooks || parent._hooks.some(hook => hook.type === 'beforeAll' || hook.type === 'afterAll');
      }
      if (insideParallel) {
        if (hasAllHooks && !outerMostSerialSuite) {
          withRequireFile.parallelWithHooks.tests.push(test);
        } else {
          const key = outerMostSerialSuite || test;
          let group = withRequireFile.parallel.get(key);
          if (!group) {
            group = createGroup(test);
            withRequireFile.parallel.set(key, group);
          }
          group.tests.push(test);
        }
      } else {
        withRequireFile.general.tests.push(test);
      }
    }
  }
  const result = [];
  for (const withWorkerHash of groups.values()) {
    for (const withRequireFile of withWorkerHash.values()) {
      // Tests without parallel mode should run serially as a single group.
      if (withRequireFile.general.tests.length) result.push(withRequireFile.general);

      // Parallel test groups without beforeAll/afterAll can be run independently.
      result.push(...withRequireFile.parallel.values());

      // Tests with beforeAll/afterAll should try to share workers as much as possible.
      const parallelWithHooksGroupSize = Math.ceil(withRequireFile.parallelWithHooks.tests.length / workers);
      let lastGroup;
      for (const test of withRequireFile.parallelWithHooks.tests) {
        if (!lastGroup || lastGroup.tests.length >= parallelWithHooksGroupSize) {
          lastGroup = createGroup(test);
          result.push(lastGroup);
        }
        lastGroup.tests.push(test);
      }
    }
  }
  return result;
}
class ListModeReporter {
  constructor() {
    this.config = void 0;
  }
  onBegin(config, suite) {
    this.config = config;
    // eslint-disable-next-line no-console
    console.log(`Listing tests:`);
    const tests = suite.allTests();
    const files = new Set();
    for (const test of tests) {
      // root, project, file, ...describes, test
      const [, projectName,, ...titles] = test.titlePath();
      const location = `${path.relative(config.rootDir, test.location.file)}:${test.location.line}:${test.location.column}`;
      const projectTitle = projectName ? `[${projectName}] › ` : '';
      // eslint-disable-next-line no-console
      console.log(`  ${projectTitle}${location} › ${titles.join(' ')}`);
      files.add(test.location.file);
    }
    // eslint-disable-next-line no-console
    console.log(`Total: ${tests.length} ${tests.length === 1 ? 'test' : 'tests'} in ${files.size} ${files.size === 1 ? 'file' : 'files'}`);
  }
  onError(error) {
    // eslint-disable-next-line no-console
    console.error('\n' + (0, _base.formatError)(this.config, error, false).message);
  }
}
function createForbidOnlyErrors(config, onlyTestsAndSuites) {
  const errors = [];
  for (const testOrSuite of onlyTestsAndSuites) {
    // Skip root and file.
    const title = testOrSuite.titlePath().slice(2).join(' ');
    const error = {
      message: `Error: focused item found in the --forbid-only mode: "${title}"`,
      location: testOrSuite.location
    };
    errors.push(error);
  }
  return errors;
}
function createDuplicateTitlesErrors(config, rootSuite) {
  const errors = [];
  for (const fileSuite of rootSuite.suites) {
    const testsByFullTitle = new Map();
    for (const test of fileSuite.allTests()) {
      const fullTitle = test.titlePath().slice(2).join(' › ');
      const existingTest = testsByFullTitle.get(fullTitle);
      if (existingTest) {
        const error = {
          message: `Error: duplicate test title "${fullTitle}", first declared in ${buildItemLocation(config.rootDir, existingTest)}`,
          location: test.location
        };
        errors.push(error);
      }
      testsByFullTitle.set(fullTitle, test);
    }
  }
  return errors;
}
function createNoTestsError() {
  return createStacklessError(`=================\n no tests found.\n=================`);
}
function createStacklessError(message, location) {
  return {
    message,
    location
  };
}
function sanitizeConfigForJSON(object, visited) {
  const type = typeof object;
  if (type === 'function' || type === 'symbol') return undefined;
  if (!object || type !== 'object') return object;
  if (object instanceof RegExp) return String(object);
  if (object instanceof Date) return object.toISOString();
  if (visited.has(object)) return undefined;
  visited.add(object);
  if (Array.isArray(object)) return object.map(a => sanitizeConfigForJSON(a, visited));
  const result = {};
  const keys = Object.keys(object).slice(0, 100);
  for (const key of keys) {
    if (key.startsWith('_')) continue;
    result[key] = sanitizeConfigForJSON(object[key], visited);
  }
  return result;
}
const builtInReporters = ['list', 'line', 'dot', 'json', 'junit', 'null', 'github', 'html'];
exports.builtInReporters = builtInReporters;