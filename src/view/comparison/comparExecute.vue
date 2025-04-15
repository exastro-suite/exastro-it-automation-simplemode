<template>
  <div ref="compareResultViewTemplate" v-show=false data-user='<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title></title><style>:host,:root{--d2h-bg-color:#fff;--d2h-border-color:#ddd;--d2h-dim-color:rgba(0,0,0,.3);--d2h-line-border-color:#eee;--d2h-file-header-bg-color:#f7f7f7;--d2h-file-header-border-color:#d8d8d8;--d2h-empty-placeholder-bg-color:#f1f1f1;--d2h-empty-placeholder-border-color:#e1e1e1;--d2h-selected-color:#c8e1ff;--d2h-ins-bg-color:#dfd;--d2h-ins-border-color:#b4e2b4;--d2h-ins-highlight-bg-color:#97f295;--d2h-ins-label-color:#399839;--d2h-del-bg-color:#fee8e9;--d2h-del-border-color:#e9aeae;--d2h-del-highlight-bg-color:#ffb6ba;--d2h-del-label-color:#c33;--d2h-change-del-color:#fdf2d0;--d2h-change-ins-color:#ded;--d2h-info-bg-color:#f8fafd;--d2h-info-border-color:#d5e4f2;--d2h-change-label-color:#d0b44c;--d2h-moved-label-color:#3572b0;--d2h-dark-color:#e6edf3;--d2h-dark-bg-color:#0d1117;--d2h-dark-border-color:#30363d;--d2h-dark-dim-color:#6e7681;--d2h-dark-line-border-color:#21262d;--d2h-dark-file-header-bg-color:#161b22;--d2h-dark-file-header-border-color:#30363d;--d2h-dark-empty-placeholder-bg-color:hsla(215,8%,47%,.1);--d2h-dark-empty-placeholder-border-color:#30363d;--d2h-dark-selected-color:rgba(56,139,253,.1);--d2h-dark-ins-bg-color:rgba(46,160,67,.15);--d2h-dark-ins-border-color:rgba(46,160,67,.4);--d2h-dark-ins-highlight-bg-color:rgba(46,160,67,.4);--d2h-dark-ins-label-color:#3fb950;--d2h-dark-del-bg-color:rgba(248,81,73,.1);--d2h-dark-del-border-color:rgba(248,81,73,.4);--d2h-dark-del-highlight-bg-color:rgba(248,81,73,.4);--d2h-dark-del-label-color:#f85149;--d2h-dark-change-del-color:rgba(210,153,34,.2);--d2h-dark-change-ins-color:rgba(46,160,67,.25);--d2h-dark-info-bg-color:rgba(56,139,253,.1);--d2h-dark-info-border-color:rgba(56,139,253,.4);--d2h-dark-change-label-color:#d29922;--d2h-dark-moved-label-color:#3572b0}.d2h-wrapper{text-align:left}.d2h-file-header{background-color:#f7f7f7;background-color:var(--d2h-file-header-bg-color);border-bottom:1px solid #d8d8d8;border-bottom:1px solid var(--d2h-file-header-border-color);display:-webkit-box;display:-ms-flexbox;display:flex;font-family:Source Sans Pro,Helvetica Neue,Helvetica,Arial,sans-serif;height:35px;padding:5px 10px}.d2h-file-header.d2h-sticky-header{position:sticky;top:0;z-index:1}.d2h-file-stats{display:-webkit-box;display:-ms-flexbox;display:flex;font-size:14px;margin-left:auto}.d2h-lines-added{border:1px solid #b4e2b4;border:1px solid var(--d2h-ins-border-color);border-radius:5px 0 0 5px;color:#399839;color:var(--d2h-ins-label-color);padding:2px;text-align:right;vertical-align:middle}.d2h-lines-deleted{border:1px solid #e9aeae;border:1px solid var(--d2h-del-border-color);border-radius:0 5px 5px 0;color:#c33;color:var(--d2h-del-label-color);margin-left:1px;padding:2px;text-align:left;vertical-align:middle}.d2h-file-name-wrapper{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;font-size:15px;width:100%}.d2h-file-name{overflow-x:hidden;text-overflow:ellipsis;white-space:nowrap}.d2h-file-wrapper{border:1px solid #ddd;border:1px solid var(--d2h-border-color);border-radius:3px;margin-bottom:1em}.d2h-file-collapse{-webkit-box-pack:end;-ms-flex-pack:end;cursor:pointer;display:none;font-size:12px;justify-content:flex-end;-webkit-box-align:center;-ms-flex-align:center;align-items:center;border:1px solid #ddd;border:1px solid var(--d2h-border-color);border-radius:3px;padding:4px 8px}.d2h-file-collapse.d2h-selected{background-color:#c8e1ff;background-color:var(--d2h-selected-color)}.d2h-file-collapse-input{margin:0 4px 0 0}.d2h-diff-table{border-collapse:collapse;font-family:Menlo,Consolas,monospace;font-size:13px;width:100%}.d2h-files-diff{display:-webkit-box;display:-ms-flexbox;display:flex;width:100%}.d2h-file-diff{overflow-y:hidden}.d2h-file-diff.d2h-d-none,.d2h-files-diff.d2h-d-none{display:none}.d2h-file-side-diff{display:inline-block;overflow-x:scroll;overflow-y:hidden;width:50%}.d2h-code-line{padding:0 8em;width:calc(100% - 16em)}.d2h-code-line,.d2h-code-side-line{display:inline-block;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;white-space:nowrap}.d2h-code-side-line{padding:0 4.5em;width:calc(100% - 9em)}.d2h-code-line-ctn{background:none;display:inline-block;padding:0;word-wrap:normal;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;vertical-align:middle;white-space:pre;width:100%}.d2h-code-line del,.d2h-code-side-line del{background-color:#ffb6ba;background-color:var(--d2h-del-highlight-bg-color)}.d2h-code-line del,.d2h-code-line ins,.d2h-code-side-line del,.d2h-code-side-line ins{border-radius:.2em;display:inline-block;margin-top:-1px;-webkit-text-decoration:none;text-decoration:none}.d2h-code-line ins,.d2h-code-side-line ins{background-color:#97f295;background-color:var(--d2h-ins-highlight-bg-color);text-align:left}.d2h-code-line-prefix{background:none;display:inline;padding:0;word-wrap:normal;white-space:pre}.line-num1{float:left}.line-num1,.line-num2{-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;padding:0 .5em;text-overflow:ellipsis;width:3.5em}.line-num2{float:right}.d2h-code-linenumber{background-color:#fff;background-color:var(--d2h-bg-color);border:solid #eee;border:solid var(--d2h-line-border-color);border-width:0 1px;-webkit-box-sizing:border-box;box-sizing:border-box;color:rgba(0,0,0,.3);color:var(--d2h-dim-color);cursor:pointer;display:inline-block;position:absolute;text-align:right;width:7.5em}.d2h-code-linenumber:after{content:"\200b"}.d2h-code-side-linenumber{background-color:#fff;background-color:var(--d2h-bg-color);border:solid #eee;border:solid var(--d2h-line-border-color);border-width:0 1px;-webkit-box-sizing:border-box;box-sizing:border-box;color:rgba(0,0,0,.3);color:var(--d2h-dim-color);cursor:pointer;display:inline-block;overflow:hidden;padding:0 .5em;position:absolute;text-align:right;text-overflow:ellipsis;width:4em}.d2h-code-side-linenumber:after{content:"\200b"}.d2h-code-side-emptyplaceholder,.d2h-emptyplaceholder{background-color:#f1f1f1;background-color:var(--d2h-empty-placeholder-bg-color);border-color:#e1e1e1;border-color:var(--d2h-empty-placeholder-border-color)}.d2h-code-line-prefix,.d2h-code-linenumber,.d2h-code-side-linenumber,.d2h-emptyplaceholder{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.d2h-code-linenumber,.d2h-code-side-linenumber{direction:rtl}.d2h-del{background-color:#fee8e9;background-color:var(--d2h-del-bg-color);border-color:#e9aeae;border-color:var(--d2h-del-border-color)}.d2h-ins{background-color:#dfd;background-color:var(--d2h-ins-bg-color);border-color:#b4e2b4;border-color:var(--d2h-ins-border-color)}.d2h-info{background-color:#f8fafd;background-color:var(--d2h-info-bg-color);border-color:#d5e4f2;border-color:var(--d2h-info-border-color);color:rgba(0,0,0,.3);color:var(--d2h-dim-color)}.d2h-file-diff .d2h-del.d2h-change{background-color:#fdf2d0;background-color:var(--d2h-change-del-color)}.d2h-file-diff .d2h-ins.d2h-change{background-color:#ded;background-color:var(--d2h-change-ins-color)}.d2h-file-list-wrapper{margin-bottom:10px}.d2h-file-list-wrapper a{-webkit-text-decoration:none;text-decoration:none}.d2h-file-list-wrapper a,.d2h-file-list-wrapper a:visited{color:#3572b0;color:var(--d2h-moved-label-color)}.d2h-file-list-header{text-align:left}.d2h-file-list-title{font-weight:700}.d2h-file-list-line{display:-webkit-box;display:-ms-flexbox;display:flex;text-align:left}.d2h-file-list{display:block;list-style:none;margin:0;padding:0}.d2h-file-list>li{border-bottom:1px solid #ddd;border-bottom:1px solid var(--d2h-border-color);margin:0;padding:5px 10px}.d2h-file-list>li:last-child{border-bottom:none}.d2h-file-switch{cursor:pointer;display:none;font-size:10px}.d2h-icon{margin-right:10px;vertical-align:middle;fill:currentColor}.d2h-deleted{color:#c33;color:var(--d2h-del-label-color)}.d2h-added{color:#399839;color:var(--d2h-ins-label-color)}.d2h-changed{color:#d0b44c;color:var(--d2h-change-label-color)}.d2h-moved{color:#3572b0;color:var(--d2h-moved-label-color)}.d2h-tag{background-color:#fff;background-color:var(--d2h-bg-color);display:-webkit-box;display:-ms-flexbox;display:flex;font-size:10px;margin-left:5px;padding:0 2px}.d2h-deleted-tag{border:1px solid #c33;border:1px solid var(--d2h-del-label-color)}.d2h-added-tag{border:1px solid #399839;border:1px solid var(--d2h-ins-label-color)}.d2h-changed-tag{border:1px solid #d0b44c;border:1px solid var(--d2h-change-label-color)}.d2h-moved-tag{border:1px solid #3572b0;border:1px solid var(--d2h-moved-label-color)}.d2h-dark-color-scheme{background-color:#0d1117;background-color:var(--d2h-dark-bg-color);color:#e6edf3;color:var(--d2h-dark-color)}.d2h-dark-color-scheme .d2h-file-header{background-color:#161b22;background-color:var(--d2h-dark-file-header-bg-color);border-bottom:#30363d;border-bottom:var(--d2h-dark-file-header-border-color)}.d2h-dark-color-scheme .d2h-lines-added{border:1px solid rgba(46,160,67,.4);border:1px solid var(--d2h-dark-ins-border-color);color:#3fb950;color:var(--d2h-dark-ins-label-color)}.d2h-dark-color-scheme .d2h-lines-deleted{border:1px solid rgba(248,81,73,.4);border:1px solid var(--d2h-dark-del-border-color);color:#f85149;color:var(--d2h-dark-del-label-color)}.d2h-dark-color-scheme .d2h-code-line del,.d2h-dark-color-scheme .d2h-code-side-line del{background-color:rgba(248,81,73,.4);background-color:var(--d2h-dark-del-highlight-bg-color)}.d2h-dark-color-scheme .d2h-code-line ins,.d2h-dark-color-scheme .d2h-code-side-line ins{background-color:rgba(46,160,67,.4);background-color:var(--d2h-dark-ins-highlight-bg-color)}.d2h-dark-color-scheme .d2h-diff-tbody{border-color:#30363d;border-color:var(--d2h-dark-border-color)}.d2h-dark-color-scheme .d2h-code-side-linenumber{background-color:#0d1117;background-color:var(--d2h-dark-bg-color);border-color:#21262d;border-color:var(--d2h-dark-line-border-color);color:#6e7681;color:var(--d2h-dark-dim-color)}.d2h-dark-color-scheme .d2h-files-diff .d2h-code-side-emptyplaceholder,.d2h-dark-color-scheme .d2h-files-diff .d2h-emptyplaceholder{background-color:hsla(215,8%,47%,.1);background-color:var(--d2h-dark-empty-placeholder-bg-color);border-color:#30363d;border-color:var(--d2h-dark-empty-placeholder-border-color)}.d2h-dark-color-scheme .d2h-code-linenumber{background-color:#0d1117;background-color:var(--d2h-dark-bg-color);border-color:#21262d;border-color:var(--d2h-dark-line-border-color);color:#6e7681;color:var(--d2h-dark-dim-color)}.d2h-dark-color-scheme .d2h-del{background-color:rgba(248,81,73,.1);background-color:var(--d2h-dark-del-bg-color);border-color:rgba(248,81,73,.4);border-color:var(--d2h-dark-del-border-color)}.d2h-dark-color-scheme .d2h-ins{background-color:rgba(46,160,67,.15);background-color:var(--d2h-dark-ins-bg-color);border-color:rgba(46,160,67,.4);border-color:var(--d2h-dark-ins-border-color)}.d2h-dark-color-scheme .d2h-info{background-color:rgba(56,139,253,.1);background-color:var(--d2h-dark-info-bg-color);border-color:rgba(56,139,253,.4);border-color:var(--d2h-dark-info-border-color);color:#6e7681;color:var(--d2h-dark-dim-color)}.d2h-dark-color-scheme .d2h-file-diff .d2h-del.d2h-change{background-color:rgba(210,153,34,.2);background-color:var(--d2h-dark-change-del-color)}.d2h-dark-color-scheme .d2h-file-diff .d2h-ins.d2h-change{background-color:rgba(46,160,67,.25);background-color:var(--d2h-dark-change-ins-color)}.d2h-dark-color-scheme .d2h-file-wrapper{border:1px solid #30363d;border:1px solid var(--d2h-dark-border-color)}.d2h-dark-color-scheme .d2h-file-collapse{border:1px solid #0d1117;border:1px solid var(--d2h-dark-bg-color)}.d2h-dark-color-scheme .d2h-file-collapse.d2h-selected{background-color:rgba(56,139,253,.1);background-color:var(--d2h-dark-selected-color)}.d2h-dark-color-scheme .d2h-file-list-wrapper a,.d2h-dark-color-scheme .d2h-file-list-wrapper a:visited{color:#3572b0;color:var(--d2h-dark-moved-label-color)}.d2h-dark-color-scheme .d2h-file-list>li{border-bottom:1px solid #0d1117;border-bottom:1px solid var(--d2h-dark-bg-color)}.d2h-dark-color-scheme .d2h-deleted{color:#f85149;color:var(--d2h-dark-del-label-color)}.d2h-dark-color-scheme .d2h-added{color:#3fb950;color:var(--d2h-dark-ins-label-color)}.d2h-dark-color-scheme .d2h-changed{color:#d29922;color:var(--d2h-dark-change-label-color)}.d2h-dark-color-scheme .d2h-moved{color:#3572b0;color:var(--d2h-dark-moved-label-color)}.d2h-dark-color-scheme .d2h-tag{background-color:#0d1117;background-color:var(--d2h-dark-bg-color)}.d2h-dark-color-scheme .d2h-deleted-tag{border:1px solid #f85149;border:1px solid var(--d2h-dark-del-label-color)}.d2h-dark-color-scheme .d2h-added-tag{border:1px solid #3fb950;border:1px solid var(--d2h-dark-ins-label-color)}.d2h-dark-color-scheme .d2h-changed-tag{border:1px solid #d29922;border:1px solid var(--d2h-dark-change-label-color)}.d2h-dark-color-scheme .d2h-moved-tag{border:1px solid #3572b0;border:1px solid var(--d2h-dark-moved-label-color)}@media (prefers-color-scheme:dark){.d2h-auto-color-scheme{background-color:#0d1117;background-color:var(--d2h-dark-bg-color);color:#e6edf3;color:var(--d2h-dark-color)}.d2h-auto-color-scheme .d2h-file-header{background-color:#161b22;background-color:var(--d2h-dark-file-header-bg-color);border-bottom:#30363d;border-bottom:var(--d2h-dark-file-header-border-color)}.d2h-auto-color-scheme .d2h-lines-added{border:1px solid rgba(46,160,67,.4);border:1px solid var(--d2h-dark-ins-border-color);color:#3fb950;color:var(--d2h-dark-ins-label-color)}.d2h-auto-color-scheme .d2h-lines-deleted{border:1px solid rgba(248,81,73,.4);border:1px solid var(--d2h-dark-del-border-color);color:#f85149;color:var(--d2h-dark-del-label-color)}.d2h-auto-color-scheme .d2h-code-line del,.d2h-auto-color-scheme .d2h-code-side-line del{background-color:rgba(248,81,73,.4);background-color:var(--d2h-dark-del-highlight-bg-color)}.d2h-auto-color-scheme .d2h-code-line ins,.d2h-auto-color-scheme .d2h-code-side-line ins{background-color:rgba(46,160,67,.4);background-color:var(--d2h-dark-ins-highlight-bg-color)}.d2h-auto-color-scheme .d2h-diff-tbody{border-color:#30363d;border-color:var(--d2h-dark-border-color)}.d2h-auto-color-scheme .d2h-code-side-linenumber{background-color:#0d1117;background-color:var(--d2h-dark-bg-color);border-color:#21262d;border-color:var(--d2h-dark-line-border-color);color:#6e7681;color:var(--d2h-dark-dim-color)}.d2h-auto-color-scheme .d2h-files-diff .d2h-code-side-emptyplaceholder,.d2h-auto-color-scheme .d2h-files-diff .d2h-emptyplaceholder{background-color:hsla(215,8%,47%,.1);background-color:var(--d2h-dark-empty-placeholder-bg-color);border-color:#30363d;border-color:var(--d2h-dark-empty-placeholder-border-color)}.d2h-auto-color-scheme .d2h-code-linenumber{background-color:#0d1117;background-color:var(--d2h-dark-bg-color);border-color:#21262d;border-color:var(--d2h-dark-line-border-color);color:#6e7681;color:var(--d2h-dark-dim-color)}.d2h-auto-color-scheme .d2h-del{background-color:rgba(248,81,73,.1);background-color:var(--d2h-dark-del-bg-color);border-color:rgba(248,81,73,.4);border-color:var(--d2h-dark-del-border-color)}.d2h-auto-color-scheme .d2h-ins{background-color:rgba(46,160,67,.15);background-color:var(--d2h-dark-ins-bg-color);border-color:rgba(46,160,67,.4);border-color:var(--d2h-dark-ins-border-color)}.d2h-auto-color-scheme .d2h-info{background-color:rgba(56,139,253,.1);background-color:var(--d2h-dark-info-bg-color);border-color:rgba(56,139,253,.4);border-color:var(--d2h-dark-info-border-color);color:#6e7681;color:var(--d2h-dark-dim-color)}.d2h-auto-color-scheme .d2h-file-diff .d2h-del.d2h-change{background-color:rgba(210,153,34,.2);background-color:var(--d2h-dark-change-del-color)}.d2h-auto-color-scheme .d2h-file-diff .d2h-ins.d2h-change{background-color:rgba(46,160,67,.25);background-color:var(--d2h-dark-change-ins-color)}.d2h-auto-color-scheme .d2h-file-wrapper{border:1px solid #30363d;border:1px solid var(--d2h-dark-border-color)}.d2h-auto-color-scheme .d2h-file-collapse{border:1px solid #0d1117;border:1px solid var(--d2h-dark-bg-color)}.d2h-auto-color-scheme .d2h-file-collapse.d2h-selected{background-color:rgba(56,139,253,.1);background-color:var(--d2h-dark-selected-color)}.d2h-auto-color-scheme .d2h-file-list-wrapper a,.d2h-auto-color-scheme .d2h-file-list-wrapper a:visited{color:#3572b0;color:var(--d2h-dark-moved-label-color)}.d2h-auto-color-scheme .d2h-file-list>li{border-bottom:1px solid #0d1117;border-bottom:1px solid var(--d2h-dark-bg-color)}.d2h-dark-color-scheme .d2h-deleted{color:#f85149;color:var(--d2h-dark-del-label-color)}.d2h-auto-color-scheme .d2h-added{color:#3fb950;color:var(--d2h-dark-ins-label-color)}.d2h-auto-color-scheme .d2h-changed{color:#d29922;color:var(--d2h-dark-change-label-color)}.d2h-auto-color-scheme .d2h-moved{color:#3572b0;color:var(--d2h-dark-moved-label-color)}.d2h-auto-color-scheme .d2h-tag{background-color:#0d1117;background-color:var(--d2h-dark-bg-color)}.d2h-auto-color-scheme .d2h-deleted-tag{border:1px solid #f85149;border:1px solid var(--d2h-dark-del-label-color)}.d2h-auto-color-scheme .d2h-added-tag{border:1px solid #3fb950;border:1px solid var(--d2h-dark-ins-label-color)}.d2h-auto-color-scheme .d2h-changed-tag{border:1px solid #d29922;border:1px solid var(--d2h-dark-change-label-color)}.d2h-auto-color-scheme .d2h-moved-tag{border:1px solid #3572b0;border:1px solid var(--d2h-dark-moved-label-color)}}</style></head><body>please-replace</body</html>'>
  </div>
  <div class="steps-second" v-loading="dl_loadingShow" element-loading-text="File download in progress...">
    <p v-if="dl_loadingShow" class="progressBox">
      {{ progress }} / {{ total }}</p>
    <p>比較するオペレーション名（基準日時）を設定して[ダウンロード]ボタンを押すと、比較結果（Excel）がダウンロードできます。</p>
    <div class="searchBtn">
      <el-select v-model="keyWords" clearable filterable allow-create default-first-option :reserve-keyword="false"
        placeholder="比較ジョブ または パラメータシート名を入力" style="width: 400px">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button @click="search">フィルタ</el-button>
    </div>
    <el-table :data="tableData" v-loading="loadingShow" element-loading-text="loading..." style="width: 100%"
      :height="tableHeight" :header-cell-style="headerStyle" :header-cell-class-name="headerClass" @cell-dblclick="cellClick"
      :cell-style="cellStyle" :default-sort="{ prop: 'compare_name', order: 'ascending' }">
      <el-table-column label="比較ジョブ">
        <el-table-column label="比較ジョブ">
          <el-table-column label="" prop="compare_name" />
        </el-table-column>
      </el-table-column>
      <el-table-column label="対象パラメータシート1" header-align="center">
        <el-table-column label="パラメータシート名">
          <el-table-column label="" prop="target_menu_1" />
        </el-table-column>
        <el-table-column label="オペレーション名（基準日時)" header-align="center">
          <el-table-column :index="1">
            <template #header>
              <div class="header-box searchBtn_h times">
                <el-select v-model="p1_all_date" placeholder="オペレーション名（基準日時）で選択" size="small" filterable>
                  <el-option v-for="item in optionsCopy" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button size="small" @click="setDate(parameterSheetType[0])">一括</el-button>
              </div>
            </template>
            <template #default="{ row }">
              <div class="times">
                <el-select ref="selectP1" v-if="row.p1_date_edit" v-model="row.p1_select" placeholder="オペレーション名（基準日時）で選択"
                  size="small" @change="changehandle(row, parameterSheetType[0])"
                  @blur="blurhandle(row, parameterSheetType[0])" @visible-change="visibleChangeP1"
                  value-key="operation_id" :automatic-dropdown="true" filterable>
                  <el-option v-for="item in optionsCopy" :key="item.operation_id" :label="item.label" :value="item" />
                </el-select>
                <div v-if="row.p1_date_edit == false">{{ row.p1_label }}<br />{{ row.p1_date }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column label="対象パラメータシート2" header-align="center">
        <el-table-column label="パラメータシート名">
          <el-table-column label="" prop="target_menu_2" />
        </el-table-column>
        <el-table-column label="オペレーション名（基準日時)" header-align="center">
          <el-table-column :index="2" class="comparExcuteClass">
            <template #header>
              <div class="header-box searchBtn_h times">
                <el-select v-model="p2_all_date" placeholder="オペレーション名（基準日時）で選択" size="small" class="operation-select"
                  filterable>
                  <el-option v-for="item in optionsCopy" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button size="small" @click="setDate(parameterSheetType[1])">一括</el-button>
              </div>
            </template>
            <template #default="{ row }">
              <div class="times">
                <el-select ref="selectP2" v-if="row.p2_date_edit" v-model="row.p2_select" placeholder="オペレーション名（基準日時）で選択"
                  size="small" class="operation-select" @change="changehandle(row, parameterSheetType[1])"
                  @blur="blurhandle(row, parameterSheetType[1])" @visible-change="visibleChangeP2"
                  value-key="operation_id" :automatic-dropdown="true" filterable>
                  <el-option v-for="item in optionsCopy" :key="item.operation_id" :label="item.label" :value="item" />
                </el-select>
                <div v-if="row.p2_date_edit == false">{{ row.p2_label }}<br />{{ row.p2_date }}</div>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
      <el-table-column label="ダウンロード" header-align="center" width="130px">
        <el-table-column>
          <el-table-column width="130px" align="center">
            <template #header>
              <el-tooltip class="box-item" effect="light" content="すべての比較結果をダウンロードします。" placement="top">
                <el-button size="small" class="exBtn" type="primary" @click="download_ComparFile(null, true)"><el-icon
                    size="small">
                    <Download />
                  </el-icon></el-button>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <div class=""><el-icon style="cursor: pointer;color: #da6a38;" size="large"
                  @click="download_ComparFile(row, false)">
                  <Download />
                </el-icon>
                <el-tooltip v-if="row.downloadErrorFlag" ref="tooltip" :disabled="tooltipShow" effect="dark"
                  content="エラー詳細" placement="top">
                  <div style="
                  display: inline;
                  margin-top: 8px;
                  margin-left: 2px;
                  margin-right: 2px;
                ">
                    <el-popover @before-leave="closeTooltip" ref="popover" placement="right" width="50%"
                      trigger="click">
                      <template #reference>
                        <el-icon @click="closeTooltip" size="large">
                          <Warning style="cursor: pointer" color="red" />
                        </el-icon>
                      </template>
                      <div class="errorTable">
                        <el-table :data="downloadErrorTableData[row.compare_name]" border height="150px">
                          <el-table-column width="150" prop="title" label="エラー列" v-if="false"></el-table-column>
                          <el-table-column prop="content" label="エラー内容"></el-table-column>
                        </el-table>
                      </div>
                    </el-popover>
                  </div>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table-column>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  nextTick,
  onMounted
} from "vue";
import { useStore } from "../../store/index";
import { operationListForFlag, comparFileDownload, getCompareInfos,getCompareResults,getDefOperationDataSetInfos } from "../../api/comparApi";
import { ElMessage } from "element-plus";
import {
  Loading,
  Download,
  Warning,
} from "@element-plus/icons-vue";
import { eventBus } from "../../store/eventBus";
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import JSZip from 'jszip';

