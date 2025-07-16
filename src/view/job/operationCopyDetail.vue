<template>
  <el-dialog v-model="visible" :close-on-click-modal="false" :close-on-press-escape="false" class="detailBoxSheet"
    :show-close="false">

    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false" v-model="confirmVisible" width="70%"
      @close="confirmVisible = false" :show-close="false">
      <div style="font-size: 18px;">{{ paraSheet }}</div>
      <span style="display: block; margin-top: 20px">
        <p>
          オペレーションは必ずこのウィザードで新規作成または選択したものを選択してください。
        </p>
        <p>拡張子がjson、xlsx、xlsmのファイルのみアップロードできます。</p>
      </span>
      <el-upload ref="upload" v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
        accept=".json,.xlsx,.xlsm" :on-change="handleChange" :on-remove="handleRemove" :on-exceed="handleExceed"
        :auto-upload="false">
        <template #trigger>
          <el-button type="primary" style="background-color: #418d45; border-color: #418d45; margin: 20px 50%"
            class="loadbtn"><el-icon>
              <FolderAdd />
            </el-icon>&nbsp;
            ファイルを選択
          </el-button>
        </template>
      </el-upload>
      <template #footer>
        <el-button id="uploadBtn1" type="primary" @click="confirmVisible = false">閉じる</el-button>
        <el-button id="uploadBtn2" type="primary" @click="uploadRegister">登録</el-button>

        <!-- error info -->
        <div class="errorTable">
          <el-table v-show="errorImportFlag" border :data="errorImportTableData" style="margin-top: 20px">
            <el-table-column width="150" prop="title" label="エラー列"></el-table-column>
            <el-table-column prop="content" label="エラー内容"></el-table-column>
          </el-table>
        </div>
      </template>
    </el-dialog>
    <ReadOnlySheet :dialogVisibleSheet="dialogVisibleSheet" @change="change" :movementName="movementName"
      :readParams="paramsSheetValue" :readOperation="operation" :isInitOperation="isInitOperation"></ReadOnlySheet>


    <div style="justify-content: space-between;display: flex;">
      <div>
        <span
          style="font-size: 18px;font-weight: bold">パラメータシート編集</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <el-select v-model="parametersheetvalue" placeholder="パラメータシートを選択する" style="width: 400px;"
          @change="parametersheetChange" :disabled="isBtnDisable">
          <el-option v-for="item in parametersheetRadios" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div style="justify-content: right;display: flex;">
        <div style="text-align: center">
          オペレーション名（基準日時)：
        </div>
        <div style="text-align: left;padding-right: 20px;">
          <div>&nbsp;&nbsp;{{ loginOperation }}</div>
          <div>（{{ logOperationScheduledDate }}）</div>
        </div>
      </div>
    </div>
    <div style="height: 26px;cursor:pointer" @click="isShow = !isShow">
      <el-divider content-position="left"><el-icon v-show="!isShow">
          <CaretRight />
        </el-icon>
        <el-icon v-show="isShow">
          <CaretBottom />
        </el-icon><span style="margin-left: 5px;">既存パラメータからコピー</span></el-divider>
    </div>
    <div v-show="isShow" style="margin-top: 5px;">
      <p>
        <span>　　パラメータシート</span>
        <el-select v-model="paramsValue" placeholder="コピー元のパラメータシートを選択する" style="width: 410px;margin-left: 15px;" :disabled="isBtnDisable"
          filterable @change="changeval">
          <el-option v-for="item in sheetRadios" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>&nbsp;&nbsp;&nbsp;&nbsp;
      </p>
      <div v-if="isGather" style="display: flex;align-items: end;justify-content: start;margin: 0%;">
        <div>
          <p style="margin: 0%;">　　オペレーション名<el-checkbox v-model="checked1" label="収集初期値管理のみ表示" 
              style="--el-checkbox-checked-text-color:#0960bd;vertical-align:middle;margin-left: 15px;" size="small" @change="checkBoxChange"/></p>
          　　　　　　　　　　　<el-select v-model="operation" placeholder="コピー元のオペレーションを選択する" style="width: 410px"
            :disabled="isBtnDisable" @change="copyOperationChange" >
            <el-option v-for="item in operationRadios" :key="item.value" :label="item.label" :value="item.value" :style="{ display: isGather && checked1? (item.isFlagOne ? 'list-item':'none'):'list-item'}"/>
          </el-select>&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
        <div style="margin: 0%;">
          <p style="margin: 0%;">ホスト</p>
          <el-select v-model="selectedValues" multiple clearable collapse-tags collapse-tags-tooltip
            placeholder="作業対象のホストを選択する" :max-collapse-tags="1" style="width: 300px"
            @visible-change="handleDropdownVisibleChange" :disabled="isBtnDisable">
            <div class="host-el-select__popper">
              <el-checkbox v-show="dropdownVisible" :indeterminate="isIndeterminate" v-model="isAllSelected"
                @change="handleSelectAllChange">すべて</el-checkbox>
            </div>
            <div class="selectDivider"><el-divider></el-divider></div>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>&nbsp;&nbsp;&nbsp;
        </div>
        <div>
          <el-button type="primary" class="copyBtn" @click="handleCopy" :disabled="isBtnDisable"><el-icon>
          <DocumentCopy />
        </el-icon>&nbsp;コピー</el-button>
      <el-button type="primary" class="browsebtn" @click="openReadSheet" :disabled="isBtnDisable"><el-icon>
          <Search />
        </el-icon>&nbsp;パラメータ参照</el-button>
        </div>
      </div>
      <div v-if = "!isGather">
        <span>　　オペレーション名</span>
      <el-select v-model="operation" placeholder="コピー元のオペレーションを選択する" style="width: 410px;margin-left: 15px;" :disabled="isBtnDisable">
        <el-option v-for="item in operationRadios" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>&nbsp;&nbsp;&nbsp;&nbsp;
      <span>ホスト</span>
      <el-select v-model="selectedValues" multiple clearable collapse-tags collapse-tags-tooltip
        placeholder="作業対象のホストを選択する" :max-collapse-tags="1" style="width: 300px;margin-left: 15px;" 
        @visible-change="handleDropdownVisibleChange" :disabled="isBtnDisable">
        <div class="host-el-select__popper">
          <el-checkbox v-show="dropdownVisible" :indeterminate="isIndeterminate" v-model="isAllSelected"
            @change="handleSelectAllChange">すべて</el-checkbox>
        </div>
        <div class="selectDivider"><el-divider></el-divider></div>
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>&nbsp;&nbsp;&nbsp;
      <el-button type="primary" class="copyBtn" @click="handleCopy" :disabled="isBtnDisable"><el-icon>
          <DocumentCopy />
        </el-icon>&nbsp;コピー</el-button>
      <el-button type="primary" class="browsebtn" @click="openReadSheet" :disabled="isBtnDisable"><el-icon>
          <Search />
        </el-icon>&nbsp;パラメータ参照</el-button>
      </div>
      <p class="defDivider"><el-divider /></p>
    </div>
    <div style="margin-bottom: 0px;justify-content: space-between;display: flex;">
      <div style="padding: 0px 20px;margin-bottom: 15px; ">
      </div>
      <div style="padding: 0px 20px;margin-bottom: 15px; ">
        <el-popconfirm hide-after="0" width="300px" confirm-button-text="Json" cancel-button-text="Excel"
          icon-color="#626AEF" title="ファイルタイプを選択してください。" @cancel="exportLeft" @confirm="exportLeftJson">
          <template #reference>
            <el-button class="loadbtn" type="primary" :disabled="isBtnDisable"><el-icon>
                <Download />
              </el-icon>&nbsp;
              ダウンロード</el-button>
          </template>
        </el-popconfirm>
        <el-button type="primary" class="loadbtn" @click="importExcel" :disabled="isBtnDisable"><el-icon>
            <Upload />
          </el-icon>&nbsp; アップロード</el-button>
      </div>
    </div>
    <div style="border: 1px solid #dcdfe6;margin-right: 19px;">
      <EditSheet v-if="isShowditSheet" :dialogVisibleEdit="editvisible" @changeEdit="changeEdit"
        :movementName="movementName" :editParams="paraSheetLeftRegister" :editOperation="loginOperation"
        @setButtonStatus="setButtonStatus" @editSheetchangestatus="editSheetchangestatus"></EditSheet>
    </div>

    <template #footer>
      <el-button id="closeBtn1" type="primary" @click="cancel" :disabled="isBtnDisable">閉じる</el-button>
      <el-button id="saveBtn2" type="primary" @click="register" :disabled="isBtnDisable">保存</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="errormsgshow" @close="messagecancel" class="errorBox">
    <h3>{{ errormsg }}</h3>
    <div class="errorTable" v-if="errormsgTableshow">
      <el-table :data="copyErrorTableData" border height="250px">
        <!-- <el-table-column width="90" prop="serialNum" label="操作" ></el-table-column> -->
        <el-table-column width="150" prop="title" label="エラー列"></el-table-column>
        <el-table-column prop="content" label="エラー内容"></el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  watch,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
} from "vue";
import ReadOnlySheet from "./components/readOnlySheet.vue";
import EditSheet from "./components/editSheet.vue";
import type { UploadProps, UploadRawFile,UploadUserFile } from "element-plus";
import { FileToBase64 } from "../../utils/fileToBase64";
import { useStore } from "../../store/index";
import { eventBus } from "../../store/eventBus";
import {
  menuItem,
  restNameApi,
  optionName,
  optionAllRegister,
  exportExcelAPI,
  relationships,
  getOperationDataSetInfosByFlag,
  getDefOperationInfos
} from "../../api/jobApi";
import { importApi, } from "../../api/index";
import {
  Download,
  Upload,
  DArrowRight,
  Warning,
  QuestionFilled,
  Edit,
  Search,
  CaretRight,
  CaretBottom,
  DocumentCopy,
  FolderAdd
} from "@element-plus/icons-vue";
import { ElMessage, ElSelect, ElUpload, genFileId,ElMessageBox } from "element-plus";

