import { join } from "path";

export default [
  {
    requestLibPath: `import { request } from 'xxxx';`,
    schemaPath: join(__dirname, "./api/swagger1.json"),
    mock: false,
    namespace: "swaggerAPI1",
    projectName: "swagger1",
  },
  {
    requestLibPath: `import { request } from 'xxxx';`,
    schemaPath: join(__dirname, "./api/swagger2.json"),
    mock: false,
    namespace: "swaggerAPI2",
    projectName: "swagger2",
  },
];
