<template>
  <el-dialog
    v-model="isvisible"
    :title="idNumber == '' ? '機器登録' : '編集'"
    @close="cancel"
    class="addDialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div style="min-width: 1170px; height: auto">
      <el-card>
        <span class="title_tab">共通</span>
        <el-form ref="formCommonRef" :model="formCommon" :inline="true" :rules="rules">
          <el-row>
            <el-col :span="6">
              <el-form-item
                class="label-box"
                label="項番"
                prop="managed_system_item_number"
              >
                <el-input
                  style="width: 164px"
                  v-model="formCommon.managed_system_item_number"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" class="selectBox1">
              <el-form-item label="HW機器種別" prop="hw_device_type">
                <el-select
                  v-model="formCommon.hw_device_type"
                  class="m-2"
                  placeholder=" "
                >
                  <el-option
                    v-for="item in hwDeviceType"
                    :rules="rules"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="ホスト名" prop="host_name" required class="label-box3">
                <el-input style="width: 164px" v-model="formCommon.host_name" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="DNSホスト名" prop="host_dns_name" class="label-box4">
                <el-input style="width: 164px" v-model="formCommon.host_dns_name" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="IPアドレス" prop="ip_address" class="label-box">
                <el-input style="width: 164px" v-model="formCommon.ip_address" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="備考" prop="remarks" class="label-box2">
                <el-input style="width: 164px" v-model="formCommon.remarks" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="最終更新日時"
                prop="last_update_date_time"
                class="label-box3"
              >
                <el-input
                  style="width: 164px"
                  v-model="formCommon.last_update_date_time"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item
                label="最終更新者"
                prop="last_updated_user"
                class="label-box4"
              >
                <el-input
                  style="width: 164px"
                  v-model="formCommon.last_updated_user"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <div class="center_box">
        <div class="box_div">
          <el-card>
            <span class="title_tab">認証情報</span>
            <el-form ref="formLoginRef" :model="formCommon" :inline="true">
              <el-row>
                <el-col :span="6">
                  <el-form-item
                    label="ユーザ"
                    prop="login_user"
                    class="login_user label-box"
                  >
                    <el-input style="width: 164px" v-model="formCommon.login_user" />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    label="パスワード"
                    prop="login_password"
                    class="password-box password-box1 label-box2"
                  >
                    <el-input
                      :type="passwordFlag ? 'text' : 'password'"
                      v-model="formCommon.login_password"
                    >
                      <template #suffix>
                        <el-icon
                          v-if="passwordFlag"
                          class="el-input__icon"
                          @click="passwordFlag = !passwordFlag"
                          ><View
                        /></el-icon>
                        <el-icon
                          v-else
                          class="el-input__icon"
                          @click="passwordFlag = !passwordFlag"
                          ><Hide
                        /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    label="ssh秘密鍵ファイル"
                    prop="ssh_private_key_file"
                    class="key_file label-box3"
                  >
                    <el-upload
                      ref="upload"
                      class="upload-demo"
                      action=""
                      :limit="1"
                      :on-change="handleChange"
                      :on-exceed="handleExceed"
                      :on-remove="handleRemove"
                      :auto-upload="false"
                    >
                      <template #trigger>
                        <el-button type="primary">{{
                          fileName ? fileName : "ファイルを選択"
                        }}</el-button>
                      </template>
                      <!-- ファイルを選択 -->
                    </el-upload>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    label="パスフレーズ"
                    prop="passphrase"
                    class="password-box label-box4"
                  >
                    <el-input
                      :type="passphraseFlag ? 'text' : 'password'"
                      v-model="formCommon.passphrase"
                    >
                      <template #suffix>
                        <el-icon
                          v-if="passphraseFlag"
                          class="el-input__icon"
                          @click="passphraseFlag = !passphraseFlag"
                          ><View
                        /></el-icon>
                        <el-icon
                          v-else
                          class="el-input__icon"
                          @click="passphraseFlag = !passphraseFlag"
                          ><Hide
                        /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>
      </div>
      <el-card>
        <span class="title_tab"> Ansible 利用情報</span>
        <el-form ref="formAnsibleRef" :model="formCommon" :inline="true">
          <el-row>
            <el-col :span="6">
              <el-form-item
                label="接続オプション"
                prop="connection_options"
                class="label-box"
              >
                <el-input style="width: 216px" v-model="formCommon.connection_options" />
              </el-form-item>
            </el-col>

            <el-col :span="18">
              <el-form-item
                label="追加オプション"
                prop="inventory_file_additional_option"
                class="additional"
              >
                <el-input type="textarea" spellcheck="false" v-model="formCommon.inventory_file_additional_option" :rows="3" style="width: 630px" :autosize="{ minRows: 1, maxRows: 3 }" :resize="'none'" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <div class="center_box">
        <el-card>
          <span class="title_tab">Ansible 利用情報（Legacy/Role利用情報）</span>
          <el-form ref="formAnsibleRef1" :model="formCommon" :inline="true">
            <el-row>
              <el-col :span="9" class="selectBox">
                <el-form-item
                  label="認証方式"
                  prop="authentication_method"
                  class="method_box label-box"
                >
                  <el-select
                    v-model="formCommon.authentication_method"
                    class="m-2"
                    placeholder=" "
                  >
                    <el-option
                      v-for="item in authenticationMethod"
                      :rules="rules"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  label="WinRM接続(証明書)"
                  prop="server_certificate"
                  class="certificate"
                >
                  <el-upload
                    ref="uploadServer"
                    class="upload-demo"
                    action=""
                    :limit="1"
                    :on-change="handleChangeServer"
                    :on-exceed="handleExceedServer"
                    :on-remove="handleRemoveServer"
                    :auto-upload="false"
                  >
                    <template #trigger>
                      <el-button type="primary">{{
                        fileNameServer ? fileNameServer : "ファイルを選択"
                      }}</el-button>
                    </template>
                  </el-upload>
                </el-form-item>
              </el-col>
              <el-col :span="7">
                <el-form-item label="WinRM接続(ポート)" prop="port_no" class="label-box4">
                  <el-input style="width: 164px" v-model="formCommon.port_no" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </div>
      <el-card>
        <span class="title_tab"
          >Ansible 利用情報（Ansible Automation Controller利用情報）</span
        >

        <el-form ref="formAnsibleRef2" :inline="true" :model="formCommon">
          <el-row>
            <el-col :span="6" class="selectBox">
              <el-form-item
                label="接続タイプ"
                prop="connection_type"
                required
                class="label-box"
              >
                <el-select
                  v-model="formCommon.connection_type"
                  class="m-2"
                  placeholder=" "
                >
                  <el-option
                    v-for="item in connectionType"
                    :rules="rules"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="18" class="selectBox">
              <el-form-item
                label="インスタンスグループ名"
                prop="instance_group_name"
                class="type-box"
              >
                <el-select
                  v-model="formCommon.instance_group_name"
                  class="m-2"
                  placeholder=" "
                >
                  <el-option
                    v-for="item in instanceGroupName"
                    :rules="rules"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">キャンセル</el-button>
        <el-button type="primary" @click="confirm">
          {{ idNumber == "" ? "登 録" : "保存" }}</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from "vue";
