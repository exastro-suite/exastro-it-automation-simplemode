<template>
  <el-card class="box-card">
    <router-view v-slot="{ Component }">
      <transition>
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </el-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ElCard } from "element-plus";

export default defineComponent({
  name: "Content",
  components: {},
  setup() {
    return {};
  },
});
</script>

<style scoped lang="less">
.box-card {
  height: 100%;
  /deep/.el-card__body {
    height: 100%;
  }
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
</style>
