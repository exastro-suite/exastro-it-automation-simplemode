<template>
  <el-dialog
    class="detailDialog"
    v-if="dialogVisible"
    v-model="dialogVisible"
    :title="mainTitle"
    width="60%"
    :before-close="handleClose"
    :close-on-press-escape="false"
    :close-on-click-modal="false"
  >
  <div v-show="!isLog" style="float: right;">Movement名をクリックして実行ログを参照できます。</div>
    <el-table
      v-show="!isLog"
      height="400"
      :data="detailData"
      border
      style="width: 100%"
      v-loading="detailLoadingShow"
      element-loading-text="loading..."
      ref="tableRef"
    >
      <el-table-column property="movement_name" label="Movement">
        <template #default="scope"
          ><span class="hover-underline" @click="openlog(scope.row)" >{{
            scope.row.movement_name
          }}</span></template
        >
      </el-table-column>
      <el-table-column prop="status" label="ステータス" :width="140">
        <template #default="scope"
          ><span
            :class="
              scope.row.status == '正常終了'
                ? 'success'
                : scope.row.status == '異常終了'
                ? 'default'
                : ''
            "
            >{{ scope.row.status }}</span
          ></template
        ></el-table-column
      >

      <el-table-column :width="180" property="time_start" label="開始日時" />
      <el-table-column :width="180" property="time_end" label="終了日時" />
    </el-table>
    <div
      v-if="isLog"
      class="execLog"
      v-loading="logLoading"
      element-loading-text="loading..."
    >
      <span v-text="logTxt" style="white-space: pre-line"></span>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-show="!isLog" id="footerBtn1" @click="closeDialog">閉じる</el-button>
        <el-button v-show="isLog" id="footerBtn1" @click="closeLog">閉じる</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, reactive, ref, watch, nextTick,onMounted } from "vue";

import {
  conductorConfirmation,
  conductorConfirmationInfo,
  getLog,
} from "../../../api/confirmApi";
import { Refresh, Loading, CircleCheck } from "@element-plus/icons-vue";
import { ElTooltip, ElTable, ElTableColumn, ElMessage, ElDialog } from "element-plus";
import { debounce } from "../../../utils/debounce";

