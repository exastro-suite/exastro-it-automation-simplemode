<template>
  <div class="steps-first">
    <p>実行対象のジョブ（Conductor/Movement）を選択してください。</p>
    <div class="firstStep">
      <el-card shadow="never" class="cardBoxL">
        <h2 class="title">Conductor</h2>
        <el-radio-group v-model="conductor">
          <el-tooltip
            :content="item.label"
            placement="right"
            effect="light"
            v-for="item in radios"
          >
            <el-radio
              @change="changeConductor"
              :label="item.value"
              :key="item.value"
              border
            >
              {{ item.label }}
            </el-radio></el-tooltip
          >
        </el-radio-group>
      </el-card>

      <el-card shadow="never" class="cardBoxR">
        <h2 class="title">Movement</h2>

        <el-table
          ref="tableRef"
          v-loading="loadingShow"
          element-loading-text="loading..."
          :data="movementData"
          border
          @selection-change="selectionChange"
          :row-style="rowClass"
          :height="tableHeight"
          @row-click="rowClick"
          :row-height="27"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column
            v-for="(item, index) in movementColumns"
            :label="item.title"
            :prop="item.dataIndex"
            :key="index"
          ></el-table-column>
        </el-table>
      </el-card>
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
  onActivated,
  onBeforeUnmount,
} from "vue";
import { useStore } from "../../store/index";
import { eventBus } from "../../store/eventBus";
import { pulldownApi } from "../../api/index";
import { ElTable, ElRadio, ElMessage, ElTooltip } from "element-plus";
import {
  getradiosInfo,
  movementInfo,
  menuItem,
  restNameApi,
  optionName,
  getOperationDataSetInfos,
  setOperationDataSetInfos
} from "../../api/jobApi";
interface Radio {
  label: string;
  value: string;
}
export default defineComponent({
  name: "SelectConductor",
  components: { ElRadio },
  props: ["selectedMovement", "activeName"],
  emits: ["changeMovement", "changeErrorHappend"],
  setup(props, { emit }) {
    //  progress
    const progress = ref(0);
    const total = ref(0);
    // event bus
    const bus = eventBus();
    //The correspondence between operation and conductor.
    const toGetConductorRelationship = async() => {
      let loginOperationId = store.getLoginOperationId;
      await getOperationDataSetInfos(loginOperationId).then((res: any) => {
        if (res.data.data.length != 0) {
          let parameters: any = res.data.data[0].parameter;
          store.setLoggedOperationDataSetInfos(parameters)
        }
      }).catch((error: any) => {
        ElMessage({
          type: "error",
          message: error,
        });
      });
      let loggedOperationDataSetInfos:any = store.getLoggedOperationDataSetInfos
      if (loggedOperationDataSetInfos.length != 0 && loginOperationId == loggedOperationDataSetInfos.Operation) {
        conductor.value = loggedOperationDataSetInfos.Conductor;
        radios.forEach((el: any) => {
          if (el.value == conductor.value) {
            store.setConductor(el.label);
          }
        });
        store.setConductorId(loggedOperationDataSetInfos.Conductor);
        getMovement(conductor.value);
      } else {
        conductor.value = "";
        store.setConductor("");
        store.setConductorId("");
      }

    };
    let frequency = ref(0);
    onActivated(() => {
      bus.on("changeLoginOperation", (a: any) => {
        // Check whether there is a relationship between the operation and the conductor in the localStorage

        toGetConductorRelationship();
      });
      frequency.value += 1;
      let host = store.getHost;
      let movement = store.getMovement;
      let loggedHost1 = store.getLoggedHost;
      let loggedMovement1 = store.getLoggedMovement;
    });

    onBeforeUnmount(() => {
      bus.off_all("changeLoginOperation");
    });
    let activeName:any = ref(props.activeName);
    const store = useStore();
    // get radios list
    const conductor = ref<string>("");

    let radios: any = reactive([]);
    let tableHeight = ref();
    // table loading
    const loadingShow = ref(false);
    let movementData: Array<any> = reactive([]);
    onMounted(() => {
      tableHeight.value = window.innerHeight - 400;
      window.onresize = () => {
        tableHeight.value = window.innerHeight - 400;
      };
    });
    watch(
      radios,
      (val, old) => {
        if (val.length != 0) {
          if (activeName.value == "1") {
          } else {
            // Check whether there is a relationship between the operation and the conductor in the localStorage
            toGetConductorRelationship();
          }
        }
      },
      { immediate: true }
    );
    let tableRef: any = ref(null);
    const toggleSelection = (rows?: any) => {
      if (rows) {
        rows.forEach((row: any) => {
          // TODO: improvement typing when refactor table
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment

          tableRef.value!.toggleRowSelection(row, true);
        });
      } else {
        tableRef.value!.clearSelection();
      }
    };
    let loggedMovement: any = reactive([]);
    let hostIsLoggedIn: any = reactive([]);
    let loggedoperationDataSetInfos : any = reactive([]);
    // Which movements the operation registers
    const getConductorAndMovementInfo = async () => {
      progress.value = 0;
      total.value = movementData.length;
      loggedMovement.length = 0;
      hostIsLoggedIn.length = 0;
      loggedoperationDataSetInfos.length = 0;
      toggleSelection();

      let loginOperation = store.getLoginOperation;
      loadingShow.value = true;
      let errormovement_name = "Movement";
      try {
        let infos: any = store.getLoggedOperationDataSetInfos
        if (infos.length!=0) {
          let conductor_infos: string = infos.Conductor;
          if (conductor_infos == store.getConductorId) {

            let movement_infos: string[] = infos.Movement.split(",");
            for (let i = 0; i < movementData.length; i++) {
              progress.value = i + 1;
              let el = movementData[i]
              errormovement_name = el.movement_name;
              if (movement_infos.includes(el.movement_id)) {
                loggedMovement.push(el)
              }
            }
          }
          let host_infos: string[] = infos.Host.split(",");
          for (let i = 0; i < host_infos.length; i++) {
            hostIsLoggedIn[i] = host_infos[i]
          }
        }
      } catch (error: any) {
        ElMessage({
          type: "error",
          dangerouslyUseHTMLString: true,
          message: "<p>選択されたMovementに紐づくパラメータシートが存在しません。</p><p>Movement：" + errormovement_name + "</p>",
        });
        emit("changeErrorHappend", true);
      }
      store.setLoggedMovement(loggedMovement);
      const uniqueValues = [...new Set(Object.values(hostIsLoggedIn))];
      store.setLoggedHost(uniqueValues);
      toggleSelection(loggedMovement);
    };

    function getRadios() {
      getradiosInfo().then((res: any) => {
        let data = res.data.data;
        data.forEach((element: any) => {
          let obj: Radio = {
            value: element.parameter.conductor_class_id,
            label: element.parameter.conductor_name,
          };

          radios.push(obj);
        });
      });
    }
    getRadios();
    // In the case of loading, change the conductor
    let isFetching = ref(false);
    let controller = new AbortController();
    const stopLoop = ref(false);
    const changeConductor = (val: any) => {
      // loading...

      if (loadingShow.value) {
        stopLoop.value = true;
        controller.abort();

        progress.value = 0;
        isFetching.value = false;
        controller = new AbortController();
      }
      radios.forEach((el: any) => {
        if (el.value == val) {
          store.setConductor(el.label);
          store.setConductorId(el.value);
        }
      });
      loadingShow.value = true;
      movementData.length = 0;
      progress.value = 0;
      total.value = 0;

      setTimeout(() => {
        stopLoop.value = false;
        progress.value = 0;
        total.value = 0;

        getMovement(val);
      }, 1500);
    };
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

    const getMovement = async (conductor: string) => {
      loadingShow.value = true;
      isFetching.value = true;
      try {
        let movementArray = await movementInfo(conductor);
        let data = movementArray.data.data;

        let movement = [];
        for (const key in data) {
          const element = data[key];
          if (Object.prototype.hasOwnProperty.call(element, "movement_id")) {
            let obj = { id: "", movement_id: "", movement_name: "" };
            obj.movement_id = element.movement_id;
            obj.movement_name = element.movement_name;
            obj.id = element.id;
            movement.push(obj);
          }
        }

        try {
          movementData.length = 0;
          // node1,node2...
          let keysSort: any = movement.sort(function (a: any, b: any) {
            return a.id.slice(5) - b.id.slice(5);
          });

          keysSort.forEach((el: any, index: any) => {
            movementData.push(el);
          });

          if (activeName.value == "2") {
            await getConductorAndMovementInfo();
            loadingShow.value = false;
          } else {
            loadingShow.value = false;
          }
        } catch (error) {}
      } catch (error) {}
    };
    // slected movement

    let selectedMovement: any = reactive([]);
    const selectionChange = (val: any) => {
      selectedMovement.length = 0;
      val.forEach((item: any) => {
        selectedMovement.push(item);
      });

      store.setMovement(selectedMovement);

      emit("changeMovement", selectedMovement);
    };

    const rowClass = ({ row }: any) => {
      if (selectedMovement.includes(row)) {
        return { color: "#0960bd" };
      }
    };
    const rowClick = (val: any) => {
      // Whether the line that is clicked is in the selected array
      let resultFlag = selectedMovement.findIndex((item: any) => {
        return item.movement_id == val.movement_id;
      });
      if (resultFlag == -1) {
        tableRef.value!.toggleRowSelection(val, true);
      } else {
        tableRef.value!.toggleRowSelection(val, false);
      }
    };
    return {
      radios,
      conductor,
      movementData,
      movementColumns,
      rowClass,
      changeConductor,
      selectionChange,
      tableHeight,
      loadingShow,
      tableRef,
      rowClick,
      progress,
      total,
      activeName,
    };
  },
});
</script>

<style scoped lang="less">
.progressBox {
  width: 100px;
  text-align: center;
  position: absolute;
  top: 30%;
  left: calc(50% - 50px);
  z-index: 2002;
}
.cardBoxL {
  width: 260px;
  max-height: 470px;
  /deep/.el-card__body {
    height: 90%;
  }
  overflow-y: auto;
  padding-bottom: 20px;
}

.cardBoxR {
  position: relative;
  flex: auto;
  margin-left: 20px;
  overflow: hidden;
  padding-bottom: 20px;
}

.el-radio-group {
  padding-bottom: 10px;
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
    width: 180px;
    height: 44.8px;
    margin-right: 30px;
  }

  .el-radio:hover {
    background-color: #f5f7fa;
  }
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

.steps-first {
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
