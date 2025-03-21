<template>
  <div class="model-card" :class="{ selected }">
    <div class="model-header">
      <h3>{{ model.character_name || model.name }}</h3>
      <span class="base-model-badge">{{ model.base_model || "Unknown Model" }}</span>
    </div>
    <p class="model-description">{{ model.description }}</p>
    <div class="model-provider">Provider: {{ model.provider }}</div>
    <div class="model-trust">
      <span class="trust-label">Trust Score:</span>
      <div class="trust-score">{{ model.trust_score || '7' }}/10</div>
    </div>
    <div class="button-group">
      <button @click="$emit('select', model)" class="select-btn">
        Chat with {{ model.character_name || model.name }}
      </button>
      <button v-if="showEdit" @click="$emit('edit', model)" class="edit-btn">Edit</button>
      <button @click="$emit('verify', model)" class="verify-btn">Verify</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelCard',
  props: {
    model: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    showEdit: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.model-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.model-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.model-card.selected {
  border-color: #4caf50;
  background-color: #f0f7f0;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.model-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.base-model-badge {
  background-color: #e0e0e0;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  color: #555;
}

.model-description {
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #555;
  flex-grow: 1;
}

.model-provider {
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.model-trust {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.trust-label {
  margin-right: 10px;
  font-size: 0.9rem;
}

.trust-score {
  background-color: #4caf50;
  color: white;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
}

.button-group {
  display: flex;
  gap: 10px;
}

.select-btn, .edit-btn, .verify-btn {
  flex: 1;
  padding: 8px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #2196F3;
}

.verify-btn {
  background-color: #f39c12;
}

.select-btn:hover {
  background-color: #45a049;
}

.edit-btn:hover {
  background-color: #0b7dda;
}

.verify-btn:hover {
  background-color: #e67e22;
}
</style> 