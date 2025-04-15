<template>
  <p style="color: #7f7f7f;font-size: 14px;">オペレーション名</p>
  <div class="header-box">
    <el-select ref="sel_ref" v-model="sel_Mod" placeholder="オペレーションを選択ください" style="width: 460px;" @change="slectChange"
      popper-class="selCss" :disabled="runDisabled" :teleported="false">
      <el-option v-for="item in def_operation_dt" :key="item.value" :label="item.label" :value="item.value" />
      <div class="selectDivider"><el-divider></el-divider></div>
      <div class="button-open">
        <el-button type="primary" @click="createdOperation" :disabled="runDisabled"><el-icon size="16px">
            <Plus />
          </el-icon>&nbsp;
          <span style="display: inline-block; margin-top: 2px">オペレーション登録</span></el-button>
      </div>
    </el-select>
    <div class="button-action">
      <el-button type="primary" @click="selViewOpen" :disabled="runDisabled"><el-icon size="16px">
          <Edit />
        </el-icon>&nbsp;
        <span style="display: inline-block; margin-top: 2px">パラメータシート選択</span></el-button>
    </div>
  </div>
  <el-table v-loading="loadingShow" element-loading-text="loading..." ref="operationTable" :data="operationTableData"
    border style="width: 100%" :row-key="getRowKeys" :row-height="27" height="655">
    <template v-for="(item, index) in movemenetColumns" :key="index">
      <el-table-column v-if="item.dataIndex === 'edit'" :label="item.title" width="100" align="center">
        <template #default="scope">
          <el-tooltip class="box-item" effect="light" content="編集" placement="left">
            <el-icon size="20px" color="#002B62" @click="openCopyDetail(scope.row)">
              <Edit style="cursor: pointer" />
            </el-icon>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column v-else-if="item.dataIndex === 'params'" :prop="item.dataIndex" :label="item.title">
        <template #default="scope"><span>{{
          scope.row.params
        }}</span></template>
      </el-table-column>

      <el-table-column width="180" v-else-if="item.dataIndex === 'status'" :prop="item.dataIndex" :label="item.title">
        <template #default="scope"><span :class="scope.row.status == '未登録' ? 'notFinished' : 'finished'">{{
          scope.row.status
        }}</span></template>
      </el-table-column>
      <el-table-column width="180" v-else-if="item.dataIndex === 'num'" :prop="item.dataIndex" :label="item.title">
        <template #default="scope"><span :class="scope.row.num == '0' ? 'notFinished' : 'finished'">{{
          scope.row.num
        }}</span></template>
      </el-table-column>
      <el-table-column v-else-if="item.dataIndex != 'copy'" :prop="item.dataIndex" :label="item.title"
        :width="item.dataIndex == 'num' ? 180 : ''" />
    </template>
  </el-table>
  <p v-if="loadingShow" class="progressBox">{{ progress }} / {{ total }}</p>
  <DialogDetail :dialogVisible="dialogVisible" @change="change" @changestatus="changestatus"
    :parametersheet="parametersheet" :loginOperation="loginOperation"
    :logOperationScheduledDate="logOperationScheduledDate" :parametersheetName="parametersheetName"
    :operationInfos="operationInfos" />
  <el-dialog v-model="createOpDialogShow" title="オペレーション登録" width="600" align-center @close="cancel(ruleFormRef)"
    destroy-on-close :close-on-click-modal="false" :close-on-press-escape="false" class="defDgClass">
    <el-card shadow="always">
      <el-form ref="ruleFormRef" :model="form" :rules="rules" label-width="auto" label-position="top">
        <el-form-item label="オペレーション名" prop="newOpName">
          <el-input v-model="form.newOpName" placeholder="オペレーション名を入力" />
        </el-form-item>
        <div class="date-picker"><el-form-item label="予定実行日時（現在時刻が自動的に設定されます）" prop="scheduledRunDate">
            <el-input v-model="form.scheduledRunDate" type="datetime" format="YYYY/MM/DD HH:mm:ss" style="width: 100%;"
              disabled />
          </el-form-item></div>
      </el-form>
    </el-card>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel(ruleFormRef)">キャンセル</el-button>
        <el-button type="primary" @click="confirm(ruleFormRef)" :disabled="logondisabled">登 録</el-button>
      </span>
    </template>
  </el-dialog>
  <!--   -->
  <el-dialog v-model="selectOpDialogShow" title="パラメータシート選択" width="70%" align-center @close="cancelselectPmDialog()"
    destroy-on-close :close-on-click-modal="false" :close-on-press-escape="false" class="defDgClass" style="min-width: 1350px !important;">
    <div class="dialog-content">
      <el-transfer v-model="transferRightValue" filterable :filter-method="filterMethod" filter-placeholder="パラメータシート名"
        :data="transferdata" :titles="transfertitles" />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelselectPmDialog">キャンセル</el-button>
        <el-button type="primary" @click="confirmSelectedPm" :disabled="runDisabled" :loading="runDisabled">保
          存</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, nextTick} from "vue";