import {
  ElDialog,
  ElButton,
  ElForm,
  ElInput,
  ElFormItem,
  ElSelect,
  genFileId,
  ElMessage,
} from "element-plus";
import type {
  FormInstance,
  FormRules,
  UploadInstance,
  UploadProps,
  UploadRawFile,
} from "element-plus";

import { View, Hide } from "@element-plus/icons-vue";
import { pulldownApi, registerApi, deviceList, updateApi } from "../../../api/index";
import { useStore } from "../../../store/index";
import { FileToBase64 } from "../../../utils/fileToBase64";
export default defineComponent({
  name: "Dialog",
  components: { ElDialog, ElButton, ElForm, ElFormItem, View, Hide },
  props: ["visible", "id"],
  emits: ["change"],
  setup(props, { emit }) {
    const store = useStore();
    // passphrase    passwordFlag
    const passphraseFlag = ref(false);
    const passwordFlag = ref(false);
    const formLabelWidth = "140px";

    const formCommon = reactive({
      managed_system_item_number: null,
      hw_device_type: null,
      host_name: null,
      host_dns_name: null,
      ip_address: null,
      remarks: null,
      last_update_date_time: null,
      last_updated_user: null,
      login_user: null,
      login_password: null,
      ssh_private_key_file: null,
      passphrase: null,
      connection_options: null,
      inventory_file_additional_option: null,
      authentication_method: null,
      port_no: null,
      server_certificate: null,
      instance_group_name: null,
      connection_type: "machine",
    });
    const rules = reactive<FormRules>({
      host_name: [{ required: true, message: "必須項目です", trigger: "blur" }],
    });

    let restName = store.getRestName;
    // pullDown
    const hwDeviceType: any = ref([]);
    const authenticationMethod: any = ref([]);
    const connectionType: any = ref([]);
    const instanceGroupName: any = ref([]);
    function getPullDown() {
      pulldownApi(restName)
        .then((res: any) => {
          // NW,ST,SV
          for (const i in res.data.data.hw_device_type) {
            if (Object.prototype.hasOwnProperty.call(res.data.data.hw_device_type, i)) {
              const element = res.data.data.hw_device_type[i];
              let obj = {
                value: element,
                label: element,
              };
              hwDeviceType.value?.push(obj);
            }
          }
          hwDeviceType.value?.unshift({ value: "", label: "" });
          for (const i in res.data.data.authentication_method) {
            if (
              Object.prototype.hasOwnProperty.call(res.data.data.authentication_method, i)
            ) {
              const element = res.data.data.authentication_method[i];

              let obj = {
                value: element,
                label: element,
              };
              authenticationMethod.value?.push(obj);
            }
          }
          authenticationMethod.value?.unshift({ value: null, label: null });

          for (const i in res.data.data.connection_type) {
            if (Object.prototype.hasOwnProperty.call(res.data.data.connection_type, i)) {
              const element = res.data.data.connection_type[i];

              let obj = {
                value: element,
                label: element,
              };
              connectionType.value?.push(obj);
            }
          }

          // GROUP Name
          for (const i in res.data.data.instance_group_name) {
            if (
              Object.prototype.hasOwnProperty.call(res.data.data.instance_group_name, i)
            ) {
              const element = res.data.data.instance_group_name[i];

              let obj = {
                value: element,
                label: element,
              };
              instanceGroupName.value?.push(obj);
            }
          }
          instanceGroupName.value?.unshift({ value: null, label: null });
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    }
    getPullDown();

    const isvisible = ref(props.visible);
    const idNumber = ref(props.id);

    const getDetail = (id: string) => {
      deviceList(restName, id)
        .then((res: any) => {
          let params = res.data.data[0].parameter;
          formCommon.managed_system_item_number = params.managed_system_item_number;
          formCommon.hw_device_type = params.hw_device_type;
          formCommon.host_name = params.host_name;
          formCommon.host_dns_name = params.host_dns_name;
          formCommon.ip_address = params.ip_address;
          formCommon.login_user = params.login_user;
          formCommon.login_password = params.login_password;
          formCommon.remarks = params.remarks;
          formCommon.last_update_date_time = params.last_update_date_time;
          formCommon.last_updated_user = params.last_updated_user;
          formCommon.authentication_method = params.authentication_method;
          formCommon.port_no = params.port_no;
          formCommon.ssh_private_key_file = params.ssh_private_key_file;
          formCommon.connection_type = params.connection_type;
          formCommon.instance_group_name = params.instance_group_name;
          formCommon.connection_options = params.connection_options;
          formCommon.inventory_file_additional_option =
            params.inventory_file_additional_option;
          formCommon.passphrase = params.passphrase;
          formCommon.server_certificate = params.server_certificate;
          fileNameServer.value = params.server_certificate;
          fileName.value = params.ssh_private_key_file;
        })
        .catch((error: any) => {
          ElMessage({
            type: "error",
            message: error,
          });
        });
    };
    watch(props, (val, old) => {
      isvisible.value = val.visible;

      if (val.id) {
        idNumber.value = val.id;
        getDetail(idNumber.value);
      } else {
        idNumber.value = "";
      }
    });

    watch(isvisible, (val, old) => {
      emit("change", isvisible.value);
    });
    watch(idNumber, (val: any, old) => {
      if (val) {
      } else {
        resetAll();
      }
    });
    const activeName = ref("common");
    const cancel = () => {
      isvisible.value = false;
      resetAll();
    };
    // upLoad
    let fileName = ref("");
    let fileNameServer = ref("");
    let ssh_private_key_file = ref("");
    let server_certificate = ref("");
    const upload = ref<UploadInstance>();
    const uploadServer = ref<UploadInstance>();
    // ssh秘密鍵ファイル
    const handleChange: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
      fileName.value = uploadFile.name;
      FileToBase64(uploadFile.raw).then((res: any) => {
        ssh_private_key_file.value = res.substring(res.indexOf(",") + 1);
      });
    };
    // WinRM接続(サーバー証明書)
    const handleChangeServer: UploadProps["onChange"] = (uploadFile, uploadFiles) => {
      fileNameServer.value = uploadFile.name;
      FileToBase64(uploadFile.raw).then((res: any) => {
        server_certificate.value = res.substring(res.indexOf(",") + 1);
      });
    };

    //ssh秘密鍵ファイル
    const handleExceed: UploadProps["onExceed"] = (files) => {
      upload.value!.clearFiles();
      const file = files[0] as UploadRawFile;
      file.uid = genFileId();
      upload.value!.handleStart(file);
    };
    // WinRM接続(サーバー証明書)
    const handleExceedServer: UploadProps["onExceed"] = (files) => {
      uploadServer.value!.clearFiles();
      const file = files[0] as UploadRawFile;
      file.uid = genFileId();
      uploadServer.value!.handleStart(file);
    };
    //ssh秘密鍵ファイル
    const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
      fileName.value = "";
    };
    // WinRM接続(サーバー証明書)
    const handleRemoveServer: UploadProps["onRemove"] = (file, uploadFiles) => {
      fileNameServer.value = "";
    };
    const formCommonRef = ref();
    const formLoginRef = ref();
    const formSshRef = ref();
    const formAnsibleRef = ref();
    const formAnsibleRef1 = ref();
    const formAnsibleRef2 = ref();
    // reset form
    const resetForm = (formEl: FormInstance | undefined) => {
      if (!formEl) return;
      formEl.resetFields();
    };
    // function reset
    const resetAll = () => {
      resetForm(formCommonRef.value);
      resetForm(formLoginRef.value);
      resetForm(formSshRef.value);
      resetForm(formAnsibleRef.value);
      resetForm(formAnsibleRef1.value);
      resetForm(formAnsibleRef2.value);
      upload.value!.clearFiles();
      uploadServer.value!.clearFiles();
      fileName.value = "";
      fileNameServer.value = "";
    };

    const formData = (type: string) => {
      let params: any = {
        file: {},
        parameter: {
          discard: "0",
          managed_system_item_number: formCommon.managed_system_item_number
            ? formCommon.managed_system_item_number
            : null,
          hw_device_type: formCommon.hw_device_type ? formCommon.hw_device_type : null,
          host_name: formCommon.host_name,
          host_dns_name: formCommon.host_dns_name,
          ip_address: formCommon.ip_address,
          login_user: formCommon.login_user,
          authentication_method: formCommon.authentication_method
            ? formCommon.authentication_method
            : null,
          port_no: formCommon.port_no ? formCommon.port_no : null,

          connection_options: formCommon.connection_options,
          inventory_file_additional_option: formCommon.inventory_file_additional_option,
          instance_group_name: formCommon.instance_group_name
            ? formCommon.instance_group_name
            : null,
          connection_type: formCommon.connection_type,
          remarks: formCommon.remarks,
          last_update_date_time: formCommon.last_update_date_time,
          last_updated_user: formCommon.last_updated_user,
        },
        type: type,
      };
      if (fileName.value) {
        params.parameter["ssh_private_key_file"] = fileName.value;
        params.file["ssh_private_key_file"] = ssh_private_key_file.value;
      }
      if (fileNameServer.value) {
        params.parameter["server_certificate"] = fileNameServer.value;
        params.file["server_certificate"] = server_certificate.value;
      }
      if (formCommon.login_password) {
        params.parameter["login_password"] = formCommon.login_password;
      }
      if (formCommon.passphrase) {
        params.parameter["passphrase"] = formCommon.passphrase;
      }
      if (type == "Register") {
        registerApi(restName, params)
          .then(() => {
            isvisible.value = false;
            // reset
            resetAll();
          })
          .catch((error: any) => {
            ElMessage({
              type: "error",
              message: error,
            });
          });
      } else if (type == "Update") {
        updateApi(restName, params, idNumber.value)
          .then(() => {
            isvisible.value = false;
            // reset
            resetAll();
          })
          .catch((error: any) => {
            ElMessage({
              type: "error",
              message: error,
            });
          });
      }
    };
    const confirm = () => {
      // common form validate
      formCommonRef.value
        .validate()
        .then(() => {
          // ansible form validate
          formAnsibleRef.value
            .validate()
            .then(() => {
              // sent request
              if (idNumber.value) {
                formData("Update");
              } else {
                formData("Register");
              }
            })
            .catch(() => {});
        })
        .catch(() => {});
    };

    return {
      idNumber,
      passphraseFlag,
      passwordFlag,
      formLabelWidth,
      rules,
      upload,
      uploadServer,
      cancel,
      hwDeviceType,
      authenticationMethod,
      instanceGroupName,
      connectionType,
      confirm,
      handleExceed,
      handleRemove,
      handleChange,
      handleExceedServer,
      handleRemoveServer,
      handleChangeServer,
      formCommon,
      formCommonRef,
      formLoginRef,
      formSshRef,
      formAnsibleRef,
      formAnsibleRef1,
      formAnsibleRef2,
      isvisible,
      activeName,
      resetForm,
      fileName,
      fileNameServer,
    };
  },
});
</script>

