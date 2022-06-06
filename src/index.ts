import type { OperationObject } from "openapi3-ts";
// @ts-ignore
import converter from "swagger2openapi";

import { ServiceGenerator } from "./serviceGenerator";
import { getAbsolutePath } from "./util";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export type GenerateServiceProps = {
  /** 自定义请求方法路径 */
  requestLibPath?: string;
  /** 自定义请求方法表达式 */
  requestImportStatement?: string;
  /** api 的前缀 */
  apiPrefix?:
    | string
    | ((params: {
        path: string;
        method: string;
        namespace: string;
        functionName: string;
        autoExclude?: boolean;
      }) => string);
  /** 生成的文件夹的路径 */
  serversPath?: string;
  /** openAPI 3.0 的地址 */
  schemaPath?: string;
  /** 项目名称 */
  projectName?: string;
  hook?: {
    /** 自定义函数名称 */
    customFunctionName?: (data: OperationObject) => string;
    /** 自定义类名 */
    customClassName?: (tagName: string) => string;
  };
  /** 命名空间名称 */
  namespace?: string;
  /** mock目录 */
  mockFolder?: string;
  /** 是否生成 mock */
  mock?: boolean;
  /** 是否使用 axios 的调用方式 */
  axios?: boolean;
};

// 从 appName 生成 service 数据
export const generateService = async ({
  requestLibPath,
  schemaPath,
  mockFolder,
  ...rest
}: GenerateServiceProps) => {
  const schema = require(getAbsolutePath(schemaPath!));
  converter.convertObj(schema, {}, (err: any, options: any) => {
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
