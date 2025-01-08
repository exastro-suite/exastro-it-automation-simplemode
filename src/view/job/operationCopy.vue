<template>
  <div
    class="steps-fourth"
    element-loading-text="loading..."
  >
    <p>
      指定されたMovementに紐づくパラメータシートに、作成したオペレーションを使ってパラメータを登録します。
    </p>
    <p>必要に応じて既存のオペレーションからパラメータをコピーできます。</p>
    <el-card shadow="never">
      <h3>パラメータ一括コピー</h3>
      <div class="topCardBox">
        <div class="tabBox">
          <p>コピー元パラメータシート種別</p>

          <el-radio-group v-model="activeName" class="ml-4" @change="changType" :disabled="isDisabled">
            <el-radio border label="収集結果">収集結果</el-radio>
            <el-radio border label="構築">構築/収集</el-radio>
          </el-radio-group>
        </div>
        <div class="originCopy">
          <p>コピー元オペレーション名</p>
          <el-select
            v-model="operation"
            filterable
            class="m-2"
            placeholder="Select"
            @change="changeoperation"
            :disabled="isDisabled"
          >
            <el-option
              v-for="item in operationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.label"
            />
          </el-select>
        </div>
        <div>
          <el-button
            type="primary"
            class="copyAll"
            @click="handleCopy"
            :loading="copyLoading"
            :disabled="isDisabled"
            ><el-icon> <DocumentCopy /> </el-icon>&nbsp; 一括コピー</el-button
          >
          <div id="deleteAllBtn">
            <el-button
              type="primary"
              class="deleteAll"
              @click="handleDeleteEvent"
              :loading="deleteLoading"
              :disabled="isDisabled"
              ><el-icon> <Delete /> </el-icon>&nbsp; 一括削除</el-button
            >
          </div>
        </div>
      </div>
    </el-card>
    <el-table
      v-loading="loadingShow || deleteLoading || copyLoading"
      @row-click="rowClick"
      element-loading-text="loading..."
      ref="movementTable"
      :data="movementTableData"
      border
      :height="tableHeight"
      :row-style="rowClass"
      style="width: 100%"
      @selection-change="handleChangeMovement"
      :row-key="getRowKeys"
      :row-height="27"
    >
      <el-table-column type="selection" width="55" :reserve-selection="true" />
      <template v-for="(item, index) in movemenetColumns" :key="index">
        <el-table-column
          v-if="item.dataIndex === 'edit'"
          :label="item.title"
          width="100"
          align="center"
        >
          <template #default="scope">
            <el-tooltip class="box-item" effect="light" content="編集" placement="left">
              <el-icon size="20px" color="#002B62" @click="openCopyDetail(scope.row)">
                <Edit style="cursor: pointer" />
              </el-icon>
            </el-tooltip>

            <el-tooltip
              v-if="isErrorFlag[scope.row.movement]"
              ref="tooltip"
              :disabled="tooltipShow"
              effect="dark"
              content="エラー詳細"
              placement="top"
            >
              <div style="display: inline">
                <el-popover
                  @before-leave="closeTooltip"
                  ref="popover"
                  placement="right"
                  width="50%"
                  trigger="click"
                >
                  <template #reference>
                    <el-icon @click="closeTooltip" size="20px" style="margin-left: 17px">
                      <Warning style="cursor: pointer" color="red" />
                    </el-icon>
                  </template>
                  <div class="errorTable">
                    <el-table
                      :data="errorTableData[scope.row.movement]"
                      border
                      height="150px"
                      style="width: 100%; overflow-x: scroll"
                    >
                      <el-table-column
                        width="150"
                        prop="title"
                        label="エラー列"
                      ></el-table-column>
                      <el-table-column
                        prop="content"
                        label="エラー内容"
                      ></el-table-column>
                    </el-table>
                  </div>
                </el-popover>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column
          v-else-if="item.dataIndex === 'params'"
          :prop="item.dataIndex"
          :label="item.title"
        >
          <template #default="scope"
            ><span @click="openCopyDetail(scope.row)" style="cursor: pointer">{{
              scope.row.params
            }}</span></template
          >
        </el-table-column>

        <el-table-column
          width="180"
          v-else-if="item.dataIndex === 'status'"
          :prop="item.dataIndex"
          :label="item.title"
        >
          <template #default="scope"
            ><span :class="scope.row.status == '未登録' ? 'notFinished' : 'finished'">{{
              scope.row.status
            }}</span></template
          >
        </el-table-column>
        <el-table-column
          width="180"
          v-else-if="item.dataIndex === 'num'"
          :prop="item.dataIndex"
          :label="item.title"
        >
          <template #default="scope"
            ><span :class="scope.row.num == '0' ? 'notFinished' : 'finished'">{{
              scope.row.num
            }}</span></template
          >
        </el-table-column>
        <el-table-column
          v-else-if="item.dataIndex != 'copy'"
          :prop="item.dataIndex"
          :label="item.title"
          :width="item.dataIndex == 'num' ? 180 : ''"
        />
      </template>
    </el-table>

    <p v-if="loadingShow|| deleteLoading || copyLoading" class="progressBox">{{ progress }} / {{ total }}</p>

    <DialogDetail
      :dialogVisible="dialogVisible"
      @change="change"
      @changestatus="changestatus"
      @changestatusString="changestatusString"
      :type="activeName"
      :movementName="movementName"
      :parametersheet = "parametersheet"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  watch,
  onMounted,
  onActivated,
  getCurrentInstance,
  onBeforeUnmount,
} from "vue";
import DialogDetail from "./operationCopyDetail.vue";
import { useStore } from "../../store/index";
import {
  menuItem,
  restNameApi,
  optionName,
  optionAllRegister,
  getOperationCount,
  relationships,
} from "../../api/jobApi";
import { operationList } from "../../api/jobList";
import { Edit, DocumentCopy, Warning, Delete } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { eventBus } from "../../store/eventBus";
import {
  ElMessage,
  ElTable,
  ElSelect,
  ElCard,
  ElPopover,
  ElTooltip,
  ElMessageBox,
} from "element-plus";

