import service from "../utils/request.ts";

enum Api {
  Api = "/api/",
}

/**
 * @description: getmovementInfo
 */
export function movementList(data: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu" +
      "/movement_list_ansible_role/filter/",
    method: "POST",
    data,
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

export function designateOperation(name:any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
    // operation_name:{
    //   NORMAL: name,
    // }
    operation_name:{
      LIST:[name],
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

