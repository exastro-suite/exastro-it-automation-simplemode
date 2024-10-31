<template>
  <div class="link">
    <p>Exastro IT Automationの画面を開きます。</p>

    <p>
      シンプルモードで使用するジョブやパラメータシートの詳細を確認することができます。
    </p>
    <a :href="url" target="_blank">
      <el-button type="primary"
        ><el-icon>
          <Link /> </el-icon
        >&nbsp; Link to ITA</el-button
      ></a
    >
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElButton } from "element-plus";
import { Link } from "@element-plus/icons-vue";

export default defineComponent({
  name: "LinkVue",
  components: { ElButton, Link },
  setup() {
    const org = localStorage.getItem("organization");
    const work = localStorage.getItem("workspace");
    const link = localStorage.getItem("italink");
    const url = `${link}/${org}/workspaces/${work}/ita/`;

    return {
      url,
    };
  },
});
</script>

<style scoped lang="less">
.link {
  p {
    color: #7f7f7f;
    font-size: 16px;
    margin-top: 16px;
  }

  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;
  }
}
</style>
