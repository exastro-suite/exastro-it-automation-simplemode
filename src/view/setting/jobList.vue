<template>
  <div class="header-box">
    <el-input
      v-model="keyWords"
      style="width: 460px"
      placeholder="検索"
      class="searchBtn"
    >
      <!-- <template #append><el-button :icon="Search" @click="search" /></template> -->
      <template #append><el-button @click="search">フィルタ</el-button></template>
    </el-input>
    <div class="button-action">
      <!-- <el-tooltip content="Refresh" placement="bottom" effect="light"> -->
      <el-button type="primary" class="refresh_btn" @click="handleRefresh"
        ><el-icon size="16px"> <Refresh /> </el-icon>&nbsp;
        <span style="display: inline-block; margin-top: 2px">更新</span></el-button
      >
    </div>
  </div>
  <el-table
    :data="conductor"
    border
    height="648"
    style="width: 100%"
    @sort-change="sortMethod"
    v-loading="loadingShow"
    element-loading-text="loading..."
    :row-height="27"
  >
    <template v-for="(item, index) in columns" :key="index">
      <el-table-column
        v-if="item.dataIndex == 'details'"
        :prop="item.dataIndex"
        :label="item.title"
        width="100"
      >
        <template #default="scope">
          <el-button class="exBtn" type="primary" @click="toDetail(scope.row)"
            ><el-icon> <Search /> </el-icon>&nbsp;詳細</el-button
          >
        </template>
      </el-table-column>
      <el-table-column v-else :prop="item.dataIndex" :label="item.title" sortable />
    </template>
  </el-table>
  <el-dialog
    class="movementDialog"
    v-model="dialogVisible"
    title="Movementの一覧"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-table
      :data="movementData"
      border
      v-loading="loadingShowDetail"
      element-loading-text="loading..."
    >
      <el-table-column
        v-for="(item, index) in movementColumns"
        :label="item.title"
        :prop="item.dataIndex"
        :key="index"
      ></el-table-column>
    </el-table>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { getradiosInfo, movementInfo } from "../../api/jobApi";
