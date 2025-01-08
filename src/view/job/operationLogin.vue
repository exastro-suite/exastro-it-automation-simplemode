<template>
  <div class="steps-third">
    <p>作業名（オペレーション）を登録または選択してください。</p>
    <div class="thirdStep">
      <div class="tabBox">
        <el-radio-group v-model="activeName" class="ml-4">
          <el-radio border label="1" size="large">オペレーションを新規登録する</el-radio>
          <el-radio border label="2" size="large"
            >中断したオペレーションを再開する</el-radio
          >
        </el-radio-group>
      </div>
      <div v-if="activeName == '1'" class="newBox">
        <div class="dataListInputBox">
          <span class="inputLable">オペレーション名</span>
          <input
            id="dataListInput"
            type="text"
            :readonly="successOperation ? isDisabled : false"
            v-model="login"
            list="dataList"
            placeholder="オペレーション名を選択または入力"
            style="width: 378px; display: inline"
            name="dataListname"
          />
          <datalist id="dataList">
            <option v-for="item in optionsNames" :key="item.value">
              {{ item.label }}
            </option>
          </datalist>
        </div>
        <span class="inputLable">予定実行日時（現在時刻が自動的に設定されます） </span
        ><el-input v-model="dataTime" style="width: 400px" placeholder="" disabled />
      </div>
      <div v-else class="oldBox">
        <el-input
          v-model="keyWords"
          style="width: 400px"
          placeholder="オペレーション名を入力"
          class="searchIpt"
        >
          <template #append><el-button @click="search">フィルタ</el-button></template>
        </el-input>
        <el-table
          :data="operations"
          v-loading="loadingShow"
          element-loading-text="loading..."
          scrollbar-always-on
          @current-change="rowClick"
          border
          :height="tableHeight"
          highlight-current-row
          :row-height="27"
        >
          <el-table-column label="" width="55" align="center">
            <template #default="scope">
              <el-radio
                class="radio"
                :label="scope.row.operation_name"
                v-model="currentRow"
                >&nbsp;</el-radio
              >
            </template>
          </el-table-column>
          <el-table-column
            v-for="(item, index) in columns"
            :label="item.title"
            :prop="item.dataIndex"
            :key="index"
          ></el-table-column
        ></el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  watch,
  onMounted,
  getCurrentInstance,
} from "vue";
import { getradiosInfo, optionLogin } from "../../api/jobApi";
import { operationList } from "../../api/jobList";
import { ElMessage, ElTable, ElRadio } from "element-plus";
import { useStore } from "../../store/index";
import { eventBus } from "../../store/eventBus";
import { DocumentCopy } from "@element-plus/icons-vue";
type dataType = {
  operation_id: string;
  operation_name: string;
  scheduled_date_for_execution: string;
};
export default defineComponent({
  name: "OperationLogin",
  emits: ["changeValue", "changeActiveName", "isChangeDisabled", "getTime2", "getTime"],
  props: ["isDisabled", "successOperation"],
  components: {
    DocumentCopy,
  },
  setup(props, { emit }) {
    // event bus

    const bus = eventBus();

    const changeLoginOperation = function (a: any) {
      bus.emit("changeLoginOperation", a);
    };
    const loadingShow = ref(true);
    let tableHeight = ref();
    onMounted(() => {
      tableHeight.value = window.innerHeight - 440;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 440;
      };
    });
    const store = useStore();
    let conductor = store.getConductor;
    //新規   既存
    const activeName = ref("1");
    // オペレーション名
    const login = ref<string>("");
    const optionsNames: any = reactive([]);
    const getCurVal = (val: any) => {
      login.value = val.target.value;
    };
    let dataTime = ref("");
    let dataTime2 = ref("");
    let loginTime = ref("");
    let successOperation = ref("");
    // 現在の時刻を取得します。
    const getNowTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
      const date = now.getDate() >= 10 ? now.getDate() : `0${now.getDate()}`;
      const hour = now.getHours() >= 10 ? now.getHours() : `0${now.getHours()}`;
      const minutes = now.getMinutes() >= 10 ? now.getMinutes() : `0${now.getMinutes()}`;
      const seconds = now.getSeconds() >= 10 ? now.getSeconds() : `0${now.getSeconds()}`;
      dataTime.value = `${year}/${month}/${date} ${hour}:${minutes}:${seconds}`;
      loginTime.value = `${year}${month}${date}${hour}${minutes}${seconds}`;
      dataTime2.value = `${year}/${month}/${date} ${hour}:${minutes}`;
    };
    // get conductor list
    function getConductorList() {
      getNowTime();
      getradiosInfo().then((res: any) => {
        let data = res.data.data;
        data.forEach((element: any) => {
          let obj: any = {
            value: element.parameter.conductor_name + "_" + loginTime.value,
            label: element.parameter.conductor_name + "_" + loginTime.value,
          };
          optionsNames.push(obj);
        });
      });
    }
    getConductorList();
    watch(login, (val, old) => {
      emit("changeValue", val);
    });
    watch(props, (val, old) => {
      isDisabled.value = val.isDisabled;
      successOperation.value = val.successOperation;
    });
    watch(
      dataTime2,
      (val, old) => {
        emit("getTime2", val);
      },
      { immediate: true }
    );
    watch(
      dataTime,
      (val, old) => {
        emit("getTime", val);
      },
      { immediate: true }
    );
    watch(activeName, (val, old) => {
      emit("changeActiveName", val);
      if (val == "2") {
        getInterruptedOperations();
        keyWords.value = "";
      }
    });

    let flag = ref(false);
    let flagButton = ref(false);
    let isDisabled = ref(props.isDisabled);
    const keyWords = ref<string>("");
    // search
    const search = () => {
      if (keyWords.value) {
        let result = operationsCopy.filter((item: any) => {
          return item.operation_name.indexOf(keyWords.value) != -1;
        });

        operations.length = 0;
        result.forEach((element: any) => {
          operations.push(element);
        });
      } else {
        operations.length = 0;
        operationsCopy.length = 0;
        getInterruptedOperations();
      }
    };

    let operations: Array<dataType> = reactive([]);
    let operationsCopy: Array<dataType> = reactive([]);
    const columns = reactive([
      {
        title: "オペレーション名",
        dataIndex: "operation_name",
      },
      {
        title: "実施予定日時",
        dataIndex: "scheduled_date_for_execution",
      },
    ]);
    function getInterruptedOperations() {
      loadingShow.value = true;
      operationList()
        .then((res: any) => {
          let data = res.data.data;
          let result = data.filter((el: any) => {
            return el.parameter.last_run_date == null;
          });

          let arr1 = result.sort((a: any, b: any) =>
            b.parameter.scheduled_date_for_execution.localeCompare(
              a.parameter.scheduled_date_for_execution
            )
          );

          operations.length = 0;
          operationsCopy.length = 0;
          arr1.forEach((element: any) => {
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
    getInterruptedOperations();
    let currentRow = ref("");

    const rowClick = (val: any) => {
      currentRow.value = val.operation_name;
      store.setLoginOperationId(val.operation_id)
      store.setLoginOperation(val.operation_name);
      store.setLogOperationScheduledDate(val.scheduled_date_for_execution);
      changeLoginOperation(val.operation_name);

      emit("isChangeDisabled", true);

      store.setOperationSelect(
        val.scheduled_date_for_execution.slice(0, -3) + "_" + val.operation_name
      );
    };

    return {
      currentRow,
      activeName,
      keyWords,
      columns,
      login,
      successOperation,
      dataTime,

      search,
      flag,
      flagButton,
      loadingShow,
      operations,
      tableHeight,
      rowClick,
      optionsNames,
      getCurVal,
      isDisabled,
      DocumentCopy,
    };
  },
});
</script>

<style scoped lang="less">
.steps-third {
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

.tabBox {
  text-align: center;

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

  /deep/.el-radio:last-child {
    margin-left: 150px;
  }
}

.thirdStep {
  min-height: 417px;
  padding: 20px 0;
  border: 1px solid #e4e7ed;

  .inputLable {
    display: block;
    color: #7f7f7f;
    width: 400px;
    margin: 10px 0 5px 0;
    text-align: left;
    font-size: 14px;
  }
}

.newBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 30px auto;

  /deep/.el-input__inner {
    font-size: 16px;
  }
  #dataListInput {
    font-size: 16px;
    color: #606266;
    height: 32px;
    padding: 0 11px;
    border-style: none;
    outline: none;
    border: 1px solid #dcdfe6;
  }
  .dataListInputBox {
    input::-webkit-calendar-picker-indicator {
      display: none !important;
      -webkit-appearance: none !important;
    }
  }
}

.oldBox {
  width: 80%;
  margin: 30px auto;
  margin-bottom: 0 !important;
}

.searchBtn {
  margin: 16px 0;
  display: block;
  color: #fff;
  border-color: #da6a38;
  background-color: #da6a38;
  border-radius: 4px;

  &:hover,
  &:focus {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    opacity: 0.8;
  }
}
.searchBtn1 {
  margin: 16px 0;
  display: block;
  border-radius: 4px;
}
.btnBox {
  width: 400px;
  text-align: left;
}

.resInfo {
  width: 400px;

  span {
    display: block;
    width: 400px;
    color: #7f7f7f;
    line-height: 35px;
    font-size: 16px;
    word-break: break-all;
   
  }
}

.searchIpt {
  /deep/button {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    border-radius: 0px;

    &:hover {
      color: #fff;
      border-color: #da6a38;
      background-color: #da6a38;
      border-radius: 0;
      opacity: 0.8;
    }
  }

  margin-bottom: 10px;
}

/deep/.el-table__body tr.current-row > td.el-table__cell {
  color: #0960bd;
  background-color: #fff;
}
</style>
<style lang="less">
.el-message-box__btns button:nth-child(2) {
  margin-left: 10px !important;
}
</style>