interface Radio {
  label: string;
  value: string;
  isFlagOne: boolean;
}
export default defineComponent({
  name: "DialogDetail",
  components: {
    ElSelect,
    Download,
    DArrowRight,
    Upload,
    ElUpload,
    ReadOnlySheet,
    EditSheet,
    Warning,
    QuestionFilled,
    Edit,
    Search,
    CaretRight,
    CaretBottom,
    DocumentCopy,
    FolderAdd
  },
  props: ["dialogVisible", "type", "movementName", "parametersheet","isGather"],
  emits: ["change", "changestatus", "changestatusString"],
  setup(props, { emit }) {
    // event bus
    const instance: any = getCurrentInstance();
    const bus = eventBus();

    const copyDetail = function (a: any) {
      bus.emit("copyDetail", a);
    };
    const uploadCopy = function (a: any) {
      bus.emit("uploadCopy", a);
    };

    const errormsg: any = ref("");
    const errormsgshow: any = ref(false);
    const errormsgTableshow: any = ref(false);
    const store = useStore();
    // The selected host
    let host = store.getHost;
    // table loading
    const loadingShow = ref(true);
    const loadingShowRightTable = ref(false);
    let selectName = store.getOperationSelect;
    // isDisabledRight download
    let isDisabledRight = ref(false);
    let loginOperation = store.getLoginOperation;
    let logOperationScheduledDate = store.getLogOperationScheduledDate;
    let paraSheet = ref("");
    let paraSheetCopySource = ref("");
    let paraSheetLeft = ref("");
    let paraSheetLeftRegister = ref("");
    let tableData: any = reactive([]);
    // let hostId: any = reactive({});
    let tableDataLeft: any = reactive([]);
    // first selector
    let paramsValue = ref("");
    let paramsSheetValue = ref("");
    const hostTable: any = ref(null);
    let operation = ref("");
    let visible: any = ref(props.dialogVisible);
    let dialogVisibleSheet = ref(false);
    let dialogVisibleEdit = ref(false);
    let movementName: any = ref(props.movementName);
    let parametersheetRadios: any = ref(props.parametersheet);
    let parametersheetvalue: any = ref("");
    let leftDownloadFileNamePrefix = ref("")
    let isInitOperation = ref(false);
    // コピー元パラメータシート種別
    let type = ref(props.type);
    let tableHeight = ref();
    // ERROR INFO
    let errorImportFlag = ref(false);
    let errorImportTableData: any = reactive([]);
    // file list
    const fileList = ref<UploadUserFile[]>([]);
    //  movementDataSet
    const relationshipsDataArray = ref([]);
    const isShowditSheet:any = ref(true);
    // get Replication relationships
    const getRelationships = () => {
      relationships()
        .then((res: any) => {
          relationshipsDataArray.value = res.data.data;
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    getRelationships();
    onMounted(() => {
      tableHeight.value = window.innerHeight - 525;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 525;
      };
      // ce edit sheet
      bus.on("ceEdit", (a: any) => {
        copyErrorFlag.value = false;
        copyErrorTableData.length = 0;
        // upload copy
        errorImportFlag.value = false;
        errorImportTableData.length = 0;
      });
      bus.on("uploadCopy", (a: any) => {
        copyErrorFlag.value = false;
        copyErrorTableData.length = 0;
      });
      bus.on("copyDetail", (a: any) => {
        errorImportFlag.value = false;
        errorImportTableData.length = 0;
      });
      bus.on("exportRight", (a: any) => {
        exportRight();
      });
      bus.on("exportRightJson", (a: any) => {
        exportRightJson();
      });
      editvisible.value = true;
    });
    onBeforeUnmount(() => {
      bus.off_all("ceEdit");
      bus.off_all("uploadCopy");
      bus.off_all("exportRight");
      bus.off_all("exportRightJson");
      bus.off_all("copyDetail");
      bus.off_all("register")
      bus.off_all("cancelEditSheet");
      bus.off_all("parametersheetChange");
      isShowditSheet.value=false
    });
    const options: any = ref([]);
    let leftRestNameValueMapping:any = reactive({});
    const getMenuItem = (isParametersheetChange:boolean=false) => {
      loadingShow.value = true;
      tableData.length = 0;
      options.value.length = 0;
      let host = store.getHost;
      leftRestNameValueMapping.length = 0;
      if (!isParametersheetChange) {
        sheetRadios.length = 0;
      }
      

      host.forEach((el) => {
        let numObj = {
          host_name: el.host_name,
          num: null,
          managed_system_item_number: el.managed_system_item_number,
        };
        tableData.push(numObj);
        let hostlist = {
          value: el.managed_system_item_number,
          label: el.host_name,
        };
        options.value.push(hostlist);
      });
      parametersheetvalue.value = movementName.value;
      let realMenuItem = '';
      parametersheetRadios.value.forEach((el:any) => {
        if (parametersheetvalue.value == el.value) {
          realMenuItem = el.label;
          return;
        }
      })
      let obj2 = {
          discard: {
            NORMAL: 0,
          },
          menu_name_en: { LIST: [realMenuItem] },
        };
        restNameApi(obj2)
          .then(async (res: any) => {
            if (!isParametersheetChange) {
              let enNameValue = res.data.data[0].parameter.menu_name_en;
              let restNameValue = res.data.data[0].parameter.menu_name_rest;
              paraSheet.value = enNameValue;
              paraSheetCopySource.value = "";

              // 構築 or 収集
              paraSheetLeft.value = restNameValue;
              paraSheetLeftRegister.value = restNameValue;
              
              getSheetList("type.value",restNameValue);
              //収集結果
              let result: any = relationshipsDataArray.value.find(
                  (item: any) => item.parameter.movement == movementName.value
              );
              if (result && result.parameter.source_parameter) {
                let objData = {
                  discard: { NORMAL: 0 },
                  menu_name_ja: {
                    LIST: [result.parameter.source_parameter],
                  },
                };
                // パラメータシート定義一覧 restName
                let restName: any = await restNameApi(objData);
                let data = restName.data.data[0];
                paraSheetCopySource.value = data.parameter.menu_name_en;
                getSheetList("収集結果",data.parameter.menu_name_rest);

              }
              // get table data left
              if (restNameValue) {
                getTableLeft(restNameValue);
              }
            }
            

            editvisible.value = true;
          })
          .catch((error: any) => {
            ElMessage({
              type: "error",
              message: error,
            });
          });
    };
    // get sheet list
    let sheetRadios: Array<Radio> = reactive([]);
    const getSheetList = (str: string,objval:string) => {
      try {
        let obj: Radio = {
          label: "",
          value: objval,
          isFlagOne:false
        };
        if (str == "収集結果") {
          obj.label = paraSheetCopySource.value;

          if (paraSheetCopySource.value) {
            sheetRadios.push(obj);
          } else {
            paramsValue.value = "";
            paramsSheetValue.value = "";
            leftDownloadFileNamePrefix.value = "";
          }
          return;
        } else {
          obj.label = paraSheet.value;
          if (paraSheet.value) {
            sheetRadios.push(obj);
          } else {
            paramsValue.value = "";
            paramsSheetValue.value = "";
            leftDownloadFileNamePrefix.value = "";
          }
        }

        sheetRadios.forEach((el) => {
          if (el.value) {
            getOperations(el.value);
            paramsValue.value = el.value;
            paramsSheetValue.value = el.value;
            leftDownloadFileNamePrefix.value = el.label;
          }
        });
        if (sheetRadios.length == 0) {
          operationRadios.length = 0;
        }
      } catch (error: any) {
        ElMessage({
          type: "error",
          message: error,
        });
      }
    };
    const getOperations = async (restNameValue: string) => {
      let operationDataSetInfosByFlag: any[] = []; 
      await getOperationDataSetInfosByFlag().then(async(res: any) => {
        let data = res.data.data;
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
        await getDefOperationInfos(senddata).then(async (res_info: any) => {
          let data = res_info.data.data;
          data.forEach((element: any) => {
            operationDataSetInfosByFlag.push(element.parameter.operation_name);
        });
        }).catch((err: any) => {
        loadingShow.value = false;
        ElMessage({
          type: "error",
          message: err,
        });
      });
      }).catch((err: any) => {
        loadingShow.value = false;
        ElMessage({
          type: "error",
          message: err,
        });
      });
      let params = {
        discard: {
          NORMAL: "0",
        },
      };
      await optionName(params, restNameValue)
        .then((res: any) => {
          let data = res.data.data;
          let arr: any = [];
          // sort by operation_date
          let arrResult1 = data.sort((a: any, b: any) =>
            b.parameter.operation_date.localeCompare(a.parameter.operation_date)
          );

          arrResult1.forEach((el: any) => {
            let obj: Radio = {
              label: el.parameter.operation_name_disp,
              value: el.parameter.operation_name_disp,
              isFlagOne: operationDataSetInfosByFlag.indexOf(el.parameter.operation_name_disp) != -1
            };
            arr.push(obj);
          });
          let object: any = {};
          let arr1 = arr.reduce((array: any, next: any) => {
            if (!object[next.value]) {
              array.push(next);
              object[next.value] = true;
            }
            return array;
          }, []);
          operationRadios.length = 0;
          arr1.forEach((el: any) => {
            if (el.value !== loginOperation) {
              operationRadios.push(el);
            }
          });
          disabledAll.value = false;
        })
        .catch((error: any) => {
          disabledAll.value = false;
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    watch(
      props,
      (val, old) => {
        visible.value = val.dialogVisible;
        // eg:収集
        type.value = val.type;
        movementName.value = val.movementName;
        if (visible.value) {
          if (movementName.value) {
            isGather.value = props.isGather
            getMenuItem();
            operation.value = "";
            selectedValues.value = [];
          }
        }
      },
      { immediate: true, deep: true }
    );

    const getTableLeft = async (value: string) => {
      let host = store.getHost;

      host.forEach((el) => {
        let numObj = {
            host_name: el,
            num: 0,
            managed_system_item_number: el.managed_system_item_number,
          };
          tableDataLeft.push(numObj);
        })
         
        loadingShow.value = false;
    };

    const getTableRight = (value: string) => {
      let host = store.getHost;

      host.forEach((el) => {
        let numObj = {
            host_name: el,
            num: 0,
            managed_system_item_number: el.managed_system_item_number,
          };
          tableData.push(numObj);
        })
        loadingShowRightTable.value = false;
    };
    const cancel = () => {
      bus.emit("cancelEditSheet");
      visible.value = false;
      // upload error info
      errorImportFlag.value = false;
      fileList.value = [];
      uploadFileCopy = {};
      // copy error info
      copyErrorFlag.value = false;
      copyErrorTableData.length = 0;
      isShow.value = false;

      if (instance.proxy.hostTable) {
        instance.proxy.hostTable.clearSelection();
      }
      editvisible.value = false;
    };
    const tooltipShow = ref(false);
    const copyErrorFlag = ref(false);
    let copyErrorTableData: any = reactive([]);
    const closeTooltip = () => {
      tooltipShow.value = !tooltipShow.value;
    };
    watch(visible, (val, old) => {
      emit("change", val);
    });
    let selectedHost: any = reactive([]);
    const rowClass = ({ row }: any) => {
      if (selectedHost.includes(row)) {
        return { color: "#0960bd" };
      }
    };
    const rowClick = (val: any) => {
      // Whether the line that is clicked is in the selected array
      let resultFlag = selectedHost.findIndex((item: any) => {
        return item.managed_system_item_number == val.managed_system_item_number;
      });
      if (resultFlag == -1) {
        hostTable.value!.toggleRowSelection(val, true);
      } else {
        hostTable.value!.toggleRowSelection(val, false);
      }
    };

    let operationRadios: any = reactive([]);
    let movementSelect: any = reactive([]);

    const changeval = (val: any) => {
      paraSheetLeft.value = val
      paramsSheetValue.value = val;
      operation.value = "";
      sheetRadios.forEach((el) => {
        if (el.value == val) {
          getOperations(el.value);
          paramsValue.value = el.value;
          paramsSheetValue.value = el.value;
          leftDownloadFileNamePrefix.value = el.label;
        }
      });
      if (sheetRadios.length == 0) {
        operationRadios.length = 0;
      }
      // copy error info
      copyErrorFlag.value = false;
      copyErrorTableData.length = 0;

      loadingShowRightTable.value = true;

      tableData.length = 0;
      if (hostTable.value) {
        hostTable.value.clearSelection();
      }
      let host = store.getHost;
      host.forEach((el) => {
        let numObj = {
          host_name: el.host_name,
          num: null,
          managed_system_item_number: el.managed_system_item_number,
        };
        tableData.push(numObj);
      });
      loadingShowRightTable.value = false;
    };
    const changeoperation = (val: any) => {
      loadingShowRightTable.value = true;
      operation.value = val;
      decide();
    };

    const upload: any = ref(null);
    const columns = reactive([
      {
        title: "ホスト名",
        dataIndex: "host_name",
      },
      {
        title: "件数",
        dataIndex: "num",
      },
    ]);

    const decide = () => {
      if (operation.value) {
        getTableRight(paramsSheetValue.value);
      } else {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
      }
    };
    const getRowKeys = (row: any) => {
      return row.host_name;
    };

    const selectionChange = (val: any) => {
      selectedHost.length = 0;
      selectedHost = val;
    };

    const handleCopy = () => {
      copyErrorTableData.length = 0;
      if (operation.value) {
        let initoperation = operationRadios.find((item: any) => item.label == operation.value);
        if (initoperation.isFlagOne) {
          ElMessageBox.confirm(
            "収集初期値管理用オペレーションを選択しているため、全てのホストに収集初期値管理で設定したパラメータを登録します。",
            {
              confirmButtonText: "OK",
              cancelButtonText: "Cancel",
              type: "warning",
              customClass: "persdsd",
              dangerouslyUseHTMLString: true,
            }
          ).then(() => {
            const params1 = {
              discard: {
                NORMAL: "0",
              },
              operation_name_disp: {
                LIST: [operation.value],
              },
            };
            const optionsArr: Array<unknown> = [];
            let host = store.getHost;
            optionName(params1, paraSheetLeft.value).then((res: any) => {
              let data = res.data.data;
              data.forEach((baseObj: unknown) => {
                host.forEach(async (itemHost: any) => {
                  let obj1 = JSON.parse(JSON.stringify(baseObj));
                  obj1.parameter.uuid = "";
                  obj1.parameter.operation_name_select = selectName;
                  obj1.parameter.host_name = itemHost.host_name;
                  if (obj1.parameter.file) {
                  } else {
                    obj1.file = null;
                  }
                  optionsArr.push(obj1);
                });
              });

              if (optionsArr.length == 0) {
                ElMessage({
                  type: "warning",
                  message:
                    "コピー元オペレーションにはコピー可能なパラメータがありません。",
                });
              } else {
                optionAllRegister(optionsArr, paraSheetLeftRegister.value)
                  .then((res: any) => {
                    // update operation
                    getTableLeft(paraSheetLeftRegister.value);
                    // error table
                    copyErrorFlag.value = false;
                    let copystatus = {
                      movementName: parametersheetvalue.value,
                      value: paraSheetLeftRegister.value
                    }
                    emit("changestatus", copystatus);
                    if (res.data.data.Register != "0") {
                      editvisible.value = false;;
                      getMenuItem(true)
                      errormsg.value = "「" + paraSheet.value + "」の" + res.data.data.Register + "件パラメータがコピーされました。"
                      errormsgshow.value = true;
                      errormsgTableshow.value = false;
                    } else {
                      ElMessage({
                        type: "warning",
                        message:
                          "コピー元オペレーションにはコピー可能なパラメータがありません。",
                      });
                    }
                    copyDetail(copyErrorFlag.value);
                  })
                  .catch((err: any) => {
                    let isJSONFlag = isJSON(err);
                    copyDetail(copyErrorFlag.value);
                    if (isJSONFlag) {
                      copyErrorFlag.value = true;
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
                              copyErrorTableData.push(obj);
                            }
                          }
                        }
                      }
                      errormsg.value = "「" + paraSheet.value + "」のパラメータコピーに失敗します。"
                      errormsgshow.value = true;
                      errormsgTableshow.value = true;
                    } else {
                      errormsg.value = "「" + paraSheet.value + "」のパラメータコピーに失敗します。"
                      errormsgshow.value = true;
                      errormsgTableshow.value = true;
                    }
                  });
              }
            });
          })
        } else {
          if (selectedValues.value) {
            let hostList = selectedValues.value;
            if (hostList.length == 0) {
              ElMessage({
                type: "warning",
                message:
                  "コピー対象のホストが選択されていません。１つ以上のホストを選択してください。",
              });
            } else {
              const params1 = {
                discard: {
                  NORMAL: "0",
                },
                operation_name_disp: {
                  LIST: [operation.value],
                },
              };
              const optionsArr: Array<unknown> = [];
              let host = store.getHost;
              optionName(params1, paraSheetLeft.value).then((res: any) => {
                let data = res.data.data;
                data.forEach((baseObj: unknown) => {
                  hostList.forEach(async (itemHost: any) => {
                    let obj1 = JSON.parse(JSON.stringify(baseObj));
                    host.forEach((el) => {
                      if (el.host_name == obj1.parameter.host_name) {
                        if (itemHost == el.managed_system_item_number) {
                          obj1.parameter.uuid = "";
                          obj1.parameter.operation_name_select = selectName;
                          if (obj1.parameter.file) {
                          } else {
                            obj1.file = null;
                          }
                          optionsArr.push(obj1);
                        } else if (el.managed_system_item_number == itemHost.hostgroup_id) {
                          obj1.parameter.uuid = "";
                          obj1.parameter.operation_name_select = selectName;
                          if (obj1.parameter.file) {
                          } else {
                            obj1.file = null;
                          }
                          optionsArr.push(obj1);
                        } else {
                        }
                      }
                    })
                  });
                });

                if (optionsArr.length == 0) {
                  ElMessage({
                    type: "warning",
                    message:
                      "コピー元オペレーションにはコピー可能なパラメータがありません。",
                  });
                } else {
                  optionAllRegister(optionsArr, paraSheetLeftRegister.value)
                    .then((res: any) => {
                      // update operation
                      getTableLeft(paraSheetLeftRegister.value);
                      // error table
                      copyErrorFlag.value = false;
                      let copystatus = {
                        movementName: parametersheetvalue.value,
                        value: paraSheetLeftRegister.value
                      }
                      emit("changestatus", copystatus);
                      if (res.data.data.Register != "0") {
                        editvisible.value = false;;
                        getMenuItem(true)
                        errormsg.value = "「" + paraSheet.value + "」の" + res.data.data.Register + "件パラメータがコピーされました。"
                        errormsgshow.value = true;
                        errormsgTableshow.value = false;
                      } else {
                        ElMessage({
                          type: "warning",
                          message:
                            "コピー元オペレーションにはコピー可能なパラメータがありません。",
                        });
                      }
                      copyDetail(copyErrorFlag.value);
                    })
                    .catch((err: any) => {
                      let isJSONFlag = isJSON(err);
                      copyDetail(copyErrorFlag.value);
                      if (isJSONFlag) {
                        copyErrorFlag.value = true;
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
                                copyErrorTableData.push(obj);
                              }
                            }
                          }
                        }
                        errormsg.value = "「" + paraSheet.value + "」のパラメータコピーに失敗します。"
                        errormsgshow.value = true;
                        errormsgTableshow.value = true;
                      } else {
                        errormsg.value = "「" + paraSheet.value + "」のパラメータコピーに失敗します。"
                        errormsgshow.value = true;
                        errormsgTableshow.value = true;
                      }
                    });
                }
              });
            }
          }
        }

      } else {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
      }
    };

    // export event
    function exportLeft() {
      isDisabledRight.value = true;
      let obj = {
        discard: { NORMAL: "0" },
        operation_name_disp: { LIST: [loginOperation] },
      };
      exportExcelAPI(obj, paraSheetLeftRegister.value).then(async (res: any) => {
        let base64Code = res.data.data;
        dataURLtoDownload(base64Code, paraSheet.value + "_" + loginOperation + ".xlsx");
      });
    }
    function exportLeftJson() {
      let obj = {
        discard: { NORMAL: "0" },
        operation_name_disp: { LIST: [loginOperation] },
      };
      optionName(obj, paraSheetLeftRegister.value).then(async (res: any) => {
        let code = res.data.data;
        downloadJson(paraSheet.value + "_" + loginOperation + ".json", code);
      });
    }
    function exportRightJson() {
      if (operation.value) {
        let obj = {
          discard: { NORMAL: "0" },
          operation_name_disp: { LIST: [operation.value] },
        };
        optionName(obj, paramsSheetValue.value).then(async (res: any) => {
          let code = res.data.data;
          downloadJson(leftDownloadFileNamePrefix.value + "_" + operation.value + ".json", code);
        });
      } else {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
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
      if (operation.value) {
        let obj = {
          discard: { NORMAL: "0" },
          operation_name_disp: { LIST: [operation.value] },
        };
        await exportExcelAPI(obj, paramsSheetValue.value).then(async (res: any) => {
          let base64Code = res.data.data;
          dataURLtoDownload(
            base64Code,
            leftDownloadFileNamePrefix.value + "_" + operation.value + ".xlsx"
          );
        });
      } else {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
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
    const rowData = ref("");
    let uploadFileCopy: any = reactive({});
    const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
      uploadFileCopy = {};
    };

    const handleChange: UploadProps["onChange"] = (uploadFile: any) => {
      Object.assign(uploadFileCopy, uploadFile);
    };
    const uploadRegister = () => {
      errorImportTableData.length = 0;

      if (JSON.stringify(uploadFileCopy) == "{}") {
        ElMessage({
          type: "warning",
          message: "ファイルが選択されていません。",
        });
      } else {
        // json file
        if (uploadFileCopy.raw.type == "application/json") {
          const reader = new FileReader();
          reader.readAsText(uploadFileCopy.raw, "UTF-8");
          reader.onload = (fileReader) => {
            const fileData = fileReader.target?.result;

            optionAllRegister(JSON.parse(fileData as string), rowData.value)
              .then((res: any) => {
                uploadCopy("true");
                errorImportFlag.value = false;
                ElMessage({
                  type: "success",
                  message: "パラメータのコピーが成功しました。",
                });
                getTableLeft(rowData.value);

                let copystatus = {
                  movementName: parametersheetvalue.value,
                  value: rowData.value
                }
                emit("changestatus", copystatus);
                editvisible.value = false;;
                getMenuItem(true)
              })
              .catch((err: any) => {
                uploadCopy("true");
                let isJSONFlag = isJSON(err);
                if (isJSONFlag) {
                  errorImportFlag.value = true;
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
                          errorImportTableData.push(obj);
                        }
                      }
                    }
                    ElMessage({
                      type: "error",
                      message: error,
                    });
                  }
                } else {
                  ElMessage({
                    type: "error",
                    message: err,
                  });
                }
              });
          };
        } else {
          // excel file
          FileToBase64(uploadFileCopy.raw).then((res: any) => {
            let base64Code = res.substring(res.indexOf(",") + 1);

            importApi(rowData.value, base64Code)
              .then((res: any) => {
                uploadCopy("true");
                ElMessage({
                  type: "success",
                  message: "ファイルのアップロードが成功しました。",
                });

                getTableLeft(rowData.value);
                let copystatus = {
                  movementName: parametersheetvalue.value,
                  value: rowData.value
                }
                emit("changestatus", copystatus);
                editvisible.value = false;;
                getMenuItem(true)
              })
              .catch((err: any) => {
                // emit("changestatusString", err);
                uploadCopy("true");
                let isJSONFlag = isJSON(err);
                if (isJSONFlag) {
                  errorImportFlag.value = true;
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
                          errorImportTableData.push(obj);
                        }
                      }
                    }

                    ElMessage({
                      type: "error",
                      message: error,
                    });
                  }
                } else {
                  ElMessage({
                    type: "error",
                    message: err,
                  });
                }
              });
          });
        }
      }
    };
    const importExcel = () => {
      confirmVisible.value = true;
      rowData.value = paraSheetLeftRegister.value;
    };

    const handleExceed: UploadProps["onExceed"] = (files) => {
      upload.value!.clearFiles();
      const file = files[0] as UploadRawFile;
      file.uid = genFileId();
      upload.value!.handleStart(file);
    };

    let confirmVisible = ref(false);
    let isJson = ref(true);
    const openReadSheet = () => {
      if (operation.value) {
        dialogVisibleSheet.value = true;
      } else {
        ElMessage({
          type: "warning",
          message: "オペレーションを選択してください。",
        });
      }
    };
    const openEditSheet = () => {
      dialogVisibleEdit.value = true;
    };
    const change = (val: boolean) => {
      dialogVisibleSheet.value = val;
    };
    const changeEdit = (val: boolean) => {
      dialogVisibleEdit.value = val;
      getTableLeft(paraSheetLeftRegister.value);
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
        } catch (e) {
          return false;
        }
      }
    };

    const isShow = ref(false);
    const selectedValues = ref<string[]>([]);
    const isAllSelected = ref(false);
    const isIndeterminate = ref(false);
    const dropdownVisible = ref(false);

    watch(selectedValues, (newVal) => {
      const allSelected = newVal.length === options.value.length;
      isAllSelected.value = allSelected;
      isIndeterminate.value = newVal.length > 0 && !allSelected;
    });

    const handleSelectAllChange = (value: boolean) => {
      if (value) {
        selectedValues.value = options.value.map((item: any) => item.value);
      } else {
        selectedValues.value = [];
      }
    };

    const handleDropdownVisibleChange = (visible: boolean) => {
      dropdownVisible.value = visible;
    };

    const disabledAll: any = ref(false);
    const parametersheetChange = ((value: any) => {
      movementName.value = value;
      operation.value = "";
      selectedValues.value = [];
      disabledAll.value = true;
      editvisible.value = false;
      isBtnDisable.value = true;
      
      if (Object.keys(uploadFileCopy).length !== 0) {
        upload.value!.clearFiles();
        uploadFileCopy = {};
      }
      
      errorImportFlag.value = false;
      errorImportTableData.length = 0;
      bus.emit("parametersheetChange");
      getMenuItem();
    });
    const messagecancel = (() => {
      errormsgshow.value = false;
      errormsgTableshow.value = false;
    });
    
    const isBtnDisable: any = ref(false);

    const setButtonStatus = ((val: boolean) => {
      isBtnDisable.value = val;
    })

    const register = (() => {
      isBtnDisable.value = true;
      bus.emit("register");
    })

    const editSheetchangestatus = ((val: any) => {
      let copystatus = {
        movementName: parametersheetvalue.value,
        value: val.value
      }
      emit("changestatus", copystatus);
    })
    const editvisible: any = ref(false);
    const checked1 = ref(true);
    const isGather = ref(true);
    const checkBoxChange = (value: boolean) => {
      operation.value = ''
    };
    const copyOperationChange = ((value: any) => {
      if (operationRadios.length != 0) {
        let result: any = operationRadios.find(
          (item: any) => value == item.value);
        isInitOperation.value = result.isFlagOne;
      } else {
        isInitOperation.value = false;
      }
      
      
    })
    return {
      cancel,
      loadingShow,
      loadingShowRightTable,
      paramsSheetValue,
      paraSheetLeft,
      paraSheetLeftRegister,
      movementName,
      change,
      changeEdit,
      exportLeft,
      handleChange,
      handleRemove,
      fileList,
      uploadRegister,
      visible,
      tableHeight,
      dialogVisibleSheet,
      dialogVisibleEdit,
      confirmVisible,
      openReadSheet,
      openEditSheet,
      exportRight,
      selectionChange,
      hostTable,
      rowClick,
      upload,
      handleExceed,
      getRowKeys,
      rowClass,
      tableData,
      importExcel,
      columns,
      exportLeftJson,
      exportRightJson,
      decide,
      tableDataLeft,
      sheetRadios,
      paraSheet,
      operationRadios,
      movementSelect,
      operation,
      paramsValue,
      changeval,
      loginOperation,
      changeoperation,
      handleCopy,
      isDisabledRight,
      errorImportFlag,
      errorImportTableData,
      closeTooltip,
      tooltipShow,
      copyErrorFlag,
      copyErrorTableData,
      options,
      selectedValues,
      isAllSelected,
      isIndeterminate,
      dropdownVisible,
      handleSelectAllChange,
      handleDropdownVisibleChange,
      isShow,
      parametersheetvalue,
      parametersheetRadios,
      parametersheetChange,
      disabledAll,
      errormsgshow,
      errormsg,
      errormsgTableshow,
      messagecancel,
      register,
      editvisible,
      isBtnDisable,
      setButtonStatus,
      editSheetchangestatus,
      logOperationScheduledDate,
      isShowditSheet,
      checked1,
      isGather,
      checkBoxChange,
      isInitOperation,
      copyOperationChange,
    };
  },
});
</script>

