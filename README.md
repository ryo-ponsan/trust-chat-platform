# Trust Chat Platform

## 概要

Trust Chat Platformは、分散型チャットボットプラットフォームである。ユーザーがオンチェーンで記録された透明性の高いAIモデル情報を確認しながら、複数のAIモデルから選択してチャットを楽しめる環境を提供する。特に、deepseekのように学習時に恣意的な情報が与えられる可能性があるモデルに対して、ユーザーが安心して利用できる選択肢を提示し、社会へのネガティブなインパクトを回避するための仕組みを提供する。

また将来的には、地方ごとに八百万の神々のような形でローカルLLMが各地に特化した形で出現すると考えられるため、そういった際の基盤として活用されることを目指している。

Internet Computer (ICP) 上に構築されており、ブロックチェーン技術の透明性と検証可能性を活かしたAIモデルの信頼性検証システムを特徴とする。

## アプリの特徴とICP活用メリット

本プラットフォームがICPを活用して実現する「差別化された機能」と、それによってユーザーが得られるメリット、現状の実装状況、残る課題をカテゴリ別にまとめています。

### 🔷 AIチャット利用
| 特徴 | 実装場所 (Canister/ファイル) | ICP活用メリット | 現状 | 課題 |
|------|------------------------------|-----------------|------|--------|
| 直接Canister間通信 | trust-chat-platform-frontend → model-canister | 中央サーバ不要で低レイテンシの対話 | Frontend→Canister呼び出し実装済み | ネットワーク遅延が大きい場合がある |
| 永続化された会話履歴 | model-canister-template.get_chat_history | オンチェーンに改ざん不可で保存 | チャット履歴保存実装済み | コスト増大、プライバシー設計未完 |

### 🔷 AIモデル登録
| 特徴 | 実装場所 | ICP活用メリット | 現状 | 課題 | 進捗 |
|------|----------|-----------------|------|--------|------|
| オンチェーン登録レジストリ | registry-canister | 透明性・検閲耐性を持つモデル一覧<br>全ユーザーが一意のCanister IDでアクセス可能 | 登録／取得機能実装済み | 登録審査・認証機能が不足 | △ |
| テンプレート＋インスタンス構成 | model-canister-template + gpt4-mini-canister 等 | 共通ロジックの再利用性↑<br>個別設定をinit_argで可視化（どのAPIを使用するか明示） | templateはコードのみ、各インスタンスにAPI設定（OpenAI GPT-4, Anthropic Claude）あり | トレーニング詳細・ファインチューニング情報は非公開 | △ |
| APIエンドポイントの明示 | registry-canister.ModelInfo + model-canister-template.get_model_info | どの外部APIを使っているかブロックチェーンで保証<br>ブラックボックスとの差別化 | api_endpointフィールドにURL記録済み | 実際の呼び出しログ／バージョン情報は記録なし | × |
| フロントエンドから動的デプロイ | trust-chat-platform-frontend Deployタブ | AI開発者がUIから新モデルをオンチェーンで即デプロイ・登録可能<br>cycles消費による分散運用 | dfx.jsonに静的記述のみ<br>Deployフォームはモック | Frontend→dfx.createCanister＋registry.register_model機能未実装 | × |
| 自己証明可能なメタデータ | registry-canister.ModelInfo | モデル出所をブロックチェーンで保証 | provider名のみ記録 | 署名付き検証ロジック未実装 | × |

#### APIエンドポイント登録と可視化
- **登録者**: AIモデル開発者が `registry-canister.register_model`（または将来のDeploy UI）へ ModelInfo レコードを送信。ここで `api_endpoint` を指定。
- **可視化方法**: フロントエンド（Home.vue）のMarketplaceカードやモデル詳細画面で `model.api_endpoint` を表示する。例:
```html
<p>API Endpoint: {{ selectedModel.api_endpoint }}</p>
```

- **呼び出しロジック**: model-canister-template/src/lib.rs の `CONFIG` に格納された `api_endpoint` を chat() メソッド内で利用（現在はモック）。将来は:
```rust
let endpoint = CONFIG.with(|c| c.borrow().api_endpoint.clone());
let response = ic_cdk::api::http::http_request(&endpoint, ...).await?;
```

