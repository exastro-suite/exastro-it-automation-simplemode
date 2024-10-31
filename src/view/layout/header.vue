<template>
  <el-row class="header">
    <el-col :span="1">
      <div class="expand_btn">
        <el-icon v-if="isCollapse" @click="change">
          <Expand />
        </el-icon>
        <el-icon v-else @click="change">
          <Fold />
        </el-icon>
      </div>
    </el-col>
    <el-col :span="3">
      <div class="bread">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="item in routers"
            :key="item.path"
            :to="{ path: item?.path }"
            >{{ item?.meta?.title }}</el-breadcrumb-item
          >
        </el-breadcrumb>
      </div>
    </el-col>
    <el-col :span="14" :offset="1" style="text-align: right">
      <div class="org">{{ org }}（{{ workspace }}）</div>
    </el-col>
    <el-col :span="3">
      <div class="login_out">
        <el-popover
          :width="160"
          trigger="hover"
          popper-style="padding: 0 0 0 20px !important;"
        >
          <template #reference>
            <div class="account" style="cursor: pointer">
              <el-icon> <User /> </el-icon>&nbsp;<span>{{ account }}</span>
            </div>
          </template>
          <p class="out_text" @click="loginOut" style="cursor: pointer">
            <el-icon> <SwitchButton style="width: 1em; height: 1em" /> </el-icon
            ><span class="out_txt">&nbsp;ログアウト</span>
          </p>
        </el-popover>
      </div>
    </el-col>
  </el-row>

  <div class="divider"></div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { userApi } from "../../api/index";
import { ElBreadcrumb, ElBreadcrumbItem, ElPopover, ElMessage } from "element-plus";
import { Expand, Fold, User, SwitchButton } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { deleteCookie } from "../../utils/cookie";
import { useStore } from "../../store/index";

export default defineComponent({
  name: "Header",
  components: {
    Expand,
    Fold,
    User,
    SwitchButton,
    ElBreadcrumb,
    ElBreadcrumbItem,
    ElPopover,
  },
  props: ["isCollapse"],
  emits: ["change"],
  setup(props, { emit }) {
    // storage
    const store = useStore();
    const org = localStorage.getItem("organization");
    const workspace = localStorage.getItem("workspace");
    const account = localStorage.getItem("account");
    const userName = ref("");
    // First and last name
    const getUserName = () => {
      userApi()
        .then((res: any) => {
          userName.value = res.data.data.user_name;
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    getUserName();
    // router
    const router = useRouter();
    const routers = computed(() => {
      return router.currentRoute.value.matched.filter((item) => item.meta.title);
    });
    // Expand or close the menu
    function change() {
      emit("change");
    }

    const loginOut = () => {
      localStorage.setItem("token", "");
      deleteCookie("lastClickTime");
      store.$reset();
      router.push({
        path: "/login",
      });
    };
    return {
      change,
      routers,
      loginOut,
      org,
      workspace,
      account,
      userName,
    };
  },
});
</script>

<style scoped lang="less">
.header {
  display: flex;
  height: 48px;
  width: 100%;
  align-items: center;
  justify-content: space-between;

  .el-icon {
    font-size: 20px;
    color: #212121;
  }

  .expand_btn {
    margin: 0 10px;
    cursor: pointer;
  }

  .bread {
    width: 200px;
    margin-left: -20px;
  }

  .org {
    font-size: 14px;
  }
}
.login_out {
  text-align: right;
  margin-right: 20px;
}
.out_text {
  font-size: 14px;
  margin: 9px 0;

  .el-icon {
    font-size: 18px;
    vertical-align: middle;
  }

  .out_txt {
    display: inline-block;
    margin-left: 6px;
  }
}

.divider {
  width: 100%;
  height: 6px;
  background-color: #f7f7f7;
}

.el-button--primary {
  background-color: #0960bd;
  color: #fff;
  border-color: #0960bd;
}
</style>
<style lang="less">
.el-overlay-message-box {
  z-index: 99 !important;
  background-color: #0000006e;

  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;
  }

  .el-button:nth-child(2) {
    &:hover {
      opacity: 0.8;
    }

    &:hover,
    &:active,
    &:focus {
      background-color: #0960bd !important;
      color: #fff;
      border-color: #0960bd;
    }
  }
}
.account {
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  justify-content: end;
  cursor: pointer;
  span {
    display: inline-block;
    margin-top: 2px;
  }
}
</style>
