<template>
  <div :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
    <div class="message-content">
      <strong>{{ message.role === 'user' ? 'You' : characterName }}</strong>
      <p>{{ message.content }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMessage',
  props: {
    message: {
      type: Object,
      required: true
    },
    characterName: {
      type: String,
      default: 'AI Assistant'
    }
  }
};
</script>

<style scoped>
.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
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
</style> 