これにより、オンチェーンのメタデータにあるAPIエンドポイントを直接叩いていることが実証可能となる。

### 🔷 モデル評価・検証
| 特徴 | 実装場所 | ICP活用メリット | 現状 | 課題 |
|------|----------|-----------------|------|--------|
| 改ざん防止されたTrust Score | trust-chat-platform-frontend | 信頼スコアの透明性 | モックスコア表示のみ | 評価結果のオンチェーン保存未実装 |
| Canisterメタ情報取得 | trust-chat-backend.get_canister_info | 実行コード・管理者情報を可視化 | 情報取得実装済み | 変更履歴追跡機能が未実装 |

### 🔷 その他運用・コスト管理
| 特徴 | 実装場所 | ICP活用メリット | 現状 | 課題 |
|------|----------|-----------------|------|--------|
| 分散ホスティング | trust-chat-platform-frontend (Asset Canister) | CDN不要でグローバル配信 | Asset Canister 配信実装済み | セキュリティヘッダー最適化未実装 |
| サイクルベース料金 | dfx cycles | 従量制で利用コストを透明化 | Cycles管理可 | 高頻度呼び出しでコスト急増リスク |

## ✅ 現状で活かせているICPの強み
以下はTrust Chat Platformが**現在実装済み**で、ICPならではの特性を活かして**ユーザーに具体的な価値を提供しているポイント**です。

| ICP機能 | 実装箇所 | ユーザーメリット | 解説 |
|----------|----------|----------------|-------|
| **オンチェーンレジストリ** | registry-canister | モデルの信頼性が一目で分かる | モデル提供者やAPIエンドポイントなど、全てのメタ情報がブロックチェーン上に記録され改ざん不可能。どのモデルを選ぶか透明性が高い。 |
| **Asset Canister (分散ホスティング)** | trust-chat-platform-frontend | グローバル即時アクセス／99.9%可用性 | フロントエンドUIがICPネットワーク上にホストされ、世界中のノードから高速に配信。サーバーダウンやCDNコスト不要。 |
| **無料クエリ呼び出し** | registry-canister.get_model, model-canister.get_chat_history | コストゼロで高速レスポンス | Queryメソッドは無料・低レイテンシ。ユーザーは追加費用を気にせず何度でも履歴確認やモデル情報取得が可能。 |
| **Stable Storage (永続データ保持)** | model-canister-template.CHAT_HISTORY | 会話履歴が消えない安心感 | Canisterのアップグレードや再デプロイ後もデータが失われず、ユーザーは会話履歴を継続的に確認可能。 |
| **Canister間直接通信** | Frontend → model-canister | レイテンシ低減 & APIキー不要 | HTTPを経由せずICP内部プロトコルで直接呼び出し。外部サービス認証が不要でシームレスなUXを実現。 |
| **透明性あるメタデータ** | trust-chat-platform-backend.get_canister_info | コード・管理者を誰でも検証可能 | 現在稼働中のCanister ID、コントローラー、コードハッシュを即座に確認。ユーザーは"本物"のモデルか自己検証できる。 |

## プロジェクト構造 & アーキテクチャ

### AIモデル分離設計の意図

Trust Chat Platformでは、各AIモデルを独立したCanister（スマートコントラクト）としてデプロイする設計を採用しています。この設計には以下の重要な意図があります：

1. **透明性の最大化**: 各モデルが独自のCanister IDを持つことで、そのコード、設定、APIエンドポイントがブロックチェーン上で個別に検証可能になります。ユーザーはモデルごとのコントローラー（管理者）や実行コードを直接確認できます。

2. **責任の明確化**: モデル提供者ごとに独立したCanisterを運用することで、各提供者の責任範囲が明確になります。問題が発生した場合、特定のモデルだけを停止・更新できます。

3. **スケーラビリティの向上**: 
   - **垂直スケーリング**: 各モデルCanisterは独自のメモリ空間とサイクル（計算リソース）を持ち、他のモデルのパフォーマンスに影響を与えません。
   - **水平スケーリング**: 新しいモデルの追加が既存システムに影響を与えず、プラットフォーム全体を停止せずに拡張できます。

