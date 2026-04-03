<script setup lang="ts">
import { useStore } from "./store/index";
import router from "./router";
import { ref, onMounted, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { setCookie, getCookie, deleteCookie } from "./utils/cookie";
const store = useStore();
// Listen for click events globally
window.addEventListener(
  "click",
  () => {
    let lastClickTime = new Date().getTime();
    // sessionStorage.setItem("lastClickTime", lastClickTime.toString());
    // 60min
    setCookie("lastClickTime", lastClickTime.toString(), 60);
  },
  true
);
let timer: any = ref(null);
const isTimeOut = () => {
  timer.value = setInterval(() => {
    // let lastClickTime: string = sessionStorage.getItem("lastClickTime") || "";
    let lastClickTime: string = getCookie("lastClickTime") || "";

    let nowTime = new Date().getTime();
    if (lastClickTime) {
      if (nowTime - parseInt(lastClickTime) > 1000 * 60 * 60) {
        if (localStorage.getItem("token")) {
          ElMessage({
            type: "error",
            message: "ログインがタイムアウトしました。",
          });
          localStorage.setItem("token", "");
          clearInterval(timer);
          store.$reset();
          router.push({
            path: "/login",
          });
          deleteCookie("lastClickTime");
        }
      }
    } else {
      clearInterval(timer);
      store.$reset();
      router.push({
        path: "/login",
      });
    }
  }, 1000);
};
onMounted(() => {
  isTimeOut();
});
onUnmounted(() => {
  clearInterval(timer);
  window.removeEventListener("click", () => {}, true);
});
</script>

<template>
  <div style="height: 100%">
    <router-view></router-view>
  </div>
</template>

<style scoped lang="less">
// table header background
/deep/.el-table thead tr th {
  background-color: #bdbdbd !important;
  color: #000;
  font-weight: normal;
}
</style>

<style lang="less">
.el-table .ascending .sort-caret.ascending {
    border-bottom-color: #0960bd!important;
}

.el-table .descending .sort-caret.descending {
    border-top-color: #0960bd!important;
}
.el-table .sort-caret.ascending {
    border-bottom-color: #7F7F7F!important;
}
.el-table .sort-caret.descending {
    border-top-color: #7F7F7F!important;
    bottom: -3px;
}

.el-message-box__status {
    font-size: 24px !important;
}

.el-dialog__footer {
 padding: var(--el-dialog-padding-primary) !important;
 padding-top: 10px !important;
}

.el-dialog {
  padding :0px !important;
}

.el-dialog {
  --el-dialog-padding-primary: 20px !important;
}

.el-dialog__body {
  padding: var(--el-dialog-padding-primary) !important;
}

.el-message-box {
  --el-messagebox-padding-primary: 15px !important;
}

.el-message-box__container {
  padding-right: 20px !important;
}

.el-dialog__header {
  padding: 20px 20px !important;
}
</style>