import service from "../utils/request.ts";

enum Api {
  Api = "/api/",
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

export function getDefOperationInfos(data:any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  
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

export function getMenudefinitionlist() {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
    menu_group_for_input:{
      LIST:["入力用/収集"],
    }
  };
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu" +
      "/menu_definition_list/filter/",
    method: "POST",
    data,
  });
}

/**
 * @description: optionAllRegister
 */
export function optionAllRegister(data: any, menu: string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" 
      + menu + '/maintenance/all/',
    method: "POST",
    data,
  });
}

/**
 * @description: /filter/count/
 */
export function getOperationCount(data: any, name: string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      name +
      "/filter/count/",
    method: "POST",
    data,
  });
}

/**
 * @description: optionName
 */
export function optionName(data: any, name: string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      name +
      "/filter/",
    method: "POST",
    data,
  });
}