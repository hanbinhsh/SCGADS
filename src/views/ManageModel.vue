<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <h1 class="page-name">{{ $t('navigateBar.ManageModel') }}</h1>
      <el-divider />
      
      <!-- ================= 列表表格 ================= -->
      <el-table 
        :data="paginatedListData" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="modelName" :label="$t('database.models.model_name')" sortable min-width="140"></el-table-column>
        <el-table-column prop="modelType" :label="$t('database.models.model_type')" sortable width="130"></el-table-column>
        <el-table-column :label="$t('database.models.base_model')" sortable min-width="140">
          <template #default="{ row }">
            {{ row.baseModel == 0 ? 'None' : listData[row.baseModel-1]?.modelName || 'None' }}
          </template>
        </el-table-column>
        <el-table-column prop="userName" :label="$t('database.models.user_name')" sortable min-width="160"></el-table-column>
        <el-table-column prop="companyName" :label="$t('database.models.company_name')" sortable min-width="160"></el-table-column>
        <el-table-column prop="createdTime" :label="$t('database.models.created_time')" sortable min-width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" :label="$t('database.models.remark')" sortable min-width="120"></el-table-column>
        <el-table-column fixed="right" :label="$t('Operations')" width="180px"  v-if="!isMobile">
          <template #default="{ row }">
            <el-button link type="info" size="small" @click="showDetailsDialog(row)">{{ $t('Detail') }}</el-button>
            <el-button link type="primary" size="small" @click="showEditDialog(row)">{{ $t('Edit') }}</el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">{{ $t('Delete') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('Operations')" width="100px" v-if="isMobile">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showOptDialog(row)">{{ $t('Detail') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- ================= 分页组件 ================= -->
      <el-pagination 
        class="pagination" 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange"
        :current-page="currentPage" 
        :page-sizes="[5, 10, 20, 50]" 
        :page-size="pageSize"
        :layout="paginationLayout"
        :total="listData.length"
        :small="isMobile"
        :hide-on-single-page="false">
      </el-pagination>
    </el-main>

    <!-- ================= 底部按钮行 ================= -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchListData">
          {{ $t('Refresh') }}
        </el-button>
        <el-button type="primary" @click="addDialogVisible = true">
          {{ $t('ModelManage.AddModel') }}
        </el-button>
        <el-button type="danger" @click="batchDeleteDialogVisible = true" :disabled="selectedDatas.length === 0">
          {{ $t('BatchDelete') }}
        </el-button>
      </div>
    </div>

    <!-- ================= 各类对话框 ================= -->

    <!-- 1. 移动端操作对话框 -->
    <el-dialog v-model="optDialogVisible" title="Model Details" width="90%" align-center :label="$t('Operations')">
      <div class="operation-buttons">
        <el-button link type="info" size="small" @click="showDetailsDialog(currentRow)">{{ $t('Detail') }}</el-button>
        <el-button link type="primary" size="small" @click="showEditDialog(currentRow)">{{ $t('Edit') }}</el-button>
        <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">{{ $t('Delete') }}</el-button>
      </div>
    </el-dialog>

    <!-- 2. 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>Model <strong style="color: #e74c3c;">{{ selectedData.modelName }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteData(selectedData.modelId)">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 3. 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" width="500" align-center>
      <span>Are you sure you want to delete the selected models?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmBatchDelete">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 4. 修改对话框 -->
    <el-dialog v-model="editDialogVisible" title="Edit Model" width="850px" align-center>
      <div class="card-alart">
        Note: Model files are stored on the server backend.
      </div>
      <el-form :model="selectedData" label-width="150px" label-position="left">
        <div style="display: flex; gap: 20px;">
          <!-- 左侧：基础信息 -->
          <div style="flex: 1;">
            <el-form-item :label="$t('database.models.model_name')">
              <el-input v-model="selectedData.modelName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.model_type')">
              <el-select v-model="selectedData.modelType">
                <el-option label="Single-omic Annotation" value="single" />
                <el-option label="Multi-omics Annotation" value="multi" />
                <el-option label="Denoising" value="deno" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('database.models.pretrain_model')">
              <el-switch v-model="selectedData.pretrainModel" style="margin-left: auto;"></el-switch>
            </el-form-item>
            <el-form-item :label="$t('database.models.model_path')">
              <el-input v-model="selectedData.modelPath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.pretrain_model_path')" v-if="selectedData.pretrainModel">
              <el-input v-model="selectedData.pretrainModelPath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.predict_file_path')">
              <el-input v-model="selectedData.predictFilePath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.train_file_path')">
              <el-input v-model="selectedData.trainFilePath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.extract_labels')">
              <el-input v-model="selectedData.extractLabels"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.figure_path')">
              <el-input v-model="selectedData.figurePath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.user_name')">
              <el-autocomplete
                v-model="selectedData.userName"
                :fetch-suggestions="querySearchUsers"
                placeholder="请输入用户名"
                @select="handleUserSelect"
                clearable
              ></el-autocomplete>
            </el-form-item>
            <el-form-item :label="$t('database.models.company_name')">
              <el-input v-model="selectedData.companyName" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.remark')">
              <el-input v-model="selectedData.remark"></el-input>
            </el-form-item>
          </div>

          <!-- 右侧：参数输入框 -->
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Parameters</span>
              <el-button type="primary" icon="plus" @click="addEditingParameter">Add</el-button>
            </div>
            <div style="max-height: 550px; overflow-y: auto; margin-top: 10px;">
              <el-form-item v-for="(param, index) in parameters" :key="index" label-width="0px">
                <div style="display: flex; align-items: center; width: 100%;">
                  <span style="width: 30px; text-align: center; font-weight: bold;">{{ index + 1 }}</span>
                  <el-input v-model="param.name" placeholder="Parameter" style="width: 45%;"></el-input>
                  <el-input v-model="param.value" placeholder="Default Value" style="width: 45%; margin-left: 10px;"></el-input>
                  <el-button type="danger" icon="delete" @click="removeEditingParameter(index)" style="margin-left: 10px;"></el-button>
                </div>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false; modelEditingReset()">{{ $t('Cancel') }}</el-button>
          <el-button type="warning" @click="modelEditingReset()">{{ $t('Reset') }}</el-button>
          <el-button type="primary" @click="modelEditingSave()">{{ $t('Save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. 【核心】添加模型对话框 -->
    <el-dialog v-model="addDialogVisible" title="Add Model" width="850px" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: The uploaded zip file will be decompressed to 'algorithm/{modelType}/{modelName}' folder.
      </div>
      <el-form :model="modelAdding" label-width="150px" label-position="left">
        <div style="display: flex; gap: 20px;">
          <!-- 左侧：基础信息输入框 -->
          <div style="flex: 1;">
            <el-form-item :label="$t('database.models.model_name')">
              <el-input v-model="modelAdding.modelName" placeholder="Required for folder naming"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.model_type')">
              <el-select v-model="modelAdding.modelType">
                <el-option label="Single-omic Annotation" value="single" />
                <el-option label="Multi-omics Annotation" value="multi" />
                <el-option label="Denoising" value="deno" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('database.models.pretrain_model')">
              <el-switch v-model="modelAdding.pretrainModel" style="margin-left: auto;"></el-switch>
            </el-form-item>
            <el-form-item :label="$t('database.models.model_path')">
              <el-input v-model="modelAdding.modelPath" placeholder="Auto-generated if file uploaded"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.pretrain_model_path')" v-if="modelAdding.pretrainModel">
              <el-input v-model="modelAdding.pretrainModelPath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.predict_file_path')">
              <el-input v-model="modelAdding.predictFilePath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.train_file_path')">
              <el-input v-model="modelAdding.trainFilePath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.extract_labels')">
              <el-input v-model="modelAdding.extractLabels"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.figure_path')">
              <el-input v-model="modelAdding.figurePath"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.user_name')">
              <el-autocomplete
                v-model="modelAdding.userName"
                :fetch-suggestions="querySearchUsers"
                placeholder="请输入用户名"
                @select="handleUserSelect"
                clearable
              ></el-autocomplete>
            </el-form-item>
            <el-form-item :label="$t('database.models.company_name')">
              <el-input v-model="modelAdding.companyName" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :label="$t('database.models.remark')">
              <el-input v-model="modelAdding.remark"></el-input>
            </el-form-item>
          </div>

          <!-- 右侧：【新增】上传区域 + 参数输入框 -->
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 20px;">
            
            <!-- 【新增】压缩包上传组件 -->
            <div style="margin-bottom: 20px; border-bottom: 1px dashed #ddd; padding-bottom: 20px;">
              <div style="font-weight: bold; margin-bottom: 10px;">Upload Algorithm Package (.zip)</div>
              <!-- auto-upload=false: 阻止组件自动上传，等点击 Save 再处理 -->
              <el-upload
                ref="uploadRef"
                action="#"
                :auto-upload="false"
                :limit="1"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                accept=".zip,.tar,.gz"
                drag
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  Drop file here or <em>click to upload</em>
                </div>
              </el-upload>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Parameters</span>
              <el-button type="primary" icon="plus" @click="addParameter">Add</el-button>
            </div>
            
            <!-- 参数列表 -->
            <div style="max-height: 350px; overflow-y: auto; margin-top: 10px;">
              <el-form-item v-for="(param, index) in modelAdding.parameters" :key="index" label-width="0px">
                <div style="display: flex; align-items: center; width: 100%;">
                  <span style="width: 30px; text-align: center; font-weight: bold;">{{ index + 1 }}</span>
                  <el-input v-model="param.name" placeholder="Parameter" style="width: 45%;"></el-input>
                  <el-input v-model="param.value" placeholder="Default Value" style="width: 45%; margin-left: 10px;"></el-input>
                  <el-button type="danger" icon="delete" @click="removeParameter(index)" style="margin-left: 10px;"></el-button>
                </div>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addDialogVisible = false; modelAddingReset()">{{ $t('Cancel') }}</el-button>
          <el-button type="warning" @click="modelAddingReset()">{{ $t('Reset') }}</el-button>
          <el-button type="primary" @click="modelSave()">{{ $t('Save') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 6. 参数对话框 -->
    <el-dialog v-model="parametersDialogVisible" :title="$t('modelPage.DefaultParameters')" width="500" align-center>
      <el-form label-width="150px" label-position="left" disabled>
        <el-form-item v-for="(param, index) in parameters" :key="index" :label="param.name">
          <el-input v-model="parameters[index].value" :placeholder="param.value.toString()" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="parametersDialogVisible = false;">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 7. 模型图对话框 -->
    <el-dialog v-model="figureDialogVisible" :title="$t('ModelManage.Figure')" align-center>
      <el-row justify="center" class="image-container" id="image-row" style="margin-top: 0;">
        <img :src="figure" alt="Model" class="example-image" />
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="figureDialogVisible = false;">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 8. 详情对话框 -->
    <el-dialog v-model="detailsDialogVisible" :title="$t('managePage.ModelDetails')" width="600px" align-center>
      <el-descriptions :column="1" border>
        <!-- 详情内容保持不变 -->
        <el-descriptions-item :label="$t('database.models.model_name')">
          <span style="font-weight: bold; color: #409eff;">{{ selectedData.modelName }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.model_type')">
          <el-tag :type="selectedData.modelType === 'single' ? 'success' : selectedData.modelType === 'multi' ? 'warning' : 'info'">
            {{ selectedData.modelType === 'single' ? 'Single-omic Annotation' : 
              selectedData.modelType === 'multi' ? 'Multi-omics Annotation' : 'Denoising' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.base_model')">
          <el-tag>
            {{ selectedData.baseModel == 0 ? 'None' : listData[selectedData.baseModel-1]?.modelName || 'None' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.pretrain_model')">
          <el-tag :type="selectedData.pretrainModel == true ? 'success' : 'warning'">
            {{ selectedData.pretrainModel == true ? 'Yes' : 'No' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.model_path')">
          <div class="path-item">
            {{ selectedData.modelPath || 'Not specified' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.pretrain_model_path')" v-if="selectedData.pretrainModel">
          <div class="path-item">
            {{ selectedData.pretrainModelPath || 'Not specified' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.predict_file_path')">
          <div class="path-item">
            {{ selectedData.predictFilePath || 'Not specified' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.train_file_path')">
          <div class="path-item">
            {{ selectedData.trainFilePath || 'Not specified' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.extract_labels')">
          <div class="path-item">
            {{ selectedData.extractLabels || 'Not specified' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.figure_path')">
          <div class="path-item">
            {{ selectedData.figurePath || 'Not specified' }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.created_time')">
          {{ selectedData.createdTime }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.user_name')" v-if="selectedData.userName">
          {{ selectedData.userName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.company_name')" v-if="selectedData.companyName">
          {{ selectedData.companyName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.remark')" v-if="selectedData.remark">
          {{ selectedData.remark }}
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <div class="dialog-footer">
            <el-button type="primary" @click="showFigureDialog(selectedData)">{{ $t('ModelManage.Figure') }}</el-button>
            <el-button type="success" @click="showParametersDialog(selectedData)">{{ $t('ModelManage.Parameters') }}</el-button>
          <el-button @click="detailsDialogVisible = false">{{ $t('Close') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';

export default {
  name: 'ModelsPage',
  components: {
    MainHeader,
    UploadFilled
  },
  data() {
    return {
      listData: [],
      paginatedListData: [],
      deleteDialogVisible: false,
      editDialogVisible: false,
      batchDeleteDialogVisible: false,
      parametersDialogVisible: false,
      figureDialogVisible: false,
      figure: "",
      addDialogVisible: false,
      detailsDialogVisible: false,
      
      selectedDatas: [],
      selectedDataDefault: {},
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      loading: false,

      windowWidth: window.innerWidth,
      
      selectedData: {},
      parameters: [],
      allUsers: [],

      modelAdding: {
        modelName: "",
        modelType: "single",
        modelPath: "",
        predictFilePath: "pred.py",
        trainFilePath: "train.py",
        figurePath: "model.png",
        parameters: [],
        remark: "",
        extractLabels: "extract_labels.csv",
        companyName: "",
        userName: "",
        pretrainModel: false,
        pretrainModelPath: "",
        // 【新增】暂存文件对象
        file: null
      },

      currentRow: {},
      optDialogVisible: false,
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth <= 768;
    },
    paginationLayout() {
      if (this.windowWidth <= 480) {
        return "prev, pager, next";
      } else if (this.windowWidth <= 768) {
        return "total, prev, pager, next";
      } else {
        return "total, sizes, prev, pager, next, jumper";
      }
    },
  },
  methods: {
    // 监听窗口
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    // 用户与公司查询
    async fetchUsers() {
      try {
        const response = await axios.get('/api/findUsers');
        if (response.data.code === 200 && Array.isArray(response.data.data)) {
          this.allUsers = response.data.data;
        }
      } catch (error) {
        console.error('获取用户列表失败', error);
      }
    },
    querySearchUsers(queryString, cb) {
      const results = this.allUsers
        .filter(user => user.userName.toLowerCase().includes(queryString.toLowerCase()))
        .map(user => ({ value: user.userName, userId: user.userId }));
      cb(results);
    },
    async handleUserSelect(item) {
      this.selectedData.userName = item.value;
      this.modelAdding.userName = item.value; 
      try {
        const response = await axios.get(`/api/findCompanyByUserID?userId=${item.userId}`);
        if (response.data.code === 200 && response.data.data) {
          this.selectedData.companyName = response.data.data.companyName;
          this.modelAdding.companyName = response.data.data.companyName;
        }
      } catch (error) { console.error(error); }
    },

    // ----------------- 编辑模型相关 -----------------
    addEditingParameter() { this.parameters.push({ name: "", value: "" }); },
    removeEditingParameter(index) { this.parameters.splice(index, 1); },
    modelEditingReset(){ this.selectedData = {}; this.paramTrans(this.selectedDataDefault); },
    async modelEditingSave() {
       const formData = new FormData();
       const data = this.selectedData;
       const paramString = this.parameters.map(param => {
        const value = typeof param.value === 'number' ? param.value : param.value.toString();
        return `${param.name}:${value}`;
       }).join(',');
       
       formData.append('modelId', data.modelId);
       formData.append('modelName', data.modelName);
       formData.append('modelType', data.modelType);
       formData.append('modelPath', data.modelPath);
       formData.append('predictFilePath', data.predictFilePath);
       formData.append('trainFilePath', data.trainFilePath);
       formData.append('figurePath', data.figurePath);
       formData.append('remark', data.remark);
       formData.append('extractLabels', data.extractLabels);
       formData.append('defaultParameters', paramString);
       formData.append('companyName', data.companyName);
       formData.append('userName', data.userName);
       formData.append('pretrainModel', data.pretrainModel);
       formData.append('pretrainModelPath', data.pretrainModelPath);

       const response = await axios.post('api/models/updateModel', formData);
       if(response.data.code === 1) {
          ElMessage.success('Model updated successfully');
       } else {
          ElMessage.error('Failed to update Model');
       }
       this.editDialogVisible = false;
       this.fetchListData();
    },

    // ----------------- 新增模型相关 (核心修改) -----------------
    
    // 1. 监听文件选择
    handleFileChange(file) {
      this.modelAdding.file = file.raw;
    },
    // 2. 监听文件移除
    handleFileRemove() {
      this.modelAdding.file = null;
    },
    
    // 3. 增加参数
    addParameter() {
      this.modelAdding.parameters.push({ name: "", value: "" });
    },
    removeParameter(index) {
      this.modelAdding.parameters.splice(index, 1);
    },

    // 4. 重置表单
    modelAddingReset(){
      this.modelAdding.parameters = [];
      this.modelAdding.modelName = "";
      this.modelAdding.modelType = "single";
      this.modelAdding.modelPath = "";
      this.modelAdding.predictFilePath = "pred.py";
      this.modelAdding.trainFilePath = "train.py";
      this.modelAdding.figurePath = "model.png";
      this.modelAdding.remark = "";
      this.modelAdding.extractLabels = "extract_labels.csv";
      this.modelAdding.companyName = "";
      this.modelAdding.userName = "";
      this.modelAdding.pretrainModel = false;
      this.modelAdding.pretrainModelPath = "";
      
      // 清空文件
      this.modelAdding.file = null;
      if (this.$refs.uploadRef) this.$refs.uploadRef.clearFiles();
    },

    // 5. 【核心逻辑】单独上传解压文件
    async uploadAlgorithmFile() {
      // 如果没有选择文件，直接结束
      if (!this.modelAdding.file) return;

      const formData = new FormData();
      formData.append('file', this.modelAdding.file);
      formData.append('modelName', this.modelAdding.modelName);
      formData.append('modelType', this.modelAdding.modelType);
      
      try {
        await axios.post('api/models/uploadPackage', formData);
        console.log("Algorithm package uploaded successfully.");
      } catch (error) {
        console.error("File upload failed:", error);
        ElMessage.warning("Model info saved, but file upload failed.");
      }
    },

    // 6. 【核心逻辑】保存模型
    async modelSave() {
      if(!this.modelAdding.modelName) {
        ElMessage.error("Model Name is required");
        return;
      }
      
      const data = this.modelAdding;
      // 参数转字符串
      const paramString = data.parameters.map(param => {
        const value = typeof param.value === 'number' ? param.value : param.value.toString();
        return `${param.name}:${value}`;
      }).join(',');
      
      // 构造 FormData (仅发送文本数据)
      const formData = new FormData();
      formData.append('modelName', data.modelName);
      formData.append('modelType', data.modelType);
      formData.append('modelPath', data.modelPath);
      formData.append('predictFilePath', data.predictFilePath);
      formData.append('trainFilePath', data.trainFilePath);
      formData.append('figurePath', data.figurePath);
      formData.append('remark', data.remark);
      formData.append('extractLabels', data.extractLabels);
      formData.append('defaultParameters', paramString);
      formData.append('companyName', data.companyName);
      formData.append('userName', data.userName);
      formData.append('pretrainModel', data.pretrainModel);
      formData.append('pretrainModelPath', data.pretrainModelPath);
      
      // 第一步：保存基础信息
      const response = await axios.post('api/models/addModel', formData);
      
      if (response.data.code === 1) {
        // 第二步：保存成功后，调用文件上传
        await this.uploadAlgorithmFile();
        
        ElMessage.success('Model added successfully');
        
        this.addDialogVisible = false;
        this.fetchListData();
        this.modelAddingReset();
      } else {
        ElMessage.error('Failed to add Model');
      }
    },

    // ----------------- 通用辅助方法 -----------------
    showDeleteDialog(data) { this.deleteDialogVisible = true; this.selectedData = data; },
    showEditDialog(data) { this.paramTrans(data); this.selectedData = data; this.editDialogVisible = true; },
    showParametersDialog(data) { this.paramTrans(data); this.parametersDialogVisible = true; },
    showFigureDialog(data){ this.figureDialogVisible = true; this.figure = `data:image/png;base64,${data.figureByte}`; },
    showOptDialog(row) { this.currentRow = row; this.optDialogVisible = true; },
    showDetailsDialog(data) { this.selectedData = data; this.detailsDialogVisible = true; },
    
    handleSelectionChange(data) { this.selectedDatas = data; },
    handleSortChange({ prop, order }) { this.sortProp = prop; this.sortOrder = order; this.applySorting(); },
    
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.listData.sort((a, b) => {
          const valueA = a[this.sortProp];
          const valueB = b[this.sortProp];
          return this.sortOrder === 'ascending' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
        });
      }
      this.updatePaginatedDataList();
    },
    updatePaginatedDataList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedListData = this.listData.slice(start, end);
    },
    handleSizeChange(val) { this.pageSize = val; this.updatePaginatedDataList(); },
    handleCurrentChange(val) { this.currentPage = val; this.updatePaginatedDataList(); },
    
    async fetchListData() { 
        this.loading = true; 
        try {
            const res = await axios.get('/api/models/findAllModels'); 
            this.listData = res.data; 
            this.applySorting(); 
        } catch(e) { console.error(e); }
        this.loading = false; 
    },
    
    async deleteData(dataId) {
      try {
        const response = await axios.delete(`/api/models/deleteModel?modelId=${dataId}`);
        if (response.data.code === 1) {
          ElMessage.success('Model deleted successfully');
          this.fetchListData();
        } else {
          ElMessage.error(response.data.msg);
        }
      } catch (error) { console.error(error); }
    },
    
    async deleteDataID(dataId) {
      try { await axios.delete(`/api/models/deleteModel?modelId=${dataId}`); } catch (error) { console.error(error); }
    },
    
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const data of this.selectedDatas) {
        await this.deleteDataID(data.modelId);
      }
      ElMessage.success('Batch delete success.');
      this.fetchListData();
    },
    
    paramTrans(data) {
      if (!data || !data.defaultParameters) {
        this.parameters = [];
        return;
      }
      const paramArray = data.defaultParameters.split(',').map(param => {
          const [key, value] = param.split(':');
          if (!key || !value) return null;
          return { name: key.trim(), value: isNaN(value) ? value.trim() : parseFloat(value) };
        }).filter(p => p !== null);
      this.parameters = paramArray;
      this.selectedData = JSON.parse(JSON.stringify(data));
      this.selectedDataDefault = data;
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    }
  },
  mounted() {
    this.fetchListData();
    this.fetchUsers();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
.path-item {
  word-break: break-all;
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 5px;
  border-radius: 4px;
}
.dark-mode .path-item {
  background-color: #333333;
}
</style>