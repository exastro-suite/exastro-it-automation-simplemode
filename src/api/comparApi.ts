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