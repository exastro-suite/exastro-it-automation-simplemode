<template>
  <el-steps :active="active" align-center finish-status="success">
    <el-step title="比較対象選択" />
    <el-step title="比較実行" />
    <el-tooltip effect="light" placement="bottom">
      <el-icon size="16" color="#002B62" style="cursor: pointer">
        <QuestionFilled />
      </el-icon>
      <template #content>
        比較実行操作説明
        <br />・比較実行画面ではウィザードに従い登録されているパラメータを比較できます。
        <br />・「比較対象選択」フェーズでは対象ホスト／比較ジョブを指定します。
        <br />・「比較実行」フェーズでは、オペレーション（基準日時）をダブルクリックして比較するオペレーションを指定します。ダウンロードボタンを押すと、条件に基づき比較とダウンロードを実行します。
        <br />・選択されたオペレーションの実施予定日時／最終実行日時は、実際の日時よりも１秒多い日時が表示されます。（Exastro ITAの比較機能仕様によるものです。）
        <br />・比較実行ウィザードの実行には、各パラメータシートの比較設定をExastro IT Automationに事前に登録しておく必要があります。
      </template>
    </el-tooltip>
  </el-steps>
  <div></div>
  <div class="contentCenterBox">
    <keep-alive>
      <ComparSetting v-if='active==0' />
    </keep-alive>
      <ComparExecute v-if='active==1' />
  </div>
  <div class="steps-action">
    <div>
      <el-button :disabled = "prevDsabled" class="backBtn" v-if="active == 1" @click="prev">もどる</el-button>
      <el-button :disabled = "nextDsabled" class="nextBtn" v-if="active == 0" @click="next">つぎへ</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue";
import { defineComponent, ref,onBeforeUnmount} from "vue";
import {
  ElSteps,
  ElStep,
  ElButton,
  ElMessage,
  ElCollapse,
  ElCarouselItem,
} from "element-plus";
import { useStore } from "../../store/index";
import ComparSetting from "./comparSetting.vue";
import ComparExecute from "./comparExecute.vue";
import { eventBus } from "../../store/eventBus";

export default defineComponent({
  name: "ComparJob",
  components: {
    ElSteps,
    ElStep,
    ElButton,
    ComparSetting,
    ComparExecute,
    QuestionFilled,
    ElCollapse,
    ElCarouselItem,
  },
  setup() {
    const store = useStore();
    const groupName = ref<string>("");
    const menuList = JSON.parse(localStorage.getItem("menuList") || "");
    let result = menuList.filter((el: any) => el.id == "701");
    groupName.value = result[0].menus.filter(
      (el: any) => el.id == "70101"
    )[0].menu_name_rest;
    store.setGroupName(groupName.value);
    const active: any = ref(0);
    const bus = eventBus();
    const prevDsabled = ref(false);
    const nextDsabled = ref(false);
    // Previous step
    const prev = () => {
      active.value = 0;
    };
    const next = async () => {
      if (active.value == 0) {
        let loggedHostList = store.getLoggedComparHost;
        let loggedComparJobs = store.getLoggedComparJob;
        if (loggedHostList.length === 0 || loggedComparJobs.length === 0) {
          ElMessage({
            type: "warning",
            message: "対象ホスト／比較ジョブを選択してください。",
          });
        } else {
          active.value++;
        }
      }
    };
    bus.on("downloadStart", (isDownload: any) => {
      if (isDownload) {
        prevDsabled.value = true;
      } else {
        prevDsabled.value = false;
      }
    });
    onBeforeUnmount(() => {
      bus.off_all("downloadStart");
    });
    return {
      active,
      prev,
      next,
      prevDsabled,
      nextDsabled
    }
  }
})
</script>

<style scoped lang="less">
/deep/.el-step__title.is-success {
  color: #ff5722 !important;
}
/deep/.el-step__head.is-success {
  color: #ff5722 !important;
  border-color: #ff5722 !important;
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

.lastStep {
  width: 100%;
  margin: 11% auto;
}
.contentCenterBox {
  height: calc(100% - 200px);
  overflow-y:auto
}
.el-step.is-center .el-step__description {
  padding-left: 0%;
  padding-right: 0%;
}
.el-step.is-horizontal {
  width: 50% !important;
  flex-basis: auto !important;
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

