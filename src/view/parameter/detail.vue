<template>
  <div class="navTitleBox">
    <p class="navNameBox" @click="toOperationList">
      <el-icon><ArrowLeft /></el-icon>&nbsp;<span> オペレーション一覧</span>
    </p>
    <p class="operationName">オペレーション名:{{ operationName }}</p>
  </div>

  <div class="header-box">
    <el-input
      v-model="keyWords1"
      style="width: 460px"
      placeholder="検索"
      class="searchBtn"
    >
      >
      <template #append><el-button @click="search">フィルタ</el-button></template>
    </el-input>
  </div>
  <div class="conductorParameterCon">
    <el-card shadow="never" class="cardBoxL">
      <h2 class="title">Conductor</h2>
      <el-radio-group v-model="conductor">
        <el-tooltip
          :content="item.label"
          placement="right"
          effect="light"
          v-for="item in radios"
          :key="item"
        >
          <el-radio
            @change="changeConductor"
            :label="item.value"
            :key="item.value"
            border
            :disabled="isDisabled"
          >
            {{ item.label }}
          </el-radio></el-tooltip
        >
      </el-radio-group>
    </el-card>

    <el-card shadow="never" class="cardBoxR">
      <h2 class="title">パラメータシート</h2>
      <p v-if="loading" class="progressBoxAll">{{ progress }} / {{ total }}</p>
      <el-table
        v-loading="loading"
        element-loading-text="loading..."
        :data="parameterData"
        border
        height="456"
        style="width: 100%"
      >
        <template v-for="(item, index) in columns" :key="index">
          <el-table-column v-if="item.dataIndex == 'action'" label="" :width="350">
            <template #default="scope">
              <el-button
                class="detailsBtnReference"
                style="margin-right: 16px"
                @click="referenceClick(scope.row)"
              >
                <el-icon> <Search /> </el-icon>&nbsp;パラメータ参照</el-button
              >

              <el-popconfirm
                width="300px"
                confirm-button-text="Json"
                cancel-button-text="Excel"
                icon-color="#626AEF"
                hide-after="0"
                title="ファイルタイプを選択してください。"
                @cancel="exportRight"
                @confirm="exportRightJson"
              >
                <template #reference>
                  <el-button
                    class="detailsBtnReference"
                    style="margin-right: 16px"
                    @click="downloadClick(scope.row)"
                    :disabled="isDisabledRight"
                  >
                    <el-icon> <Download /> </el-icon>&nbsp;ダウンロード</el-button
                  >
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <el-table-column
            v-else
            :label="item.title"
            :prop="item.dataIndex"
            :width="item.width"
          ></el-table-column>
        </template>
      </el-table>
    </el-card>
  </div>

  <div class="readBox">
    <ReadOnlySheet
      :dialogVisibleSheet="dialogVisibleSheet"
      :readOperation="operationName"
      @change="change"
      :readParams="paramsSheetValue"
    ></ReadOnlySheet>
  </div>
</template>

<script lang="ts">
import ReadOnlySheet from "./readOnlySheet.vue";
import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  watch,
  onBeforeUnmount,
} from "vue";
import { operationList } from "../../api/jobList";

