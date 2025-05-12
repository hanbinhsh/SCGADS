<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <!-- 桌面端侧边栏 -->
    <el-aside class="sidebar animate__animated animate__fadeInLeft" v-if="!isMobile" :width="isCollapsed ? '64px' : '150px'">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon :class="{ 'rotate-180': isCollapsed }">
          <ArrowLeft />
        </el-icon>
      </div>
      
      <el-menu 
        :default-active="activeTask" 
        class="task-menu" 
        @select="handleTaskSelect"
        mode="vertical"
        :collapse="isCollapsed">
        <el-menu-item index="annotation">
          <el-icon><Edit /></el-icon>
          <span>{{ $t('uploadPage.Annotation') }}</span>
        </el-menu-item>
        <el-menu-item index="training">
          <el-icon><Cpu /></el-icon>
          <span>{{ $t('uploadPage.Training') }}</span>
        </el-menu-item>
        <el-menu-item index="denoising">
          <el-icon><Filter /></el-icon>
          <span>{{ $t('uploadPage.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <!-- 移动端侧边栏（顶部水平菜单） -->
    <el-header class="mobile-nav animate__animated animate__fadeInDown" v-if="isMobile">
      <el-menu 
        :default-active="activeTask" 
        class="task-menu" 
        @select="handleTaskSelect"
        mode="horizontal">
        <el-menu-item index="annotation">
          <el-icon><Edit /></el-icon>
          <span>{{ $t('uploadPage.Annotation') }}</span>
        </el-menu-item>
        <el-menu-item index="training">
          <el-icon><Cpu /></el-icon>
          <span>{{ $t('uploadPage.Training') }}</span>
        </el-menu-item>
        <el-menu-item index="denoising">
          <el-icon><Filter /></el-icon>
          <span>{{ $t('uploadPage.Denoising') }}</span>
        </el-menu-item>
      </el-menu>
    </el-header>

    <el-main class="fullscreen-section" v-loading="loading">
      <!-- 注释页面 -->
      <div class="left-container">
        <el-row :gutter="20">
          <!-- 左侧：文件上传 -->
          <el-col :xs="24" :sm="24" :md="14" :lg="14" :xl="14">
            <el-card class="upload-card animate__animated animate__fadeInLeft">
              <el-row :gutter="20" id="upload-row">
                <el-col 
                  :xs="24" 
                  :sm="(activeTask === 'denoising' || (selectedModel.modelType !== 'multi' && activeTask === 'annotation')) ? 24 : 12" 
                  :md="(activeTask === 'denoising' || (selectedModel.modelType !== 'multi' && activeTask === 'annotation')) ? 24 : activeTask === 'training' ? (selectedModel.modelType !== 'multi'? 12:8) : 12"
                >
                  <el-upload v-model:file-list="scRNASeqFile" class="upload" drag action="" :limit="1" :auto-upload="false">
                    <el-icon class="el-icon--upload">
                      <UploadFilled />
                    </el-icon>
                    <div class="el-upload__text">{{ $t('uploadPage.Dropfilehereor') }}<em>{{ $t('uploadPage.clicktoupload') }}</em></div>
                    <template #tip>
                      <div class="el-upload__tip" v-if="(activeTask === 'training' || activeTask === 'annotation') && selectedModel.modelType === 'multi'">
                        {{ $t('uploadPage.Upload') }} scRNA-seq {{ $t('uploadPage.file') }} (.h5/.h5ad/.npy)
                      </div>
                      <div class="el-upload__tip" v-else>
                        {{ $t('uploadPage.Upload') }} sc-seq {{ $t('uploadPage.file') }} (.h5/.h5ad/.npy)
                      </div>
                    </template>
                  </el-upload>
                </el-col>

                <el-col 
                  :xs="24" 
                  :sm="activeTask === 'training' ? 12 : 12" 
                  :md="activeTask === 'training' ? 8 : 12" 
                  v-if="selectedModel.modelType === 'multi' && (activeTask === 'training' || activeTask === 'annotation')"
                >
                  <el-upload v-model:file-list="scATACSeqFile" class="upload" drag action="" :limit="1" :auto-upload="false">
                    <el-icon class="el-icon--upload">
                      <UploadFilled />
                    </el-icon>
                    <div class="el-upload__text">{{ $t('uploadPage.Dropfilehereor') }}<em>{{ $t('uploadPage.clicktoupload') }}</em></div>
                    <template #tip>
                      <div class="el-upload__tip">{{ $t('uploadPage.Upload') }} scATAC-seq {{ $t('uploadPage.file') }} (.h5/.h5ad/.npy)</div>
                    </template>
                  </el-upload>
                </el-col>

                <el-col 
                  :xs="24" 
                  :sm="12" 
                  :md="selectedModel.modelType !== 'multi'? 12 : 8" 
                  v-if="activeTask === 'training'"
                >
                  <el-upload v-model:file-list="tagFile" class="upload" drag action="" :limit="1" :auto-upload="false">
                    <el-icon class="el-icon--upload">
                      <UploadFilled />
                    </el-icon>
                    <div class="el-upload__text">{{ $t('uploadPage.Dropfilehereor') }}<em>{{ $t('uploadPage.clicktoupload') }}</em></div>
                    <template #tip>
                      <div class="el-upload__tip">{{ $t('uploadPage.Upload') }} {{ $t('uploadPage.Tag') }} {{ $t('uploadPage.file') }} (.csv/.npy)</div>
                    </template>
                  </el-upload>
                </el-col>
              </el-row>
              <!-- 模型图 -->
              <el-row justify="center" class="image-container" id="image-row">
                <img :src="figure" alt="Model" class="example-image" />
              </el-row>
            </el-card>
          </el-col>

          <!-- 右侧：参数设置 -->
          <el-col :xs="24" :sm="24" :md="10" :lg="10" :xl="10">
            <el-card class="form-card animate__animated animate__fadeInRight" style="height: auto;" id="model-select">
              <el-form label-width="40%">
                <!-- 模型选择 -->
                <el-form-item :label="$t('uploadPage.ModelSelect')">
                  <el-select v-model="parameters.model" @change="selectModel(parameters.model)" placeholder="Select Model" class="full-width">
                    <el-option v-for="model in filteredModels" :key="model.modelName" :label="model.modelName" :value="model.modelName" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
            <el-card class="form-card animate__animated animate__fadeInRight" id="parameters">
              <el-form label-width="40%">
                <!-- 参数输入框 -->
                <el-alert type="info" show-icon :closable="false" v-if="activeTask === 'annotation'">
                  <p>{{ $t('uploadPage.annoAlart') }}</p>
                </el-alert>
                <br v-if="activeTask === 'annotation'">
                <el-form-item v-for="(value, key) in parameterDefaults" :key="key" :label="key">
                  <el-input v-model.number="parameters[key]" :placeholder="value.toString()" class="full-width" />
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 按钮行 -->
      <div class="footer animate__animated animate__fadeInUp">
        <div class="footer-button-row">
          <el-button type="primary" class="footer-action-button" @click="open = true" ref="ref3">{{ $t('uploadPage.Tutorial') }}</el-button>
          <el-button type="warning" class="footer-action-button" @click="handleResetClick">{{ $t('Reset') }}</el-button>
          <el-button type="success" class="footer-action-button" @click="handleUploadClick" id="upload">{{ $t('uploadPage.Upload') }}</el-button>
        </div>
      </div>
    </el-main>
  </div>

  <!-- Element Plus 的引导教程 -->
  <el-tour v-model="open">
    <el-tour-step target="#model-select" :title="$t('uploadPage.ModelSelect')"     :description="$t('uploadPage.Selectmodelhere')" />
    <el-tour-step target="#image-row"    :title="$t('uploadPage.Model')"           :description="$t('uploadPage.Checkthemodelfigure')" />
    <el-tour-step target="#upload-row"   :title="$t('uploadPage.UploadFile')"      :description="$t('uploadPage.Putyourfileshere')" />
    <el-tour-step target="#parameters"   :title="$t('uploadPage.InputParameters')" :description="$t('uploadPage.Inputparametersifnecessary')" />
    <el-tour-step target="#upload"       :title="$t('uploadPage.Upload')"          :description="$t('uploadPage.Clicktoupload')" />
    <el-tour-step target="#WorkSpase"    :title="$t('uploadPage.Results')"         :description="$t('uploadPage.Resultswillbeshownhere')" />
  </el-tour>

  <!-- 任务名输入框 -->
  <el-dialog v-model="showTaskNameDialog" title="Enter Task Name" @close="resetDialog" width="500" max-width="500px" align-center>
    <el-input v-model="taskName" placeholder="Please enter the task name"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showTaskNameDialog = false">{{ $t('Cancel') }}</el-button>
        <el-button type="primary" @click="submitTaskName">{{ $t('Confirm') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
// import
import MainHeader from "../components/MainHeader.vue";
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: "UploadPage",
  components: {
    MainHeader,
  },
  mounted() {
    this.fetchModels()
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
  },
  data() {
    return {
      scRNASeqFile: [], // 存储 scRNA-seq 文件的数组  
      scATACSeqFile: [], // 存储 scATAC-seq 文件的数组  
      tagFile: [], // 存储 Tag 文件的数组
      open: false,
      showTaskNameDialog: false, // 控制任务名输入框显示状态
      taskName: "", // 存储任务名称
      models: [],  // 存储数据库中的模型数据
      figure: '', // 选中的模型图片
      parameters: [], // 选中的模型参数
      parameterDefaults: {}, // 默认参数
      selectedModel: '',
      loading:false,
      activeTask: 'annotation', // 默认选中的任务
      isCollapsed: false,
    };
  },
  methods: {
    handleTaskSelect(task) {
      this.activeTask = task;
    },
    async fetchModels() {
      try {
        this.loading = true;
        const response = await axios.get('/api/models/findAllModels'); // 调用后端API
        this.models = response.data;

        // 设置默认选中的模型
        if (this.models.length > 0) {
          this.selectModel(this.models[0].modelName);
        }
        this.loading = false;
      } catch (error) {
        console.error("Failed to fetch models:", error);
      }
    },
    async selectModel(modelName) {
      const selectedModel = this.models.find(m => m.modelName === modelName);
      this.selectedModel = selectedModel;
      if (selectedModel) {
        // 解析 defaultParameters 字符串
        const paramObj = {};
        selectedModel.defaultParameters.split(',').forEach(param => {
          const [key, value] = param.split(':');
          paramObj[key.trim()] = isNaN(value) ? value.trim() : parseFloat(value);
        });
        const base64Image = `data:image/png;base64,${selectedModel.figureByte}`;  // 这里假设返回的是base64编码的图像字节流
        this.figure = base64Image;
        this.parameters = { model: modelName, ...paramObj };
        this.parameterDefaults = paramObj;
      }
    },
    handleResetClick() {
      this.tagFile = [];
      this.scATACSeqFile = [];
      this.scRNASeqFile = [];
      ElMessage.success('Reset success.');
    },
    handleUploadClick() {
      // 检查文件是否为空或类型不正确
      // single(单模态注释) multi(双模态注释) eno(降噪)
      // TODO 下拉框增加一级菜单显示是什么类型的模型
      // 此处单模态模型仅上传一种模态的数据
      //        单模态    多模态    降噪
      // 注释   R/A       R+A      /
      // 训练   R/A+T     R+A+T    /
      // 降噪   /         /        R/A
      
      let requiresScRNASeq = false;
      let requiresScATACSeq = false;
      let requiresTagFile = false;
      const isScRNASeqFileValid = this.scRNASeqFile.length > 0 && this.scRNASeqFile.every(file => file.name.endsWith('.h5') || file.name.endsWith('.h5ad') || file.name.endsWith('.npy'));
      const isScATACSeqFileValid = this.scATACSeqFile.length > 0 && this.scATACSeqFile.every(file => file.name.endsWith('.h5') || file.name.endsWith('.h5ad') || file.name.endsWith('.npy'));
      const isTagFileValid = this.tagFile.length > 0 && this.tagFile.every(file => file.name.endsWith('.npy') || file.name.endsWith('.csv'));

      let isValid = false;
      let errorMessage = '';

      if (this.activeTask === 'annotation') {
        if (this.selectedModel.modelType === 'single') {
          requiresScRNASeq = true;// 此处不检查是rna或者atac文件
          isValid = (this.scRNASeqFile.length > 0);
          errorMessage = 'For single-modality annotation, please upload either sc-RNAseq File or sc-ATACseq File.';
        } else if (this.selectedModel.modelType === 'multi') {
          requiresScRNASeq = true; requiresScATACSeq = true;
          isValid = (this.scRNASeqFile.length > 0 && this.scATACSeqFile.length > 0);
          errorMessage = 'For multi-modality annotation, please upload both sc-RNAseq File and sc-ATACseq File.';
        }
      } 
      else if (this.activeTask === 'training') {
        if (this.selectedModel.modelType === 'single') {
          requiresScRNASeq = true; requiresTagFile = true;
          isValid = (this.scRNASeqFile.length > 0) && this.tagFile.length > 0;
          errorMessage = 'For single-modality training, please upload sc-RNAseq File or sc-ATACseq File and Tag File.';
        } else if (this.selectedModel.modelType === 'multi') {
          requiresScRNASeq = true; requiresScATACSeq = true; requiresTagFile = true;
          isValid = (this.scRNASeqFile.length > 0 && this.scATACSeqFile.length > 0) && this.tagFile.length > 0;
          errorMessage = 'For multi-modality training, please upload sc-RNAseq File, sc-ATACseq File, and Tag File.';
        }
      } 
      else if (this.activeTask === 'denoising') {
        isValid = (this.scRNASeqFile.length > 0) && this.tagFile.length === 0;
        requiresScRNASeq = true;
        errorMessage = 'For denoising, please upload either sc-RNAseq File or sc-ATACseq File, but not Tag File.';
      }

      if (!isValid) {
        ElMessage.error(errorMessage);
        return;
      }

      if ((requiresScRNASeq&&!isScRNASeqFileValid) || (requiresScATACSeq&&!isScATACSeqFileValid) || (requiresTagFile&&!isTagFileValid)) {
        ElMessage.error('Incorrect file type. Please upload the correct file types.');
        return;
      }

      // 所有检查通过，显示任务名称输入框
      this.showTaskNameDialog = true;
    },
    async submitTaskName() {
      if (!this.taskName) {
        ElMessage.error('Task name cannot be empty!');
        return;
      }

      // 调用接口检查任务名称是否存在
      const response = await axios.post('/api/checkExistsTaskByTaskName?taskName=' + this.taskName);
      if (response.data.code === 1) {
        // 如果任务名称可用，继续上传文件
        this.UploadFiles();
      } else {
        ElMessage.error('This task name already exists, please enter another name.');
      }
    },
    resetDialog() {
      this.taskName = "";
    },
    async UploadFiles() {
      this.loading = true;
      const userId = JSON.parse(sessionStorage.getItem('userData')).userId;
      const paramString = Object.entries(this.parameters)
        .filter(([key]) => key !== 'model') // 过滤掉 model 属性
        .map(([name, value]) => {
          // 处理值：数字直接使用，其他类型转为字符串
          const formattedValue = typeof value === 'number' ? value : value.toString();
          return `${name}:${formattedValue}`;
        })
        .join(','); // 用逗号拼接
      const task = {
        taskName: this.taskName,
        details : '',
        uploaderId : userId,
        type : this.activeTask + ':' +this.selectedModel.modelType,
        parameters : paramString,
        modelId : this.selectedModel.modelId,
      }
      const response = await axios.post('/api/insertTask', task);
      console.log(response);

      if (response.data.code === 1) {
        await axios.post('/api/insertFile', { taskName: this.taskName });

        const files = [
          { file: this.scRNASeqFile[0]?.raw, fileType: 'scRNASeqFile' },
          { file: this.scATACSeqFile[0]?.raw, fileType: 'scATACSeqFile' },
          { file: this.tagFile[0]?.raw, fileType: 'tagFile' }
        ];
        const uploadPromises = files.map( async ({ file, fileType }) => {
          if (!(file instanceof Blob)) return;
          // 获取固定的AES密钥和IV
          const { aesKey, iv } = await this.getFixedEncryptionKeys();
          // 读取文件并计算MD5
          const arrayBuffer = await file.arrayBuffer();
          const spark = new SparkMD5.ArrayBuffer();
          spark.append(arrayBuffer);
          const hash = spark.end();

          // 加密文件
          const encryptedData = await this.aesEncrypt(arrayBuffer, aesKey, iv);

          // 创建FormData并附加加密的文件和相关信息
          const encryptedFile = new Blob([encryptedData]);
          const formData = new FormData();
          // const taskName = this.taskName;
          formData.append('file', encryptedFile);
          formData.append('taskName', this.taskName);
          formData.append('fileType', fileType);
          formData.append('hash', hash);
          // 发送请求上传加密文件
          return axios.post('/api/uploadOneFile', formData);
        });

        await Promise.all(uploadPromises);

        this.showTaskNameDialog = false; // 成功上传后关闭对话框
        this.loading = false;
        ElMessage.success('Task created successfully.');
        this.tagFile = [];
        this.scATACSeqFile = [];
        this.scRNASeqFile = [];
      }
    },
    // 获取固定的AES密钥和IV
    async getFixedEncryptionKeys() {
      try {
        // 发送请求到后端接口以获取密钥和IV
        const response = await axios.post('/api/getEncryptionKeys');
        const { aesKeyHex, ivHex } = response.data; // 注意字段名改为Hex后缀
        // console.log('AES Key (Hex):', aesKeyHex);
        // console.log('IV (Hex):', ivHex);
        // 将Hex字符串转换为Uint8Array
        const aesKeyBytes = this.hexToBytes(aesKeyHex);
        const ivBytes = this.hexToBytes(ivHex);
        // 导入密钥
        const aesKey = await crypto.subtle.importKey(
          'raw',
          aesKeyBytes,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        return { aesKey, iv: ivBytes };
      } catch (error) {
        // 处理错误情况
        console.error('Error fetching encryption keys:', error);
        throw error; // 或者根据需要处理错误
      }
    },
    hexToBytes(hex) {
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
      }
      return bytes;
    },
    // AES加密函数
    async aesEncrypt(data, key, iv) {
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );
      return encryptedData;
    },
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      // Store sidebar state in localStorage for persistence
      localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    }
  },
  computed: {
    filteredModels() {
      return this.models.filter(model => {
        if (this.activeTask === "annotation") {
          return model.modelType === "single" || model.modelType === "multi";
        }
        if (this.activeTask === "training") {
          return model.modelType === "single" || model.modelType === "multi";
        }
        if (this.activeTask === "denoising") {
          return model.modelType === "deno";
        }
        return false;
      });
    }
  },
  watch: {
    activeTask() {
      // 检查当前选中的 model 是否仍然在 filteredModels 里
      if (!this.filteredModels.some(model => model.modelName === this.parameters.model)) {
        // 选中新的 filteredModels 的第一个模型
        this.parameters.model = this.filteredModels.length > 0 ? this.filteredModels[0].modelName : null;
        this.selectModel(this.parameters.model)
      }
    }
  }
};
</script>

<script setup>
import { UploadFilled } from "@element-plus/icons-vue";
import { ref, onMounted, onUnmounted } from 'vue'; 
import SparkMD5 from "spark-md5";

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
/* 容器样式 */
.left-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding-top: 20px;
}

/* 卡片样式 */
.upload-card, .form-card {
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.upload-card:hover, .form-card:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

/* 上传框样式 */
.upload {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  height: 80%;
}

.upload:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.dark-mode .upload:hover {
  background-color: #333;
}

/* 全宽组件 */
.full-width {
  width: 100%;
}

@media (max-width: 768px) {
  .fullscreen-section{
    padding: 10px;
    margin-top: 0;
  }
}
</style>