<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="$emit('close')">×</button>
      
      <h2>Model Verification</h2>
      
      <div v-if="verifying" class="loading">
        <div class="spinner"></div>
        <p>Verifying model...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button class="retry-btn" @click="$emit('retry')">Retry</button>
      </div>
      
      <div v-else-if="model" class="verification-details">
        <h3>{{ model.character_name || model.name }}</h3>
        <p class="provider">by {{ model.provider }}</p>
        
        <div class="verification-section">
          <h4>Canister Details</h4>
          <div class="verification-item">
            <span class="label">Canister ID:</span>
            <span class="value">{{ model.id }}</span>
            <a :href="`https://dashboard.internetcomputer.org/canister/${model.id}`" target="_blank" class="external-link">View on IC Dashboard</a>
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
          <h4>Audit Information</h4>
          <div class="verification-item">
            <span class="label">Last Audit:</span>
            <span class="value">{{ verificationData.lastAudit || 'Not available' }}</span>
          </div>
          <div class="verification-item">
            <span class="label">Auditor:</span>
            <span class="value">{{ verificationData.auditor || 'Not available' }}</span>
          </div>
        </div>
        
        <div class="trust-score-details">
          <button @click="showDetails = !showDetails" class="details-toggle">
            {{ showDetails ? 'Hide Details' : 'Show Details' }}
          </button>
          
          <div v-if="showDetails" class="trust-score-breakdown">
            <div class="score-item">
              <span class="score-label">Code Quality:</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${(verificationData.codeScore || 0) * 10}%` }"></div>
              </div>
              <span class="score-value">{{ verificationData.codeScore || 'N/A' }}</span>
            </div>
            
            <div class="score-item">
              <span class="score-label">Security:</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${(verificationData.securityScore || 0) * 10}%` }"></div>
              </div>
              <span class="score-value">{{ verificationData.securityScore || 'N/A' }}</span>
            </div>
            
            <div class="score-item">
              <span class="score-label">API Compliance:</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${(verificationData.apiScore || 0) * 10}%` }"></div>
              </div>
              <span class="score-value">{{ verificationData.apiScore || 'N/A' }}</span>
            </div>
            
            <div class="score-item">
              <span class="score-label">Community Trust:</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${(verificationData.communityScore || 0) * 10}%` }"></div>
              </div>
              <span class="score-value">{{ verificationData.communityScore || 'N/A' }}</span>
            </div>
            
            <div class="score-item">
              <span class="score-label">Transparency:</span>
              <div class="score-bar">
                <div class="score-fill" :style="{ width: `${(verificationData.transparencyScore || 0) * 10}%` }"></div>
              </div>
              <span class="score-value">{{ verificationData.transparencyScore || 'N/A' }}</span>
            </div>
            
            <div class="score-updated">
              Last updated: {{ verificationData.scoreUpdatedAt || 'Unknown' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerificationModal',
  props: {
    model: {
      type: Object,
      default: null
    },
    verificationData: {
      type: Object,
      default: () => ({})
    },
    verifying: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      showDetails: false
    };
  },
  methods: {
    getTrustScoreClass(score) {
      if (!score) return 'unknown';
      if (score >= 8) return 'high';
      if (score >= 6) return 'medium';
      return 'low';
    },
    
    getTrustDescription(score) {
      if (!score) return 'This model has not been evaluated for trustworthiness.';
      if (score >= 8) return 'This model has been thoroughly audited and is considered highly trustworthy.';
      if (score >= 6) return 'This model has been audited but may have some minor security considerations.';
      return 'This model has potential security or trust issues that should be considered.';
    }
  }
};
</script>

<style scoped>
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

h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

h4 {
  margin: 0 0 10px 0;
  color: #34495e;
}

.provider {
  color: #7f8c8d;
  margin-top: 0;
  margin-bottom: 20px;
}

.verification-section {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.verification-item {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 120px;
}

.value {
  font-family: monospace;
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
  display: inline-block;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.2em;
  margin: 10px 0;
}

.trust-score.high {
  background-color: #2ecc71;
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
  margin-top: 5px;
  color: #7f8c8d;
}

.details-toggle {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.details-toggle:hover {
  background-color: #2980b9;
}

.trust-score-breakdown {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.score-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.score-label {
  min-width: 150px;
}

.score-bar {
  flex: 1;
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
  margin: 0 10px;
}

.score-fill {
  height: 100%;
  background-color: #3498db;
}

.score-value {
  min-width: 30px;
  text-align: right;
}

.score-updated {
  margin-top: 15px;
  font-size: 0.9em;
  color: #7f8c8d;
  text-align: right;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3498db;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #e74c3c;
  text-align: center;
  padding: 20px;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-btn:hover {
  background-color: #2980b9;
}
</style> 