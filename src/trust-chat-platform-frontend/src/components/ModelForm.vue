<template>
  <div class="model-form">
    <div class="form-group">
      <label for="name">Model Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        placeholder="e.g. GPT-4o"
        @input="updateForm"
      />
    </div>

    <div class="form-group">
      <label for="character_name">Character Name (Optional)</label>
      <input
        id="character_name"
        v-model="form.character_name"
        type="text"
        placeholder="e.g. Helpful Assistant"
        @input="updateForm"
      />
    </div>

    <div class="form-group">
      <label for="base_model">Base Model</label>
      <select id="base_model" v-model="form.base_model" @change="updateForm">
        <option value="gpt4o-mini">GPT-4o Mini</option>
        <option value="gpt4o">GPT-4o</option>
        <option value="claude-3-opus">Claude 3 Opus</option>
        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
        <option value="claude-3-haiku">Claude 3 Haiku</option>
        <option value="llama-3">Llama 3</option>
        <option value="mistral-large">Mistral Large</option>
        <option value="custom">Custom</option>
      </select>
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="form.description"
        placeholder="Describe your AI character..."
        @input="updateForm"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="provider">Provider</label>
      <input
        id="provider"
        v-model="form.provider"
        type="text"
        placeholder="e.g. Your Organization"
        @input="updateForm"
      />
    </div>

    <div class="form-group">
      <label for="api_endpoint">API Endpoint</label>
      <input
        id="api_endpoint"
        v-model="form.api_endpoint"
        type="text"
        placeholder="e.g. https://api.example.com/v1/chat"
        @input="updateForm"
      />
    </div>

    <div class="form-group">
      <label for="system_prompt">System Prompt</label>
      <textarea
        id="system_prompt"
        v-model="form.system_prompt"
        placeholder="Instructions for the AI character..."
        @input="updateForm"
      ></textarea>
    </div>

    <button @click="$emit('deploy')" class="deploy-btn">Deploy AI Character</button>
  </div>
</template>

<script>
export default {
  name: 'ModelForm',
  props: {
    modelForm: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: { ...this.modelForm }
    };
  },
  methods: {
    updateForm() {
      this.$emit('update:model-form', { ...this.form });
    }
  },
  watch: {
    modelForm: {
      handler(newValue) {
        this.form = { ...newValue };
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.model-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
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
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.deploy-btn {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s;
}

.deploy-btn:hover {
  background-color: #45a049;
}
</style> 