4. **分散ガバナンスの実現**: 将来的に各モデルCanisterを異なるコミュニティやDAOが管理できるようになり、真の分散型AIエコシステムの基盤となります。

5. **セキュリティの強化**: モデル間の分離により、1つのモデルの脆弱性が他のモデルに影響を与えるリスクを低減します。

6. **カスタマイズの柔軟性**: 各モデルCanisterは独自の設定、パラメータ、機能拡張を持つことができ、特定のユースケースや地域に最適化されたAIサービスの提供が可能になります。

この設計は、ICPの「コード化された状態（Code as State）」という特性を最大限に活用し、AIモデルの透明性と信頼性を高めるための基盤となっています。

### キャニスターの管理とサイクル消費モデル

Trust Chat Platformにおけるキャニスター管理とサイクル（計算リソース）消費の仕組みは以下のとおりです：

1. **分散管理構造**:
   - 各モデルCanisterは、そのモデルをデプロイした開発者またはサービス提供者が管理します
   - 管理者（コントローラー）は、キャニスターのアップグレード、設定変更、停止などの権限を持ちます
   - レジストリCanisterは、プラットフォーム運営者が管理し、モデル一覧の整合性を維持します

2. **サイクル消費の責任分担**:
   - 各モデルCanisterのサイクル消費（計算・ストレージコスト）は、そのCanisterをデプロイした開発者/提供者が負担します
   - モデル提供者は自身のCanisterに定期的にサイクルをトップアップする必要があります
   - サイクル残高が不足すると、そのモデルのみが一時的に利用不可になりますが、プラットフォーム全体には影響しません

3. **現在の実装状態**:
   - 現状では、すべてのCanisterは開発チームの単一アカウントでデプロイされ、サイクル管理も一元化されています
   - 将来的には、`register-models.sh`スクリプトをWeb UIに置き換え、第三者のモデル開発者が自身のアイデンティティでCanisterをデプロイできるようにする予定です
   - フロントエンドの「Deploy」タブは、この機能のモックアップとして実装されています

4. **収益モデルの可能性**:
   - 将来的には、モデル提供者がサービス利用料を設定し、ユーザーからのマイクロペイメントを受け取る仕組みを実装予定です
   - 各チャットセッションごとに少額のサイクルを消費する従量課金モデルや、サブスクリプションモデルなどが検討されています
   - これにより、モデル提供者はサイクル消費コストを回収しつつ、質の高いAIサービスを持続的に提供できるようになります

この分散管理・サイクル消費モデルにより、Trust Chat Platformは単一の運営者に依存せず、多様なAIモデル提供者が参加できるオープンなエコシステムを目指しています。

### ルートフォルダ構成
```
├── dfx.json                  ← ICP Canister設定
├── Cargo.toml                ← Rustワークスペース定義
├── README.md                 ← プロジェクト概要
├── register-models.sh        ← レジストリ登録スクリプト
└── src/
    ├── registry-canister/    ← モデル登録・管理キャニスター
    ├── model-canister-template/ ← AIモデル共通テンプレートキャニスター
    ├── trust-chat-platform-backend/ ← プラットフォーム統合バックエンドキャニスター
    └── trust-chat-platform-frontend/ ← Vue.jsベースのフロントエンドアプリ
```

### Canister（スマートコントラクト）構造
| Canister 名 | 役割 | 言語 | 主な機能 |
|-------------|-------|------|----------|
| registry-canister | AIモデルの登録・一覧管理 | Rust | register_model, list_models, get_model |
| model-canister-template | 個別AIモデルの会話ロジック | Rust | initialize, chat, get_chat_history, get_model_info |
| gpt4-mini-canister / claude-canister / o1-mini-canister | モデルごとのデプロイインスタンス | Rust | モデル設定(init_arg)＋chat機能 |
| trust-chat-platform-backend | プラットフォーム統合API | Rust | list_models, chat (model選択), get_canister_info, greet |
| trust-chat-platform-frontend | Web UIホスティング | Assets | Vueアプリケーション（Marketplace, Deploy, Chat, Verification） |

### データフロー & ロジック概要
1. **モデル一覧取得**
   - Frontend → registry-canister.list_models() → モデル情報を表示
