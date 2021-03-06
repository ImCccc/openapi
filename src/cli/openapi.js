const joi = require("joi");
const join = require("path").join;
const fs = require("fs");
const { existsSync, mkdirSync } = fs;
const cwd = process.cwd();
const generateService = require("../index.js");

const getSchema = async function (openAPIConfig) {
  const itemSchema = joi.object({
    requestLibPath: joi.string(),
    schemaPath: joi.string(),
    mock: joi.boolean(),
    proto: joi.boolean(),
    projectName: joi.string(),
    apiPrefix: joi.alternatives(joi.string(), joi.function()),
    namespace: joi.string(),
    hook: joi.object({
      customFunctionName: joi.function(),
      customClassName: joi.function(),
    }),
    gitlab: joi.object({
      projectId: joi.string(),
      branch: joi.string(),
    }),
    axios: joi.boolean(),
  });
  return await joi
    .alternatives(joi.array().items(itemSchema), itemSchema)
    .validateAsync(openAPIConfig);
};

const genAllFiles = async (openAPIConfig) => {
  const pageConfig = require(join(cwd, "package.json"));

  const mockFolder = openAPIConfig.mock ? join(cwd, "mock") : undefined;

  const serversFolder =
    openAPIConfig.serversPath || join(cwd, "src", "services");

  if (mockFolder && !existsSync(mockFolder)) {
    mkdirSync(mockFolder);
  }

  if (serversFolder && !existsSync(serversFolder)) {
    mkdirSync(serversFolder);
  }

  await generateService({
    projectName: pageConfig.name.split("/").pop(),
    serversPath: serversFolder,
    ...openAPIConfig,
    schemaPath: openAPIConfig.schemaPath,
    mockFolder,
  });
  console.info("[openAPI]: execution complete");
};

module.exports = {
  getSchema,
  genAllFiles,
};
