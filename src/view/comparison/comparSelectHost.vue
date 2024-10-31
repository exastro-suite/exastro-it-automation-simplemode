<template>
  <div class="compartitle" style="border: 1px solid #c3c3c3;padding-left: 5px;padding-right: 5px;border-radius: 6px;">
    <p>対象ホスト</p>
    <div class="header-box">
      <el-input v-model="keyWords" style="width: 460px" placeholder="ホスト名 または IPアドレスを入力" class="searchBtn">
        <template #append><el-button @click="search">フィルタ</el-button></template>
      </el-input>
      <el-switch v-model="switchValue" @change="switchChange" size="large" inactive-text="チェックした項目だけを表示"
        style="--el-switch-on-color: #0960bd;" />
    </div>
    <el-table :key="tableKey" ref="hostTable" v-loading="loadingShow" element-loading-text="loading..."
      :data="tableData" :height="tableHeight" :row-style="rowClass" style="width: 100%" border :row-key="getRowKeys"
      @selection-change="selectionChange" @row-click="rowClick" :row-height="27" :header-cell-class-name="cellClass"
      :default-sort="{
        prop: 'host_name', order: 'ascending'
      }">
      <el-table-column :selectable="isDisabled" type="selection" width="55" :reserve-selection="reserveSelection" />
      <el-table-column v-for="(item, index) in columns" :prop="item.dataIndex" :label="item.title" :key="index">
        <template #default="{ row }">
          <el-tooltip placement="bottom" effect="light" :hide-after=0>
            <template #content>
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
import { comparDevicelist } from "../../api/comparApi";
export default defineComponent({
  name: "comparSelectHost",
  emits: ["selection-change"],
  components: {
    ElButton,
    ElTable,
    ElTooltip,
    Boolean
  },
  setup(props, { emit }) {
    const bus = eventBus();
    const store = useStore();
    const switchValue = ref(false);
    const keyWords = ref<string>("");
    let tableData: any = reactive([]);
    let deviceListData: any = reactive([]);
    const hostList: any = reactive([]);
    const groupList: any = reactive([]);
    let groupName = store.getGroupName;
    const hostTable: any = ref(null);
    let tableHeight = ref(100);
    const loadingShow = ref(true);
    const columns = reactive([
      {
        title: "ホスト名",
        dataIndex: "host_name",
      },
      {
        title: "IPアドレス",
        dataIndex: "ip_address",
      },
    ]);
    let selectedHost: any = reactive([]);
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
      return row.managed_system_item_number;
    };
    const rowClass = ({ row }: any) => {
      if (selectedHost.includes(row)) {
        return { color: "#0960bd" };
      } else {
        if (!selectionShow.value) {
          return { display: 'none' };
        }
      }
    };
    const search = () => {
      if (keyWords.value) {
        let result = deviceListData.filter((item: any) => {
          if (
            item.host_name.indexOf(keyWords.value) != -1 ||
            item.ip_address?.indexOf(keyWords.value) != -1
          )
            return item;
        });
        tableData.length = 0;
        result.forEach((element: any) => {
          tableData.push(element);
        });
      } else {
        tableData.length = 0;
        deviceListData.forEach((el: any) => {
          tableData.push(el);
        });
      }
    };
    // change host
    const selectionChange = (val: any) => {
      selectedHost.length = 0;
      let loggedComparHost: any = reactive([]);
      val.forEach((item: any) => {
        selectedHost.push(item);
        loggedComparHost.push(item.host_name);
      });
      store.setLoggedComparHost(loggedComparHost);
    };
    const rowClick = (val: any) => {
      if (selectionShow.value == false) {
        return
      }
      let resultFlag = selectedHost.findIndex((item: any) => {
        return item.managed_system_item_number == val.managed_system_item_number;
      });

      if (resultFlag == -1) {
        hostTable.value!.toggleRowSelection(val, true);
      } else {
        hostTable.value!.toggleRowSelection(val, false);
      }
    };
    const switchChange = (val: boolean) => {
      keyWords.value = '';
      tableData.length = 0;
      deviceListData.forEach((el: any) => {
        tableData.push(el);
      });
      if (val == true) {
        selectionShow.value = false;
      } else {
        selectionShow.value = true;
      }
    };
    const mapKey: any = {
      hostgroup_name: "host_name",
    };
    const toggleSelection = (rows?: any) => {
      if (rows) {
        rows.forEach((row: any) => {
          hostTable.value!.toggleRowSelection(row, true);
        });
      } else {
        hostTable.value!.clearSelection();
      }
    };
    const cellClass = (row: any) => {
      if (row.columnIndex === 0 && selectionShow.value == false) {
        return "DisableSelection";
      }
      return "";
    };
    // host list
    function getDataList(arr: Array<any>) {
      loadingShow.value = true;
      comparDevicelist()
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
    getDataList(hostList);
    watch(
      () => [hostList, groupList],
      ([hval, gval]) => {
        if (hval.length != 0) {
          tableData.length = 0;
          deviceListData.length = 0;
          hval.forEach((el: any) => {
            el["hw_device_type"] = "ホスト";
            tableData.push(el);
            deviceListData.push(el);
          });
          gval.forEach((el: any) => {
            el["ip_address"] = "-";
            el["hw_device_type"] = "ホストグループ";
            Object.keys(el).map((key) => {
              let newKey: any = mapKey[key];
              if (newKey) {
                el[newKey] = el[key];
              }
            });
          });
          gval.forEach((el: any) => {
            tableData.push(el);
            deviceListData.push(el);
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
      loadingShow.value = true
      store.setComparHost(undefined);
      store.setLoggedComparHost(undefined);
      switchValue.value = false;
      selectionShow.value = true;
      keyWords.value = '';
      tableData.length = 0;
      deviceListData.length = 0;
      hostList.length = 0;
      groupList.length = 0;
      hostTable.length = 0;
      selectedHost.length = 0;
      reserveSelection.value = false;
      await getDataList(hostList);
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
      hostTable,
      tableHeight,
      selectionShow,
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