2. **モデル選択 & チャット履歴取得**
   - Frontend → registry-canister.get_model(id) → canister_id取得
   - Frontend → model-canister.chat_history() → 履歴取得
3. **メッセージ送信**
   - Frontend → trust-chat-backend.chat(model_id, message)
   - Backend → 選択モデルの model-canister.chat(message) → レスポンス取得
   - Backend と model-canister 双方でチャット履歴を保持
4. **モデル登録**
   - register-models.sh または Frontend Deployフォーム → registry-canister.register_model(ModelInfo)

### 各コンポーネント詳細
#### registry-canister (Rust)
- HashMap\<String, ModelInfo\> にモデル情報を保持
- register_model(): キャニスター自身のみ登録可能
- list_models(), get_model(id)

#### model-canister-template (Rust)
- ModelConfig で初期設定
- chat(): ユーザー→AI の会話履歴管理＋モックレスポンス
- get_chat_history(): ユーザーごとの履歴取得

#### trust-chat-platform-backend (Rust)
- 初期化済みモデル一覧を thread_local Vec<ModelInfo> で保持
- list_models(): Marketplace表示用
- chat(model_id, message): 選択モデルごとに chat 呼び出し
- get_canister_info(): キャニスターメタ情報取得

#### trust-chat-platform-frontend (Vue.js)
- **Home.vue**: Marketplace／My Models／Deployタブ
- **Chat.vue**: チャットUI＋入力
- **api.js**: ICP Agent を介して registry/model canister呼び出し
- **router.js**: SPA ルーティング管理

## 開発・実行ガイド

### ローカルでの実行方法

以下のコマンドでプロジェクトをローカルで実行できる：

```bash
# レプリカをバックグラウンドで起動
dfx start --background

# キャニスターをデプロイ
dfx deploy --network playground
```

デプロイが完了すると、アプリケーションは `http://localhost:4943?canisterId={asset_canister_id}` で利用可能になる。

### フロントエンド開発

フロントエンドの変更を行う場合は、以下のコマンドで開発サーバーを起動できる：

```bash
cd src/trust-chat-platform-frontend
npm start
```

これにより、`http://localhost:8080` でサーバーが起動し、ポート4943のレプリカにAPIリクエストがプロキシされる。

### デバッグと修正の手順

開発中に問題が発生した場合は、以下の手順でデバッグと修正を行うことができる：

1. **ログの確認**:
   ```bash
   dfx canister call <canister_name> get_logs
   ```
   各キャニスターには `get_logs` メソッドが実装されており、内部ログを確認できる。

2. **コード修正後の再デプロイ**:
   ```bash
   # 特定のキャニスターのみ再デプロイ
   dfx deploy <canister_name>
   
   # または全キャニスターを再デプロイ
   dfx deploy
   ```

3. **キャニスターの状態確認**:
   ```bash
   dfx canister status <canister_id>
   ```
   キャニスターの実行状態、メモリ使用量、サイクル残高などを確認できる。

4. **キャニスターのリセット**:
   問題が解決しない場合は、キャニスターをリセットして初期状態に戻すことができる：
   ```bash
   dfx canister stop <canister_name>
   dfx canister delete <canister_name>
   dfx deploy <canister_name>
   ```

5. **フロントエンドのデバッグ**:
   ブラウザの開発者ツールを使用して、コンソールログやネットワークリクエストを確認する。
   ```bash
   # 開発モードでフロントエンドを起動
   cd src/trust-chat-platform-frontend
   npm run dev
   ```

6. **Candid UIの活用**:
   各キャニスターのCandid UIにアクセスして、APIを直接テストできる：
   ```
   http://localhost:4943/?canisterId=<canister_id>&id=<canister_id>
   ```

7. **レプリカの再起動**:
   レプリカに問題がある場合は、クリーンな状態で再起動する：
   ```bash
   dfx stop
   dfx start --clean --background
   dfx deploy
   ```

これらの手順を組み合わせることで、ほとんどの開発上の問題を特定し解決できる。

### ICネットワークへのデプロイ

ICネットワークにデプロイするには、以下のコマンドを使用する：

```bash
dfx deploy --network ic
```

## モデル検証システム

### モデル検証機能

Trust Chat Platformの核となる機能は、AIモデルの信頼性を検証する機能である。各モデルについて以下の情報を提供する：

