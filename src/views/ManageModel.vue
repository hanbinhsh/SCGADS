<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <h1 class="page-name">{{ $t('navigateBar.ManageModel') }}</h1>
      <el-divider />
      
      <el-table 
        :data="paginatedListData" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
        <!-- 多选功能 -->
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
      
      <!-- 分页组件 -->
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

    <!-- 按钮行 -->
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

    <!-- 移动端详情对话框 -->
    <el-dialog v-model="optDialogVisible" title="Model Details" width="90%" align-center :label="$t('Operations')">
      <div class="operation-buttons">
        <el-button link type="info" size="small" @click="showDetailsDialog(currentRow)">{{ $t('Detail') }}</el-button>
        <el-button link type="primary" size="small" @click="showEditDialog(currentRow)">{{ $t('Edit') }}</el-button>
        <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">{{ $t('Delete') }}</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
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

    <!-- 批量删除确认对话框 -->
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

    <!-- 修改对话框 -->
    <el-dialog v-model="editDialogVisible" title="Edit Model" width="850px" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: Upload the models into the algorithm folder of back-end.
      </div>
      <el-form :model="selectedData" label-width="150px" label-position="left">
        <div style="display: flex; gap: 20px;">
          <!-- 左侧：现有输入框 -->
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

    <!-- 添加对话框 -->
    <el-dialog v-model="addDialogVisible" title="Add Model" width="850px" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: Upload the models into the algorithm folder of back-end.
      </div>
      <el-form :model="modelAdding" label-width="150px" label-position="left">
        <div style="display: flex; gap: 20px;">
          <!-- 左侧：现有输入框 -->
          <div style="flex: 1;">
            <el-form-item :label="$t('database.models.model_name')">
              <el-input v-model="modelAdding.modelName"></el-input>
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
              <el-input v-model="modelAdding.modelPath"></el-input>
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

          <!-- 右侧：参数输入框 -->
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Parameters</span>
              <el-button type="primary" icon="plus" @click="addParameter">Add</el-button>
            </div>
            <div style="max-height: 550px; overflow-y: auto; margin-top: 10px;">
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
          <el-button @click="addDialogVisible = false; modelAddingReset()">Cancel</el-button>
          <el-button type="warning" @click="modelAddingReset()">Reset</el-button>
          <el-button type="primary" @click="modelSave()">Save</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 参数对话框 -->
    <el-dialog v-model="parametersDialogVisible" title="Parameters" width="500" align-center>
      <el-form label-width="150px" label-position="left" disabled>
        <!-- 参数输入框 -->
        <el-form-item v-for="(param, index) in parameters" :key="index" :label="param.name">
          <el-input v-model="parameters[index].value" :placeholder="param.value.toString()" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="parametersDialogVisible = false;">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 模型图对话框 -->
    <el-dialog v-model="figureDialogVisible" title="Figure" align-center>
      <el-row justify="center" class="image-container" id="image-row" style="margin-top: 0;">
        <img :src="figure" alt="Model" class="example-image" />
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="figureDialogVisible = false;">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailsDialogVisible" title="Model Storage Details" width="600px" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Model Name">
          <span style="font-weight: bold; color: #409eff;">{{ selectedData.modelName }}</span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.model_name')">
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

