<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <el-main class="fullscreen-section">
      <h1 class="page-name">{{ $t('navigateBar.ManageShare') }}</h1>
      <el-divider />

      <div>
        <el-table 
        :data="paginatedShareList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading"
      >
        <!-- 多选功能 -->
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="sharer_name" :label="$t('database.share.sharer_name')" sortable min-width="150">
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="24"
                :src="row.sharerAvatarBase64 ? 'data:image/jpeg;base64,' + row.sharerAvatarBase64 : defaultAvatar">
              </el-avatar>
              <span style="margin-left: 8px;">{{ row.sharer_name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="task_name" :label="$t('database.share.task_name')" sortable min-width="180"></el-table-column>
        <el-table-column prop="receiver_name" :label="$t('database.share.receiver_name')" sortable min-width="160">
          <template #default="{ row }">
            <span v-if="row.receiver_name">{{ row.receiver_name }}</span>
            <span v-else-if="row.company_name" style="color: #409EFF;">{{ row.company_name }} (公司)</span>
            <span v-else style="color: #67C23A;">公开分享</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('database.task.status')" sortable>
          <template #default="{ row }">
            <el-tag :type="statusType(row.task_status)">
              {{ statusText(row.task_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shared_time" :label="$t('database.share.shared_time')" width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.shared_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="due_time" :label="$t('database.share.due_time')" width="160" sortable>
          <template #default="{ row }">
            <span v-if="row.due_time">{{ formatDate(row.due_time) }}</span>
            <span v-else style="color: #67C23A;">{{ $t('workSpace.Indefinite') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('Status')" sortable width="100">
          <template #default="{ row }">
            <span v-if="!row.due_time" class="share-status-badge share-status-indefinite">
              {{ $t('workSpace.Indefinite') }}
            </span>
            <span v-else-if="new Date() > new Date(row.due_time)"
              class="share-status-badge share-status-expired">
              {{ $t('workSpace.Expired') }}
            </span>
            <span v-else class="share-status-badge share-status-active">
              {{ $t('workSpace.Active') }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="password" :label="$t('database.share.password')" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.password" type="warning" size="small">有密码</el-tag>
            <el-tag v-else type="success" size="small">无密码</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column fixed="right" :label="$t('Operations')" width="220" v-if="!isMobile">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showShareDetails(row)">
              {{ $t('Detail') }}
            </el-button>
            <el-button link type="warning" size="small" @click="showEditShareDialog(row)">{{ $t('Edit') }}</el-button>
            <el-button link type="danger" size="small" @click="showDeleteDialog(row)">{{ $t('Delete') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('Operations')" width="120" v-if="isMobile">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showOptDialog(row)">
              {{ $t('Detail') }}
            </el-button>
          </template>
        </el-table-column> 
      </el-table>
      </div>

      <!-- 分页组件 -->
      <el-pagination 
        class="pagination" 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange"
        :current-page="currentPage" 
        :page-sizes="[5, 10, 20, 50]" 
        :page-size="pageSize"
        :layout="paginationLayout"
        :total="shareList.length"
        :small="isMobile"
        :hide-on-single-page="false">
      </el-pagination>
    </el-main>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchShares">
          {{ $t('Refresh') }}
        </el-button>
        <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedShares.length === 0">
          {{ $t('BatchDelete') }}
        </el-button>
      </div>
    </div>

    <!-- 编辑分享对话框 -->
    <el-dialog
      v-model="editDialogVisible" 
      :title="`编辑分享设置`" 
      align-center
      width="500px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="密码设置">
          <el-input
            v-model="editForm.password"
            placeholder="留空表示无密码保护"
            show-password
            clearable
          ></el-input>
          <div style="color: #909399; font-size: 12px; margin-left: 5px;">
            {{ $t('workSpace.PasswordHint') }}
          </div>
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="editForm.dueTime"
            type="datetime"
            placeholder="选择到期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
          />
          <div style="color: #909399; font-size: 12px; margin-left: 5px;">
            留空表示永久分享
          </div>
        </el-form-item>
        <el-form-item :label="$t('workSpace.Recipient')">
          <el-select
            v-model="editForm.receiverName"
            :placeholder="$t('workSpace.RecipientPlaceholder')"
            filterable
            clearable
            :filter-method="filterUsers"
            @change="handleRecipientChange('receiverName', true)"
            @clear="clearRecipient('receiverName', true)"
          >
            <el-option
              v-for="user in filteredUsers"
              :key="user.user_id"
              :label="user.user_name"
              :value="user.user_name"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('workSpace.Company')">
          <el-select
            v-model="editForm.companyName"
            :placeholder="$t('workSpace.CompanyPlaceholder')"
            filterable
            clearable
            :filter-method="filterCompanies"
            @change="handleRecipientChange('companyName', true)"
            @clear="clearRecipient('companyName', true)"
          >
            <el-option
              v-for="company in filteredCompanies"
              :key="company.company_id"
              :label="company.company_name"
              :value="company.company_name"
            />
          </el-select>
        </el-form-item>

        <div v-if="selectionError" class="selection-error">
          <el-alert :title="$t('workSpace.SelectOnlyOneError')" type="error" show-icon :closable="false" />
        </div>

        <el-form-item label="密码设置">
          <el-input
          v-model="editForm.password"
          placeholder="留空表示无密码保护"
          show-password
          clearable
          ></el-input>
          <div class="password-hint">{{ $t('workSpace.PasswordHint') }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="警告" width="500" align-center>
      <span>分享记录 <strong style="color: #e74c3c;">{{ selectedShare.task_name }}</strong> 将被删除</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteShare(selectedShare.share_id)">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="批量删除确认" width="500" align-center>
      <span>确定要删除选中的分享记录吗？</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmBatchDelete">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailsDialogVisible" :title="$t('workSpace.TaskDetail')" width="550px" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('database.task.task_name')">
          {{ selectedShare.task_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.details')">
          {{ selectedShare.details }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.type')">
          {{ (selectedShare.type?.split(':')[1] || "") === "single" ? $t('taskType.Singleomic') :
            (selectedShare.type?.split(':')[1] || "") === "multi" ? $t('taskType.Multiomics') :
              (selectedShare.type?.split(':')[1] || "") === "deno" ? $t('taskType.Denoising') : $t('taskType.Unknown') }}
          {{ (selectedShare.type?.split(':')[0] || "") === "annotation" ? $t('taskType.Annotation') :
            (selectedShare.type?.split(':')[0] || "") === "training" ? $t('taskType.Training') :
              (selectedShare.type?.split(':')[0] || "") === "denoising" ? "" : $t('taskType.Unknown') }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.re_pretrain')"
          v-if="(selectedShare.type?.split(':')[0] || '') === 'training'">
          <el-tag :type="selectedShare.re_pretrain == true ? 'success' : 'warning'">
            {{ selectedShare.re_pretrain == true ? $t('Yes') : $t('No') }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.models.model_name')">
          {{ selectedShare.model_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.parameters')">
          <el-scrollbar max-height="150px">
            <el-row
              v-for="(param, index) in (selectedShare.parameters || selectedShare.default_parameters || '').split(',')"
              :key="index">
              <el-col :span="24">
                <el-tag type="info" class="param-tag">
                  {{ param.trim() }}
                </el-tag>
              </el-col>
            </el-row>
          </el-scrollbar>
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailsDialogVisible = false">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="optDialogVisible" title="分享操作" width="90%" align-center>
      <div class="operation-buttons">
        <el-button link type="primary" size="small" @click="showShareDetails(currentRow)">
          {{ $t('Detail') }}
        </el-button>
        <el-button link type="warning" size="small" @click="showEditShareDialog(currentRow)">
          {{ $t('Edit') }}
        </el-button>
        <el-button link type="danger" size="small" @click="showDeleteDialog(currentRow)">
          {{ $t('Delete') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from 'axios';
import { ElMessage } from 'element-plus';
import logo from '../assets/logo.png';
import dayjs from 'dayjs';

export default {
  name: 'ManageShare',
  components: {
    MainHeader
  },
  data() {
    return {
      userData: JSON.parse(sessionStorage.getItem("userData")) || {},
      currentRow: {},
      shareList: [],
      paginatedShareList: [], // 当前页的分享数据
      optDialogVisible: false,
      deleteDialogVisible: false,
      batchDeleteDialogVisible: false,
      detailsDialogVisible: false,
      editDialogVisible: false,
      selectedShare: {},
      selectedShares: [],
      currentPage: 1,
      pageSize: 10,
      sortProp: '',
      sortOrder: '',
      loading: false,
      defaultAvatar: logo,
      windowWidth: window.innerWidth,
      editForm: {
        shareId: null,
        password: '',
        dueTime: null,
        receiverName: null,
        companyName: null,
      },

      // 新增搜索相关属性
      filteredUsers: [],
      filteredCompanies: [],
      userSearchKeyword: '',
      companySearchKeyword: '',

      allCompanysIdName: {},
      allUsersIdName: {},

      selectionError: false,
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
    async findAllUserAndCompanys(){
      try {
        const response_c = await axios.get("/api/selectAllCompanyIdName");
        const response_u = await axios.get("/api/selectAllUserIdName");
        
        // 确保数据结构正确
        this.allCompanysIdName = response_c.data.data || {};
        this.allUsersIdName = response_u.data.data || {};
        
        console.log('Companies data:', this.allCompanysIdName);
        console.log('Users data:', this.allUsersIdName);
        
        // 初始化过滤列表
        this.initializeFilteredLists();
      } catch (error) {
        console.error("Failed to fetch users and companies:", error);
        // 设置默认空值以防错误
        this.allCompanysIdName = {};
        this.allUsersIdName = {};
        this.filteredCompanies = [];
        this.filteredUsers = [];
      }
    },
    handleRecipientChange(field, isEdit = false) {
      this.selectionError = false;
      const form = isEdit ? this.editForm : this.shareForm;
        
      if (field === 'accepter' || field === 'receiverName') {
        if (form[field]) {
          // 如果选择了用户，清空公司
          if (isEdit) this.editForm.companyName = '';
          else this.shareForm.companyName = '';
        }
      } else if (field === 'companyName') {
        if (form[field]) {
          // 如果选择了公司，清空用户
          if (isEdit) this.editForm.receiverName = '';
          else this.shareForm.accepter = '';
        }
      }
    },

    // 清空选择
    clearRecipient(field, isEdit = false) {
      const form = isEdit ? this.editForm : this.shareForm;
      form[field] = '';
      this.selectionError = false;
    },
    // 验证选择
    validateSelection(form) {
      const hasUser = form.accepter || form.receiverName;
      const hasCompany = form.companyName;

      if (hasUser && hasCompany) {
        this.selectionError = true;
        return false;
      }

      this.selectionError = false;
      return true;
    },
    statusType(status) {
      switch (status) {
        case 0:
          return "info";
        case 1:
          return "warning";
        case 2:
          return "success";
        case -1:
          return "danger";
        default:
          return "";
      }
    },
    statusText(status) {
      switch (status) {
        case 0:
          return this.$t('status.Pending');
        case 1:
          return this.$t('status.Processing');
        case 2:
          return this.$t('status.Completed');
        case -1:
          return this.$t('status.Error');
        default:
          return this.$t('status.Unknown');
      }
    },
    // 监听窗口大小变化
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    showOptDialog(row) {
      this.currentRow = row;
      this.optDialogVisible = true;
    },

    showEditShareDialog(share) {
      this.selectedShare = share;
      this.editForm = {
        shareId: share.share_id,
        password: share.password || '',
        dueTime: share.due_time || null,
        receiverName: share.receiver_name || '',
        companyName: share.company_name || '',
      };
      // 重置过滤列表
      this.initializeFilteredLists();
      this.editDialogVisible = true;
    },

    // 初始化过滤列表
    initializeFilteredLists() {
      // 确保数据存在且不为空
      if (this.allUsersIdName && Object.keys(this.allUsersIdName).length > 0) {
        this.filteredUsers = Object.values(this.allUsersIdName).filter(user => 
          user && user.user_name && user.user_id
        );
      } else {
        this.filteredUsers = [];
      }
      
      if (this.allCompanysIdName && Object.keys(this.allCompanysIdName).length > 0) {
        this.filteredCompanies = Object.values(this.allCompanysIdName).filter(company => 
          company && company.company_name && company.company_id
        );
      } else {
        this.filteredCompanies = [];
      }
    },

    // 过滤用户方法
    filterUsers(query) {
      this.userSearchKeyword = query;
      if (!this.allUsersIdName || Object.keys(this.allUsersIdName).length === 0) {
        this.filteredUsers = [];
        return;
      }
      
      const allUsers = Object.values(this.allUsersIdName).filter(user => 
        user && user.user_name && user.user_id
      );
      
      if (query) {
        this.filteredUsers = allUsers.filter(user =>
          user.user_name.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        this.filteredUsers = allUsers;
      }
    },

    // 过滤公司方法
    filterCompanies(query) {
      this.companySearchKeyword = query;
      if (!this.allCompanysIdName || Object.keys(this.allCompanysIdName).length === 0) {
        this.filteredCompanies = [];
        return;
      }
      
      const allCompanies = Object.values(this.allCompanysIdName).filter(company => 
        company && company.company_name && company.company_id
      );
      
      if (query) {
        this.filteredCompanies = allCompanies.filter(company =>
          company.company_name.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        this.filteredCompanies = allCompanies;
      }
    },
    cancelEdit() {
      this.editDialogVisible = false;
      this.editForm = {
        shareId: null,
        password: '',
        dueTime: null,
        receiverName: null,
        companyName: null,
      };
    },
    async saveEdit() {
      if (!this.validateSelection(this.editForm)) {
          return;
        }
      try {
        let userId = null;
        let companyId = null;
        // 验证接收者
        if (this.editForm.receiverName) {
          if (this.editForm.receiverName === this.userData.userName) {
            ElMessage.error(this.$t('workSpace.CannotShareToSelf'));
            return;
          }

          const userResponse = await axios.post(`/api/queryIfExistsUserByUserName?userName=${this.editForm.receiverName}`);
          const userData = userResponse.data.data;
          if (userData.state === 0) {
            ElMessage.error(this.$t('workSpace.UserNotExist'));
            return;
          }
          userId = userData.userId;
        }

        // 验证公司
        if (this.editForm.companyName) {
          const companyResponse = await axios.post(`/api/findCompanyByCompanyName?companyName=${this.editForm.companyName}`);
          const companyData = companyResponse.data.data;
          if (companyData.state === 0) {
            ElMessage.error(this.$t('workSpace.CompanyNotExist'));
            return;
          }
          companyId = companyData.userGroup.companyId;
        }

        const shareData = {
          shareId: this.editForm.shareId,
          dueTime: this.editForm.dueTime,
          receiverId: userId ?? -2,
          companyId: companyId ?? -2,
          password: this.editForm.password,
        };

        const response = await axios.put('/api/share/updateShare', shareData);
        
        if (response.data.code === 200) {
          ElMessage.success('分享设置更新成功');
          this.fetchShares()
          this.editDialogVisible = false;
        } else {
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to update share:', error);
        ElMessage.error('更新分享设置失败');
      }
    },

    showDeleteDialog(share) {
      this.deleteDialogVisible = true;
      this.selectedShare = share;
    },
    showBatchDeleteDialog() {
      this.batchDeleteDialogVisible = true;
    },
    showShareDetails(share) {
      this.detailsDialogVisible = true;
      this.selectedShare = share;
    },
    handleSelectionChange(val) {
      this.selectedShares = val;
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting();
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.shareList.sort((a, b) => {
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
      this.updatePaginatedShareList();
    },
    updatePaginatedShareList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedShareList = this.shareList.slice(start, end);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updatePaginatedShareList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updatePaginatedShareList();
    },
    async fetchShares() {
      try {
        this.findAllUserAndCompanys();
        this.loading = true;
        const response = await axios.get('/api/share/findAllShareWithDetails');
        if (response.data.code === 200) {
          const dataObject = response.data.data;
          this.shareList = Object.values(dataObject).map(item => {
            return {
              ...item,
              due_time: item.due_time ? dayjs(item.due_time).format('YYYY-MM-DD HH:mm:ss') : null,
              shared_time: item.shared_time ? dayjs(item.shared_time).format('YYYY-MM-DD HH:mm:ss') : null
            };
          });

          this.applySorting();
        } else {
          console.error('Failed to fetch shares:', response.data.msg);
        }
        this.loading = false;
      } catch (error) {
        console.error('Failed to fetch shares:', error);
        this.loading = false;
      }
    },
    async deleteShare(shareId) {
      try {
        const response = await axios.post(`/api/share/deleteShareByShareId`,{shareId: shareId});
        if (response.data.code === 200) {
          ElMessage.success('分享记录删除成功');
          this.fetchShares();
        } else {
          console.error('Failed to delete share:', response.data.msg);
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to delete share:', error);
      }
    },
    async deleteShareID(shareId) {
      try {
        await axios.delete(`/api/share/deleteShare/${shareId}`);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const share of this.selectedShares) {
        await this.deleteShareID(share.share_id);
      }
      ElMessage.success('批量删除成功');
      this.fetchShares();
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    }
  },
  mounted() {
    this.fetchShares();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
.param-tag {
  margin: 2px 0;
}
</style>