<template>
  <div class="main-page">
    <MainHeader></MainHeader>
    <section class="fullscreen-section">
      <h1 class="page-name">Manage Users</h1>
      <el-divider />
      <!-- 用户列表表格 -->
      <el-table :data="paginatedUserList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        v-loading="loading">
        <!-- 多选功能 -->
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="userName" label="User" sortable>
          <template #default="{ row }">
            <div style="display: flex; align-items: center;">
              <el-avatar :size="24"
                :src="row.avatarBase64 ? 'data:image/jpeg;base64,' + row.avatarBase64 : defaultAvatar">
              </el-avatar>
              <span style="margin-left: 8px;">{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="Email" sortable></el-table-column>
        <el-table-column prop="phone" label="Phone" sortable></el-table-column>
        <el-table-column prop="isAdmin" label="Admin" sortable></el-table-column>

        <!-- 操作列 -->
        <el-table-column fixed="right" label="Operations" width="150">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showEditDialog(row)">Edit</el-button>
            <!-- 禁用删除按钮 -->
            <el-button v-if="row.userId === this.userData.userId" link type="default" size="small" disabled>
              Delete
            </el-button>
            <!-- 可点击的删除按钮 -->
            <el-button v-else link type="danger" size="small" @click="showDeleteDialog(row)">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination class="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="userList.length">
      </el-pagination>
    </section>

    <!-- 按钮行 -->
    <div class="footer">
      <div class="footer-button-row">
        <el-button type="success" @click="fetchUserList">
        Refresh
      </el-button>
      <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedUsers.length === 0">
        Batch Delete
      </el-button>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>User <strong style="color: #e74c3c;">{{ selectedUser.userName }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmDelete">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量删除确认对话框 -->
    <el-dialog v-model="batchDeleteDialogVisible" title="Batch Delete Confirmation" width="500" align-center>
      <span>Are you sure you want to delete the selected users?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmBatchDelete">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="Edit User" width="500" align-center>
      <el-form :model="selectedUser" label-width="100px" label-position="left">
        <el-form-item label="User Name" class="form-item">
          <el-input v-model="selectedUser.userName" class="form-input"></el-input>
        </el-form-item>
        <el-form-item label="Password" class="form-item">
          <el-input v-model="selectedUser.psw" type="password" show-password placeholder="Enter new password"
            class="form-input"></el-input>
        </el-form-item>
        <el-form-item label="Email" class="form-item">
          <el-input v-model="selectedUser.email" class="form-input"></el-input>
        </el-form-item>
        <el-form-item label="Phone" class="form-item">
          <el-input v-model="selectedUser.phone" class="form-input"></el-input>
        </el-form-item>
        <el-form-item label="Admin" class="form-item">
          <el-switch v-model="selectedUser.isAdmin" :active-value="1" :inactive-value="0"
            :disabled="selectedUser.userId === this.userData.userId"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="confirmEdit">Save</el-button>
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

export default {
  name: "WorkSpace",
  components: {
    MainHeader,
  },
  data() {
    return {
      userList: [], // 用于存储用户数据
      paginatedUserList: [], // 当前页的用户数据
      selectedUsers: [], // 存储多选选中的用户
      deleteDialogVisible: false,
      batchDeleteDialogVisible: false,
      editDialogVisible: false,
      selectedUser: null,
      userData: JSON.parse(sessionStorage.getItem('userData')) || {},
      currentPage: 1, // 当前页
      pageSize: 10, // 每页显示条数
      sortProp: '', // 当前排序属性
      sortOrder: '', // 当前排序方向
      defaultAvatar: logo,
      loading:false,
    };
  },
  methods: {
    // 显示删除对话框
    showDeleteDialog(user) {
      if (user.userId === this.userData.userId) {
        ElMessage.warning('You cannot delete your own account.');
        return;
      }
      this.deleteDialogVisible = true;
      this.selectedUser = user;
    },
    // 显示批量删除对话框
    showBatchDeleteDialog() {
      this.batchDeleteDialogVisible = true;
    },
    // 显示编辑对话框
    showEditDialog(user) {
      this.editDialogVisible = true;
      this.selectedUser = { ...user, psw: '' }; // 创建用户数据的副本，且密码初始为空
    },
    // 确认删除操作
    async confirmDelete() {
      try {
        await axios.get(`/api/deleteUserByUserID?userID=${this.selectedUser.userId}`);
        this.fetchUserList();
        ElMessage.success('User deleted successfully.');
      } catch (error) {
        ElMessage.error('Failed to delete user.');
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
        for (const key in this.selectedUser) {
          formData.append(key, this.selectedUser[key]);
        }
        formData.delete('avatarBase64')
        await axios.post(`/api/updateUser`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        this.fetchUserList();
        ElMessage.success('User updated successfully.');
      } catch (error) {
        ElMessage.error('Failed to update user.');
        console.error("Edit failed:", error);
      } finally {
        this.editDialogVisible = false;
      }
    },
    // 获取用户数据
    async fetchUserList() {
      try {
        this.loading = true;
        const response = await axios.get("/api/findUsers");
        if (response.data.code === 200) {
          this.userList = response.data.data;
          this.applySorting(); // 调用排序函数
        } else {
          console.error("Failed to fetch user list:", response.data.msg);
        }
        this.loading = false;
      } catch (error) {
        console.error("Failed to fetch user list:", error);
      }
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting(); // 调用排序函数
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.userList.sort((a, b) => {
          const aValue = a[this.sortProp];
          const bValue = b[this.sortProp];
          if (aValue < bValue) return this.sortOrder === 'ascending' ? -1 : 1;
          if (aValue > bValue) return this.sortOrder === 'ascending' ? 1 : -1;
          return 0;
        });
      }
      this.updatePaginatedUserList();
    },
    // 更新分页数据
    updatePaginatedUserList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedUserList = this.userList.slice(start, end);
    },
    handleSelectionChange(val) {
      this.selectedUsers = val;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updatePaginatedUserList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updatePaginatedUserList();
    },
  },
  mounted() {
    this.fetchUserList();
  },
};
</script>
