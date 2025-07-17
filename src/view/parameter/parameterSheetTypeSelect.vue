<template>
  <div class="steps-one ">
    <p>パラメータシート所属のメニューグループまたはConductorから参照対象種別を選択してください。</p>
    <div class="firstStep">
      <el-card shadow="never" class="tabBox">
        <h2 class="title">種別</h2>
        <el-radio-group v-model="radioActiveName">
          <el-radio border label="1" size="large" style="margin-bottom: 20px;" :disabled="loadingShow">メニューグループから選ぶ</el-radio>
          <el-radio border label="2" size="large" :disabled="loadingShow">Conductorから選ぶ</el-radio>
        </el-radio-group>
      </el-card>
      <el-card shadow="never" class="cardBoxR">
        <div class="oldBox">
        <h2 class="title" v-if = "radioActiveName == '1'">メニューグループ</h2>
        <el-table
          v-if = "radioActiveName == '1'"
          :data="selectdata"
          v-loading="loadingShow"
          element-loading-text="loading..."
          scrollbar-always-on
          @current-change="rowClick"
          border
          :height="tableHeight"
          highlight-current-row
          :row-height="27"
          style="cursor: pointer"
        >
        <el-table-column label="" width="55" align="center">
            <template #default="scope">
              <el-radio
                class="radio"
                :label="scope.row.id"
                v-model="currentRow"
                >&nbsp;</el-radio
              >
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, index) in menu_group_columns"
            :label="item.title"
            :prop="item.dataIndex"
            :key="index"
          ></el-table-column>
        </el-table>
        <h2 class="title" v-if = "radioActiveName == '2'">Conductor</h2>
        <el-table
          v-if = "radioActiveName == '2'"
          :data="selectdata"
          v-loading="loadingShow"
          element-loading-text="loading..."
          scrollbar-always-on
          @current-change="rowClick"
          border
          :height="tableHeight"
          highlight-current-row
          :row-height="27"
          style="cursor: pointer"
        >
        <el-table-column label="" width="55" align="center">
            <template #default="scope">
              <el-radio
                class="radio"
                :label="scope.row.id"
                v-model="currentRow"
                >&nbsp;</el-radio
              >
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, index) in conductor_columns"
            :label="item.title"
            :prop="item.dataIndex"
            :key="index"
          ></el-table-column>
        </el-table>
      </div>
      </el-card>
      
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, watch, onMounted,nextTick } from "vue";
import { getradiosInfo, getMenuGroupList } from "../../api/jobApi";
import {
  ElMessage,
} from "element-plus";

