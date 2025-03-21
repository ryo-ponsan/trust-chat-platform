use candid::{CandidType, Deserialize};
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(CandidType, Deserialize, Clone)]
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

thread_local! {
    static CONFIG: RefCell<ModelConfig> = RefCell::new(ModelConfig {
        id: "".to_string(),
        name: "Default Model".to_string(),
        character_name: "".to_string(),
        base_model: "".to_string(),
        description: "A template for AI model canisters".to_string(),
        provider: "Unknown".to_string(),
        api_endpoint: "".to_string(),
        system_prompt: "".to_string(),
        api_key: "".to_string(),
        pricing: "Free".to_string(),
    });
    
    static CHAT_HISTORY: RefCell<HashMap<String, Vec<ChatMessage>>> = RefCell::new(HashMap::new());
}

#[update]
fn initialize(config: ModelConfig) {
    CONFIG.with(|c| {
        *c.borrow_mut() = config;
    });
    
    // レジストリキャニスターに登録するロジックを追加
}

#[query]
pub fn get_model_info() -> ModelConfig {
    CONFIG.with(|c| c.borrow().clone())
}

#[update]
async fn chat(message: String) -> String {
    let caller = ic_cdk::caller().to_string();
    
    // ユーザーメッセージを履歴に追加
    let user_message = ChatMessage {
        role: "user".to_string(),
        content: message.clone(),
    };
    
    CHAT_HISTORY.with(|history| {
        let mut history_map = history.borrow_mut();
        let user_history = history_map.entry(caller.clone()).or_insert_with(Vec::new);
        user_history.push(user_message);
    });
    
    // 実際のAI APIを呼び出す代わりにモックレスポンスを返す
    // 実際の実装では、HTTP外部呼び出しを使用してAI APIを呼び出す
    let response = format!("This is a response to: {}", message);
    
    // AIレスポンスを履歴に追加
    let ai_message = ChatMessage {
        role: "assistant".to_string(),
        content: response.clone(),
    };
    
    CHAT_HISTORY.with(|history| {
        let mut history_map = history.borrow_mut();
        let user_history = history_map.entry(caller).or_insert_with(Vec::new);
        user_history.push(ai_message);
    });
    
    response
}

#[query]
fn get_chat_history() -> Vec<ChatMessage> {
    let caller = ic_cdk::caller().to_string();
    
    CHAT_HISTORY.with(|history| {
        let history_map = history.borrow();
        match history_map.get(&caller) {
            Some(messages) => messages.clone(),
            None => Vec::new(),
        }
    })
}