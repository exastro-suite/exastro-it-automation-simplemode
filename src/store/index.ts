import { defineStore } from "pinia";

export const useStore = defineStore("main", {
  state: () => {
    return {
      token: "",
      refreshToken: "",
      workspace: "",
      organization: "",
      restName: "",
      groupName: "",
      conductor: "",
      conductorId: "",
      movement:[] as any[],
      loggedMovement:[] as any[],
      host:[] as any[],
      loggedHost:[] as any[],
      relationshipsData:[] as any[],
      loginOperation: "",
      loginOperationId: "",
      operationSelect: "",
      comparJob: [] as any[],
      loggedComparJob: [] as any[],
      comparHost: [] as any[],
      loggedComparHost: [] as any[],
      loggedOperationDataSetInfos: [] as any[],
      welcomeDialogShow: false as boolean,
      logOperationScheduledDate:""
      };
  },
  getters: {
    getToken(state): string {
      return state.token || "";
    },
    getRefreshToken(state): string {
      return state.refreshToken || "";
    },
    getWorkspace(state): string {
      return state.workspace || "";
    },
    getOrganization(state): string {
      return state.organization || "";
    },
    getRestName(state): string {
      return state.restName || "";
    },
    getGroupName(state): string {
      return state.groupName || "";
    },
    getConductor(state): string {
      return state.conductor || "";
    },
    getConductorId(state): string {
      return state.conductorId || "";
    },
    
    getLoginOperation(state): string {
      return state.loginOperation || "";
    },
    getLogOperationScheduledDate(state): string {
      return state.logOperationScheduledDate || ""
    },
    getLoginOperationId(state): string {
      return state.loginOperationId || "";
    },
    getOperationSelect(state): string {
      return state.operationSelect || "";
    },
    getMovement(state): Array<any> {
      return state.movement || [];
    },
    getLoggedMovement(state): Array<any> {
      return state.loggedMovement || [];
    },
    getHost(state): Array<any> {
      return state.host || [];
    },
    getLoggedHost(state): Array<any> {
      return state.loggedHost || [];
    },
    getRelationshipsData(state): Array<any> {
      return state.relationshipsData || [];
    },
    getComparJob(state): Array<any> {
      return state.comparJob || [];
    },
    getLoggedComparJob(state): Array<any> {
      return state.loggedComparJob || [];
    },
    getComparHost(state): Array<any> {
      return state.comparHost || [];
    },
    getLoggedComparHost(state): Array<any> {
      return state.loggedComparHost || [];
    },
    getLoggedOperationDataSetInfos(state):  Array<any> {
      return state.loggedOperationDataSetInfos || [];
    },
    getWelcomeDialogShow(state): boolean {
      return state.welcomeDialogShow || false;
    }
    
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ? info : ""; 
    },
    setRefreshToken(info: string | undefined) {
      this.refreshToken = info ? info : ""; 
    },
    setWorkspace(info: string | undefined) {
      this.workspace = info ? info : ""; 
    },
    setOrganization(info: string | undefined) {
      this.organization = info ? info : ""; 
    },
    setRestName(info: string | undefined) {
      this.restName = info ? info : ""; 
    },
    setGroupName(info: string | undefined) {
      this.groupName = info ? info : ""; 
    },
 
    setConductor(info: string | undefined) {
      this.conductor = info ? info : ""; 
    },
    setConductorId(info: string | undefined) {
      this.conductorId = info ? info : ""; 
    },
    setLoginOperation(info: string | undefined) {
      this.loginOperation = info ? info : ""; 
    },
    setLogOperationScheduledDate(info: string | undefined) {
      this.logOperationScheduledDate = info ? info : "";
    },
    setLoginOperationId(info: string | undefined) {
      this.loginOperationId = info ? info : ""; 
    },
    setOperationSelect(info: string | undefined) {
      this.operationSelect = info ? info : ""; 
    },
    setMovement(info: Array<any> | undefined) {
      this.movement = info ? info : []; 
    },
    setLoggedMovement(info: Array<any> | undefined) {
      this.loggedMovement = info ? info : []; 
    },
    setHost(info: Array<any> | undefined) {
      this.host = info ? info : []; 
    },
    setLoggedHost(info: Array<any> | undefined) {
      this.loggedHost = info ? info : []; 
    },
    setRelationshipsData(info: Array<any> | undefined) {
      this.relationshipsData = info ? info : []; 
    },
    setComparJob(info: Array<any> | undefined) {
      this.comparJob = info ? info : [];
    },
    setLoggedComparJob(info: Array<any> | undefined) {
      this.loggedComparJob = info ? info : [];
    },
    setComparHost(info: Array<any> | undefined) {
      this.comparHost = info ? info : [];
    },
    setLoggedComparHost(info: Array<any> | undefined) {
      this.loggedComparHost = info ? info : [];
    },
    setLoggedOperationDataSetInfos(info: Array<any> | undefined) {
      this.loggedOperationDataSetInfos = info ? info : [];
    },
    setWelcomeDialogShow(info: boolean | undefined) {
      this.welcomeDialogShow = info ? info : false 
    },
  },
});