import { movementList } from "../../api/jobList";
import { ElMessage, ElTable } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import { debounce } from "../../utils/debounce";
type conductorType = {
  conductor_class_id: string;
  conductor_name: string;
  remarks: string;
  last_update_date_time: string;
  last_updated_user: string;
};
export default defineComponent({
  components: {
    Search,
    Refresh,
  },
  setup() {
    const loadingShow = ref(true);
    const loadingShowDetail = ref(true);
    const columns = reactive([
      {
        title: "Conductor名称",
        dataIndex: "conductor_name",
      },
      {
        title: "詳細",
        dataIndex: "details",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
      {
        title: "最終更新日時",
        dataIndex: "last_update_date_time",
      },
      {
        title: "最終更新者",
        dataIndex: "last_updated_user",
      },
    ]);

    // Conductor一覧
    let conductor: Array<conductorType> = reactive([]);
    let conductorCopy: Array<conductorType> = reactive([]);
    function getRadios() {
      loadingShow.value = true;
      getradiosInfo()
        .then((res: any) => {
          let data = res.data.data;
          data.forEach((element: any) => {
            element.parameter.last_update_date_time = element.parameter.last_update_date_time.substring(
              0,
              element.parameter.last_update_date_time.length - 7
            );
            conductor.push(element.parameter);
            conductorCopy.push(element.parameter);
          });
          loadingShow.value = false;
        })
        .catch((error: any) => {
          loadingShow.value = false;
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }
    getRadios();
    // Column sorting
    const sortMethod = (column: any) => {
      if (column.order !== null && column.prop === "remarks") {
        const data: Array<conductorType> = reactive([]);
        for (let i = 0; i < conductor.length; i++) {
          if (conductor[i].remarks === null || conductor[i].remarks === "") {
            data.push(conductor[i]);
          } else {
            data.unshift(conductor[i]);
          }
        }

        conductor.length = 0;
        for (let i = 0; i < data.length; i++) {
          conductor.push(data[i]);
        }
      }
    };
    let dialogVisible = ref(false);
    const movementColumns = reactive([
      {
        title: "Movement名",
        dataIndex: "movement_name",
      },
      {
        title: "オーケストレータ",
        dataIndex: "orchestrator",
      },
      {
        title: "ホスト指定形式",
        dataIndex: "host_specific_format",
      },

      {
        title: "WinRM接続",
        dataIndex: "winrm_connection",
      },
      {
        title: "ヘッダーセクション",
        dataIndex: "header_section",
      },
      {
        title: "備考",
        dataIndex: "remarks",
      },
      {
        title: "最終更新日時",
        dataIndex: "last_update_date_time",
      },
      {
        title: "最終更新者",
        dataIndex: "last_updated_user",
      },
    ]);
    let movementData: Array<any> = reactive([]);
    const toDetail = (row: any) => {
      dialogVisible.value = true;
      movementData.length = 0;
      getMovement(row.conductor_class_id);
    };
    const getMovement = async (conductor: string) => {
      loadingShowDetail.value = true;
      try {
        let movementArray = await movementInfo(conductor);
        let data = movementArray.data.data;
        let movement = [];
        for (const key in data) {
          const element = data[key];
          if (Object.prototype.hasOwnProperty.call(element, "movement_id")) {
            let obj = { movement_id: "", movement_name: "" };
            obj.movement_id = element.movement_id;
            obj.movement_name = element.movement_name;
            movement.push(obj);
          }
        }
        let list = [];
        for (const val of movement) {
          list.push(val.movement_id);
        }
        let params = {
          discard: {
            NORMAL: "0",
          },
          movement_id: {
            LIST: list,
          },
        };
        try {
          let movementFilter = await movementList(params);

          let data = movementFilter.data.data;
          data.forEach((el: any) => {
            el.parameter.last_update_date_time = el.parameter.last_update_date_time.substring(
              0,
              el.parameter.last_update_date_time.length - 7
            );
            movementData.push(el.parameter);
          });
          loadingShowDetail.value = false;
        } catch (error) {
          loadingShowDetail.value = false;
        }
      } catch (error) {
        loadingShowDetail.value = false;
      }
    };
    const keyWords = ref<string>("");
    const search = () => {
      if (keyWords.value) {
        let result = conductorCopy.filter((item: any) => {
          return item.conductor_name.indexOf(keyWords.value) != -1;
        });
        conductor.length = 0;
        result.forEach((element) => {
          conductor.push(element);
        });
      } else {
        conductor.length = 0;
        conductorCopy.length = 0;

        getRadios();
      }
    };
    // refresh
    const handleRefresh = debounce(() => {
      loadingShow.value = true;
      conductor.length = 0;
      getRadios();
      keyWords.value = "";
    }, 500);
    return {
      conductor,
      columns,
      dialogVisible,
      movementColumns,
      movementData,
      sortMethod,
      toDetail,
      loadingShow,
      loadingShowDetail,
      keyWords,
      handleRefresh,
      search,
    };
  },
});
</script>

<style scoped lang="less">
.exBtn {
  border-color: #418d45;
  background-color: #418d45;
}
.cell {
  button {
    height: auto;
    padding: 2px 10px !important;
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

.button-action {
  width: 475px;
  display: flex;
  justify-content: right;
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
}

:deep(.el-input__inner) {
  font-size: 13px;
}
</style>

<style lang="less">
.movementDialog {
  --el-dialog-width: 78% !important;
}
.el-table tbody tr .el-table__cell {
  padding: 0px 0 !important;
}
.el-table .el-table__cell {
  padding: 0px 0 !important;
}
.el-table .cell {
  line-height: 27px !important;
}
.header-box {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>
