<template>
  <div class="steps-second">
    <p>参照対象パラメータシートにチェックを入れて、「つぎへ」を押してください。</p>
  </div>
  <div style="display: flex; justify-content: space-between;"> 
    <el-input
      v-model="keyWords"
      style="width: 460px"
      placeholder="パラメータシート名を入力"
      class="searchBtn"
    >
      <template #append><el-button @click="search">フィルタ</el-button></template>
    </el-input>
    <el-switch v-model="switchValue" @change="switchChange" size="large" inactive-text="チェックした項目だけを表示"
    style="--el-switch-on-color: #0960bd;" />
  </div>
  
    <el-table ref="sheetTable"
      v-loading="loadingShow"
      element-loading-text="loading..."
      :data="tableData"
      border
      :height="tableHeight"
      :row-style="rowClass"
      style="width: 100%;cursor: pointer"
      :row-key="getRowKeys"
      @selection-change="selectionChange"
      @row-click="rowClick"
      :row-height="27"
      :header-cell-class-name="cellClass">
      <el-table-column :selectable="isDisabled" type="selection" width="55" :reserve-selection="true" />
      <el-table-column
        v-for="(item, index) in parametersheet_columns"
        :prop="item.dataIndex"
        :label="item.title"
        :key="index"
      />
    </el-table>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, watch,onMounted } from "vue";
import { ElMessage, ElTable } from "element-plus";
import { restNameApi,movementInfo,menuItem,relationships, } from "../../api/jobApi"