import { ElMessage, ElTable, ElButton, ElCard, ElForm, ElFormItem, ElInput, } from "element-plus";
import type { FormInstance, FormRules, } from "element-plus";
import { Edit, Plus } from "@element-plus/icons-vue";
import { getDefOperationDataSetInfos, getDefOperationInfos, getMenudefinitionlist, optionAllRegister, getOperationCount, optionName } from "../../api/operationmanagementApi";
import DialogDetail from "./operationCopyDetail.vue";
interface Option {
  key: number
  label: string,
  menu_name_rest: string,
  uuid: string,
  operation_id: string
}

interface SelDataType {
  value: any,
  label: any,
  last_run_date: any
};

type movListType = {
  params: string;
  value: string;
  status: string;
  num: number;
};

export default defineComponent({
  components: {
    Edit,
    Plus, ElTable, ElButton, ElCard, ElForm, ElFormItem, ElInput, DialogDetail
  },
  setup() {
    //  progress
    const progress = ref(0);
    const total = ref(0);

    const sel_ref : any = ref(null)
    const dialogVisible = ref(false);
    const parametersheet: any = reactive([]);
    const runDisabled = ref(false);
    const logondisabled = ref(false);
    const logOperationScheduledDate: any = ref();
    const loginOperation: any = ref();
    const parametersheetName: any = ref("");
    const operationInfos: any = ref([]);

    const loadingShow = ref(false);
    const operationTable: any = ref(null);
    const operationTableData: any = ref([]);

    const selectOpDialogShow = ref(false);
    const transferRightValue: any = ref([]);
    const transfertitles = ref(['一覧', '選択済み'])
    const transferdata = ref<Option[]>()
    const initRightValue: any = ref([]);
    const op_id: any = ref();

    const sel_Mod = ref('');
    const def_operation_dt = ref<SelDataType[]>([{ value: "", label: "", last_run_date: "" }]);
    const createOpDialogShow = ref(false);
    const ruleFormRef = ref<FormInstance>()
    const movemenetColumns = reactive([
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
    const changestatus = async (val: any) => {
      if (val) {
        let params2 = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            LIST: [loginOperation.value],
          },
        };

        let count = await getOperationCount(params2, val.value);

        operationTableData.value.forEach(async (el: any) => {
          if (el.params == val.parametersheetName) {
            if (count.data.data !== 0) {
              el.status = "登録済";
            } else {
              el.status = "未登録";
            }

            el.num = count.data.data;
          }
        });
      }
    };
    const openCopyDetail = (row: any) => {
      dialogVisible.value = true;
      parametersheetName.value = row.params;
    };
    const change = (val: boolean) => {
      dialogVisible.value = val;
    };
    const slectChange = (value: any) => {
      let sel_opt = def_operation_dt.value.find((item) => {
        return item.value == value;
      });
      loginOperation.value = sel_opt?.label
      logOperationScheduledDate.value = sel_opt?.last_run_date
      getMenuItem(value);
    }
    const getMenuItem = async (operation_id: any) => {
      operationTableData.value.length = 0;
      parametersheet.length = 0;
      total.value = 0;
      progress.value = 0;
      loadingShow.value = true;
      runDisabled.value = true;
      await getMenudefinitionlist().then(async (res: any) => {
        let resdata_old = res.data.data;
        let parameter_uuids: any[] = [];
        if (resdata_old.length != 0) {
         let resdata = resdata_old.sort(function (a: any, b: any) {
            if (a.parameter.menu_name_rest < b.parameter.menu_name_rest) {
              return -1;
            }
            if (a.parameter.menu_name_rest > b.parameter.menu_name_rest) {
              return 1;
            }
            return 0;
          });
          let data = {
            discard: {
              NORMAL: "0",
            },
            Operation: {
              LIST: [operation_id],
            }
          };
          await getDefOperationDataSetInfos(data).then(async (res_op: any) => {
            let data_res = res_op.data.data;
            if (data_res.length != 0) {
              if (data_res[0].parameter.Movement != null && data_res[0].parameter.Movement != "") {
                parameter_uuids = data_res[0].parameter.Movement.split(",");
                total.value = parameter_uuids.length;
              }
            }
            if (parameter_uuids.length == 0) {
              loadingShow.value = false;
              return;
            } else {
              try {
                let handleEnd_uuids:any = [];
                for (let index = 0; index < parameter_uuids.length; index++) {
                  let obj3: movListType = {
                    params: "",
                    value: "",
                    status: "",
                    num: 0,
                  };
                  let sel_opt = def_operation_dt.value.find((item) => {
                    return item.value == operation_id;
                  });
                  let params2 = {
                    discard: {
                      NORMAL: "0",
                    },
                    operation_name_disp: {
                      LIST: [sel_opt?.label],
                    },
                  };

                  for (let index_resdata = 0; index_resdata < resdata.length; index_resdata++) {
                    const el = resdata[index_resdata];
                    let parameter = el.parameter;
                    if (parameter_uuids.indexOf(parameter.uuid) != -1 && handleEnd_uuids.indexOf(parameter.uuid) == -1) {
                      let count = await getOperationCount(params2, parameter.menu_name_rest);
                      progress.value = index + 1;
                      if (count.data.data !== 0) {
                        obj3.num = count.data.data;
                        obj3.status = "登録済";
                      } else {
                        obj3.num = 0;
                        obj3.status = "未登録";
                      }
                      obj3.params = parameter.menu_name_en;
                      operationTableData.value[index] = obj3;
                      let parametersheet_obj = {
                        value: parameter.menu_name_en,
                        label: parameter.menu_name_en,
                      }
                      parametersheet.push(parametersheet_obj)
                      handleEnd_uuids.push(parameter.uuid)
                      break;
                    }
                  }
                }
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }
            }
          }).catch(error => {
            ElMessage({
              type: "error",
              message: error,
            });
          });
        }
      }).catch(error => {
        ElMessage({
          type: "error",
          message: error,
        });
      });
      runDisabled.value = false;
      loadingShow.value = false;


    };
    const setSelectOperation = async () => {
      const data = {
        discard: {
          NORMAL: "0",
        },
        "Flag": {
          "NORMAL": '1'
        }
      };
      await getDefOperationDataSetInfos(data).then(async (res: any) => {
        def_operation_dt.value.length = 0;
        let data = res.data.data;
        if (data.length != 0) {
          let defOperationIds: any[] = [];
          data.forEach((element: any) => {
            defOperationIds.push(element.parameter.Operation);
          });
          const senddata = {
            discard: {
              NORMAL: "0",
            },
            operation_id: {
              LIST: defOperationIds,
            }
          };
          await getDefOperationInfos(senddata).then((resOp: any) => {
            let data_op = resOp.data.data;
            if (data_op.length != 0) {
              data_op.forEach((element: any) => {
                operationInfos.value.push(element.parameter.operation_name);
                def_operation_dt.value.push({
                  value: element.parameter.operation_id,
                  label: element.parameter.operation_name,
                  last_run_date: element.parameter.scheduled_date_for_execution
                });
              });
            }
          }).catch((error: any) => {
            def_operation_dt.value.push({ value: "", label: "", last_run_date: "" });
            ElMessage({
              type: "error",
              message: error,
            });
          });
        }
        else {
          def_operation_dt.value.push({ value: "", label: "", last_run_date: "" });
        }
      }).catch((error: any) => {
        def_operation_dt.value.push({ value: "", label: "", last_run_date: "" });
        ElMessage({
          type: "error",
          message: error,
        });
      });
    }
    setSelectOperation();
    const filterMethod = (query: any, item: any) => {
      return item.label.toLowerCase().includes(query.toLowerCase())
    }
    const generateData = async (operation_id: any) => {
      op_id.value = '';
      let data: Option[] = []
      let states: string[] = []
      let menu_name_rest: string[] = []
      let uuids: string[] = []
      let rightDat_index: number[] = []
      let parameter_uuids: any[] = [];
      await getMenudefinitionlist().then(async (res: any) => {
        let resdata_old = res.data.data;
        if (resdata_old.length != 0) {
         let resdata = resdata_old.sort(function (a: any, b: any) {
            if (a.parameter.menu_name_rest < b.parameter.menu_name_rest) {
              return -1;
            }
            if (a.parameter.menu_name_rest > b.parameter.menu_name_rest) {
              return 1;
            }
            return 0;
          });

          let data = {
            discard: {
              NORMAL: "0",
            },
            Operation: {
              NORMAL: operation_id,
            }
          };
          await getDefOperationDataSetInfos(data).then(async (res_op: any) => {
            let data_res = res_op.data.data;
            if (data_res.length != 0) {
              if (data_res[0].parameter.Movement != null && data_res[0].parameter.Movement != "")
                parameter_uuids = data_res[0].parameter.Movement.split(",");
            }
          });
          resdata.forEach((el: any) => {
            let parameter = el.parameter;
            states.push(parameter.menu_name_en);
            menu_name_rest.push(parameter.menu_name_rest)
            uuids.push(parameter.uuid);
          });
        }
      }).catch((error: any) => {
        selectOpDialogShow.value = false;
        ElMessage({
          type: "error",
          message: error,
        });
        return;
      });
      states.forEach((parametersheet, index) => {
        if (parameter_uuids.indexOf(uuids[index]) != -1) {
          rightDat_index.push(index);
        }
        data.push({
          label: parametersheet,
          key: index,
          menu_name_rest: menu_name_rest[index],
          uuid: uuids[index],
          operation_id: operation_id
        })
      })
      transferRightValue.value = rightDat_index;
      initRightValue.value = rightDat_index;
      transferdata.value = data;
      op_id.value = operation_id;
      selectOpDialogShow.value = true;
    }
    const getRowKeys = (row: any) => {
      return row.params;
    };
    const form = reactive({
      newOpName: null,
      scheduledRunDate: '',
    })
    const rules = reactive<FormRules>({
      newOpName: [{ required: true, message: "オペレーション名を入力してください。", trigger: "blur" }],
      scheduledRunDate: [{ required: false, message: "実施予定時間を設定してください。", trigger: "blur" }],
    });
    const confirm = (formEl: FormInstance | undefined) => {
      if (!formEl) return
      formEl.validate((valid) => {
        if (valid) {
          logondisabled.value = true;
          let data = [{
            "parameter": {
              "discard": "0",
              "operation_id": null,
              "operation_name": form.newOpName,
              "scheduled_date_for_execution": form.scheduledRunDate
            },
            "type": "Register"
          }]
          optionAllRegister(data, "operation_list").then(async (res: any) => {
            const senddata = {
              discard: {
                NORMAL: "0",
              },
              operation_name: {LIST:
                [form.newOpName]
              }
            };
            await getDefOperationInfos(senddata).then(async (resinfo: any) => {
              let operation_id = resinfo.data.data[0].parameter.operation_id;
              let sdata = [{
                "parameter": {
                  "discard": "0",
                  "Operation": operation_id,
                  "Flag": "1"
                },
                "type": "Register"
              }]
              await optionAllRegister(sdata, "OperationDataSet").then(async (res: any) => {
                await setSelectOperation();
                ElMessage({
                  type: "success",
                  message: `オペレーションの登録が成功しました。`,
                });
                logondisabled.value = false;
                createOpDialogShow.value = false;
                sel_Mod.value = operation_id;
                await nextTick();
                slectChange(sel_Mod.value);
              }).catch((error: any) => {
                logondisabled.value = false;
                ElMessage({
                  type: "error",
                  message: error,
                });
              });
            });
          }).catch((error: any) => {
            logondisabled.value = false;
            ElMessage({
              type: "error",
              message: error,
            });
          });
        }
      })
    }

    const cancel = (formEl: FormInstance | undefined) => {
      if (!formEl) return
      formEl.resetFields();
      createOpDialogShow.value = false;
    }

    const confirmSelectedPm = async () => {
      isSaveButtonclick = true;
      runDisabled.value = true;
      let uuids: string = '';
      let operation_id: string = op_id.value;
      let deletePmSheetListIndex: any[] = initRightValue.value.filter((item: any) => !transferRightValue.value.includes(item));
      let deletePmSheetList: any[] = []
      transferdata.value?.forEach((element: any) => {
        transferRightValue.value.forEach((el: any) => {
          if (el == element.key) {
            operation_id = element.operation_id
            if (uuids != '') {
              uuids += ','
            }
            uuids = uuids + element.uuid
          }
        });
        for (let index = 0; index < deletePmSheetListIndex.length; index++) {
          let key = deletePmSheetListIndex[index];
          if (element.key == key) {
            deletePmSheetList.push(element)
          }
        }
      });

      let data = {
        discard: {
          NORMAL: "0",
        },
        Operation: {
          NORMAL: operation_id,
        }
      };
      await getDefOperationDataSetInfos(data).then(async (res: any) => {
        let data_res = res.data.data;
        if (data_res.length == 0) {
          ElMessage({
            type: "error",
            message: `選択したオペレーションは存在しません。`,
          });
          runDisabled.value = false;
          return;
        }
        let up_data = [{
          "parameter": {
            "discard": "0",
            "uuid": data_res[0].parameter.uuid,
            "Operation": operation_id,
            "Movement": uuids,
            last_update_date_time: data_res[0].parameter.last_update_date_time,
          },
          "type": "Update"
        }]
        await optionAllRegister(up_data, "OperationDataSet").then(async (rs: any) => {
          for (let index = 0; index < deletePmSheetList.length; index++) {
            let element = deletePmSheetList[index];
            let data2 = {
              discard: {
                NORMAL: "0",
              },
              operation_name_disp: {
                LIST: [loginOperation.value],
              },
            };
            await optionName(data2, element.menu_name_rest).then(async (res2: any) => {
              let operationListData = res2.data.data;
              if (operationListData.length) {
                operationListData.forEach((el: any) => {
                  el.parameter.discard = 1;
                });
                await optionAllRegister(operationListData, element.menu_name_rest).catch((error: any) => {
                  ElMessage({
                    type: "error",
                    message: error,
                  });
                  runDisabled.value = false;
                  return;
                });
              }
            }).catch((error: any) => {
              ElMessage({
                type: "error",
                message: error,
              });
              runDisabled.value = false;
              return;
            });
          }
          initRightValue.value = transferRightValue.value;
          ElMessage({
            type: "success",
            message: `パラメータシートが保存されました。`,
          });
          runDisabled.value = false;
        }).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
          runDisabled.value = false;
          return;
        });
      });
    }
    const selViewOpen = () => {
      let val = sel_Mod.value;
      if (val == '' || val == null) {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
        return;
      }
      generateData(val);
    };
    var isSaveButtonclick = false;
    const cancelselectPmDialog = () => {

      transferdata.value = [];
      selectOpDialogShow.value = false;
      if (isSaveButtonclick) {
        getMenuItem(op_id.value);
      }
      transferRightValue.value.length = 0;
      isSaveButtonclick = false;
    }
    const createdOperation = () => {
      form.scheduledRunDate = getNowTime()
      createOpDialogShow.value = true;
    };
    // 現在の時刻を取得します。
    const getNowTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
      const date = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
      const hour = now.getHours() >= 10 ? now.getHours() : `0${now.getHours()}`;
      const minutes = now.getMinutes() >= 10 ? now.getMinutes() : `0${now.getMinutes()}`;
      const seconds = now.getSeconds() >= 10 ? now.getSeconds() : `0${now.getSeconds()}`;
      return `${year}/${month}/${date} ${hour}:${minutes}:${seconds}`;
    };

    return {
      sel_Mod,
      def_operation_dt,
      createOpDialogShow,
      ruleFormRef,
      form,
      rules,
      loadingShow,
      operationTable,
      operationTableData,
      movemenetColumns,
      selectOpDialogShow,
      getRowKeys,
      selViewOpen,
      createdOperation,
      confirm,
      cancel,
      confirmSelectedPm,
      cancelselectPmDialog,
      generateData,
      transferRightValue,
      transferdata,
      filterMethod,
      transfertitles,
      slectChange,
      progress,
      total,
      runDisabled,
      dialogVisible,
      change,
      parametersheet,
      openCopyDetail,
      changestatus,
      logOperationScheduledDate,
      loginOperation,
      parametersheetName,
      operationInfos,
      sel_ref,
      logondisabled
    }
  },
});
</script>
<style scoped lang="less">
.progressBox {
  width: calc(100% - 55px);
  text-align: center;
  position: absolute;
  top: 40%;
  z-index: 2002;
  font-size: 16px;
  color: #7f7f7f;
}

