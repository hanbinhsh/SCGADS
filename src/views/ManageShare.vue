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
        <el-table-column prop="shared_time" :label="$t('database.share.shared_time')" width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.shared_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="due_time" :label="$t('database.share.due_time')" width="160" sortable>
          <template #default="{ row }">
            <span v-if="row.due_time">{{ formatDate(row.due_time) }}</span>
            <span v-else style="color: #67C23A;">永久</span>
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
            <el-button link type="warning" size="small" @click="showEditDialog(row)">{{ $t('Edit') }}</el-button>
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
      :width="isMobile ? '95%' : '600px'"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="密码设置">
          <el-input
            v-model="editForm.password"
            placeholder="留空表示无密码保护"
            show-password
            clearable
          ></el-input>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailsDialogVisible" title="分享详情" width="600" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="分享者">{{ selectedShare.sharer_name }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ selectedShare.task_name }}</el-descriptions-item>
        <el-descriptions-item label="接收者">
          <span v-if="selectedShare.receiver_name">{{ selectedShare.receiver_name }}</span>
          <span v-else-if="selectedShare.company_name">{{ selectedShare.company_name }} (公司)</span>
          <span v-else>公开分享</span>
        </el-descriptions-item>
        <el-descriptions-item label="分享时间">{{ formatDate(selectedShare.shared_time) }}</el-descriptions-item>
        <el-descriptions-item label="到期时间">
          <span v-if="selectedShare.due_time">{{ formatDate(selectedShare.due_time) }}</span>
          <span v-else style="color: #67C23A;">永久</span>
        </el-descriptions-item>
        <el-descriptions-item label="密码保护">
          <el-tag v-if="selectedShare.password" type="warning">有密码</el-tag>
          <el-tag v-else type="success">无密码</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailsDialogVisible = false">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="optDialogVisible" title="分享操作" width="90%" align-center>
      <div class="operation-buttons">
        <el-button link type="primary" size="small" @click="showShareDetails(currentRow)">
          {{ $t('Details') }}
        </el-button>
        <el-button link type="warning" size="small" @click="showEditDialog(currentRow)">
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
        dueTime: null
      }
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
    // 监听窗口大小变化
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    showOptDialog(row) {
      this.currentRow = row;
      this.optDialogVisible = true;
    },

    showEditDialog(share) {
      this.selectedShare = share;
      this.editForm = {
        shareId: share.share_id,
        password: share.password || '',
        dueTime: share.due_time || null
      };
      this.editDialogVisible = true;
    },

    cancelEdit() {
      this.editDialogVisible = false;
      this.editForm = {
        shareId: null,
        password: '',
        dueTime: null
      };
    },

    async saveEdit() {
      try {
        const response = await axios.put('/api/share/updateShare', this.editForm);
        
        if (response.data.code === 200) {
          ElMessage.success('分享设置更新成功');
          this.fetchShares();
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