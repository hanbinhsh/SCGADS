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
        <el-table-column prop="modelName" :label="$t('database.models.model_name')" sortable></el-table-column>
        <el-table-column prop="modelType" :label="$t('database.models.model_type')" sortable></el-table-column>
        <el-table-column prop="modelPath" :label="$t('database.models.model_path')" sortable></el-table-column>
        <el-table-column prop="predictFilePath" :label="$t('database.models.predict_file_path')" sortable></el-table-column>
        <el-table-column prop="trainFilePath" :label="$t('database.models.train_file_path')" sortable></el-table-column>
        <el-table-column prop="figurePath" :label="$t('database.models.figure_path')" sortable></el-table-column>
        <el-table-column prop="remark" :label="$t('database.models.remark')" sortable></el-table-column>
        <el-table-column fixed="right" :label="$t('Operations')" :width="isMobile ? '100px' : '250px'">
          <template #default="{ row }">
            <el-button link type="info" size="small" @click="showFigureDialog(row)">{{ $t('ModelManage.Figure') }}</el-button>
            <el-button link type="success" size="small" @click="showParametersDialog(row)">{{ $t('ModelManage.Parameters') }}</el-button>
            <el-button link type="primary" size="small" @click="showEditDialog(row)">{{ $t('Edit') }}</el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">{{ $t('Delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="listData.length"></el-pagination>
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
    <el-dialog v-model="editDialogVisible" title="Edit Model" width="700px" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: Upload the models into the algorithm folder of back-end.
      </div>
      <el-form :model="selectedData" label-width="120px" label-position="left">
        <div style="display: flex; gap: 20px;">
          <!-- 左侧：现有输入框 -->
          <div style="flex: 1;">
            <el-form-item label="Model Name">
              <el-input v-model="selectedData.modelName"></el-input>
            </el-form-item>
            <el-form-item label="Model Type">
              <el-select v-model="selectedData.modelType">
                <el-option label="Single-omic Annotation" value="single" />
                <el-option label="Multi-omics Annotation" value="multi" />
                <el-option label="Denoising" value="deno" />
              </el-select>
            </el-form-item>
            <el-form-item label="Model Path">
              <el-input v-model="selectedData.modelPath"></el-input>
            </el-form-item>
            <el-form-item label="Predict File Path">
              <el-input v-model="selectedData.predictFilePath"></el-input>
            </el-form-item>
            <el-form-item label="Train File Path">
              <el-input v-model="selectedData.trainFilePath"></el-input>
            </el-form-item>
            <el-form-item label="Figure Path">
              <el-input v-model="selectedData.figurePath"></el-input>
            </el-form-item>
            <el-form-item label="Remark">
              <el-input v-model="selectedData.remark"></el-input>
            </el-form-item>
          </div>

          <!-- 右侧：参数输入框 -->
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Parameters</span>
              <el-button type="primary" icon="plus" @click="addEditingParameter">Add</el-button>
            </div>
            <div style="max-height: 250px; overflow-y: auto; margin-top: 10px;">
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
          <el-button @click="editDialogVisible = false; modelEditingReset()">Cancel</el-button>
          <el-button type="warning" @click="modelEditingReset()">Reset</el-button>
          <el-button type="primary" @click="modelEditingSave()">Save</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加对话框 -->
    <el-dialog v-model="addDialogVisible" title="Add Model" width="700px" align-center>
      <!-- 添加提示信息 -->
      <div class="card-alart">
        Note: Upload the models into the algorithm folder of back-end.
      </div>
      <el-form :model="modelAdding" label-width="120px" label-position="left">
        <div style="display: flex; gap: 20px;">
          <!-- 左侧：现有输入框 -->
          <div style="flex: 1;">
            <el-form-item label="Model Name">
              <el-input v-model="modelAdding.modelName"></el-input>
            </el-form-item>
            <el-form-item label="Model Type">
              <el-select v-model="modelAdding.modelType">
                <el-option label="Single-omic Annotation" value="single" />
                <el-option label="Multi-omics Annotation" value="multi" />
                <el-option label="Denoising" value="deno" />
              </el-select>
            </el-form-item>
            <el-form-item label="Model Path">
              <el-input v-model="modelAdding.modelPath"></el-input>
            </el-form-item>
            <el-form-item label="Predict File Path">
              <el-input v-model="modelAdding.predictFilePath"></el-input>
            </el-form-item>
            <el-form-item label="Train File Path">
              <el-input v-model="modelAdding.trainFilePath"></el-input>
            </el-form-item>
            <el-form-item label="Figure Path">
              <el-input v-model="modelAdding.figurePath"></el-input>
            </el-form-item>
            <el-form-item label="Remark">
              <el-input v-model="modelAdding.remark"></el-input>
            </el-form-item>
          </div>

          <!-- 右侧：参数输入框 -->
          <div style="flex: 1; border-left: 1px solid #ddd; padding-left: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">Parameters</span>
              <el-button type="primary" icon="plus" @click="addParameter">Add</el-button>
            </div>
            <div style="max-height: 250px; overflow-y: auto; margin-top: 10px;">
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
      selectedData: {},
      selectedDatas: [],
      selectedDataDefault: {},
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      parameters: [], // 选中的模型参数
      loading: false,
      isMobile: false,
      
      modelAdding: {
        modelName: "",
        modelType: "",
        modelPath: "",
        predictFilePath: "",
        trainFilePath: "",
        figurePath: "model.png",
        parameters: [], // 存储参数列表
        remark: "",
      },
    };
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    addEditingParameter() {
      this.parameters.push({ name: "", value: "" });
    },
    removeEditingParameter(index) {
      this.parameters.splice(index, 1);
    },
    addParameter() {
      this.modelAdding.parameters.push({ name: "", value: "" });
    },
    removeParameter(index) {
      this.modelAdding.parameters.splice(index, 1);
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
      formData.append('defaultParameters', paramString);
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
      formData.append('defaultParameters', paramString);
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
    },
    modelAddingReset(){
      this.modelAdding.parameters = [];
      this.modelAdding.modelName = "";
      this.modelAdding.modelType = "";
      this.modelAdding.modelPath = "";
      this.modelAdding.predictFilePath = "";
      this.modelAdding.trainFilePath = "";
      this.modelAdding.figurePath = "model.png";
      this.modelAdding.remark = "";
    },
    modelEditingReset(){
      this.selectedData = {}
      this.paramTrans(this.selectedDataDefault)
    },
    showDeleteDialog(data) {
      this.deleteDialogVisible = true;
      this.selectedData = data;
    },
    showEditDialog(data) {
      this.paramTrans(data)
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
    paramTrans(data){
      const paramArray = data.defaultParameters.split(',').map(param => {
      const [key, value] = param.split(':');
      return {
          name: key.trim(),
          value: isNaN(value) ? value.trim() : parseFloat(value)
        };
      });
      this.parameters = paramArray;
      this.selectedData = JSON.parse(JSON.stringify(data)); // 防止表单不更新
      this.selectedDataDefault = data;
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
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    }
  },
  mounted() {
    this.fetchListData();
    this.checkMobile(); // Initial check
    window.addEventListener('resize', this.checkMobile);
  },
};
</script>

<style scoped>
/* 批量操作按钮样式 */
.batch-actions {
  margin-bottom: 15px;
}

/* 分页组件样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}


@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }
  
  .mobile-view {
    display: block;
  }

  .pagination {
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
    margin-bottom: 20px;
  }

}
</style>