/deep/.el-select-dropdown__wrap {
  max-height: 600px !important;
}

.dialog-content {
  display: flex;
  justify-content: center;
  align-items: center;
 

  /deep/.el-transfer-panel {
    width: 500px;
  }
  /deep/ .el-transfer-panel__body {
    height: 510px;
  }

  /deep/ button {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    border-radius: 0;

    &:hover {
      color: #fff;
      border-color: #da6a38;
      background-color: #da6a38;
      border-radius: 0;
      opacity: 0.8;
    }
  }

  /deep/.el-checkbox {
    --el-checkbox-checked-text-color: #0960bd;
    ;
    --el-checkbox-checked-input-border-color: #0960bd;
    ;
    --el-checkbox-checked-bg-color: #0960bd;
    ;
    --el-checkbox-input-border-color-hover: #0960bd;
    ;
    -el-checkbox-checked-icon-color: var(--el-color-white);

    .el-checkbox__label {
      &:hover {
        color: #0960bd;
      }
    }

  }

  /deep/.el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #0960bd !important;
    border-color: #0960bd !important;
  }

}

.date-picker {
  /deep/.el-input__wrapper {
    width: -webkit-fill-available;
  }
}

.selectDivider {
  .el-divider--horizontal {
    margin: 0;
  }
}

