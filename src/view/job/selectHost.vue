<template>
  <div class="steps-second">
    <p>作業対象のホスト／ホストグループにチェックを入れて、[つぎへ]を押してください。</p>
    <el-input
      v-model="keyWords"
      style="width: 460px"
      placeholder="ホスト名またはIPアドレスキーワードによって検索"
      class="searchBtn"
    >
      <template #append><el-button @click="search">フィルタ</el-button></template>
    </el-input>
    <el-table
      ref="hostTable"
      v-loading="deleteCheckLoading || (activeName == '2' ? loadingShow1 : loadingShow)"
      :element-loading-text="deleteCheckLoading ? '削除中...' : 'loading...'"
      :data="tableData"
      border
      :height="tableHeight"
      :row-style="rowClass"
      style="width: 100%"
      :row-key="getRowKeys"
      @selection-change="selectionChange"
      @row-click="rowClick"
      :row-height="27"
    >
      <el-table-column type="selection" width="55" :reserve-selection="true" />
      <el-table-column
        v-for="(item, index) in columns"
        :prop="item.dataIndex"
        :label="item.title"
        :key="index"
      />
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
  onActivated,
  onBeforeUnmount,
  getCurrentInstance,
  onDeactivated,
} from "vue";
import { useStore } from "../../store/index";
import { deviceList } from "../../api/index";

import { ElMessage, ElTable } from "element-plus";
import {
  getOperationDataSetInfos,
} from "../../api/jobApi";
export default defineComponent({
  name: "SelectHost",
  emits: ["changeHost", "changeHostLoading"],
  props: ["activeName","deleteLoading"],
  setup(props, { emit }) {
    const store = useStore();
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
    let restName = localStorage.getItem("restName") || "";
    let groupName = store.getGroupName;
    let tableData: any = reactive([]);
    const hostList: any = reactive([]);
    const groupList: any = reactive([]);
    let deviceListData: any = reactive([]);
    const keyWords = ref<string>("");
    const hostTable: any = ref(null);
    let tableHeight = ref();
    // table loading
    const loadingShow = ref(true);
    const loadingShow1 = ref(true);
    const deleteCheckLoading = ref(false);

    // change host
    let selectedHost: any = reactive([]);
    // The host that is logged in

    const toggleSelection = (rows?: any) => {
      if (rows) {
        rows.forEach((row: any) => {
          // TODO: improvement typing when refactor table
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          hostTable.value!.toggleRowSelection(row, true);
        });
      } else {
        hostTable.value!.clearSelection();
      }
    };
    let hostIsLoggedIn: any = reactive([]);
    let activeName: any = ref(props.activeName);
    const getMenuItem = async () => {
      let movement = store.getMovement;
      loadingShow1.value = true;
      emit("changeHostLoading", true);
      let hosts = store.getLoggedHost;
      hostIsLoggedIn.length = 0;
      for (let index = 0; index < hosts.length; index++) {
        hostIsLoggedIn.push(hosts[index]);
      }
      loggedInHost.length = 0;
      setLoggedHost();
      emit("changeHostLoading", false);
    };
    onActivated(() => {
      let host = store.getHost;
      let movement = store.getMovement;
      let loggedHost1 = store.getLoggedHost;
      let loggedMovement1 = store.getLoggedMovement;
      getOperationDataSetInfos(store.getLoginOperationId).then((res: any) => {
        if (res.data.data.length != 0) {
          let parameters: any = res.data.data[0].parameter;
          store.setLoggedOperationDataSetInfos(parameters);
        }
      }).catch((error: any) => {
        ElMessage({
          type: "error",
          message: error,
        });
      });
     
    });

    onMounted(() => {
      if (activeName.value == "2") {
        getMenuItem();
      }
      tableHeight.value = window.innerHeight - 380;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 380;
      };
    });
    onBeforeUnmount(() => {
    });
    // search
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
    // host list
    function getDataList(restName: string, arr: Array<any>) {
      loadingShow.value = true;
      emit("changeHostLoading", true);
      deviceList(restName)
        .then((res: any) => {
          let arr1 = res.data.data;
          arr1.forEach((element: any) => {
            arr.push(element.parameter);
          });
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }
    getDataList(restName, hostList);
    getDataList(groupName, groupList);
    // change host
    const selectionChange = (val: any) => {
      selectedHost.length = 0;
      val.forEach((item: any) => {
        selectedHost.push(item);
      });

      store.setHost(selectedHost);
      emit("changeHost", selectedHost);
    };
    const mapKey: any = {
      hostgroup_name: "host_name",
    };
    watch(
      () => props.deleteLoading,
      (val: any) => {
        deleteCheckLoading.value = val
      },
      {
        immediate: true,
        deep: true,
      }
    ),
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
          emit("changeHostLoading", false);
        }
      },
      {
        immediate: true,
        deep: true,
      }
    );
    let loggedInHost: any = reactive([]);

    const setLoggedHost = () => {
      loggedInHost.length = 0;
      if (loadingShow.value) {
        setTimeout(setLoggedHost, 500);
      } else {
        tableData.filter((el: any) => {
          hostIsLoggedIn.forEach((elInner: any) => {
            if (el.managed_system_item_number) {
              if (el.managed_system_item_number == elInner) {
                loggedInHost.push(el);
              }
            } else if (el.hostgroup_id == elInner) {
              loggedInHost.push(el);
            }
          });
        });

        store.setLoggedHost(loggedInHost);
        store.setHost(loggedInHost);

        toggleSelection(loggedInHost);
        loadingShow1.value = false;
      }
    };
    // remeber
    const getRowKeys = (row: any) => {
      return row.managed_system_item_number;
    };
    const rowClass = ({ row }: any) => {
      if (selectedHost.includes(row)) {
        return { color: "#0960bd" };
      }
    };
    const rowClick = (val: any) => {
      // currentRow.value = val.operation_name;

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
    onDeactivated(() => { deleteCheckLoading.value = false});
    return {
      columns,
      keyWords,
      tableData,
      getRowKeys,
      search,
      selectionChange,
      rowClass,
      rowClick,
      hostTable,
      tableHeight,
      loadingShow,
      activeName,
      loadingShow1,
      deleteCheckLoading,
    };
  },
});
</script>

<style scoped lang="less">
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
</style>
<style lang="less" scoped>
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
</style>
