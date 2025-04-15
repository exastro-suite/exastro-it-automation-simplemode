<template>
  <div class="layout_box">
    <div class="menu">
      <Mymenu :isCollapse="isCollapse"></Mymenu>
    </div>
    <div class="content">
      <headerVue :isCollapse="isCollapse" @change="change"></headerVue>
      <Content></Content>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Mymenu from "./menu.vue";
import headerVue from "./header.vue";
import Content from "./content.vue";
export default defineComponent({
  name: "Layout",
  components: {
    Mymenu,
    Content,
    headerVue,
  },
  setup() {
    const isCollapse = ref(false);
    const change = () => {
      isCollapse.value = !isCollapse.value;
    };
    return { isCollapse, change };
  },
});
</script>

<style scoped lang="less">
.layout_box {
  width: 100%;
  display: flex;
  height: 100%;
  .menu {
    max-width: 172px;
    background-color: #0c2135;
  }
  .content {
    overflow: hidden;
    flex: auto;
    width: 100%;
    position: relative;
  }
}
</style>