export default {
  name: 'ModelsPage',
  components: {
    MainHeader
  },
  data() {
    return {
      listData: [],
      paginatedListData: [], // 当前页的反馈数据
      deleteDialogVisible: false,
      editDialogVisible: false,
      batchDeleteDialogVisible: false,
      parametersDialogVisible: false,
      figureDialogVisible: false,
      figure: "",
      addDialogVisible: false,
      detailsDialogVisible: false, // 详情对话框可见性
      
      selectedDatas: [],
      selectedDataDefault: {},
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      loading: false,

      windowWidth: window.innerWidth,
      
      // 模型编辑
      selectedData: {},
      parameters: [], // 选中的模型参数
      allUsers: [], // 所有用户数据列表

      modelAdding: {
        modelName: "",
        modelType: "single",
        modelPath: "",
        predictFilePath: "pred.py",
        trainFilePath: "train.py",
        figurePath: "model.png",
        parameters: [], // 存储参数列表
        remark: "",
        extractLabels: "extract_labels.csv",
        companyName: "",
        userName: "",
        pretrainModel: false,
        pretrainModelPath: "",
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
        // 小屏手机：只显示基本的分页器
        return "prev, pager, next";
      } else if (this.windowWidth <= 768) {
        // 平板/大屏手机：显示总数和基本分页
        return "total, prev, pager, next";
      } else {
        // 桌面端：显示完整功能
        return "total, sizes, prev, pager, next, jumper";
      }
    },
  },
  methods: {
    showOptDialog(row) {
      this.currentRow = row;
      this.optDialogVisible = true;
    },
    // 监听窗口大小变化
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    // 用户筛选和公司自动填写
    // 获取所有用户
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
    // 自动补全查询用户
    querySearchUsers(queryString, cb) {
      const results = this.allUsers
        .filter(user => user.userName.toLowerCase().includes(queryString.toLowerCase()))
        .map(user => ({
          value: user.userName,
          userId: user.userId
        }));
      cb(results);
    },
    // 用户选中后的回调，获取其公司信息
    async handleUserSelect(item) {
      this.selectedData.userName = item.value;
      try {
        const response = await axios.get(`/api/findCompanyByUserID?userId=${item.userId}`);
        if (response.data.code === 200 && response.data.data) {
          this.selectedData.companyName = response.data.data.companyName;
          this.modelAdding.companyName = response.data.data.companyName;
        } else {
          this.selectedData.companyName = '';
          this.modelAdding.companyName = '';
        }
      } catch (error) {
        console.error('获取公司信息失败', error);
        this.selectedData.companyName = '';
        this.modelAdding.companyName = '';
      }
    },

    // 模型修改
    addEditingParameter() {
      this.parameters.push({ name: "", value: "" });
    },
    removeEditingParameter(index) {
      this.parameters.splice(index, 1);
    },
    modelEditingReset(){
      this.selectedData = {}
      this.paramTrans(this.selectedDataDefault)
    },
    async modelEditingSave() {
      const formData = new FormData();
      const data = this.selectedData;
      const paramString = this.parameters.map(param => {
        // 如果值是数字，不需要转换，否则使用 toString()
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
      this.editDialogVisible = false;
      this.fetchListData();
      this.modelAddingReset();
    },
    paramTrans(data) {
      if (!data || !data.defaultParameters) {
        this.parameters = [];
        return;
      }

      const paramArray = data.defaultParameters
        .split(',')
        .map(param => {
          const [key, value] = param.split(':');
          if (!key || !value) return null; // 忽略无效项
          return {
            name: key.trim(),
            value: isNaN(value) ? value.trim() : parseFloat(value)
          };
        })
        .filter(p => p !== null); // 过滤掉不合法的

      this.parameters = paramArray;
      this.selectedData = JSON.parse(JSON.stringify(data)); // 防止表单不更新
      this.selectedDataDefault = data;
    },

    // 增加模型
    addParameter() {
      this.modelAdding.parameters.push({ name: "", value: "" });
    },
    removeParameter(index) {
      this.modelAdding.parameters.splice(index, 1);
    },
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
    },
    async modelSave() {
      // console.log("Saving model:", this.modelAdding);
      const data = this.modelAdding;
      const paramString = data.parameters.map(param => {
        // 如果值是数字，不需要转换，否则使用 toString()
        const value = typeof param.value === 'number' ? param.value : param.value.toString();
        return `${param.name}:${value}`;
      }).join(',');
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
      const response = await axios.post('api/models/addModel', formData);
      if (response.data.code === 1) {
        ElMessage({
          message: 'Model add successfully',
          type: 'success',
        });
      } else {
        ElMessage({
          message: 'Failed to add Model',
          type: 'error',
        });
      }
      this.addDialogVisible = false;
      this.fetchListData();
      this.modelAddingReset();
    },
    showDeleteDialog(data) {
      this.deleteDialogVisible = true;
      this.selectedData = data;
    },
    showEditDialog(data) {
      this.paramTrans(data)
      this.selectedData = data;
      this.editDialogVisible = true;
    },
    showParametersDialog(data) {
      this.paramTrans(data)
      this.parametersDialogVisible = true;
    },
    showFigureDialog(data){
      this.figureDialogVisible = true;
      const base64Image = `data:image/png;base64,${data.figureByte}`;  // 这里假设返回的是base64编码的图像字节流
      this.figure = base64Image;
    },
    
    handleSelectionChange(data) {
      this.selectedDatas = data;
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting();
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.listData.sort((a, b) => {
          const valueA = a[this.sortProp];
          const valueB = b[this.sortProp];

          if (this.sortOrder === 'ascending') {
            return valueA > valueB ? 1 : -1;
          } else if (this.sortOrder === 'descending') {
            return valueA < valueB ? 1 : -1;
          } else {
            return 0;
          }
        });
      }
      this.updatePaginatedDataList();
    },
    updatePaginatedDataList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedListData = this.listData.slice(start, end);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updatePaginatedDataList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updatePaginatedDataList();
    },
    async fetchListData() {
      try {
        this.loading = true;
        const response = await axios.get('/api/models/findAllModels'); // 调用后端API
        this.listData = response.data;
        this.applySorting();
        this.loading = false;
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    },
    async deleteData(dataId) {
      try {
        const response = await axios.delete(`/api/models/deleteModel?modelId=${dataId}`);
        if (response.data.code === 1) {
          ElMessage.success('Model deleted successfully');
          this.fetchListData();
        } else {
          console.error('Failed to delete:', response.data.msg);
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    },
    async deleteDataID(dataId) {
      try {
        await axios.delete(`/api/models/deleteModel?modelId=${dataId}`);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const data of this.selectedDatas) {
        await this.deleteDataID(data.modelId);
      }
      ElMessage.success('Batch delete success.');
      this.fetchListData();
    },
    showDetailsDialog(data) {
      this.selectedData = data;
      this.detailsDialogVisible = true;
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
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
