#!/usr/bin/env node
const existsSync = require("fs").existsSync;
const join = require("path").join;
const openapi = require("./openapi.js");
const { genAllFiles, getSchema } = openapi;

const DEFAULT_CONFIG_FILES = [".openapirc.js"];

function getConfigFile(opts) {
  const configFile = DEFAULT_CONFIG_FILES.filter((file) => {
    return existsSync(join(opts.cwd, file));
  })[0];
  return configFile ? join(opts.cwd, configFile) : null;
}

(async function () {
  const cwd = process.cwd();

  //  configFile: xxx\test\.openapirc.ts
  const configFile = getConfigFile({ cwd });

  if (!configFile) {
    return console.log("请正确配置文件文件后重新执行");
  }

  const config = require(configFile);
  const openAPI = config.default || config;
  const openAPIConfig = await getSchema(openAPI);

  if (Array.isArray(openAPIConfig)) {
    openAPIConfig.map((item) => genAllFiles(item));
    return;
  }
  genAllFiles(openAPIConfig);
})();
