<template>
  <div v-if="visible" class="editBoxSheet" v-loading="loadingDialog">
    <div  ref="spreadsheetEdit" style="min-height: 500px; min-width: 100%;"></div>
  </div>
  <div v-else v-loading="true" style="height: 500px"></div>
  <el-upload ref="uploadRef" class="upload-demo" action="#" :auto-upload="false" :on-change="convertFileToBase64"
    v-show="false">
    <template #trigger>
      <el-button type="primary" ref="selectFileBtn">select file</el-button>
    </template>
  </el-upload>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
  onBeforeMount,
} from "vue";

import { ElDialog, ElMessage } from "element-plus";
import jSpreadSheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import {
  optionName,
  optionAllRegister,
  sheetColumnList,
  sheetpullDown,
} from "../../../api/jobApi";
import { pulldownApi } from "../../../api/index";
import { useStore } from "../../../store/index";
import { eventBus } from "../../../store/eventBus";
export default defineComponent({
  name: "editSheet",
  props: ["dialogVisibleEdit", "editOperation", "editParams", "movementName"],
  emits: ["changeEdit","setButtonStatus","editSheetchangestatus"],
  components: {
    ElDialog,
  },
  setup(props, { emit }) {
    // event bus
    const bus = eventBus();
    const ceEdit = function (a: any) {
      bus.emit("ceEdit", a);
    };
    const spreadsheetEdit: any = ref(null);
    const selectFileBtn: any = ref(null);
    let selectionUploadCoordinate: any = reactive({});
    let jspreadsheetObj: any = ref();
    let copySize: any = ref();
    let pasteCells: any = reactive([]);
    const store = useStore();
    let host = store.getHost;
    let hostList: any = reactive([]);
    let filePosition = ref(null);
    let operationList: any = reactive([]);
    let columns: any = reactive([]);
    let operationColumn: any = reactive([]);
    let adminColumn: any = reactive([]);
    let parameterColumn: any = reactive([]);
    let hostId: any = reactive({});
    let operationId: any = reactive({});
    let dataObj: any = reactive([]);
    let visible: any = ref(props.dialogVisibleEdit);
    let parameter = ref(props.editParams);
    let operation = ref(props.editOperation);
    let movement = ref(props.movementName);
    let copyColumns: any = reactive([]);
    let nestedHeaders: any = reactive([]);
    let deleteRowsData: any = ref("");
    let deleteRowsArray: any = reactive([]);
    // error
    let errorTableData: any = reactive([]);
    let errorFlag: any = ref(false);
    let sheetWidth: any = ref("");
    let headertoolMapping: any = reactive({});
    onMounted(() => {
      sheetWidth.value = window.innerWidth * 0.868 + "px";

      let container: any = document.getElementsByClassName("jexcel_content");

      if (container[0]) {
        container[0].style.width = sheetWidth.value;
      }
      window.onresize = () => {
        sheetWidth.value = window.innerWidth * 0.868+ "px";

        let container: any = document.getElementsByClassName("jexcel_content");

        if (container[0]) {
          container[0].style.width = sheetWidth.value;
        }
      };
      bus.on("parametersheetChange", () => {
        deleteRowsArray.length = 0;
        errorFlag.value = false;
      })
      bus.on("cancelEditSheet", () => {
        cancel()
      })
      bus.on("register", () => {
        register()
      })
      isFirst.value = true;
    });
    onBeforeMount(() => {
    })
    let isFirst:any = ref(true);
    watch(props, async (val, old) => {
      visible.value = val.dialogVisibleEdit;
      parameter.value = val.editParams;
      operation.value = val.editOperation;
      movement.value = val.movementName;
      filePosition.value = null;
      errorFlag.value = false;
      errorTableData.length = 0;

      while ((spreadsheetEdit.value) && spreadsheetEdit.value.firstChild) {
        spreadsheetEdit.value.removeChild(spreadsheetEdit.value.firstChild);
      }

      spreadsheetEdit.value = null;
      if (visible.value) {
        loadingDialog.value = true;
        emit("setButtonStatus", true);
        getPullDown(parameter.value);
        
        await getColumns(parameter.value);
      }
    });
    watch(visible, (val, old) => {
      emit("changeEdit", visible.value);
    });
    onMounted(() => {
      (window as any).downloadFile = downloadFile;
      (window as any).handlerOnClickSelectFileBtn = handlerOnClickSelectFileBtn;
    });
    const getPullDown = (value: string) => {
      pulldownApi(value).then((res: any) => {
        hostId = res.data.data.host_name;
        operationId = res.data.data.operation_name_select;
        let selectName = store.getOperationSelect;
        hostList.length = 0;
        operationList.length = 0;
        for (const key in hostId) {
          const element = hostId[key];
          host.forEach((el: any) => {
            if (el.managed_system_item_number) {
              if (el.managed_system_item_number == key) {
                hostList.push(element);
              }
            } else {
              if (el.hostgroup_id == key) {
                hostList.push(element);
              }
            }
          });
        }
        for (const key in operationId) {
          const element = operationId[key];
          if (selectName == element) {
            operationList.push(element);
          }
        }
      });
    };
    let arr: any = [];

    let loadingDialog = ref(false);
    let totalColumns = ref(0);

    // eslint-disable-next-line no-unused-vars
    const onBeforePaste = (instance: any, cell: any, x: any, y: any) => {
      pasteCells.length = 0;
      let maxRowNum = jspreadsheetObj.getData().length;

      // copySize.value
      for (let copyY in Array.from({ length: copySize.value })) {
        let pasteY = parseInt(y) + parseInt(copyY) + 1;

        if (pasteY > maxRowNum) {
          jspreadsheetObj.insertRow();
        }

        //   If read-only is set, copy is not possible
        for (let index = 0; index < copyColumns.length; index++) {
          const element = copyColumns[index];

          let cell = `${element}${parseInt(y) + parseInt(copyY) + 1}`;

          jspreadsheetObj.setReadOnly(cell, false);
          pasteCells.push(cell);
        }
      }
    };
    // eslint-disable-next-line no-unused-vars
    const onPaste = (instance: any, cell: any) => {
      for (let pasteCell of pasteCells) {
        jspreadsheetObj.setReadOnly(pasteCell, true);
      }

      // upade readOnly
      let jsheetData = jspreadsheetObj.getJson();

      jspreadsheetObj.setData(jspreadsheetsort(jsheetData));
      ;
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

    // eslint-disable-next-line no-unused-vars
    const onCopy = (instance: any, data: any) => {
      copySize.value = data.length;
    };
    const updateTable = (
      instance: any,
      cell: any,
      col: any,
      row: any,
      val: any,
      id: any
    ) => {
      if (col == 0) {
        let num;
        if (filePosition.value) {
          num = totalColumns.value;
        } else {
          num = totalColumns.value - 1;
        }

        if (instance.jexcel.options.data[row][col + num]) {
          cell.innerHTML = "登録済";
        } else {
          cell.innerHTML = "登録";
        }
      }
      let container: any = document.getElementsByClassName("jexcel_content");

      if (container[0]) {
        container[0].style.width = sheetWidth.value;
        container[0].style.maxHeight = "500px";
      }

      if (cell.classList.contains("readonly")) {
        cell.style.backgroundColor = "#fff";
      } else {
        let colString;
        if (filePosition.value) {
          colString = String.fromCharCode(65 + col);
        } else {
          colString = String.fromCharCode(64 + col);
        }

        let isINcopy = copyColumns.indexOf(colString);

        if (isINcopy == -1) {
          cell.style.backgroundColor = "#f2e6b788";
        }
      }

      if (filePosition.value) {
        if (col === Number(filePosition.value) - 6) {
          cell.innerHTML =
            '<a href="#" onclick="downloadFile(' + row + ')">' + val + "</a>";
        }
      }
      cell.style.textAlign = "left";

      // パラメータシート画面でパラメータのツールチップを追加
      let columnHeaders:any = document.querySelectorAll('[data-x]');
      if (columnHeaders.length != 0) {
        for (let i = 0; i < columnHeaders.length; i++) {
          let columnHeader = columnHeaders[i].getAttribute('title');
          if (columnHeader != null && columnHeader != undefined && columnHeader != '' && headertoolMapping.length != 0) {
            let text: any = columnHeaders[i].innerText;
            if (Object.prototype.hasOwnProperty.call(headertoolMapping, text)) {
              columnHeaders[i].setAttribute('title',headertoolMapping[text])
            }
         }
        }
      }
    };
    // eslint-disable-next-line no-unused-vars
    const handlerOnClickSelectFileBtn = (x: any, y: any) => {
      selectFileBtn.value?.$.vnode.el?.click();
      //オブジェクトから thisに対してコピー
      selectionUploadCoordinate = {
        selectionX: x,
        selectionY: y,
      };
    };
    const text: any = ref("");
    // eslint-disable-next-line no-unused-vars
    const handlerContextMenu = (obj: any, x: any, y: any, e: any) => {
      let items = [];
      // Copy
      items.push({
        title: obj.options.text.copy,
        shortcut: "Ctrl + C",
        onclick: function () {
          obj.copy(true);
          text.value = obj.copy(true);
        },
      });

      // Paste
      if (navigator && navigator.clipboard) {
        items.push({
          title: obj.options.text.paste,
          shortcut: "Ctrl + V",
          onclick: function () {
            if (obj.selectedCell) {
              navigator.clipboard.readText().then(function (text) {
                if (text) {
                  obj.paste(obj.selectedCell[0], obj.selectedCell[1], text);
                }
              });
            }
          },
        });
      } else {
        items.push({
          title: obj.options.text.paste,
          shortcut: "Ctrl + V",
          onclick: function () {
            if (obj.selectedCell) {
              obj.paste(obj.selectedCell[0], obj.selectedCell[1], text.value);
            }
          },
        });
      }

      if (y == null) {
        // Insert a new column
        if (obj.options.allowInsertColumn === true) {
          items.push({
            title: obj.options.text.insertANewColumnBefore,
            onclick: function () {
              obj.insertColumn(1, parseInt(x), 1);
            },
          });
        }
        if (obj.options.allowInsertColumn === true) {
          items.push({
            title: obj.options.text.insertANewColumnAfter,
            onclick: function () {
              obj.insertColumn(1, parseInt(x), 0);
            },
          });
        }
        // Delete a column
        if (obj.options.allowDeleteColumn === true) {
          items.push({
            title: obj.options.text.deleteSelectedColumns,
            onclick: function () {
              obj.deleteColumn(obj.getSelectedColumns().length ? undefined : parseInt(x));
            },
          });
        }
        // Rename column
        if (obj.options.allowRenameColumn === true) {
          items.push({
            title: obj.options.text.renameThisColumn,
            onclick: function () {
              obj.setHeader(x);
            },
          });
        }
        // Sorting
        if (obj.options.columnSorting === true) {
          // Line
          items.push({ type: "line" });

          items.push({
            title: obj.options.text.orderAscending,
            onclick: function () {
              obj.orderBy(x, 0);
            },
          });
          items.push({
            title: obj.options.text.orderDescending,
            onclick: function () {
              obj.orderBy(x, 1);
            },
          });
        }
      } else {
        // Insert new row
        if (obj.options.allowInsertRow === true) {
          items.push({
            title: obj.options.text.insertANewRowBefore,
            onclick: function () {
              obj.insertRow(1, parseInt(y), 1);
            },
          });
          items.push({
            title: obj.options.text.insertANewRowAfter,
            onclick: function () {
              obj.insertRow(1, parseInt(y));
            },
          });
        }

        if (obj.options.allowDeleteRow === true) {
          items.push({
            title: obj.options.text.deleteSelectedRows,
            onclick: function () {
              obj.deleteRow(obj.getSelectedRows().length ? undefined : parseInt(y));
            },
          });
        }

        if (x) {
          if (obj.options.allowComments === true) {
            items.push({ type: "line" });
            var title = obj.records[y][x].getAttribute("title") || "";
            items.push({
              title: title ? obj.options.text.editComments : obj.options.text.addComments,
              onclick: function () {
                obj.setComments([x, y], prompt(obj.options.text.comments, title));
              },
            });

            if (title) {
              items.push({
                title: obj.options.text.clearComments,
                onclick: function () {
                  obj.setComments([x, y], "");
                },
              });
            }
          }

          if (obj.options.columns[x].allowUpload) {
            // Line
            items.push({ type: "line" });
            // upload
            items.push({
              title: "Upload",
              onclick: function () {
                (window as any).handlerOnClickSelectFileBtn(x, y);
              },
            });
          }
        }
      }
      // Line
      items.push({ type: "line" });
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
    const onDeleteRow = () => {
      // this.deleteRowsData = this.selectRowsData
      let jsheetData = jspreadsheetObj.getJson();
      if (jsheetData.length === 0) {
        jspreadsheetObj.setData([null]);
      }
    };
    // eslint-disable-next-line no-unused-vars
    const onBeforeDeleteRow = (el: any, rowNumber: any, numOfRows: any) => {
      let jsheetData = jspreadsheetObj.getJson();
      let jsonArr = [];
      for (let i of Array(numOfRows).keys()) {
        jsonArr.push(jsheetData[rowNumber + i]);
      }
      deleteRowsData.value = JSON.stringify(jsonArr, null, "  ");
      deleteRowsArray.push(JSON.stringify(jsonArr, null, "  "));
    };
    const headerFirst = [
      //
      {
        title: "",
        colspan: "1",
      },
      // host_name
      {
        title: "",
        colspan: "1",
      },
    ];

    // 最終更新日時 //備考 //最終更新日時 //最終更新者
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
      // 項番
      {
        title: "",
        colspan: "1",
      },
    ];
    const headerFirstRow = {
      title: "パラメータ",
      colspan: "",
    };
    let headerSecondRow: any = [];
    //表の初期値
    const jSpreadSheetOptions: any = {
      //表の設定等
      //チェックボックスやカレンダー、プルダウンメニューも可能
      data: dataObj,
      columns: columns,
      nestedHeaders: nestedHeaders,
      // Allow All row delete
      allowDeletingAllRows: true,
      allowInsertColumn: false,
      // Allow new rows
      allowManualInsertColumn: false,
      // Allow row delete
      allowDeleteRow: true,

      tableOverflow: true, // スクロールの有効化
      minDimensions: [10, 1],
      contextMenu: handlerContextMenu,
      onpaste: onPaste,
      onbeforepaste: onBeforePaste,
      oncopy: onCopy,
      updateTable: updateTable,
      ondeleterow: onDeleteRow,
      onbeforedeleterow: onBeforeDeleteRow,
      lazyLoading: true,
    };

    // ダウンロードファイル
    const downloadFile = (rowNums: any) => {
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
    // ファイルをbase64に変換する
    // eslint-disable-next-line no-unused-vars
    const convertFileToBase64 = (file: any) => {
      const reader: any = new FileReader();
      reader.onload = () => {
        const base64String = btoa(reader.result);
        let jsheetData = jspreadsheetObj.getJson();
        jsheetData[selectionUploadCoordinate.selectionY]["parameter.file"] = file.name;
        jsheetData[selectionUploadCoordinate.selectionY][
          "parameter.fileBase"
        ] = base64String;
        jspreadsheetObj.setData(jspreadsheetsort(jsheetData));
      };
      reader.readAsBinaryString(file.raw);
    };
    const cancel = () => {
      filePosition.value = null;
      errorFlag.value = false;
      errorTableData.length = 0;
      deleteRowsArray.length = 0;
      while (spreadsheetEdit.value?.firstChild) {
        spreadsheetEdit.value.removeChild(spreadsheetEdit.value.firstChild);
      }

      spreadsheetEdit.value = null;
      visible.value = false;
      
    };
    onBeforeUnmount(() => {
      spreadsheetEdit.value = null;
      while (spreadsheetEdit.value?.firstChild) {
        spreadsheetEdit.value.removeChild(spreadsheetEdit.value.firstChild);
      }
      

    });
    const getJsonData = async (parameter: string, operation: string) => {
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
          dataObj.length = 0;
          if (dataJson.length) {
            dataJson.forEach((element: any) => {
              let obj: any = {};
              element.parameter["actionType"] = "既存";
              let eln = flattenJson(element);

              eln["parameter.fileBase"] = eln["file.file"];

              for (const key in eln) {
                if (Object.prototype.hasOwnProperty.call(eln, key)) {
                  const n1 = eln[key];

                  let n = columns.findIndex((element: any) => {
                    if (element) {
                      return element.name == key;
                    }
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

              dataObj.push(obj);
            });
          } else {
            dataObj.push([]);
          }

          if (dataJson.length == 0) {
            if (dataObj.length == dataJson.length + 1) {
              loadingFlag1.value = false;
            }
          } else {
            if (dataObj.length == dataJson.length) {
              loadingFlag1.value = false;
            }
          }

          if (spreadsheetEdit.value) {
            jspreadsheetObj.setData(JSON.stringify(jspreadsheetsort(dataObj)));
          }
          loadingFlag1.value = false;
          try {
            jspreadsheetObj.setData(JSON.stringify(jspreadsheetsort(dataObj)));
            jspreadsheetObj.refresh();
          } catch (error: any) {
          }
          
          
          loadingDialog.value = false;
          emit("setButtonStatus", false);
        });
      } catch (error: any) {
        loadingDialog.value = false;
        emit("setButtonStatus", false);
        ElMessage({
          type: "error",
          message: error,
        });
      }
    };
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
    // columns
    let loadingFlag: any = ref("");
    // data
    let loadingFlag1: any = ref("");
    const pulldownData: any = ref({});
    const pulldownKeys: any = ref([]);
    let isTrue = true;
    // to get sheet columns  information
    const getColumns = async (value: string) => {
      loadingFlag.value = true;
      sheetpullDown(value)
        .then((res: any) => {
          pulldownData.value = res.data.data;
          pulldownKeys.value = Object.keys(pulldownData.value);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });

      sheetColumnList(value)
        .then((res: any) => {
          if (dataObj.length) {
            dataObj.length = 0;
            jspreadsheetObj.refresh();
          }
          
          // group info
          let data1 = res.data.data.column_group_info;
          let data3 = res.data.data.column_info;
          // 代入順序 input_order
          let inputOrder: boolean = false;
          let file: boolean = false;
          for (const key in data3) {
            if (Object.prototype.hasOwnProperty.call(data3, key)) {
              const element = data3[key];
              const enoughStock = Object.values(element).some(
                (el) => el == "input_order"
              );

              if (enoughStock) {
                inputOrder = true;
                break;
              }
            }
          }
          for (const key in data3) {
            if (Object.prototype.hasOwnProperty.call(data3, key)) {
              const element = data3[key];

              const enoughStock1 = Object.values(element).some((el) => el == "file");

              if (enoughStock1) {
                file = true;
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

                headerRowArray.length = Object.keys(data1)?.length - 1;
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
                      arr[j] = [
                        ...headerFirst,
                        // parameter is Variable
                        {
                          title: "",
                          colspan: "1",
                        },
                        // Head first row
                        headerRowArray[j],
                        ...headerThird,
                      ];
                    } else {
                      arr[j] = [
                        ...headerFirst,
                        // parameter is Variable
                        // Head first row
                        headerRowArray[j],
                        ...headerThird,
                      ];
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

                    if (arr.length < Object.keys(data1)?.length) {
                      if (inputOrder) {
                        var arr3: any = [
                          ...headerFirst,

                          {
                            title: "",
                            colspan: "1",
                          },
                          ...headerRowArray[j],
                          ...headerThird,
                        ];
                      } else {
                        arr3 = [
                          ...headerFirst,

                          ...headerRowArray[j],
                          ...headerThird,
                        ];
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
          copyColumns.length = 0;
          columns.length = 0;
          operationColumn.length = 0;
          adminColumn.length = 0;
          parameterColumn.length = 0;
          let numFlag = 0;
          for (let i = 0; i < keys?.length; i++) {
            let obj3: any = {
              type: "text",
              title: "",
              name: "",
              readOnly: true,
              width: 157,
            };
            let keyEle = keys[i];

            if (keyEle != "c4") {
              numFlag += 1;
              const element = data3[keyEle];

              obj3.title = element.column_name;
              obj3.name = "parameter." + element.column_name_rest;

              if (element.auto_input == "0") {
                obj3.readOnly = false;
              } else {
                let num = 64;
                if (file) {
                  num = 65;
                }
                if (element.column_name_rest == "base_datetime") {
                  copyColumns.push(String.fromCharCode(num + keys.length - 1 - 6));
                } else if (element.column_name_rest == "operation_date") {
                  copyColumns.push(String.fromCharCode(num + keys.length - 1 - 5));
                } else if (element.column_name_rest == "discard") {
                  copyColumns.push(String.fromCharCode(num + keys.length - 1));
                } else if (element.column_name_rest == "last_update_date_time") {
                  copyColumns.push(String.fromCharCode(num + keys.length - 3));
                } else if (element.column_name_rest == "last_updated_user") {
                  copyColumns.push(String.fromCharCode(num + keys.length - 2));
                }
              }
              if (element.column_group_id == "0000001") {
                obj3.type = "hidden";
                if (element.column_name_rest == "operation_name_select") {
                  obj3.type = "dropdown";
                  obj3.type = "hidden";
                  obj3.source = operationList;
                  obj3.width = 400;
                  obj3["options"] = operationList[0];
                  obj3.readOnly=true;
                }
                operationColumn.push(obj3);
              } else if (element.column_group_id == null) {
                if (element.column_name_rest == "uuid") {
                  totalColumns.value = keys.length;
                  adminColumn.push(obj3);
                } else if (element.column_name_rest == "host_name") {
                  obj3.type = "dropdown";
                  obj3.source = hostList;
                  columns.splice(0, 0, obj3);
                } else if (element.column_name_rest == "input_order") {
                  obj3.width = 118;
                  obj3.type = "numeric";
                  columns.splice(2, 0, obj3);
                } else {
                  if (element.column_name_rest == "discard") {
                    obj3.width = 90;
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
                  let result = pulldownKeys.value.indexOf(element.column_name_rest);
                  if (result != -1) {
                    obj3.type = "dropdown";
                    obj3.source = Object.values(
                      pulldownData.value[element.column_name_rest]
                    );
                  }

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
          columns.unshift({
            type: "text",
            title: "種別",
            name: "parameter.actionType",
            readOnly: true,
            width: 60,
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
          try {
            jspreadsheetObj = jSpreadSheet(
              //DOM参照
              spreadsheetEdit.value,
              //表の設定データ
              jSpreadSheetOptions
            );
          } catch (error) {
            
          }
          getJsonData(parameter.value, operation.value);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
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
          if (isEmpty && prop) result[prop] = {};
        }
      }
      recurse(data, "");
      return result;
    }
    const unflatten = (data: any) => {
      if (Object(data) !== data || Array.isArray(data)) return data;
      var result: any = {},
        cur,
        prop,
        idx,
        last,
        temp;
      for (var p in data) {
        (cur = result), (prop = ""), (last = 0);
        do {
          idx = p.indexOf(".", last);
          temp = p.substring(last, idx !== -1 ? idx : undefined);
          cur = cur[prop] || (cur[prop] = !isNaN(parseInt(temp)) ? [] : {});
          prop = temp;
          last = idx + 1;
        } while (idx >= 0);
        cur[prop] = data[p];
      }
      return result[""];
    };
    let isDisabled = ref(false);
    const register = async () => {
      isDisabled.value = true;
      errorTableData.length = 0;
      emit("setButtonStatus", true);
      try {
        let params1 = {
          discard: {
            NORMAL: "0",
          },
          operation_name_disp: {
            LIST: [operation.value],
          },
        };
        let res = await optionName(params1, parameter.value);
        let dataBase = res.data.data;
        let arrData = jspreadsheetObj.getJson();

        let optionsArr: any = [];

        if (dataBase.length == 0) {
          arrData.forEach((el: any) => {
            let obj: any = {
              file: {},
              parameter: {},
              type: "Register",
            };
            let result = unflatten(el);
            obj.parameter = result.parameter;
            obj.parameter.discard = "0";
            if (result.parameter.fileBase != "") {
              obj.file.file = result.parameter.fileBase;
            }
            delete obj.parameter.fileBase;
            optionsArr.push(obj);
          });
        } else {
          arrData.forEach((el: any) => {
            // updated
            if (el["parameter.uuid"] != "") {
              if (el["parameter.host_name"]) {
                el["parameter.operation_name_select"] = operationList[0];
                if (el["parameter.operation_name_select"]) {
                  let obj: any = {
                    file: {},
                    parameter: {},
                    type: "Update",
                  };
                  let result = unflatten(el);

                  obj.parameter = result.parameter;
                  obj.parameter.discard = "0";
                  if (result.parameter.fileBase != "") {
                    obj.file.file = result.parameter.fileBase;
                  }
                  delete obj.parameter.fileBase;
                  optionsArr.push(obj);
                } else {
                }
              } else {
              }
            } else {
              let obj: any = {
                file: {},
                parameter: {},
                type: "Register",
              };
              // register
              if (el["parameter.host_name"]) {
                el["parameter.operation_name_select"] = operationList[0];
                if (el["parameter.operation_name_select"]) {
                  let result = unflatten(el);
                  obj.parameter = result.parameter;
                  obj.parameter.discard = "0";
                  if (result.parameter.fileBase != "" && result.parameter.fileBase != "") {
                    obj.file.file = result.parameter.fileBase;
                  }
                  delete obj.parameter.fileBase;
                  optionsArr.push(obj);
                } else {
                }
              } else {
              }
            }
          });
          // delete
          if (deleteRowsArray.length != 0) {
            deleteRowsArray.forEach((elFirst: any) => {
              JSON.parse(elFirst).forEach((el: any) => {
                if (el["parameter.uuid"] != "") {
                  let obj: any = {
                    file: {},
                    parameter: {},
                    type: "Update",
                  };
                  let result = unflatten(el);
                  obj.parameter = result.parameter;
                  obj.parameter.discard = "1";
                  if (result.parameter.fileBase != "") {
                    obj.file.file = result.parameter.fileBase;
                  }
                  delete obj.parameter.fileBase;
                  optionsArr.push(obj);
                }
              });
            });
          }
        }
        optionsArr.forEach((o: any) => {
          let parameter = o.parameter;
          o.parameter.operation_name_select = operationList[0];
          for (let key in parameter) {
            if (key == "actionType") {
              delete parameter["actionType"];
            } else {
              let ele: any = parameter[key];
              let re = /\u0000/g;
              let tmp = ele
              try {
                tmp = ele.toString().replace(re, '');
              } catch (e: any) {
                tmp = ele
              }
              if (tmp != ele) {
                if (tmp === "") {
                  // ファイルなしの場合、ファイル送付しない
                  if (key == "file" && o.type == 'Update') {
                    delete parameter["file"];
                  } else {
                    parameter[key] = null;
                  }
                } else {
                  parameter[key] = tmp;
                }
              }
              if (ele === "") {
                // ファイルなしの場合、ファイル送付しない
                if (key == "file" && o.type == 'Update') {
                  delete parameter["file"];
                } else {
                  parameter[key] = null;
                }
              }
            }
          }
        });
        loadingDialog.value = true
        optionAllRegister(optionsArr, parameter.value)
          .then((res: any) => {
            ceEdit("true");
            // update operation

            ElMessage({
              type: "success",
              message: "パラメータの保存が成功しました。",
            });

            deleteRowsArray.length = 0;
            errorFlag.value = false;
            let copystatus = {
              movementName: movement,
              value: parameter.value
            }
            emit("editSheetchangestatus", copystatus);
            getJsonData(parameter.value, operation.value);
            isDisabled.value = false;
          })
          .catch((err: any) => {
            isDisabled.value = false;
            loadingDialog.value = false;
            emit("setButtonStatus", false);
            ceEdit("true");
            let isJSONFlag = isJSON(err);
            if (isJSONFlag) {
              errorFlag.value = true;
              let error = JSON.parse(err);
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
                      errorTableData.push(obj);
                    }
                  }
                }
              }
              ElMessage({
                type: "error",
                message: error,
              });
            } else {
              ElMessage({
                type: "error",
                message: err,
              });
            }
          });
        deleteRowsArray.length = 0;
      } catch (e: any) {
        ElMessage({
          type: "error",
          message: e,
        });
        deleteRowsArray.length = 0;
        emit("setButtonStatus", false);
      }
      
    };
    const isJSON = (str: any) => {
      if (typeof str == "string") {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == "object" && obj) {
            return true;
          } else {
            return false;
          }
        } catch (e: any) {
          return false;
        }
      }
    };
   
    return {
      visible,
      register,
      convertFileToBase64,
      dataObj,
      columns,
      cancel,
      errorTableData,
      errorFlag,
      spreadsheetEdit,
      movement,
      selectFileBtn,
      loadingDialog,
      isDisabled,
    };
  },
});
</script>
<style lang="less" scoped>
.errorTable {
  /deep/.el-table thead tr th {
    background-color: #bd3333 !important;
  }
}

.tags {
  margin-left: 20px;
  display: inline-block;
  padding: 5px 8px;
  background-color: #418d45;
  color: #fff;
}
</style>
<style lang="less">
.editBoxSheet {
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
  .jexcel_container {
    display:flex;
    width: 100% !important;
  }
  .jexcel_content {
    height: 530px;
    box-shadow: none !important;
    max-width: 100%;
  }
}
</style>