<style lang="less" scoped>
.btnBoxLeft {
  margin: 15px 0 10px 0;

  button {
    font-size: 12px !important;
  }

  .el-button:hover {
    opacity: 0.8;
    background-color: #0960bd !important;
    color: #fff;
    border-color: #0960bd;
  }

  .el-button:active,
  .el-button:focus {
    background-color: #0960bd !important;
    color: #fff;
    border-color: #0960bd;
  }
}
.selectDivider {
  .el-divider--horizontal {
    margin: 0;
  }
}

.defDivider {
  .el-divider--horizontal {
    margin: 12px 0px;
  }
}

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

#closeBtn1 {
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
    color: #7f7f7f;
  }

  &:active,
  &:focus {
    border-color: #bdbdbd !important;
    background-color: #fff0f000 !important;
  }
}

#saveBtn2 {
  margin-right: 20px;
  padding: 0 50px;
  border-radius: 8px;
  color: #fff;
  background-color: #da6a38 !important;
  border-color: #da6a38 !important;

  &:hover {
    opacity: 0.8 !important;
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }

  &:active,
  &:focus {
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }
}

#uploadBtn1 {
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
    color: #7f7f7f;
  }

  &:active,
  &:focus {
    border-color: #bdbdbd !important;
    background-color: #fff0f000 !important;
  }
}

