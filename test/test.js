const path = require("path");
const openAPI = require("../lib/index");
const { join } = path;
const gen = async () => {
  await openAPI.generateService({
    serversPath: "",
    requestLibPath: `import { request } from 'xxxx';`,
    schemaPath: join(__dirname, "./api/platform.swagger.json"),
    mock: false,
    projectName: "platform",
  });
};
gen();
