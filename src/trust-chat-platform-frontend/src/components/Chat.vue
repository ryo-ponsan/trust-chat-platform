<template>
  <div class="chat-container">
    <div class="chat-header">
      <button @click="goBack" class="back-button">← Back</button>
      <div class="model-info">
        <h1>{{ characterName || modelName }}</h1>
        <div class="model-details">
          <span class="base-model-badge">{{ baseModel || "AI Model" }}</span>
          <span class="provider">by {{ provider }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading-history">
      <p>Loading chat history...</p>
    </div>
    
    <div v-else class="chat-messages" ref="messagesContainer">
      <div v-if="chatHistory.length === 0" class="empty-chat">
        <p>No messages yet. Start a conversation!</p>
      </div>
      <chat-message
        v-else
        v-for="(message, index) in chatHistory"
        :key="index"
        :message="message"
        :character-name="characterName || modelName"
      ></chat-message>
    </div>
    
    <div class="chat-input">
      <textarea 
        v-model="userMessage" 
        placeholder="Type your message here..." 
        @keydown.enter.prevent="sendMessage"
      ></textarea>
      <button @click="sendMessage" :disabled="isLoading || !userMessage.trim()">
        {{ isLoading ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script>
import { api } from '../api';
import ChatMessage from './ChatMessage.vue';

export default {
  name: 'ChatPage',
  components: {
    ChatMessage
  },
  data() {
    return {
      modelId: this.$route.params.modelId,
      modelName: '',
      characterName: '',
      baseModel: '',
      provider: '',
      userMessage: '',
      chatHistory: [],
      isLoading: false,
      loading: true
    };
  },
  async created() {
    try {
      // モデル情報を取得
      const model = await api.getModelInfo(this.modelId);
      if (model) {
        this.modelName = model.name;
        this.characterName = model.character_name;
        this.baseModel = model.base_model;
        this.provider = model.provider;
      }
      
      // チャット履歴を取得
      this.chatHistory = await api.getChatHistory(this.modelId);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    goBack() {
      this.$router.push('/');
    },
    
    async sendMessage() {
      if (!this.userMessage.trim() || this.isLoading) return;
      
      const userMessageText = this.userMessage.trim();
      this.userMessage = '';
      
      // ユーザーメッセージをチャット履歴に追加
      this.chatHistory.push({
        role: 'user',
        content: userMessageText
      });
      
      // 自動スクロール
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
      
      this.isLoading = true;
      
      try {
        // AIからの応答を取得
        const response = await api.sendMessage(this.modelId, userMessageText);
        
        // AIの応答をチャット履歴に追加
        this.chatHistory.push(response);
        
        // 自動スクロール
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
          }
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        
        // エラーメッセージをチャット履歴に追加
        this.chatHistory.push({
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.'
        });
      } finally {
        this.isLoading = false;
      }
    }
  },
  watch: {
    // チャット履歴が変更されたときに自動スクロール
    chatHistory: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
          }
        });
      }
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 150px);
}

.chat-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #2c3e50;
  margin-right: 15px;
}

.model-info {
  flex: 1;
}

.model-info h1 {
  margin: 0;
  font-size: 1.5rem;
}

.model-details {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.base-model-badge {
  background-color: #e0e0e0;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.provider {
  font-size: 0.9em;
  color: #666;
}

.loading-history {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
}

.chat-input {
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
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