interface Radio {
  label: string;
  value: string;
}
type movListType = {
  movement: string;
  params: string;
  value: string;
  status: string;
  num: number;
};
export default defineComponent({
  name: "OperationCopy",
  emits: ["changeOperationLoading", "changeSecond"],
  components: {
    ElSelect,
    Edit,
    DocumentCopy,
    Delete,
    DialogDetail,
    Warning,
    ElPopover,
    ElTooltip,
  },
  setup(props, { emit }) {
    //  progress
    const progress = ref(0);
    const total = ref(0);
    const router = useRouter();
    // event bus
    const bus = eventBus();
    const activeName = ref("構築");
    const movemenetColumns = reactive([
      {
        title: "Movement",
        dataIndex: "movement",
      },
      {
        title: "パラメータシート",
        dataIndex: "params",
      },
      {
        title: "詳細設定",
        dataIndex: "edit",
      },
      {
        title: "ステータス",
        dataIndex: "status",
      },
      {
        title: "登録件数",
        dataIndex: "num",
      },
    ]);
    const store = useStore();
    let movement = store.getMovement;
    let conductor = store.getConductor;

    const relationshipsData = ref([]);
    const isDisabled : any = ref(false)

    // get Replication relationships
    const getRelationships = () => {
      relationships()
        .then((res: any) => {
          relationshipsData.value = res.data.data;
          store.setRelationshipsData(res.data.data);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    getRelationships();
    const dialogVisible = ref(false);
    const tooltipShow = ref(false);
    let tableHeight = ref();
    // error table data
    let isErrorFlag: any = ref({});
    let errorTableData: any = ref({});
    onActivated(() => {
      movementTableData.value = [];
      handleChangeMovement([]);
      if (movementTable.value) {
        movementTable.value!.clearSelection();
      }

      getMenuItem();
      let tempHost: any = [];
      let tempMovement: any = [];
      hostLast.forEach((el) => {
        tempHost.push(el);
      });
      movementLast.forEach((el) => {
        tempMovement.push(el);
      });

      store.setLoggedMovement(tempMovement);
      store.setLoggedHost(tempHost);
    });
    onMounted(() => {
      tableHeight.value = window.innerHeight - 465;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 465;
      };
      // dialog detail copy
      bus.on("copyDetail", (a: any) => {
        errorTableData.value = {};
        isErrorFlag.value = {};
      });
      // ce edit sheet
      bus.on("ceEdit", (a: any) => {
        errorTableData.value = {};
        isErrorFlag.value = {};
      });
      // upload file copy
      bus.on("uploadCopy", (a: any) => {
        errorTableData.value = {};
        isErrorFlag.value = {};
      });
      //
    });
    let hostLast = store.getHost;
    let movementLast = store.getMovement;

    onBeforeUnmount(() => {
      bus.off("copyDetail", () => {});
      bus.off("ceEdit", () => {});
      bus.off("uploadCopy", () => {});
    });
    let selectName = store.getOperationSelect;

    let loginOperation = store.getLoginOperation;

    let movementTableData: any = ref([]);

    // first selector

    let loadingShow = ref(false);
    let operation = ref("");
    let movementName = ref("");
    let parametersheet: any = reactive([]);
    const getMenuItem = async () => {
      progress.value = 0;
      loadingShow.value = true;
      parametersheet.length = 0;
      emit("changeOperationLoading", true);
      let movement1 = store.getMovement;

      // node1,node2...
      let movement: any = movement1.sort(function (a: any, b: any) {
        return a.id.slice(5) - b.id.slice(5);
      });

      total.value = movement.length;
      // 性能：　パラメータ登録の時に、登録済みの入力件数を取得
      let input_data_movement: any = {};
      let input_data_menu_definition: any = {};
      let movement_names: any = [];
      for (let index = 0; index < movement.length; index++) {
        let el = movement[index];
        movement_names.push(el.movement_name);
      };
      if (movement_names.length != 0) {
        try {
          let obj = {
            discard: {
              NORMAL: 0,
            },
            movement: { LIST: movement_names },
          };
          let res = await menuItem(obj);
          let datas = res.data.data;
          if (datas.length != 0) {
            let realMenuItems: any = [];
            datas.forEach((element: any) => {
              let menu = element.parameter.menu_group_menu_item;
              // maybe  ID変換失敗
              let realMenuItem = menu.substring(menu.indexOf(":") + 1, menu.lastIndexOf(":"));
              input_data_movement[element.parameter.movement] = realMenuItem;
              realMenuItems.push(realMenuItem);
            });
            if (realMenuItems.length != 0) {
              realMenuItems = [...new Set(realMenuItems)];
              let obj2 = {
                discard: {
                  NORMAL: 0,
                },
                menu_name_en: { LIST: realMenuItems },
              };
              let res1 = await restNameApi(obj2);

              let menu_definition_list = res1.data.data;
              menu_definition_list.forEach((el: any) => {
                let enNameValue = el.parameter.menu_name_en;
                let restNameValue = el.parameter.menu_name_rest;
                input_data_menu_definition[enNameValue] = { "enNameValue": enNameValue, "restNameValue": restNameValue };
              });
            }
          }
        } catch (error: any) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      }

      for (let index = 0; index < movement.length; index++) {
        let el = movement[index];

        progress.value = index + 1;
        try {
          if (input_data_movement.length == 0 || input_data_menu_definition.length == 0) {
            break;
          }
          let enNameValue_tmp = input_data_movement[el.movement_name]
          if (input_data_menu_definition[enNameValue_tmp] == undefined) {
            break;
          }
          let enNameValue = input_data_menu_definition[enNameValue_tmp]["enNameValue"];
          let restNameValue = input_data_menu_definition[enNameValue_tmp]["restNameValue"];
          let loginOperation = store.getLoginOperation;
          let params2 = {
            discard: {
              NORMAL: "0",
            },
            operation_name_disp: {
              LIST: [loginOperation],
            },
          };
          let count = await getOperationCount(params2, restNameValue);
          let obj3: movListType = {
            movement: "",
            params: "",
            value: "",
            status: "",
            num: 0,
          };
          if (count.data.data !== 0) {
            obj3.num = count.data.data;
            obj3.status = "登録済";
          } else {
            obj3.num = 0;
            obj3.status = "未登録";
          }

          obj3.movement = el.movement_name;
          obj3.params = enNameValue;
          obj3.value = restNameValue;
          movementTableData.value[index] = obj3;
          let parametersheet_obj = {
            value: el.movement_name,
            label:enNameValue,
          }
          parametersheet.push(parametersheet_obj)
        } catch (error: any) {
          ElMessage({
            type: "error",
            message: error,
          });
        }
      }

      loadingShow.value = false;
      emit("changeOperationLoading", false);
      emit("changeSecond", movementTableData.value);
    };

    const openCopyDetail = (row: any) => {
      dialogVisible.value = true;

      movementName.value = row.movement;
    };
    const change = (val: boolean) => {
      dialogVisible.value = val;
    };
    let selectedMovement: any = reactive([]);
    const rowClass = ({ row }: any) => {
      if (selectedMovement.length != 0) {
        if (selectedMovement.includes(row)) {
          return { color: "#0960bd" };
        }
      }
    };
    const rowClick = (val: any) => {
      let resultFlag = selectedMovement.findIndex((item: any) => {
        return item.value == val.value;
      });
      if (resultFlag == -1) {
        movementTable.value!.toggleRowSelection(val, true);
      } else {
        movementTable.value!.toggleRowSelection(val, false);
      }
    };
    const handleChangeMovement = (val: any) => {
      selectedMovement.length = 0;
      selectedMovement = val;
    };
    // get sheet list
    let operationOptions: any = reactive([]);
    // コピー元オペレーション名
    const getOperations = (conductor: string) => {
      operationList()
        .then((res: any) => {
          operationOptions.length = 0;
          let arr = res.data.data;

          let loginOperation = store.getLoginOperation;
          let arrResult = arr.filter(
            (item: any) => item.parameter.operation_name !== loginOperation
          );

          // sort by last_run_date
          let arrResult1 = arrResult.sort((a: any, b: any) =>
            b.parameter.scheduled_date_for_execution.localeCompare(a.parameter.scheduled_date_for_execution)
          );
          arrResult1.forEach((element: any) => {
            let obj = {
              label: element.parameter.operation_name,
              value: element.parameter.operation_id,
              last_run_date: element.parameter.last_run_date,
            };
            operationOptions.push(obj);
          });

          if (operationOptions[0]) {
            operation.value = operationOptions[0].label;
          } else {
          }
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };

    const closeTooltip = () => {
      tooltipShow.value = !tooltipShow.value;
    };
    getOperations(conductor);

    const changType = (val: any) => {
      activeName.value = val;
    };
    const changeoperation = (val: any) => {};

    const movementTable: any = ref(null);
    const getRowKeys = (row: any) => {
      return row.movement;
    };
    let hostId: any = reactive({});
    let copyLoading: any = ref(false);
    let copyBaseData: any = ref([]);
    const handleCopy = async () => {
      progress.value = 0;
      errorTableData.value = {};
      isErrorFlag.value = {};

      let host = store.getHost;

      let rows = movementTable.value.getSelectionRows();

      if (rows.length == 0) {
        ElMessage({
          type: "warning",
          message: "対象を選択してください。",
        });
      } else {
        copyLoading.value = true;
        isDisabled.value = true;
        emit("changeOperationLoading", true);
        const params1 = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            LIST: [operation.value],
          },
        };
        // radio is 収集
        if (activeName.value == "収集結果") {
          for (const [index, elp] of rows.entries()) {
            progress.value = index + 1;
            const optionsArr: Array<unknown> = [];
            // 収集結果WINHost
            // to get  relationships
            let realRestName = "";
            let result: any = relationshipsData.value.find(
              (item: any) => item.parameter.movement == elp.movement
            );
            if (result) {
              let objData = {
                discard: { NORMAL: 0 },

                menu_name_ja: {
                  LIST: [result.parameter.source_parameter],
                },
              };
              // パラメータシート定義一覧 restName
              let restName: any = await restNameApi(objData);

              realRestName = restName.data.data[0].parameter.menu_name_rest;

              let res1 = await optionName(params1, realRestName);
              copyBaseData.value = res1.data.data;

              copyBaseData.value.forEach((baseObj: unknown) => {
                host.forEach(async (itemHost: any) => {
                  let obj1 = JSON.parse(JSON.stringify(baseObj));
                  if (itemHost.host_name == obj1.parameter.host_name) {
                    obj1.parameter.uuid = "";
                    obj1.parameter.operation_name_select = selectName;

                    if (obj1.parameter.file) {
                    } else {
                      obj1.file = null;
                    }
                    optionsArr.push(obj1);
                  }
                });
              });

              // There are no reproducible parameters
              if (optionsArr.length == 0) {
                ElMessage({
                  type: "warning",
                  message:
                    "コピー元オペレーションにはコピー可能なパラメータがありません。",
                });
              } else {
                await optionAllRegister(optionsArr, elp.value)
                  .then(async (res: any) => {
                    let loginOperation = store.getLoginOperation;
                    let params2 = {
                      discard: {
                        NORMAL: "0",
                      },
                      operation_name_disp: {
                        LIST: [loginOperation],
                      },
                    };
                    let count = await getOperationCount(params2, elp.value);

                    elp.num = count.data.data;
                    if (res.data.data.Register != "0") {
                      elp.status = "登録済";
                      ElMessage({
                        type: "success",
                        message: `${elp.params}のコピーが成功しました。`,
                      });
                    } else {
                      elp.num = count.data.data;
                      elp.status = "未登録";
                      ElMessage({
                        type: "warning",
                        message:
                          "コピー元オペレーションにはコピー可能なパラメータがありません。",
                      });
                    }
                    emit("changeSecond", movementTableData.value);

                    errorTableData.value[elp.movement] = [{ title: "", content: "" }];
                    isErrorFlag.value[elp.movement] = false;
                  })
                  .catch((err: any) => {
                    try {
                      let error = JSON.parse(err);
                      let arr = [];
                      for (const key in error) {
                        let obj: any = {};
                        obj.serialNum = key;
                        if (Object.prototype.hasOwnProperty.call(error, key)) {
                          const element = error[key];
                          for (const key in element) {
                            if (Object.prototype.hasOwnProperty.call(element, key)) {
                              const elementInner = element[key];

                              obj.title = key;
                              obj.content = elementInner[0];
                              arr.push(obj);
                            }
                          }
                        }
                      }

                      errorTableData.value[elp.movement] = arr;
                      isErrorFlag.value[elp.movement] = true;

                      // elp.error="err"
                    } catch (error: any) {
                      ElMessage({
                        type: "error",
                        message: error,
                      });
                      copyLoading.value = false;
                      isDisabled.value = false;
                      return;
                    }
                  });
              }
            } else {
              // If you don't find a relationship, copy yourself
              ElMessage({
                type: "warning",
                message: "コピー元オペレーションにはコピー可能なパラメータがありません。",
              });
            }
          }

          copyLoading.value = false;
          isDisabled.value = false;
          emit("changeOperationLoading", false);
        } else {
          for (const [index, elp] of rows.entries()) {
            progress.value = index + 1;
            const optionsArr: Array<unknown> = [];
            let res = await optionName(params1, elp.value);
            copyBaseData.value = res.data.data;

            copyBaseData.value.forEach((baseObj: unknown) => {
              host.forEach(async (itemHost: any) => {
                let obj1 = JSON.parse(JSON.stringify(baseObj));
                if (itemHost.host_name == obj1.parameter.host_name) {
                  obj1.parameter.uuid = "";
                  obj1.parameter.operation_name_select = selectName;

                  if (obj1.parameter.file) {
                  } else {
                    obj1.file = null;
                  }
                  optionsArr.push(obj1);
                }
              });
            });

            // There are no reproducible parameters
            if (optionsArr.length == 0) {
              ElMessage({
                type: "warning",
                message: "コピー元オペレーションにはコピー可能なパラメータがありません。",
              });
            } else {
              await optionAllRegister(optionsArr, elp.value)
                .then(async (res: any) => {
                  let loginOperation = store.getLoginOperation;
                  let params2 = {
                    discard: {
                      NORMAL: "0",
                    },
                    operation_name_disp: {
                      LIST: [loginOperation],
                    },
                  };
                  let count = await getOperationCount(params2, elp.value);

                  elp.num = count.data.data;
                  if (res.data.data.Register != "0") {
                    elp.status = "登録済";
                    ElMessage({
                      type: "success",
                      message: `${elp.params}のコピーが成功しました。`,
                    });
                  } else {
                    elp.num = count.data.data;
                    elp.status = "未登録";
                    ElMessage({
                      type: "warning",
                      message:
                        "コピー元オペレーションにはコピー可能なパラメータがありません。",
                    });
                  }
                  emit("changeSecond", movementTableData.value);

                  errorTableData.value[elp.movement] = [{ title: "", content: "" }];
                  isErrorFlag.value[elp.movement] = false;
                })
                .catch((err: any) => {
                  try {
                    let error = JSON.parse(err);
                    let arr = [];
                    for (const key in error) {
                      let obj: any = {};
                      obj.serialNum = key;
                      if (Object.prototype.hasOwnProperty.call(error, key)) {
                        const element = error[key];
                        for (const key in element) {
                          if (Object.prototype.hasOwnProperty.call(element, key)) {
                            const elementInner = element[key];

                            obj.title = key;
                            obj.content = elementInner[0];
                            arr.push(obj);
                          }
                        }
                      }
                    }
                    errorTableData.value[elp.movement] = arr;
                    isErrorFlag.value[elp.movement] = true;

                    // elp.error="err"
                  } catch (error: any) {
                    ElMessage({
                      type: "error",
                      message: error,
                    });
                  }
                });
            }
          }
          copyLoading.value = false;
          isDisabled.value = false;
          emit("changeOperationLoading", false);
        }
      }
    };
    const deleteLoading: any = ref(false);

    const handleDeleteEvent = async () => {
      progress.value = 0;
      let rows = movementTable.value.getSelectionRows();

      ElMessageBox.confirm(
        "<p>選択したパラメータシートのパラメータを削除します。</p><p>よろしいですか？</p>",
        "削除",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "warning",
          customClass: "persdsd",
          dangerouslyUseHTMLString: true,
        }
      )
        .then(async () => {
          if (rows.length == 0) {
            ElMessage({
              type: "warning",
              message: "対象を選択してください。",
            });
          } else {
            emit("changeOperationLoading", true);
            deleteLoading.value = true;
            isDisabled.value = true;
            let loginOperation = store.getLoginOperation;

            for (const [index, elp] of rows.entries()) {
              progress.value = index + 1;

              let params2 = {
                discard: {
                  NORMAL: "0",
                },
                operation_name_disp: {
                  LIST: [loginOperation],
                },
              };

              let res2 = await optionName(params2, elp.value);
              let operationListData = res2.data.data;
              if (operationListData.length) {
                operationListData.forEach((el: any) => {
                  el.parameter.discard = 1;
                });
                await optionAllRegister(operationListData, elp.value)
                  .then(async () => {
                    let count = await getOperationCount(params2, elp.value);
                    elp.num = count.data.data;
                    elp.status = "未登録";

                    emit("changeSecond", movementTableData.value);
                    ElMessage({
                      type: "success",
                      message: "削除されました。",
                    });
                    errorTableData.value[elp.movement] = [{ title: "", content: "" }];
                    isErrorFlag.value[elp.movement] = false;
                  })
                  .catch((err: any) => {
                    let error = JSON.parse(err);
                    let arr = [];
                    for (const key in error) {
                      let obj: any = {};
                      obj.serialNum = key;
                      if (Object.prototype.hasOwnProperty.call(error, key)) {
                        const element = error[key];
                        for (const key in element) {
                          if (Object.prototype.hasOwnProperty.call(element, key)) {
                            const elementInner = element[key];

                            obj.title = key;
                            obj.content = elementInner[0];
                            arr.push(obj);
                          }
                        }
                      }
                    }

                    errorTableData.value[elp.movement] = arr;
                    isErrorFlag.value[elp.movement] = true;

                    // elp.error="err"
                    ElMessage({
                      type: "error",
                      message: err,
                    });
                  });
              } else {
              }
            }
            deleteLoading.value = false;
            isDisabled.value = false;
            emit("changeOperationLoading", false);
          }
        })
        .catch(() => {});
    };
    const changestatus = async (val: any) => {
      if (val) {
        let params2 = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            LIST: [loginOperation],
          },
        };

        let count = await getOperationCount(params2, val.value);

        movementTableData.value.forEach(async (el: any) => {
          if (el.movement == val.movementName) {
            if (count.data.data !== 0) {
              el.status = "登録済";
            } else {
              el.status = "未登録";
            }

            el.num = count.data.data;
          }
        });
        emit("changeSecond", movementTableData.value);
      }
    };
    const changestatusString = (val: any) => {
    };

    return {
      tableHeight,
      changestatus,
      changestatusString,
      activeName,
      changType,
      handleChangeMovement,
      movementTableData,
      movemenetColumns,
      openCopyDetail,
      movementName,
      change,
      isErrorFlag,
      dialogVisible,
      tooltipShow,
      closeTooltip,
      movementTable,
      getRowKeys,
      rowClass,
      rowClick,
      movement,
      operationOptions,
      operation,
      loginOperation,
      changeoperation,
      errorTableData,
      handleCopy,
      progress,
      total,
      handleDeleteEvent,
      deleteLoading,
      copyLoading,
      loadingShow,
      isDisabled,
      parametersheet,
    };
  },
});
</script>

