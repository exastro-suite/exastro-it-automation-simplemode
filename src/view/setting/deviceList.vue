<template>
  <div class="header-box">
    <el-input
      v-model="keyWords"
      style="width: 460px"
      placeholder="ホスト名 または IPアドレスを入力"
      class="searchBtn"
    >
      <template #append><el-button @click="search">フィルタ</el-button></template>
    </el-input>
    <div class="button-action">
      <el-button type="primary" class="refresh_btn" @click="handleRefresh"
        ><el-icon size="16px"> <Refresh /> </el-icon>&nbsp;
        <span style="display: inline-block; margin-top: 2px">更新</span></el-button
      >
      <el-button type="primary" class="export_btn" @click="handleExport"
        ><el-icon size="16px"> <Download /> </el-icon>&nbsp;
        <span style="display: inline-block; margin-top: 3px"
          >ダウンロード</span
        ></el-button
      >
      <el-upload
        ref="upload"
        class="upload-demo"
        action=""
        :limit="1"
        :on-change="handleChange"
        :auto-upload="false"
      >
        <template #trigger>
          <el-button type="primary" class="import_btn"
            ><el-icon size="16px" style="display: inline-block"> <Upload /> </el-icon
            >&nbsp;<span>アップロード</span></el-button
          >
        </template>
      </el-upload>
      <el-button type="primary" @click="handleRegister"
        ><el-icon size="16px" color="#fff"> <Plus /> </el-icon>&nbsp;
        <span style="display: inline-block; margin-top: 2px">登録</span></el-button
      >
    </div>
  </div>
  <el-table
    v-loading="loadingShow"
    element-loading-text="loading..."
    :data="tableData"
    border
    height="648"
    style="width: 100%"
    @sort-change="sortMethod"
    :row-height="27"
  >
    <el-table-column
      v-for="(item, index) in columns"
      :prop="index.toString()"
      :label="item"
      :width="
        index == 'host_name'
          ? 360
          : index == 'last_update_date_time'
          ? 195
          : index == 'ip_address'
          ? 180
          : index == 'last_updated_user'
          ? 200
          : ''
      "
      :key="index"
      sortable
      :formatter="
        index === 'last_update_date_time'
          ? formatDate
          : (row, column, cellValue) => cellValue
      "
    />

    <el-table-column label="" width="150">
      <template #default="scope">
        <el-icon
          @click="handleEdit(scope.$index, scope.row)"
          style="margin-left: 45px; color: #0960bd; cursor: pointer"
        >
          <Edit />
        </el-icon>
        <el-icon
          @click="handleDelete(scope.$index, scope.row)"
          style="margin-left: 25px; color: red; cursor: pointer"
        >
          <Delete />
        </el-icon>
      </template>
    </el-table-column>
  </el-table>
  <Dialog :visible="visible" @change="change" :id="id"></Dialog>
  <WelcomeDialog/>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from "vue";
