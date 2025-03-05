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
    <section class="fullscreen-section">
      <!-- 注释页面 -->
      <div class="left-container">
        <el-row :gutter="20">
          <!-- 左侧：文件上传 -->
          <el-col :span="14">
            <el-card class="upload-card">
              <el-row :gutter="20" id="upload-row">
                <el-col :span="activeTask === 'denoising' ? 24 : activeTask === 'training' ? 8 : 12">
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
                <el-col :span="activeTask === 'training' ? 8 : 12" v-if="activeTask === 'training' || activeTask === 'annotation' ">
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
                <el-col :span="8" v-if="activeTask === 'training'">
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
                <img v-if="parameters.model === 'scLTH'" src="@/assets/model_scLTH.png" alt="scLTH Model" class="example-image" />
                <img v-else-if="parameters.model === 'scTCHCN'" src="@/assets/model_scTCHCN.png" alt="scTCHCN Model" class="example-image" />
                <img v-else src="@/assets/model_scMoAnno.png" alt="scMoAnno Model" class="example-image" />
              </el-row>
            </el-card>
          </el-col>

          <!-- 右侧：参数设置 -->
          <el-col :span="10">
            <el-card class="form-card" style="height: 70px;">
              <el-form label-width="40%">
                <!-- 模型选择 -->
                <el-form-item label="Model Select">
                  <el-select v-model="parameters.model" placeholder="Select Models" class="full-width">
                    <el-option label="scLTH" value="scLTH" />
                    <el-option label="scTCHCN" value="scTCHCN" />
                    <el-option label="scMoAnno" value="scMoAnno" />
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
        <div class="button-row">
          <el-button type="primary" class="action-button" @click="open = true" ref="ref3">Tutorial</el-button>
          <el-button type="warning" class="action-button" @click="handleResetClick">Reset</el-button>
          <el-button type="success" class="action-button" @click="handleUploadClick">Upload</el-button>
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
  data() {
    return {
      scRNASeqFile: [], // 存储 scRNA-seq 文件的数组  
      scATACSeqFile: [], // 存储 scATAC-seq 文件的数组  
      tagFile: [], // 存储 Tag 文件的数组
      open: false,
      showTaskNameDialog: false, // 控制任务名输入框显示状态
      taskName: "", // 存储任务名称
      parameters: {
        model: "scLTH", // 设置默认选中 scLTH
        n_epochs: 96,
        dropout: 0.05,
        batch_size: 128,
        patience: 8,
        input_dim: 512,
        num_layers: 8,
        nhead: 16,
        lr: 5e-4,
        weight_decay: 5e-3
      },
      parameterDefaults: {
        n_epochs: 96,
        dropout: 0.05,
        batch_size: 128,
        patience: 8,
        input_dim: 512,
        num_layers: 8,
        nhead: 16,
        lr: 5e-4,
        weight_decay: 5e-3
      },
    };
  },
  methods: {
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
      console.log(response);

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
            console.log(hash,"文件哈希值");
            console.log(this.taskName,"任务名称");
            const response = await axios.post('/api/fileHash', { hash, fileType, taskName});
            console.log(response);
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

/* 图片展示 */
.image-container {
  margin-top: 20px;
  text-align: center;
  padding: 10px;
}

.example-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.button-row {
  display: flex;
  justify-content: flex-end;
}

.action-button {
  width: 120px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: scale(1.05);
}

/* 全宽组件 */
.full-width {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-row {
    flex-direction: column;
  }

  .button-row {
    justify-content: center;
  }
}
</style>
