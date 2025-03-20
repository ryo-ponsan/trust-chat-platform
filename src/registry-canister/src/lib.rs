use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub provider: String,
    pub canister_id: Principal,
    pub pricing: String,
    pub created_at: u64,
}

thread_local! {
    static MODELS: RefCell<HashMap<String, ModelInfo>> = RefCell::new(HashMap::new());
}

#[update]
fn register_model(model: ModelInfo) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    // 簡易的な検証（実際の実装ではより厳密な検証が必要）
    if model.canister_id != caller {
        return Err("Only the model canister itself can register".to_string());
    }
    
    MODELS.with(|models| {
        let mut models_map = models.borrow_mut();
        models_map.insert(model.id.clone(), model);
    });
    
    Ok(())
}

#[query]
fn list_models() -> Vec<ModelInfo> {
    MODELS.with(|models| {
        models.borrow().values().cloned().collect()
    })
}

#[query]
fn get_model(id: String) -> Option<ModelInfo> {
    MODELS.with(|models| {
        models.borrow().get(&id).cloned()
    })
}