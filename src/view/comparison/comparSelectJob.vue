<template>
  <div class="compartitle" style="border: 1px solid #c3c3c3;padding-left: 5px;padding-right: 5px;border-radius: 6px;">
    <p>比較ジョブ</p>
    <div class="header-box">
      <div class="searchBtn">
        <el-select v-model="keyWords" clearable filterable allow-create default-first-option :reserve-keyword="false"
          placeholder="比較ジョブ名を入力 または 比較方法を選択" style="width: 372px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button @click="search">フィルタ</el-button>
      </div>
      <el-switch v-model="switchValue" @change="switchChange" size="large" inactive-text="チェックした項目だけを表示"
        style="--el-switch-on-color: #0960bd;" />
    </div>
    <el-table :key="tableKey" ref="jobTable" v-loading="loadingShow" element-loading-text="loading..." :data="tableData"
      :height="tableHeight" :row-style="rowClass" style="width: 100%" border :row-key="getRowKeys"
      @selection-change="selectionChange" @row-click="rowClick" :row-height="27" :header-cell-class-name="cellClass"
      :default-sort="{ prop: 'compare_name', order: 'ascending' }">
      <el-table-column :selectable="isDisabled" type="selection" width="55" :reserve-selection="reserveSelection" />
      <el-table-column v-for="(item, index) in columns" :prop="item.dataIndex" :label="item.title" :key="index">
        <template #default="{ row }">
          <el-tooltip placement="bottom" effect="light" :hide-after=0>
            <template #content>
              対象パラメータシート１：{{ row.target_menu_1 }}<br />
              対象パラメータシート２：{{ row.target_menu_2 }}<br />
              　　　　詳細設定フラグ：{{ row.detail_flg }}<br />
              　　　　　　　　　備考：{{ row.remarks }}<br />
              　　　　　最終更新日時：{{ row.last_update_date_time.substring(0,row.last_update_date_time.length - 7) }}<br />
              　　　　　　最新更新者：{{ row.last_updated_user }}<br />
            </template>
          <div style="cursor: pointer;width: 100%">{{ row[item.dataIndex] }}</div>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  watch,
  onMounted,
  onBeforeUnmount
} from "vue";
import { eventBus } from "../../store/eventBus";
import { useStore } from "../../store/index";
import {
  ElButton,
  ElMessage,
  ElTooltip,
  ElTable
} from "element-plus";
import { comparJobs } from "../../api/comparApi";
export default defineComponent({
  name: "comparSelectjob",
  emits: ["selection-change"],
  components: {
    ElButton,
    ElTable,
    ElTooltip
  },
  setup(props, { emit }) {
    const bus = eventBus();
    const store = useStore();
    const switchValue = ref(false);
    const keyWords = ref<string>("");
    let tableData: any = reactive([]);
    let jobListData: any = reactive([]);
    const jobList: any = reactive([]);
    const groupList: any = reactive([]);
    const jobTable: any = ref(null);
    let tableHeight = ref(100);
    const loadingShow = ref(true);
    const columns = reactive([
      {
        title: "比較ジョブ",
        dataIndex: "compare_name",
      },
    ]);
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

    let selectedjob: any = reactive([]);
    const selectionShow = ref(true);
    const reserveSelection = ref(true);
    const tableKey = ref(0)
    onMounted(() => {
      tableHeight.value = window.innerHeight - 380;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 380;
      };
    });
    const isDisabled = (row: any, index: number) => {
      return selectionShow.value;
    };
    const getRowKeys = (row: any) => {
      return row.compare_id;
    };
    const rowClass = ({ row }: any) => {
      if (selectedjob.includes(row)) {
        return { color: "#0960bd" };
      } else {
        if (!selectionShow.value) {
          return { display: 'none' };
        }
      }
    };
    const search = () => {
      if (keyWords.value) {
        let result = jobListData.filter((item: any) => {
          if (
            item.compare_name.indexOf(keyWords.value) != -1
          )
            return item;
        });
        tableData.length = 0;
        result.forEach((element: any) => {
          tableData.push(element);
        });
      } else {
        tableData.length = 0;
        jobListData.forEach((el: any) => {
          tableData.push(el);
        });
      }
    };
    // change job
    const selectionChange = (val: any) => {
      selectedjob.length = 0;
      val.forEach((item: any) => {
        selectedjob.push(item);
      });
      store.setLoggedComparJob(selectedjob);
    };
    const rowClick = (val: any) => {
      if (selectionShow.value == false) {
        return
      }
      let resultFlag = selectedjob.findIndex((item: any) => {
        return item.compare_id == val.compare_id;
      });

      if (resultFlag == -1) {
        jobTable.value!.toggleRowSelection(val, true);
      } else {
        jobTable.value!.toggleRowSelection(val, false);
      }
    };
    const switchChange = (val: boolean) => {
      keyWords.value = '';
      tableData.length = 0;
      jobListData.forEach((el: any) => {
        tableData.push(el);
      });
      if (val == true) {
        selectionShow.value = false;
      } else {
        selectionShow.value = true;
      }
    }
    const mapKey: any = {
      jobgroup_name: "job_name",
    };
    const toggleSelection = (rows?: any) => {
      if (rows) {
        rows.forEach((row: any) => {
          jobTable.value!.toggleRowSelection(row, true);
        });
      } else {
        jobTable.value!.clearSelection();
      }
    };
    const cellClass = (row: any) => {
      if (row.columnIndex === 0 && selectionShow.value == false) {
        return "DisableSelection";
      }
      return "";
    }
    // job list
    function getDataList(arr: Array<any>) {
      loadingShow.value = true;
      comparJobs()
        .then((res: any) => {
          let arr1 = res.data.data;
          if (arr1.length == 0) {
            loadingShow.value = false;
            return;
          }
          arr1.forEach((element: any) => {
            arr.push(element.parameter);
          });
        })
        .catch((error: any) => {
          loadingShow.value = false;
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    getDataList(jobList);
    watch(
      () => [jobList, groupList],
      ([hval, gval]) => {
        if (hval.length != 0) {
          tableData.length = 0;
          jobListData.length = 0;
          hval.forEach((el: any) => {
            tableData.push(el);
            jobListData.push(el);
          });
          gval.forEach((el: any) => {
            Object.keys(el).map((key) => {
              let newKey: any = mapKey[key];
              if (newKey) {
                el[newKey] = el[key];
              }
            });
          });
          gval.forEach((el: any) => {
            tableData.push(el);
            jobListData.push(el);
          });
          loadingShow.value = false;
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
    bus.on("ComparSettingRefresh", async () => {
      loadingShow.value = true;
      store.setComparJob(undefined);
      store.setLoggedComparJob(undefined);
      switchValue.value = false;
      selectionShow.value = true;
      keyWords.value = '';
      tableData.length = 0;
      jobListData.length = 0;
      jobList.length = 0;
      groupList.length = 0;
      jobTable.length = 0;
      selectedjob.length = 0;
      reserveSelection.value = false;
      await getDataList(jobList);
      reserveSelection.value = true;
      tableKey.value++;
    });
    onBeforeUnmount(() => {
      bus.off_all("ComparSettingRefresh");
    });
    return {
      columns,
      switchValue,
      keyWords,
      tableData,
      loadingShow,
      jobTable,
      tableHeight,
      selectionShow,
      options,
      reserveSelection,
      tableKey,
      search,
      switchChange,
      rowClass,
      getRowKeys,
      selectionChange,
      isDisabled,
      rowClick,
      cellClass,
    }
  }
})
</script>
<style lang="less" scoped>
/deep/ .el-table .DisableSelection .cell .el-checkbox__inner {
  display: none;
}

.header-box {
  // width: 100%; 
  display: flex;
  justify-content: space-between;
  margin-top: 0px;
  margin-bottom: 0px;
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

.compartitle {
  p {
    color: #7f7f7f;
    font-size: 16px;

    span {
      display: block;
    }
  }
}
</style>
<style lang="less">
.el-switch__label {
  color: #0960bd;
}

.el-switch__label.is-active {
  color: #A8ABB2;
}
</style>