#### 1. キャニスター情報
- キャニスターID
- モジュールハッシュ
- コントローラー

#### 2. API検証情報
- APIエンドポイント
- レスポンスサンプル
- レイテンシと成功率

#### 3. セキュリティ監査情報
- 最終監査日
- 監査者

### 信頼スコアシステム

各モデルには0〜10の信頼スコアが付与される。このスコアは以下の要素を考慮して算出している：

1. **API連携型モデル**: OpenAI、Anthropicなどの外部APIを利用するモデル
2. **ローカルLLM型モデル**: HuggingFaceなどのオープンソースモデルをベースにカスタマイズしたモデル

信頼スコアは以下の要素から算出される：

1. **モデル透明性** (30%): 
   - API型：使用APIの公式性、バージョン、制限事項
   - ローカル型：ベースモデル情報、ファインチューニング詳細

2. **検証可能性** (25%): 
   - 動作の一貫性
   - 出力の予測可能性
   - エラー処理の適切さ

3. **データ処理透明性** (20%): 
   - ユーザーデータの処理方法
   - プライバシー保護対策

4. **コミュニティ評価** (15%): 
   - ユーザーレビュー
   - 報告されたインシデント

5. **オンチェーン検証** (10%): 
   - 登録情報の完全性
   - 変更履歴の追跡可能性

これらの情報はすべて、モデルがキャニスターとして登録される際に記録され、ブロックチェーン上で改ざん不可能な形で保存される。

## 対応モデル

現在、以下のモデルに対応している：

1. **GPT-4 Mini** (OpenAI)
2. **Claude 3.5 Sonnet** (Anthropic)
3. **O1 Mini** (OpenAI)

各モデルは、それぞれのプロバイダーのAPIを使用して実装されている。

## 将来の展望

### 分散型評価システム

現在のスコアリングシステムはプロトタイプ段階であり、将来的には以下のような分散型評価システムへと発展させる計画がある：

1. **分散型検証ネットワーク**: 複数の独立した検証者によるモデル評価
2. **オンチェーン評価記録**: ブロックチェーン技術を活用した改ざん不可能な評価履歴
3. **自動検証プロトコル**: AIモデルの動作を自動的に検証する標準プロトコル
4. **コミュニティガバナンス**: 評価基準の更新や改善をコミュニティが主導

### モデル開発者向け機能（未実装）

将来的に実装予定のAIモデル開発者向け機能には以下が含まれる：

1. **モデルデプロイツール**: 開発者が自身のAIモデルを簡単にICPネットワーク上にデプロイできるツール
2. **モデル管理ダッシュボード**: モデルのパフォーマンス、使用状況、収益などを管理・分析するダッシュボード
3. **APIキー管理**: 外部AIサービスとの連携のためのAPIキー管理システム
4. **カスタムモデル設定**: モデルの動作パラメータやコンテキスト設定をカスタマイズする機能
5. **バージョン管理**: モデルの異なるバージョンを管理し、A/Bテストを実施する機能
6. **収益化オプション**: 有料モデルの提供や使用量ベースの課金システム
7. **コンプライアンスツール**: 各地域の規制に準拠するためのツールとガイドライン

これらの機能により、AIモデル開発者はTrust Chat Platform上で自身のモデルを簡単に提供し、管理することができるようになる。特に地域特化型のローカルLLMの開発者にとって、有用なプラットフォームとなることを目指している。

## トラブルシューティング

### 502エラーの解決方法

アプリケーションにアクセスする際に502エラーが発生した場合は、以下の手順を試すこと：

1. **キャニスターの再デプロイ**:
   ```bash
   dfx stop
   dfx start --clean --background
   dfx deploy
   ```

2. **サイクル残高の確認**:
   ```bash
   dfx wallet --network ic balance
   ```
   サイクル残高が不足している場合は、トップアップが必要である。

3. **ブラウザキャッシュのクリア**:
   ブラウザのキャッシュをクリアして、再度アクセスしてみること。

4. **ネットワーク接続の確認**:
   安定したインターネット接続があることを確認すること。

