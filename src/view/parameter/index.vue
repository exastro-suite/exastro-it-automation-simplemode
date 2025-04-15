<template>
  <div class="header-box" v-show="isOperation">
    <el-input v-model="keyWords" style="width: 460px" placeholder="検索" class="searchBtn">
      <template #append><el-button @click="search">フィルタ</el-button></template>
    </el-input>
    <div class="button-action"><el-button type="primary" class="refresh_btn" @click="handleRefresh"><el-icon
          size="16px">
          <Refresh />
        </el-icon>&nbsp;
        <span style="display: inline-block; margin-top: 2px">更新</span></el-button></div>
  </div>
  <el-table v-show="isOperation" v-loading="loadingShow" element-loading-text="loading..." :data="operations" border
    height="648" style="width: 100%" @sort-change="sortMethod">
    <template v-for="(item, index) in columns" :key="index">
      <el-table-column v-if="item.dataIndex == 'action'" label="" :width="96">
        <template #default="scope">
          <el-button class="detailsBtn" style="margin-right: 16px" @click="detailClick(scope.row)">
            <el-icon>
              <Search />
            </el-icon>&nbsp;詳細</el-button>
        </template>
      </el-table-column>
      <el-table-column v-else :label="item.title" :prop="item.dataIndex" :width="item.width"></el-table-column>
    </template>
  </el-table>
  <div v-show="!isOperation">
    <Detail :operationName="operationName" @changeIsOperation="changeIsOperation" :isOperation="isOperation"></Detail>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { operationListForFlag,getDefOperationDataSetInfos } from "../../api/jobList";
import { ElMessage, ElTable } from "element-plus";
import { Search,Refresh, } from "@element-plus/icons-vue";
import { debounce } from "../../utils/debounce";
import { useRouter, useRoute } from "vue-router";
import Detail from "./detail.vue";

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
  name: "Parameter",
  components: {
    Search,
    Detail,
    Refresh,
  },
  setup() {
    let isOperation = ref(true);
    let loadingShow = ref(true);
    let operations: Array<dataType> = reactive([]);
    let operationsCopy: Array<dataType> = reactive([]);
    const dialogVisible = ref(false);
    const operationName: any = ref("");
    let radios: any = reactive([]);

    // conductor
    const conductor = ref<string>("");

    const columns = reactive([
      {
        title: "",
        dataIndex: "action",
      },
      {
        title: "オペレーション名",
        dataIndex: "operation_name",
      },
      {
        title: "実施予定日時",
        dataIndex: "scheduled_date_for_execution",
        width: 180,
      },
      {
        title: "最終実行日時",
        dataIndex: "last_run_date",
        width: 180,
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
    ]);

    async function getRadios() {
      loadingShow.value = true;
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
      await operationListForFlag(defOperationIds)
        .then((res: any) => {
          let data: any = res.data.data;
          let arr1: any = data.sort((a: any, b: any) => {
            return (
              Number(b.parameter.last_run_date !== null) -
                Number(a.parameter.last_run_date !== null) ||
              new Date(b.parameter.last_run_date).valueOf() -
                new Date(a.parameter.last_run_date).valueOf()
            );
          });

          arr1.forEach((element: any) => {
            element.parameter.last_update_date_time = element.parameter.last_update_date_time.substring(
              0,
              element.parameter.last_update_date_time.length - 7
            );
            
            operations.push(element.parameter);
            operationsCopy.push(element.parameter);
          });
          loadingShow.value = false;
        })
        .catch((err: any) => {
          loadingShow.value = false;
          ElMessage({
            type: "error",
            message: err,
          });
        });
    }
    getRadios();
    const sortMethod = () => {};
    const detailClick = debounce((row: any) => {
      conductor.value = "";
      operationName.value = row.operation_name;

      isOperation.value = false;
    }, 500);

    const changeIsOperation = (val: any) => {
      isOperation.value = val;
    };
    const keyWords = ref<string>("");
    const search = () => {
      if (keyWords.value) {
        operations.length = 0;
        let result = operationsCopy.filter((item: any) => {
          return item.operation_name.indexOf(keyWords.value) != -1;
        });

        result.forEach((element) => {
          operations.push(element);
        });
      } else {
        operations.length = 0;
        operationsCopy.length = 0;
        getRadios();
      }
    };
    const handleClose = () => {
      dialogVisible.value = false;
    };
    const handleRefresh =  debounce(() => {
      loadingShow.value = true;
      operations.length = 0;
      operationsCopy.length = 0;
      getRadios();
      keyWords.value = "";
    }, 500);
    return {
      operations,
      keyWords,
      columns,
      sortMethod,
      loadingShow,
      detailClick,
      search,

      handleClose,

      radios,
      operationName,
      conductor,
      isOperation,
      changeIsOperation,
      handleRefresh,
    };
  },
});
</script>

<style scoped lang="less">
.radiosBox {
  margin-top: 15px;
  width: 100%;
  max-height: 420px;
  justify-content: space-around;
  overflow-y: scroll;
}
.el-radio-group {
  /deep/.el-radio.is-bordered.is-checked {
    background-color: #0960bd;
    color: #fff;
  }

  /deep/.el-radio__label {
    width: 148px;
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
    height: 44.8px;
  }

  .el-radio:hover {
    background-color: #f5f7fa;
  }
}
.searchBtn {
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
.selectConductor {
  .el-dialog__body {
    padding: 0 20px 20px 20px !important;
    overflow-x: hidden !important;
  }
}
.el-radio.is-bordered.is-checked {
  border-color: #0960bd;
  color: #0960bd;
}

.el-radio__input.is-checked + .el-radio__label {
  color: #0960bd;
}

.el-radio__input.is-checked .el-radio__inner {
  border-color: #0960bd;
  background-color: #fff;
}

.el-radio__input.is-checked .el-radio__inner::after {
  border: 1px solid #0960bd;
  width: 6px;
  height: 6px;
}
.el-table tbody tr .el-table__cell {
  padding: 0px 0 !important;
}
.el-table .el-table__cell {
  padding: 0px 0 !important;
}
.el-table .cell {
  line-height: 26px !important;
}
.detailsBtn {
  border-color: #418d45;
  background-color: #418d45;
  color: #fff;
  padding: 2px 10px !important;
  height: auto;
  &:hover {
    background-color: #418d45 !important;
    border-color: #418d45 !important;
    color: #fff;
  }

  &:active,
  &:focus {
    background-color: #418d45 !important;
    border-color: #418d45 !important;
    color: #fff;
  }
}
.header-box {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
}
.selectConductor {
  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;
  }

  .el-button:nth-child(2) {
    &:hover {
      opacity: 0.8;
    }

    &:hover,
    &:active,
    &:focus {
      background-color: #0960bd !important;
      color: #fff;
      border-color: #0960bd;
    }
  }
  .el-button + .el-button {
    margin-left: 12px !important;
  }
}
.button-action {
  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;
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
  .el-button + .el-button {
    margin-left: 0 !important;
  }
}
.el-button + .el-button {
  margin-left: 10px;
}
</style>
