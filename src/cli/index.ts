#!/usr/bin/env node
import { existsSync } from "fs";
import { join } from "path";

import { genAllFiles, getSchema } from "./openapi";

const DEFAULT_CONFIG_FILES = [".openapirc.ts", ".openapirc.js"];

function getConfigFile(opts: { cwd: string }) {
  const configFile = DEFAULT_CONFIG_FILES.filter((file) => {
    return existsSync(join(opts.cwd, file));
  })[0];
  return configFile ? join(opts.cwd, configFile) : null;
}

(async function () {
  const cwd = process.cwd();

  //  configFile: C:\Users\licr1\Desktop\openapi\infore-openapi-master\test\.openapirc.ts
  const configFile = getConfigFile({ cwd });

  if (!configFile) {
    return console.log("请正确配置文件文件后重新执行");
  }

  require("@babel/register")({
    ignore: [/node_modules/],
    only: [
      function (p: string) {
        return p === configFile;
      },
    ],
    extensions: [".jsx", ".js", ".ts", ".tsx"],
    babelrc: false,
    cache: false,
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
          },
          modules: "commonjs",
        },
      ],
    ],
  });
  const config = require(configFile);
  const openAPI = config.default || config;
  const openAPIConfig = await getSchema(openAPI);
  if (Array.isArray(openAPIConfig)) {
    openAPIConfig.map((item) => genAllFiles(item));
    return;
  }
  genAllFiles(openAPIConfig);
})();
