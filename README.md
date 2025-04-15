# Exastro IT Automation SimpleMode
## 概要
SimpleModeは、インフラ自動構築ツール『Exastro IT Automation』をより手軽に使えることを目的としたツールです。

SimpleModeの機能を以下に示します。
1. ウィザード形式でのAnsible Movementの実行

2. パラメータシート間のデータコピー機能

3. ウィザード形式での比較ジョブ実行

## 環境構築
SimpleModeを、Exastro Playbook Collectionと組合せて利用するための標準的な手順を説明します。
前提として、Exastro IT AutomationとExastro IT Automation SimpleModeをインストールするサーバーを用意してください。（同一サーバーへのインストールでも可）

### 1. Exastro IT Automation Ver.2.2.1 の構築
SimpleMode Ver.1.2は、Exastro IT Automation Ver.2.2.1にのみ対応しています。他のバージョンでの動作は検証していません。
以下の手順で、Exastro IT Automation Ver.2.2.1をインストールします。

1. Exastro IT Automation Ver.2.2.1のソースをダウンロードします。
   https://github.com/exastro-suite/exastro-docker-compose/archive/refs/tags/2.2.1.tar.gz
2. ダウンロードしたソースを任意のディレクトリに配置し、展開します。
   tar -xzvf exastro-docker-compose-2.2.1.tar.gz
3. ディレクトリ名を変更します。
   mv exastro-docker-compose-2.2.1 exastro-docker-compose
4. インストールスクリプトのgithubからITA取得のソースをコメントアウトします。
   exastro-docker-compose/setup.sh
```
fetch_exastro() {
    info "Fetch compose files..."
    cd ${HOME}
   ### if [ ! -d ${PROJECT_DIR} ]; then
   ###     git clone https://github.com/exastro-suite/exastro-docker-compose.git
   ###     if [ "${DEP_PATTERN}" = "RHEL8" ]; then
   ###         podman unshare chown $(id -u):$(id -g) "${PROJECT_DIR}/.volumes/storage/"
   ###         sudo chcon -R -h -t container_file_t "${PROJECT_DIR}"
   ###     fi
   ### fi
}　
```
5. インストールスクリプトを実行します。
   cd exastro-docker-compose
   sh setup.sh install

以降の手順は、[Exastro on Docker Compose - Online](https://ita-docs.exastro.org/ja/2.4/installation/online/exastro/docker_compose.html) のとおりです。


### 2. Exastro Playbook Collectionのインポート
[Exastro Playbook Collection - Ansible Role Template](https://github.com/exastro-suite/playbook-collection-docs/blob/master/ansible_role_templates/README.md)を参照して、Ansible Role Template（RHEL9またはWS2022）をインポートします。
Exastro Playbook Collectionをインポートすることで、RHEL9、WS2022のOS設定・設定値収集ジョブをExastro IT AutomationおよびSimpleModeで利用できるようになります。
Exastro Playbook Collectionをインポートしない場合、下記データ要件に従いExastro IT Automationに自動化設定を行います。

### 3. Exastro IT Automation SimpleModeの構築
以下の要件・手順を参照し、Exastro IT Automation SimpleModeを構築してください。

#### 前提条件
##### ソフトウェア要件 (コンパイル時)

| ソフトウェア  | バージョン |
| ------------- | ---------------------- |
| npm | 18.16.0               |

##### ソフトウェア要件 (運用時)

| ソフトウェア  | バージョン |
| ------------- | ---------------------- |
| Exastro IT Automation | 2.2.1          |

##### データ要件 (運用時)

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

###### 1. Movement-パラメータシート関連付けデータシート

SimpleModeで異なるパラメータシート間でデータをコピーするためには、事前にMovementとコピー元パラメータシートの関連付けを行う必要があります。
本シートに登録することで、収集結果を格納するパラメータシートから構築用パラメータシートにデータをコピーする等の用途が実現できます。

###### パラメータシート名
MovementDataSet

###### パラメータシート定義

| 項目名           | タイプ         | 最大バイト数 | 説明                                                         |
| ---------------- | -------------- | ------------ | ------------------------------------------------------------ |
| movement         | 文字列(単一行) | 8192         | Movement名<br/>設定例：WS2022_構築 IPv4通信の詳細設定    |
| source_parameter | 文字列(単一行) | 8192         | コピー元パラメータシート名<br/>設定例：IPv4通信の詳細設定 WS2022_収集結果 |

※コピー先のパラメータシートは、代入値自動登録の設定内容から自動判定されます。

###### 2. ジョブ再開用データシート

SimpleModeの操作履歴を保存するためのデータシートです。事前のデータの登録は不要です。

###### パラメータシート名
OperationDataSet

###### パラメータシート定義

| 項目名    | タイプ         | 最大バイト数 | 説明                                               |
| --------- | -------------- | ------------ | -------------------------------------------------- |
| Operation | 文字列(単一行) | 8192         | 再開対象オペレーションの項番                       |
| Conductor | 文字列(単一行) | 8192         | 前回選択済みConductorの項番                        |
| Movement  | 文字列(単一行) | 8192         | 前回選択済みMovementの項番                         |
| Host      | 文字列(単一行) | 8192         | 前回選択済みホストの項番                           |
| Flag      | 文字列(単一行) | 8192         | 収集初期値管理フラグ<br> 1: 収集初期値管理⽤データ |



#### SimpleModeインストール

##### pnpm インストール
```
npm install pnpm -g
```

##### モジュール インストール
```
pnpm install
```

##### SimpleModeパッケージ 作成
```
pnpm build
```

##### Nginx配置
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

#### ログイン
WebブラウザでExastro IT Automation SimpleModeに接続してログインします。認証情報は下記を参照してください。

| 項目                   | 値                                                           |
| ---------------------- | ------------------------------------------------------------ |
| ITAリンク              | Exastro IT AutomationのサービスURL<br/>例：http://ita.example.com:30080|
| ユーザー               | Exastro IT Automationのユーザー                              |
| パスワード             | Exastro IT Automationのパスワード                            |
| オーガナイゼーションID | Exastro IT AutomationのオーガナイゼーションID                |
| ワークスペースID       | Exastro IT AutomationのワークスペースID                      |
