# Exastro IT Automation SimpleMode
## 概要
SimpleModeは、インフラ自動構築ツール『Exastro IT Automation』をより手軽に使えることを目的としたツールです。

SimpleModeの機能を以下に示します。
1. ウィザード形式でのAnsible Movementの実行

2. パラメータシート間のデータコピー機能

3. ウィザード形式での比較ジョブ実行

   

## 前提条件
### ソフトウェア要件 (コンパイル時)

| ソフトウェア  | バージョン |
| ------------- | ---------------------- |
| npm | 18.16.0               |

### ソフトウェア要件 (運用時)

| ソフトウェア  | バージョン |
| ------------- | ---------------------- |
| Exastro IT Automation | 2.2.1          |

### データ要件 (運用時)

SimpleModeの各機能の実行には、Exastro IT Automationに以下を事前に登録しておく必要があります。
- オーガナイゼーション
- ワークスペース
- ユーザー
- Movement
- Conductor
- パラメータシート(Movementとパラメータシートの組合せが1:1であること)
- 代入値自動登録
- 収集項目設定
- SimpleMode専用のデータシート

SimpleMode専用のデータシートの定義を以下に示します。

#### 1. Movement-パラメータシート関連付けデータシート

SimpleModeで異なるパラメータシート間でデータをコピーするためには、事前にMovementとコピー元パラメータシートの関連付けを行う必要があります。
本シートに登録することで、収集結果を格納するパラメータシートから構築用パラメータシートにデータをコピーする等の用途が実現できます。

##### パラメータシート名
MovementDataSet

##### パラメータシート定義

| 項目名           | タイプ         | 最大バイト数 | 説明                                                         |
| ---------------- | -------------- | ------------ | ------------------------------------------------------------ |
| movement         | 文字列(単一行) | 8192         | Movement名<br/>設定例：WS2022_構築 IPv4通信の詳細設定    |
| source_parameter | 文字列(単一行) | 8192         | コピー元パラメータシート名<br/>設定例：IPv4通信の詳細設定 WS2022_収集結果 |

※コピー先のパラメータシートは、代入値自動登録の設定内容から自動判定されます。

#### 2. ジョブ再開用データシート

SimpleModeの操作履歴を保存するためのデータシートです。事前のデータの登録は不要です。

##### パラメータシート名
OperationDataSet

##### パラメータシート定義

| 項目名    | タイプ         | 最大バイト数 | 説明                         |
| --------- | -------------- | ------------ | ---------------------------- |
| Operation | 文字列(単一行) | 8192         | 再開対象オペレーションの項番 |
| Conductor | 文字列(単一行) | 8192         | 前回選択済みConductorの項番  |
| Movement  | 文字列(単一行) | 8192         | 前回選択済みMovementの項番   |
| Host      | 文字列(単一行) | 8192         | 前回選択済みホストの項番     |



## 環境構築

### pnpm インストール
```
npm install pnpm -g
```

### モジュール インストール
```
pnpm install
```

### SimpleModeパッケージ 作成
```
pnpm build
```

### Nginx配置
/etc/nginx/nginx.confに下記を追記します。

```
server {
        ...
        location /auth/ {
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   Host              $http_host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_pass $http_X_ITA_HOST;
        }
        location /api/ {
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   Host              $http_host;
            proxy_set_header   X-Real-IP         $remote_addr;
            proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
            proxy_pass $http_X_ITA_HOST;
        }
        ...
}
```

### ログイン
WebブラウザでExastro IT Automation SimpleModeに接続してログインします。認証情報は下記を参照してください。

| 項目                   | 値                                                           |
| ---------------------- | ------------------------------------------------------------ |
| ITAリンク              | Exastro IT AutomationのサービスURL<br/>例：http://ita.example.com:30080|
| ユーザー               | Exastro IT Automationのユーザー                              |
| パスワード             | Exastro IT Automationのパスワード                            |
| オーガナイゼーションID | Exastro IT AutomationのオーガナイゼーションID                |
| ワークスペースID       | Exastro IT AutomationのワークスペースID                      |

