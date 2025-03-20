<template>
  <div class="chat-container">
    <div class="chat-header">
      <button @click="goBack" class="back-button">← Back</button>
      <h1>Chat with {{ modelName }}</h1>
    </div>
    
    <div v-if="loading" class="loading-history">
      <p>Loading chat history...</p>
    </div>
    
    <div v-else class="chat-messages" ref="messagesContainer">
      <div v-if="chatHistory.length === 0" class="empty-chat">
        <p>No messages yet. Start a conversation!</p>
      </div>
      <div v-else v-for="(message, index) in chatHistory" :key="index" 
           :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
        <div class="message-content">
          <strong>{{ message.role === 'user' ? 'You' : modelName }}</strong>
          <p>{{ message.content }}</p>
        </div>
      </div>
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

export default {
  name: 'ChatPage',
  data() {
    return {
      modelId: this.$route.params.modelId,
      modelName: this.$route.query.modelName || 'AI Assistant',
      userMessage: '',
      chatHistory: [],
      isLoading: false,
      loading: true
    };
  },
  async mounted() {
    await this.loadChatHistory();
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'Home' });
    },
    
    async loadChatHistory() {
      this.loading = true;
      try {
        this.chatHistory = await api.getChatHistory();
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async sendMessage() {
      if (!this.userMessage.trim() || this.isLoading) return;
      
      const userMessageText = this.userMessage.trim();
      this.userMessage = '';
      this.isLoading = true;
      
      // Add user message to local chat history
      this.chatHistory.push({
        role: 'user',
        content: userMessageText
      });
      
      try {
        // Send message to backend
        const response = await api.sendMessage(this.modelId, userMessageText);
        
        // Add assistant response to local chat history
        this.chatHistory.push({
          role: 'assistant',
          content: response
        });
      } catch (error) {
        console.error('Error sending message:', error);
        // Add error message to chat
        this.chatHistory.push({
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        setTimeout(() => {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }, 100);
      }
    }
  },
  updated() {
    this.scrollToBottom();
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.chat-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 15px;
  cursor: pointer;
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

.message {
  margin-bottom: 15px;
  max-width: 80%;
  padding: 10px 15px;
  border-radius: 8px;
}

.user-message {
  margin-left: auto;
  background-color: #dcf8c6;
}

.assistant-message {
  margin-right: auto;
  background-color: white;
  border: 1px solid #e0e0e0;
}

.message-content p {
  margin: 5px 0 0 0;
  white-space: pre-wrap;
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