export default defineComponent({
  name: "detailDialog",
  props: ["dialogVisible", "isStartTimer", "instanceId","operationName"],
  emits: ["changeVisible"],
  components: {
    Refresh,
    Loading,
    CircleCheck,
  },

  setup(props, { emit }) {
    const dialogVisible = ref(props.dialogVisible);
    const instanceId = ref(props.instanceId);
    const isStartTimer = ref(props.isStartTimer);
    const mainTitle = ref(props.operationName);
    const tableRef = ref();
    let befScrollTop:any = ref(0);
    // is log
    let isLog = ref(false);
    let logTxt = ref("");
    let isClicked = ref(false);
    watch(
      props,
      (val, old) => {
        dialogVisible.value = val.dialogVisible;
        instanceId.value = val.instanceId;
        isStartTimer.value = val.isStartTimer;
        mainTitle.value = val.operationName;
      },
      {
        immediate: true,
        deep: true,
      }
    );
    watch(
      dialogVisible,
      (val, old) => {
        dialogVisible.value = val;
        emit("changeVisible", dialogVisible.value);
      },
      {
        immediate: true,
        deep: true,
      }
    );
    
    let detailLoadingShow = ref(true);
    let logLoading = ref(true);
    let timer: any = null;
    onBeforeUnmount(() => {
      clearInterval(timer);
      timer = null;
    });
    onMounted(() => { 
      document.getElementById('fakeLink')?.addEventListener('click', function() {this.classList.toggle('clicked-style');});
    });
    const detailData: any = reactive([]);
    const movementDict = ref([]);
    const conductorStatusDict = ref([]);
    const getDetailInfo = debounce((id: any) => {
      detailLoadingShow.value = true;
      detailData.length = 0;

      conductorConfirmationInfo(id)
        .then((res: any) => {
          let dict = res.data.data.list;

          movementDict.value = dict.movement;
          conductorStatusDict.value = dict.conductor_status;
        })
        .catch((err: any) => {
          detailLoadingShow.value = false;
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
            if ('parallel-branch' == conductorClass[element].type || 'merge' == conductorClass[element].type) {
              return;
            }
            obj1.movement_name = conductorClass[element].movement_name;
            obj1.movement_id = conductorClass[element].movement_id;
            obj1.status = nodeData[element].status;
            obj1.execution_id = nodeData[element].jump.execution_id;
            obj1.time_start = nodeData[element].time_start;
            obj1.time_end = nodeData[element].time_end;
            detailData.push(obj1);
          });
          nextTick(() => {
            if (befScrollTop != 0) {
              if (tableRef.value) {
                tableRef.value!.setScrollTop(befScrollTop)
              }
            }
            
          })
          detailLoadingShow.value = false;
        })
        .catch((err: any) => {
          ElMessage({
            type: "error",
            message: err,
          });
          detailLoadingShow.value = false;
        });
    }, 500);
    watch(
      instanceId,
      (val, old) => {
        instanceId.value = val;
        if (isStartTimer.value) {
          //10 秒ごとに更新
          clearInterval(timer);
          timer = setInterval(() => {
            if (!isLog.value) {
              detailLoadingShow.value = true;
              if (tableRef.value) {
                const scrollWrapper = tableRef.value!.$el.querySelector('.el-scrollbar__wrap');
                if (scrollWrapper) {
                  befScrollTop = scrollWrapper.scrollTop
                }
              }
              
              detailData.length = 0;
              getDetailInfo(instanceId.value);
            }
            
          }, 10000);
        } else {
          clearInterval(timer);
        }
        detailLoadingShow.value = true;
        detailData.length = 0;
        befScrollTop = 0
        getDetailInfo(instanceId.value);
      },
      {
        deep: true,
      }
    );
    watch(
      isStartTimer,
      (val, old) => {
        if (!val) {
          clearInterval(timer);
        }
      },
      {
        immediate: true,
        deep: true,
      }
    )
    const handleClose = (done: () => void) => {
      isLog.value = false;
      dialogVisible.value = false;
    };
    // open log
    const openlog = (row: any) => {
      let id = row.execution_id;

      if (id) {
        mainTitle.value = row.movement_name;
        isLog.value = true;
        logLoading.value = true;
        getExecLog(id);
        isClicked.value = !isClicked.value;
      }
    };
    const getExecLog = (id: any) => {
      getLog(id)
        .then((res: any) => {
          let data = res.data.data;

          logTxt.value = data.progress.execution_log.exec_log["exec.log"];
          logLoading.value = false;
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
          logLoading.value = false;
        });
    };
    const closeDialog = () => {
      isLog.value = false;
      dialogVisible.value = false;
      mainTitle.value = "";
    };
    const closeLog = () => {
      mainTitle.value = props.operationName;
      isLog.value = false;
    };
    return {
      detailData,
      dialogVisible,
      detailLoadingShow,
      handleClose,
      openlog,
      closeLog,
      closeDialog,
      isLog,
      logTxt,
      logLoading,
      mainTitle,
      tableRef,
      isClicked
    };
  },
});
</script>

<style scoped lang="less">
.hover-underline {
  color:#0960bd;
  text-decoration: none;
  cursor: pointer;
}
.hover-underline:hover{
  text-decoration: underline;
}
.success {
  color: #418d45;
}

.default {
  color: red;
}
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

.dialog-footer button:first-child {
  margin-right: 10px;
}
.execLog {
  border: 1px solid #e4e7ed;
  padding: 10px;
  span {
    display: block;
    height: 400px;
    overflow-y: scroll;
  }
}
</style>
<style lang="less">
.detailDialog {
  .el-dialog__body {
    overflow-x: hidden !important;
  }
}
</style>
