import service from "../utils/request.ts";

enum Api {
  Api = "/api/",
}

/**
 * @description: compar用Jobsを取得
 */
export function comparJobs() {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
  };
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/compare_execute/compare/execute/filter/compare_list/",

    method: "POST",
    data
  });
}

/**
 * @description: compar用Host情報を取得
 */
export function comparDevicelist() {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
  };
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/compare_execute/compare/execute/filter/device_list/",
    method: "POST",
    data
  });
}

/**
 * @description: compar用Host情報を取得
 */
export function comparFileDownload(data: any,) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/compare_execute/compare/execute/output/",
    method: "POST",
    data
  });
}

/**
 * @description: getOperations
 * 基本コンソール     
 * オペレーション一覧
 */
export function operationList() {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
  };
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu" +
      "/operation_list/filter/",
    method: "POST",
    data,
  });
}

/**
 * @description:比較用情報を取得
 */
export function getCompareInfos(data: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/compare_execute/compare/execute/",
    method: "POST",
    data
  });
}

/**
 * @description:比較の結果を取得
 */
export function getCompareResults(data: any,str_url:string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:str_url,
    method: "POST",
    data
  });
}

/**
 * 入力用DefOperationDataSetの情報を取得
 * @param data
 * @returns OperationDataSetの情報
 */
export function getDefOperationDataSetInfos(data:any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      '/ita/menu/OperationDataSet/filter/',
    method: "POST",
    data,
  });
}

export function operationListForFlag(operation_ids: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
    operation_id:{
      LIST : operation_ids
    }
  };
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu" +
      "/operation_list/filter/",
    method: "POST",
    data,
  });
}