#uploadBtn2 {
  margin-right: 20px;
  padding: 0 50px;
  border-radius: 8px;
  color: #fff;
  background-color: #da6a38 !important;
  border-color: #da6a38 !important;

  &:hover {
    opacity: 0.8 !important;
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }

  &:active,
  &:focus {
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }
}

.copyBtn {
  color: #fff;
  background-color: #da6a38 !important;
  border-color: #da6a38 !important;

  &:hover {
    opacity: 0.8 !important;
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }

  &:active,
  &:focus {
    background-color: #da6a38 !important;
    border-color: #da6a38 !important;
  }
}

.browsebtn {
  color: #fff;
  background-color: #0960bd !important;
  border-color: #0960bd !important;

  &:hover {
    opacity: 0.8 !important;
    background-color: #0960bd !important;
    border-color: #0960bd !important;
  }

  &:active,
  &:focus {
    background-color: #0960bd !important;
    border-color: #0960bd !important;
  }
}

.loadbtn {
  color: #fff;
  background-color: #418d45 !important;
  border-color: #418d45 !important;

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

</style>
<style lang="less">
.detailBoxSheet {
  --el-dialog-width: 90% !important;
  --el-dialog-margin-top: 1vh;

  .el-dialog__body {
    overflow-x: hidden !important;
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .el-dialog__header {
    padding-bottom: 0 !important;
    padding-top: 15px !important;
  }
}

.el-divider__text {
  padding: 0px 2px;
}

.host-el-select__popper {
  margin-left: 10px;

  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #0960bd;
    border-color: #0960bd;
  }
}

.el-upload-list__item .el-icon--close {
  display: inline-block !important;
}

.el-upload-list {
  width: 56%;
}

.errorTable {
  .el-table .cell {
    height: auto !important;
    line-height: 27px !important;
  }
}

.errorBox {
  .el-dialog__body {
    overflow-x: hidden !important;
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .el-dialog__header {
    padding-bottom: 0 !important;
    padding-top: 0px !important;
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