<style scoped lang="less">
.progressBox {
  width: calc(100% - 55px);
  text-align: center;
  position: absolute;
  top: 59%;
  z-index: 2002;
}
.progressBoxAll {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 35%;
  z-index: 2002;
}

.errorTable {
  /deep/.el-table thead tr th {
    background-color: #bd3333 !important;
    color: #fff !important;
  }
}

.steps-fourth {
  height: 100%;
  margin-top: 23px;
  border-top: 2px solid #e4e0e0;

  p {
    color: #7f7f7f;
    font-size: 16px;

    span {
      display: block;
    }
  }

  h3 {
    margin: 0 !important;
  }
}

.originCopy {
  /deep/.el-select .el-input__wrapper {
    width: 300px !important;
  }
}

/deep/.el-select .el-input__wrapper {
  width: 300px !important;
}

.copyBtn {
  display: inline-block;
  margin: 112px 10px;

  .el-button--primary {
    background-color: #da6a38;
    color: #fff;
    border-color: #da6a38;
  }

  .el-button:hover,
  .el-button:active,
  .el-button:focus {
    background-color: #da6a38 !important;
    color: #fff;
    border-color: #da6a38;
  }
}

.btnBoxRight {
  margin: 15px 0 10px 0;

  button {
    font-size: 12px !important;
  }
}

