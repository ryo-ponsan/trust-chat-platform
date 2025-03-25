# Trust Chat Platform

分散型AIチャットプラットフォーム - Internet Computer Protocol (ICP) 上に構築された信頼性の高いAIチャットサービス

![サンプル動作](assets/trust_chat.gif)

## デプロイ済みキャニスター
URLs:
  Frontend canister via browser:
    trust-chat-platform-frontend: https://ckvys-wqaaa-aaaae-qcu5a-cai.icp0.io/
  Backend canister via Candid interface:
    doraemon-o3-mini: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=3s4yq-viaaa-aaaan-qzyia-cai
    english-teacher-gpt4o: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=td5pj-miaaa-aaaap-qpyiq-cai
    model-canister-template: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=q43x6-6iaaa-aaaao-a4cja-cai
    registry-canister: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=earrz-faaaa-aaaah-qqagq-cai


## サービスコンセプト
AIモデルの透明性と信頼性を重視した分散型チャットプラットフォーム。各AIモデルの情報（提供者、API、システムプロンプトなど）がオンチェーン上に記録され、ユーザーは安心して利用できる。
Trust Chat Platform は、Internet Computer Protocol (ICP) 上に構築された分散型 AI チャットプラットフォームであり、ユーザーはオンチェーンで記録された透明性の高い AI モデル情報を確認しながら、複数の AI モデルから選択してチャットを楽しめる。特に、学習時に恣意的な情報が与えられる可能性があるモデルに対して、ユーザーが安心して利用できる選択肢を提供する。
今回、ドラえもんと英会話講師の2つのモデルを別々のキャニスターにデプロイし、それぞれのキャニスター(API実行環境)に対してチャットを行うことを想定したDappsをメインネットにデプロイしている。

## 想定ユーザー
- AIチャットの安全性や透明性を重視するユーザー
- 特定のAIキャラクターとの対話を楽しみたいユーザー
- 英会話学習者（英会話講師AIモデル利用）

## メリットと特徴
1. **透明性**
   - AIモデルの情報がブロックチェーンに記録
   - コード変更履歴の追跡可能
   - モデルのシステムプロンプトを事前確認可能

2. **分散型アーキテクチャ**
   - 各AIモデルが独立したキャニスターとして動作
   - 単一障害点のない堅牢なシステム
   - チャット履歴の分散保存

3. **カスタマイズ可能なAI体験**
   - 複数のAIキャラクターから選択可能
   - 現在は「英会話講師」と「ドラえもん」を実装
   - AIモデル開発者、事業者は自由に設定してAIキャラクターをデプロイ可能（今後実装予定）

## ICPの活用
### 使用している機能
1. **Canister間直接通信**
   - フロントエンド ←→ AIモデルキャニスター間の低レイテンシ通信

2. **Stable Storage**
   - チャット履歴の永続化保存（実装予定）

3. **Registry Canister**
   - AIモデル情報の透明な管理（実装予定）

4. **Asset Canister**
   - フロントエンドの分散ホスティング

### ICPを選択した理由
1. **透明性の確保**
   - ブロックチェーンによるモデル情報の改ざん防止
   - コード変更履歴の追跡可能性

2. **分散化のメリット**
   - 高可用性（99.9%の稼働率）
   - 検閲耐性
   - グローバルな分散実行環境

3. **コスト効率**
   - 従量制の料金体系
   - CDN不要のグローバル配信

## 開発状況と今後の展望
### 現在の実装状況
- ✅ 基本的なチャット機能（モックモデルとの対話）
- ✅ AIモデル登録・管理システム（現在はCLIからの登録のみ）
- ✅ フロントエンド実装
- ✅ 2つのAIモデル（英会話講師、ドラえもん）キャニスター実装・デプロイ済み

### 今後の計画
1. II認証の実装
2. 事業者、モデル開発者によるAIモデルデプロイ機能実装（新キャニスターとしてデプロイ）
3. AIモデル変更履歴ダッシュボード実装
4. オンチェーンでのAI推論実行に関して調査