import { useStore } from "../../store/index";
import {
  Search,
  Refresh,
  Plus,
  Download,
  Upload,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import {
  ElTooltip,
  ElTable,
  ElTableColumn,
  ElMessage,
  ElUpload,
  ElMessageBox,
} from "element-plus";
import type { UploadProps, UploadInstance } from "element-plus";
import {
  deviceListColumn,
  deviceList,
  updateApi,
  exportApi,
  importApi,
} from "../../api/index";
import Dialog from "./components/dialog.vue";
import WelcomeDialog from "./components/welcomeDialog.vue";
import { debounce } from "../../utils/debounce";
import { FileToBase64 } from "../../utils/fileToBase64";
interface DataType {
  last_update_date_time: string;
  host_name: string;
  last_updated_user: string;
  ip_address: string;
  remarks: string;
}
interface ColumnType {
  [key: string]: string;
}

export default defineComponent({
  name: "DeviceList",
  components: {
    ElTooltip,
    Refresh,
    Plus,
    Download,
    Upload,
    ElUpload,
    ElTable,
    ElTableColumn,
    Edit,
    Delete,
    Dialog,
    WelcomeDialog,
  },
  setup() {
    const store = useStore();
    const columns: ColumnType = reactive({});
    // search in table
    const keyWords = ref<string>("");
    const loadingShow = ref(true);
    // Column sorting
    const sortMethod = (column: any) => {
      if (column.order !== null && column.prop === "ip_address") {
        const data: Array<DataType> = reactive([]);
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].ip_address === null || tableData[i].ip_address === "") {
            data.push(tableData[i]);
          } else {
            data.unshift(tableData[i]);
          }
        }

        tableData.length = 0;
        for (let i = 0; i < data.length; i++) {
          tableData.push(data[i]);
        }
      } else if (column.order !== null && column.prop === "remarks") {
        const data: Array<DataType> = reactive([]);
        for (let i = 0; i < tableData.length; i++) {
          if (tableData[i].remarks === null || tableData[i].remarks === "") {
            data.push(tableData[i]);
          } else {
            data.unshift(tableData[i]);
          }
        }
        tableData.length = 0;
        for (let i = 0; i < data.length; i++) {
          tableData.push(data[i]);
        }
      }
    };
    // Keyword search
    const search = () => {
      if (keyWords.value) {
        let result = deviceListData.filter((item: any) => {
          return (
            item.host_name.indexOf(keyWords.value) != -1 ||
            item.ip_address?.indexOf(keyWords.value) != -1
          );
        });
        tableData.length = 0;
        result.forEach((element) => {
          tableData.push(element);
        });
      } else {
        tableData.length = 0;
        deviceListData.length = 0;
        getDeviceList();
      }
    };

    const restName = ref<string>("");

    function getColumn() {
      const menuList = JSON.parse(localStorage.getItem("menuList") || "");
      let result = menuList.filter((el: any) => el.id == "201");
      restName.value = result[0].menus.filter(
        (el: any) => el.id == "20101"
      )[0].menu_name_rest;

      store.setRestName(restName.value);

      localStorage.setItem("restName", restName.value);

      deviceListColumn(restName.value)
        .then((res: any) => {
          let obj = res.data.data;
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              if (
                key == "host_name" ||
                key == "ip_address" ||
                key == "remarks" ||
                key == "last_update_date_time" ||
                key == "last_updated_user"
              ) {
                columns[key] = obj[key];
              }
            }
          }
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }
    getColumn();
    // the data of table
    let tableData: Array<DataType> = reactive([]);
    // tableData==deviceListData
    let deviceListData: Array<DataType> = reactive([]);
    function getDeviceList() {
      loadingShow.value = true;
      deviceList(restName.value)
        .then((res: any) => {
          let arr1 = res.data.data;
          if (arr1.length) {
            arr1.forEach((element: any) => {
              tableData.push(element.parameter);
              deviceListData.push(element.parameter);
              loadingShow.value = false;
            });
          } else {
            loadingShow.value = false;
          }
        })
        .catch((error: any) => {
          loadingShow.value = false;
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }
    getDeviceList();
    // refresh
    const handleRefresh = debounce(() => {
      loadingShow.value = true;
      tableData.length = 0;
      deviceListData.length = 0;
      getDeviceList();
      keyWords.value = "";
    }, 500);

    // watch visible
    const visible = ref(false);
    const id = ref("");
    watch(visible, (val) => {
      visible.value = val;
    });
    // emits event
    const change = (val: boolean) => {
      visible.value = val;
      handleRefresh();
    };
    // Import event
    const upload = ref<UploadInstance>();
    const handleChange: UploadProps["onChange"] = (uploadFile) => {
      FileToBase64(uploadFile.raw).then((res: any) => {
        let base64Code = res.substring(res.indexOf(",") + 1);
        importApi(restName.value, base64Code)
          .then(() => {
            handleRefresh();
            upload.value!.clearFiles();
          })
          .catch((error: any) => {
            try {
              let errorInfo = JSON.parse(error);
              ElMessage({
                type: "error",
                message: errorInfo,
              });
            } catch (error: any) {
              ElMessage({
                type: "error",
                message: error,
              });
            }
            upload.value!.clearFiles();
          });
      });
    };
    // Export event
    function dataURLtoDownload(dataurl: any, name = "Ansible共通_機器一覧.xlsx") {
      var bstr = atob(dataurl),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      let blob = new Blob([u8arr]);
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    const handleExport = debounce(() => {
      exportApi(restName.value)
        .then((res: any) => {
          let base64Code = res.data.data;
          dataURLtoDownload(base64Code);
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }, 500);

    // Register event
    const handleRegister = () => {
      visible.value = true;
      id.value = "";
    };
    // editor and delete event
    const handleEdit = (index: any, row: any) => {
      visible.value = true;
      id.value = row.managed_system_item_number;
    };

    const handleDelete = (index: number, row: any) => {
      if (row.ip_address) {
        ElMessageBox.confirm(
          `${row.host_name}（${row.ip_address}）を削除します。よろしいですか？`,
          "削除",
          {
            confirmButtonText: "OK",
            cancelButtonText: "キャンセル",
            type: "warning",
          }
        )
          .then(() => {
            let delete_id = row.managed_system_item_number;

            let params = {
              parameter: {
                discard: 1,
                last_update_date_time: row.last_update_date_time,
              },
            };

            updateApi(restName.value, params, delete_id)
              .then(() => {
                handleRefresh();
              })
              .catch((error: any) => {
                ElMessage({
                  type: "error",
                  message: error,
                });
              });
          })
          .catch((error: any) => {
            ElMessage({
              type: "error",
              message: error,
            });
          });
      } else {
        ElMessageBox.confirm(`${row.host_name}を削除します。よろしいですか？`, "削除", {
          confirmButtonText: "OK",
          cancelButtonText: "キャンセル",
          type: "warning",
        })
          .then(() => {
            let delete_id = row.managed_system_item_number;
            let params = {
              parameter: {
                discard: 1,
                last_update_date_time: row.last_update_date_time,
              },
            };

            updateApi(restName.value, params, delete_id)
              .then((res: any) => {
                if ((res.data.message = "SUCCESS")) {
                  handleRefresh();
                }
              })
              .catch((error: any) => {
                ElMessage({
                  type: "error",
                  message: error,
                });
              });
          })
          .catch((error: any) => {
            ElMessage({
              type: "error",
              message: error,
            });
          });
      }
    };
    const formatDate = (row: any, column: any) => {
      const dateWithoutMicroseconds = new Date(row.last_update_date_time)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      return dateWithoutMicroseconds;
    };

    return {
      id,
      keyWords,
      tableData,
      upload,
      columns,
      visible,
      Search,
      change,
      handleEdit,
      handleDelete,
      search,
      handleRefresh,
      handleRegister,
      handleExport,
      handleChange,
      sortMethod,
      loadingShow,
      formatDate,
    };
  },
});
</script>

<style scoped lang="less">
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
.header-box {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
}

.button-action {
  width: 475px;
  display: flex;
  justify-content: space-around;
}

:deep(.el-input__inner) {
  font-size: 13px;
}

.el-table:deep(th .cell) {
  font-weight: normal;
  color: #212121 !important;
}

.el-table:deep(.cell) {
  color: #212121 !important;
}

.upload-demo {
  display: inline-block !important;
}

/deep/.el-upload-list {
  display: none !important;
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
  word-break: break-all !important;
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
