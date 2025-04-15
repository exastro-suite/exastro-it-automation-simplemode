import service from "../utils/request.ts";

enum Api {
  Api = "/api/",
}

/**
 * @description: get radios Info
 */
export function getradiosInfo() {
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
      "/conductor_class_list/filter/",
    method: "POST",
    data,
  });
}
export function designateConductor(id:any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
    conductor_class_id: {
      NORMAL: id,
    }
  };
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu" +
      "/conductor_class_list/filter/",
    method: "POST",
    data,
  });
}
/**
 * @description: movementInfo
 */
export function movementInfo(id: string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "conductor_class_edit/conductor/class/" +
      id +
      "/",
    method: "GET",
  });
}
/**
 * @description: 代入値自動登録設定
 */
export function menuItem(data: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "subst_value_auto_reg_setting_ansible_role/filter/",
    method: "POST",
    data,
  });
}
/**
 * @description: Replication relationships
 */
export function relationships() {
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
      "/ita/menu/" +
      "MovementDataSet/filter/",
    method: "POST",
    data,
  });
}
/**
 * @description: restNameApi
 * 
パラメータシート作成
パラメータシート定義一覧
 */
export function restNameApi(data: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "menu_definition_list/filter/",
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
 * @description: optionLogin
 */
export function optionLogin(data: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      '/ita/menu/operation_list/maintenance/',
    method: "POST",
    data,
  });
}

/**
 * @description: exportExcelAPI
 */
export function exportExcelAPI(data: any,menu:string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      '/ita/menu/'+ menu + '/excel/',
    method: "POST",
    data,
  });
}
/**
 * @description: execute
 */
export function execute(data: any,) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      '/ita/menu/conductor_class_edit/conductor/execute/',
    method: "POST",
    data,
  });
}
/**
 * @description: get ce sheet columns
 */
export function sheetColumnList(restName:string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +restName+
      "/info/",
    method: "GET",    
  });
}
/**
 * @description: get ce sheet columns pullDown
 */
export function sheetpullDown(restName:string) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +restName+
      "/info/pulldown/",
    method: "GET",    
  });
}

/**
 * 入力用OperationDataSetの情報を取得
 * @param operation_id OperationのId
 * @returns OperationDataSetの情報
 */
export function getOperationDataSetInfos(operation_id : String) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: "0",
    },
    "Operation": {
      "NORMAL": operation_id
    }
  };
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

/**
 * 入力用OperationDataSetの情報の登録/更新
 * @param data OperationDataの情報
 * @returns message: "SUCCESS"
 */
export function setOperationDataSetInfos(data: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      '/ita/menu/OperationDataSet/maintenance/all/',
    method: "POST",
    data,
  });
}

/**
 * 入力用DefOperationDataSetの情報を取得
 * @param data Flag==1
 * @returns OperationDataSetの情報
 */
export function getOperationDataSetInfosByFlag(Flag:any = 1) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  
  const data = {
    discard: {
      NORMAL: "0",
    },
    "Flag": {
      "NORMAL": Flag
    }
  };
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

export function getDefOperationInfos(data: any) {
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