import { ElMessage, ElTable } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import {
  getOperationCount,
  movementInfo,
  menuItem,
  restNameApi,
  optionName,
  exportExcelAPI,
  getradiosInfo,
  relationships,
} from "../../api/jobApi";
import { Download, ArrowLeft, Search } from "@element-plus/icons-vue";
interface Radio {
  label: string;
  value: string;
}
export default defineComponent({
  name: "Detail",
  props: ["operationName","isOperation"],
  emits: ["changeIsOperation"],
  components: {
    Search,
    Download,
    ArrowLeft,
    ReadOnlySheet,
  },

  setup(props, { emit }) {
    //  progress
    const progress = ref(0);
    const total = ref(0);
    const isDisabled = ref(false)
    const columns = reactive([
      {
        title: "パラメータシート名",
        dataIndex: "menuName",
      },

      {
        title: "",
        dataIndex: "action",
        width: 350,
      },
    ]);

    let operationName: any = ref(props.operationName);
    let isOperation:any = ref(props.isOperation)
    let conductor: any = ref("");
    let loading: any = ref(false);
    let radios: any = reactive([]);
    let parameterList: any = reactive([]);
    let parameterData: any = ref([]);
    let parameterDataCopy: any = ref([]);
    let dialogVisibleSheet = ref(false);
    let dialogVisibleEdit = ref(false);
    let paramsSheetValue = ref("");
    let paramsValue = ref("");
    let movementListByConductor = ref();

    const getConductor = () => {
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
    };
    getConductor();
    const relationshipsData = ref([]);
    // get Replication relationships
    const getRelationships = () => {
      relationships()
        .then((res: any) => {
          relationshipsData.value = res.data.data;
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    getRelationships();
    const changeConductor = (val: any) => {
      if (isFetching.value) {
        stopLoop.value = true;
        controller.abort();
        progress.value = 0;
      }
      loading.value = true;
      conductor.value = val;
      parameterData.value = [];
      parameterDataCopy.value = [];
      movementListByConductor.value = [];
      progress.value = 0;
      total.value = 0;
      if (conductor.value) {
        let params = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            LIST: [operationName.value],
          },
        };
        loading.value = true;
        stopLoop.value = false;
        isDisabled.value = true;
        setTimeout(async () => {
          await getMovement(conductor.value);
          isDisabled.value = false;
          await getInfo(params);
          loading.value = false;
        }, 1500);
      }
    };
    const getMovement = async (conductor: any) => {
      loading.value = true;
      let movementArray = await movementInfo(conductor);
      let data = movementArray.data.data;

      let movement: any = [];
      for (const key in data) {
        const element: any = data[key];
        if (Object.prototype.hasOwnProperty.call(element, "movement_id")) {
          let obj: any = { id: "", movement_id: "", movement_name: "" };
          obj.movement_id = element.movement_id;
          obj.movement_name = element.movement_name;
          obj.id = element.id;
          movement.push(obj);
        }
      }
      let keysSort: any = movement.sort(function (a: any, b: any) {
        return a.id.slice(5) - b.id.slice(5);
      });
      movementListByConductor.value = keysSort;
    };
    const checkPropertyInArray = (A: any, B: any) => {
      if (B.some((item: any) => item.parameter.movement === A)) {
        return true;
      } else {
        return false;
      }
    };
    const findIndexInArray = (property: any, B: any) => {
      for (let i = 0; i < B.length; i++) {
        if (B[i].parameter.movement === property) {
          return B[i];
        }
      }
      return -1;
    };
    const getInfo = async (params: any) => {
      loading.value = true;
      // to find dataSet
      let flag = checkPropertyInArray(
        movementListByConductor.value[0].movement_name,
        relationshipsData.value
      );
      parameterList.length = 0;

      if (flag) {
        // build
        try {
          progress.value = 0;
          total.value = movementListByConductor.value.length;
          // 性能：　パラメータ登録の時に、登録済みの入力件数を取得
          let input_data_movement: any = {};
          let input_data_menu_definition: any = {};
          let movement_names: any = [];
          let realMenuItems: any = [];

          let input_data_movement_build: any = {};
          let input_data_menu_definition_build: any = {};
          let movement_names_build: any = [];

          for (let index = 0; index < movementListByConductor.value.length; index++) {
            if (stopLoop.value) {
              return;
            }
            let el = movementListByConductor.value[index].movement_name;
            movement_names.push(el);
            movement_names_build.push(el)
            let dataSetEl = findIndexInArray(el, relationshipsData.value);
            if (dataSetEl != -1) {
              let realMenuItem = dataSetEl.parameter.source_parameter;
              input_data_movement[el] = realMenuItem;
              realMenuItems.push(realMenuItem);
            }
          };
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

          if (movement_names_build.length != 0) {
            try {
              let obj = {
                discard: {
                  NORMAL: 0,
                },
                movement: { LIST: movement_names_build },
              };
              let res = await menuItem(obj);
              let datas = res.data.data;
              if (datas.length != 0) {
                let realMenuItems_build: any = [];
                datas.forEach((element: any) => {
                  let menu = element.parameter.menu_group_menu_item;
                  // maybe  ID変換失敗
                  let realMenuItem_build = menu.substring(menu.indexOf(":") + 1, menu.lastIndexOf(":"));
                  input_data_movement_build[element.parameter.movement] = realMenuItem_build;
                  realMenuItems_build.push(realMenuItem_build);
                });
                if (realMenuItems_build.length != 0) {
                  realMenuItems_build = [...new Set(realMenuItems_build)];
                  let obj2 = {
                    discard: {
                      NORMAL: 0,
                    },
                    menu_name_en: { LIST: realMenuItems_build },
                  };
                  let res1 = await restNameApi(obj2);

                  let menu_definition_list_build = res1.data.data;
                  menu_definition_list_build.forEach((el: any) => {
                    let enNameValue = el.parameter.menu_name_en;
                    let restNameValue = el.parameter.menu_name_rest;
                    input_data_menu_definition_build[enNameValue] = { "enNameValue": enNameValue, "restNameValue": restNameValue };
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

          for (let index = 0; index < movementListByConductor.value.length; index++) {
            if (stopLoop.value) {
              return;
            } else {
              progress.value = index + 1;
              let el = movementListByConductor.value[index].movement_name;
              let dataSetEl = findIndexInArray(el, relationshipsData.value);

              if (dataSetEl != -1) {
                if (input_data_movement.length == 0 || input_data_menu_definition.length == 0) {
                  break;
                }
                let enNameValue_tmp = input_data_movement[el]
                if (input_data_menu_definition[enNameValue_tmp] == undefined) {
                  break;
                }
                let enNameValue = input_data_menu_definition[enNameValue_tmp]["enNameValue"];
                let restNameValue = input_data_menu_definition[enNameValue_tmp]["restNameValue"];

                let count = await getOperationCount(params, restNameValue);

                if (count.data.data) {
                  parameterList.push({ menuName: enNameValue, value: restNameValue });
                }
              }
              try {
                if (input_data_movement_build.length == 0 || input_data_menu_definition_build.length == 0) {
                  break;
                }
                let enNameValue_tmp = input_data_movement_build[el]
                if (input_data_menu_definition_build[enNameValue_tmp] == undefined) {
                  break;
                }
                let enNameValue_build = input_data_menu_definition_build[enNameValue_tmp]["enNameValue"];
                let restNameValue_build = input_data_menu_definition_build[enNameValue_tmp]["restNameValue"];
                let count_build = await getOperationCount(params, restNameValue_build);

                if (count_build.data.data) {
                  parameterList.push({
                    menuName: enNameValue_build,
                    value: restNameValue_build,
                  });
                }
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }

              // ****
            }
          }
        } catch (error) {}
      } else {
        try {
          progress.value = 0;
          total.value = movementListByConductor.value.length;
          // 性能：　パラメータ登録の時に、登録済みの入力件数を取得
          let input_data_movement: any = {};
          let input_data_menu_definition: any = {};
          let movement_names: any = [];
          for (let ind = 0; ind < movementListByConductor.value.length; ind++) {
            if (stopLoop.value) {
              return;
            }
            let el = movementListByConductor.value[ind];
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
          
          for (let index = 0; index < movementListByConductor.value.length; index++) {
            if (stopLoop.value) {
              return;
            } else {
              progress.value = index + 1;
              let el = movementListByConductor.value[index];
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
                let count = await getOperationCount(params, restNameValue);

                if (count.data.data) {
                  parameterList.push({ menuName: enNameValue, value: restNameValue });
                }
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }
            }
          }
        } catch (error) {}
      }

      parameterData.value = parameterList;
      parameterDataCopy.value = parameterList;
    };

    const change = (val: boolean) => {
      dialogVisibleSheet.value = val;
    };
    const changeEdit = (val: boolean) => {
      dialogVisibleEdit.value = val;
    };
    let isFetching = ref(false);
    let controller = new AbortController();
    watch(props, async (newValue, oldValue) => {
      operationName.value = newValue.operationName;
      isOperation.value = newValue.isOperation;
      loading.value = false;
    });
    onBeforeUnmount(() => {
      
    });

    const stopLoop = ref(false);

    const toOperationList = () => {
      if (isFetching.value) {
        controller.abort();
        isFetching.value = false;
        stopLoop.value = false;
      }
      stopLoop.value = true;
      
      conductor.value = "";
      parameterData.value = [];
      parameterDataCopy.value = [];
      keyWords1.value = "";
      emit("changeIsOperation", true);
      loading.value = false
      isDisabled.value = false;
    };
    const keyWords1 = ref<string>("");
    const search = async () => {
      if (keyWords1.value) {
        parameterData.value = [];
        let result = parameterDataCopy.value.filter((item: any) => {
          return item.menuName.indexOf(keyWords1.value) != -1;
        });
        parameterData.value = result;
      } else {
        parameterData.value = [];
        let params = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            NORMAL: operationName.value,
          },
        };
        parameterData.value = parameterDataCopy.value;
      }
    };
    const referenceClick = (row: any) => {
      paramsSheetValue.value = row.value;
      dialogVisibleSheet.value = true;
    };
    const downloadClick = (row: any) => {
      paramsSheetValue.value = row.value;
      paramsValue.value = row.menuName;
    };
    // isDisabledRight download
    let isDisabledRight = ref(false);
    function exportRightJson() {
      if (operationName.value) {
        let obj = {
          discard: { NORMAL: "0" },
          operation_name_disp: { LIST: [operationName.value] },
        };
        optionName(obj, paramsSheetValue.value).then(async (res: any) => {
          let code = res.data.data;
          downloadJson(paramsValue.value + "_" + operationName.value + ".json", code);
        });
      }
    }
    const downloadJson = (fileName: string, json: any) => {
      load();
      const jsonStr = json instanceof Object ? JSON.stringify(json, null, 4) : json;

      const url = window.URL || window.webkitURL || window;

      const blob = new Blob([jsonStr]);
      const saveLink = document.createElement("a");
      saveLink.href = url.createObjectURL(blob);
      saveLink.download = fileName;

      saveLink.click();

      URL.revokeObjectURL(saveLink.href);
      disload();
    };
    // export event
    async function exportRight() {
      if (operationName.value) {
        let obj = {
          discard: { NORMAL: "0" },
          operation_name_disp: { LIST: [operationName.value] },
        };
        await exportExcelAPI(obj, paramsSheetValue.value).then(async (res: any) => {
          let base64Code = res.data.data;
          dataURLtoDownload(
            base64Code,
            paramsValue.value + "_" + operationName.value + ".xlsx"
          );
        });
      }
    }
    // Export event
    function dataURLtoDownload(dataurl: any, name: string) {
      load();
      var bstr = atob(dataurl),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let blob = new Blob([u8arr]);
      let url = URL.createObjectURL(blob);
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";
      xhr.onload = function () {
        if (this.status === 200) {
          var blob = this.response;
          var a = document.createElement("a");
          a.download = name;
          a.href = URL.createObjectURL(blob);
          a.click();
          URL.revokeObjectURL(a.href);
        }
        disload();
      };
      xhr.send();
    }
    const disload = () => {
      isDisabledRight.value = false;
    };
    const load = () => {
      isDisabledRight.value = true;
      ElMessage({
        type: "info",
        message: "ダウンロードを開始しました。",
      });
    };
    return {
      isDisabledRight,
      keyWords1,
      columns,
      radios,
      parameterData,
      loading,
      operationName,
      dialogVisibleSheet,
      dialogVisibleEdit,
      referenceClick,
      downloadClick,
      change,
      changeConductor,
      conductor,
      changeEdit,
      paramsSheetValue,
      search,
      toOperationList,
      exportRight,
      exportRightJson,
      progress,
      total,
      isDisabled,
    };
  },
});
</script>

<style scoped lang="less">
.progressBoxAll {
  font-size: 16px;
  width: calc(100% - 55px);
  text-align: center;
  position: absolute;
  top: 35%;
  z-index: 2002;
}
.conductorParameterCon {
  display: flex;
  justify-content: space-between;

  text-align: center;
  .title {
    text-align: left;
    margin: 0 0 10px 0;
  }
  .cardBoxL {
    width: 260px;
    max-height: 500px;
    /deep/.el-card__body {
      height: 87%;
    }
    overflow-y: auto;
    padding-bottom: 20px;
    .el-radio-group {
      /deep/.el-radio.is-bordered.is-checked {
        background-color: #0960bd;
        color: #fff;
      }

      /deep/.el-radio__label {
        width: 148px;
        text-align: left;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /deep/.el-radio__input.is-checked + .el-radio__label {
        color: #fff;
      }

      .el-radio {
        font-size: 16px;
        margin-bottom: 10px;
        width: 180px;
        height: 44.8px;
        margin-right: 30px;
      }

      .el-radio:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .cardBoxR {
    flex: auto;
    margin-left: 20px;
    max-height: 570px;
    overflow: hidden;
    padding-bottom: 20px;
    position: relative;
  }
}
.navTitleBox {
  .navNameBox {
    cursor: pointer;
    display: flex;
    justify-content: start;
    align-items: center;
    margin-top: 0px;
    font-size: 14px;
  }
  p {
    font-size: 16px;
  }
  .operationName {
    word-wrap: break-word;
  }
}
.searchBtn {
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
}
.detailsBtnReference {
  border-color: #0960bd;
  background-color: #0960bd;
  color: #fff;
  padding: 2px 10px !important;
  height: auto;
  &:hover {
    background-color: #0960bd !important;
    border-color: #0960bd !important;
    color: #fff;
  }

  &:active,
  &:focus {
    background-color: #0960bd !important;
    border-color: #0960bd !important;
    color: #fff;
  }
}
</style>
<style lang="less">
.readBox {
  .el-dialog {
    --el-dialog-width: 90% !important;
    --el-dialog-margin-top: 8vh;
  }
}
.el-popconfirm .el-popconfirm__action {
  .el-button--small {
    background-color: #fff !important;
    color: #000;
    border: #626aef 1px solid;
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
.el-popconfirm {
  .el-popconfirm__action {
    .el-button + .el-button {
      margin-left: 12px !important;
    }
  }
}
</style>
