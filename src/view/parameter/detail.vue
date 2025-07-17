<template>
  <div class="steps-third" element-loading-text="loading...">
    <p>パラメータ参照及びパラメータダウンロード（Excel／Json）ができます。</p>

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
                          </el-icon>Jsonフォーマット(Json)</div>
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
</template>
<script lang="ts">
import { defineComponent, reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { Download, ArrowLeft, Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { operationListForFlag, getDefOperationDataSetInfos } from "../../api/jobList";
import { getOperationCount, exportExcelAPI, optionName, sheetColumnList } from "../../api/jobApi.ts";
import { downloadSysExcelFile ,loadExcelTemplate,assembleData4Gp,assembleCatalog} from "../../utils/downloadFile.ts";
import ReadOnlySheet from "./readOnlySheet.vue";
import { eventBus } from "../../store/eventBus";
export default defineComponent({
  name: "sheetdetail",
  components: { Search, Download, ReadOnlySheet },
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
    onMounted(() => {
      tableHeight.value = window.innerHeight - 380;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 380;
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
            // columnsNameを作成する
            for (const key in data3) {
              if (Object.prototype.hasOwnProperty.call(data3, key)) {
                const element = data3[key];
                const hasOrder = Object.values(element).some((el) => el == "input_order");
                if (hasOrder) {
                  hasInputOrder = true;
                }
                columnsName[key] = element.column_name;
              }
            }
            if (hasInputOrder) {
              columnsName["c1"] = "input_order";
            }
            let v_Order: any = [];
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
                  buildColumnHeaders(data1, hasInputOrder, main_group_name_key, columns, tagObject, sub_gp_count, group_idx, 1, v_Order)
                  tagObject['sub_gp_count'] = sub_gp_count.sort((a: any, b: any) => b - a)[0];
                  if (sub_gp_count.length == 0) {
                    tagObject['sub_gp_count'] = 0;
                    if (hasInputOrder) {
                      tagObject['g1']["columns"].splice(0, 0, 'c1');
                      v_Order.splice(0, 0, 'c1');
                    }
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
                key_v_Order.push(columnHeaders[menu_name_rest][0]['columnsName'][element]);
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
                      let val = columnsName[key];

                      if (element.parameter.hasOwnProperty(val)) {
                        if (val == 'file') {
                          if (element.file.file == null) {
                            obj[val] = ""
                            obj.file_row = 0;
                          } else {

                            var bstr = atob(element.file.file),
                              n = bstr.length,
                              u8arr = new Uint8Array(n);
                            while (n--) {
                              u8arr[n] = bstr.charCodeAt(n);
                            }
                            const decoder = new TextDecoder('utf-8');
                            const decodedText = decoder.decode(u8arr);
                            obj[val] = decodedText
                            let resultStrList: string[] = splitStringIfExceedsLimit(decodedText);
                            if (resultStrList.length == 1) {
                              obj.file_row = 0;
                            } else {
                              obj.file_row = resultStrList.length;
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
                      let val = columnsName[key];
                      if (element.parameter.hasOwnProperty(val)) {
                        if (val == 'file') {
                          if (element.file.file == null) {
                            obj[val] = ""
                            obj.file_row = 1;
                          } else {
                            var bstr = atob(element.file.file),
                              n = bstr.length,
                              u8arr = new Uint8Array(n);
                            while (n--) {
                              u8arr[n] = bstr.charCodeAt(n);
                            }
                            const decoder = new TextDecoder('utf-8');
                            const decodedText = decoder.decode(u8arr);
                            obj[val] = decodedText
                            let resultStrList: string[] = splitStringIfExceedsLimit(decodedText);
                            if (resultStrList.length == 1) {
                              obj.file_row = 0;
                            } else {
                              obj.file_row = resultStrList.length;
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
                          if (elorder == 'file') {
                            let inster_data_num = file_row[index_hostname];
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
                    if (el.hasOwnProperty('file')) {
                      if (el.input_order == inputOrder) {
                        if (file_row.length == 0 || file_row[index_order] == undefined) {
                          file_row.push(el.file_row);
                        } else {
                          let fileRow = file_row[index_order];
                          if (el.file_row > fileRow) {
                            file_row.splice(index_order, index_order, el.file_row);
                          }
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
                          if (elorder == 'file') {
                            let inster_data_num = file_row[index_order];
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
                        if (elorder == 'file') {
                          let inster_data_num = file_row[index_order];
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
            await assembleData4Gp(columnHeaders, columnDatas, workbook, inputOrderInfos, parameterSheetInfos, file_rows, operationName.value, catalogue);
            inputOrderInfos = [];
            columnHeaders = {};
            columnDatas = {};
            file_rows = {};
            parameterSheetInfos = {};
            progress.value++;
          }
        } catch (error: any) {
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
    const buildColumnHeaders = (data1: any, hasInputOrder: any, main_group_name_key: any, columns: any, tagObject: any, sub_gp_count: any,group_idx:any,tmp_gp_count: any,v_Order:any) => {
      columns.forEach((el: any) => {
        if (el.match(matchingG)) {
          let cols = data1[el].columns;
          let columns_view = data1[el].columns_view;
          let column_group_name = data1[el].column_group_name;
          if (main_group_name_key.includes(column_group_name)) {
            if (hasInputOrder) {
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
          buildColumnHeaders(data1,hasInputOrder,main_group_name_key,cols,tagObject,sub_gp_count,group_idx,tmp_gp_count,v_Order)
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
          LIST: [null]
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

    bus.on("downloadSysFile", (isAll: boolean) => {
      downloadSysFile(isAll);
    })

    onBeforeUnmount(() => {
      bus.off_all("downloadSysFile");
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
    return { downloadITAJson, paramsValue, downloadITAExcel, change, paramsSheetValue, operationName, dialogVisibleSheet, operationselect, tableHeight, operation, isDisabled, loadingShow, parametersheet_columns, getRowKeys, referenceClick, downloadSysFile, isDisabledRight, downloadClick, changeShow, parametersheetTbData, sheetTable, optionsdata, selectedSheet, rowClass, selectionChange, rowClick, noClick, changeoperation, progress, total };
  }
});
</script>
<style scoped lang="less">
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
</style>