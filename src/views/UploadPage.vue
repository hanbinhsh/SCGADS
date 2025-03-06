<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <!-- 侧边栏 -->
    <el-aside class="sidebar">
      <el-menu :default-active="activeTask" class="task-menu" @select="handleTaskSelect">
        <el-menu-item index="annotation">
          <el-icon><Edit /></el-icon>
          <span>Annotation</span>
        </el-menu-item>
        <el-menu-item index="training">
          <el-icon><Cpu /></el-icon>
          <span>Training</span>
        </el-menu-item>
        <el-menu-item index="denoising">
          <el-icon><Filter /></el-icon>
          <span>Denoising</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <section class="fullscreen-section" v-loading="loading">
      <!-- 注释页面 -->
      <div class="left-container">
        <el-row :gutter="20">
          <!-- 左侧：文件上传 -->
          <el-col :span="14">
            <el-card class="upload-card">
              <el-row :gutter="20" id="upload-row">
                <el-col :span="(activeTask === 'denoising' || (selectedModel.modelType !== 'multi' && activeTask === 'annotation') ) ? 24 : activeTask === 'training' ? (selectedModel.modelType !== 'multi'? 12:8) : 12">
                  <el-upload v-model:file-list="scRNASeqFile" class="upload" drag action="" :limit="1" :auto-upload="false">
                    <el-icon class="el-icon--upload">
                      <UploadFilled />
                    </el-icon>
                    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                    <template #tip>
                      <div class="el-upload__tip" v-if="activeTask === 'training' || activeTask === 'annotation' ">
                        Upload scRNA-seq file (.h5/.h5ad/.npy)
                      </div>
                      <div class="el-upload__tip" v-if="activeTask === 'denoising'">
                        Upload sc-seq file (.h5/.h5ad/.npy)
                      </div>
                    </template>
                  </el-upload>
                </el-col>

                <el-col :span="activeTask ===  'training' ? 8 : 12" v-if="selectedModel.modelType === 'multi' && (activeTask === 'training' || activeTask === 'annotation')">
                  <el-upload v-model:file-list="scATACSeqFile" class="upload" drag action="" :limit="1" :auto-upload="false">
                    <el-icon class="el-icon--upload">
                      <UploadFilled />
                    </el-icon>
                    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                    <template #tip>
                      <div class="el-upload__tip">Upload scATAC-seq file (.h5/.h5ad/.npy)</div>
                    </template>
                  </el-upload>
                </el-col>

                <el-col :span="selectedModel.modelType !== 'multi'? 12 : 8" v-if="activeTask === 'training'">
                  <el-upload v-model:file-list="tagFile" class="upload" drag action="" :limit="1" :auto-upload="false">
                    <el-icon class="el-icon--upload">
                      <UploadFilled />
                    </el-icon>
                    <div class="el-upload__text">
                      Drop file here or <em>click to upload</em>
                    </div>
                    <template #tip>
                      <div class="el-upload__tip">Upload Tag file (.csv/.npy)</div>
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
          <el-col :span="10">
            <el-card class="form-card" style="height: 70px;">
              <el-form label-width="40%">
                <!-- 模型选择 -->
                <el-form-item label="Model Select">
                  <el-select v-model="parameters.model" @change="selectModel(parameters.model)" placeholder="Select Model" class="full-width">
                    <el-option v-for="model in models" :key="model.modelName" :label="model.modelName" :value="model.modelName" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-card>
            <el-card class="form-card">
              <el-form label-width="40%">
                <!-- 参数输入框 -->
                <el-alert type="info" show-icon :closable="false" v-if="activeTask === 'annotation'">
                  <p>Do not change the parameters if you are using built-in models.</p>
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
      <div class="footer">
        <div class="footer-button-row">
          <el-button type="primary" class="footer-action-button" @click="open = true" ref="ref3">Tutorial</el-button>
          <el-button type="warning" class="footer-action-button" @click="handleResetClick">Reset</el-button>
          <el-button type="success" class="footer-action-button" @click="handleUploadClick">Upload</el-button>
        </div>
      </div>
    </section>
  </div>

  <!-- Element Plus 的引导教程 -->
  <el-tour v-model="open">
    <el-tour-step target="#image-row" title="Model" description="Our scMoAnno Model" />
    <el-tour-step target="#upload-row" title="Upload File">
      <div>Put your files here.</div>
    </el-tour-step>
    <el-tour-step target="#button-row" title="Upload" description="Click to upload" />
    <el-tour-step target="#WorkSpase" title="Results" description="Results will be shown here" />
  </el-tour>

  <!-- 任务名输入框 -->
  <el-dialog v-model="showTaskNameDialog" title="Enter Task Name" @close="resetDialog" width="500" align-center>
    <el-input v-model="taskName" placeholder="Please enter the task name"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showTaskNameDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitTaskName">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
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
      parameters: {}, // 选中的模型参数
      parameterDefaults: {}, // 默认参数
      selectedModel: '',
      loading:false,
    };
  },
  methods: {
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
      const isScRNASeqFileValid = this.scRNASeqFile.length > 0 && this.scRNASeqFile.every(file => file.name.endsWith('.h5') || file.name.endsWith('.h5ad') || file.name.endsWith('.npy'));
      const isScATACSeqFileValid = this.scATACSeqFile.length > 0 && this.scATACSeqFile.every(file => file.name.endsWith('.h5') || file.name.endsWith('.h5ad') || file.name.endsWith('.npy'));
      const isTagFileValid = this.tagFile.length > 0 && this.tagFile.every(file => file.name.endsWith('.npy') || file.name.endsWith('.csv'));

      if (this.scRNASeqFile.length === 0 || this.scATACSeqFile.length === 0 || this.tagFile.length === 0) {
        ElMessage.error('Please upload all required files.');
        return;
      }

      if (!isScRNASeqFileValid || !isScATACSeqFileValid || !isTagFileValid) {
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
      const response = await axios.post('/api/findTaskByTaskName?taskName=' + this.taskName);
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
      const userId = JSON.parse(sessionStorage.getItem('userData')).userId;
      const response = await axios.post('/api/insertTask', { taskName: this.taskName, userId });

      if (response.data.code === 1) {
        await axios.post('/api/insertFile', { taskName: this.taskName });

        const files = [
          { file: this.scRNASeqFile[0].raw, fileType: 'scRNASeqFile' },
          { file: this.scATACSeqFile[0].raw, fileType: 'scATACSeqFile' },
          { file: this.tagFile[0].raw, fileType: 'tagFile' }
        ];

        const uploadPromises = files.map(({ file, fileType }) => {
          const taskName = this.taskName;
          // 获取文件的ArrayBuffer并计算MD5
          const fileReader = new FileReader();
          const spark = new SparkMD5.ArrayBuffer();
          // 获取文件二进制数据
          fileReader.readAsArrayBuffer(file);
          fileReader.onload = async e =>{
          spark.append(e.target.result);
            const hash = spark.end();
            const response = await axios.post('/api/fileHash', { hash, fileType, taskName});
            if (response.data.code === 1){
              const formData = new FormData();
              formData.append('file', file);
              formData.append('taskName', taskName);
              formData.append('fileType', fileType);
              formData.append('hash', hash);
              return axios.post('/api/uploadOneFile', formData);
            }
          };
        });

        await Promise.all(uploadPromises);

        ElMessage.success('Task created successfully.');
        this.tagFile = [];
        this.scATACSeqFile = [];
        this.scRNASeqFile = [];
        this.showTaskNameDialog = false; // 成功上传后关闭对话框
      }
    },

  },
};
</script>

<script setup>
import { UploadFilled } from "@element-plus/icons-vue";
import { ref } from 'vue';
import SparkMD5 from "spark-md5";

const open = ref(false);
const file = ref();
const activeTask = ref('annotation');

const handleTaskSelect = (task) => {
  activeTask.value = task;
};
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
</style>
