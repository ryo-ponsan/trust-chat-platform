use candid::{CandidType, Deserialize};
use ic_cdk::{
    query, update,
    caller,
};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub api_details: String,
    pub on_chain_url: String,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct CanisterInfo {
    pub canister_id: String,
    pub controllers: Vec<String>,
    pub memory_size: u64,
    pub cycles: u64,
    pub status: String,
    pub module_hash: Option<String>,
}

thread_local! {
    static MODELS: RefCell<Vec<ModelInfo>> = RefCell::new(init_models());
    static CHAT_HISTORY: RefCell<HashMap<String, Vec<ChatMessage>>> = RefCell::new(HashMap::new());
}

fn init_models() -> Vec<ModelInfo> {
    vec![
        ModelInfo {
            id: "gpt4_mini".to_string(),
            name: "GPT-4 Mini".to_string(),
            api_details: "OpenAI API (GPT-4 Mini) - Fine-tuned".to_string(),
            on_chain_url: format!("https://dashboard.internetcomputer.org/canister/{}", ic_cdk::id().to_string()),
        },
        ModelInfo {
            id: "o1_mini".to_string(),
            name: "O1 Mini".to_string(),
            api_details: "OpenAI API (O1 Mini) - Custom parameters".to_string(),
            on_chain_url: format!("https://dashboard.internetcomputer.org/canister/{}", ic_cdk::id().to_string()),
        },
        ModelInfo {
            id: "claude_3_5".to_string(),
            name: "Claude 3.5 Sonnet".to_string(),
            api_details: "Anthropic API - Enhanced reasoning".to_string(),
            on_chain_url: format!("https://dashboard.internetcomputer.org/canister/{}", ic_cdk::id().to_string()),
        },
    ]
}

#[query]
fn list_models() -> Vec<ModelInfo> {
    MODELS.with(|models| models.borrow().clone())
}

#[update]
fn chat(model_id: String, message: String) -> String {
    let caller_id = caller().to_string();
    
    // Add user message to chat history
    let user_message = ChatMessage {
        role: "user".to_string(),
        content: message.clone(),
    };
    
    CHAT_HISTORY.with(|history| {
        let mut history_map = history.borrow_mut();
        let user_history = history_map.entry(caller_id.clone()).or_insert_with(Vec::new);
        user_history.push(user_message);
    });
    
    // Generate mock response based on model_id
    let response = match model_id.as_str() {
        "gpt4_mini" => format!("GPT-4 Mini: I've processed your message: '{}'", message),
        "o1_mini" => format!("O1 Mini: Analyzing your input: '{}'", message),
        "claude_3_5" => format!("Claude 3.5: Thank you for your message: '{}'. How can I assist further?", message),
        _ => format!("Unknown model '{}'. Your message was: '{}'", model_id, message),
    };
    
    // Add assistant response to chat history
    let assistant_message = ChatMessage {
        role: "assistant".to_string(),
        content: response.clone(),
    };
    
    CHAT_HISTORY.with(|history| {
        let mut history_map = history.borrow_mut();
        let user_history = history_map.entry(caller_id).or_insert_with(Vec::new);
        user_history.push(assistant_message);
    });
    
    response
}

#[query]
fn get_chat_history() -> Vec<ChatMessage> {
    let caller_id = caller().to_string();
    
    CHAT_HISTORY.with(|history| {
        let history_map = history.borrow();
        match history_map.get(&caller_id) {
            Some(messages) => messages.clone(),
            None => Vec::new(),
        }
    })
}

#[query]
fn get_canister_info() -> CanisterInfo {
    CanisterInfo {
        canister_id: ic_cdk::id().to_string(),
        controllers: vec!["管理者ID".to_string()], // 実際の管理者IDがわからないため仮の値
        memory_size: ic_cdk::api::stable::stable_size() * 1024 * 1024, // 正しい関数名に修正
        cycles: ic_cdk::api::canister_balance(),
        status: "running".to_string(),
        module_hash: None,
    }
}

// Keep the original greet function for backward compatibility
#[query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}