5. **ICネットワークのステータス確認**:
   [IC Dashboard](https://dashboard.internetcomputer.org/)でネットワークの状態を確認すること。

## 開発リソース

- [Internet Computer ドキュメント](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK 開発者ツール](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister 開発ガイド](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid 入門](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)
- [ICPチップス](https://zenn.dev/mameta29/articles/82dcb3a1696be5)

## ライセンス

このプロジェクトはMITライセンスの下で公開されている。

## Trust Chat Platform — 分散型（DeAI）実装のユースケースと評価

### 1️⃣ このregistry‑canisterは何を実現する？（ユースケース例）

**ユースケース**：「分散型AIモデルマーケットプレイス」  
- **誰が何をする？**  
  1. AIモデル提供者（モデルCanister）が自身をレジストリに「登録」  
  2. エンドユーザーがフロントエンド経由で「登録済みモデル一覧」を取得  
  3. ユーザーが選択したモデルのCanister IDを取得→直接対話（チャット）  

> **具体例**  
> - 「GPT‑4 Mini Canister」が `register_model` を呼び出してレジストリに自分を追加  
> - ユーザーがMarketplaceで "GPT‑4 Mini" を見つけ、選択ボタンを押す  
> - フロントエンドが `list_models` → `get_model("gpt4-mini")` を呼び、Canister ID を得てチャット開始  

### 2️⃣ どこまで分散型？ICPの特性が活きる箇所

| 機能 | 完全分散型 | ICP特性を活かせている理由 |
|-------|------------|-----------------------------|
| モデル登録・一覧管理 | ✅ | Registry Canister にデータがオンチェーン保存。改ざん不可、検閲耐性あり |
| モデル選択フロー | ✅ | Frontend が直接 Canister API を呼び出す（P2Pライク） |
| チャット履歴保存 | ✅ | 各 Model Canister がオンチェーンで履歴を保持（永続化・透明性） |
| フロントエンド配信 | ✅ | Asset Canister 上の静的ファイルを分散ホスティング |

### 3️⃣ 分散できていない／中央集権的な部分（課題）

| 機能 | 中央依存箇所 | 問題点 |
|-------|-------------|--------|
| AI推論処理 | 外部API（OpenAI, Anthropic） | 分散性ゼロ。API障害時は利用不能。データプライバシー不明瞭 |
| モデル開発者認証 | 単一 Principal チェック | 検証ロジックが甘く、悪意ある登録リスク |
| チャット履歴同期 | trust-chat-backend → Model Canister | データ重複・同期不整合の可能性 |
| コスト管理 | Cyclesベース | 大量履歴保存や頻繁更新は高コスト（ガス高騰リスク） |

### 4️⃣ ICP特性が最大限活かせる領域

| ICP機能 | 活用例 | 将来強化案 |
|----------|--------|-------------|
| On‑chain Code Execution | Model Canister でロジック実行 | モデル推論もWasmで実行し完全オンチェーン化 |
| Candid Interface | 型安全な跨言語API | API自動生成による開発効率UP |
| Stable Storage | アップグレード後もデータ保持 | ストレージ最適化（履歴TTL, Partitioning） |
| Decentralized Governance | Controller追加・変更 | DAOによる登録承認プロセス |

### 5️⃣ 現時点実装の課題と改善ロードマップ

| 課題 | 原因 | 改善案 |
|-------|-------|---------|
| 推論が中央依存 | 外部API呼び出し | オープンソースLLMのWasm化、分散推論ネットワーク |
| 高コスト | チャット履歴全オンチェーン保存 | 履歴暗号化＋IPFSストレージ連携（on‑chain pointer） |
| 悪意あるモデル登録 | 単純Principalチェック | Multi‑sig登録、ホワイトリスト／KYC検証 |
| レスポンス遅延 | ICP query/updateレイテンシ | Queryキャッシュ、Canister間並列処理 |

## 🚀 結論

Trust Chat Platformのregistry-canisterは「分散型AIマーケットプレイス」を実現する核ですが、現状は **モデルロジック（推論）だけ中央集権的APIに依存** している点が最大の脱分散ボトルネックです。ICPが提供する「改ざん防止」「検閲耐性」「分散ホスティング」の恩恵を最大限に得るには、次のステップとして **オンチェーンAI推論** と **分散評価コンセンサス** の実装が必須です。