<template>
    <el-button class="refresh_btn" @click="handleRefresh">
      <el-icon> <Refresh /> </el-icon>&nbsp; 更新</el-button
    >
  <el-table
    v-loading="loadingShow"
    element-loading-text="loading..."
    :data="tableData"
    border
    height="648"
    style="width: 100%"
    :default-sort="{ prop: 'time_start', order: 'descending' }"
    :row-height="27"
  >
    <template v-for="(item, index) in columns" :key="index">
      <el-table-column
        v-if="item.dataIndex == 'action'"
        :prop="item.dataIndex"
        :label="item.title"
        width="180"
      >
        <template #default="scope">
          <div class="tableAction">
            <el-button
              class="detailsBtn"
              style="margin-right: 16px"
              @click="
                detailClick(
                  scope.row,
                  scope.row.status_id.indexOf('未実行') != -1 ||
                    scope.row.status_id.indexOf('実行中') != -1
                )
              "
            >
              <el-icon
                v-if="
                  scope.row.status_id.indexOf('未実行') != -1 ||
                  scope.row.status_id.indexOf('実行中') != -1
                "
                class="is-loading"
              >
                <Loading />
              </el-icon>
              <el-icon v-else> <CircleCheck /> </el-icon>&nbsp;詳細</el-button
            >
            <el-tooltip
              class="box-item"
              effect="light"
              content="投入データと結果データをzip形式でダウンロードします。"
              placement="top"
            >
              <el-button class="exBtn" type="primary" @click="zipDownload(scope.row)"
                ><el-icon> <Download /> </el-icon>&nbsp;(zip)</el-button
              >
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-else-if="item.dataIndex == 'status_id'"
        :prop="item.dataIndex"
        :label="item.title"
        sortable
        :sort-method="(a: any, b: any) => {
          return a[item.dataIndex]?.localeCompare(b[item.dataIndex]);
        }
          "
        :width="140"
      >
        <template #default="scope"
          ><span
            :class="
              scope.row.status_id == '正常終了'
                ? 'success'
                : scope.row.status_id == '異常終了'
                ? 'default'
                : ''
            "
            >{{ scope.row.status_id }}</span
          ></template
        ></el-table-column
      ><el-table-column
        v-else
        :prop="item.dataIndex"
        :label="item.title"
        sortable
        :sort-method="(a: any, b: any) => {
          return a[item.dataIndex]?.localeCompare(b[item.dataIndex]);
        }
          "
        :width="item.width"
        :min-width="item.width"
      />
    </template>
  </el-table>
  <detailDialog
    :dialogVisible="dialogVisible"
    @changeVisible="changeVisible"
    :isStartTimer="isStartTimer"
    :instanceId="instanceId"
    :operationName="operationName"
  ></detailDialog>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount, reactive, ref } from "vue";
import { verification } from "../../api/index";
import {
  inputData,
  resultData,
  conductorConfirmation,
  conductorConfirmationInfo,
} from "../../api/confirmApi";
import { useRouter, useRoute } from "vue-router";
import {
  Refresh,
  Loading,
  CircleCheck,
  Download,
  RefreshLeft,
} from "@element-plus/icons-vue";
import { ElTooltip, ElTable, ElTableColumn, ElMessage } from "element-plus";
import { debounce } from "../../utils/debounce";
import { downloadFile } from "../../utils/downloadFile";
import detailDialog from "./components/detailDialog.vue";
import { useStore } from "../../store/index";
const dialogVisible = ref(false);
const store = useStore();
let loadingShow = ref(true);

