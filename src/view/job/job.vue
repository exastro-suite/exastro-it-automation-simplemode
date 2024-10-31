<template>
  <el-steps :active="active" align-center finish-status="success">
    <el-step title="オペレーション登録">
      <template #description
        ><span v-show="active >= 1">
          <span class="desBracket">(</span>
          <el-tooltip
            class="desText"
            effect="light"
            :content="operationDesc"
            placement="bottom"
          >
            <span class="desText">{{ operationDesc }}</span>
          </el-tooltip>
          <span class="desBracket">)</span>
        </span></template
      >
    </el-step>
    <el-step title="実行ジョブ指定" />
    <el-step title="対象ホスト指定" />
    <el-step title="パラメータ登録" />
    <el-step title="ジョブ実行" />
    <el-tooltip effect="light" placement="bottom">
      <el-icon size="16" color="#002B62" style="cursor: pointer">
        <QuestionFilled />
      </el-icon>
      <template #content
        >ジョブ実行操作説明<br />
        ・ジョブ実行画面では、ウィザードに従いオペレーション／Conductor／Movement／ホストを登録または指定します。「パラメータ登録」フェーズでは、指定された条件に基づくパラメータシートのパラメータを編集・登録し、ジョブを実行します。
        <br />
        ・ジョブ実行ウィザードの実行には、Conductor、Movement、パラメータシート、Movement-パラメータシート関連付けデータシートをExastro
        IT Automationに事前に登録しておく必要があります。
      </template>
    </el-tooltip>
  </el-steps>
  <div class="contentCenterBox">
    <keep-alive>
      <OperationLogin
        v-if="active == 0"
        @changeValue="changeValue"
        @getTime2="getTime2"
        @getTime="getTime"
        :isDisabled="isDisabled"
        :successOperation="successOperation"
        @changeActiveName="changeActiveName"
        @isChangeDisabled="isChangeDisabled"
      ></OperationLogin>
    </keep-alive>

    <KeepAlive>
      <SelectConductor
        ref="firstComponent"
        v-if="active == 1"
        :activeName="activeName"
        :selectedMovement="selectedMovement"
        @changeMovement="changeMovement"
        @changeErrorHappend="changeErrorHappend"
      ></SelectConductor>
    </KeepAlive>

    <keep-alive>
      <SelectHost
        v-if="active == 2"
        @changeHost="changeHost"
        :activeName="activeName"
        @changeHostLoading="changeHostLoading"
        :deleteLoading="deleteHostLoading"
      ></SelectHost>
    </keep-alive>

    <keep-alive>
      <OperationCopy
        v-if="active == 3"
        @changeOperationLoading="changeOperationLoading"
        @changeSecond="changeSecond"
      ></OperationCopy>
    </keep-alive>

    <Execute v-if="active == 4"></Execute>
    <div v-if="active == 5" class="lastStep">
      <el-text class="mx-1" size="large" type="info">
        <p>
          新しいウィザードを開始する場合、「新しいウィザードを開始」をクリックしてください。
        </p>
        <p>実行済のオペレーションは状況確認画面でステータスを確認できます。</p>
      </el-text>
    </div>
  </div>
  <div class="steps-action">
    <div>
      <el-button
        class="backBtn cancelButton"
        v-if="active == 3 || active == 1 || active == 2 || active == 4"
        @click="cancel"
        >キャンセル</el-button
      >
    </div>
    <div>
      <el-button
        class="backBtn"
        v-if="active == 3 || active == 4"
        @click="prev"
        :disabled="nextDisabled"
        >もどる</el-button
      >
      <el-button
        class="backBtn"
        v-if="active == 2"
        @click="prev"
        :disabled="hostNextDisabled"
        >もどる</el-button
      >

      <el-button
        class="nextBtn"
        v-if="active == 1"
        @click="next"
        :loading="deleteLoading"
        :disabled="errorHappend"
        >つぎへ</el-button
      >
      <el-button
        class="nextBtn"
        v-else-if="active == 2"
        @click="next"
        :disabled="hostNextDisabled"
        >つぎへ</el-button
      >
      <el-button
        class="nextBtn"
        v-else-if="active < steps.length - 1 && active !== 4"
        @click="next"
        :loading="deleteLoading"
        :disabled="nextDisabled"
        >つぎへ</el-button
      >
      <el-button
        class="nextBtn"
        v-else-if="active == steps.length - 1"
        @click="executeOption"
        >実行</el-button
      >
      <el-button class="nextBtn" v-if="active == steps.length" @click="prev"
        >新しいウィザードを開始</el-button
      >
    </div>
  </div>
</template>

