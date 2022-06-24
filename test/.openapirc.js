const { join } = require("path");

module.exports = [
  {
    requestLibPath: `import { request } from 'xxxx';`,
    schemaPath:
      "https://apihub.dev.inrobot.cloud/swaggerui/config/smzx.swagger.json",
    namespace: "swaggerAPI1",
    projectName: "swagger1",
  },
  {
    requestLibPath: `import { request } from 'xxxx';`,
    schemaPath: join(__dirname, "./api/swagger2.json"),
    namespace: "swaggerAPI2",
    projectName: "swagger2",
  },
];
