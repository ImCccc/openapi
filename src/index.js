const converter = require("swagger2openapi");
const { ServiceGenerator } = require("./serviceGenerator");
const { getAbsolutePath } = require("./util");
const axios = require("axios");
const { Promise } = require("node-fetch");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const fixSwaggerJson = (json) => {
  // 1. 增加协议类型
  json.schemes = ["http", "https"];

  // 2. 对各个路由的response的default做处理
  if (!json.paths) return json;

  Object.values(json.paths).forEach((item) => {
    if (item?.post?.responses) {
      delete item.post.responses.default;
    }

    const result = item?.post?.responses?.["200"]?.schema?.properties?.result;

    if (result) {
      item.post.responses["200"].schema = result;
    }

    const needFixStreamDef =
      (item?.post?.responses?.["200"]?.schema?.$ref || "").startsWith(
        "#/x-stream-definitions/"
      ) && !!json["x-stream-definitions"];

    if (needFixStreamDef) {
      const node = item.post.responses["200"].schema.$ref.split(
        "#/x-stream-definitions/"
      )[1];
      item.post.responses["200"].schema =
        json["x-stream-definitions"][node].properties.result;
    }
  });

  // 3. 取得definition
  if (!json.definitions) return json;

  // 4. 去掉runtimeError，protobufAny，runtimeStreamError, x-stream-definitions
  delete json.definitions.runtimeError;
  delete json.definitions.protobufAny;
  delete json.definitions.runtimeStreamError;
  delete json["x-stream-definitions"];

  // 5. 给各个结构加上require
  Object.values(json.definitions).forEach((item) => {
    if (!item.properties) {
      // 空结构需要加上这些，不然前端生成的代码，发请求，过网关的时候反序列化会出错
      item.properties = {};
      item.required = true;
    } else {
      item.required = Object.keys(item.properties);
    }
  });

  return json;
};

const getSchemaByPath = async (path) => {
  const isHttp = path.startsWith("https") || path.startsWith("http");

  if (!isHttp) {
    return require(getAbsolutePath(path));
  }

  return new Promise((resolve, reject) => {
    console.log(["💺 请求服务器.........."]);
    axios
      .get(path)
      .then((rs) => {
        if (rs.status === 200) {
          console.log(["💺 请求服务器 success"]);
          return resolve(rs.data);
        }
        reject(false);
      })
      .catch(() => reject(false));
  });
};

// 从 appName 生成 service 数据
module.exports = async ({
  requestLibPath,
  schemaPath,
  mockFolder,
  ...rest
}) => {
  const schemaData = await getSchemaByPath(schemaPath);
  const schema = fixSwaggerJson(schemaData);

  converter.convertObj(schema, {}, (err, options) => {
    console.log(["💺 将 Swagger 转化为 openAPI"]);
    if (err) return console.log("converter.convertObj 转化失败:", err);
    const openAPI = options.openapi;
    const requestImportStatement = requestLibPath;
    const serviceGenerator = new ServiceGenerator(
      {
        namespace: "API",
        requestImportStatement,
        ...rest,
      },
      openAPI
    );
    serviceGenerator.genFile();
  });
};
