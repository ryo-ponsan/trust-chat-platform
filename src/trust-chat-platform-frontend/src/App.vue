<template>
  <div id="app">
    <h1>Trust Chat Platform</h1>
    
    <!-- モデル選択画面 (選択されていない場合のみ表示) -->
    <div v-if="!selectedModel">
      <div v-if="loading" class="loading">
        Loading models...
      </div>
      
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      
      <div v-else>
        <h2>Available Models</h2>
        
        <div v-if="models.length === 0" class="no-models">
          No models available.
        </div>
        
        <div v-else class="model-list">
          <div v-for="model in models" :key="model.id" class="model-card">
            <h3>{{ model.name }}</h3>
            <p class="provider">by {{ model.provider }}</p>
            <p class="description">{{ model.description }}</p>
            <p class="pricing">{{ model.pricing }}</p>
            <div class="model-actions">
              <button class="verify-button" @click.stop="verifyModel(model)">Verify Model</button>
              <button class="chat-button" @click="selectModel(model)">Chat with this model</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- チャット画面 (モデルが選択されている場合のみ表示) -->
    <div v-else class="chat-container">
      <div class="chat-header">
        <button class="back-button" @click="closeChat">← Back to models</button>
        <h2>{{ selectedModel.name }}</h2>
        <p class="provider">by {{ selectedModel.provider }}</p>
      </div>
      
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="chatMessages.length === 0" class="welcome-message">
          <p>Start chatting with {{ selectedModel.name }}!</p>
        </div>
        
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index"
          :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']"
        >
          {{ message.content }}
        </div>
      </div>
      
      <div class="chat-input">
        <textarea 
          v-model="newMessage" 
          placeholder="Type your message here..." 
          @keydown.enter.prevent="sendMessage"
        ></textarea>
        <button 
          @click="sendMessage" 
          :disabled="!newMessage.trim()"
        >
          Send
        </button>
      </div>
    </div>
    
    <!-- モデル検証モーダル -->
    <div v-if="showVerificationModal" class="modal-overlay" @click="closeVerificationModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeVerificationModal">×</button>
        
        <h2>Model Verification</h2>
        
        <div v-if="verifyingModel" class="loading">
          Verifying model...
        </div>
        
        <div v-else-if="verificationError" class="error">
          {{ verificationError }}
        </div>
        
        <div v-else-if="verifiedModel" class="verification-details">
          <h3>{{ verifiedModel.name }}</h3>
          <p class="provider">by {{ verifiedModel.provider }}</p>
          
          <div class="verification-section">
            <h4>Canister Details</h4>
            <div class="verification-item">
              <span class="label">Canister ID:</span>
              <span class="value">{{ verifiedModel.canister_id }}</span>
              <a :href="`https://dashboard.internetcomputer.org/canister/${verifiedModel.canister_id}`" target="_blank" class="external-link">View on IC Dashboard</a>
            </div>
            
            <div class="verification-item">
              <span class="label">Module Hash:</span>
              <span class="value">{{ verificationData.moduleHash || 'Not available' }}</span>
            </div>
            
            <div class="verification-item">
              <span class="label">Controllers:</span>
              <span class="value">{{ verificationData.controllers ? verificationData.controllers.join(', ') : 'Not available' }}</span>
            </div>
          </div>
          
          <div class="verification-section">
            <h4>Trust Score</h4>
            <div class="trust-score" :class="getTrustScoreClass(verificationData.trustScore)">
              {{ verificationData.trustScore || 'N/A' }}/10
            </div>
            <p class="trust-description">{{ getTrustDescription(verificationData.trustScore) }}</p>
          </div>
          
          <div class="verification-section">
            <h4>Security Audit</h4>
            <div class="verification-item">
              <span class="label">Last Audited:</span>
              <span class="value">{{ verificationData.lastAudit || 'Not audited' }}</span>
            </div>
            
            <div class="verification-item">
              <span class="label">Auditor:</span>
              <span class="value">{{ verificationData.auditor || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="verification-section">
            <h4>API Verification</h4>
            <div class="verification-item">
              <span class="label">API Endpoint:</span>
              <span class="value">{{ verificationData.apiEndpoint || 'Not available' }}</span>
            </div>
            
            <div class="verification-item">
              <span class="label">Last Verified:</span>
              <span class="value">{{ verificationData.lastVerified || 'Not verified' }}</span>
            </div>
            
            <div class="verification-item">
              <span class="label">Latency:</span>
              <span class="value">{{ verificationData.latency || 'Unknown' }}</span>
            </div>
            
            <div class="verification-item">
              <span class="label">Success Rate:</span>
              <span class="value">{{ verificationData.successRate || 'Unknown' }}</span>
            </div>
          </div>
          
          <div v-if="verificationData.sampleResponse" class="verification-section">
            <h4>Sample Response</h4>
            <pre class="sample-response">{{ verificationData.sampleResponse }}</pre>
          </div>
          
          <div class="trust-score-details">
            <button @click="showTrustScoreDetails = !showTrustScoreDetails" class="details-toggle">
              {{ showTrustScoreDetails ? 'Hide Details' : 'Show Details' }}
            </button>
            
            <div v-if="showTrustScoreDetails" class="trust-score-breakdown">
              <h5>Trust Score Breakdown</h5>
              
              <div class="score-item">
                <div class="score-label">Code Verification (30%)</div>
                <div class="score-bar-container">
                  <div class="score-bar" :style="{ width: `${verificationData.codeScore * 10}%` }"></div>
                </div>
                <div class="score-value">{{ verificationData.codeScore }}/10</div>
              </div>
              
              <div class="score-item">
                <div class="score-label">Security Audit (25%)</div>
                <div class="score-bar-container">
                  <div class="score-bar" :style="{ width: `${verificationData.securityScore * 10}%` }"></div>
                </div>
                <div class="score-value">{{ verificationData.securityScore }}/10</div>
              </div>
              
              <div class="score-item">
                <div class="score-label">API Verification (20%)</div>
                <div class="score-bar-container">
                  <div class="score-bar" :style="{ width: `${verificationData.apiScore * 10}%` }"></div>
                </div>
                <div class="score-value">{{ verificationData.apiScore }}/10</div>
              </div>
              
              <div class="score-item">
                <div class="score-label">Community Rating (15%)</div>
                <div class="score-bar-container">
                  <div class="score-bar" :style="{ width: `${verificationData.communityScore * 10}%` }"></div>
                </div>
                <div class="score-value">{{ verificationData.communityScore }}/10</div>
              </div>
              
              <div class="score-item">
                <div class="score-label">Transparency (10%)</div>
                <div class="score-bar-container">
                  <div class="score-bar" :style="{ width: `${verificationData.transparencyScore * 10}%` }"></div>
                </div>
                <div class="score-value">{{ verificationData.transparencyScore }}/10</div>
              </div>
              
              <div class="score-note">
                <p>Note: This trust score is currently in beta. In the future, scores will be calculated by a decentralized network of independent verifiers.</p>
                <p>Last updated: {{ verificationData.scoreUpdatedAt || 'Unknown' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loading: true,
      error: null,
      models: [],
      selectedModel: null,
      chatMessages: [],
      newMessage: '',
      showVerificationModal: false,
      verifyingModel: false,
      verificationError: null,
      verifiedModel: null,
      verificationData: {},
      showTrustScoreDetails: false
    };
  },
  mounted() {
    console.log('Component mounted');
    this.fetchModels();
  },
  updated() {
    // チャットメッセージが追加されたら、スクロールを一番下に移動
    this.scrollToBottom();
  },
  methods: {
    // モデル一覧を取得
    fetchModels() {
      this.loading = true;
      this.error = null;
      
      console.log('Fetching models...');
      // モックデータを使用
      setTimeout(() => {
        this.models = [
          {
            id: "gpt4-mini",
            name: "GPT-4 Mini",
            description: "OpenAI GPT-4 Mini model with fine-tuned parameters",
            provider: "OpenAI",
            canister_id: "4n3qe-piaaa-aaaab-qac7a-cai",
            pricing: "Free"
          },
          {
            id: "claude",
            name: "Claude 3.5 Sonnet",
            description: "Anthropic Claude 3.5 Sonnet with enhanced reasoning",
            provider: "Anthropic",
            canister_id: "uy3uz-syaaa-aaaab-qadka-cai",
            pricing: "Free"
          },
          {
            id: "o1-mini",
            name: "O1 Mini",
            description: "OpenAI O1 Mini model with custom parameters",
            provider: "OpenAI",
            canister_id: "7gngh-jqaaa-aaaab-qacvq-cai",
            pricing: "Free"
          }
        ];
        this.loading = false;
        console.log('Models loaded:', this.models);
      }, 1500);
    },
    
    // モデルを選択
    selectModel(model) {
      console.log('Selected model:', model);
      this.selectedModel = model;
      this.chatMessages = [];
    },
    
    // チャットを閉じる
    closeChat() {
      this.selectedModel = null;
      this.chatMessages = [];
      this.newMessage = '';
    },
    
    // メッセージを送信
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const userMessage = this.newMessage.trim();
      this.chatMessages.push({ role: 'user', content: userMessage });
      this.newMessage = '';
      
      // モックレスポンスを生成
      setTimeout(() => {
        let response;
        
        if (this.selectedModel.id === 'gpt4-mini') {
          response = `As GPT-4 Mini, I'd say: ${userMessage.length > 10 ? userMessage.substring(0, 10) + '...' : userMessage}? That's an interesting point. Let me think about that... I believe the key insight here is that technology and human creativity must work together to solve complex problems.`;
        } else if (this.selectedModel.id === 'claude') {
          response = `Claude here! Regarding "${userMessage.length > 10 ? userMessage.substring(0, 10) + '...' : userMessage}" - I think this is a fascinating topic. From my perspective, it's important to consider multiple viewpoints and analyze the evidence carefully before drawing conclusions.`;
        } else {
          response = `O1 Mini responding to: "${userMessage.length > 10 ? userMessage.substring(0, 10) + '...' : userMessage}". I've processed your input and determined that this requires a nuanced approach. Let's break this down step by step and consider the implications.`;
        }
        
        this.chatMessages.push({ role: 'assistant', content: response });
      }, 1000);
    },
    
    // スクロールを一番下に移動
    scrollToBottom() {
      if (this.$refs.messagesContainer) {
        this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
      }
    },
    
    // モデルを検証
    verifyModel(model) {
      this.showVerificationModal = true;
      this.verifyingModel = true;
      this.verificationError = null;
      this.verifiedModel = null;
      this.verificationData = {};
      
      console.log('Verifying model:', model);
      
      // モックデータを使用して検証情報を取得
      setTimeout(() => {
        this.verifyingModel = false;
        this.verifiedModel = model;
        
        // モデルごとに異なる検証データを生成
        if (model.id === 'gpt4-mini') {
          this.verificationData = {
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
        } else if (model.id === 'claude') {
          this.verificationData = {
            moduleHash: '0x3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0',
            controllers: ['Anthropic Inc.', 'dfx2i-aiaaa-aaaab-qadpa-cai'],
            trustScore: 9.2,
            lastAudit: '2024-01-20',
            auditor: 'Dfinity Security Team',
            codeScore: 9,
            securityScore: 9,
            apiScore: 8,
            communityScore: 9,
            transparencyScore: 10,
            scoreUpdatedAt: '2024-05-28'
          };
        } else {
          this.verificationData = {
            moduleHash: '0x5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2',
            controllers: ['OpenAI Foundation', 'Community DAO'],
            trustScore: 7.8,
            lastAudit: '2023-11-05',
            auditor: 'Blockchain Security Alliance',
            codeScore: 7,
            securityScore: 8,
            apiScore: 7,
            communityScore: 6,
            transparencyScore: 8,
            scoreUpdatedAt: '2024-06-02'
          };
        }
      }, 1500);
    },
    
    // 検証モーダルを閉じる
    closeVerificationModal() {
      this.showVerificationModal = false;
    },
    
    // 信頼スコアに基づくCSSクラスを取得
    getTrustScoreClass(score) {
      if (!score) return 'unknown';
      if (score >= 8) return 'high';
      if (score >= 6) return 'medium';
      return 'low';
    },
    
    // 信頼スコアに基づく説明を取得
    getTrustDescription(score) {
      if (!score) return 'This model has not been evaluated for trustworthiness.';
      if (score >= 8) return 'This model has been thoroughly audited and is considered highly trustworthy.';
      if (score >= 6) return 'This model has been audited but may have some minor security considerations.';
      return 'This model has potential security or trust issues that should be considered.';
    }
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f8f9fa;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

h2 {
  color: #3498db;
  margin-bottom: 20px;
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

.model-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.model-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.model-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.provider {
  color: #7f8c8d;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.description {
  color: #34495e;
  margin-bottom: 15px;
}

.pricing {
  color: #27ae60;
  font-weight: bold;
  margin-bottom: 15px;
}

.model-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verify-button {
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.chat-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

/* チャット画面のスタイル */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}

.chat-header h2 {
  margin: 0;
  margin-top: 10px;
}

.chat-header .provider {
  margin: 0;
}

.back-button {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 0;
  font-size: 16px;
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

.welcome-message {
  text-align: center;
  color: #7f8c8d;
  margin: 20px 0;
}

.message {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 10px;
  word-break: break-word;
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
  font-family: inherit;
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

/* モーダルのスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.verification-details h3 {
  margin-top: 0;
  color: #2c3e50;
}

.verification-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.verification-section h4 {
  color: #3498db;
  margin-top: 0;
  margin-bottom: 15px;
}

.verification-item {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.verification-item .label {
  font-weight: bold;
  width: 120px;
  color: #7f8c8d;
}

.verification-item .value {
  flex: 1;
  word-break: break-all;
}

.external-link {
  margin-left: 10px;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9em;
}

.external-link:hover {
  text-decoration: underline;
}

.trust-score {
  font-size: 24px;
  font-weight: bold;
  padding: 10px 15px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}

.trust-score.high {
  background-color: #27ae60;
  color: white;
}

.trust-score.medium {
  background-color: #f39c12;
  color: white;
}

.trust-score.low {
  background-color: #e74c3c;
  color: white;
}

.trust-score.unknown {
  background-color: #95a5a6;
  color: white;
}

.trust-description {
  color: #7f8c8d;
  font-style: italic;
}

.sample-response {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

.trust-score-details {
  margin-top: 15px;
}

.details-toggle {
  background: none;
  border: 1px solid #3498db;
  color: #3498db;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.trust-score-breakdown {
  margin-top: 15px;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

.trust-score-breakdown h5 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.score-label {
  width: 180px;
  font-size: 0.9em;
  color: #7f8c8d;
}

.score-bar-container {
  flex: 1;
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin: 0 10px;
}

.score-bar {
  height: 100%;
  background-color: #3498db;
  border-radius: 4px;
}

.score-value {
  width: 40px;
  text-align: right;
  font-weight: bold;
  color: #2c3e50;
}

.score-note {
  margin-top: 15px;
  font-size: 0.8em;
  color: #7f8c8d;
  font-style: italic;
}

.score-note p {
  margin: 5px 0;
}
</style>
