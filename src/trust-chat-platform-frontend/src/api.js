import { Actor, HttpAgent } from "@dfinity/agent";

// レジストリキャニスターIDを明示的に設定
const registryCanisterId = "53qip-2yaaa-aaaab-qac2a-cai";

// エージェントの設定
const agent = new HttpAgent({
  host: "https://icp0.io",
});

// レジストリキャニスターのインターフェース定義
const registryIdlFactory = ({ IDL }) => {
  const ModelInfo = IDL.Record({
    'id': IDL.Text,
    'name': IDL.Text,
    'description': IDL.Text,
    'provider': IDL.Text,
    'canister_id': IDL.Principal,
    'pricing': IDL.Text,
    'created_at': IDL.Nat64,
  });
  return IDL.Service({
    'register_model': IDL.Func([ModelInfo], [IDL.Variant({ 'Ok': IDL.Null, 'Err': IDL.Text })], []),
    'list_models': IDL.Func([], [IDL.Vec(ModelInfo)], ['query']),
    'get_model': IDL.Func([IDL.Text], [IDL.Opt(ModelInfo)], ['query']),
  });
};

// モデルキャニスターのインターフェース定義
const modelIdlFactory = ({ IDL }) => {
  const ModelConfig = IDL.Record({
    'name': IDL.Text,
    'description': IDL.Text,
    'provider': IDL.Text,
    'api_endpoint': IDL.Text,
    'api_key': IDL.Text,
    'pricing': IDL.Text,
  });
  const ChatMessage = IDL.Record({
    'role': IDL.Text,
    'content': IDL.Text,
  });
  return IDL.Service({
    'initialize': IDL.Func([ModelConfig], [], []),
    'get_model_info': IDL.Func([], [ModelConfig], ['query']),
    'chat': IDL.Func([IDL.Text], [IDL.Text], []),
    'get_chat_history': IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
  });
};

// レジストリキャニスターのアクターを作成
const registryActor = Actor.createActor(registryIdlFactory, {
  agent,
  canisterId: registryCanisterId,
});

// モデルキャニスターのアクターを作成する関数
function createModelActor(canisterId) {
  return Actor.createActor(modelIdlFactory, {
    agent,
    canisterId,
  });
}

// モックデータ（レジストリが空の場合に使用）
const mockModels = [
  {
    id: "gpt4-mini",
    name: "GPT-4 Mini",
    description: "OpenAI GPT-4 Mini model with fine-tuned parameters",
    provider: "OpenAI",
    canister_id: "4n3qe-piaaa-aaaab-qac7a-cai",
    pricing: "Free",
    created_at: BigInt(Date.now() * 1000000)
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic Claude 3.5 Sonnet with enhanced reasoning",
    provider: "Anthropic",
    canister_id: "uy3uz-syaaa-aaaab-qadka-cai",
    pricing: "Free",
    created_at: BigInt(Date.now() * 1000000)
  },
  {
    id: "o1-mini",
    name: "O1 Mini",
    description: "OpenAI O1 Mini model with custom parameters",
    provider: "OpenAI",
    canister_id: "7gngh-jqaaa-aaaab-qacvq-cai",
    pricing: "Free",
    created_at: BigInt(Date.now() * 1000000)
  }
];

// APIメソッド
export const api = {
  // モデル一覧を取得
  async listModels() {
    console.log("API: listModels called");
    try {
      console.log("Fetching models from registry...");
      console.log("Registry canister ID:", registryCanisterId);
      
      // デバッグ: モックデータを返す
      console.log("DEBUG: Returning mock data for testing");
      return mockModels;
      
      /* 実際のAPIコール（デバッグ後に有効化）
      const models = await registryActor.list_models();
      console.log("Models received:", models);
      
      // レジストリが空の場合はモックデータを返す
      if (models.length === 0) {
        console.log("Registry is empty, returning mock data");
        return mockModels;
      }
      
      return models;
      */
    } catch (error) {
      console.error("Error fetching models:", error);
      console.log("Returning mock data due to error");
      return mockModels;
    }
  },

  // 特定のモデルを取得
  async getModel(id) {
    try {
      const model = await registryActor.get_model(id);
      if (!model.length) {
        // モデルが見つからない場合はモックデータから検索
        return mockModels.find(m => m.id === id) || null;
      }
      return model[0];
    } catch (error) {
      console.error("Error fetching model:", error);
      // エラーの場合はモックデータから検索
      return mockModels.find(m => m.id === id) || null;
    }
  },

  // チャットメッセージを送信
  async sendMessage(modelCanisterId, message) {
    try {
      const modelActor = createModelActor(modelCanisterId);
      return await modelActor.chat(message);
    } catch (error) {
      console.error("Error sending message:", error);
      // モックレスポンスを返す
      return `This is a mock response to: ${message}`;
    }
  },

  // チャット履歴を取得
  async getChatHistory(modelCanisterId) {
    try {
      const modelActor = createModelActor(modelCanisterId);
      return await modelActor.get_chat_history();
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // モック履歴を返す
      return [];
    }
  },

  // 新しいモデルをデプロイ
  async deployModel(modelConfig) {
    try {
      // 実際の実装では、新しいキャニスターをデプロイするロジックを追加
      console.log("Deploying new model:", modelConfig);
      return { success: true, message: "Model deployment simulated" };
    } catch (error) {
      console.error("Error deploying model:", error);
      throw error;
    }
  }
};