<style scoped lang="less">
.upload-demo .el-button--primary {
  width: 164px;
}
.title_tab {
  font-size: 16px;
  color: #0960bd;
  display: inline-block;
  margin-bottom: 10px;
}

.center_box {
  display: flex;
  margin: 7px 0;
  justify-content: space-between;
  div {
    flex: 1;
  }
}
</style>
<style lang="less">
.upload-demo {
  .el-button > span {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.el-dialog__body {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  overflow-x: scroll;
  height: auto;
  overflow-y: hidden;
}
.el-dialog__footer,
.el-form-item__content .el-upload {
  .el-button--primary {
    background-color: #0960bd;
    color: #fff;
    border-color: #0960bd;
  }
  .el-button--primary:hover,
  .el-button--primary:active,
  .el-button--primary:focus {
    background-color: #0960bd !important;
    color: #fff;
    border-color: #0960bd;
  }
  .el-button--primary:hover {
    opacity: 0.8;
  }
}
.el-tabs__nav-wrap::after {
  height: 1px !important;
}
.el-tabs__active-bar {
  background-color: #0960bd;
}

.el-tabs__item.is-active,
.el-tabs__item:hover {
  color: #0960bd !important;
}

.addDialog {
  --el-dialog-width: 95%;
  --el-dialog-margin-top: 5vh;
  .dialog-footer {
    button {
      margin-right: 10px;
    }
  }
}
.el-form--inline .el-form-item {
  margin-right: 0 !important;
}
.el-dialog__header {
  padding: 8px 20px;
}
.el-dialog__headerbtn {
  top: -4px;
}
.el-card__body {
  padding: 15px 20px 4px 20px;
}
.label-box {
  .el-form-item__label {
    min-width: 93px;
  }
  .el-form-item__content {
    margin-right: 10px;
  }
}
.label-box2 {
  .el-form-item__label {
    min-width: 83px;
  }
}
.label-box3 {
  .el-form-item__label {
    min-width: 125px;
  }
}
.label-box4 {
  .el-form-item__label {
    min-width: 126px;
  }
  //
}
.additional {
  .el-form-item__label {
    margin-left: 16.3vw;
  }
}
.certificate {
  .el-form-item__content {
    margin-right: 10px;
  }
  .el-form-item__label {
    margin-left: 3.3vw;
  }
}
.type-box {
  .el-form-item__label {
    margin-left: 12.9vw;
  }
}

.password-box {
  .el-input {
    width: 164px;
  }
  .el-input__wrapper {
    width: 164px;
  }
}
.additional {
  .el-input {
    width: 630px;
  }
  .el-input__wrapper {
    width: 100%;
  }
}
.selectBox {
  .el-select .el-input {
    width: 225px !important;
  }
}
.selectBox1 {
  .el-select .el-input {
    width: 164px !important;
  }
}

.password-box1 {
  .el-form-item__content {
    margin-right: 10px;
  }
}
.el-form-item__label {
  padding: 0 4px 0 0;
}
</style>
