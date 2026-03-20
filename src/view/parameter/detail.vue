<template>
  <div class="steps-third" element-loading-text="loading...">
    <p style="margin-bottom: 8px;">パラメータ参照およびダウンロード（階層型／ITA形式）ができます。</p>
    <p style="margin-top: 7px;">一括ダウンロードは複数選択後に右下の［一括ダウンロード実行］、個別ダウンロードは該当行の［ダウンロード］を押下します。</p>
    <div class="topCardBox">
      <div class="tabBox">
        <p>　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　</p>
      </div>
      <div class="originCopy">
        <!-- <p>コピー元オペレーション名<el-switch v-model="switchValue" size="default" inactive-text="　"
            style="--el-switch-on-color: #0960bd;" /></p> -->
        <el-select ref="operationselect" v-model="operation" filterable class="m-2" placeholder="オペレーション名（基準日時）を選択"
          :disabled="isDisabled || loadingShow || isDisabledRight || changeShow" @change="changeoperation">

          <el-option v-for="item in optionsdata" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </div>
    <el-table ref="sheetTable" :data="parametersheetTbData" border :row-key="getRowKeys" style="cursor: pointer"
      v-loading="loadingShow || changeShow" element-loading-text="loading..." :height="tableHeight"
      :row-style="rowClass" @selection-change="selectionChange" @row-click="rowClick" :row-height="27"
      :cell-class-name="noClick">
      <el-table-column type="selection" width="55" />
      <template v-for="(item, index) in parametersheet_columns" :key="index">
        <el-table-column v-if="item.dataIndex == 'menu_name_ja'" :prop="item.dataIndex" :label="item.title">
        </el-table-column>
        <el-table-column v-if="item.dataIndex == 'description_ja'" :prop="item.dataIndex" :label="item.title">
        </el-table-column>
        <el-table-column v-if="item.dataIndex == 'num'" :prop="item.dataIndex" :label="item.title" max-width="90"
          width="90">
          <template #default="scope"><span :class="scope.row.num == '0' ? 'notFinished' : 'finished'">{{
              scope.row.num
              }}</span></template>
        </el-table-column>
        <el-table-column v-if="item.dataIndex == 'action'" :prop="item.dataIndex" :label="item.title" class="no-click">
          <template #default="scope">

            <el-button class="detailsBtnReference" style="margin-left: 80px;margin-right: 16px;"
              @click="referenceClick(scope.row)">
              <el-icon>
                <Search />
              </el-icon>&nbsp;パラメータ参照</el-button>

            <el-dropdown placement="bottom" trigger="click">
              <el-button class="detailsBtnReference" @click="downloadClick(scope.row)" style="margin-top: 1px;"
                :disabled="isDisabledRight">
                <el-icon>
                  <Download />
                </el-icon>&nbsp;ダウンロード</el-button>
              <template #dropdown>
                <el-dropdown-menu
                  style="--el-dropdown-menuItem-hover-fill: var(--el-fill-color-light);--el-dropdown-menuItem-hover-color: var(--el-text-color-regular);">
                  <el-tooltip class="item" effect="light" content="選択したパラメータシートを階層型フォーマットのExcelに出力します。"
                    placement="left">
                    <span>
                      <el-dropdown-item
                        style="display: flex !important;justify-content: space-between;align-items: center;"
                        @click="downloadSysFile(false)">
                        <div><el-icon>
                            <Download />
                          </el-icon>階層型フォーマット(Excel)</div>
                      </el-dropdown-item>
                    </span>
                  </el-tooltip>
                  <el-tooltip class="item" effect="light" content="選択したパラメータシートをITAフォーマットのExcelに出力します。"
                    placement="left">
                    <span>
                      <el-dropdown-item
                        style="display: flex !important;justify-content: space-between;align-items: center;"
                        @click="downloadITAExcel">
                        <div><el-icon>
                            <Download />
                          </el-icon>ITAフォーマット(Excel)</div>
                      </el-dropdown-item>
                    </span>
                  </el-tooltip>
                  <el-tooltip class="item" effect="light" content="選択したパラメータシートをITAフォーマットのJson形式で出力します。"
                    placement="left">
                    <span>
                      <el-dropdown-item
                        style="display: flex !important;justify-content: space-between;align-items: center;"
                        @click="downloadITAJson">
                        <div><el-icon>
                            <Download />
                          </el-icon>ITAフォーマット(Json)</div>
                      </el-dropdown-item>
                    </span>
                  </el-tooltip>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </template>
    </el-table>

    <p v-if="changeShow" class="progressBox">{{ progress }} / {{ total }}</p>
  </div>
  <div class="readBox">
    <ReadOnlySheet :dialogVisibleSheet="dialogVisibleSheet" :readOperation="operationName" @change="change"
      :readParams="paramsSheetValue"></ReadOnlySheet>
  </div>
  <el-dialog v-model="errormsgshow" @close="messagecancel" class="errorBox1" :close-on-click-modal="false" :close-on-press-escape="false">
    <h3><el-icon style="color: #f56c6c;">
        <CircleCloseFilled />
      </el-icon>&nbsp;以下パラメータシートのダウンロードに失敗しました。</h3>
    <div class="errorTable" v-if="errormsgTableshow">
      <el-table :data="errorTableData" border height="250px">
        <el-table-column prop="title" label="パラメータシート"></el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer" style="padding-top: 0%;">
        <el-button @click="messagecancel">閉じる</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dlmsgshow" @close="dlmessagecancel" class="errorBox1" style="width: 550px;" :close-on-click-modal="false" :close-on-press-escape="false">
    <h3 class="title"> <el-icon style="margin-right: 15px;"><Download/></el-icon>一括出力フォーマットを選択してください。</h3>
   
    <el-divider style="margin-bottom: 35px;margin-top: 10px;"/>
    <el-radio-group v-model="dltypeList">
        <el-radio  v-for="item in radios" :label="item.value" :key="item.value" border style="width: 500px;margin-bottom: 5px;height: 35px;" @change="changeFmType">
          {{ item.label }}
        </el-radio>
    </el-radio-group>
    <div>

    </div>
     <template #footer>
      <div class="dialog-footer" style="padding-top: 0%;">
        <el-button @click="dlmessagecancel" style="margin-top: 50px;border-radius: 8px">キャンセル</el-button>
        <el-button @click="dlRun" style="margin-top: 50px;" class="nextBtn_dl">出力実行</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Download, ArrowLeft, Search,CircleCloseFilled, QuestionFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { operationListForFlag, getDefOperationDataSetInfos } from "../../api/jobList";
