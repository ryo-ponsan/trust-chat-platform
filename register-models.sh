#!/bin/bash

# レジストリキャニスターID
REGISTRY_CANISTER_ID="53qip-2yaaa-aaaab-qac2a-cai"

# GPT-4 Miniモデルを登録
dfx canister --network playground call $REGISTRY_CANISTER_ID register_model '(record { id = "gpt4-mini"; name = "GPT-4 Mini"; description = "OpenAI GPT-4 Mini model with fine-tuned parameters"; provider = "OpenAI"; canister_id = principal "4n3qe-piaaa-aaaab-qac7a-cai"; pricing = "Free"; created_at = 0 : nat64 })'

# Claudeモデルを登録
dfx canister --network playground call $REGISTRY_CANISTER_ID register_model '(record { id = "claude"; name = "Claude 3.5 Sonnet"; description = "Anthropic Claude 3.5 Sonnet with enhanced reasoning"; provider = "Anthropic"; canister_id = principal "uy3uz-syaaa-aaaab-qadka-cai"; pricing = "Free"; created_at = 0 : nat64 })'

# O1 Miniモデルを登録
dfx canister --network playground call $REGISTRY_CANISTER_ID register_model '(record { id = "o1-mini"; name = "O1 Mini"; description = "OpenAI O1 Mini model with custom parameters"; provider = "OpenAI"; canister_id = principal "7gngh-jqaaa-aaaab-qacvq-cai"; pricing = "Free"; created_at = 0 : nat64 })'
