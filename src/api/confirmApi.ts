
import service from "../utils/request.ts";

enum Api {
  Api = "/api/",
}

/**
 * @description: downLoadInputData
 */
export function inputData(id: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "conductor_list/conductor/"+id+"/input_data/",
    method: "GET",
   
  });
}
/**
 * @description: downLoadInputData
 */
export function resultData(id: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "conductor_list/conductor/"+id+"/result_data/",
    method: "GET",
   
  });
}
/**
 * @description: getConductorConfirmation
 */
export function conductorConfirmationInfo(id: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "conductor_confirmation/conductor/info/"+id+"/",
    method: "GET",
   
  });
}
/**
 * @description: getConductorConfirmation
 */
export function conductorConfirmation(id: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "conductor_confirmation/conductor/"+id+"/",
    method: "GET",
   
  });
}
/**
 * @description: getExec_log
 */
export function getLog(id: any) {
  const orgId = localStorage.getItem("organization");
  const workspaceId = localStorage.getItem("workspace");

  return service({
    url:
      Api.Api +
      orgId +
      "/workspaces/" +
      workspaceId +
      "/ita/menu/" +
      "check_operation_status_ansible_role/driver/"+id+"/",
    method: "GET",
   
  });
}


