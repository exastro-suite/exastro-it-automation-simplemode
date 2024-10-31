<template>
  <div class="steps-last">
    <p>内容を確認し、[実行]を押してください。</p>
    <el-card shadow="never" class="cardBox">
      <h2 class="title">オペレーション</h2>
      <el-table
        ref="operationTable"
        :data="operations"
        border
        v-loading="loadingShowOperation"
        element-loading-text="loading..."
        :row-height="27"
      >
        <el-table-column
          v-for="item in operationColumns"
          :prop="item.dataIndex"
          :label="item.title"
          :key="item"
        />
      </el-table>
    </el-card>
    <el-card shadow="never" class="cardBox">
      <h2 class="title">Conductor</h2>
      <el-table
        ref="conductorTable"
        :data="conductorInfo"
        border
        v-loading="loadingShowConductor"
        element-loading-text="loading..."
        :row-height="27"
      >
        <el-table-column
          v-for="item in conductorColumns"
          :prop="item.dataIndex"
          :label="item.title"
          :key="item"
        />
      </el-table>
    </el-card>

    <el-card shadow="never" class="cardBox">
      <h2 class="title">Movement</h2>
      <el-table :data="movement" border :row-height="27">
        <el-table-column
          v-for="(item, index) in movementColumns"
          :label="item.title"
          :prop="item.dataIndex"
          :key="index"
        ></el-table-column>
      </el-table>
    </el-card>
    <el-card shadow="never" class="cardBox">
      <h2 class="title">作業対象ホスト</h2>
      <el-table ref="hostTable" :data="host" border :row-height="27">
        <el-table-column
          v-for="(item, index) in columns"
          :prop="item.dataIndex"
          :label="item.title"
          :key="index"
        />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "../../store/index";
import { deviceList, importApi } from "../../api/index";
import { designateOperation } from "../../api/jobList";
import { designateConductor } from "../../api/jobApi";
import { ElMessage, ElTable } from "element-plus";
type dataType = {
  operation_id: string;
  operation_name: string;
  remarks: string;
  scheduled_date_for_execution: string;
  last_run_date: string;
  last_update_date_time: string;
  last_updated_user: string;
};
export default defineComponent({
  name: "Execute",

  setup(props, { emit }) {
    // table loading
    const loadingShowConductor = ref(true);
    const loadingShowOperation = ref(true);
    let operations: Array<dataType> = reactive([]);
    let conductorInfo: Array<dataType> = reactive([]);
    const store = useStore();
    let conductor = store.getConductor;
    let conductorId = store.getConductorId;

    let movement1 = store.getMovement;
    // node1,node2...
    let movement: any = movement1.sort(function (a: any, b: any) {
      return a.id.slice(5) - b.id.slice(5);
    });

    let host = store.getHost;
    let operation = store.getLoginOperation;
    // let operation1 =;
    const conductorColumns = reactive([
      {
        title: "Conductor名称",
        dataIndex: "conductor_name",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);
    const operationColumns = reactive([
      {
        title: "オペレーション名",
        dataIndex: "operation_name",
      },
      {
        title: "実施予定日時",
        dataIndex: "scheduled_date_for_execution",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);
    const movementColumns = reactive([
      {
        title: "Movement名",
        dataIndex: "movement_name",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);
    const columns = reactive([
      {
        title: "ホスト名",
        dataIndex: "host_name",
      },
      {
        title: "種別",
        dataIndex: "hw_device_type",
      },
      {
        title: "IPアドレス",
        dataIndex: "ip_address",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);
    function getOperations() {
      loadingShowOperation.value = true;
      designateOperation(operation)
        .then((res: any) => {
          let data = res.data.data;
          operations.length = 0;
          data.forEach((element: any) => {
            operations.push(element.parameter);
          });
          loadingShowOperation.value = false;
        })
        .catch((err: any) => {
          loadingShowOperation.value = false;
          ElMessage({
            type: "error",
            message: err,
          });
        });
    }
    getOperations();
    function getConductorInfo() {
      loadingShowConductor.value = true;
      designateConductor(conductorId)
        .then((res: any) => {
          let data = res.data.data;
          conductorInfo.length = 0;
          data.forEach((element: any) => {
            conductorInfo.push(element.parameter);
          });
          loadingShowConductor.value = false;
        })
        .catch((err: any) => {
          loadingShowConductor.value = false;
          ElMessage({
            type: "error",
            message: err,
          });
        });
    }
    getConductorInfo();

    return {
      conductor,
      movement,
      movementColumns,
      conductorColumns,
      operationColumns,
      host,
      columns,
      operation,
      operations,
      conductorInfo,
      loadingShowOperation,
      loadingShowConductor,
    };
  },
});
</script>

<style scoped lang="less">
.title {
  text-align: left;
  margin: 0 0 10px 0;
}

.conductor {
  text-indent: 24px;
}

.cardBox {
  margin-bottom: 10px;
}

.steps-last {
  margin-top: 23px;
  margin-bottom: 20px;
  border-top: 2px solid #e4e0e0;

  p {
    color: #7f7f7f;
    font-size: 16px;

    span {
      display: block;
    }
  }
}
</style>
