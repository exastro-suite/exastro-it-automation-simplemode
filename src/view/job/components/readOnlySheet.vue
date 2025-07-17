<template>
  <el-dialog :close-on-click-modal="false" :close-on-press-escape="false" v-model="visible" @close="cancel"
    class="readOnlyBoxSheet" @open="opened" :show-close="false">
    <el-popconfirm width="300px" confirm-button-text="Json" cancel-button-text="Excel" icon-color="#626AEF"
      hide-after="0" title="ファイルタイプを選択してください。" @cancel="exportRight" @confirm="exportRightJson">
      <template #reference>
        <el-button type="primary" class="loadbtn"><el-icon>
            <Download />
          </el-icon>&nbsp;
          ダウンロード</el-button>
      </template>
    </el-popconfirm>
    <template #footer>
      <el-button id="footerBtn1" type="primary" @click="cancel">閉じる</el-button>
    </template>
    <div v-loading="loadingDialog">
      <div ref="spreadsheet" style="min-height: 100px; min-width: 100%"></div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, onMounted, onBeforeUnmount } from "vue";
import jSpreadSheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

import { ElDialog, ElMessage, arrowMiddleware } from "element-plus";
import { optionName, sheetColumnList } from "../../../api/jobApi";
import {
  Download,
} from "@element-plus/icons-vue";
import { eventBus } from "../../../store/eventBus";
export default defineComponent({
  name: "readOnlySheet",
  props: ["dialogVisibleSheet", "readOperation", "readParams", "movementName","isInitOperation"],
  emits: ["change"],
  components: {
    ElDialog,
    Download,
  },
  setup(props, { emit }) {
    const bus = eventBus();
    let data: any = reactive([]);
    let filePosition = ref(null);
    let nestedHeaders: any = reactive([]);
    let jspreadsheetObj: any = ref();
    let headertoolMapping: any = reactive({});
    // loading ce sheet
    // column
    let loadingFlag: any = ref("");
    // data
    let loadingFlag1: any = ref("");

    let visible: any = ref(props.dialogVisibleSheet);
    let parameter = ref(props.readParams);
    let operation = ref(props.readOperation);
    let movement = ref(props.movementName);
    let isInitOperation = ref(props.isInitOperation);
    const spreadsheet: any = ref(null);
    let sheetWidth: any = ref("");
    onMounted(() => {
      (window as any).downloadFileByJob = downloadFileByJob;

      sheetWidth.value = window.innerWidth * 0.86 + "px";
      let container: any = document.getElementsByClassName("jexcel_content");
      if (container[0]) {
        container[0].style.width = sheetWidth.value;
      }
      window.onresize = () => {
        sheetWidth.value = window.innerWidth * 0.86 + "px";
        let container: any = document.getElementsByClassName("jexcel_content");
        if (container[0]) {
          container[0].style.width = sheetWidth.value;
        }
      };
    });
    const updateTable = (
      instance: any,
      cell: any,
      col: any,
      row: any,
      val: any,
      id: any
    ) => {
      let container: any = document.getElementsByClassName("jexcel_content");

      if (container[0]) {
        container[0].style.width = sheetWidth.value;
        container[0].style.maxHeight = "600px";
      }

      if (filePosition.value) {
        if (col === Number(filePosition.value) - 7) {
          cell.innerHTML =
            '<a href="#" onclick="downloadFileByJob(' + row + ')">' + val + "</a>";
        }
      }

      cell.style.textAlign = "left";
      // パラメータシート画面でパラメータのツールチップを追加
      let columnHeaders: any = document.querySelectorAll('[data-x]');
      if (columnHeaders.length != 0) {
        for (let i = 0; i < columnHeaders.length; i++) {
          let columnHeader = columnHeaders[i].getAttribute('title');
          if (columnHeader != null && columnHeader != undefined && columnHeader != '' && headertoolMapping.length != 0) {
            let text: any = columnHeaders[i].innerText;
            if (Object.prototype.hasOwnProperty.call(headertoolMapping, text)) {
              columnHeaders[i].setAttribute('title', headertoolMapping[text])
            }
          }
        }
      }
    };
    // ダウンロードファイル
    const downloadFileByJob = (rowNums: any) => {
      const link = document.createElement("a");
      let rowData = jspreadsheetObj.getJsonRow(rowNums);
      var bstr = atob(rowData["parameter.fileBase"]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let blob = new Blob([u8arr]);
      link.style.display = "none";
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", rowData["parameter.file"]);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    let columns: any = reactive([]);
    let operationColumn: any = reactive([]);
    let adminColumn: any = reactive([]);
    let parameterColumn: any = reactive([]);
    let getJsonData = async (parameter: string, operation: string) => {
      loadingFlag1.value = true;
      try {
        const params1 = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            LIST: [operation],
          },
        };
        optionName(params1, parameter).then((res: any) => {
          let dataJson = res.data.data;
          if (dataJson.length == 0) {
            data.push([]);
          } else {
            data.length = 0;
            dataJson.forEach((element: any) => {
              element.parameter.last_update_date_time = element.parameter.last_update_date_time.substring(
                0,
                element.parameter.last_update_date_time.length - 7
              );
              let obj: any = {};
              let eln = flattenJson(element);

              for (const key in eln) {
                if (Object.prototype.hasOwnProperty.call(eln, key)) {
                  const n1 = eln[key];
                  let n = columns.findIndex((element: any) => {
                    return element.name == key;
                  });

                  if (n != -1) {
                    obj[key] = n1;
                  }
                }
              }
              if (eln["file.file"]) {
                obj["parameter.fileBase"] = eln["file.file"];
              }
              obj["parameter.discard"] = "-";
              data.push(obj);
            });
          }

          if (dataJson.length == 0) {
            if (data.length == dataJson.length + 1) {
              loadingFlag1.value = false;
            }
          } else {
            if (data.length == dataJson.length) {
              loadingFlag1.value = false;
            }
          }
        });
      } catch (error: any) {
        ElMessage({
          type: "error",
          message: error,
        });
      }
    };
    watch(props, async (val, old) => {
      visible.value = val.dialogVisibleSheet;
      parameter.value = val.readParams;
      operation.value = val.readOperation;
      movement.value = val.movementName;
      isInitOperation.value = val.isInitOperation;
      if (operation.value) {
        await getColumns(parameter.value);
        await getJsonData(parameter.value, operation.value);
      }
    });
    watch(visible, (val, old) => {
      emit("change", visible.value);
    });
    let arr: any = [];
    let loadingDialog = ref(false);
    const opened = () => {
      filePosition.value = null;
      createSheet();
      loadingDialog.value = true;
      arr = [];
      Object.assign(nestedHeaders, arr);
      let time1 = setInterval(() => {
        if (loadingFlag.value == false) {
          clearInterval(time1);
          let timer2 = setInterval(() => {
            if (loadingFlag1.value == false) {
              clearInterval(timer2);
              jspreadsheetObj.setData(JSON.stringify(jspreadsheetsort(data)));
              
              jspreadsheetObj.refresh();
              loadingDialog.value = false;
            }
          }, 1000);
        }
      }, 1000);
    };

    // ソート処理
    const jspreadsheetsort = (data: any) => {
      data.sort((a: any, b: any) => {
        if (a['parameter.input_order'] != undefined &&
          b['parameter.input_order'] != undefined && a['parameter.input_order'] != b['parameter.input_order']) {
          return Number(a['parameter.input_order']) - Number(b['parameter.input_order']);
        }
        if (a['parameter.host_name'] != undefined &&
          b['parameter.host_name'] != undefined
          && a['parameter.host_name'] < b['parameter.host_name']) {
          return -1
        }
        if (a['parameter.host_name'] != undefined &&
          b['parameter.host_name'] != undefined
          && a['parameter.host_name'] > b['parameter.host_name']) {
          return 1
        }
        return 0;
      });
      return data;
    }

    const createSheet = () => {
      //インスタンス化
      jspreadsheetObj = jSpreadSheet(
        //DOM参照
        spreadsheet.value,
        //表の設定データ
        jSpreadSheetOptions
      );
    };
    // The first four of the first row
    const headerFirstRow = {
      title: "パラメータ",
      colspan: "",
    };
    //ホスト名
    const headerFirst = [
      {
        title: "",
        colspan: "1",
      },
    ];

    const headerOperationGroup = {
      title: "オペレーション",
      colspan: "4",
    };

    // operation  group1 Four
    // オペレーション名 // // //最終実行日時
    const headerSecond = [
      {
        title: "",
        colspan: "1",
      },
      {
        title: "",
        colspan: "1",
      },
      {
        title: "",
        colspan: "1",
      },
      {
        title: "",
        colspan: "1",
      },
    ];
    // 備考 //最終更新者
    const headerThird = [
      {
        title: "",
        colspan: "1",
      },

      {
        title: "",
        colspan: "1",
      },
      {
        title: "",
        colspan: "1",
      },
      {
        title: "",
        colspan: "1",
      },
    ];
    const text: any = ref("");
    const handlerContextMenu = (obj: any, x: any, y: any, e: any) => {
      let items = [];

      // Save
      if (obj.options.allowExport) {
        items.push({
          title: obj.options.text.saveAs,
          shortcut: "Ctrl + S",
          onclick: function () {
            obj.download();
          },
        });
      }

      return items;
    };
    let headerSecondRow: any = [];

    //表の初期値
    const jSpreadSheetOptions: any = {
      //表の設定等
      //チェックボックスやカレンダー、プルダウンメニューも可能
      data: data,
      columns: columns,
      minDimensions: [10, 1],
      tableOverflow: true, // スクロールの有効化
      nestedHeaders: nestedHeaders,
      updateTable: updateTable,
      contextMenu: handlerContextMenu,
      lazyLoading: true,
    };
    const cancel = () => {
      filePosition.value = null;
      while (spreadsheet.value.firstChild) {
        spreadsheet.value.removeChild(spreadsheet.value.firstChild);
      }
      visible.value = false;
    };
    onBeforeUnmount(() => {
      while (spreadsheet.value?.firstChild) {
        spreadsheet.value.removeChild(spreadsheet.value.firstChild);
      }
      bus.off_all("exportRight");
      bus.off_all("exportRightJson");
    });

    let matchingG = new RegExp("g");
    let i: any = ref(0);
    const computeColspan = (n: any, data1: any) => {
      if (n.match(matchingG)) {
        data1[n].columns.forEach((el: any) => {
          computeColspan(el, data1);
        });
      } else {
        return (i.value += 1);
      }
    };
    // to get sheet columns  information
    const getColumns = async (value: string) => {
      loadingFlag.value = true;
      sheetColumnList(value)
        .then((res: any) => {
          // group info
          let data1 = res.data.data.column_group_info;
          let data3 = res.data.data.column_info;
          // 代入順序 input_order flag
          let inputOrder: boolean = false;
          for (const key in data3) {
            if (Object.prototype.hasOwnProperty.call(data3, key)) {
              const element = data3[key];
              //
              const hasOrder = Object.values(element).some((el) => el == "input_order");
              if (hasOrder) {
                inputOrder = true;
                break;
              }
            }
          }

          // パラメータ key is g1/g2/g3
          for (const key in data1) {
            if (Object.prototype.hasOwnProperty.call(data1, key)) {
              const element = data1[key];
              if (element.column_group_id == "0000002") {
                //Loop traversal g3             g3 contain g2
                let headerRowArray: any = [];
                let loopData: any = [];
                // A few rows in total
                headerRowArray.length = Object.keys(data1).length - 1;
                arr.length = 0;
                for (let j = 0; j < headerRowArray.length; j++) {
                  if (j == 0) {
                    i.value = 0;
                    element.columns.forEach((el: any, index: number) => {
                      // to compute パラメータ collspan
                      computeColspan(el, data1);

                      headerFirstRow.colspan = i.value.toString();
                      headerRowArray[j] = headerFirstRow;
                    });
                    loopData[j] = [];

                    element.columns.forEach((data: any) => {
                      loopData[j].push(data);
                    });
                    if (inputOrder) {
                      if (isInitOperation.value) {
                        arr[j] = [
                          // parameter is Variable
                          {
                            title: "",
                            colspan: "1",
                          },
                          // Head first row
                          headerRowArray[j],
                          headerOperationGroup,
                          ...headerThird,
                        ];
                      } else {
                        arr[j] = [
                          ...headerFirst,
                          // parameter is Variable
                          {
                            title: "",
                            colspan: "1",
                          },
                          // Head first row
                          headerRowArray[j],
                          headerOperationGroup,
                          ...headerThird,
                        ];
                      }

                    } else {
                      if (isInitOperation.value) {
                        arr[j] = [
                          // parameter is Variable

                          // Head first row
                          headerRowArray[j],
                          headerOperationGroup,
                          ...headerThird,
                        ];
                      } else {
                        arr[j] = [
                          ...headerFirst,
                          // parameter is Variable

                          // Head first row
                          headerRowArray[j],
                          headerOperationGroup,
                          ...headerThird,
                        ];
                      }
                    }
                    if (headerRowArray.length == 1) {
                      nestedHeaders.length = 0;
                      arr.forEach((headerArr: any) => {
                        nestedHeaders.push(headerArr);
                      });
                    };
                  } else {
                    headerSecondRow.length = 0;

                    loopData[j - 1].forEach((el: any, index: number) => {
                      if (el.match(matchingG)) {
                        loopData[j] = data1[el].columns;
                        // el g2
                        let obj = {
                          title: "",
                          colspan: "",
                        };
                        i.value = 0;
                        // to compute パラメータ collspan
                        computeColspan(el, data1);
                        obj.title = data1[el].column_group_name;
                        obj.colspan = i.value;
                        headerSecondRow.push(obj);
                      } else {
                        let obj = {
                          title: "",
                          colspan: "1",
                        };
                        headerSecondRow.push(obj);
                      }
                    });
                    headerRowArray[j] = headerSecondRow;

                    if (arr.length < Object.keys(data1).length) {
                      var arr3: any = []
                      if (inputOrder) {
                        if (isInitOperation.value) {
                          arr3 = [
                            {
                              title: "",
                              colspan: "1",
                            },
                            ...headerRowArray[j],
                            ...headerSecond,
                            ...headerThird,
                          ];
                        } else {
                          arr3 = [
                            ...headerFirst,
                            {
                              title: "",
                              colspan: "1",
                            },
                            ...headerRowArray[j],
                            ...headerSecond,
                            ...headerThird,
                          ];
                        }
                        
                      } else {
                        if (isInitOperation.value) {
                          arr3 = [
                          ...headerRowArray[j],
                          ...headerSecond,
                          ...headerThird,
                        ];
                        } else {
                          arr3 = [
                          ...headerFirst,
                          ...headerRowArray[j],
                          ...headerSecond,
                          ...headerThird,
                        ];
                        }
                        
                      }

                      arr.push(arr3);

                      nestedHeaders.length = 0;
                      arr.forEach((headerArr: any) => {
                        nestedHeaders.push(headerArr);
                      });
                    }
                  }
                }
              }
            }
          }

          // columns info

          let keys: any = Object.keys(data3).sort(function (a: any, b: any) {
            return a.slice(1) - b.slice(1);
          });
          columns.length = 0;
          operationColumn.length = 0;
          adminColumn.length = 0;
          parameterColumn.length = 0;

          for (let i = 0; i < keys.length; i++) {
            let obj3: any = {
              type: "text",
              title: "host_name",
              name: "parameter.host_name",
              readOnly: true,
              width: 170,
            };
            let keyEle = keys[i];
            if (keyEle != "c4") {
              const element = data3[keyEle];
              obj3.title = element.column_name;
              obj3.name = "parameter." + element.column_name_rest;

              if (element.column_group_id == "0000001") {
                if (element.column_name_rest == "operation_name_select") {
                  obj3.width = 400;
                }
                operationColumn.push(obj3);
              } else if (element.column_group_id == null) {
                if (element.column_name_rest == "uuid") {
                  adminColumn.push(obj3);
                } else if (element.column_name_rest == "host_name") {
                  if (isInitOperation.value) {
                    obj3.type = "hidden";
                  }
                  columns.splice(0, 0, obj3);
                } else if (element.column_name_rest == "input_order") {
                  obj3.width = 118;
                  obj3.type = "numeric";
                  columns.splice(2, 0, obj3);
                } else {
                  if (element.column_name_rest == "discard") {
                    obj3.width = 90;
                    obj3.type = "hidden";
                  }
                  adminColumn.push(obj3);
                }
              } else {
                if (element.column_name_rest == "file") {
                  filePosition.value = keyEle.slice(1);
                  obj3.allowUpload = true;
                  parameterColumn.push(obj3);
                  let obj4: any = {
                    type: "hidden",
                    title: "parameter.fileBase",
                    name: "parameter.fileBase",
                    readOnly: false,
                    width: 1,
                  };
                  parameterColumn.push(obj4);
                } else {
                  parameterColumn.push(obj3);
                }
              }
            }
          }

          parameterColumn.forEach((element: any) => {
            columns.push(element);
          });
          operationColumn.forEach((element: any) => {
            columns.push(element);
          });

          let discard = adminColumn.splice(2, 1);

          adminColumn.push(discard[0]);
          let systemNum = adminColumn.splice(0, 1);
          adminColumn.push(systemNum[0]);
          adminColumn.forEach((element: any) => {
            columns.push(element);
          });
          // パラメータシート画面でパラメータのツールチップを追加
          headertoolMapping = {};
          for (const key in data1) {
            if (Object.prototype.hasOwnProperty.call(data1, key)) {
              const element = data1[key];
              if (element.column_group_id == "0000002") {
                let mapping_cols: any = element.columns;
                if (mapping_cols.length != 0) {
                  loopFindColumns(mapping_cols, data1, data3);
                }
              }
            }
          }
          loadingFlag.value = false;
        })
        .catch(() => {});
    };
    // パラメータシート画面でパラメータのツールチップを追加
    function loopFindColumns(mapping_cols: any, data1: any, data3: any) {
      mapping_cols.forEach((key: any) => {
        if (key.match(matchingG)) {
          const element = data1[key];
          loopFindColumns(element.columns, data1, data3)
        } else {
          const p_element = data3[key];
          if (p_element.description != '' && p_element.description != null) {
            headertoolMapping[p_element.column_name] = p_element.description;
          }
        }
      });
    }
    function flattenJson(data: any) {
      let result: any = {};
      function recurse(cur: any, prop: any) {
        if (Object(cur) !== cur) {
          result[prop] = cur;
        } else if (Array.isArray(cur)) {
          for (var i = 0, l = cur.length; i < l; i++)
            recurse(cur[i], prop + "[" + i + "]");
          if (l == 0) result[prop] = [];
        } else {
          var isEmpty = true;
          for (var p in cur) {
            isEmpty = false;
            recurse(cur[p], prop ? prop + "." + p : p);
          }
          if (isEmpty && prop) result[prop] = "{}";
        }
      }
      recurse(data, "");
      return result;
    }
    function exportRight() {
      bus.emit("exportRight",true);
    }
    function exportRightJson() {
      bus.emit("exportRightJson",true);
    }
    return {
      visible,
      opened,
      cancel,
      spreadsheet,
      movement,
      loadingDialog,
      exportRight,
      exportRightJson,
    };
  },
});
</script>
<style lang="less" scoped>
#footerBtn1 {
  padding: 0 20px;
  border-radius: 8px;
  background-color: #fff0f000 !important;
  color: #7f7f7f !important;
  margin-right: 10px;
  border-color: #bdbdbd !important;

  &:hover {
    border-color: #bdbdbd !important;
    background-color: #fff0f000 !important;
    opacity: 0.8;
    color: #7f7f7f !important;
  }

  &:active,
  &:focus {
    border-color: #bdbdbd !important;
    background-color: #fff0f000 !important;
  }
}
.loadbtn {
  color: #fff;
  background-color: #418d45 !important;
  border-color: #418d45 !important;
  float: right;
  margin-bottom: 10px;

  &:hover {
    opacity: 0.8 !important;
    background-color: #418d45 !important;
    border-color: #418d45 !important;
  }

  &:active,
  &:focus {
    background-color: #418d45 !important;
    border-color: #418d45 !important;
  }
}
.tags {
  margin-left: 20px;
  display: inline-block;
  padding: 5px 8px;
  background-color: #0960bd;
  color: #fff;
}
</style>
<style lang="less">
.readOnlyBoxSheet {
  --el-dialog-width: 88% !important;
  --el-dialog-margin-top: 6vh !important;
  .jexcel_container {
    display:flex;
  }
  .jexcel > thead > tr > td {
    text-align: left;
  }
  .jexcel > tbody > tr > td.readonly  {
    color: #606266;
  }
  .jexcel > tbody > tr > td > a {
    color: blue;
  }
  .jexcel {
    width: max-content;
  }
  .jexcel_content {
    height: 600px;
    box-shadow: none !important;
    border: 1px solid #dcdfe6;
    max-width: 100%
  }

  .el-dialog__body {
    overflow-x: hidden !important;
  }
}

.readOnlyBoxSheet:deep(.el-dialog__body) {
  margin: 0 auto;
}

</style>