<script lang="ts">
import SelectConductor from "./selectConductor.vue";
import SelectHost from "./selectHost.vue";
import OperationLogin from "./operationLogin.vue";
import OperationCopy from "./operationCopy.vue";
import Execute from "./execute.vue";
import { QuestionFilled } from "@element-plus/icons-vue";
import { defineComponent, reactive, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { pulldownApi } from "../../api/index";
import { designateOperation } from "../../api/jobList";
import { designateConductor } from "../../api/jobApi";
import {
  ElSteps,
  ElStep,
  ElButton,
  ElMessage,
  ElText,
  ElTooltip,
  ElMessageBox,
  ElCollapse,
  ElCarouselItem,
} from "element-plus";
import { useStore } from "../../store/index";
import {
  movementInfo,
  execute,
  getradiosInfo,
  menuItem,
  restNameApi,
  optionName,
  optionAllRegister,
  getOperationCount,
  optionLogin,
  setOperationDataSetInfos,
} from "../../api/jobApi";

interface Radio {
  label: string;
  value: string;
}

export default defineComponent({
  name: "Job",
  components: {
    ElSteps,
    ElStep,
    ElButton,
    SelectConductor,
    SelectHost,
    OperationLogin,
    OperationCopy,
    Execute,
    QuestionFilled,
    ElCollapse,
    ElCarouselItem,
  },
  setup() {
    const store = useStore();
    const groupName = ref<string>("");
    const menuList = JSON.parse(localStorage.getItem("menuList") || "");
    let result = menuList.filter((el: any) => el.id == "701");
    groupName.value = result[0].menus.filter(
      (el: any) => el.id == "70101"
    )[0].menu_name_rest;
    store.setGroupName(groupName.value);
    let radios: any = reactive([]);
    const firstComponent: any = ref<InstanceType<typeof SelectConductor>>();
    const router = useRouter();
    const route = useRoute();
    const active: any = ref(0);
    let iptVal = ref("");
    let activeName = ref("1");
    let isDisabled = ref(false);
    let conductorName = ref("");
    const operationColumns = reactive([
      {
        title: "オペレーション名",
        dataIndex: "operation_name",
      },
      {
        title: "実施予定日時",
        dataIndex: "scheduled_date_for_execution",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);
    const conductorColumns = reactive([
      {
        title: "Conductor名称",
        dataIndex: "conductor_name",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);
    const columns = reactive([
      {
        title: "ホスト名",
        dataIndex: "host_name",
      },
      {
        title: "種別",
        dataIndex: "hw_device_type",
      },
      {
        title: "IPアドレス",
        dataIndex: "ip_address",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);

    let errorHappend = ref(false);
    const cancel = () => {
      ElMessageBox.confirm(
        "<p>現在のジョブ実行ウィザードを中断します。</p><p>よろしいですか？</p>",
        "中断",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
          customClass: "persdsd",
          dangerouslyUseHTMLString: true,
        }
      )
        .then(async () => {
          location.reload();
        })
        .catch(() => {});
    };

    type dataType = {
      operation_id: string;
      operation_name: string;
      remarks: string;
      scheduled_date_for_execution: string;
      last_run_date: string;
      last_update_date_time: string;
      last_updated_user: string;
    };
    const loadingShowConductor = ref(true);
    const loadingShowOperation = ref(true);
    let host: any = ref([]);
    let operations: Array<dataType> = reactive([]);
    let operationDesc: any = ref();
    let conductorInfo: Array<dataType> = reactive([]);
    function getOperations(operation: any) {
      loadingShowOperation.value = true;
      designateOperation(operation)
        .then((res: any) => {
          let data = res.data.data;
          operations.length = 0;
          data.forEach((element: any) => {
            operations.push(element.parameter);
            store.setLoginOperationId(element.parameter.operation_id)
          });
          
          loadingShowOperation.value = false;
        })
        .catch((err: any) => {
          loadingShowOperation.value = false;
          ElMessage({
            type: "error",
            message: err,
          });
        });
    }

    function getConductorInfo(conductorId: any) {
      loadingShowConductor.value = true;
      designateConductor(conductorId)
        .then((res: any) => {
          let data = res.data.data;
          conductorInfo.length = 0;
          data.forEach((element: any) => {
            conductorInfo.push(element.parameter);
          });
          loadingShowConductor.value = false;
        })
        .catch((error: any) => {
          loadingShowConductor.value = false;
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }

    watch(active, (val: any, old) => {
      if (val == 1) {
        let operation = store.getLoginOperation;
        operationDesc.value = store.getLoginOperation;

        getOperations(operation);
      } else if (val == 2) {
        let conductorId = store.getConductorId;

        getConductorInfo(conductorId);
      } else if (val == 3) {
        host.value = store.getHost;
      }
    });
    // Previous step
    const prev = () => {
      if (active.value == 5) {
        store.$reset();
        location.reload();
      } else {
        active.value--;
      }

      if (active.value < 0) active.value = 0;
    };
    // conductor list

    const login: any = ref("");
    const dataTime: any = ref("");
    const dataTime2: any = ref("");
    const deleteLoading: any = ref(false);
    const deleteHostLoading: any = ref(false);

    let successOperation = ref("");
    let successOperationName = ref("");

    const selectedHost: Array<Radio> = reactive([]);
    let selectedHostRows: any = reactive([]);

    let selectedMovement: any = reactive([]);
    let allMovement: any = reactive([]);
    let secondMovement: any = reactive([]);

    // emits event
    const changeMovement = (val: any) => {
      selectedMovement = val;
    };

    const changeErrorHappend = (val: any) => {
      errorHappend.value = val;
    };
    // change 登録件数
    const changeSecond = (val: any) => {
      secondMovement.length = 0;
      val.forEach((element: any) => {
        secondMovement.push(element.num);
      });
    };
    const changeHost = (val: any) => {
      selectedHostRows = val;
    };
    const changeValue = (val: any) => {
      iptVal.value = val;
    };
    const getTime2 = (val: any) => {
      dataTime2.value = val;
    };
    const getTime = (val: any) => {
      dataTime.value = val;
    };
    const changeActiveName = (val: any) => {
      activeName.value = val;
    };
    const isChangeDisabled = (val: any) => {
      isDisabled.value = val;
    };
    const hostChangedDelete = async (movement: any) => {
      let totalCount: any = 0;
      for (const el of movement) {
        let obj = {
          discard: {
            NORMAL: 0,
          },
          movement: { LIST: [el.movement_name] },
        };
        try {
          let res = await menuItem(obj);
          let menu = res.data.data[0].parameter.menu_group_menu_item;
          let realMenuItem = menu.substring(menu.indexOf(":") + 1, menu.lastIndexOf(":"));

          let obj2 = {
            discard: {
              NORMAL: 0,
            },
            menu_name_en: { LIST: [realMenuItem] },
          };
          try {
            let res1 = await restNameApi(obj2);
            let restNameValue = res1.data.data[0].parameter.menu_name_rest;
            let pullDown = await pulldownApi(restNameValue);
            let hostId: any = pullDown.data.data.host_name;
            hostNameList.length = 0;
            for (let j = 0; j < deleteHost.length; j++) {
              let num: string = deleteHost[j].managed_system_item_number;
              if (deleteHost[j].managed_system_item_number == undefined) {
                hostNameList.push(hostId[deleteHost[j]]);
              } else {
                hostNameList.push(hostId[num]);
              }
            }

            try {
              let loginOperation = store.getLoginOperation;
              let params2 = {
                discard: {
                  NORMAL: "0",
                },
                host_name: {
                  LIST: Array.from(new Set(hostNameList)),
                },
                operation_name_disp: {
                  LIST: [loginOperation],
                },
              };
              let res2 = await optionName(params2, restNameValue);

              let operationListData = res2.data.data;
              if (operationListData.length) {
                operationListData.forEach((el: any) => {
                  el.parameter.discard = 1;
                });
                await optionAllRegister(operationListData, restNameValue)
                  .then(async () => {
                    let count = await getOperationCount(params2, restNameValue);
                    totalCount += count;
                  })
                  .catch((error: any) => {
                    ElMessage({
                      type: "error",
                      message: error,
                    });
                  });
              }
            } catch (error: any) {
              ElMessage({
                type: "error",
                message: error,
              });
            }
          } catch (error: any) {
            ElMessage({
              type: "error",
              message: error,
            });
          }
        } catch (error: any) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      }

      // The deletion was successful
      if (parseInt(totalCount) == 0) {
        let data = setOperationDataSetInfoByActiveChanged("selHost")
        await setOperationDataSetInfos(data).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
          deleteHostLoading.value = false;
          deleteLoading.value = false;
          hostNextDisabled.value = false;
          return;
        });
        deleteHostLoading.value = false;
        deleteLoading.value = false;
        hostNextDisabled.value = false;
        active.value++;
      } else {
        ElMessage({
          type: "error",
          message: "パラメータの削除に失敗しました。",
        });
        deleteHostLoading.value = false;
        deleteLoading.value = false;
        hostNextDisabled.value = false;
      }
    };
    const setOperationDataSetInfoByActiveChanged = (activename: string) => {
      let loggedOperationDataSetInfos: any = store.getLoggedOperationDataSetInfos;
      if (activename == 'selHost') {
        let hostTmp = store.getHost;
        let hostTmpStr: string = '';
        hostTmp.forEach((el: any) => {
          hostTmpStr = hostTmpStr + "," + el.managed_system_item_number
        });
        hostTmpStr = hostTmpStr.substring(1, hostTmpStr.length);
        let updateType: string = "Update";
        let movementInfos_tmp: string = "";
        let isExist: boolean = true;
        let movementInfos: string[];
        selectedMovement.forEach((el: any) => {
          movementInfos_tmp = movementInfos_tmp + "," + el.movement_id
        });
        movementInfos_tmp = movementInfos_tmp.substring(1, movementInfos_tmp.length);
        let data = [{
          parameter: {
            discard: "0",
            uuid: loggedOperationDataSetInfos.uuid,
            Operation: loggedOperationDataSetInfos.Operation,
            Conductor: loggedOperationDataSetInfos.Conductor,
            Movement: movementInfos_tmp,
            Host: hostTmpStr,
            remarks: loggedOperationDataSetInfos.remarks,
            last_update_date_time: loggedOperationDataSetInfos.last_update_date_time,
            last_updated_user: null
          },
          type: updateType
        }];
        return data;
      }
      if (activename == 'selConductor') {
        let loginOperationId = store.getLoginOperationId;
        let conductorId = store.getConductorId;
        let updateType: string = "Register";
        let uptateuuid: string | null = null
        let movementInfos_tmp: string = "";
        let isExist: boolean = true;
        let movementInfos: string[];
        if (loggedOperationDataSetInfos.length != 0 && loginOperationId == loggedOperationDataSetInfos.Operation) {
          movementInfos = loggedOperationDataSetInfos.Movement.split(",");
          updateType = "Update";
          uptateuuid = loggedOperationDataSetInfos.uuid;
        }
        if (conductorId == loggedOperationDataSetInfos.Conductor && loggedOperationDataSetInfos.length != 0) {
          return null;
        }
        let data = [{
          parameter: {
            discard: "0",
            uuid: uptateuuid,
            Operation: loginOperationId,
            Conductor: conductorId,
            Movement: "",
            Host: loggedOperationDataSetInfos.length == 0 ? "" : loggedOperationDataSetInfos.Host,
            remarks: loggedOperationDataSetInfos.length == 0 ? "" : loggedOperationDataSetInfos.remarks,
            last_update_date_time: (updateType == "Update" ? loggedOperationDataSetInfos.last_update_date_time : null),
            last_updated_user: null
          },
          type: updateType
        }];
        return data;
      }
      return null;
     

    }
    const movementChangedDelete = async (deleteMovement: any) => {
      let totalCount: any = 0;
      for (const el of deleteMovement) {
        let obj = {
          discard: {
            NORMAL: 0,
          },
          movement: { LIST: [el.movement_name] },
        };
        try {
          let res = await menuItem(obj);
          let menu = res.data.data[0].parameter.menu_group_menu_item;
          let realMenuItem = menu.substring(menu.indexOf(":") + 1, menu.lastIndexOf(":"));

          let obj2 = {
            discard: {
              NORMAL: 0,
            },
            menu_name_en: { LIST: [realMenuItem] },
          };
          try {
            let res1 = await restNameApi(obj2);
            let restNameValue = res1.data.data[0].parameter.menu_name_rest;

            try {
              let loginOperation = store.getLoginOperation;
              let params2 = {
                discard: {
                  NORMAL: "0",
                },
                operation_name_disp: {
                  LIST: [loginOperation],
                },
              };
              let res2 = await optionName(params2, restNameValue);

              let operationListData = res2.data.data;
              if (operationListData.length) {
                operationListData.forEach((el: any) => {
                  el.parameter.discard = 1;
                });
                await optionAllRegister(operationListData, restNameValue)
                  .then(async () => {
                    let count = await getOperationCount(params2, restNameValue);
                    totalCount += count;
                  })
                  .catch((error: any) => {
                    ElMessage({
                      type: "error",
                      message: error,
                    });
                  });
              }
            } catch (error: any) {
              ElMessage({
                type: "error",
                message: error,
              });
            }
          } catch (error: any) {
            ElMessage({
              type: "error",
              message: error,
            });
          }
        } catch (error: any) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      }

      // The deletion was successful
      if (parseInt(totalCount) == 0) {
        let data = setOperationDataSetInfoByActiveChanged("selHost")
        await setOperationDataSetInfos(data).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
          deleteHostLoading.value = false;
          deleteLoading.value = false;
          hostNextDisabled.value = false;
          return;
        });
        deleteHostLoading.value = false;
        deleteLoading.value = false;
        hostNextDisabled.value = false;
        active.value++;
      } else {
        ElMessage({
          type: "error",
          message: "パラメータの削除に失敗しました。",
        });
        deleteHostLoading.value = false;
        deleteLoading.value = false;
        hostNextDisabled.value = false;
      }
    };
    // delete hostName
    let deleteHost: any = [];
    let hostNameList: any = reactive([]);
    // delete movementName
    let movementNameList: any = reactive([]);
    const next = async () => {
      // operation login step 1
      if (active.value == 0) {
        if (activeName.value == "1") {
          if (iptVal.value) {
            // Login successful
            if (isDisabled.value && successOperation.value) {
              ElMessage.closeAll();
            } else {
              onLogin(iptVal.value);
            }
          } else {
            // Login failed
            ElMessage({
              type: "warning",
              message: "オペレーション名を入力してください。",
            });
          }
        } else {
          if (isDisabled.value) {
            active.value++;
          } else {
            // Login failed
            ElMessage({
              type: "warning",
              message: "オペレーションを選択してください。",
            });
          }
        }
      } else if (active.value == 1) {
        // step 2
        if (selectedMovement.length == 0) {
          ElMessage({
            type: "warning",
            message: "Movementを選択してください。",
          });
        } else {
          let conductor = store.getConductor;
          let conductorId = store.getConductorId;
          let loginOperation = store.getLoginOperation;
          let loggedOperationDataSetInfos: any = store.getLoggedOperationDataSetInfos;
          
          if (loggedOperationDataSetInfos.length!=0) {
            if (store.getLoginOperationId != loggedOperationDataSetInfos.Operation) {
              let data = setOperationDataSetInfoByActiveChanged("selConductor")
              if (data) {
                await setOperationDataSetInfos(data).catch((error: any) => {
                  ElMessage({
                    type: "error",
                    message: error,
                  });
                  return;
                });
              }
              active.value++;
            } else {

              if (loggedOperationDataSetInfos.Conductor == conductorId) {
                let data = setOperationDataSetInfoByActiveChanged("selConductor")
                if (data) {
                  await setOperationDataSetInfos(data).catch((error: any) => {
                    ElMessage({
                      type: "error",
                      message: error,
                    });
                    return;
                  });
                }
                active.value++;
              } else {
                ElMessageBox.confirm(
                  `<p>前回と異なるConductorが選択されています。</p>
                   <p>ウィザードを進めると、このオペレーションに紐づくパラメータが削除されます。よろしいですか？</p>`,
                  "Warning",
                  {
                    confirmButtonText: "OK",
                    cancelButtonText: "Cancel",
                    type: "warning",
                    dangerouslyUseHTMLString: true,
                  }
                )
                  .then(async () => {
                    let data = setOperationDataSetInfoByActiveChanged("selConductor")
                    if (data) {
                      await setOperationDataSetInfos(data).catch((error: any) => {
                        ElMessage({
                          type: "error",
                          message: error,
                        });
                        return;
                      });
                    }
                    active.value++;
                  })
                  .catch(() => {
                  });
              }
            }
          } else {
            let data = setOperationDataSetInfoByActiveChanged("selConductor")
            if (data) {
              await setOperationDataSetInfos(data).catch((error: any) => {
                ElMessage({
                  type: "error",
                  message: error,
                });
                return;
              });
            }
            active.value++;
          }
        }
      } else if (active.value == 2) {
        // step 3
        if (selectedHostRows.length == 0) {
          ElMessage({
            type: "warning",
            message: "対象ホストを選択してください。",
          });
        } else {
          deleteLoading.value = true;
          hostNextDisabled.value = true;

          let host = store.getHost;
          let movement = store.getMovement;

          // Whether to change the registered host
          let loggedHost1 = store.getLoggedHost;
          let loggedMovement1 = store.getLoggedMovement;
          let results = [];
          let resultsMovement = [];

          let deleteMovement: any = [];
          deleteHost = [];
          for (let i = 0; i < loggedHost1.length; i++) {
            let el = loggedHost1[i];

            let result = host.findIndex((elInner) => {
              return el.managed_system_item_number == elInner.managed_system_item_number;
            });

            results.push(result);

            if (result == -1) {
              deleteHost.push(el);
            }
          }

          for (let i = 0; i < loggedMovement1.length; i++) {
            let el = loggedMovement1[i];
            let result = movement.findIndex((elInner: any) => {
              return el.movement_id == elInner.movement_id;
            });

            resultsMovement.push(result);

            if (result == -1) {
              deleteMovement.push(el);
            }
          }

          // movement has not changed
          if (resultsMovement.indexOf(-1) == -1) {
            if (results.indexOf(-1) == -1) {
              let data = setOperationDataSetInfoByActiveChanged("selHost")
              await setOperationDataSetInfos(data).catch((error: any) => {
                ElMessage({
                  type: "error",
                  message: error,
                });
                deleteHostLoading.value = false;
                deleteLoading.value = false;
                hostNextDisabled.value = false;
                return;
              });
              deleteHostLoading.value = false;
              deleteLoading.value = false;
              hostNextDisabled.value = false;
              active.value++;
            } else {
              // only host has changed
              // ***************
              let movement = store.getMovement;

              let el = movement[0];
              let obj = {
                discard: {
                  NORMAL: 0,
                },
                movement: { LIST: [el.movement_name] },
              };
              try {
                let res = await menuItem(obj);
                let menu = res.data.data[0].parameter.menu_group_menu_item;
                let realMenuItem = menu.substring(
                  menu.indexOf(":") + 1,
                  menu.lastIndexOf(":")
                );

                let obj2 = {
                  discard: {
                    NORMAL: 0,
                  },
                  menu_name_en: { LIST: [realMenuItem] },
                };
                try {
                  let res1 = await restNameApi(obj2);
                  let restNameValue = res1.data.data[0].parameter.menu_name_rest;

                  let pullDown = await pulldownApi(restNameValue);
                  let hostId: any = pullDown.data.data.host_name;
                  hostNameList.length = 0;
                  for (let j = 0; j < deleteHost.length; j++) {
                    let num: string = deleteHost[j].managed_system_item_number;
                    if (deleteHost[j].managed_system_item_number == undefined) {
                      hostNameList.push(hostId[deleteHost[j]]);
                    } else {
                      hostNameList.push(hostId[num]);
                    }
                    
                  }
                } catch (error: any) {
                  ElMessage({
                    type: "error",
                    message: error,
                  });
                }
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }

              movementNameList.length = 0;
              for (let j = 0; j < deleteMovement.length; j++) {
                movementNameList.push(deleteMovement[j].movement_name);
              }
              ElMessageBox.confirm(
                `<p>前回と異なるMovementまたはホストが選択されています。</p>
                 <p>ウィザードを進めると、このオペレーションに紐づくパラメータが削除されます。よろしいですか？</p>`,
                "Warning",
                {
                  customClass: "messageBoxWarning",
                  confirmButtonText: "OK",
                  cancelButtonText: "Cancel",
                  type: "warning",
                  dangerouslyUseHTMLString: true,
                }
              )
                .then(async () => {
                  // delete
                  let movement = store.getLoggedMovement;
                  deleteHostLoading.value = true;
                  hostChangedDelete(movement);
                })
                .catch(() => {
                  deleteHostLoading.value = false;
                  deleteLoading.value = false;
                  hostNextDisabled.value = false;
                  ElMessage({
                    type: "info",
                    message: "パラメータの削除を中止しました。",
                  });
                });
            }
            // movement has changed
          } else {
            // movement has changed
            // host has not changed
            if (results.indexOf(-1) == -1) {
              let movement = store.getMovement;
              let el = movement[0];
              let obj = {
                discard: {
                  NORMAL: 0,
                },
                movement: { LIST: [el.movement_name] },
              };
              try {
                let res = await menuItem(obj);
                let menu = res.data.data[0].parameter.menu_group_menu_item;
                let realMenuItem = menu.substring(
                  menu.indexOf(":") + 1,
                  menu.lastIndexOf(":")
                );

                let obj2 = {
                  discard: {
                    NORMAL: 0,
                  },
                  menu_name_en: { LIST: [realMenuItem] },
                };
                try {
                  let res1 = await restNameApi(obj2);
                  let restNameValue = res1.data.data[0].parameter.menu_name_rest;

                  let pullDown = await pulldownApi(restNameValue);
                  let hostId: any = pullDown.data.data.host_name;
                  hostNameList.length = 0;
                  let hostList = store.getLoggedHost;
                  for (let j = 0; j < hostList.length; j++) {
                    let num: string = hostList[j].managed_system_item_number;
                    if (hostList[j].managed_system_item_number == undefined) {
                      hostNameList.push(hostId[hostList[j]]);
                    } else {
                      hostNameList.push(hostId[num]);
                    }
                  }
                } catch (error: any) {
                  ElMessage({
                    type: "error",
                    message: error,
                  });
                }
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }
              movementNameList.length = 0;
              for (let j = 0; j < deleteMovement.length; j++) {
                movementNameList.push(deleteMovement[j].movement_name);
              }

              ElMessageBox.confirm(
                `<p>前回と異なるMovementまたはホストが選択されています。</p>
                 <p>ウィザードを進めると、このオペレーションに紐づくパラメータが削除されます。よろしいですか？</p>`,
                "Warning",
                {
                  customClass: "messageBoxWarning",
                  confirmButtonText: "OK",
                  cancelButtonText: "Cancel",
                  type: "warning",
                  dangerouslyUseHTMLString: true,
                }
              )
                .then(async () => {
                  deleteHostLoading.value = true;
                  // delete
                  movementChangedDelete(deleteMovement);
                })
                .catch(() => {
                  deleteHostLoading.value = false;
                  deleteLoading.value = false;
                  hostNextDisabled.value = false;
                  ElMessage({
                    type: "info",
                    message: "パラメータの削除を中止しました。",
                  });
                });
            } else {
              // host has changed
              let movement = store.getMovement;
              let el = movement[0];
              let obj = {
                discard: {
                  NORMAL: 0,
                },
                movement: { LIST: [el.movement_name] },
              };
              try {
                let res = await menuItem(obj);
                let menu = res.data.data[0].parameter.menu_group_menu_item;
                let realMenuItem = menu.substring(
                  menu.indexOf(":") + 1,
                  menu.lastIndexOf(":")
                );

                let obj2 = {
                  discard: {
                    NORMAL: 0,
                  },
                  menu_name_en: { LIST: [realMenuItem] },
                };
                try {
                  let res1 = await restNameApi(obj2);
                  let restNameValue = res1.data.data[0].parameter.menu_name_rest;
                  let pullDown = await pulldownApi(restNameValue);
                  let hostId: any = pullDown.data.data.host_name;
                  hostNameList.length = 0;
                  for (let j = 0; j < deleteHost.length; j++) {
                    let num: string = deleteHost[j].managed_system_item_number;
                    if (deleteHost[j].managed_system_item_number == undefined) {
                      hostNameList.push(hostId[deleteHost[j]]);
                    } else {
                      hostNameList.push(hostId[num]);
                    }
                  }
                } catch (error: any) {
                  ElMessage({
                    type: "error",
                    message: error,
                  });
                }
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }
              movementNameList.length = 0;
              for (let j = 0; j < deleteMovement.length; j++) {
                movementNameList.push(deleteMovement[j].movement_name);
              }

              ElMessageBox.confirm(
                `<p>前回と異なるMovementまたはホストが選択されています。</p>
                 <p>ウィザードを進めると、このオペレーションに紐づくパラメータが削除されます。よろしいですか？</p>`,
                "Warning",
                {
                  customClass: "messageBoxWarning",
                  confirmButtonText: "OK",
                  cancelButtonText: "Cancel",
                  type: "warning",
                  dangerouslyUseHTMLString: true,
                }
              )
                .then(async () => {
                  deleteHostLoading.value = true;
                  // movement and host all change to delete
                  let totalCount: any = 0;
                  for (const el of deleteMovement) {
                    let obj = {
                      discard: {
                        NORMAL: 0,
                      },
                      movement: { LIST: [el.movement_name] },
                    };
                    try {
                      let res = await menuItem(obj);
                      let menu = res.data.data[0].parameter.menu_group_menu_item;
                      let realMenuItem = menu.substring(
                        menu.indexOf(":") + 1,
                        menu.lastIndexOf(":")
                      );

                      let obj2 = {
                        discard: {
                          NORMAL: 0,
                        },
                        menu_name_en: { LIST: [realMenuItem] },
                      };
                      try {
                        let res1 = await restNameApi(obj2);
                        let restNameValue = res1.data.data[0].parameter.menu_name_rest;

                        try {
                          let loginOperation = store.getLoginOperation;
                          let params2 = {
                            discard: {
                              NORMAL: "0",
                            },
                            operation_name_disp: {
                              LIST: [loginOperation],
                            },
                          };

                          let res2 = await optionName(params2, restNameValue);

                          let operationListData = res2.data.data;
                          if (operationListData.length) {
                            operationListData.forEach((el: any) => {
                              el.parameter.discard = 1;
                            });
                            await optionAllRegister(operationListData, restNameValue)
                              .then(async () => {
                                let count = await getOperationCount(
                                  params2,
                                  restNameValue
                                );
                                totalCount += count;
                              })
                              .catch((error: any) => {
                                ElMessage({
                                  type: "error",
                                  message: error,
                                });
                              });
                          }
                        } catch (error: any) {
                          ElMessage({
                            type: "error",
                            message: error,
                          });
                        }
                      } catch (error: any) {
                        ElMessage({
                          type: "error",
                          message: error,
                        });
                      }
                    } catch (error: any) {
                      ElMessage({
                        type: "error",
                        message: error,
                      });
                    }
                  }
                  let movement = store.getLoggedMovement;

                  for (const el of movement) {
                    let obj = {
                      discard: {
                        NORMAL: 0,
                      },
                      movement: { LIST: [el.movement_name] },
                    };
                    try {
                      let res = await menuItem(obj);
                      let menu = res.data.data[0].parameter.menu_group_menu_item;
                      let realMenuItem = menu.substring(
                        menu.indexOf(":") + 1,
                        menu.lastIndexOf(":")
                      );

                      let obj2 = {
                        discard: {
                          NORMAL: 0,
                        },
                        menu_name_en: { LIST: [realMenuItem] },
                      };
                      try {
                        let res1 = await restNameApi(obj2);
                        let restNameValue = res1.data.data[0].parameter.menu_name_rest;
                        let pullDown = await pulldownApi(restNameValue);
                        let hostId: any = pullDown.data.data.host_name;
                        hostNameList.length = 0;
                        for (let j = 0; j < deleteHost.length; j++) {
                          let num: string = deleteHost[j].managed_system_item_number;
                          if (deleteHost[j].managed_system_item_number == undefined) {
                            hostNameList.push(hostId[deleteHost[j]]);
                          } else {
                            hostNameList.push(hostId[num]);
                          }
                        }
                        try {
                          let loginOperation = store.getLoginOperation;
                          let params2 = {
                            discard: {
                              NORMAL: "0",
                            },
                            host_name: {
                              LIST: Array.from(new Set(hostNameList)),
                            },
                            operation_name_disp: {
                              LIST: [loginOperation],
                            },
                          };

                          let res2 = await optionName(params2, restNameValue);

                          let operationListData = res2.data.data;
                          if (operationListData.length) {
                            operationListData.forEach((el: any) => {
                              el.parameter.discard = 1;
                            });
                            await optionAllRegister(operationListData, restNameValue)
                              .then(async () => {
                                let count = await getOperationCount(
                                  params2,
                                  restNameValue
                                );
                                totalCount += count;
                              })
                              .catch((error: any) => {
                                ElMessage({
                                  type: "error",
                                  message: error,
                                });
                              });
                          }
                        } catch (error: any) {
                          ElMessage({
                            type: "error",
                            message: error,
                          });
                        }
                      } catch (error: any) {
                        ElMessage({
                          type: "error",
                          message: error,
                        });
                      }
                    } catch (error: any) {
                      ElMessage({
                        type: "error",
                        message: error,
                      });
                    }
                  }
                  let data = setOperationDataSetInfoByActiveChanged("selHost")
                  await setOperationDataSetInfos(data).catch((error: any) => {
                    ElMessage({
                      type: "error",
                      message: error,
                    });
                    deleteHostLoading.value = false;
                    deleteLoading.value = false;
                    hostNextDisabled.value = false;
                    return;
                  });
                  deleteHostLoading.value = false;
                  deleteLoading.value = false;
                  hostNextDisabled.value = false;
                  active.value++;
                })
                .catch(() => {
                  deleteHostLoading.value = false;
                  deleteLoading.value = false;
                  hostNextDisabled.value = false;
                  ElMessage({
                    type: "info",
                    message: "パラメータの削除を中止しました。",
                  });
                });
            }
          }
        }
      } else if (active.value == 3) {
        if (secondMovement.indexOf(0) == -1) {
          active.value++;
        } else {
          ElMessage({
            type: "warning",
            message:
              "未登録のパラメータシートがあります。すべてのパラメータシートに1件以上のパラメータを登録してください。",
          });
        }
      } else if (active.value == 4) {
        active.value++;
        login.value = store.getLoginOperation;
      }
      if (active.value > 5) active.value = 4;
    };

    const onLogin = (val: any) => {
      
      store.setLoginOperation(val);
      store.setOperationSelect(dataTime2.value + "_" + val);
      store.setLogOperationScheduledDate(dataTime.value);
      // login input value is required
      let obj = {
        parameter: {
          operation_name: val,
          scheduled_date_for_execution: dataTime.value,
        },
      };
      optionLogin(obj)
        .then((res: any) => {
          successOperation.value = val;
          ElMessage({
            type: "success",
            message: `オペレーション「${val}」が登録されました。`,
            duration: 1000,
          });

          isDisabled.value = true;

          setTimeout(() => {
            if (active.value === 0) {
              active.value++;
            }
          }, 1000);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    //  onLogin
    let flag = ref(false);

    // options list
    let options: any = reactive([]);
    function getRadios() {
      getradiosInfo().then((res: any) => {
        let data = res.data.data;
        data.forEach((element: any) => {
          let obj: Radio = {
            value: element.parameter.conductor_class_id,
            label: element.parameter.conductor_name,
          };
          radios.push(obj);
        });
      });
    }
    getRadios();

    // execute
    function executeOption() {
      ElMessageBox.confirm("実行してよろしいですか？", "実行", {
        confirmButtonText: "OK",
        cancelButtonText: "Cancel",
        type: "warning",
        customClass: "persdsd",
      })
        .then(async () => {
          // Delete the relationship between the conductor and the operation
          let operationSelected = store.getLoginOperation;
          let conductorId = store.getConductorId;
          let conductor = store.getConductor;
          let login = store.getLoginOperation;
          let selectedMovement = store.getMovement;

          let movementArray = await movementInfo(conductorId);

          let movementConductor = movementArray.data.data;

          for (const key in movementConductor) {
            if (Object.prototype.hasOwnProperty.call(movementConductor, key)) {
              let element = movementConductor[key];
              if ("movement_id" in element) {
                element.skip_flag = 1;
                selectedMovement.forEach((el: any) => {
                  if (el.movement_name == element.movement_name) {
                    element.skip_flag = 0;
                  }
                });
              }
            }
          }
          let obj = {
            conductor_class_name: conductor,
            operation_name: login,
            conductor_data: movementConductor,
          };
          execute(obj)
            .then((res: any) => {
              next();
              // go to confirm
              router.push({
                path: "/confirm",
              });
            })
            .catch((err: any) => {
              ElMessage({
                type: "error",
                message: err,
              });
            });
        })
        .catch(() => {});
    }

    // Import enent
    const rowData = ref("");
    const rowKey = ref(0);
    const importEvent = (scope: any) => {
      rowData.value = scope.params;
      rowKey.value = scope.key;
    };
    let graphRefs: { [key: string]: any } = {};
    const setGraphRef = (el: any, scope: any) => {
      if (el) {
        graphRefs[scope] = el;
      }
    };
    const nextDisabled: any = ref(false);
    const changeOperationLoading = (val: any) => {
      nextDisabled.value = val;
    };
    const hostNextDisabled: any = ref(false);
    const changeHostLoading = (val: any) => {
      hostNextDisabled.value = val;
    };

    return {
      changeMovement,
      changeSecond,
      nextDisabled,
      hostNextDisabled,
      changeOperationLoading,
      changeHostLoading,
      setGraphRef,
      selectedMovement,
      selectedHost,
      firstComponent,
      changeHost,
      changeValue,
      getTime2,
      getTime,
      changeActiveName,
      activeName,
      isDisabled,
      successOperation,
      isChangeDisabled,
      active,
      next,
      prev,
      cancel,
      login,
      flag,
      options,
      importEvent,
      executeOption,
      deleteLoading,
      deleteHostLoading,
      errorHappend,
      changeErrorHappend,
      operationColumns,
      conductorColumns,
      columns,
      conductorName,
      successOperationName,
      operations,
      operationDesc,
      conductorInfo,
      loadingShowOperation,
      loadingShowConductor,
      host,
      steps: [
        {
          title: "オペレーション登録",
        },
        {
          title: "実行ジョブ指定",
        },
        {
          title: "対象ホスト指定",
        },
        {
          title: "パラメータ登録",
        },
        {
          title: "ジョブ実行",
        },
      ],
    };
  },
});
</script>

<style scoped lang="less">
/deep/.el-table thead tr th {
  background-color: #bdbdbd !important;
  color: #000;
  font-weight: normal;
}

/deep/.el-step__title.is-success {
  color: #ff5722 !important;
}

/deep/.el-step__head.is-success {
  color: #ff5722 !important;
  border-color: #ff5722 !important;
}

.execute-box {
  height: 520px !important;
  overflow-y: scroll;
}

.exBtn {
  border-color: #da6a38;
  background-color: #da6a38;
}

.steps-action {
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  position: absolute;
  right: 0;
  bottom: 0;
  justify-content: space-between;
  width: 100%;
  margin-top: 24px;
  margin-left: -10px;
  padding: 10px 0;
  background-color: #002060;
  z-index: 99;
  .cancelButton {
    margin-left: 20px;
  }

  .backBtn {
    padding: 0 20px;
    border-radius: 8px;
    background-color: #fff0f000;
    color: #fff;
    margin-right: 10px;

    &:hover {
      opacity: 0.8;
    }
  }

  .nextBtn {
    margin-right: 20px;
    padding: 0 50px;
    border-radius: 8px;
    color: #fff;
    background-color: #da6a38;

    &:hover {
      opacity: 0.8;
    }
  }
}

.lastStep {
  width: 60%;
  margin: 11% auto;
}
.collapseBox {
  margin-top: 20px;
  .itemTitle {
    font-size: 16px;
  }
  div {
    h3 {
      margin: 0 !important;
      padding: 0 !important;
      display: inline-block;
      width: 140px;
    }
    .valueTitle {
      display: inline-block;
    }
  }
}
.contentCenterBox {
  height: calc(100% - 200px);
  overflow-y: scroll;
}
.desBracket {
  display: inline-block;
  width: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.desText {
  display: inline-block;
  max-width: 84%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
<style lang="less">
.el-radio.is-bordered.is-checked {
  border-color: #0960bd;
  color: #0960bd;
}
.el-step.is-center .el-step__description {
  padding-left: 0%;
  padding-right: 0%;
}
.el-step.is-horizontal {
  width: 20% !important;
  flex-basis: auto !important;
}
.el-radio__input.is-checked + .el-radio__label {
  color: #0960bd;
}

.el-radio__input.is-checked .el-radio__inner {
  border-color: #0960bd;
  background-color: #fff;
}

.el-radio__input.is-checked .el-radio__inner::after {
  border: 1px solid #0960bd;
  width: 6px;
  height: 6px;
}
.el-table tbody tr .el-table__cell {
  padding: 0px 0 !important;
}
.el-table .el-table__cell {
  padding: 0px 0 !important;
}
.el-table .cell {
  line-height: 27px !important;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #0960bd;
  border-color: #0960bd;
}

.el-checkbox__inner::after {
  border-color: #fff;
}

.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #fff;
  border-color: #fff;
}
.messageBoxWarning {
  max-width: 600px !important;
  .messageContent {
    display: flex;

    .label {
      white-space: nowrap;
    }
    .content {
      text-indent: 4px;
      flex-wrap: wrap;
    }
  }
}
</style>
