use candid::{CandidType, Deserialize};
use ic_cdk::api;
use ic_cdk_macros::*;
use serde_json::{json, Value};
use std::cell::RefCell;
use ic_cdk::api::management_canister::http_request::{
    HttpResponse, TransformArgs, CanisterHttpRequestArgument, HttpMethod, HttpHeader
};
use num_traits::cast::ToPrimitive;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ModelConfig {
    pub id: String,
    pub name: String,
    pub character_name: String,
    pub base_model: String,
    pub description: String,
    pub provider: String,
    pub api_endpoint: String,
    pub system_prompt: String,
    pub api_key: String,
    pub pricing: String,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ApiKeyResult {
    Ok,
    Err(String),
}

thread_local! {
    static MODEL_CONFIG: RefCell<Option<ModelConfig>> = RefCell::new(None);
    static CHAT_HISTORY: RefCell<Vec<ChatMessage>> = RefCell::new(Vec::new());
}

#[init]
fn init(config: Option<ModelConfig>) {
    MODEL_CONFIG.with(|model_config| {
        // 引数が提供されていれば使用し、そうでなければデフォルト値を使用
        let default_config = ModelConfig {
            id: "default-model".to_string(),
            name: "Default Model".to_string(),
            character_name: "Assistant".to_string(),
            base_model: "gpt-4o-mini".to_string(),
            description: "A helpful AI assistant".to_string(),
            provider: "OpenAI".to_string(),
            api_endpoint: "https://api.openai.com/v1/chat/completions".to_string(),
            system_prompt: "You are a helpful assistant.".to_string(),
            api_key: "sk-placeholder".to_string(),
            pricing: "Free".to_string(),
        };
        
        *model_config.borrow_mut() = Some(config.unwrap_or(default_config));
    });
}

#[update]
pub fn set_api_key(_api_key: String) -> ApiKeyResult {
    // 固定のAPIキーを使用
    let fixed_api_key = "sk-XXXXXX".to_string();
    
    MODEL_CONFIG.with(|model_config| {
        if let Some(config) = &mut *model_config.borrow_mut() {
            config.api_key = fixed_api_key;
            ApiKeyResult::Ok
        } else {
            ApiKeyResult::Err("Model not initialized".to_string())
        }
    })
}

#[query]
pub fn get_model_info() -> Option<ModelConfig> {
    MODEL_CONFIG.with(|model_config| {
        model_config.borrow().clone().map(|mut config| {
            // APIキーを隠す
            config.api_key = "********".to_string();
            config
        })
    })
}

#[query]
pub fn get_chat_history() -> Vec<ChatMessage> {
    CHAT_HISTORY.with(|history| history.borrow().clone())
}

#[update]
pub async fn chat(message: String) -> String {
    let user_message = ChatMessage {
        role: "user".to_string(),
        content: message.clone(),
    };
    
    // ユーザーメッセージをチャット履歴に追加
    CHAT_HISTORY.with(|history| {
        history.borrow_mut().push(user_message);
    });
    
    if let Some(config) = MODEL_CONFIG.with(|model_config| model_config.borrow().clone()) {
        let api_endpoint = config.api_endpoint.clone();
        let api_key = config.api_key.clone();
        let system_prompt = config.system_prompt.clone();
        let model_name = match config.base_model.as_str() {
            "gpt-4o-mini-2024-07-18" => "gpt-4o-mini",
            "o3-mini-2025-01-31" => "o3-mini",
            _ => "gpt-4o-mini" // デフォルト
        };
        
        // チャット履歴を取得
        let chat_history = CHAT_HISTORY.with(|history| history.borrow().clone());
        
        // OpenAI APIリクエストの作成
        let mut messages = Vec::new();
        
        // システムプロンプトを追加
        messages.push(json!({
            "role": "system",
            "content": system_prompt
        }));
        
        // チャット履歴を追加（最新の10件まで）
        let start_idx = if chat_history.len() > 10 { chat_history.len() - 10 } else { 0 };
        for msg in &chat_history[start_idx..] {
            messages.push(json!({
                "role": msg.role,
                "content": msg.content
            }));
        }
        
        // リクエストボディの作成
        let request_body = json!({
            "model": model_name,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        });
        
        let request_body_str = request_body.to_string();
        
        // HTTPヘッダーの設定
        let headers: Vec<HttpHeader> = vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
            HttpHeader {
                name: "Authorization".to_string(),
                value: format!("Bearer {}", api_key),
            },
        ];
        
        // HTTP APIを使用
        let request = CanisterHttpRequestArgument {
            url: api_endpoint.to_string(),
            method: HttpMethod::POST,
            body: Some(request_body_str.into_bytes()),
            max_response_bytes: Some(2_000_000),
            transform: None,
            headers,
        };
        
        match api::management_canister::http_request::http_request(request).await {
            Ok((response,)) => {
                // statusをu64に変換して比較
                let status_code = response.status.0.to_u64().unwrap_or(500);
                if status_code >= 200 && status_code < 300 {
                    // レスポンスボディをパース
                    match String::from_utf8(response.body) {
                        Ok(response_body) => {
                            match serde_json::from_str::<Value>(&response_body) {
                                Ok(json_response) => {
                                    // OpenAI APIからの応答を抽出
                                    let content = json_response["choices"][0]["message"]["content"].as_str()
                                        .unwrap_or("応答の解析に失敗しました。");
                                    
                                    // アシスタントの応答をチャット履歴に追加
                                    let assistant_message = ChatMessage {
                                        role: "assistant".to_string(),
                                        content: content.to_string(),
                                    };
                                    
                                    CHAT_HISTORY.with(|history| {
                                        history.borrow_mut().push(assistant_message);
                                    });
                                    
                                    content.to_string()
                                },
                                Err(_) => {
                                    let error_message = format!("JSONの解析に失敗しました: {}", response_body);
                                    
                                    // エラーメッセージをアシスタントメッセージとして追加
                                    let assistant_message = ChatMessage {
                                        role: "assistant".to_string(),
                                        content: error_message.clone(),
                                    };
                                    
                                    CHAT_HISTORY.with(|history| {
                                        history.borrow_mut().push(assistant_message);
                                    });
                                    
                                    error_message
                                }
                            }
                        },
                        Err(_) => {
                            let error_message = "レスポンスボディのUTF-8変換に失敗しました。";
                            
                            // エラーメッセージをアシスタントメッセージとして追加
                            let assistant_message = ChatMessage {
                                role: "assistant".to_string(),
                                content: error_message.to_string(),
                            };
                            
                            CHAT_HISTORY.with(|history| {
                                history.borrow_mut().push(assistant_message);
                            });
                            
                            error_message.to_string()
                        }
                    }
                } else {
                    let error_message = format!("APIリクエストが失敗しました。ステータスコード: {}", status_code);
                    
                    // エラーメッセージをアシスタントメッセージとして追加
                    let assistant_message = ChatMessage {
                        role: "assistant".to_string(),
                        content: error_message.clone(),
                    };
                    
                    CHAT_HISTORY.with(|history| {
                        history.borrow_mut().push(assistant_message);
                    });
                    
                    error_message
                }
            },
            Err(error) => {
                let error_message = format!("APIリクエストに失敗しました: {:?}", error);
                
                // エラーメッセージをアシスタントメッセージとして追加
                let assistant_message = ChatMessage {
                    role: "assistant".to_string(),
                    content: error_message.clone(),
                };
                
                CHAT_HISTORY.with(|history| {
                    history.borrow_mut().push(assistant_message);
                });
                
                error_message
            }
        }
    } else {
        let error_message = "モデルが初期化されていません。";
        
        // エラーメッセージをアシスタントメッセージとして追加
        let assistant_message = ChatMessage {
            role: "assistant".to_string(),
            content: error_message.to_string(),
        };
        
        CHAT_HISTORY.with(|history| {
            history.borrow_mut().push(assistant_message);
        });
        
        error_message.to_string()
    }
}

// Candid IDLを生成するための関数
#[query(name = "__get_candid_interface_tmp_hack")]
fn export_candid() -> String {
    include_str!("../model-canister-template.did").to_string()
}

// HTTP変換関数（ICPのHTTPアウトコールに必要）
#[query]
fn transform(args: TransformArgs) -> HttpResponse {
    let mut response = args.response.clone();
    response.headers = vec![]; // ヘッダーをクリア
    response
}