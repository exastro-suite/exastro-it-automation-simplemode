<template>
  <div class="steps-second">
    <div class="header-box">
      <p>対象ホスト／比較ジョブにチェックを入れて、[つぎへ]を押してください。</p>
      <div class="button-action">
        <el-button type="primary" class="refresh_btn" @click="handleRefresh" style="margin-top: 8px;"><el-icon
            size="16px">
            <Refresh />
          </el-icon>&nbsp;
          <span style="display: inline-block; margin-top: 2px">更新</span></el-button>
      </div>
    </div>
    <div class="main">
      <ComparSelectHost />
      <ComparSelectJob />
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
} from "vue";
import { debounce } from "../../utils/debounce";
import { Refresh } from "@element-plus/icons-vue";
import ComparSelectJob from "./comparSelectJob.vue";
import ComparSelectHost from "./comparSelectHost.vue";
import { eventBus } from "../../store/eventBus";
export default defineComponent({
  name: "CompSetting",
  components: {
    Refresh,
    ComparSelectJob,
    ComparSelectHost,
  },
  setup(props, { emit }) {
    const bus = eventBus();
    // refresh
    const handleRefresh = debounce(() => {
      bus.emit("ComparSettingRefresh");
    }, 500);
    return {
      handleRefresh
    }
  },
})
</script>
<style scoped lang="less">
.main {
  width: 100%;
  display: flex;
  justify-content: space-between;
  ;
}

.main>div {
  width: 49%;
}

.header-box {
  // width: 100%; 
  display: flex;
  justify-content: space-between;
  margin-top: 0px;
  margin-bottom: 0px;
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