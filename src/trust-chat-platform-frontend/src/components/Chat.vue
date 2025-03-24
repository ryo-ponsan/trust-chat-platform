<template>
  <div class="chat-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>モデル情報を読み込み中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <h3>エラーが発生しました</h3>
      <p>{{ error }}</p>
      <button @click="goHome" class="back-button">ホームに戻る</button>
    </div>
    
    <div v-else class="chat-interface">
      <div class="chat-header">
        <div class="model-info">
          <h2>{{ modelInfo.name }}</h2>
          <p class="model-description">{{ modelInfo.description }}</p>
        </div>
        <div class="model-meta">
          <span class="model-provider">{{ modelInfo.provider }}</span>
          <span class="model-base">{{ modelInfo.baseModel }}</span>
        </div>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="empty-chat">
          <p>{{ modelInfo.characterName }}とのチャットを開始しましょう。</p>
        </div>
        
        <chat-message
          v-for="(message, index) in messages"
          :key="index"
          :message="message"
          :model-info="modelInfo"
        />
      </div>
      
      <div class="chat-input">
        <textarea
          v-model="userInput"
          placeholder="メッセージを入力..."
          @keydown.enter.prevent="sendMessage"
          :disabled="sending"
        ></textarea>
        <button @click="sendMessage" :disabled="!userInput.trim() || sending">
          {{ sending ? '送信中...' : '送信' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ChatMessage from './ChatMessage.vue';
import { getModelInfo, getChatHistory, sendMessage } from '../api';

export default {
  name: 'Chat',
  components: {
    ChatMessage
  },
  props: {
    modelId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      modelInfo: null,
      messages: [],
      userInput: '',
      loading: true,
      error: null,
      sending: false
    };
  },
  async created() {
    try {
      // モデル情報を取得
      this.modelInfo = await getModelInfo(this.modelId);
      
      if (!this.modelInfo) {
        this.error = 'モデルが見つかりませんでした。';
        this.loading = false;
        return;
      }
      
      // チャット履歴を取得
      this.messages = await getChatHistory(this.modelId);
      this.loading = false;
    } catch (error) {
      console.error('Failed to load chat:', error);
      this.error = 'チャットの読み込みに失敗しました。';
      this.loading = false;
    }
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.sending) return;
      
      const userMessage = {
        role: 'user',
        content: this.userInput.trim()
      };
      
      this.messages.push(userMessage);
      this.sending = true;
      const input = this.userInput;
      this.userInput = '';
      
      try {
        // メッセージを送信
        const response = await sendMessage(this.modelId, input);
        this.messages.push(response);
      } catch (error) {
        console.error('Failed to send message:', error);
        this.messages.push({
          role: 'assistant',
          content: 'メッセージの送信に失敗しました。もう一度お試しください。'
        });
      } finally {
        this.sending = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    },
    goHome() {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.loading-container, .error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h3 {
  color: #e74c3c;
  margin-bottom: 10px;
}

.back-button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-info h2 {
  margin: 0 0 5px 0;
  font-size: 1.4rem;
}

.model-description {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.model-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.model-provider, .model-base {
  font-size: 0.8rem;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 5px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.empty-chat {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
}

.chat-input textarea {
  flex: 1;
  height: 60px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
}

.chat-input button {
  margin-left: 10px;
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