export default defineComponent({
  name: "typeselect",
  components: {},
  props: [],
  emits: ["setSelectType"],
  setup(props, { emit }) {
    let tableHeight = ref();
    const radioActiveName = ref("1");
    const selectdata: any = reactive([]);
    const loadingShow: any = ref(false);
    let currentRow = ref("");
    let currentRowName = ref("");
    const menu_group_columns = reactive([
      {
        title: "メニューグループ名",
        dataIndex: "name",
      },
      {
        title: "備考",
        dataIndex: "reference",
      },
    ]);
    const conductor_columns = reactive([
      {
        title: "Conductor名",
        dataIndex: "name",
      },
      {
        title: "備考",
        dataIndex: "reference",
      },
    ]);
    emit("setSelectType", "", "","1");
    const getMenuGroupInfo = async () => {
      const data = {
        discard: {
          NORMAL: "0",
        },
        menu_group_id: {
          LIST: ["502"],
        }
      };
      await getMenuGroupList(data).then(async (res: any) => {
        const group_name_ja = res.data.data[0].parameter.menu_group_name_ja
        const sub_data = {
          discard: {
            NORMAL: "0",
          },
          parent_menu_group_name: {
            LIST: [res.data.data[0].parameter.menu_group_name_ja],
          }
        };
        await getMenuGroupList(sub_data).then(async (res: any) => {
          selectdata.length = 0;
          let res_data = res.data.data;
          res_data.sort((a:any,b:any)=> a.parameter.display_order - b.parameter.display_order);
          res_data.forEach((element: any) => {
            selectdata.push({ name: element.parameter.menu_group_name_ja, reference: "", id: group_name_ja + "/" + element.parameter.menu_group_name_ja });
          });
        }).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
        await nextTick(); 
      }).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }
    getMenuGroupInfo();
    const getConductor = async() => {
      await getradiosInfo().then((res: any) => {
        selectdata.length = 0;
        let data = res.data.data;
        data.sort((a:any,b:any)=> b.parameter.conductor_name.localeCompare(a.parameter.conductor_name));
        data.forEach((element: any) => {
          selectdata.push({ name: element.parameter.conductor_name, reference: "",id: element.parameter.conductor_class_id});
        })
      }).catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
      });
      await nextTick();
    };
    watch(radioActiveName, async (val, old) => {
      if (val == "1") {
        loadingShow.value = true;
        selectdata.value = [];
        await getMenuGroupInfo();
      } else {
        loadingShow.value = true;
        selectdata.value = [];
        await getConductor();
      }
      currentRow.value = "";
      currentRowName.value = "";
      emit("setSelectType", "", "",val);
      loadingShow.value = false;
    });

    onMounted(() => {
      tableHeight.value = window.innerHeight - 440;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 440;
      };
    });
    const rowClick = (val: any) => {
      if (val != undefined) {
        currentRow.value = val.id
        if (radioActiveName.value == "1") {
          currentRowName.value = "メニューグループ：" + val?.name;
        } else {
          currentRowName.value = "Conductor：" + val?.name;
        }
      } else {
        currentRowName.value = "";
        currentRow.value = "";
      }
      
      emit("setSelectType", currentRowName.value, currentRow.value,radioActiveName.value);

    };
    return { radioActiveName,selectdata,loadingShow,rowClick,tableHeight,currentRow,menu_group_columns,conductor_columns };
  }
});
</script>
<style scoped lang="less">
.oldBox {
  width: 100%;
  margin-bottom: 0 !important;
}
.oneStep {
  min-height: 417px;
  padding: 20px 0;
  border: 1px solid #e4e7ed;
}
.steps-one {
  height: 417px;

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
.cardBoxR {
  position: relative;
  flex: auto;
  margin-left: 20px;
  overflow: hidden;
  padding-bottom: 20px;
}
.tabBox {
  text-align: center;
  width: 260px;
  max-height: 650px;
  /deep/.el-card__body {
    height: 90%;
  }
  margin-right: 20px;
  padding-bottom: 20px;
  padding-right: 100px;
  /deep/.el-radio.is-bordered.is-checked {
    background-color: #0960bd;
    color: #fff;
  }

  /deep/.el-radio__input.is-checked + .el-radio__label {
    color: #fff;
  }

  .el-radio {
    width: 320px;
  }

  .el-radio:hover {
    background-color: #f5f7fa;
  }

  // /deep/.el-radio:last-child {
  //   margin-left: 100px;
  // }
}

.firstStep {
  display: flex;
  justify-content: space-between;
  text-align: center;
  .title {
    text-align: left;
    margin: 0 0 10px 0;
  }
}
/deep/.el-table__body tr.current-row > td.el-table__cell {
  color: #0960bd;
  background-color: #fff;
}
</style>
<style lang="less">
.el-radio.is-bordered.is-checked {
  border-color: #0960bd;
  color: #0960bd;
}
.el-step.is-center .el-step__description {
  padding-left: 0%;
  padding-right: 0%;
}
.el-step.is-horizontal {
  width: 20% !important;
  flex-basis: auto !important;
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
  line-height: 27px !important;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #0960bd;
  border-color: #0960bd;
}

.el-checkbox__inner::after {
  border-color: #fff;
}

.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #fff;
  border-color: #fff;
}
.messageBoxWarning {
  max-width: 600px !important;
  .messageContent {
    display: flex;

    .label {
      white-space: nowrap;
    }
    .content {
      text-indent: 4px;
      flex-wrap: wrap;
    }
  }
}
</style>