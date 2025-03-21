<template>
  <div class="home-container">
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </div>
    </div>

    <div v-if="activeTab === 'marketplace'" class="marketplace">
      <h2>AI Characters Marketplace</h2>
      <div v-if="loading" class="loading-indicator">
        Loading models...
      </div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="models.length === 0" class="empty-message">
        No models available in the marketplace.
      </div>
      <div v-else class="models-grid">
        <model-card
          v-for="model in models"
          :key="model.id"
          :model="model"
          :selected="selectedModel && selectedModel.id === model.id"
          @select="selectModel"
          @verify="verifyModelHandler"
        ></model-card>
      </div>
    </div>

    <div v-if="activeTab === 'my-models'" class="my-models">
      <h2>My AI Characters</h2>
      <div v-if="loadingMyModels" class="loading-indicator">
        Loading your models...
      </div>
      <p v-else-if="myModels.length === 0" class="empty-message">
        You haven't deployed any AI characters yet.
      </p>
      <div v-else class="models-grid">
        <model-card
          v-for="model in myModels"
          :key="model.id"
          :model="model"
          :selected="selectedModel && selectedModel.id === model.id"
          :show-edit="true"
          @select="selectModel"
          @edit="editModel"
          @verify="verifyModelHandler"
        ></model-card>
      </div>
    </div>

    <div v-if="activeTab === 'deploy'" class="deploy">
      <h2>Deploy New AI Character</h2>
      <model-form
        :model-form="modelForm"
        @update:model-form="updateModelForm"
        @deploy="deployModel"
      ></model-form>
    </div>
  </div>
</template>

<script>
import { listModels, selectModel } from "../api";
import ModelCard from "./ModelCard.vue";
import ModelForm from "./ModelForm.vue";

export default {
  name: "Home",
  components: {
    ModelCard,
    ModelForm
  },
  data() {
    return {
      activeTab: "marketplace",
      tabs: [
        { id: "marketplace", name: "Marketplace" },
        { id: "my-models", name: "My Models" },
        { id: "deploy", name: "Deploy New" }
      ],
      models: [],
      myModels: [],
      loading: true,
      loadingMyModels: true,
      error: null,
      selectedModel: null,
      modelForm: {
        name: "",
        character_name: "",
        base_model: "gpt4o",
        description: "",
        provider: "",
        api_endpoint: "",
        system_prompt: ""
      }
    };
  },
  inject: ["verifyModel"],
  async created() {
    await this.fetchModels();
    await this.fetchMyModels();
  },
  methods: {
    async fetchModels() {
      this.loading = true;
      this.error = null;
      try {
        this.models = await listModels();
      } catch (error) {
        this.error = "Failed to load models. Please try again later.";
        console.error("Error fetching models:", error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchMyModels() {
      this.loadingMyModels = true;
      try {
        // In a real app, this would fetch the user's deployed models
        // For now, we'll just use an empty array
        this.myModels = [];
      } catch (error) {
        console.error("Error fetching user models:", error);
      } finally {
        this.loadingMyModels = false;
      }
    },
    
    async selectModel(model) {
      this.selectedModel = model;
      try {
        await selectModel(model.id);
        this.$router.push(`/chat/${model.id}`);
      } catch (error) {
        console.error("Failed to select model:", error);
      }
    },
    
    verifyModelHandler(model) {
      this.verifyModel(model);
    },
    
    editModel(model) {
      // This would open an edit form for the model
      alert(`Editing model ${model.name} is not implemented in this demo.`);
    },
    
    updateModelForm(newForm) {
      this.modelForm = newForm;
    },
    
    deployModel() {
      // This would actually call the backend to deploy a new model
      alert(
        "Model deployment is not implemented in this demo. In a real implementation, this would deploy a new model canister."
      );
      console.log("Model to deploy:", this.modelForm);
    },
  },
};
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.tab:hover {
  background-color: #f5f5f5;
}

.tab.active {
  border-bottom: 2px solid #4caf50;
  font-weight: bold;
  color: #4caf50;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.loading-indicator, .error-message, .empty-message {
  text-align: center;
  padding: 30px;
  color: #666;
}

.error-message {
  color: #e74c3c;
}
</style>

