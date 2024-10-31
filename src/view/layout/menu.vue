<template>
  <el-menu
    :default-active="route.path"
    router
    :collapse="isCollapse"
    active-text-color="#ffd04b"
    background-color="#0c2135"
    text-color="rgba(255, 255, 255, 0.7)"
  >
    <el-menu-item v-show="!isCollapse">
      <template #title>
        <div class="logoImage">
          <img src="../../assets/image/Exastro-ITA-logotype2-white-rgb.png" alt="logo" />
        </div>
      </template>
    </el-menu-item>
    <el-menu-item v-show="isCollapse">
      <el-icon class="closeIcon">
        <template #default style="width: 64px"
          ><img
            style="width: 120%"
            src="../../assets/image/Exastro-logomark2-white-rgb.png"
            alt="" /></template
      ></el-icon>
    </el-menu-item>
    <el-menu-item index="/job">
      <el-icon><Tools /></el-icon>
      <template #title>ジョブ実行</template>
    </el-menu-item>

    <el-sub-menu index="/setting">
      <template #title>
        <el-icon>
          <setting />
        </el-icon>
        <span>設定</span>
      </template>
      <el-menu-item index="/setting/devicelist"
        ><el-icon> <Operation /> </el-icon>機器一覧</el-menu-item
      >
      <el-menu-item index="/setting/joblist"
        ><el-icon> <Operation /> </el-icon>ジョブ一覧</el-menu-item
      >
    </el-sub-menu>

    <el-menu-item index="/confirm">
      <el-icon>
        <Grid />
      </el-icon>
      <template #title>実行状況確認</template>
    </el-menu-item>
    <el-menu-item index="/parameter">
      <el-icon>
        <document />
      </el-icon>
      <template #title>パラメータシート</template>
    </el-menu-item>
    <el-menu-item index="/comparison">
      <el-icon>
        <Switch />
      </el-icon>
      <template #title>比較実行</template>
    </el-menu-item>
    <el-menu-item index="/link">
      <el-icon>
        <Link />
      </el-icon>
      <template #title>ITA Link</template>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import {
  Document,
  Menu as IconMenu,
  Grid,
  Link,
  Setting,
  Operation,
  Tools,
  Switch,
} from "@element-plus/icons-vue";
export default defineComponent({
  name: "Mymenu",
  components: { Document, IconMenu, Setting, Grid, Link, Operation, Tools,Switch },
  props: ["isCollapse"],
  setup() {
    const route = useRoute();
    return { route };
  },
});
</script>

<style scoped lang="less">
.el-menu-item.is-active {
  color: #fff;
  background-color: #0960bd;
}

.el-menu-item:hover {
  color: #fff;
}

.el-menu {
  border-right: none !important;
}

.logoImage {
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 163px;

  img:nth-child(1) {
    width: 110%;
  }
}
</style>
