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
const createModelActor = async (canisterId) => {
  try {
    console.log(`Creating actor for canister: ${canisterId}`);
    
    const agent = new HttpAgent({
      host: "https://icp0.io",
    });
    
    const idlFactory = ({ IDL }) => {
      const ChatMessage = IDL.Record({
        'role': IDL.Text,
        'content': IDL.Text,
      });
      const ModelConfig = IDL.Record({
        'id': IDL.Text,
        'name': IDL.Text,
        'character_name': IDL.Text,
        'base_model': IDL.Text,
        'description': IDL.Text,
        'provider': IDL.Text,
        'api_endpoint': IDL.Text,
        'system_prompt': IDL.Text,
        'api_key': IDL.Text,
        'pricing': IDL.Text,
      });
      const ApiKeyResult = IDL.Variant({
        'Ok': IDL.Null,
        'Err': IDL.Text,
      });
      
      return IDL.Service({
        'chat': IDL.Func([IDL.Text], [IDL.Text], []),
        'get_chat_history': IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
        'get_model_info': IDL.Func([], [IDL.Opt(ModelConfig)], ['query']),
        'set_api_key': IDL.Func([IDL.Text], [ApiKeyResult], []),
      });
    };
    
    return Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  } catch (error) {
    console.error(`Error creating actor for ${canisterId}:`, error);
    throw new Error(`Failed to connect to model canister: ${error.message}`);
  }
};

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

// モデル一覧を取得
export const listModels = async () => {
  // 実際のアプリでは、ここでレジストリキャニスターからモデル一覧を取得します
  // モックデータを返す
  return [
    {
      id: "olmji-7iaaa-aaaab-qab7a-cai", // 新しいキャニスターID
      name: "英会話講師",
      characterName: "Lady Victoria",
      baseModel: "gpt-4o-mini-2024-07-18",
      description: "日本人向けの英会話講師。語彙や文法の修正を丁寧に行います。",
      provider: "OpenAI",
      pricing: "Free",
      imageUrl: "/models/english-teacher.jpg"
    },
    {
      id: "omnp4-sqaaa-aaaab-qab7q-cai", // 新しいキャニスターID
      name: "ドラえもん",
      characterName: "ドラえもん",
      baseModel: "o3-mini-2025-01-31",
      description: "22世紀から来た猫型ロボット。ひみつ道具を出して、のび太くんの手助けをします。",
      provider: "OpenAI",
      pricing: "Free",
      imageUrl: "/models/doraemon.jpg"
    }
  ];
};

// モデルを選択
export const selectModel = async (modelId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true };
};

// モデルを検証
export const verifyModel = async (modelId) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // モックデータを返す
  return {
    moduleHash: '0x8f7d3e9b2f7a1c5d6e4b3a2c1d0e9f8a7b6c5d4e3f2a1b0',
    controllers: ['efz2i-fyaaa-aaaab-qacpa-cai', 'OpenAI Foundation'],
    trustScore: 8.5,
    lastAudit: '2023-12-15',
    auditor: 'IC Security Labs',
    codeScore: 8,
    securityScore: 9,
    apiScore: 7,
    communityScore: 8,
    transparencyScore: 9,
    scoreUpdatedAt: '2024-06-01'
  };
};

// チャット履歴を取得
export const getChatHistory = async (modelId) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 空のチャット履歴を返す
  return [];
};

// モデル情報を取得
export const getModelInfo = async (modelId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // モックデータを返す
  const models = await listModels();
  return models.find(model => model.id === modelId) || null;
};

// メッセージを送信
export const sendMessage = async (modelId, message) => {
  try {
    // モックレスポンスを返す
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modelId.includes("english-teacher") || modelId.includes("olmji")) {
      // 英会話講師のレスポンス
      if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
        return {
          role: 'assistant',
          content: `こんにちは、Lady Victoriaですわ。英語の練習をお手伝いしますわよ。どのようにお手伝いできますかしら？`
        };
      } else if (message.toLowerCase().includes("thank")) {
        return {
          role: 'assistant',
          content: `どういたしましてですわ。いつでもお手伝いしますわよ。他に何かご質問はありますかしら？`
        };
      } else {
        return {
          role: 'assistant',
          content: `なるほど、「${message}」についてですわね。英語では次のように表現できますわよ: "${translateToEnglish(message)}". 他に何かお手伝いできることはありますかしら？`
        };
      }
    } else if (modelId.includes("doraemon") || modelId.includes("omnp4")) {
      // ドラえもんのレスポンス
      if (message.includes("秘密道具") || message.includes("ひみつ道具")) {
        return {
          role: 'assistant',
          content: `ぼくのひみつ道具で何がしたいんだい？タケコプターや、どこでもドア、タイムマシンなど、いろんな道具があるよ！何が必要なのか教えてくれれば出してあげるよ。`
        };
      } else if (message.includes("のび太")) {
        return {
          role: 'assistant',
          content: `のび太くんのことかい？彼はぼくの大切な友達だけど、いつも宿題をさぼったりして困らせるんだ。でも根は優しい子なんだよ。`
        };
      } else {
        return {
          role: 'assistant',
          content: `うーん、「${message}」についてだね。ポケットからちょうどいいひみつ道具を出してみるよ！...あった！「なんでも解決機」だよ。これによると、${getRandomDoraemonResponse(message)}`
        };
      }
    } else {
      return {
        role: 'assistant',
        content: `This is a mock response to your message: "${message}". In a real application, this would be generated by the AI model.`
      };
    }
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      role: 'assistant',
      content: `エラーが発生しました: ${error.message || '不明なエラー'}`
    };
  }
};

// 簡易英語変換関数（モック用）
function translateToEnglish(text) {
  const translations = {
    'こんにちは': 'Hello',
    'ありがとう': 'Thank you',
    '名前': 'name',
    '英語': 'English',
    '日本': 'Japan',
    '勉強': 'study',
    '学校': 'school',
    '先生': 'teacher',
    '生徒': 'student'
  };
  
  let result = text;
  Object.keys(translations).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), translations[key]);
  });
  
  return result || "I'd like to learn more about that.";
}

// ドラえもんのランダムレスポンス
function getRandomDoraemonResponse(message) {
  const responses = [
    `それについては「未来予測機」で調べるのが一番だよ。未来ではそれがとても重要になるんだって！`,
    `「翻訳こんにゃく」を使えば、もっと詳しく理解できるよ。実はそれは複雑な問題なんだ。`,
    `「もしもボックス」で試してみるといいかもしれないね。「もしも${message}がなかったら」という世界を見てみると面白いよ。`,
    `「記憶パン」を食べれば、それに関する知識がすぐに頭に入るよ。便利だろう？`,
    `「タイムマシン」で未来に行って調べてきたよ。将来はそれがもっと発展するみたいだね！`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// APIキーを保存
export const saveApiKeys = async (keys) => {
  // 固定のAPIキーを使用するため、実際には何もしない
  return { success: true };
};

// APIオブジェクトとしてエクスポート
export const api = {
  listModels,
  selectModel,
  verifyModel,
  getChatHistory,
  getModelInfo,
  sendMessage,
  saveApiKeys
};