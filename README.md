# Trust Chat Platform

## 概要

Trust Chat Platformは、信頼性の高いAIモデルを提供するためのプラットフォームです。Internet Computer (ICP) 上に構築されており、ユーザーはモデルの信頼性を検証した上で、安心してチャットを行うことができます。

## 主な機能

1. **モデルマーケットプレイス**: 利用可能なAIモデルの一覧表示
2. **モデル検証機能**: 各モデルの信頼性を検証するための詳細情報表示
3. **チャットインターフェース**: 選択したモデルとのチャット機能

## プロジェクト構成

- **registry-canister**: モデルの登録と管理を行うキャニスター
- **model-canister-template**: 各AIモデルを実行するためのテンプレートキャニスター
- **trust-chat-platform-frontend**: ユーザーインターフェースを提供するフロントエンドキャニスター

## ローカルでの実行方法

以下のコマンドでプロジェクトをローカルで実行できます：

```bash
# レプリカをバックグラウンドで起動
dfx start --background

# キャニスターをデプロイ
dfx deploy --network playground
```

デプロイが完了すると、アプリケーションは `http://localhost:4943?canisterId={asset_canister_id}` で利用可能になります。

## フロントエンド開発

フロントエンドの変更を行う場合は、以下のコマンドで開発サーバーを起動できます：

```bash
cd src/trust-chat-platform-frontend
npm start
```

これにより、`http://localhost:8080` でサーバーが起動し、ポート4943のレプリカにAPIリクエストがプロキシされます。

## ICネットワークへのデプロイ

ICネットワークにデプロイするには、以下のコマンドを使用します：

```bash
dfx deploy --network ic
```

## モデル検証機能

Trust Chat Platformの核となる機能は、AIモデルの信頼性を検証する機能です。各モデルについて以下の情報を提供します：

### 1. キャニスター情報
- キャニスターID
- モジュールハッシュ
- コントローラー

### 2. API検証情報
- APIエンドポイント
- レスポンスサンプル
- レイテンシと成功率

### 3. セキュリティ監査情報
- 最終監査日
- 監査者

## 信頼スコアシステム

各モデルには0〜10の信頼スコアが付与されます。このスコアは以下の要素を考慮して算出されています：

1. **コード検証** (30%): オープンソースコードの有無、コードレビューの質、モジュールハッシュの検証
2. **セキュリティ監査** (25%): 第三者によるセキュリティ監査の有無と質
3. **API検証** (20%): APIの応答整合性、エラー処理、安定性
4. **コミュニティ評価** (15%): ユーザーレビュー、報告されたインシデント数
5. **透明性** (10%): プライバシーポリシーの明確さ、データ処理の透明性

### 将来の分散型評価システム

現在のスコアリングシステムはプロトタイプ段階であり、将来的には以下のような分散型評価システムへと発展させる計画があります：

1. **分散型検証ネットワーク**: 複数の独立した検証者によるモデル評価
2. **オンチェーン評価記録**: ブロックチェーン技術を活用した改ざん不可能な評価履歴
3. **自動検証プロトコル**: AIモデルの動作を自動的に検証する標準プロトコル
4. **コミュニティガバナンス**: 評価基準の更新や改善をコミュニティが主導

## 対応モデル

現在、以下のモデルに対応しています：

1. **GPT-4 Mini** (OpenAI)
2. **Claude 3.5 Sonnet** (Anthropic)
3. **O1 Mini** (OpenAI)

各モデルは、それぞれのプロバイダーのAPIを使用して実装されています。

## トラブルシューティング

### 502エラーの解決方法

アプリケーションにアクセスする際に502エラーが発生した場合は、以下の手順を試してください：

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
   サイクル残高が不足している場合は、トップアップが必要です。

3. **ブラウザキャッシュのクリア**:
   ブラウザのキャッシュをクリアして、再度アクセスしてみてください。

4. **ネットワーク接続の確認**:
   安定したインターネット接続があることを確認してください。

5. **ICネットワークのステータス確認**:
   [IC Dashboard](https://dashboard.internetcomputer.org/)でネットワークの状態を確認してください。

## 開発リソース

- [Internet Computer ドキュメント](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK 開発者ツール](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister 開発ガイド](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid 入門](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

## 参考資料

- [ICPチップス](https://zenn.dev/mameta29/articles/82dcb3a1696be5)

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。