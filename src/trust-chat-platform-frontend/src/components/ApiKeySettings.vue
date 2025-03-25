<template>
  <div class="api-key-settings">
    <h2>APIキー設定</h2>
    <p class="description">
      OpenAI APIキーは既に設定されています。将来的にはこの画面でAPIキーを変更できるようになります。
      また、モデル開発者や事業者ごとのAPIキーを設定できるようにします。
    </p>
    
    <div class="api-key-form">
      <!-- OpenAI APIキー設定 -->
      <div class="form-group">
        <label for="openai-api-key">OpenAI API Key <span class="required">*</span></label>
        <div class="input-with-button">
          <input
            id="openai-api-key"
            value="*****************************************************"
            type="password"
            disabled
          />
        </div>
        <p class="hint">英会話講師モデルとドラえもんモデルを使用するために必要です。</p>
      </div>
      
      <div class="message success">
        APIキーは設定済みです。モデルを使用できます。（※現状APIキーを使ったチャットはできません）
      </div>
    </div>
    
    <div class="security-info">
      <h3>セキュリティ情報 <button class="toggle-details" @click="toggleSecurityDetails">{{ showSecurityDetails ? '詳細を隠す' : '詳細を表示' }}</button></h3>
      <ul v-if="showSecurityDetails">
        <li>APIキーはキャニスターに保存されます。</li>
        <li>キーはモデルキャニスターとの通信にのみ使用され、フロントエンドには保存されません。</li>
      </ul>
      <p class="note">※現状APIキーを使ったチャットはできません。</p>
    </div>
    
    <div class="api-key-instructions">
      <h3>OpenAI APIキーの取得方法</h3>
      <ol>
        <li><a href="https://platform.openai.com/signup" target="_blank">OpenAIアカウントを作成</a>します。</li>
        <li>OpenAIダッシュボードにログインします。</li>
        <li>右上のプロフィールアイコンをクリックし、「View API Keys」を選択します。</li>
        <li>「Create new secret key」ボタンをクリックします。</li>
        <li>生成されたAPIキーをコピーして、上のフォームに貼り付けます。</li>
      </ol>
      <p class="note">注意: APIキーは「sk-」で始まります。このキーは秘密にしておき、公開リポジトリにコミットしないでください。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiKeySettings',
  data() {
    return {
      showSecurityDetails: false
    };
  },
  methods: {
    toggleSecurityDetails() {
      this.showSecurityDetails = !this.showSecurityDetails;
    }
  }
};
</script>

<style scoped>
.api-key-settings {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

.description {
  margin-bottom: 20px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.required {
  color: #e74c3c;
}

.hint {
  margin-top: 5px;
  font-size: 0.85em;
  color: #7f8c8d;
}

.input-with-button {
  display: flex;
}

.input-with-button input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.toggle-visibility {
  padding: 0 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.buttons {
  margin-top: 30px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
}

.security-info, .api-key-instructions {
  margin-top: 40px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.security-info h3, .api-key-instructions h3 {
  margin-top: 0;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-details {
  background-color: #e7f3ff;
  border: 1px solid #b8daff;
  color: #0056b3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.toggle-details:hover {
  background-color: #cce5ff;
}

.security-info ul, .api-key-instructions ol {
  padding-left: 20px;
}

.security-info li, .api-key-instructions li {
  margin-bottom: 8px;
  color: #555;
}

.api-key-instructions a {
  color: #4caf50;
  text-decoration: none;
}

.api-key-instructions a:hover {
  text-decoration: underline;
}

.note {
  margin-top: 15px;
  font-style: italic;
  color: #e74c3c;
}

.technical-details {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.technical-details h4 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1rem;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h5 {
  margin-top: 15px;
  margin-bottom: 8px;
  color: #2c3e50;
  font-size: 0.95rem;
}

.flow-diagram-text {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
  text-align: center;
  margin: 15px 0;
  font-family: monospace;
  white-space: pre-wrap;
  line-height: 1.5;
}
</style> 