.btnBox {
  margin: 15px 0 10px 0;

  button {
    font-size: 12px !important;
  }

  .el-button--primary {
    background-color: #418d45;
    color: #fff;
    border-color: #418d45;
  }

  .el-button:hover,
  .el-button:active,
  .el-button:focus {
    background-color: #418d45 !important;
    color: #fff;
    border-color: #418d45;
  }
}

.el-button--primary {
  background-color: #0960bd;
  color: #fff;
  border-color: #0960bd;
}

.el-button:hover,
.el-button:active,
.el-button:focus {
  background-color: #0960bd !important;
  color: #fff;
  border-color: #0960bd;
}

.decide {
  display: inline-block;
  margin-left: 10px;
}

.topBox {
  height: 162px;
}

.topCardBox {
  display: flex;
  align-items: end;
  justify-content: space-between;
}

.copyAll {
  background-color: #da6a38;
  border-color: #da6a38;
  width: 130px;

  &:hover {
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
    opacity: 0.8;
  }

  &:active,
  &:focus {
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }
}

#deleteAllBtn {
  display: inline-block;
  margin-left: 5px;

  .deleteAll {
    width: 130px;
    background-color: #0960bd;
    border-color: #0960bd;

    &:hover {
      background-color: #0960bd !important;
      border-color: #0960bd !important;
      opacity: 0.8;
    }

    &:active,
    &:focus {
      background-color: #0960bd !important;
      border-color: #0960bd !important;
    }
  }
}

.el-button[data-v-3506f615]:hover,
.el-button[data-v-3506f615]:active,
.el-button[data-v-3506f615]:focus {
  background-color: #da6a38 !important;
  border-color: #da6a38 !important;
}

.el-button[data-v-3506f615]:hover {
  opacity: 0.8;
}

/deep/.el-table__body tr.current-row > td.el-table__cell {
  color: #0960bd;
  background-color: #fff;
}

.notFinished {
  color: red;
  font-weight: bolder;
}

.finished {
  color: #0960bd;
}
</style>
<style lang="less">
.el-message-box {
  max-width: 440px !important;
}
.errorTable {
  .el-table .cell {
    height: auto !important;
    line-height: 26px !important;
  }
}
</style>