const columns = [
  {
    title: "オペレーション名",
    dataIndex: "operation_name",
  },

  {
    title: "ステータス",
    dataIndex: "status_id",
    width: 60,
  },
  {
    title: "Conductor名称",
    dataIndex: "conductor_instance_name",
  },
  {
    title: "作業実行ユーザー",
    dataIndex: "execution_user",
    width: 170,
  },
  {
    title: "Action",
    dataIndex: "action",
    with: 180,
  },

  {
    title: "開始日時",
    dataIndex: "time_start",
    width: 185,
  },
  {
    title: "終了日時",
    dataIndex: "time_end",
    width: 185,
  },
];
export default defineComponent({
  name: "Confirm",
  components: {
    Refresh,
    Loading,
    CircleCheck,
    detailDialog,
    Download,
    RefreshLeft,
  },
  setup() {
    const router = useRouter();
    const operationName = ref("");
    let tableData: any = reactive([]);
    const conductorList = () => {
      loadingShow.value = true;
      let data = {
        discard: {
          NORMAL: "0",
        },
      };
      verification(data).then((res: any) => {
        let arr = res.data.data;
        if ((res.data.message = "SUCCESS")) {
          let arr1 = arr.sort((a: any, b: any) => {
            if (b.parameter.time_start) {
              b.parameter.time_start.localeCompare(a.parameter.time_start);
            }
          });
          tableData.length = 0;
          arr1.forEach((element: any) => {
            tableData.push(element.parameter);
          });
          loadingShow.value = false;
        }
      });
    };

    conductorList();
    let timer: any = null;
    onMounted(() => {
      //30 秒ごとに更新
      timer = setInterval(() => {
        handleRefresh();
      }, 30000);
    });

    onBeforeUnmount(() => {
      clearInterval(timer);
      timer = null;
    });

    const handleRefresh = debounce(() => {
      tableData.length = 0;
      loadingShow.value = true;
      conductorList();
    }, 500);
    const zipDownload = debounce((rowData: any) => {
      let id: string = rowData.conductor_instance_id;
      inputDataDownload(id);
    }, 500);
    const inputDataDownload = (id: any) => {
      inputData(id)
        .then((res: any) => {
          let base64Code = res.data.data.file_data;
          let name: string = res.data.data.file_name;

          downloadFile(base64Code, name);
          resultDataDownload(id);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
          resultDataDownload(id);
        });
    };
    const resultDataDownload = (id: any) => {
      resultData(id)
        .then((res: any) => {
          let base64Code = res.data.data.file_data;
          let name: string = res.data.data.file_name;
          downloadFile(base64Code, name);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    const detailData: any = reactive([]);

    let isStartTimer: any = ref(false);
    let instanceId: any = ref("");
    const detailClick = debounce((row: any, isStartTimerFlag?: boolean) => {
      isStartTimer.value = isStartTimerFlag;
      dialogVisible.value = true;
      operationName.value = row.operation_name;

      instanceId.value = row.conductor_instance_id;
    }, 500);
    const changeVisible = (val: boolean) => {
      dialogVisible.value = val;
    };
    const executeAgain = (data: any) => {
      // getDetailInfo(data.conductor_instance_id);
      // router.push({ name: "Job", params: { active: "3" } });
    };
    const detailDataMovement: any = reactive([]);
    const getDetailInfo = debounce((id: any) => {
      conductorConfirmationInfo(id)
        .then((res: any) => {
          let dict = res.data.data.list;
        })
        .catch((err: any) => {
          ElMessage({
            type: "error",
            message: err,
          });
        });
      conductorConfirmation(id)
        .then((res: any) => {
          let conductorClass: any = res.data.data.conductor_class;

          let nodeData = res.data.data.node;

          let keys = Object.keys(nodeData);

          // keys.splice(0, 2);
          keys = keys.filter(function (item) {
            return item !== "node-1" && item !== "node-2";
          });

          let keysSort: any = keys.sort(function (a: any, b: any) {
            return a.slice(5) - b.slice(5);
          });

          keysSort.forEach((element: any) => {
            let obj1: any = {};
            Object.assign(obj1, {
              execution_id: null,
              movement_id: null,
              movement_name: null,
              status: null,
              time_start: null,
              time_end: null,
            });
            obj1.movement_name = conductorClass[element].movement_name;
            obj1.movement_id = conductorClass[element].movement_id;
            obj1.status = nodeData[element].status;
            obj1.execution_id = nodeData[element].jump.execution_id;
            obj1.time_start = nodeData[element].time_start;
            obj1.time_end = nodeData[element].time_end;

            detailDataMovement.push(obj1);
          });
          store.setMovement(detailDataMovement);
          router.push({ path: "/job", query: { active: 3 } });
        })
        .catch((err: any) => {
          ElMessage({
            type: "error",
            message: err,
          });
        });
    }, 500);

    return {
      tableData,
      detailData,
      detailClick,
      columns,
      handleRefresh,
      dialogVisible,
      isStartTimer,
      instanceId,
      loadingShow,
      executeAgain,
      zipDownload,
      changeVisible,
      operationName,
    };
  },
});
</script>

<style scoped lang="less">
.el-button {
  background-color: #0960bd;
  color: #fff;
  border-color: #0960bd;
  margin-bottom: 10px;
}

.refresh_btn {
  float: right;
}

.exBtn {
  border-color: #da6a38;
  background-color: #da6a38;
}

.detailsBtn {
  border-color: #418d45;
  background-color: #418d45;
}

.tableAction {
  display: flex;
  height: 27px;
  justify-content: left;
  align-items: center;

  button {
    height: auto !important;
    margin-right: 10px !important;
    margin-left: 5px !important;
    margin-bottom: 0px !important;
    padding: 2px 10px !important;
  }
}

.success {
  color: #418d45;
}

.default {
  color: red;
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
</style>