export default defineComponent({
  name: "ComparExcute",
  components: {
    Loading,
    Download,
    Warning
  },
  emits: ["downloadStart"],
  setup(props, { emit }) {
    const progress = ref(0);
    const total = ref(0);
    const p1_all_date = ref('')
    const p2_all_date = ref('')
    const loadingShow = ref(true);
    const dl_loadingShow = ref(false);
    const tableData: any = reactive([]);
    const tableListData: any = reactive([]);
    const selectP1:any = ref(null);
    const selectP2:any = ref(null);
    const compareResultViewTemplate: any = ref(null)
    // event bus
    const bus = eventBus();
    const parameterSheetType = reactive(["parameter1", "parameter2",])
    const options = [
      {
        value: '[収集：収集比較]',
        label: '[収集：収集比較]',
      },
      {
        value: '[収集：構築比較]',
        label: '[収集：構築比較]',
      },
      {
        value: '[構築：構築比較]',
        label: '[構築：構築比較]',
      }
    ];
    const keyWords = ref<string>("");
    const store = useStore();
    const optionsCopy: any = ref([]);
    const tooltipShow = ref(false);
    const downloadErrorFlag = ref(true);
    const downloadErrorTableData: any = ref({});
    const parameterSheet1_row_3_col_index = 2
    const parameterSheet2__row_3_col_index = 4
    const download_row_3_col_index = 5
    const download_row_0_col_index = 3
    const download_row_1_col_index = 5
    const closeTooltip = () => {
      tooltipShow.value = !tooltipShow.value;
    };
    const cellStyle = (row: any) => {
      let style: object = {
        'background-color': 'rgba(242, 230, 183, 0.533) !important',
        'color': "#A8ABB2"
      };
      if (row.columnIndex != undefined && ((row.columnIndex == parameterSheet1_row_3_col_index && row.row.p1_label == "ダブルクリックで選択") || (row.columnIndex == parameterSheet2__row_3_col_index && row.row.p2_label == "ダブルクリックで選択"))) {
        return style;
      }
      if (row.columnIndex != undefined && ((row.columnIndex == download_row_3_col_index))) {
        return "";
      }
      return { 'vertical-align': 'top' };
    };

    const createdTableData = () => {
      loadingShow.value = true
      tableData.length = 0
      let loggedComparJobs = store.getLoggedComparJob;
      loggedComparJobs.forEach((arr: any) => {
        arr.p1_label = "ダブルクリックで選択";
        arr.p1_date = "　";
        arr.p1_date_value = "";
        arr.p1_date_edit = false;
        arr.p2_label = "ダブルクリックで選択";
        arr.p2_date = "　";
        arr.p2_date_value = "";
        arr.p2_date_edit = false;
        arr.p1_select = null;
        arr.p2_select = null;
        arr.download_icon_enable = false;
        arr.downloadErrorFlag = false;
        tableData.push(arr);
        tableListData.push(arr);
      })
    }
    createdTableData()
    const getOperationList = async () => {
      let data = {
        discard: {
          NORMAL: "0",
        },
        "Flag": {
          LIST: [null]
        }
      };
      let defOperationIds: any[] = [];
      await getDefOperationDataSetInfos(data).then(async (res: any) => {
        let data = res.data.data;
        if (data.length != 0) {
          data.forEach((element: any) => {
            defOperationIds.push(element.parameter.Operation);
          });
        }
      }).catch((err: any) => {
        ElMessage({
          type: "error",
          message: err,
        });
      });
      await operationListForFlag(defOperationIds)
        .then((res: any) => {
          let tmpoptions: any = [];
          let arr1 = res.data.data;
          arr1.forEach((element: any) => {
            let strdate = element.parameter.last_run_date == null ? element.parameter.scheduled_date_for_execution : element.parameter.last_run_date;
            element.parameter.value = element.parameter.operation_name;
            element.parameter.label = element.parameter.operation_name + "\n" + "(" + strdate + ")";
            element.parameter.dateVal = strdate;
            tmpoptions.push(element.parameter);
          });
          optionsCopy.value = JSON.parse(JSON.stringify(tmpoptions));

          optionsCopy.value.sort(function (a: any, b: any) {
            if (a.dateVal > b.dateVal) {
              return -1;
            }
            if (a.dateVal < b.dateVal) {
              return 1;
            }
            return 0;
          })
          loadingShow.value = false
        }).catch((error: any) => {
          loadingShow.value = false
          ElMessage({
            type: "error",
            message: error,
          });
        });

    }
    getOperationList()
    const headerStyle = ({ row, rowIndex, columnIndex, column }: any) => {
      let style: object = {
        'background-color': '#ffffff !important',
        'border-bottom': '1px solid #c3c3c3',
      };
      if (rowIndex === 2) {
        return style;
      }
      if (rowIndex === 0 && columnIndex === 0) {
        row[0].colSpan = 1;
        row[0].rowSpan = 2;
      }
      if (rowIndex === 1 && columnIndex === 0) {
        return { display: 'none' };
      }
      if (rowIndex === 0 && columnIndex === download_row_0_col_index) {
        row[3].colSpan = 1;
        row[3].rowSpan = 2;
      }
      if (rowIndex === 1 && columnIndex === download_row_1_col_index) {
        return { display: 'none' };
      }
    };
    const download_ComparFile = async (data: any, isAll: any) => {
      dl_loadingShow.value = true;
      bus.emit("downloadStart", true);
      tableData.forEach((item: any) => {
        if (isAll || item.compare_name == data.compare_name) { item.downloadErrorFlag = false; }
      })
      if (isAll) {
        total.value = tableData.length;
        for (const item of tableData) {
          await downloadHandle(item);
        }
      } else {
        total.value = 1
        await downloadHandle(data);
      }
      resetState();
    }
    const resetState = () => {
      total.value = 0;
      progress.value = 0;
      dl_loadingShow.value = false;
      bus.emit("downloadStart", false);
    }
    const downloadHandle = (async (data: any) => {
      let res_data:any = {
        compare: data.compare_name,
        host: store.getLoggedComparHost
      };
      if (data.p1_date_value != '' && data.p1_date_value != null) {
        res_data.base_date_1 = addSecondProcessing(data.p1_date_value)
      }
      if (data.p2_date_value != '' && data.p2_date_value != null) {
        res_data.base_date_2 = addSecondProcessing(data.p2_date_value)
      }
      progress.value = progress.value + 1;
      await comparFileDownload(res_data)
        .then(async (res: any) => {
          let base64Code = res.data.data.file_data;
          let name: string = res.data.data.file_name;
          let is_zip: boolean = false;
          let bstr = window.atob(base64Code),
            n = bstr.length,
            u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          let blob_xml = new Blob([u8arr]);
          let cr_fileNames:any = [];
          let cr_dataArray:any = [];
          await getCompareInfos(res_data).then(async (res: any) => {
            let compareData = res.data.data.compare_data;
            for (let key in compareData) {
              let file_compare_execute_info = compareData[key]._file_compare_execute_info
              for (let execute_info_key in file_compare_execute_info) {
                let info = file_compare_execute_info[execute_info_key];
                if (info.file_data_diff_flg) {
                  is_zip = true;
                  await getCompareResults(info["parameter"], info["endpoint"]).then((compareResults: any) => {
                    let diffHtml = Diff2Html.html(compareResults.data.data.unified_diff.diff_result, {
                      drawFileList: false,
                      matching: 'lines',
                      outputFormat: 'side-by-side',
                    });

                    let compareResultView = compareResultViewTemplate.value?.getAttribute('data-user');
                    let result = compareResultView.replace(/please-replace/g, diffHtml);
                    let blob = new Blob([result], {
                      type: "text/plain",
                    });
                    let file_name = key + "_" + execute_info_key + ".html";
                    cr_fileNames.push(file_name.replace(/[\\/:*?\\"<>|]/g,""));
                    cr_dataArray.push(blob);
                  }).catch((err: any) => {
                    if (isJSON(err)) {
                      let error = JSON.parse((err))
                      for (const key in error) {
                        if (Object.prototype.hasOwnProperty.call(error, key)) {
                          const element = error[key];
                          for (const key in element) {
                            if (Object.prototype.hasOwnProperty.call(element, key)) {
                              const elementInner = element[key];
                              let content = elementInner[0];
                              if (!content.endsWith("no file)") && !content.endsWith("no file,)")) {
                                throw err;
                              }
                            }
                          }
                        }
                      }
                    } else {
                      let content = err;
                      if (!content.endsWith("no file)") && !content.endsWith("no file,)")) {
                        throw err;
                      }
                    }
                  })
                }
              }
            }
          }).catch((err: any) => { throw err; });
          let url:any = null;
          let download_name:any = null;
          if (is_zip) {
            const js_zip = new JSZip();
            js_zip.file(name, blob_xml);
            for (let index = 0; index < cr_fileNames.length; index++) {
              js_zip.file(cr_fileNames[index], cr_dataArray[index]);
            }
            const zipBlob = await js_zip.generateAsync({
              type: 'blob', compression: "DEFLATE", compressionOptions: {
                level: 9
              }
            });
            url = URL.createObjectURL(zipBlob);
            download_name = name.replace(/.[^/.]+$/, ".zip");
          } else {
            url = URL.createObjectURL(blob_xml);
            download_name = name;
          }
          let a = document.createElement("a");
          a.href = url;
          a.download = download_name;
          a.click();
          URL.revokeObjectURL(a.href);
        })
        .catch((err: any) => {
          let arr: any = [];
          if (isJSON(err)) {
            let error = JSON.parse((err))
            let arr: any = [];
            for (const key in error) {
              let obj: any = {};
              obj.serialNum = key;
              if (Object.prototype.hasOwnProperty.call(error, key)) {
                const element = error[key];
                for (const key in element) {
                  if (Object.prototype.hasOwnProperty.call(element, key)) {
                    const elementInner = element[key];
                    obj.title = key;
                    obj.content = elementInner[0];
                    arr.push(obj);
                  }
                }
              }
            }
          } else {
            let obj: any = {};
            obj.title = '-';
            obj.content = err;
            arr.push(obj);
          }
          tableData.forEach((item: any) => {
            if (item.compare_name == data.compare_name) {
              item.downloadErrorFlag = true;
              downloadErrorTableData.value[item.compare_name] = arr;
            }
          })
        });
    })
    const isJSON = (str: any) => {
      if (typeof str == "string") {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == "object" && obj) {
            return true;
          } else {
            return false;
          }
        } catch (e) {
          return false;
        }
      }
      return false;
    };
    function addSecondProcessing(datetimeStr: any) {
      let datetime = new Date(datetimeStr);
      datetime.setSeconds(datetime.getSeconds() + 1);
      const year = datetime.getFullYear().toString();
      const month_c = datetime.getMonth() + 1
      const month = month_c.toString().padStart(2, '0');;
      const day = datetime.getDate().toString().padStart(2, '0');;
      const hours = datetime.getHours().toString().padStart(2, '0');
      const minutes = datetime.getMinutes().toString().padStart(2, '0');
      const seconds = datetime.getSeconds().toString().padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };
    const cellClick = ((row: any, column: any) => {
      if (column.index != undefined && column.index == 1) {
        row.p1_date_edit = true;
        nextTick(() => { selectP1.value?.focus(); })
      }
      if (column.index != undefined && column.index == 2) {
        row.p2_date_edit = true;
        nextTick(() => { selectP2.value?.focus(); })
      }
    })
    const visibleChangeP1 = ((visible: boolean) => {
      if (!visible) {
        tableData.forEach((item: any) => { item.p1_date_edit = false; })
      }
    })
    const visibleChangeP2 = (visible: boolean) => {
      if (!visible) {
        tableData.forEach((item: any) => { item.p2_date_edit = false; })
      }
    }

    const blurhandle = ((row: any, parametersheetType: string) => {
      if (parameterSheetType[0] === parametersheetType) {
        row.p1_date_edit = false;
      } else {
        row.p2_date_edit = false;
      }
    })

    const changehandle = ((row: any, parametersheetType: string) => {
      if (parameterSheetType[0] === parametersheetType) {
        row.p1_date_edit = false;
        row.p1_label = row.p1_select.operation_name;
        row.p1_date = "(" + row.p1_select.dateVal + ")";
        row.p1_date_value = row.p1_select.dateVal;
      } else {
        row.p2_date_edit = false;
        row.p2_label = row.p2_select.operation_name;
        row.p2_date = "(" + row.p2_select.dateVal + ")";
        row.p2_date_value = row.p2_select.dateVal;
      }
    })
    const setDate = ((parametersheetType: string) => {
      let val = p1_all_date.value;
      if (parameterSheetType[1] === parametersheetType) {
        val = p2_all_date.value;
      }
      if (val == '' || val == null) {
        ElMessage({
          type: "warning",
          message: "オペレーション名（基準日時）を選択してください。",
        });
      }
      optionsCopy.value.forEach((option: any) => {
        if (val == option.operation_name) {
          tableData.forEach((item: any) => {
            if (parameterSheetType[0] == parametersheetType) {
              item.p1_label = option.operation_name;
              item.p1_date = "(" + option.dateVal + ")";
              item.p1_select = option;
              item.p1_date_value = option.dateVal;
            } else {
              item.p2_label = option.operation_name;
              item.p2_date = "(" + option.dateVal + ")";
              item.p2_select = option;
              item.p2_date_value = option.dateVal;
            }
          })
        }
      })
    })
    // search
    const search = (() => {
      if (keyWords.value) {
        let result = tableListData.filter((item: any) => {
          if (
            item.compare_name.indexOf(keyWords.value) != -1 ||
            item.target_menu_1?.indexOf(keyWords.value) != -1 ||
            item.target_menu_2?.indexOf(keyWords.value) != -1
          )
            return item;
        });
        tableData.length = 0;
        result.forEach((element: any) => {
          tableData.push(element);
        });
      } else {
        tableData.length = 0;
        tableListData.forEach((el: any) => {
          tableData.push(el);
        });
      }
    })
    const headerClass = (({ row, rowIndex, columnIndex, column }: any) => {
      if (rowIndex === 2 && columnIndex === 2) {
        return 'comparExcuteClass';
      }

    })
    let tableHeight = ref(0);
    onMounted(() => {
      tableHeight.value = window.innerHeight - 342;
    });
    return {
      loadingShow,
      keyWords,
      options,
      tableData,
      tableListData,
      p1_all_date,
      p2_all_date,
      optionsCopy,
      search,
      download_ComparFile,
      headerStyle,
      cellClick,
      cellStyle,
      blurhandle,
      changehandle,
      visibleChangeP1,
      visibleChangeP2,
      selectP1,
      selectP2,
      setDate,
      parameterSheetType,
      dl_loadingShow,
      closeTooltip,
      tooltipShow,
      downloadErrorFlag,
      downloadErrorTableData,
      progress,
      total,
      headerClass,
      tableHeight,
      compareResultViewTemplate,
    }
  },
})
</script>
<style scoped lang="less">
.progressBox {
  width: 100px;
  text-align: center;
  position: absolute;
  top: 30%;
  left: calc(50% - 50px);
  z-index: 2002;
}

.errorTable {
  /deep/.el-table thead tr th {
    background-color: #bd3333 !important;
    color: #fff;
  }
}



.header-box {
  display: flex;
  justify-content: space-between;
  margin-top: 0px;
  margin-bottom: 2px;
}

.comparExcuteClass {
  .cell {
    background-color: #bd3333 !important;
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

.times {
  /deep/.el-select {
    width: 100%;

    .el-input__wrapper {
      border-radius: 0px;
    }
  }
}

.searchBtn_h {
  /deep/ button {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;

    &:hover {
      color: #fff;
      border-color: #da6a38;
      background-color: #da6a38;
      opacity: 0.8;
    }
  }
}

.exBtn {
  border-color: #da6a38;
  background-color: #da6a38;
  margin-bottom: 3px;
  margin-top: -1px;

  &:hover {
    color: #fff;
    border-color: #da6a38;
    background-color: #da6a38;
    opacity: 0.8;
  }
}

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

.el-select-dropdown__item {
  white-space: pre-wrap !important;
  height: auto !important;
  line-height: 20px !important;

  /deep/span {
    // height:10px!important; 
    display: inline-block !important;
    margin-top: 7px !important;
    padding-bottom: 7px !important;
  }
}
</style>
<style lang="less"></style>
