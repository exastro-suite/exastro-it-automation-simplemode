<template>
  <p style="font-size:12px;float:right;margin-right: 10px;">v1.1</p>
  <div class="login">
    <div class="loginImage">
      <img src="../../assets/image/Exastro-logo.png" alt="logo" />
    </div>
    <el-card shadow="always">
      <h1>接続情報を入力してログイン</h1>
      <el-form ref="LoginForm" :model="form"  :rules="rules" >
        <el-form-item label="" prop="italink" >
          <el-input v-model="form.italink" placeholder="ITA リンク" />
        </el-form-item>
        <el-form-item label="" prop="account">
          <el-input v-model="form.account" placeholder="ユーザー" />
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input
            id=""
            :type="passwordFlag ? 'text' : 'password'"
            v-model="form.password"
            placeholder="パスワード"
          >
            <template #suffix>
              <el-icon
                v-if="passwordFlag"
                class="el-input__icon"
                @click="passwordFlag = !passwordFlag"
              >
                <View />
              </el-icon>
              <el-icon
                v-else
                class="el-input__icon"
                @click="passwordFlag = !passwordFlag"
              >
                <Hide />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="" prop="organization">
          <el-input v-model="form.organization" placeholder="オーガナイゼーション ID" />
        </el-form-item>
        <el-form-item label="" prop="workspace">
          <el-input v-model="form.workspace" placeholder="ワークスペース ID" />
        </el-form-item>

        <el-form-item label="">
          <el-button type="primary" @click="handleLogin(LoginForm)" :loading="loading"
            >ログイン</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
  <p class="copyRight">@ NEC Corporation 2024</p>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage } from "element-plus";
import type { FormInstance,FormRules } from "element-plus";
import { useStore } from "../../store/index";
import { View, Hide } from "@element-plus/icons-vue";
import { loginApi, menuApi } from "../../api/index";
import { setCookie } from "../../utils/cookie";

export default defineComponent({
  name: "Login",
  components: {
    ElButton,
    ElCard,
    View,
    Hide,
    ElForm,
    ElInput,
    ElFormItem,
  },
  setup() {
    // The registration screen is different from the ICO on the device list screen
    const IcoCreate = () => {
      const route = useRoute();
      if (route.path == "/login") {
        var link: any = document.querySelector('link[rel*="icon"]');
        link.href = "./static/favicon.ico";
      }
    };
    IcoCreate();
    // routing
    const router = useRouter();
    // storage
    const store = useStore();
    // Parameters required for login
    const LoginForm = ref<FormInstance>();
    const orgId = localStorage.getItem("organization");
    const workspaceId = localStorage.getItem("workspace");
    const italink = localStorage.getItem("italink");
    const account = localStorage.getItem("account");
    const form = reactive({
      account: account,
      password: null,
      organization: orgId,
      workspace: workspaceId,
      italink: italink,
    });
    const rules = reactive<FormRules>({
      italink: [{ required: true, message: "必須項目です", trigger: "blur" }],
      account: [{ required: true, message: "必須項目です", trigger: "blur" }],
      password: [{ required: true, message: "必須項目です", trigger: "blur" }],
      organization: [{ required: true, message: "必須項目です", trigger: "blur" }],
      workspace: [{ required: true, message: "必須項目です", trigger: "blur" }],
    });
    onMounted(() => {
      //Listen for events
      window.addEventListener("keydown", keyDown);
    });
    // Listen for the Enter key
    const keyDown = (e: any) => {
      if (e.keyCode == 13) {
        handleLogin(LoginForm.value);
      }
    };
    // Whether or not to hide the password
    const passwordFlag = ref(false);
    //  The loading flag of the login button
    const loading = ref(false);
    // The login button is pressed
    const handleLogin = async (formEl: FormInstance | undefined) => {
      if (!formEl) return;
      await formEl.validate(async (valid, fields) => {
        if (valid) {
          store.setOrganization(form.organization || "");
          store.setWorkspace(form.workspace || "");
          localStorage.setItem("organization", form.organization || "");
          localStorage.setItem("account", form.account || "");
          localStorage.setItem("italink", form.italink || "");
          localStorage.setItem("workspace", form.workspace || "");
          loading.value = true;
          try {
            let res = await loginApi({
              password: form.password,
              username: form.account,
              grant_type: "password",
              scope: "openid offline_access",
              client_id: "_" + form.organization + "-api",
            });
            const tokendata = res;
            if (tokendata) {
              const { access_token, refresh_token } = tokendata.data;
              store.setToken(access_token);
              store.setRefreshToken(refresh_token);
              localStorage.setItem("token", access_token);
              localStorage.setItem("refresh_token", refresh_token);

              // get menuList
              try {
                const menuList = await menuApi();
                localStorage.setItem(
                  "menuList",
                  JSON.stringify(menuList.data.data.menu_groups)
                );
                // go to devicelist
                router.push({
                  path: "/setting/devicelist",
                });
                let time = new Date().getTime();
                setCookie("lastClickTime", time.toString(), 60);
              } catch (error: any) {
                ElMessage({
                  type: "error",
                  message: error,
                });
              }
              loading.value = false;
            }
          } catch (error: any) {
            loading.value = false;
            ElMessage({
              type: "error",
              message: error,
            });
          }
        } else {
        }
      });
    };

    return { form, LoginForm, passwordFlag, loading, handleLogin,rules };
  },
});
</script>

<style scoped lang="less">
.login {
  width: 38%;
  text-align: center;
  margin: 0 auto;
  padding-top: 5%;

  .loginImage {
    img {
      width: 100%;
    }

    margin-bottom: 25px;
  }
}

h1 {
  font-size: 24px;
  font-weight: normal;
}

/deep/.el-form-item__content {
  margin-left: 0 !important;

  button {
    width: 100%;
    font-size: 16px;
    height: 40px;
  }
}

.copyRight {
  width: 200px;
  position: fixed;
  font-size: 14px;
  bottom: 0;
  left: calc(50% - 100px);
}

.el-button--primary {
  background-color: #0960bd;
  color: #fff;
  border-color: #0960bd;

  &:hover {
    opacity: 0.8;
  }
}
</style>
