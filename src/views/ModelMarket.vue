<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <!-- Desktop Sidebar -->
    <el-aside class="sidebar animate__animated animate__fadeInLeft" v-if="!isMobile" :width="isCollapsed ? '64px' : '150px'">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon :class="{ 'rotate-180': isCollapsed }">
          <ArrowLeft />
        </el-icon>
      </div>
      
      <el-menu 
        :default-active="activeModelType" 
        class="model-menu" 
        @select="handleModelTypeSelect"
        mode="vertical"
        :collapse="isCollapsed">
        <el-menu-item index="single">
          <el-icon><Document /></el-icon>
          <span>{{ $t('modelPage.SingleModality') }}</span>
        </el-menu-item>
        <el-menu-item index="multi">
          <el-icon><Files /></el-icon>
          <span>{{ $t('modelPage.MultiModality') }}</span>
        </el-menu-item>
        <el-menu-item index="deno">
          <el-icon><Filter /></el-icon>
          <span>{{ $t('modelPage.Denoising') }}</span>
        </el-menu-item>
        <el-menu-item index="myModels">
          <el-icon><User /></el-icon>
          <span>{{ $t('modelPage.MyModels') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Mobile Navigation (Top Horizontal Menu) -->
    <el-header class="mobile-nav animate__animated animate__fadeInDown" v-if="isMobile">
      <el-menu 
        :default-active="activeModelType" 
        class="model-menu" 
        @select="handleModelTypeSelect"
        mode="horizontal">
        <el-menu-item index="single">
          <el-icon><Document /></el-icon>
          <span>{{ $t('modelPage.SingleModality') }}</span>
        </el-menu-item>
        <el-menu-item index="multi">
          <el-icon><Files /></el-icon>
          <span>{{ $t('modelPage.MultiModality') }}</span>
        </el-menu-item>
        <el-menu-item index="deno">
          <el-icon><Filter /></el-icon>
          <span>{{ $t('modelPage.Denoising') }}</span>
        </el-menu-item>
        <el-menu-item index="myModels">
          <el-icon><User /></el-icon>
          <span>{{ $t('modelPage.MyModels') }}</span>
        </el-menu-item>
      </el-menu>
    </el-header>

    <el-main class="fullscreen-section" v-loading="loading">
      <div class="model-container">
        <!-- Page Title and Action Buttons -->
        <div class="page-header animate__animated animate__fadeInDown">
          <h2>{{ getPageTitle() }}</h2>
        </div>

        <!-- Models Grid -->
        <el-row :gutter="20" class="models-grid">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6" v-for="model in filteredModels" :key="model.modelId" class="model-col">
            <el-card class="model-card animate__animated animate__fadeIn" :body-style="{ padding: '0px' }">
              <div class="model-image-container">
                <img :src="`data:image/png;base64,${model.figureByte}`" class="model-image" alt="Model Figure" />
              </div>
              <div class="model-info">
                <h3>{{ model.modelName }}</h3>
                <p class="model-type">{{ model.pretrainModel ? $t('modelPage.Pretrain')+"-" : "" }}{{ getModelTypeLabel(model.modelType) }}</p>
                <p class="model-description">{{ truncateText(model.remark, 100) }}</p>
                <div class="model-actions">
                  <el-button type="primary" size="small" @click="viewModelDetails(model)">
                    <el-icon><View /></el-icon>
                    {{ $t('modelPage.View') }}
                  </el-button>
                  <el-button 
                    type="warning" 
                    size="small" 
                    @click="editModel(model)" 
                    :disabled="!isUserModel(model)"
                    v-if="activeModelType === 'myModels' || isUserModel(model)">
                    <el-icon><Edit /></el-icon>
                    {{ $t('modelPage.Edit') }}
                  </el-button>
                  <el-button type="success" size="small" @click="viewModelImage(model)">
                    <el-icon><View /></el-icon>
                    {{ $t('modelPage.Image') }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Empty State -->
        <div v-if="filteredModels.length === 0" class="empty-state animate__animated animate__fadeIn">
          <el-empty :description="$t('modelPage.NoModelsFound')">
            <el-button type="primary" @click="goToUpload">{{ $t('modelPage.UploadModel') }}</el-button>
          </el-empty>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" v-if="filteredModels.length > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[8, 12, 24, 36]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalModels"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="footer animate__animated animate__fadeInUp">
        <div class="footer-button-row">
          <el-input
              v-model="searchQuery"
              :placeholder="$t('modelPage.SearchModels')"
              prefix-icon="Search"
              clearable
              @clear="handleSearch"
              @input="handleSearch"
              class="search-input"
            />&nbsp;&nbsp;&nbsp;
            <el-button type="primary" @click="goToUpload">
              <el-icon><Upload /></el-icon>
              {{ $t('modelPage.UploadModel') }}
            </el-button>
        </div>
      </div>
    </el-main>
  </div>

  <el-dialog v-model="showModelImage" :title="selectedData.modelName" width="550px" align-center>
    <div class="model-details-image">
      <img :src="`data:image/png;base64,${selectedData.figureByte}`" alt="Model Figure" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showModelImage = false">{{ $t('Close') }}</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- Model Details Dialog -->
  <el-dialog v-model="showModelDetails" :title="selectedData.modelName" width="550px" align-center>
    <div class="model-details-info" style="width: 100%;">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Model Type">
          <el-tag :type="selectedData.modelType === 'single' ? 'success' : selectedData.modelType === 'multi' ? 'warning' : 'info'">
            {{ selectedData.modelType === 'single' ? 'Single-omic Annotation' : 
              selectedData.modelType === 'multi' ? 'Multi-omics Annotation' : 'Denoising' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Pretrain Model">
          <el-tag :type="selectedData.pretrainModel == true ? 'success' : 'warning'">
            {{ selectedData.pretrainModel == true ? 'Yes' : 'No' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.user_name')">{{ selectedData.userName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.company_name')">{{ selectedData.companyName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.created_time')">{{ selectedData.createdTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('modelPage.Remark')">{{ selectedData.remark }}</el-descriptions-item>
        <el-descriptions-item :label="$t('modelPage.DefaultParameters')">
          <el-scrollbar max-height="150px">
            <el-row v-for="(param, index) in (selectedData.defaultParameters || '').split(',')" :key="index">
              <el-col :span="24">
                <el-tag type="info" class="param-tag">
                  {{ param.trim() }}
                </el-tag>
              </el-col>
            </el-row>
          </el-scrollbar>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showModelDetails = false">{{ $t('Close') }}</el-button>
        <el-button 
          type="warning" 
          @click="editModel(selectedData)" 
          :disabled="!isUserModel(selectedData)" 
          v-if="isUserModel(selectedData)">
          {{ $t('modelPage.Edit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 修改对话框 -->
  <el-dialog v-model="showEditDialog" title="Edit Model" width="500px" align-center>
    <!-- 添加提示信息 -->
    <el-form :model="selectedData" label-width="120px" label-position="left">
      <div style="display: flex; gap: 20px;">
        <!-- 左侧：现有输入框 -->
        <div style="flex: 1;">
          <el-form-item label="Model Name">
            <el-input v-model="selectedData.modelName" disabled></el-input>
          </el-form-item>
          <el-form-item label="Remark">
            <el-input v-model="selectedData.remark"></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showEditDialog = false">{{ $t('Cancel') }}</el-button>
        <el-button type="danger" @click="showDeleteDialog = true;">{{ $t('Delete') }}</el-button>
        <el-button type="primary" @click="modelEditingSave()">{{ $t('Save') }}</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 删除确认对话框 -->
  <el-dialog v-model="showDeleteDialog" title="Warning" width="500" align-center>
    <span>Model <strong style="color: #e74c3c;">{{ selectedData.modelName }}</strong> will be deleted</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showDeleteDialog = false">Cancel</el-button>
        <el-button type="danger" @click="showDeleteDialog = false; deleteData(selectedData.modelId)">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: "ModelManagementPage",
  components: {
    MainHeader,
  },
  mounted() {
    this.fetchModels();
    const savedState = localStorage.getItem('modelSidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
  },
  data() {
    return {
      // Page state
      open: false,
      loading: false,
      isCollapsed: false,
      isMobile: false,
      
      // Model data
      models: [],
      filteredModels: [],
      activeModelType: 'single',
      searchQuery: '',
      currentPage: 1,
      pageSize: 8,
      totalModels: 0,
      
      // Dialogs
      showModelDetails: false,
      showEditDialog: false,
      showModelImage: false,
      showDeleteDialog: false,
      
      // 模型编辑
      selectedData: {},
      
      // Form validation rules
      modelFormRules: {
        modelName: [
          { required: true, message: 'Please input model name', trigger: 'blur' },
          { min: 3, max: 50, message: 'Length should be 3 to 50 characters', trigger: 'blur' }
        ],
        modelType: [
          { required: true, message: 'Please select model type', trigger: 'change' }
        ],
        remark: [
          { required: true, message: 'Please input model description', trigger: 'blur' }
        ],
        defaultParameters: [
          { required: true, message: 'Please input default parameters', trigger: 'blur' }
        ]
      },
      
      // Preview image
      previewImage: ''
    };
  },
  methods: {
    // 模型修改
    editModel(model) {
      if (!this.isUserModel(model)) {
        ElMessage.warning('You can only edit your own models');
        return;
      }
      this.selectedData = model;
      this.showEditDialog = true;
    },
    async modelEditingSave() {
      const formData = new FormData();
      const data = this.selectedData;
      formData.append('modelId', data.modelId);
      formData.append('remark', data.remark);
      const response = await axios.post('api/models/updateModelRemark', formData);
      if (response.data.code === 1) {
        ElMessage({
          message: 'Model update successfully',
          type: 'success',
        });
      } else {
        ElMessage({
          message: 'Failed to update Model',
          type: 'error',
        });
      }
      this.showEditDialog = false;
      this.fetchModels();
    },

    async deleteData(dataId) {
      try {
        const response = await axios.delete(`/api/models/deleteModel?modelId=${dataId}`);
        if (response.data.code === 1) {
          ElMessage.success('Model deleted successfully');
          this.fetchModels();
        } else {
          console.error('Failed to delete:', response.data.msg);
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
      this.showDeleteDialog = false;
      this.showEditDialog = false;
    },

    goToUpload() {
      this.$router.push('/upload');
    },

    // Sidebar methods
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // Store sidebar state in localStorage for persistence
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    },
    
    // Navigation and filtering
    handleModelTypeSelect(type) {
      this.activeModelType = type;
      this.currentPage = 1;
      this.filterModels();
    },
    
    // Fetch models from API
    async fetchModels() {
      try {
        this.loading = true;
        const response = await axios.get('/api/models/findAllModels');
        this.models = response.data;
        this.filterModels();
        this.loading = false;
      } catch (error) {
        console.error("Failed to fetch models:", error);
        ElMessage.error('Failed to load models');
        this.loading = false;
      }
    },
    
    // Filter models based on selected type and search query
    filterModels() {
      let result = [...this.models];
      
      // Filter by model type
      if (this.activeModelType === 'myModels') {
        const userData = JSON.parse(sessionStorage.getItem('userData'));
        if (userData) {
          result = result.filter(model => model.userName === userData.userName);
        } else {
          result = [];
        }
      } else {
        result = result.filter(model => model.modelType === this.activeModelType);
      }
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(model => 
          model.modelName?.toLowerCase().includes(query) ||
          model.remark?.toLowerCase().includes(query)
        );
      }
      
      this.totalModels = result.length;
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      this.filteredModels = result.slice(startIndex, endIndex);
    },
    
    // Handle search input
    handleSearch() {
      this.currentPage = 1;
      this.filterModels();
    },
    
    // Reset filters
    handleResetFilters() {
      this.searchQuery = '';
      this.currentPage = 1;
      this.filterModels();
      ElMessage.success('Filters reset successfully');
    },
    
    // Pagination methods
    handleSizeChange(val) {
      this.pageSize = val;
      this.filterModels();
    },
    
    handleCurrentChange(val) {
      this.currentPage = val;
      this.filterModels();
    },
    
    // View model details
    viewModelDetails(model) {
      this.selectedData = { ...model };
      this.showModelDetails = true;
    },

    viewModelImage(model) {
      this.selectedData = { ...model };
      this.showModelImage = true;
    },
    
    // Check if model belongs to current user
    isUserModel(model) {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      return userData && model.userName === userData.userName;
    },
    
    createPreviewImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    // Helper methods
    getPageTitle() {
      switch (this.activeModelType) {
        case 'single': 
          return this.$t('modelPage.SingleModalityModels');
        case 'multi': 
          return this.$t('modelPage.MultiModalityModels');
        case 'deno': 
          return this.$t('modelPage.DenoisingModels');
        case 'myModels': 
          return this.$t('modelPage.MyModels');
        default: 
          return this.$t('modelPage.Models');
      }
    },
    
    getModelTypeLabel(type) {
      switch (type) {
        case 'single': 
          return this.$t('modelPage.SingleModality');
        case 'multi': 
          return this.$t('modelPage.MultiModality');
        case 'deno': 
          return this.$t('modelPage.Denoising');
        default: 
          return type;
      }
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  },

};
</script>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { UploadFilled, Search, Upload, View, Edit, Document, Files, Filter, User, ArrowLeft } from "@element-plus/icons-vue";

const open = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
/* Sidebar */
.sidebar {
  position: relative;
}

/* Model container */
.model-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Page header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.dark-mode .page-header h2 {
  color: #fff;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

/* Models Grid */
.models-grid {
  margin-bottom: 24px;
}

.model-col {
  margin-bottom: 20px;
}

.model-card {
  height: 100%;
  transition: all 0.3s;
  overflow: hidden;
  border-radius: 8px;
}

.model-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.model-image-container {
  height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.model-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.model-card:hover .model-image {
  transform: scale(1.05);
}

.model-info {
  padding: 16px;
}

.model-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.dark-mode .model-info h3 {
  color: #fff;
}

.model-type {
  color: #409EFF;
  font-size: 14px;
  margin-bottom: 8px;
}

.model-description {
  color: #606266;
  font-size: 14px;
  margin-bottom: 16px;
  height: 60px;
  overflow: hidden;
}

.dark-mode .model-description {
  color: #eee;
}

.model-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 24px;
}

.model-details-image {
  flex: 0 0 40%;
  max-width: 550px;
}

.model-details-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.model-details-info h3 {
  margin-top: 0;
  font-size: 20px;
  margin-bottom: 16px;
}

/* Upload and Edit Forms */
.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.full-width {
  width: 100%;
}

.model-upload, .image-upload {
  width: 100%;
}

.current-image {
  margin-bottom: 16px;
}

.edit-preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

/* Responsive Adjustments */
@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input {
    width: calc(100% - 150px);
  }
  
  .model-image-container {
    height: 140px;
  }
  
  .model-details-image {
    max-width: 100%;
  }
  
  .dialog-footer {
    text-align: center;
  }

  .fullscreen-section{
    margin-top: 0px;
    margin-bottom: 20px;
  }
}

/* Element Plus Component Customizations */
.el-upload-dragger {
  width: 100%;
}

.el-dialog__body {
  padding: 20px 30px;
}

.dialog-footer {
  padding: 10px 0 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.param-tag {
  margin: 2px 0;
}

.el-scrollbar__view .el-row{
  margin-bottom: 0;
}
</style>