export default defineComponent({
  name: "parameterSheetSelect",
  components: {ElTable},
  emits: ["selectedParamterInfos"],
  props: ["selectType","selectedMenuGroupType","prev"],
  setup(props, { emit }) {
    const selectionShow = ref(true);
    const switchValue = ref(false);
    const keyWords = ref<string>("");
    const sheetTable: any = ref(null);
    const loadingShow = ref(false);
    let tableHeight = ref();
    const tableData:any = reactive([]);
    const selectType = ref(props.selectType);
    const selectedMenuGroupType = ref(props.selectedMenuGroupType);
    let selectedSheet: any = reactive([]);
    const filterTableData: any = reactive([]);
    const parametersheet_columns = reactive([
      {
        title: "パラメータシート",
        dataIndex: "menu_name_ja",
      },
      {
        title: "カテゴリー",
        dataIndex: "description_ja",
      },
    ]);
    const relationshipsData = ref([]);
    const isDisabled = (row: any, index: number) => {
      return selectionShow.value;
    };
    const getParameterSheets = () => {
      loadingShow.value = true;
      tableData.length = 0;
      filterTableData.length = 0;
      selectedSheet.length = 0;
      keyWords.value = "";
      if (selectedMenuGroupType.value == "1") {
        const obj = {
            discard: {
              NORMAL: 0,
            },
            menu_group_for_input: { LIST: [selectType.value] },
          };
        restNameApi(obj).then((res: any) => {
          let resdata = res.data.data;
          resdata.sort(function (a: any, b: any) {
            if (a.parameter.display_order < b.parameter.display_order) {
              return -1;
            }
            if (a.parameter.display_order > b.parameter.display_order) {
              return 1;
            }
            return 0;
          });
          resdata.forEach((el: any) => {
            if (el.parameter.description_ja == null || el.parameter.description_ja == "") {
              el.parameter.description_ja = "基本設定";
            }
            tableData.push(el.parameter);
            filterTableData.push(el.parameter);
          });
          loadingShow.value = false;
        }).catch((error: any) => {
          loadingShow.value = false;
          ElMessage({
            type: "error",
            message: error,
          });
        });
      } else {
        movementInfo(selectType.value).then(async (res: any) => {
          await relationships()
            .then((res: any) => {
              relationshipsData.value = res.data.data;
            })
            .catch((error: any) => {
              ElMessage({
                type: "error",
                message: error,
              });
            });
          let movementConductor = res.data.data;
          let movement_names: any = [];
          let parameter_names: any = [];
          for (const key in movementConductor) {
            const element: any = movementConductor[key];
            if (Object.prototype.hasOwnProperty.call(element, "movement_id")) {
              let flag = checkPropertyInArrayForMovement(
                element.movement_name, relationshipsData.value
              );
              if (flag) {
                movement_names.push(element.movement_name);
              } else {
                let item:any = findIndexInArrayForMovement_gather(
                  element.movement_name, relationshipsData.value
                );
                if (item != -1 ) {
                  parameter_names.push(item.parameter.source_parameter)
                }
              }
            }
          }
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
                  realMenuItems.push(realMenuItem);
                });
                if (realMenuItems.length != 0) {
                }
                realMenuItems = [...new Set(realMenuItems)];
                let obj2 = {
                  discard: {
                    NORMAL: 0,
                  },
                  menu_name_en: { LIST: realMenuItems },
                };
                let res1 = await restNameApi(obj2);
                let res1data = res1.data.data;
                res1data.sort(function (a: any, b: any) {
                  if (a.parameter.display_order < b.parameter.display_order) {
                    return -1;
                  }
                  if (a.parameter.display_order > b.parameter.display_order) {
                    return 1;
                  }
                  return 0;
                });
                res1data.forEach((el: any) => {
                  if (el.parameter.description_ja == null || el.parameter.description_ja == "") {
                    el.parameter.description_ja = "基本設定";
                  }
                  tableData.push(el.parameter);
                  filterTableData.push(el.parameter);
                });
              }

              loadingShow.value = false;
            } catch (error: any) {
              ElMessage({
                type: "error",
                message: error,
              });
            }
          }
          if (parameter_names != 0) {
            try {
              let realMenuItems: any = [...new Set(parameter_names)];
              let obj2 = {
                discard: {
                  NORMAL: 0,
                },
                menu_name_en: { LIST: realMenuItems },
              };
              let res1 = await restNameApi(obj2);
              let res1data = res1.data.data;
              res1data.sort(function (a: any, b: any) {
                if (a.parameter.display_order < b.parameter.display_order) {
                  return -1;
                }
                if (a.parameter.display_order > b.parameter.display_order) {
                  return 1;
                }
                return 0;
              });
              res1data.forEach((el: any) => {
                if (el.parameter.description_ja == null || el.parameter.description_ja == "") {
                  el.parameter.description_ja = "基本設定";
                }
                tableData.push(el.parameter);
                filterTableData.push(el.parameter);
              });


              loadingShow.value = false;
            } catch (error: any) {
              ElMessage({
                type: "error",
                message: error,
              });
            }
          }
          loadingShow.value = false;
        });
      }
    }
    getParameterSheets();
    watch(props, async (val, old) => { 
      selectType.value = val.selectType;
      switchValue.value = false;
      selectionShow.value = true;
      selectedMenuGroupType.value = val.selectedMenuGroupType;
      sheetTable?.value.clearSelection();
      getParameterSheets();
    });

    onMounted(() => {
      tableHeight.value = window.innerHeight - 380;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 380;
      };
    });

    const getRowKeys = (row: any) => {
      return row.menu_name_rest;
    };

    const rowClass = ({ row }: any) => {
      if (selectedSheet.includes(row)) {
        return { color: "#0960bd" };
      }else {
        if (!selectionShow.value) {
          return { display: 'none' };
        }
      }
    };

    const selectionChange = (val: any) => {
      selectedSheet.length = 0;
      val.forEach((item: any) => {
        selectedSheet.push(item);
      });
      emit("selectedParamterInfos", selectedSheet);
    };

    const rowClick = (val: any) => {
      if (selectionShow.value == false) {
        return
      }
      // Whether the line that is clicked is in the selected array
      let resultFlag = selectedSheet.findIndex((item: any) => {
        return item.menu_name_rest == val.menu_name_rest;
      });
      if (resultFlag == -1) {
        sheetTable.value!.toggleRowSelection(val, true);
      } else {
        sheetTable.value!.toggleRowSelection(val, false);
      }
    };
    // search
    const search = () => {
      if (keyWords.value) {
        let result = filterTableData.filter((item: any) => {
          if (
            item.menu_name_ja.indexOf(keyWords.value) != -1 ||
            (item.description_ja != null && item.description_ja?.indexOf(keyWords.value) != -1)
          )
            return item;
        });
        tableData.length = 0;
        result.forEach((element: any) => {
          tableData.push(element);
        });
      } else {
        tableData.length = 0;
        filterTableData.forEach((el: any) => {
          tableData.push(el);
        });
      }
    };
    const switchChange = (val: boolean) => {
      keyWords.value = '';
      tableData.length = 0;
      filterTableData.forEach((el: any) => {
        tableData.push(el);
      });
      if (val == true) {
        selectionShow.value = false;
      } else {
        selectionShow.value = true;
      }
    }
    const cellClass = (row: any) => {
      if (row.columnIndex === 0 && selectionShow.value == false) {
        return "disnone";
      }
      return "";
    }

    const checkPropertyInArrayForMovement = (A: any, B: any) => {
      if (B.some((item: any) => item.parameter.movement === A)) {
        return true;
      } else {
        return false;
      }
    };

    const findIndexInArrayForMovement_gather = (property: any, B: any) => {
      for (let i = 0; i < B.length; i++) {
        if (B[i].parameter.movement_gather === property) {
          return B[i];
        }
      }
      return -1;
    };
    return { cellClass,isDisabled,switchChange,switchValue,keyWords, search,tableData,sheetTable,loadingShow,tableHeight,rowClass,getRowKeys,selectionChange,rowClick,parametersheet_columns};
  }
});
</script>

<style lang="less" scoped>
/deep/ .disnone .cell .el-checkbox__inner {
  display: none;
}
.steps-second {
  margin-top: 23px;
  border-top: 2px solid #e4e0e0;

  p {
    color: #7f7f7f;
    font-size: 16px;

    span {
      display: block;
    }
  }
}
.searchBtn {
  margin-bottom: 20px;

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
</style>
<style lang="less">
.el-switch__label {
  color: #0960bd;
}

.el-switch__label.is-active {
  color: #A8ABB2;
}
</style>