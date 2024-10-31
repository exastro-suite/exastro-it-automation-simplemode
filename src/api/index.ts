import service from "../utils/request.ts";
// import { useStore } from "../store/index";

enum Api {
  Login = "/auth/realms/",
  Api = "/api/",  
}

/**
 * @description: loginApi
 */
export function loginApi(data: unknown) {
  
  const organizationId = localStorage.getItem('organization');;
  
  return service({
    url: Api.Login + organizationId + "/protocol/openid-connect/token",
    method: "POST",
    data,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}
/**
 * @description: menuApi   機器一覧:20101
 */
export function menuApi() {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/user/menus/",
    method: "GET",
  });
}
/**
 * @description: userApi   
 */
export function userApi() {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/user/",
    method: "GET",
  });
}
/**
 * @description: 'column'
 */

export function deviceListColumn(restName:string) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/info/column',
    method: "GET",
  });
}
/**
 * @description: 'deviceList'
 */

export function deviceList(restName:string,str?:string) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  const data = {
    discard: {
      NORMAL: '0',
    },
    managed_system_item_number: { NORMAL: str },
  };
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/filter',
    method: "POST",
    data
  });
}
/**
 * @description: 'pulldown'
 */

export function pulldownApi(restName:string) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/info/pulldown/',
    method: "GET",
  });
}

/**
 * @description: 'registerApi'
 */

export function registerApi(restName:string,data: any) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/maintenance/',
    method: "POST",
    data
  });
}
/**
 * @description: 'updateApi'
 */

export function updateApi(restName:string,data: any,uuid:string) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/maintenance/'+uuid,
    method: "patch",
    data
  });
}
/**
 * @description: 'exportApi'
 */

export function exportApi(restName:string) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  let data={
    discard: {
      NORMAL: '0',
    },
  }
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/excel/',
    method: "POST",
    data
  });
}
/**
 * @description: 'importApi'
 */

export function importApi(restName:string,str:string) {
  const orgId = localStorage.getItem("organization");
const workspaceId = localStorage.getItem("workspace");
  let data={
    excel:str
  }
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + "/ita/menu/"+restName+ '/excel/maintenance/',
    method: "POST",
    data
  });
}
/**
 * @description: 'verification'
 * Conductor作業一覧 filter
 */

export function verification(data:any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");
  
  return service({
    url: Api.Api + orgId + "/workspaces/" + workspaceId + '/ita/menu/conductor_list/filter/',
    method: "POST",
    data
  });
}
