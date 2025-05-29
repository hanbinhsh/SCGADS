<template>
    <div class="main-page">
      <MainHeader></MainHeader>
      <el-main class="fullscreen-section">
        <h1 class="page-name">{{ $t('navigateBar.ManageCompanys') }}</h1>
        <el-divider />
  
        <!-- 表格 -->
        <div class="desktop-view">
          <el-table :data="paginatedCompanyList"
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            v-loading="loading"
            row-key="companyId"
            :expand-row-keys="expandedRows"
            @expand-change="handleExpandChange">
            <!-- 多选功能 -->
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column type="expand">
              <template #default="props">
                <div style="padding: 0 30px 20px 30px;">
                  <div v-if="loadingCompanyUsers && currentExpandedCompany === props.row.companyId" style="text-align: center;">
                    <el-icon class="is-loading"><loading /></el-icon> loading...
                  </div>
                  <div v-else-if="companyUsersMap[props.row.companyId] && companyUsersMap[props.row.companyId].length > 0">
                    <el-table :data="companyUsersMap[props.row.companyId]" style="width: 100%">
                      <el-table-column prop="username" label="用户" sortable min-width="150">
                        <template #default="{ row }">
                          <div style="display: flex; align-items: center;">
                            <el-avatar :size="20" :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar"></el-avatar>
                            <span style="margin-left: 8px;">{{ row.userName }}</span>
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="email" :label="$t('Email')" sortable min-width="180"></el-table-column>
                      <el-table-column prop="phone" :label="$t('Phone')" sortable min-width="160"></el-table-column>
                      <el-table-column :label="$t('Operations')" width="120" fixed="right">
                        <template #default="{ row }">
                          <el-button link type="danger" size="small" @click="removeUserFromCompany(row.userId, props.row.companyId)">
                            {{ $t('Delete') }}
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <div v-else style="text-align: center;">
                    Empty
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="companyName" :label="$t('database.company.company_name')" sortable>
              <template #default="{ row }">
                <div style="display: flex; align-items: center;">
                  <!-- <el-avatar :size="24"
                    :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar">
                  </el-avatar> -->
                  <span style="margin-left: 8px;">{{ row.companyName }}</span>
                </div>
              </template>
            </el-table-column>
    
            <!-- 操作列 -->
            <el-table-column fixed="right" :label="$t('Operations')" width="150">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="showAddUserDialog(row)">{{ $t('Add') }}</el-button>
                <!-- <el-button link type="primary" size="small" @click="showEditDialog(row)">{{ $t('Edit') }}</el-button> -->
                <el-button link type="danger" size="small" @click="showDeleteDialog(row)">
                  {{ $t('Delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 添加用户到公司对话框 -->
        <el-dialog v-model="addUserDialogVisible" :title="`添加用户到 ${selectedCompany ? selectedCompany.companyName : '公司'}`" width="500" align-center>
          <el-form :model="addUserForm" label-width="100px" label-position="left">
            <el-form-item label="用户" class="form-item">
              <el-select v-model="addUserForm.userId" filterable placeholder="选择一个用户" class="form-input">
                <el-option 
                  v-for="user in availableUsers" 
                  :key="user.userId" 
                  :label="user.userName" 
                  :value="user.userId">
                  <div style="display: flex; align-items: center;">
                    <el-avatar :size="24" :src="user.avatarBase64 ? 'data:image/jpeg;base64,' + user.avatarBase64 : defaultAvatar"></el-avatar>
                      <span style="margin-left: 8px;">{{ user.userName }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer-desktop">
             <el-button @click="addUserDialogVisible = false">取消</el-button>
             <el-button type="primary" @click="confirmAddUserToCompany">确认</el-button>
            </div>
          </template>
        </el-dialog>
  
        <!-- 分页组件 -->
        <el-pagination 
          class="pagination" 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange"
          :current-page="currentPage" 
          :page-sizes="[5, 10, 20, 50]" 
          :page-size="pageSize"
          :layout="paginationLayout"
          :total="companyList.length"
          :small="isMobile"
          :hide-on-single-page="false">
        </el-pagination>
  
        <!-- 按钮行 -->
        <div class="footer">
          <div class="footer-button-row">
            <el-button type="success" @click="showCreateDialog">
              {{ $t('Create') }}
            </el-button>
            <el-button type="success" @click="fetchCompanyList">
              {{ $t('Refresh') }}
            </el-button>
            <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedCompanys.length === 0">
              {{ $t('BatchDelete') }}
            </el-button>
          </div>
        </div>
      </el-main>

      <!-- 创建公司对话框 -->
      <el-dialog v-model="createDialogVisible" title="Create Company" width="500" align-center>
        <el-form :model="companyForm" label-width="100px" label-position="left">
          <el-form-item label="Name" class="form-item">
            <el-input v-model="companyForm.companyName" class="form-input"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer-desktop">
            <el-button @click="createDialogVisible = false">{{ $t('Cancel') }}</el-button>
            <el-button type="primary" @click="insertCompany">{{ $t('Confirm') }}</el-button>
          </div>
        </template>
      </el-dialog>
  
      
      <!-- 编辑对话框 -->
      <el-dialog v-model="editDialogVisible" title="Edit Company" width="500" align-center>
        <el-form :model="selectedCompany" label-width="100px" label-position="left">
          <el-form-item label="Name" class="form-item">
            <el-input v-model="selectedCompany.companyName" class="form-input"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer-desktop">
            <el-button @click="editDialogVisible = false">{{ $t('Cancel') }}</el-button>
            <el-button type="primary" @click="confirmEdit">{{ $t('Save') }}</el-button>
          </div>
        </template>
      </el-dialog>
  
      <!-- 删除确认对话框 -->
      <el-dialog v-model="deleteDialogVisible" :title="$t('Warning')" :width="isMobile ? '90%' : '500'" align-center>
        <span>{{ $t('managePage.Company') }} <strong style="color: #e74c3c;">{{ selectedCompany ? selectedCompany.companyName : '' }}</strong> {{ $t('managePage.willbedeleted') }}</span>
        <template #footer>
          <div class="dialog-footer-desktop">
            <el-button @click="deleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
            <el-button type="danger" @click="confirmDelete">{{ $t('Confirm') }}</el-button>
          </div>
        </template>
      </el-dialog>
  
      <!-- 批量删除确认对话框 -->
      <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" :width="isMobile ? '90%' : '500'" align-center>
        <span>Are you sure you want to delete the selected users?</span>
        <template #footer>
          <div class="dialog-footer-desktop">
            <el-button @click="batchDeleteDialogVisible = false">{{ $t('Cancel') }}</el-button>
            <el-button type="danger" @click="confirmBatchDelete">{{ $t('Confirm') }}</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import MainHeader from "../components/MainHeader.vue";
  import axios from "axios";
  import { ElMessage } from 'element-plus';
  import logo from '../assets/logo.png';
  import { Loading } from '@element-plus/icons-vue';
  
  export default {
    name: "WorkSpace",
    components: {
      MainHeader,
      Loading
    },
    data() {
      return {
        companyList: [],
        companyForm: {
          companyName: '',
          phone: '',
          address: ''
        },
        selectedCompanys: [],
        selectedCompany: null,
        paginatedCompanyList: [],
        userList: [], // 用于存储用户数据
        createDialogVisible: false,
        deleteDialogVisible: false,
        batchDeleteDialogVisible: false,
        editDialogVisible: false,
        detailDialogVisible: false,
        isEditing: false,
        userData: JSON.parse(sessionStorage.getItem('userData')) || {},
        currentPage: 1, // 当前页
        pageSize: 10, // 每页显示条数
        sortProp: '', // 当前排序属性
        sortOrder: '', // 当前排序方向
        defaultAvatar: logo,
        loading: false,
        windowWidth: window.innerWidth,
        expandedRows: [], // 当前展开的行
        companyUsersMap: {}, // 存储每个公司的用户列表 {companyId: [users]}
        loadingCompanyUsers: false, // 是否正在加载公司用户
        currentExpandedCompany: null, // 当前展开的公司ID
        addUserDialogVisible: false, // 添加用户对话框是否可见
        addUserForm: {
          userId: null,
          companyId: null
        },
        availableUsers: [] // 可添加到公司的用户列表
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
      // 显示编辑对话框
      showEditDialog(company) {
        this.editDialogVisible = true;
        this.selectedCompany = { ...company};
      },
      // 显示删除对话框
      showDeleteDialog(company) {
        
        this.deleteDialogVisible = true;
        this.selectedCompany = company;        
        // 如果是从详情对话框打开的，关闭详情对话框
        if (this.detailDialogVisible) {
          this.detailDialogVisible = false;
        }
      },
      showCreateDialog() {
        this.createDialogVisible = true;
      },
      // 显示批量删除对话框
      showBatchDeleteDialog() {
        this.batchDeleteDialogVisible = true;
      },
      // 确认删除操作
      async confirmDelete() {
        try {
          await axios.get(`/api/deleteCompanyByID?companyID=${this.selectedCompany.companyId}`);
          this.fetchCompanyList();
          ElMessage.success('Company deleted successfully.');
        } catch (error) {
          ElMessage.error('Failed to delete company.');
          console.error("Delete failed:", error);
        } finally {
          this.deleteDialogVisible = false;
        }
      },
      // 确认批量删除操作
      async confirmBatchDelete() {
        this.batchDeleteDialogVisible = false;
  
        // 过滤掉当前用户自身，防止删除自己
        const usersToDelete = this.selectedUsers.filter(user => user.userId !== this.userData.userId);
  
        if (usersToDelete.length < this.selectedUsers.length) {
          ElMessage.warning("Cannot delete your own account. It has been excluded from the batch delete.");
        }
  
        for (const user of usersToDelete) {
          await this.deleteUserByID(user.userId);
        }
  
        ElMessage.success('Batch delete completed.');
        this.fetchUserList();
      },
      // 执行单个删除操作
      async deleteUserByID(userId) {
        try {
          await axios.get(`/api/deleteUserByUserID?userID=${userId}`);
        } catch (error) {
          console.error("Delete failed:", error);
        }
      },
      // 确认编辑操作
      async confirmEdit() {
        try {
          const formData = new FormData();
          for (const key in this.selectedCompany) {
            formData.append(key, this.selectedCompany[key]);
          }
          formData.delete('avatarBase64')
          await axios.post(`/api/updateCompany`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
  
          this.fetchCompanyList();
          ElMessage.success('Company updated successfully.');
          
          // 关闭相应的对话框
          if (this.editDialogVisible) {
            this.editDialogVisible = false;
          }
          if (this.detailDialogVisible) {
            this.isEditing = false;
          }
        } catch (error) {
          ElMessage.error('Failed to update user.');
          console.error("Edit failed:", error);
        }
      },
      //创建公司
      async insertCompany(){
        try {
          this.loading = true;
          const response = await axios.post("/api/insertCompany", this.companyForm);
          if (response.data.code === 1) {
            this.fetchCompanyList();
            ElMessage.success('Company created successfully.');
          } else {
            ElMessage.error('Failed to create company.');
            console.error("Failed to fetch user list:", response.data.msg);
          }
          this.loading = false;
        } catch (error) {
          console.error("Failed to fetch user list:", error);
        }
        if(this.createDialogVisible){
          this.createDialogVisible = false;
        }
      },
      //获取公司数据
      async fetchCompanyList() {
        try {
          this.loading = true;
          const response = await axios.post("/api/selectAllCompany");
          if (response.data.code === 200) {
            this.companyList = response.data.data;
            this.applySorting(); // 调用排序函数
          } else {
            console.error("Failed to fetch company list:", response.data.msg);
          }
          this.loading = false;
        } catch (error) {
          console.error("Failed to fetch company list:", error);
        }
      },
      handleSortChange({ prop, order }) {
        this.sortProp = prop;
        this.sortOrder = order;
        this.applySorting(); // 调用排序函数
      },
      applySorting() {
        if (this.sortProp && this.sortOrder) {
          this.companyList.sort((a, b) => {
            const aValue = a[this.sortProp];
            const bValue = b[this.sortProp];
            if (aValue < bValue) return this.sortOrder === 'ascending' ? -1 : 1;
            if (aValue > bValue) return this.sortOrder === 'ascending' ? 1 : -1;
            return 0;
          });
        }
        this.updatePaginatedCompanyList();
      },
      // 更新分页数据
      updatePaginatedCompanyList() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedCompanyList = this.companyList.slice(start, end);
      },
      handleSelectionChange(val) {
        this.selectedCompanys = val;
      },
      handleSizeChange(val) {
        this.pageSize = val;
        this.updatePaginatedCompanyList();
      },
      handleCurrentChange(val) {
        this.currentPage = val;
        this.updatePaginatedCompanyList();
      },
      // 监听窗口大小变化
      handleResize() {
        this.windowWidth = window.innerWidth;
      },

      // 处理行展开事件
      handleExpandChange(row, expandedRows) {
        if (expandedRows.length > 0) {
          this.currentExpandedCompany = row.companyId;
          this.expandedRows = [row.companyId];
          this.loadCompanyUsers(row.companyId);
        } else {
          this.expandedRows = [];
          this.currentExpandedCompany = null;
        }
      },
      // 加载公司用户
      async loadCompanyUsers(companyId) {
        // if (this.companyUsersMap[companyId] && this.companyUsersMap[companyId].length > 0) {
        //   return; // 如果已经加载过，就不再加载
        // }
    
        try {
          this.loadingCompanyUsers = true;
          const response = await axios.get(`/api/getCompanyUsers?companyId=${companyId}`);
      
          if (response.data.code === 200) {
            this.companyUsersMap[companyId] = response.data.data || [];
          } else {
            console.error("获取公司用户失败:", response.data.msg);
            this.companyUsersMap[companyId] = [];
          }
        } catch (error) {
          console.error("加载公司用户出错:", error);
          this.companyUsersMap[companyId] = [];
        } finally {
          this.loadingCompanyUsers = false;
        }
      },
      // 显示添加用户对话框
      showAddUserDialog(company) {
        this.selectedCompany = company;
        this.addUserForm.companyId = company.companyId;
        this.addUserForm.userId = null;
        this.loadAvailableUsers(company.companyId);
        this.addUserDialogVisible = true;
        this.addUserForm = {
          userId: null,
          companyId: company.companyId // 设置当前选中公司的ID
        };
      },
  
      // 加载可添加到公司的用户
      async loadAvailableUsers(companyId) {
        try {
          this.loading = true;
          // 获取所有用户
          const response = await axios.get("/api/findUsers");
      
          if (response.data.code === 200) {
            const allUsers = response.data.data;
            // 获取公司已有用户
            const companyUsers = this.companyUsersMap[companyId] || [];
            const companyUserIds = companyUsers.map(user => user.userId);
        
            // 过滤掉已经在公司的用户
            this.availableUsers = allUsers.filter(user => !companyUserIds.includes(user.userId));
          } else {
            console.error("获取用户列表失败:", response.data.msg);
            this.availableUsers = [];
          }
        } catch (error) {
          console.error("加载可用用户失败:", error);
          this.availableUsers = [];
        } finally {
          this.loading = false;
        }
      },
      // 确认添加用户到公司
      async confirmAddUserToCompany() {
        if (!this.addUserForm.userId) {
          ElMessage.warning('请选择一个用户');
          return;
          }
    
        try {
          const response = await axios.post("/api/addUserToCompany", {
            userId: this.addUserForm.userId,
            companyId: this.addUserForm.companyId,
          });
      
          if (response.data.code === 1) {
            ElMessage.success('用户成功添加到公司');
            this.addUserDialogVisible = false;
        
            // 重新加载公司用户
            this.loadCompanyUsers(this.addUserForm.companyId);
          } else {
            ElMessage.error('添加用户到公司失败');
          }
            } catch (error) {
              console.error("添加用户到公司失败:", error);
              ElMessage.error('添加用户到公司失败');
            }
      },
  
      // 从公司中移除用户
      async removeUserFromCompany(userId, companyId) {
        try {
          const response = await axios.post("/api/removeUserFromCompany", {
            userId: userId,
            companyId: companyId
          });
      
          if (response.data.code === 1) {
            ElMessage.success('用户已从公司中移除');
        
            // 更新本地数据
            if (this.companyUsersMap[companyId]) {
              this.companyUsersMap[companyId] = this.companyUsersMap[companyId].filter(
                user => user.userId !== userId
              );
            }
          } else {
            ElMessage.error(response.data.msg || '移除用户失败');
          }
        } catch (error) {
          console.error("从公司移除用户失败:", error);
          ElMessage.error('从公司移除用户失败');
        }
      }
    },
    mounted() {
      this.fetchCompanyList();
      window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.handleResize);
    }
  };
  </script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.mobile-full-dialog {
  border-radius: 0;
  margin: 0;
  width: 100%;
  height: 100%;
}

.mobile-edit-form {
  padding: 15px;
}
</style>
  