<template>
  <div class="w_main">
  <el-dialog v-model="isvisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" @close="cancel" 
  align-center style="background-color: #e1f3f6;" class="wd">
  <header style="text-align: center;font-size: 26px; font-weight: bold;margin-top: 15px;overflow:hidden">Exastro
    IT Automation SimpleMode へようこそ</header>
    <div>
     <el-container >
        <el-main style="font-size: 17px;margin-top: 15px;padding:0;overflow:hidden">Exastro IT Automation
          SimpleModeでは、実機から収集したパラメータを編集して自動構築ができます。<br>
          以下のチュートリアルに沿って最初の自動構築を始めてみましょう。</el-main>
      </el-container>
      <el-container style="margin-top: 30px;">
        <el-aside width="60px" style="text-align: left;font-size: 14px;overflow:hidden;margin-left: 25px;">STEP1<br>機器登録</el-aside>
        <el-main width="700px"
          style="text-align: left;font-size: 14px;padding:0;margin-left: 50px;margin-right: 20px;overflow:hidden">機器一覧に登録されているデフォルトの機器<span
            style="color: red;">「--------」</span>を編集します。<br>ホスト名、IPアドレス、ユーザー名、パスワード等を構築対象マシンの情報に変更して保存してください。</el-main>
      </el-container>
      <el-container style="margin-top: 30px;">
        <el-aside  width="60px" style="text-align: left;font-size: 14px;overflow:hidden;margin-left: 25px;">STEP2<br>収集実行</el-aside>
        <el-main width="700px"
          style="text-align: left;font-size: 14px;padding:0px;margin-left: 50px;margin-right: 20px;overflow:hidden">メニューから[ジョブ実行]を選択します。<span
          style="color: red;">「既存のオペレーションを再開する」</span>から<span
            style="color: red;">「&lt;OS名&gt;-gather-default」</span>を選択します。設定を変えずにウィザードを進めてジョブを実行してください。これらのデフォルトの機器・オペレーションを使うと、収集のためのパラメータ入力を省略して収集を開始することができます。</el-main>
      </el-container>
      <el-container style="margin-top: 30px;">
        <el-aside  width="60px" style="text-align: left;font-size: 14px;overflow:hidden;margin-left: 25px;">STEP3<br>構築開始</el-aside>
        <el-main width="700px"
          style="text-align: left;font-size: 14px;padding:0px;margin-left: 50px;margin-right: 20px;overflow:hidden">STEP2の収集結果を流用して構築することができます。<br>
          メニューから[ジョブ実行]を選択して<span
          style="color: red;">「オペレーションを新規登録する」</span>を選択し、任意の名称を入力してウィザードを進めます。ジョブ選択ではConductor<span
          style="color: red;">[&lt;OS名&gt;-build]</span>を選択し、実行したいMovement（ジョブ）にチェックを入れてウィザードを進めます。<span
          style="color: red;">対象ホストはSTEP2と同じもの</span>を選びます。
        </el-main>
      </el-container>
      <el-container style="margin-top: 30px;">
        <el-aside width="60px" style="text-align: left;font-size: 14px;overflow:hidden;margin-left: 25px;">STEP4<br>構築実行</el-aside>
        <el-main width="700px" style="text-align: left;font-size: 14px;padding:0px;margin-left: 50px;margin-right: 20px;overflow:hidden">
          [パラメータ登録]画面でコピー元として<span
          style="color: red;">「収集結果」</span>を選び、<span style="color: red;">「&lt;OS名&gt;-gather-default」</span>を選んで一括コピーボタンを押します。パラメータの編集、変更を行い、ウィザードを進めてジョブを実行してください。
        </el-main>
      </el-container>
      <el-container style="margin-top: 30px;">

        <el-main style="text-align: left;font-size: 14px;padding:0px;flex:none;overflow:hidden"><el-checkbox
            size="large" @change="checkboxChange"></el-checkbox></el-main>
        <el-main style="text-align: left;font-size: 14px;padding:13px 0px 0px 0px;overflow:hidden">
          &nbsp;&nbsp;以降、この画面を表示しない。（再度表示させるにはブラウザのCookieを削除してください）
        </el-main>
        <div style="text-align: center;font-size: 14px;;padding:0px;padding:5px 0px 0px 0px"><el-button class="footerBtn3"
            type="primary" @click="cancel">閉じる</el-button></div>

      </el-container>
    </div>
  </el-dialog>
</div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive, watch } from "vue";
import {
  ElDialog,
  ElButton,
  ElCheckbox
} from "element-plus";
import { getCookie, setCookieForWelcomePage } from "../../../utils/cookie";
import { useStore } from "../../../store/index";
export default defineComponent({
  name: "WelcomeDialog",
  components: { ElDialog, ElButton },
  setup(props, { emit }) {
    const store = useStore();
    const isvisible = ref(store.getWelcomeDialogShow);
    const isSelect = ref(false);
    const cancel = () => {
      if (isSelect.value) {
        setCookieForWelcomePage("welcome", '1');
      }
      isvisible.value = false;
    };
    const checkboxChange = (select: boolean) => {
      isSelect.value = select;
    }
    return {
      isvisible,
      cancel,
      checkboxChange
    }
  }
})
</script>
<style scoped lang="less">
.footerBtn3 {
  padding: 0 20px;
  border-radius: 8px;
  background-color: #e1f3f6 !important;
  color: #7f7f7f !important;
  border-color: #bdbdbd !important;

  &:hover {
    border-color: #bdbdbd !important;
    background-color: #e1f3f6 !important;
    opacity: 0.8;
    color: #7f7f7f !important;
  }

  &:active,
  &:focus {
    border-color: #bdbdbd !important;
    background-color: #e1f3f6 !important;
  }
}


</style>
<style lang="less">
.wd .el-dialog__body {
    overflow-x: hidden !important;
}
.w_main .el-dialog {
  --el-dialog-width: 60% !important;
}
</style>

