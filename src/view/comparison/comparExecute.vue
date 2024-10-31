<template>
  <div class="steps-second" v-loading="dl_loadingShow" element-loading-text="File download in progress...">
    <p v-if="dl_loadingShow" class="progressBox">
      {{ progress }} / {{ total }}</p>
    <p>比較するオペレーション名（基準日時）を設定して[ダウンロード]ボタンを押すと、比較結果（Excel）がダウンロードできます。</p>
    <div class="searchBtn">
      <el-select v-model="keyWords" clearable filterable allow-create default-first-option :reserve-keyword="false"
        placeholder="比較ジョブ または パラメータシート名を入力" style="width: 400px">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="search">フィルタ</el-button>
    </div>
    <el-table :data="tableData" v-loading="loadingShow" element-loading-text="loading..." style="width: 100%"
      :height="tableHeight" :header-cell-style="headerStyle" :header-cell-class-name="headerClass" @cell-dblclick="cellClick"
      :cell-style="cellStyle" :default-sort="{ prop: 'compare_name', order: 'ascending' }">
      <el-table-column label="比較ジョブ">
        <el-table-column label="比較ジョブ">
          <el-table-column label="" prop="compare_name" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="対象パラメータシート1" header-align="center">
        <el-table-column label="パラメータシート名">
          <el-table-column label="" prop="target_menu_1" />
        </el-table-column>
        <el-table-column label="オペレーション名（基準日時)" header-align="center">
          <el-table-column :index="1">
            <template #header>
              <div class="header-box searchBtn_h times">
                <el-select v-model="p1_all_date" placeholder="オペレーション名（基準日時）で選択" size="small" filterable>
                  <el-option v-for="item in optionsCopy" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button size="small" @click="setDate(parameterSheetType[0])">一括</el-button>
              </div>
            </template>
            <template #default="{ row }">
              <div class="times">
                <el-select ref="selectP1" v-if="row.p1_date_edit" v-model="row.p1_select" placeholder="オペレーション名（基準日時）で選択"
                  size="small" @change="changehandle(row, parameterSheetType[0])"
                  @blur="blurhandle(row, parameterSheetType[0])" @visible-change="visibleChangeP1"
                  value-key="operation_id" :automatic-dropdown="true" filterable>
                  <el-option v-for="item in optionsCopy" :key="item.operation_id" :label="item.label" :value="item" />
                </el-select>
                <div v-if="row.p1_date_edit == false">{{ row.p1_label }}<br />{{ row.p1_date }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column label="対象パラメータシート2" header-align="center">
        <el-table-column label="パラメータシート名">
          <el-table-column label="" prop="target_menu_2" />
        </el-table-column>
        <el-table-column label="オペレーション名（基準日時)" header-align="center">
          <el-table-column :index="2" class="comparExcuteClass">
            <template #header>
              <div class="header-box searchBtn_h times">
                <el-select v-model="p2_all_date" placeholder="オペレーション名（基準日時）で選択" size="small" class="operation-select"
                  filterable>
                  <el-option v-for="item in optionsCopy" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button size="small" @click="setDate(parameterSheetType[1])">一括</el-button>
              </div>
            </template>
            <template #default="{ row }">
              <div class="times">
                <el-select ref="selectP2" v-if="row.p2_date_edit" v-model="row.p2_select" placeholder="オペレーション名（基準日時）で選択"
                  size="small" class="operation-select" @change="changehandle(row, parameterSheetType[1])"
                  @blur="blurhandle(row, parameterSheetType[1])" @visible-change="visibleChangeP2"
                  value-key="operation_id" :automatic-dropdown="true" filterable>
                  <el-option v-for="item in optionsCopy" :key="item.operation_id" :label="item.label" :value="item" />
                </el-select>
                <div v-if="row.p2_date_edit == false">{{ row.p2_label }}<br />{{ row.p2_date }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column label="ダウンロード" header-align="center" width="130px">
        <el-table-column>
          <el-table-column width="130px" align="center">
            <template #header>
              <el-tooltip class="box-item" effect="light" content="すべての比較結果をダウンロードします。" placement="top">
                <el-button size="small" class="exBtn" type="primary" @click="download_ComparFile(null, true)"><el-icon
                    size="small">
                    <Download />
                  </el-icon></el-button>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <div class=""><el-icon style="cursor: pointer;color: #da6a38;" size="large"
                  @click="download_ComparFile(row, false)">
                  <Download />
                </el-icon>
                <el-tooltip v-if="row.downloadErrorFlag" ref="tooltip" :disabled="tooltipShow" effect="dark"
                  content="エラー詳細" placement="top">
                  <div style="
                  display: inline;
                  margin-top: 8px;
                  margin-left: 2px;
                  margin-right: 2px;
                ">
                    <el-popover @before-leave="closeTooltip" ref="popover" placement="right" width="50%"
                      trigger="click">
                      <template #reference>
                        <el-icon @click="closeTooltip" size="large">
                          <Warning style="cursor: pointer" color="red" />
                        </el-icon>
                      </template>
                      <div class="errorTable">
                        <el-table :data="downloadErrorTableData[row.compare_name]" border height="150px">
                          <el-table-column width="150" prop="title" label="エラー列" v-if="false"></el-table-column>
                          <el-table-column prop="content" label="エラー内容"></el-table-column>
                        </el-table>
                      </div>
                    </el-popover>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  nextTick,
  onMounted
} from "vue";
import { useStore } from "../../store/index";
import { operationList, comparFileDownload } from "../../api/comparApi";
import { ElMessage } from "element-plus";
import {
  Loading,
  Download,
  Warning,
} from "@element-plus/icons-vue";
import { downloadFile } from "../../utils/downloadFile";
import { eventBus } from "../../store/eventBus";

export default defineComponent({
  name: "ComparExcute",
  components: {
    Loading,
    Download,
    Warning
  },
  emits: ["downloadStart"],
  setup(props, { emit }) {
    const progress = ref(0);
    const total = ref(0);
    const p1_all_date = ref('')
    const p2_all_date = ref('')
    const loadingShow = ref(true);
    const dl_loadingShow = ref(false);
    const tableData: any = reactive([]);
    const tableListData: any = reactive([]);
    const selectP1:any = ref(null);
    const selectP2:any = ref(null);
    // event bus
    const bus = eventBus();
    const parameterSheetType = reactive(["parameter1", "parameter2",])
    const options = [
      {
        value: '[収集：収集比較]',
        label: '[収集：収集比較]',
      },
      {
        value: '[収集：構築比較]',
        label: '[収集：構築比較]',
      },
      {
        value: '[構築：構築比較]',
        label: '[構築：構築比較]',
      }
    ];
    const keyWords = ref<string>("");
    const store = useStore();
    const optionsCopy: any = ref([]);
    const tooltipShow = ref(false);
    const downloadErrorFlag = ref(true);
    const downloadErrorTableData: any = ref({});
    const parameterSheet1_row_3_col_index = 2
    const parameterSheet2__row_3_col_index = 4
    const download_row_3_col_index = 5
    const download_row_0_col_index = 3
    const download_row_1_col_index = 5
    const closeTooltip = () => {
      tooltipShow.value = !tooltipShow.value;
    };
    const cellStyle = (row: any) => {
      let style: object = {
        'background-color': 'rgba(242, 230, 183, 0.533) !important',
        'color': "#A8ABB2"
      };
      if (row.columnIndex != undefined && ((row.columnIndex == parameterSheet1_row_3_col_index && row.row.p1_label == "ダブルクリックで選択") || (row.columnIndex == parameterSheet2__row_3_col_index && row.row.p2_label == "ダブルクリックで選択"))) {
        return style;
      }
      if (row.columnIndex != undefined && ((row.columnIndex == download_row_3_col_index))) {
        return "";
      }
      return { 'vertical-align': 'top' };
    };

    const createdTableData = () => {
      loadingShow.value = true
      tableData.length = 0
      let loggedComparJobs = store.getLoggedComparJob;
      loggedComparJobs.forEach((arr: any) => {
        arr.p1_label = "ダブルクリックで選択";
        arr.p1_date = "　";
        arr.p1_date_value = "";
        arr.p1_date_edit = false;
        arr.p2_label = "ダブルクリックで選択";
        arr.p2_date = "　";
        arr.p2_date_value = "";
        arr.p2_date_edit = false;
        arr.p1_select = null;
        arr.p2_select = null;
        arr.download_icon_enable = false;
        arr.downloadErrorFlag = false;
        tableData.push(arr);
        tableListData.push(arr);
      })
    }
    createdTableData()
    const getOperationList = () => {
      operationList()
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
          optionsCopy.value = JSON.parse(JSON.stringify(tmpoptions));

          optionsCopy.value.sort(function (a: any, b: any) {
            if (a.dateVal > b.dateVal) {
              return -1;
            }
            if (a.dateVal < b.dateVal) {
              return 1;
            }
            return 0;
          })
          loadingShow.value = false
        }).catch((error: any) => {
          loadingShow.value = false
          ElMessage({
            type: "error",
            message: error,
          });
        });

    }
    getOperationList()
    const headerStyle = ({ row, rowIndex, columnIndex, column }: any) => {
      let style: object = {
        'background-color': '#ffffff !important',
        'border-bottom': '1px solid #c3c3c3',
      };
      if (rowIndex === 2) {
        return style;
      }
      if (rowIndex === 0 && columnIndex === 0) {
        row[0].colSpan = 1;
        row[0].rowSpan = 2;
      }
      if (rowIndex === 1 && columnIndex === 0) {
        return { display: 'none' };
      }
      if (rowIndex === 0 && columnIndex === download_row_0_col_index) {
        row[3].colSpan = 1;
        row[3].rowSpan = 2;
      }
      if (rowIndex === 1 && columnIndex === download_row_1_col_index) {
        return { display: 'none' };
      }
    };
    const download_ComparFile = async (data: any, isAll: any) => {
      dl_loadingShow.value = true;
      bus.emit("downloadStart", true);
      tableData.forEach((item: any) => {
        if (isAll || item.compare_name == data.compare_name) { item.downloadErrorFlag = false; }
      })
      if (isAll) {
        total.value = tableData.length;
        for (const item of tableData) {
          await downloadHandle(item);
        }
      } else {
        total.value = 1
        await downloadHandle(data);
      }
      resetState();
    }
    const resetState = () => {
      total.value = 0;
      progress.value = 0;
      dl_loadingShow.value = false;
      bus.emit("downloadStart", false);
    }
    const downloadHandle = (async (data: any) => {
      let res_data:any = {
        compare: data.compare_name,
        host: store.getLoggedComparHost
      };
      if (data.p1_date_value != '' && data.p1_date_value != null) {
        res_data.base_date_1 = addSecondProcessing(data.p1_date_value)
      }
      if (data.p2_date_value != '' && data.p2_date_value != null) {
        res_data.base_date_2 = addSecondProcessing(data.p2_date_value)
      }
      progress.value = progress.value + 1;
      await comparFileDownload(res_data)
        .then((res: any) => {
          let base64Code = res.data.data.file_data;
          let name: string = res.data.data.file_name;
          downloadFile(base64Code, name);
        })
        .catch((err: any) => {
          let arr: any = [];
          if (isJSON(err)) {
            let error = JSON.parse((err))
            let arr: any = [];
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
          } else {
            let obj: any = {};
            obj.title = '-';
            obj.content = err;
            arr.push(obj);
          }
          tableData.forEach((item: any) => {
            if (item.compare_name == data.compare_name) {
              item.downloadErrorFlag = true;
              downloadErrorTableData.value[item.compare_name] = arr;
            }
          })
        });
    })
    const isJSON = (str: any) => {
      if (typeof str == "string") {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == "object" && obj) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
      return false;
    };
    function addSecondProcessing(datetimeStr: any) {
      let datetime = new Date(datetimeStr);
      datetime.setSeconds(datetime.getSeconds() + 1);
      const year = datetime.getFullYear().toString();
      const month_c = datetime.getMonth() + 1
      const month = month_c.toString().padStart(2, '0');;
      const day = datetime.getDate().toString().padStart(2, '0');;
      const hours = datetime.getHours().toString().padStart(2, '0');
      const minutes = datetime.getMinutes().toString().padStart(2, '0');
      const seconds = datetime.getSeconds().toString().padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };
    const cellClick = ((row: any, column: any) => {
      if (column.index != undefined && column.index == 1) {
        row.p1_date_edit = true;
        nextTick(() => { selectP1.value?.focus(); })
      }
      if (column.index != undefined && column.index == 2) {
        row.p2_date_edit = true;
        nextTick(() => { selectP2.value?.focus(); })
      }
    })
    const visibleChangeP1 = ((visible: boolean) => {
      if (!visible) {
        tableData.forEach((item: any) => { item.p1_date_edit = false; })
      }
    })
    const visibleChangeP2 = (visible: boolean) => {
      if (!visible) {
        tableData.forEach((item: any) => { item.p2_date_edit = false; })
      }
    }

    const blurhandle = ((row: any, parametersheetType: string) => {
      if (parameterSheetType[0] === parametersheetType) {
        row.p1_date_edit = false;
      } else {
        row.p2_date_edit = false;
      }
    })

    const changehandle = ((row: any, parametersheetType: string) => {
      if (parameterSheetType[0] === parametersheetType) {
        row.p1_date_edit = false;
        row.p1_label = row.p1_select.operation_name;
        row.p1_date = "(" + row.p1_select.dateVal + ")";
        row.p1_date_value = row.p1_select.dateVal;
      } else {
        row.p2_date_edit = false;
        row.p2_label = row.p2_select.operation_name;
        row.p2_date = "(" + row.p2_select.dateVal + ")";
        row.p2_date_value = row.p2_select.dateVal;
      }
    })
    const setDate = ((parametersheetType: string) => {
      let val = p1_all_date.value;
      if (parameterSheetType[1] === parametersheetType) {
        val = p2_all_date.value;
      }
      if (val == '' || val == null) {
        ElMessage({
          type: "warning",
          message: "オペレーション名（基準日時）を選択してください。",
        });
      }
      optionsCopy.value.forEach((option: any) => {
        if (val == option.operation_name) {
          tableData.forEach((item: any) => {
            if (parameterSheetType[0] == parametersheetType) {
              item.p1_label = option.operation_name;
              item.p1_date = "(" + option.dateVal + ")";
              item.p1_select = option;
              item.p1_date_value = option.dateVal;
            } else {
              item.p2_label = option.operation_name;
              item.p2_date = "(" + option.dateVal + ")";
              item.p2_select = option;
              item.p2_date_value = option.dateVal;
            }
          })
        }
      })
    })
    // search
    const search = (() => {
      if (keyWords.value) {
        let result = tableListData.filter((item: any) => {
          if (
            item.compare_name.indexOf(keyWords.value) != -1 ||
            item.target_menu_1?.indexOf(keyWords.value) != -1 ||
            item.target_menu_2?.indexOf(keyWords.value) != -1
          )
            return item;
        });
        tableData.length = 0;
        result.forEach((element: any) => {
          tableData.push(element);
        });
      } else {
        tableData.length = 0;
        tableListData.forEach((el: any) => {
          tableData.push(el);
        });
      }
    })
    const headerClass = (({ row, rowIndex, columnIndex, column }: any) => {
      if (rowIndex === 2 && columnIndex === 2) {
        return 'comparExcuteClass';
      }

    })
    let tableHeight = ref(0);
    onMounted(() => {
      tableHeight.value = window.innerHeight - 342;
    });
    return {
      loadingShow,
      keyWords,
      options,
      tableData,
      tableListData,
      p1_all_date,
      p2_all_date,
      optionsCopy,
      search,
      download_ComparFile,
      headerStyle,
      cellClick,
      cellStyle,
      blurhandle,
      changehandle,
      visibleChangeP1,
      visibleChangeP2,
      selectP1,
      selectP2,
      setDate,
      parameterSheetType,
      dl_loadingShow,
      closeTooltip,
      tooltipShow,
      downloadErrorFlag,
      downloadErrorTableData,
      progress,
      total,
      headerClass,
      tableHeight,
    }
  },
})
</script>
<style scoped lang="less">
.progressBox {
  width: 100px;
  text-align: center;
  position: absolute;
  top: 30%;
  left: calc(50% - 50px);
  z-index: 2002;
}

.errorTable {
  /deep/.el-table thead tr th {
    background-color: #bd3333 !important;
    color: #fff;
  }
}



.header-box {
  display: flex;
  justify-content: space-between;
  margin-top: 0px;
  margin-bottom: 2px;
}

.comparExcuteClass {
  .cell {
    background-color: #bd3333 !important;
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

.times {
  /deep/.el-select {
    width: 100%;

    .el-input__wrapper {
      border-radius: 0px;
    }
  }
}

.searchBtn_h {
  /deep/ button {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;

    &:hover {
      color: #fff;
      border-color: #da6a38;
      background-color: #da6a38;
      opacity: 0.8;
    }
  }
}

.exBtn {
  border-color: #da6a38;
  background-color: #da6a38;
  margin-bottom: 3px;
  margin-top: -1px;

  &:hover {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    opacity: 0.8;
  }
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
</style>
<style lang="less"></style>
