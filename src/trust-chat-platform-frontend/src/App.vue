<template>
  <div id="app">
    <header>
      <h1>Trust Chat Platform</h1>
      <nav>
        <router-link to="/">ホーム</router-link>
        <router-link to="/settings/api-keys">APIキー設定</router-link>
      </nav>
    </header>
    
    <!-- ルーターによるビューの表示 -->
    <router-view />
    
    <!-- モデル検証モーダル (グローバルに必要なため、App.vueに配置) -->
    <verification-modal
      v-if="showVerificationModal"
      :model="modelToVerify"
      :verification-data="verificationData"
      :verifying="verifyingModel"
      :error="verificationError"
      @close="closeVerificationModal"
    ></verification-modal>
  </div>
</template>

<script>
import VerificationModal from './components/VerificationModal.vue';
import { verifyModel as apiVerifyModel } from './api';

export default {
  name: 'App',
  components: {
    VerificationModal
  },
  data() {
    return {
      showVerificationModal: false,
      verifyingModel: false,
      verificationError: null,
      modelToVerify: null,
      verificationData: {}
    };
  },
  methods: {
    async verifyModel(model) {
      this.showVerificationModal = true;
      this.verifyingModel = true;
      this.verificationError = null;
      this.modelToVerify = model;
      this.verificationData = {};
      
      try {
        // 実際のAPIを呼び出す場合
        // this.verificationData = await apiVerifyModel(model.id);
        
        // モックデータを使用
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (model.id.includes('gpt4') || model.id.includes('gpt-4')) {
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
        } else if (model.id.includes('claude')) {
          this.verificationData = {
            moduleHash: '0x7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4',
            controllers: ['Anthropic', 'IC DAO'],
            trustScore: 9.2,
            lastAudit: '2024-01-20',
            auditor: 'Blockchain Security Group',
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
      } catch (error) {
        this.verificationError = error.message || 'Failed to verify model';
      } finally {
        this.verifyingModel = false;
      }
    },
    
    closeVerificationModal() {
      this.showVerificationModal = false;
    }
  },
  provide() {
    return {
      verifyModel: this.verifyModel
    };
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

h1 {
  color: #2c3e50;
  margin: 0;
}

nav {
  display: flex;
  gap: 20px;
}

nav a {
  color: #2c3e50;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
}

nav a:hover {
  background-color: #f0f0f0;
}

nav a.router-link-active {
  font-weight: bold;
  color: #4caf50;
}
</style>
