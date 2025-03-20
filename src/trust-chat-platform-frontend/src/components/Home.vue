<template>
  <div class="home">
    <h1>Trust Chat Platform</h1>
    
    <div class="tabs">
      <button 
        :class="['tab-button', activeTab === 'marketplace' ? 'active' : '']" 
        @click="activeTab = 'marketplace'"
      >
        Marketplace
      </button>
      <button 
        :class="['tab-button', activeTab === 'mymodels' ? 'active' : '']" 
        @click="activeTab = 'mymodels'"
      >
        My Models
      </button>
      <button 
        :class="['tab-button', activeTab === 'deploy' ? 'active' : '']" 
        @click="activeTab = 'deploy'"
      >
        Deploy Model
      </button>
    </div>
    
    <!-- マーケットプレイスタブ -->
    <div v-if="activeTab === 'marketplace'" class="tab-content">
      <h2>AI Model Marketplace</h2>
      
      <div v-if="loading" class="loading">
        Loading models...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else-if="models.length === 0" class="no-models">
        No models available in the marketplace.
      </div>
      
      <div v-else class="model-grid">
        <div 
          v-for="model in models" 
          :key="model.id" 
          class="model-card"
          @click="selectModel(model)"
        >
          <h3>{{ model.name }}</h3>
          <p class="provider">by {{ model.provider }}</p>
          <p class="description">{{ model.description }}</p>
          <p class="pricing">{{ model.pricing }}</p>
        </div>
      </div>
    </div>
    
    <!-- マイモデルタブ -->
    <div v-else-if="activeTab === 'mymodels'" class="tab-content">
      <h2>My Models</h2>
      
      <div class="no-models">
        You haven't deployed any models yet.
      </div>
    </div>
    
    <!-- デプロイタブ -->
    <div v-else-if="activeTab === 'deploy'" class="tab-content">
      <h2>Deploy New Model</h2>
      
      <form @submit.prevent="deployModel" class="deploy-form">
        <div class="form-group">
          <label for="name">Model Name</label>
          <input 
            id="name" 
            v-model="newModel.name" 
            type="text" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            v-model="newModel.description" 
            required
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="provider">Provider</label>
          <input 
            id="provider" 
            v-model="newModel.provider" 
            type="text" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="api_endpoint">API Endpoint</label>
          <input 
            id="api_endpoint" 
            v-model="newModel.api_endpoint" 
            type="text" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="api_key">API Key</label>
          <input 
            id="api_key" 
            v-model="newModel.api_key" 
            type="password"
          />
        </div>
        
        <div class="form-group">
          <label for="pricing">Pricing</label>
          <select id="pricing" v-model="newModel.pricing">
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        
        <button type="submit" class="action-button">Deploy Model</button>
      </form>
    </div>
    
    <!-- チャット画面 -->
    <div v-if="selectedModel" class="chat-container">
      <div class="chat-header">
        <button class="back-button" @click="selectedModel = null">← Back</button>
        <h2>{{ selectedModel.name }}</h2>
        <p>{{ selectedModel.description }}</p>
      </div>
      
      <div class="chat-messages" ref="chatMessages">
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index" 
          :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      
      <div class="chat-input">
        <textarea 
          v-model="newMessage" 
          @keydown.enter.prevent="sendMessage"
          placeholder="Type your message here..."
        ></textarea>
        <button @click="sendMessage" :disabled="!newMessage.trim() || sendingMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../api';

export default {
  name: 'Home',
  setup() {
    // 状態管理
    const activeTab = ref('marketplace');
    const models = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const selectedModel = ref(null);
    const chatMessages = ref([]);
    const newMessage = ref('');
    const sendingMessage = ref(false);
    
    // 新しいモデルの初期状態
    const newModel = ref({
      name: '',
      description: '',
      provider: '',
      api_endpoint: '',
      api_key: '',
      pricing: 'Free'
    });

    // モデル一覧を取得
    const fetchModels = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        console.log('Fetching models...');
        models.value = await api.listModels();
        console.log('Models fetched:', models.value);
      } catch (err) {
        console.error('Error fetching models:', err);
        error.value = 'Failed to load models. Please try again later.';
      } finally {
        loading.value = false;
      }
    };

    // モデルを選択
    const selectModel = (model) => {
      console.log('Selected model:', model);
      selectedModel.value = model;
      chatMessages.value = [];
      fetchChatHistory(model.canister_id);
    };

    // チャット履歴を取得
    const fetchChatHistory = async (canisterId) => {
      try {
        const history = await api.getChatHistory(canisterId);
        chatMessages.value = history;
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    // メッセージを送信
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !selectedModel.value) return;
      
      const userMessage = newMessage.value.trim();
      chatMessages.value.push({ role: 'user', content: userMessage });
      newMessage.value = '';
      sendingMessage.value = true;
      
      try {
        const response = await api.sendMessage(selectedModel.value.canister_id, userMessage);
        chatMessages.value.push({ role: 'assistant', content: response });
      } catch (err) {
        console.error('Error sending message:', err);
        chatMessages.value.push({ 
          role: 'system', 
          content: 'Failed to get response. Please try again.' 
        });
      } finally {
        sendingMessage.value = false;
      }
    };

    // チャットを閉じる
    const closeChat = () => {
      selectedModel.value = null;
    };

    // 新しいモデルをデプロイ
    const deployModel = async () => {
      try {
        await api.deployModel(newModel.value);
        // フォームをリセット
        newModel.value = {
          name: '',
          description: '',
          provider: '',
          api_endpoint: '',
          api_key: '',
          pricing: 'Free'
        };
        // マーケットプレイスタブに切り替え
        activeTab.value = 'marketplace';
        // モデル一覧を再取得
        fetchModels();
      } catch (err) {
        console.error('Error deploying model:', err);
        alert('Failed to deploy model. Please try again.');
      }
    };

    // コンポーネントがマウントされたときにモデル一覧を取得
    onMounted(() => {
      console.log('Component mounted');
      fetchModels();
    });

    return {
      activeTab,
      models,
      loading,
      error,
      selectedModel,
      chatMessages,
      newMessage,
      sendingMessage,
      newModel,
      selectModel,
      sendMessage,
      closeChat,
      deployModel
    };
  }
};
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.tab-button.active {
  color: #3498db;
  border-bottom: 2px solid #3498db;
}

.tab-content {
  padding: 20px 0;
}

.model-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.model-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.model-card h3 {
  margin-top: 0;
  color: #333;
}

.provider {
  color: #666;
  font-style: italic;
  margin-bottom: 10px;
}

.description {
  color: #333;
  margin-bottom: 15px;
}

.pricing {
  font-weight: bold;
  color: #3498db;
}

.deploy-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
}

.chat-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.back-button {
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #3498db;
  margin-bottom: 10px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 10px;
}

.user-message {
  align-self: flex-end;
  background-color: #3498db;
  color: white;
}

.ai-message {
  align-self: flex-start;
  background-color: #f1f1f1;
  color: #333;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.chat-input textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  height: 60px;
}

.chat-input button {
  padding: 0 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.action-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.loading, .error, .no-models {
  text-align: center;
  margin: 50px 0;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
</style>

