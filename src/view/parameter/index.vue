<template>
  <el-steps :active="active" align-center finish-status="success">
    <el-step title="参照対象種別選択">
      <template #description>
        <span v-show="active >= 1">
          <span class="desBracket">(</span>
          <span class="desText">{{ selectedTypeName }}</span>
          <span class="desBracket">)</span>
        </span>
      </template>
    </el-step>
    <el-step title="パラメータシート選択" />
    <el-step title="パラメータシート参照" />
  </el-steps>
  <div class="contentCenterBox">
    <keep-alive>
      <parameterSheetTypeSelect v-if="active==0" @setSelectType = "setSelectType">
    </parameterSheetTypeSelect>
    </keep-alive>
    <KeepAlive>
      <parameterSheetSelectView v-if="active==1" :selectType = "selType" :selectedMenuGroupType = "menu_group_type" :prev="isPrev" @selectedParamterInfos="setSelParamterInfos">
      </parameterSheetSelectView>
    </KeepAlive>
    <KeepAlive>
      <parameterSheetDetailView v-if="active==2" :selParamters="selParamInfos" :prev="isPrev2" @buttonDisabled="setButtondisabled">
      </parameterSheetDetailView>
    </KeepAlive>
  </div>
  <div class="steps-action">
    <div>
      <el-button :disabled = "prevDsabled" class="backBtn" v-if="active == 1 || active == 2" @click="prev">もどる</el-button>
      <el-button :disabled = "nextDsabled" class="nextBtn" v-if="active == 0 || active == 1" @click="next">つぎへ</el-button>
      <el-tooltip class="item" effect="light" content="選択した全部パラメータシートを階層型フォーマットのExcelに出力します" placement="top">
      <el-button :disabled = "nextDsabled" class="nextBtn" v-if="active == 2" @click="downloadAllSysFile">階層型Excel出力実行</el-button>
      </el-tooltip>
    </div>
  </div>
</template>
<script lang="ts">
import {
  ElSteps,
  ElStep,
  ElMessage,
} from "element-plus";
import { defineComponent, reactive, ref, watch } from "vue";
import parameterSheetTypeSelect from "./parameterSheetTypeSelect.vue";
import parameterSheetSelectView from "./parameterSheetSelect.vue";
import parameterSheetDetailView from "./detail.vue";
import { eventBus } from "../../store/eventBus";

export default defineComponent({
  name: "index",
  components: {ElSteps,ElStep,parameterSheetTypeSelect,parameterSheetSelectView,parameterSheetDetailView},
  setup() {
    const active: any = ref(0);
    const selType: any = ref('');
    const selectedTypeName: any = ref('');
    const selParamInfos: any = ref();
    const prevDsabled = ref(false);
    const nextDsabled = ref(false);
    const isPrev = ref(false);
    const isPrev2 = ref(false);
    // event bus
    const bus = eventBus();

    const next = () => {
      if (active.value == 0) {
        if (selType.value == '') {
          let message = "パラメータシート所属のメニューグループを選択してください。";
          if (menu_group_type.value != "1") {
            message = "パラメータシート所属のConductorを選択してください。";
          }
          ElMessage({
            type: "warning",
            message: message,
          });
          return;
        }
        isPrev.value = !isPrev.value
      }
      if (active.value == 1) {
        if (!selParamInfos.value || selParamInfos.value.length === 0) {
          ElMessage({
            type: "warning",
            message: "パラメータシートを選択してください。",
          });
          return;
        }
        isPrev2.value = !isPrev2.value
      }
      active.value++;
    }
    const prev = () => {
      active.value--;
    };
    const downloadAllSysFile = () => {
      bus.emit("downloadSysFile", true);
    }

    const setSelParamterInfos = (seledParamInfos: any) => {
      selParamInfos.value = seledParamInfos;
    };
    const setSelectType = (typeName: any, typeId: any, menu_type: any) => {
      menu_group_type.value = menu_type;
      selectedTypeName.value = typeName;
      selType.value = typeId;
    }
    const menu_group_type: any = ref("");

    const setButtondisabled = (isDisabled: any) => {
      nextDsabled.value = isDisabled;
      prevDsabled.value = isDisabled;
    }
    return { setButtondisabled,downloadAllSysFile,active,selType,prevDsabled,nextDsabled,next, prev,setSelParamterInfos,setSelectType,selectedTypeName,menu_group_type,isPrev,isPrev2,selParamInfos};
  }
});
</script>
<style scoped lang="less">
.contentCenterBox {
  height: calc(100% - 200px);
  overflow-y: scroll;
}
.desBracket {
  display: inline-block;
  width: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.desText {
  display: inline-block;
  max-width: 84%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/deep/.el-step__title.is-success {
  color: #ff5722 !important;
}
/deep/.el-step__head.is-success {
  color: #ff5722 !important;
  border-color: #ff5722 !important;
}
.el-step.is-center .el-step__description {
  padding-left: 0%;
  padding-right: 0%;
}
.el-step.is-horizontal {
  width: 50% !important;
  flex-basis: auto !important;
}
.steps-action {
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  position: absolute;
  right: 0;
  bottom: 0;
  justify-content: end;
  width: 100%;
  margin-top: 24px;
  margin-left: -10px;
  padding: 10px 0;
  background-color: #002060;
  z-index: 99;
  .cancelButton {
    margin-left: 20px;
  }

  .backBtn {
    padding: 0 20px;
    border-radius: 8px;
    background-color: #fff0f000;
    color: #fff;
    margin-right: 10px;

    &:hover {
      opacity: 0.8;
    }
  }

  .nextBtn {
    margin-right: 20px;
    padding: 0 50px;
    border-radius: 8px;
    color: #fff;
    background-color: #da6a38;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>