import { getOperationCount, exportExcelAPI, optionName, sheetColumnList } from "../../api/jobApi.ts";
import { downloadSysExcelFile ,loadExcelTemplate,assembleData4Gp,assembleCatalog} from "../../utils/downloadFile.ts";
import ReadOnlySheet from "./readOnlySheet.vue";
import { eventBus } from "../../store/eventBus";

export default defineComponent({
  name: "sheetdetail",
  components: { Search, Download, ReadOnlySheet,CircleCloseFilled,QuestionFilled },
  emits: ['buttonDisabled'],
  props: ["selParamters", "prev"],
  setup(props, { emit }) {
    let dialogVisibleSheet = ref(false);
    let operationName: any = ref("");
    let paramsSheetValue = ref("");
    let paramsValue = ref("");
    const bus = eventBus();
    let description_ja_value: any = ref();
    //  progress
    const progress = ref(0);
    const total = ref(0);
    const operation: any = ref();
    const isDisabled: any = ref(false);
    const loadingShow: any = ref(false);
    const changeShow: any = ref(false);
    const isDisabledRight: any = ref(false);
    const sheetTable: any = ref(null);
    const optionsdata: any = ref([]);
    const selectedParamters: any = ref(props.selParamters);
    let tableHeight = ref();
    let selectedSheet: any = reactive([]);
    const operationselect = ref(null);
    const parametersheetTbData: any = reactive([])
    const rest_count: number = 5;
    const parametersheet_columns = reactive([
      {
        title: "パラメータシート",
        dataIndex: "menu_name_ja",

      },
      {
        title: "カテゴリー",
        dataIndex: "description_ja",
      },
      {
        title: "登録件数",
        dataIndex: "num",
        width: "55"
      },
      {
        title: "",
        dataIndex: "action",
      },
    ]);
    const dlmsgshow: any = ref(false);
    // get radios list
    const dltypeList = ref<any>(null);
    let radios: any = reactive([
      {
        value: 1,
        label: "階層型フォーマット(Excel)"
      },
      {
        value: 2,
        label: "ITAフォーマット(Excel)"
      },
      {
        value: 3,
        label: "ITAフォーマット(Json)"
      },
    ]);
    const fmType: any = ref(null);
    const errormsgshow: any = ref(false);
    const errormsgTableshow: any = ref(false);
    let errorTableData: any = reactive([]);
    onMounted(() => {
      tableHeight.value = window.innerHeight - 395;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 395;
      };
    })
    watch(props, async (val, old) => {
      if (changeShow.value) {
        return;
      }
      loadingShow.value = true;
      if (sheetTable?.value) {
        sheetTable?.value.clearSelection();
      }
      if (operation?.value) {
        operation.value = null
      }
      operationName.value = ""
      selectedParamters.value = props.selParamters;
      await getOperationList();
      await createdTableData();
    });
    const selectionChange = (val: any) => {
      selectedSheet.length = 0;
      val.forEach((item: any) => {
        selectedSheet.push(item);
      });
    };
    const rowClass = ({ row }: any) => {
      if (selectedSheet.includes(row)) {
        return { color: "#0960bd" };
      }
    };
    const getRowKeys = (row: any) => {
      return row.menu_name_rest;
    };

    const rowClick = (row: any, column: any, event: any) => {

      if (column.property == "action") {
        return;
      }
      // Whether the line that is clicked is in the selected array
      let resultFlag = selectedSheet.findIndex((item: any) => {
        return item.menu_name_rest == row.menu_name_rest;
      });
      if (resultFlag == -1) {
        sheetTable.value!.toggleRowSelection(row, true);
      } else {
        sheetTable.value!.toggleRowSelection(row, false);
      }
    };

    const referenceClick = (row: any) => {
      if (operationName.value == "") {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
        return;
      }
      paramsSheetValue.value = row.menu_name_rest;
      dialogVisibleSheet.value = true;
    };

    const downloadAllJsonFile = async () => {
      errorTableData.length = 0;
      changeShow.value = true;
      let sheetList: any = [...selectedSheet];
      emit("buttonDisabled", true);
      total.value = sheetList.length;
      progress.value = 0;
      for (let i = 0; i < sheetList.length; i++) {
        try {
          let obj = {
            discard: { NORMAL: "0" },
            operation_name_disp: { LIST: [operationName.value] },
          };
          progress.value++;
          await optionName(obj, sheetList[i]['menu_name_rest']).then(async (res: any) => {
            let code = res.data.data;
            downloadJson(sheetList[i]['menu_name_ja'] + "_" + operationName.value + ".json", code, true);
          });
        } catch (error: any) {
          console.log(error.message)
          ElMessage({
            type: "error",
            message: sheetList[i]['menu_name_ja'] + "のダウンロードに失敗しました。"
          });
          let obj: any = {};
          obj.title = sheetList[i]['menu_name_ja'];
          errorTableData.push(obj);
        }
      }
      changeShow.value = false;
      disload();
      emit("buttonDisabled", false);
      progress.value = 0;
      total.value = 0;
      if (errorTableData.length > 0) {
        errormsgshow.value = true;
        errormsgTableshow.value = true;
      }
    }

    const downloadAllItaFile = async (isALL: any) => {
      errorTableData.length = 0;
      changeShow.value = true;
      let sheetList: any = [...selectedSheet];
      emit("buttonDisabled", true);
      total.value = sheetList.length;
      progress.value = 0;
      for (let i = 0; i < sheetList.length; i++) {
        try {
          let obj = {
            discard: { NORMAL: "0" },
            operation_name_disp: { LIST: [operationName.value] },
          };
          progress.value ++
          await exportExcelAPI(obj, sheetList[i]['menu_name_rest']).then(async (res: any) => {
            let base64Code = res.data.data;
            dataURLtoDownload(
              base64Code,
              sheetList[i]['menu_name_ja'] + "_" + operationName.value + ".xlsx",
              true
            );
          });
        } catch (error: any) {
          console.log(error.message)
          ElMessage({
            type: "error",
            message: sheetList[i]['menu_name_ja'] + "のダウンロードに失敗しました。"
          });
          let obj: any = {};
          obj.title = sheetList[i]['menu_name_ja'];
          errorTableData.push(obj);
        }
      }
      changeShow.value = false;
      disload();
      emit("buttonDisabled", false);
      progress.value = 0;
      total.value = 0;
      if (errorTableData.length > 0) {
        errormsgshow.value = true;
        errormsgTableshow.value = true;
      }
    }

    const downloadSysFile = async (isALL: any) => {
      if (operationName.value == "") {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
        return;
      }
      
      if (selectedSheet.length == 0 && isALL) {
        ElMessage({
          type: "warning",
          message: "パラメータシートを選択してください。",
        });
        return;
      }
      let sheetList: any = []
      let workbook = await loadExcelTemplate();
      load();
      if (isALL) {
        errorTableData.length = 0;
        sheetList = [...selectedSheet];
        sheetList.sort((a: any, b: any) => {
          if (a.description_ja < b.description_ja) {
            return -1
          }
          if (a.description_ja > b.description_ja) {
            return 1
          }
          if (a.display_order < b.display_order) {
            return -1
          }
          if (a.display_order > b.display_order) {
            return 1
          }
        });
      } else {
        sheetList=[{ 'menu_name_rest': paramsSheetValue.value,'menu_name_ja': paramsValue.value,"description_ja":description_ja_value.value}]
      }
      changeShow.value = true;
      emit("buttonDisabled", true);
      total.value = sheetList.length;
      progress.value = 0;
      let inputOrderInfos: any = [];
      let columnHeaders: any = {};
      let columnDatas: any = {};
      let file_rows: any = {};
      let parameterSheetInfos: any = {};
      const results_col: any[] = [];
      const results_data: any[] = [];
      let next_description = "";
      let num = 0;
      let sub_num = 1;
      let catalogue: any = {};
      for (let i = 0; i < sheetList.length; i += rest_count) {
        results_col.length = 0;
        results_data.length = 0;
        const batch = sheetList.slice(i, i + rest_count);
        try {
          const batchResults = await Promise.all(
            batch.map(async (el: any) => {
              return sheetColumnList(el.menu_name_rest).then((res: any) => res.data.data)
            })
          );
          results_col.push(...batchResults);
          let params1 = {
            discard: {
              NORMAL: "0",
            },
            operation_name_disp: {
              LIST: [operationName.value],
            },
          };
          const batchResultsData = await Promise.all(
            batch.map(async (el: any) => {
              return optionName(params1, el.menu_name_rest).then((res: any) => res.data.data)
            })
          );
          results_data.push(...batchResultsData);
          for (let index = 0; index < results_col.length; index++) {
            const element_info = results_col[index];
            const element_data = results_data[index];
            const menu_name_rest = batch[index].menu_name_rest;
            const parametername = batch[index].menu_name_ja;
            const description_ja = batch[index].description_ja;
            if (next_description != description_ja) {
              num++;
              sub_num = 1;
              next_description = description_ja;
            }
            let group_num = num + "-" + sub_num + ".";
            let category_num = num + ".";
            sub_num++;


            // Headerを作成
            // group info
            let data1 = element_info.column_group_info;
            let data3 = element_info.column_info;
            // 代入順序 input_order flag
            let hasInputOrder: boolean = false;
            let columnsName: any = {};
            let columnNameRest: any = {};
            // columnsNameを作成する
            for (const key in data3) {
              if (Object.prototype.hasOwnProperty.call(data3, key)) {
                const element = data3[key];
                const hasOrder = Object.values(element).some((el) => el == "input_order");
                if (hasOrder) {
                  hasInputOrder = true;
                }
                columnsName[key] = element.column_name;
                columnNameRest[key] = element.column_name_rest;
              }
            }
            if (hasInputOrder) {
              columnsName["c1"] = "input_order";
              columnNameRest["c1"] = "input_order";
            }
            let v_Order: any = [];
            let has_col = false;
            let has_g = false;
            // パラメータ key is g1/g2/g3
            for (const key in data1) {
              if (Object.prototype.hasOwnProperty.call(data1, key)) {
                const element = data1[key];
                if (element.column_group_id == "0000002") {
                  let sub_gp_count: any = [];
                  let columns = element.columns

                  let tagObject: any = {
                    g1: { "column_group_name": element.column_group_name, "columns": columns }
                  };
                  let main_group_name: any = [];
                  let main_group_name_key: any = [];
                  let group_idx: any = 2;
                  // main_group_nameを取得
                  columns.forEach((el: any) => {
                    if (el.match(matchingG)) {
                      main_group_name.push(data1[el].column_group_name)
                      main_group_name_key.push(data1[el].column_group_name)
                    }
                  });
                  if (main_group_name.length > 0) {
                    tagObject['main_group_name'] = main_group_name;

                  } else {
                    v_Order.push(...columns);
                  }
                  // ColumnHeaderを作成
                  
                  columns.forEach((el: any) => {
                    if (el.match(matchingC) && "VAR_OS_python_cmd" == columnsName[el]) {
                      has_col = true;
                    }
                    if (el.match(matchingG)) {
                      has_g = true;
                    }
                  })
                  if (!has_col || !has_g) {
                    has_col = false
                  }
                  buildColumnHeaders(data1, hasInputOrder, main_group_name_key, columns, tagObject, sub_gp_count, group_idx, 1, v_Order,has_col)
                  tagObject['sub_gp_count'] = sub_gp_count.sort((a: any, b: any) => b - a)[0];
                  if (sub_gp_count.length == 0) {
                    tagObject['sub_gp_count'] = 0;
                    if (hasInputOrder) {
                      tagObject['g1']["columns"].splice(0, 0, 'c1');
                      v_Order.splice(0, 0, 'c1');
                    }
                  }
                  if (sub_gp_count.length != 0 && has_col) {
                    tagObject['g1']["columns"].splice(0, 0, 'c1');
                    v_Order = tagObject['g1']["columns"].concat(v_Order);
                  }
                  // columnsNameを作成する。
                  tagObject['columnsName'] = columnsName;
                  columnHeaders[menu_name_rest] = [tagObject];
                  break;
                }
              }
            }
            let key_v_Order: any = [];
            // key  transition
            v_Order.forEach((element: any) => {
              if (!element.match(matchingG)) {
                key_v_Order.push(columnNameRest[element]);
              }
            });

            // inputOrderのInfosを作成
            if (element_data != null && element_data.length != 0) {
              let uniqueArray: any = [];
              let simplification_column_Datas: any = [];
              let hostNameOrder: any = []
              if (hasInputOrder) {
                let inputOrders: any = [];
                element_data.forEach((element: any) => {
                  inputOrders.push(element.parameter.input_order);
                  inputOrders.sort((a: any, b: any) => a - b);
                  uniqueArray = [...new Set(inputOrders)];
                  hostNameOrder.push(element.parameter.host_name);
                  hostNameOrder.sort();
                  hostNameOrder = [...new Set(hostNameOrder)];
                  // column Data Simplification
                  let obj: any = { 'host_name': element.parameter.host_name };
                  for (let key in columnsName) {
                    if (columnsName.hasOwnProperty(key)) {
                      let val = columnNameRest[key];
                      if (element.parameter.hasOwnProperty(val)) {
                        if (element.file.hasOwnProperty(val)) {
                          if (!obj.hasOwnProperty('file_row')) {
                            obj.file_row = {}
                          }
                          if (element.file[val] == null) {
                            obj[val] = ""
                            obj.file_row[val] = 0
                          } else {
                            var fname = element.parameter[val]
                            var isTextFile = true;
                            var decodedText = 'not a text file';
                            if (fname.endsWith('.jpg') ||
                              fname.endsWith('.png') ||
                              fname.endsWith('.gif') ||
                              fname.endsWith('.zip') ||
                              fname.endsWith('.tar') ||
                              fname.endsWith('.gz')) {
                              isTextFile = false;
                            }
                            if (isTextFile) {
                              var bstr = atob(element.file[val]),
                                n = bstr.length,
                                u8arr = new Uint8Array(n);
                              if (isPlainTextFile(bstr)) {
                                while (n--) {
                                  u8arr[n] = bstr.charCodeAt(n);
                                }
                                const decoder = new TextDecoder('utf-8');
                                decodedText = decoder.decode(u8arr);
                              }
                            }
                            obj[val] = decodedText
                            let resultStrList: string[] = splitStringIfExceedsLimit(decodedText);
                            
                            if (resultStrList.length == 1) {
                              obj.file_row[val] = 0;
                            } else {
                              obj.file_row[val] = resultStrList.length;
                            }
                          }
                        } else {
                          obj[val] = element.parameter[val]
                          if (element.parameter[val] == null) {
                            obj[val] = "";
                          }
                        }
                      }
                    }
                  }
                  simplification_column_Datas.push(obj);
                });
                inputOrderInfos.push({ [menu_name_rest]: uniqueArray })
              } else {
                element_data.forEach((element: any) => {
                  hostNameOrder.push(element.parameter.host_name);
                  hostNameOrder.sort();
                  hostNameOrder = [...new Set(hostNameOrder)];
                  // column Data Simplification
                  let obj: any = { 'host_name': element.parameter.host_name };
                  for (let key in columnsName) {
                    if (columnsName.hasOwnProperty(key)) {
                      let val = columnNameRest[key];
                      if (element.parameter.hasOwnProperty(val)) {
                        if (element.file.hasOwnProperty(val)) {
                          if (!obj.hasOwnProperty('file_row')) {
                            obj.file_row = {}
                          }
                          if (element.file[val] == null) {
                            obj[val] = ""
                            obj.file_row[val] = 0
                          } else {
                            var fname = element.parameter[val];
                            var isTextFile = true;
                            var decodedText = 'not a text file';
                            if (fname.endsWith('.jpg') ||
                              fname.endsWith('.png') ||
                              fname.endsWith('.gif') ||
                              fname.endsWith('.zip') ||
                              fname.endsWith('.tar') ||
                              fname.endsWith('.gz')) {
                              isTextFile = false;
                            }
                            if (isTextFile) {
                              var bstr = atob(element.file[val]),
                                n = bstr.length,
                                u8arr = new Uint8Array(n);
                              if (isPlainTextFile(bstr)) {
                                while (n--) {
                                  u8arr[n] = bstr.charCodeAt(n);
                                }
                                const decoder = new TextDecoder('utf-8');
                                decodedText = decoder.decode(u8arr);
                              }
                            }
                            obj[val] = decodedText
                            let resultStrList: string[] = splitStringIfExceedsLimit(decodedText);
                            if (resultStrList.length == 1) {
                              obj.file_row[val] = 0;
                            } else {
                              obj.file_row[val] = resultStrList.length;
                            }
                          }
                        } else {
                          obj[val] = element.parameter[val]
                          if (element.parameter[val] == null) {
                            obj[val] = "";
                          }
                        }
                      }
                    }
                  }
                  simplification_column_Datas.push(obj);
                });
                inputOrderInfos.push({ [menu_name_rest]: ["noinput"] })
              }

              const groupedData: any = {};
              simplification_column_Datas.forEach((item: any) => {
                const { host_name, ...dataItem } = item;
                if (!groupedData[host_name]) {
                  groupedData[host_name] = [];
                }
                groupedData[host_name].push(dataItem);

              })

              let column_Datas: any = [];
              let file_row: any = [];
              if (!hasInputOrder) {
                for (let index_hostname = 0; index_hostname < hostNameOrder.length; index_hostname++) {
                  const hostname = hostNameOrder[index_hostname];
                  let dataobject: any = {
                    hostName: hostname,
                    data: groupedData[hostname]
                  }
                  column_Datas.push(dataobject);
                }
                // file　rows 作成
                simplification_column_Datas.forEach((el: any) => {
                  for (let index_hostname = 0; index_hostname < hostNameOrder.length; index_hostname++) {
                    if (el.hasOwnProperty('file')) {
                      if (hostNameOrder[index_hostname] == el.host_name) {
                        if (file_row.length == 0 || file_row[index_hostname] == undefined) {
                          file_row.push(el.file_row);
                        } else {
                          let fileRow = file_row[index_hostname];
                          if (el.file_row > fileRow) {
                            file_row.splice(index_hostname, index_hostname, el.file_row);
                          }
                        }
                      }
                    }
                  }
                });
                // data 作成
                column_Datas.forEach((el: any) => {
                  let chang_column_Datas: any = [];
                  let o_hostName = el.hostName;
                  let o_data = el.data;
                  let t_data: any = []
                  for (let index_hostname = 0; index_hostname < hostNameOrder.length; index_hostname++) {
                    if (o_hostName == hostNameOrder[index_hostname]) {
                      o_data.forEach((tdata: any) => {
                        key_v_Order.forEach((elorder: any) => {
                          let tmp_data = tdata[elorder];
                          if (el.hasOwnProperty('file_row') && file_row[index_hostname].hasOwnProperty(elorder)) {
                            let inster_data_num_obj = file_row[index_hostname];
                            let inster_data_num = inster_data_num_obj[elorder];
                            let resultStrList: string[] = splitStringIfExceedsLimit(tmp_data);
                            if (inster_data_num == 0) {
                              chang_column_Datas.push(resultStrList[inster_data_num])
                            } else {
                              for (let index_inster_data_num = 0; index_inster_data_num < inster_data_num; index_inster_data_num++) {
                                if (resultStrList[index_inster_data_num] == undefined) {
                                  chang_column_Datas.push("")
                                } else {
                                  chang_column_Datas.push(resultStrList[index_inster_data_num])
                                }
                              }
                            }
                          }
                          else {
                            chang_column_Datas.push(tmp_data);
                          }
                        });
                      });
                      t_data.push([...chang_column_Datas]);
                      chang_column_Datas = [];
                    }

                  }
                  el.data = t_data;
                });


              }
              if (hasInputOrder) {
                for (let index_hostname = 0; index_hostname < hostNameOrder.length; index_hostname++) {
                  const hostname = hostNameOrder[index_hostname];
                  let dataobject: any = {
                    hostName: hostname,
                    data: groupedData[hostname]
                  }
                  column_Datas.push(dataobject);
                }
                // file　rows 作成
                for (let index_order = 0; index_order < uniqueArray.length; index_order++) {
                  let inputOrder = uniqueArray[index_order];
                  simplification_column_Datas.forEach((el: any) => {
                    if (el.hasOwnProperty('file_row')) {
                      if (el.input_order == inputOrder) {
                        if (file_row.length == 0 || file_row[index_order] == undefined) {
                          file_row.push(el.file_row);
                        } else {
                          let fileRow = file_row[index_order];
                          let merged = mergeWithMax(fileRow, el.file_row);
                          file_row.splice(index_order, index_order, merged);
                        }
                      }
                    }
                  })
                }
                // data 作成
                column_Datas.forEach((el: any) => {
                  let chang_column_Datas: any = [];
                  let o_data = el.data;
                  let t_data: any = []
                  for (let index_order = 0; index_order < uniqueArray.length; index_order++) {
                    let has_index_order = false;
                    o_data.forEach((tdata: any) => {
                      key_v_Order.forEach((elorder: any) => {
                        let tmp_data = tdata[elorder];
                        if (tdata.input_order == uniqueArray[index_order]) {
                          has_index_order = true;
                          
                          if (tdata.hasOwnProperty('file_row') && tdata.file_row.hasOwnProperty(elorder)) {
                            let inster_data_num_row = file_row[index_order];
                            let inster_data_num = inster_data_num_row[elorder];
                            let resultStrList: string[] = splitStringIfExceedsLimit(tmp_data);
                            if (inster_data_num == 0) {
                              chang_column_Datas.push(resultStrList[inster_data_num])
                            } else {
                              for (let index_inster_data_num = 0; index_inster_data_num < inster_data_num; index_inster_data_num++) {
                                if (resultStrList[index_inster_data_num] == undefined) {
                                  chang_column_Datas.push("")
                                } else {
                                  chang_column_Datas.push(resultStrList[index_inster_data_num])
                                }
                              }
                            }
                          } else {
                            chang_column_Datas.push(tmp_data);
                          }
                        }
                      });

                    });

                    if (!has_index_order) {
                      key_v_Order.forEach((elorder: any) => {
                        if (file_row.length != 0 && file_row[index_order].hasOwnProperty(elorder)) {
                          let inster_data_num_row = file_row[index_order];
                          let inster_data_num = inster_data_num_row[elorder];
                          if (inster_data_num == 0) {
                            chang_column_Datas.push("")
                          } else {
                            for (let index_inster_data_num = 0; index_inster_data_num < inster_data_num; index_inster_data_num++) {
                              chang_column_Datas.push("")
                            }
                          }
                        } else {
                          chang_column_Datas.push("")
                        }
                      });
                    }
                    t_data.push([...chang_column_Datas]);
                    chang_column_Datas = [];
                  }
                  el.data = t_data;
                });
              }
              file_rows[menu_name_rest] = file_row;
              columnDatas[menu_name_rest] = column_Datas;
            } else {
              inputOrderInfos.push({ [menu_name_rest]: ["noinput"] })
              file_rows[menu_name_rest] = [];
              let tmpdata: any = [];
              key_v_Order.forEach((key_Order: any) => {
                tmpdata.push("");
              })
              columnDatas[menu_name_rest] = [{ "hostName": "", data: [tmpdata] }];
            }
            parameterSheetInfos[menu_name_rest] = { parametername: parametername, category: description_ja, groupnum: group_num, categorynum: category_num }
            // Excelを作成
            await assembleData4Gp(columnHeaders, columnDatas, workbook, inputOrderInfos, parameterSheetInfos, file_rows, operationName.value, catalogue,has_col);
            inputOrderInfos = [];
            columnHeaders = {};
            columnDatas = {};
            file_rows = {};
            parameterSheetInfos = {};
            progress.value++;
          }
        } catch (error: any) {
          errorTableData.length = 0;
          console.log(error.message)
          disload();
          changeShow.value = false;
          emit("buttonDisabled", false);
          ElMessage({
            type: "error",
            message: "指定したフォーマットでExcelの作成が失敗しました。"
          });
        }
      }
      await assembleCatalog(workbook,catalogue);
      await downloadSysExcelFile(workbook, catalogue);
      disload();
      emit("buttonDisabled", false);
      changeShow.value = false;
    };

    let matchingG = new RegExp("g");
    let matchingC = new RegExp("c");
    const buildColumnHeaders = (data1: any, hasInputOrder: any, main_group_name_key: any, columns: any, tagObject: any, sub_gp_count: any,group_idx:any,tmp_gp_count: any,v_Order:any,has_col:boolean) => {
      columns.forEach((el: any) => {
        if (el.match(matchingG)) {
          let cols = data1[el].columns;
          let columns_view = data1[el].columns_view;
          let column_group_name = data1[el].column_group_name;
          if (main_group_name_key.includes(column_group_name)) {
            if (hasInputOrder&& !has_col) {
              cols.splice(0, 0, 'c1');
              columns_view.splice(0, 0, 'c1');
            }
            sub_gp_count.push(tmp_gp_count);
            tmp_gp_count = 0;

            if (tmp_gp_count == 0) {
              tmp_gp_count++;
            }
          } else {
            tmp_gp_count++;
            sub_gp_count.push(tmp_gp_count);
          }
          v_Order.push(...columns_view);
          tagObject[el] = {"column_group_name":column_group_name,"columns":cols};
          group_idx++;
          buildColumnHeaders(data1,hasInputOrder,main_group_name_key,cols,tagObject,sub_gp_count,group_idx,tmp_gp_count,v_Order,has_col)
        }
      })
      return sub_gp_count;

    }

    const downloadClick = (row: any) => {
      paramsSheetValue.value = row.menu_name_rest;
      paramsValue.value = row.menu_name_ja;
      description_ja_value.value = row.description_ja;

    };
    const createdTableData = async () => {
      loadingShow.value = true
      parametersheetTbData.length = 0;

      selectedParamters.value.sort(function (a: any, b: any) {
        if (a.display_order < b.display_order) {
          return -1;
        }
        if (a.display_order > b.display_order) {
          return 1;
        }
        return 0;
      });
      for (let index = 0; index < selectedParamters.value.length; index++) {
        const element = selectedParamters.value[index];
        element.num = 0;
        parametersheetTbData.push(element);
      }
      loadingShow.value = false;
    };
    createdTableData();
    const getOperationList = async () => {
      let data = {
        discard: {
          NORMAL: "0",
        },
        "Flag": {
          LIST: ["0"]
        }
      };
      let defOperationIds: any[] = [];
      await getDefOperationDataSetInfos(data).then(async (res: any) => {
        let data = res.data.data;
        if (data.length != 0) {
          data.forEach((element: any) => {
            defOperationIds.push(element.parameter.Operation);
          });
        }
      }).catch((err: any) => {
        ElMessage({
          type: "error",
          message: err,
        });
      });
      if (defOperationIds.length == 0) {
        return;
      }
      await operationListForFlag(defOperationIds)
        .then((res: any) => {
          let tmpoptions: any = [];
          let arr1 = res.data.data;
          arr1.forEach((element: any) => {
            let strdate = element.parameter.last_run_date == null ? element.parameter.scheduled_date_for_execution : element.parameter.last_run_date;
            element.parameter.value = element.parameter.operation_name;
            element.parameter.label = element.parameter.operation_name + "\n" + "(" + strdate + ")";
            element.parameter.dateVal = strdate;
            tmpoptions.push(element.parameter);
          });
          optionsdata.value = JSON.parse(JSON.stringify(tmpoptions));

          optionsdata.value.sort(function (a: any, b: any) {
            if (a.dateVal > b.dateVal) {
              return -1;
            }
            if (a.dateVal < b.dateVal) {
              return 1;
            }
            return 0;
          })
        }).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    getOperationList();
    const noClick = ({ row, rowIndex, columnIndex, column }: any) => {
      if (column?.property == "action") {
        return "no-click"
      }
    }
    const changeoperation = async (val: any) => {
      total.value = parametersheetTbData.length;
      progress.value = 0;
      changeShow.value = true;
      emit("buttonDisabled", true);
      let params = {
        discard: {
          NORMAL: "0",
        },
        operation_name_disp: {
          LIST: [val],
        },
      };
      operationName.value = val
      for (let index = 0; index < parametersheetTbData.length; index++) {
        const element = parametersheetTbData[index];
        await getOperationCount(params, element.menu_name_rest).then((res: any) => {
          let data = res.data.data;
          progress.value++;
          element.num = data;
        }).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        })
      }
      changeShow.value = false;
      emit("buttonDisabled", false);
      progress.value = 0;
      total.value = 0;
    }

    const change = (val: boolean) => {
      dialogVisibleSheet.value = val;
    };

    const downloadITAJson = async () => {
      if (operationName.value == "") {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
        return;
      }
      let obj = {
        discard: { NORMAL: "0" },
        operation_name_disp: { LIST: [operationName.value] },
      };
      optionName(obj, paramsSheetValue.value).then(async (res: any) => {
        let code = res.data.data;
        downloadJson(paramsValue.value + "_" + operationName.value + ".json", code);
      });
    }

    const downloadJson = (fileName: string, json: any, isAll:boolean = false) => {
      if (isAll) {
        load(fileName);
      } else {
        load();
      }
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
    const downloadITAExcel = async () => {
      if (operationName.value == "") {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
        return;
      }
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

    function dataURLtoDownload(dataurl: any, name: string, isAll: boolean = false) {
      if (isAll) {
        load(name);
      } else {
        load();
      }
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
    const load = (pname: string = 'none') => {
      isDisabledRight.value = true;
      if (pname == 'none') {
        ElMessage({
          type: "info",
          message: "ダウンロードを開始しました。",
        });
      } else {
        ElMessage({
          type: "info",
          message: pname + "をダウンロード。",
        });
      }
      
    };

    bus.on("downloadSysFile", (isAll: boolean) => {
      downloadSysFile(isAll);
    })

    bus.on("downloadSelectView", (isAll: boolean) => {
      downloadSelectView(isAll);
    })
    

    onBeforeUnmount(() => {
      bus.off_all("downloadSysFile");
      bus.off_all("downloadSelectView");
    });

    function splitStringIfExceedsLimit(input: string, limit: number = 32000): string[] {
      // Check if the input string exceeds the limit
      if (input.length <= limit) {
        return [input]; // If not, return the string as a single element in an array
      }
      const result: string[] = [];
      let start = 0;
      // Loop through the string and split it into chunks
      while (start < input.length) {
        let end = Math.min(start + limit, input.length);
        const slice_src = input.slice(start, end);
        const lastCarriageReturn = slice_src.lastIndexOf('\r');
        const lastLineFeed = slice_src.lastIndexOf('\n');
        const  lastIndex = Math.max(lastCarriageReturn, lastLineFeed);
        if (lastIndex >= 0) {
          end = lastIndex + start + 1;
        }
        result.push(input.slice(start, end));
        start = end;
      }
      return result;
    }

    function isPlainTextFile(bstr:any) {
      const sampleSize = Math.min(bstr.length, 4096);
      let isTextFile = true;

      for (let i = 0; i < sampleSize; i++) {
        const charCode = bstr.charCodeAt(i);
        if (charCode < 32 && charCode !== 10 && charCode !== 13 && charCode !== 9) {
          isTextFile = false;
          break;
        }
      }
      return isTextFile;
    }

    function mergeWithMax<T extends Record<string, number>>(obj1: T, obj2: T): T {
      const result = {} as T;
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      allKeys.forEach(key => {
        result[key as keyof T] = Math.max(
          obj1[key as keyof T] || 0,
          obj2[key as keyof T] || 0
        )  as T[keyof T];
      });

      return result;
    }

    const messagecancel = (() => {
      errormsgshow.value = false;
      errormsgTableshow.value = false;
    });

    const downloadSelectView = (isAll: boolean) => {
      if (operationName.value == "") {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
        return;
      }

      if (selectedSheet.length == 0 && isAll) {
        ElMessage({
          type: "warning",
          message: "パラメータシートを選択してください。",
        });
        return;
      }
      dlmsgshow.value = true;
      
    }
    const dlmessagecancel = () => {
      fmType.value = null;
      dltypeList.value = null;
      dlmsgshow.value = false;
    }

    const dlALL = () => {
      dlmsgshow.value = false;
    }

    const changeFmType = (val: any) => {
        fmType.value = val;
    };

    const dlRun = () => {
      if (fmType.value == 1) {
        dlmessagecancel();
        downloadSysFile(true);
      } else if (fmType.value == 2) {
        dlmessagecancel();
        downloadAllItaFile(true)
      } else if (fmType.value == 3) {
        dlmessagecancel();
        downloadAllJsonFile();
      } else {
        fmType.value = null;
        dltypeList.value = null;
        ElMessage({
          type: "warning",
          message: "一括出力フォーマットを選択してください。",
        });
      }
    }

    return { downloadITAJson, paramsValue, downloadITAExcel, change, paramsSheetValue, operationName, dialogVisibleSheet, operationselect, tableHeight, operation, isDisabled, loadingShow, parametersheet_columns, getRowKeys, referenceClick, downloadSysFile, isDisabledRight, downloadClick, changeShow, parametersheetTbData, sheetTable, optionsdata, selectedSheet, rowClass, selectionChange, rowClick, noClick, changeoperation, progress, total, downloadAllItaFile, errormsgshow, errormsgTableshow, errorTableData, messagecancel,downloadSelectView,dlmsgshow,dlmessagecancel,dlALL,dltypeList, radios,changeFmType,dlRun};
  }
});
</script>
<style scoped lang="less">
.el-radio-group {
  padding-bottom: 10px;
  /deep/.el-radio.is-bordered.is-checked {
    background-color: #0960bd;
    color: #fff;
  }

  /deep/.el-radio__label {
    // width: 148px;
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
.errorTable {
  .el-table .cell {
    height: auto !important;
    line-height: 27px !important;
  }
}


.steps-third {
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

.topCardBox {
  display: flex;
  justify-content: start;
}

.originCopy {
  /deep/.el-select .el-input__wrapper {
    width: 420px !important;
  }
}

/deep/.el-select .el-input__wrapper {
  width: 420px !important;
}

.detailsBtnReference {
  border-color: #0960bd;
  background-color: #0960bd;
  color: #fff;
  // padding: 2px 10px !important;
  height: 25px;

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

.notFinished {
  color: red;
  font-weight: bolder;
}

.finished {
  color: #0960bd;
}

.times {
  /deep/.el-select {
    width: 100%;

    .el-input__wrapper {
      border-radius: 0px;
    }
  }
}

.el-select-dropdown__item {
  white-space: pre-wrap !important;
  height: auto !important;
  line-height: 20px !important;

  /deep/span {
    // height:10px!important; 
    display: inline-block !important;
    margin-top: 7px !important;
    padding-bottom: 7px !important;
  }
}

/deep/.no-click {
  cursor: default !important;
}

.progressBox {
  width: calc(100% - 55px);
  text-align: center;
  position: absolute;
  top: 52%;
  z-index: 2002;
}

.readBox {
  /deep/.el-dialog {
    --el-dialog-width: 80% !important;
    --el-dialog-margin-top: 8vh !important;
  }
}
.nextBtn_dl {
    margin-right: 10px;
    padding: 0 20px;
    border-radius: 8px;
    color: #fff;
    background-color: #da6a38;

    &:hover {
      opacity: 0.8;
    }
  }
</style>
<style>
.errorBox1 {
  .el-dialog__body {
    overflow-x: hidden !important;
    padding-top: 8px;
    padding-bottom: 0px;
  }

  .el-dialog__header {
    padding-bottom: 0px !important;
    padding-top: 0px !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
  }

  .el-dialog__footer {
    padding-top: 20px !important;
    box-sizing: border-box;
  }
}
</style>