.button-open {
  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;
    width: 460px;
    margin-top: 5px;
    margin-left: 10px;
    margin-right: 10px;
    border-radius: 0%;
  }

  .el-button:hover,
  .el-button:active,
  .el-button:focus {
    background-color: #0960bd !important;
    color: #fff;
    border-color: #0960bd;
  }

  .el-button:hover {
    opacity: 0.8;
  }
}

.dialog-footer {
  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;

    &:hover,
    &:active,
    &:focus {
      background-color: #0960bd !important;
      color: #fff;
      border-color: #0960bd;
    }

    &:hover {
      opacity: 0.8;
    }
  }
}

.button-action {
  width: 475px;
  display: flex;
  justify-content: right;

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

  .el-button:hover {
    opacity: 0.8;
  }
}

.top_view {
  display: flex;
  justify-content: space-between;
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
.el-table tbody tr .el-table__cell {
  padding: 0px 0 !important;
}

.el-table .el-table__cell {
  padding: 0px 0 !important;
}

.el-table .cell {
  line-height: 27px !important;
}

.header-box {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
}

.defDgClass {
  .dialog-footer {
    button {
      margin-right: 10px;
    }
  }

  .el-dialog__body {
    overflow-x: auto !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }

  .el-dialog__header {
    padding: 8px 20px;
  }

  .el-dialog__headerbtn {
    top: -4px;
  }
}
</style>