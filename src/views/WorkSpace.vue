<template>
  <div class="dashboard-container">
    <MainHeader></MainHeader>
    
    <div class="content-container">
      <!-- Left Column with 4 Cards -->
      <div class="left-column" :class="{ 'with-expanded-right': isRightColumnExpanded }">
        <!-- Card 1: Status Chart -->
        <el-card class="dashboard-card animate__animated animate__fadeInLeft" :body-style="{ height: '100%', overflow: 'auto'}" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span>{{ $t('workSpace.TaskStatus') }}</span>
            </div>
          </template>

          <div class="chart-container">
            <el-row style="height: 100%;">
              <!-- 左侧：圆环图 + 任务统计 -->
              <el-col v-if="!isMobileView" :span="isRightColumnExpanded ? 24 : 8" class="left-section">
                <div ref="statusChart" class="status-chart"></div>
                <!-- 任务统计信息 -->
                <el-row>
                  <el-col :span="12">
                    <el-row><el-tag type="warning" style="width: 80px;">{{ $t('status.Pending') }}</el-tag></el-row>
                    <el-row><el-tag type="primary" style="width: 80px;">{{ $t('status.Processing') }}</el-tag></el-row>
                    <el-row><el-tag type="success" style="width: 80px;">{{ $t('status.Completed') }}</el-tag></el-row>
                    <el-row><el-tag type="danger"  style="width: 80px;">{{ $t('status.Error') }}</el-tag></el-row>
                  </el-col>
                  <el-col :span="10">
                    <el-row><span class="status-count">{{ pendingCount }}</span></el-row>
                    <el-row><span class="status-count">{{ processingCount }}</span></el-row>
                    <el-row><span class="status-count">{{ completedCount }}</span></el-row>
                    <el-row><span class="status-count">{{ errorCount }}</span></el-row>
                  </el-col>
                </el-row>
              </el-col>

              <!-- 右侧：最近完成任务栏 -->
              <el-col :span="isMobileView ? 24 : isRightColumnExpanded ? 0 : 16" class="right-section">
                <div class="success-tasks-list">
                  <div v-if="completedCount === 0" class="empty-state">
                    {{ $t('workSpace.Norecentcompletedtaskfound') }}
                  </div>
                  <div v-for="(task, index) in sortedCompletedTasks" :key="index" class="success-task-item">
                    <div class="success-task-header">
                      <font-awesome-icon :style="{ color: '#67C23A' }" :icon="['fas', 'circle']" />
                      <span class="success-task-name">{{ task.task_name }}</span>
                      <el-button link type="success" size="small" @click="showCharts(task.task_name)" :disabled="task.status !== 2" style="margin-left: auto;">
                        {{ $t('navigateBar.Virtualization') }}
                      </el-button>
                    </div>
                    <div class="success-task-details">
                      {{ task.details || "No details available" }}
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- Card 2: MyShares -->
        <el-card class="dashboard-card animate__animated animate__fadeInLeft" :body-style="{ height: '100%', overflow: 'auto' }" v-loading="shareLoading">
          <template #header>
            <div class="card-header">
              <span>{{ $t('workSpace.MyShares') }}</span>
            </div>
          </template>
          <div class="success-tasks-list">
            <div v-if="shareCount === 0" class="empty-state">
              {{ $t('workSpace.Norecentsharesfound') }}
            </div>
            <div v-for="(data, index) in shareList" :key="index" class="success-task-item">
              <div class="success-task-header">
                <font-awesome-icon :style="{ color: getStatusColor(data.status)}" :icon="['fas', 'circle']" />
                <span class="success-task-name">{{ data.task_name }}</span>

                <el-button link type="info" size="small" @click="" style="margin-left: auto" v-if="!isRightColumnExpanded">
                  {{ $t('Detail') }}
                </el-button>
                <el-button link type="info" size="small" @click="" v-if="!isRightColumnExpanded">
                  {{ $t('workSpace.CopyLink') }}
                </el-button>
                <el-button link type="success" size="small" @click="showCharts(data.task_name)" :disabled="data.status !== 2" v-if="!isRightColumnExpanded">
                  {{ $t('navigateBar.Virtualization') }}
                </el-button>
                <el-button link type="primary" size="small" @click="" v-if="!isRightColumnExpanded">
                  {{ $t('Edit') }}
                </el-button>
                <el-button link type="danger" size="small" @click="" v-if="!isRightColumnExpanded">
                  {{ $t('Delete') }}
                </el-button>
              </div>

              <div class="success-task-details">
                {{ formatDate(data.shared_time) }} 
                <span v-if="!data.due_time && !isRightColumnExpanded" class="share-status-badge share-status-indefinite"> {{ $t('workSpace.Indefinite') }} </span>
                <span v-if="new Date() > new Date(data.due_time) && !isRightColumnExpanded" class="share-status-badge share-status-expired"> {{ $t('workSpace.Expired') }} </span>
                <span v-if="data.due_time && !isRightColumnExpanded" style="font-size: 11px; color: #666; margin-left: auto">
                  {{ $t('workSpace.Expire') }}: {{ formatDate(data.due_time) }}
                </span>
                <el-progress 
                  v-if="new Date() <= new Date(data.due_time) && !isRightColumnExpanded"
                  :percentage="getShareProgress(data.shared_time, data.due_time)" 
                  type="line"
                  style="margin-left: 10px; width: 80px;"
                  :stroke-width="10"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- My Models -->
        <el-card class="dashboard-card animate__animated animate__fadeInLeft" :body-style="{ height: '100%', overflow: 'auto' }" v-loading="modelLoading">
          <template #header>
            <div class="card-header">
              <span>{{ $t('workSpace.MyModels') }}</span>
            </div>
          </template>
          <div class="success-tasks-list">
            <div v-if="modelCount === 0" class="empty-state">
              {{ $t('workSpace.Nomodelsfound') }}
            </div>
            <div v-for="(model, index) in sortedRecentModels" :key="index" class="success-task-item">
              <div class="success-task-header">
                <font-awesome-icon :style="{ color: '#409EFF' }" :icon="['fas', 'cube']" />
                <span class="success-task-name">{{ model.modelName }}</span>
                <el-tag size="small" type="info" style="margin-left: 10px;" v-if="!isRightColumnExpanded">
                  {{ getModelTypeText(model.modelType) }}
                </el-tag>
                <el-button link type="primary" size="small" @click="showModelDetails = true; selectedData = model" style="margin-left: auto;" v-if="!isRightColumnExpanded">
                  {{ $t('Detail') }}
                </el-button>
              </div>
              <div class="success-task-details">
                <span>{{ $t('workSpace.Created') }}: {{ formatDate(model.createdTime) }}</span>
                <span v-if="model.remark && !isRightColumnExpanded" style="margin-left: 10px; color: #909399;">
                  {{ model.remark.length > 30 ? model.remark.substring(0, 30) + '...' : model.remark }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- Shares Received -->
        <el-card class="dashboard-card animate__animated animate__fadeInLeft" :body-style="{ height: '100%', overflow: 'auto' }" v-loading="shareLoading">
          <template #header>
            <div class="card-header">
              <span>{{ $t('workSpace.ShareReceived') }}</span>
            </div>
          </template>
          <div class="success-tasks-list">
            <div v-if="receivedShareCount === 0" class="empty-state">
              {{ $t('workSpace.Norecentreceivedsharesfound') }}
            </div>
            <div v-for="(data, index) in shareReceivedList" :key="index" class="success-task-item">
              <div class="success-task-header">
                <font-awesome-icon :style="{ color: getStatusColor(data.status)}" :icon="['fas', 'circle']" />
                <span class="success-task-name">{{ data.task_name }}</span>

                <el-button link type="info" size="small" @click="" style="margin-left: auto;" v-if="!isRightColumnExpanded">
                  {{ $t('Detail') }}
                </el-button>
                <el-button link type="info" size="small" @click="" v-if="!isRightColumnExpanded">
                  {{ $t('workSpace.CopyLink') }}
                </el-button>
                <el-button link type="success" size="small" @click="showCharts(data.task_name)" :disabled="data.status !== 2" v-if="!isRightColumnExpanded">
                  {{ $t('navigateBar.Virtualization') }}
                </el-button>
              </div>

              <div class="success-task-details">
                {{ formatDate(data.shared_time) }}
                
                <span v-if="!data.due_time && !isRightColumnExpanded" class="share-status-badge share-status-indefinite"> {{ $t('workSpace.Indefinite') }} </span>
                <span v-if="new Date() > new Date(data.due_time) && !isRightColumnExpanded" class="share-status-badge share-status-expired"> {{ $t('workSpace.Expired') }} </span>
                <span v-if="data.due_time && !isRightColumnExpanded" style="font-size: 11px; color: #666;">
                  {{ $t('workSpace.Expire') }}: {{ formatDate(data.due_time) }}
                </span>
                <el-progress 
                  v-if="new Date() <= new Date(data.due_time) && !isRightColumnExpanded"
                  :percentage="getShareProgress(data.shared_time, data.due_time)" 
                  type="line"
                  style="margin-left: 10px; width: 80px;"
                  :stroke-width="10"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- Right Column with Collapsible Task List -->
    <div class="right-column animate__animated animate__fadeInRight"
      :class="{ 'expanded': isRightColumnExpanded, 'collapsed': !isRightColumnExpanded }">
      <div class="column-toggle" @click="toggleRightColumn">
      <el-button type="primary" :icon="isRightColumnExpanded ? 'arrow-right' : 'arrow-left'">
        {{ isRightColumnExpanded ? $t('workSpace.Collapse') : $t('workSpace.Expand') }}
      </el-button>
    </div>
    
    <!-- Collapsed -->
    <div v-if="!isRightColumnExpanded" class="collapsed-task-list">
      <el-table :data="paginatedTaskList" 
        style="width: 100%" 
        v-loading="loading">
        <el-table-column prop="task_name" :label="$t('database.task.task_name')">
          <template #default="{ row }">
            <font-awesome-icon :style="{ color: getStatusColor(row.status)}" :icon="['fas', 'circle']" />
            {{ row.task_name }}
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Simplified Pagination -->
      <el-pagination 
        class="pagination" 
        @current-change="handleCurrentChange"
        :current-page="currentPage" 
        :page-size="pageSize"
        layout="prev, pager, next" 
        :total="taskList.length">
      </el-pagination>
    </div>
    
    <!-- Expanded -->
    <div v-else class="expanded-task-list">
      <!-- 新增TAB栏 -->
      <el-tabs v-model="activeTab" type="card" class="right-column-tabs">
        <el-tab-pane :label="$t('workSpace.Tasks')" name="tasks">
          <!-- Original Full Table Layout -->
          <el-table :data="paginatedTaskList" 
            style="width: 100%"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            v-loading="loading">
            <!-- 多选框 -->
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="task_name" :label="$t('database.task.task_name')" sortable>
              <template #default="{ row }">
                <font-awesome-icon :style="{ color: getStatusColor(row.status)}" :icon="['fas', 'circle']" />
                {{ row.task_name }}
              </template>
            </el-table-column>
            <el-table-column prop="type" :label="$t('database.task.type')" sortable>
              <template #default="{ row }">
                {{ (row.type?.split(':')[1] || "") === "single"     ? $t('taskType.Singleomic') :
                   (row.type?.split(':')[1] || "") === "multi"      ? $t('taskType.Multiomics') :
                   (row.type?.split(':')[1] || "") === "deno"       ? $t('taskType.Denoising')  : $t('taskType.Unknown')}}
                {{ (row.type?.split(':')[0] || "") === "annotation" ? $t('taskType.Annotation') :
                   (row.type?.split(':')[0] || "") === "training"   ? $t('taskType.Training')   :
                   (row.type?.split(':')[0] || "") === "denoising"  ? "" : $t('taskType.Unknown')}}
              </template>
            </el-table-column>
            <el-table-column prop="model_name" :label="$t('database.models.model_name')" sortable>
              <template #default="{ row }">
                {{ row.model_name ?? "Unknown" }}
              </template>
            </el-table-column>
            <el-table-column prop="start_time" :label="$t('database.task.start_time')" sortable>
              <template #default="{ row }">
                {{ formatDate(row.start_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="end_time" :label="$t('database.task.end_time')" sortable>
              <template #default="{ row }">
                {{ (row.end_time&&row.status===2) ? formatDate(row.end_time) :  $t('Notcompletedyet') }}
              </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('database.task.status')" sortable>
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('Operations')" width="300">
              <template #default="{ row }">
                <el-button link type="success" size="small" @click="showCharts(row.task_name)" :disabled="row.status !== 2">
                  {{ $t('navigateBar.Virtualization') }}
                </el-button>
                <el-button link type="info" size="small" @click="showShareDialog(row)">
                  {{ $t('Share') }}
                </el-button>
                <el-button link type="primary" size="small" @click="showDetailDialog(row)">
                  {{ $t('Detail') }}
                </el-button>
                <el-button link type="danger" size="small" @click="showDeleteDialog(row)">
                  {{ $t('Delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Full Pagination -->
          <el-pagination 
            class="pagination" 
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange"
            :current-page="currentPage" 
            :page-sizes="[5, 10, 20, 50]" 
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper" 
            :total="taskList.length">
          </el-pagination>
          <!-- Button Row -->
          <div class="footer">
            <div class="footer-button-row">
              <el-button type="success" @click="Refresh">
                Refresh
              </el-button>
              <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedTasks.length === 0">
                Batch Delete
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('workSpace.Shares')" name="shares">
          <el-table :data="paginatedShareList" 
            style="width: 100%"
            v-loading="shareLoading">
            <el-table-column prop="task_name" :label="$t('database.task.task_name')">
              <template #default="{ row }">
                <font-awesome-icon :style="{ color: getStatusColor(row.status)}" :icon="['fas', 'circle']" />
                {{ row.task_name }}
              </template>
            </el-table-column>
            <el-table-column prop="shared_time" :label="$t('database.share.shared_time')">
              <template #default="{ row }">
                {{ formatDate(row.shared_time) }}
              </template>
            </el-table-column>
            <el-table-column prop="due_time" :label="$t('database.share.due_time')">
              <template #default="{ row }">
                {{ row.due_time ? formatDate(row.due_time) : $t('workSpace.Indefinite') }}
              </template>
            </el-table-column>
            <el-table-column prop="status" :label="$t('Status')">
              <template #default="{ row }">
                <span v-if="!row.due_time" class="share-status-badge share-status-indefinite">
                  {{ $t('workSpace.Indefinite') }}
                </span>
                <span v-else-if="new Date() > new Date(row.due_time)" class="share-status-badge share-status-expired">
                  {{ $t('workSpace.Expired') }}
                </span>
                <span v-else>
                  {{ $t('workSpace.Active') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" :label="$t('Operations')" width="250">
              <template #default="{ row }">
                <el-button link type="info" size="small" @click="copyShareLink(row)">
                  {{ $t('workSpace.CopyLink') }}
                </el-button>
                <el-button link type="danger" size="small" @click="showUnshareDialog(row)">
                  {{ $t('workSpace.Unshare') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination 
            class="pagination" 
            @size-change="handleShareSizeChange" 
            @current-change="handleShareCurrentChange"
            :current-page="shareCurrentPage" 
            :page-sizes="[5, 10, 20, 50]" 
            :page-size="sharePageSize"
            layout="total, sizes, prev, pager, next, jumper" 
            :total="shareList.length">
          </el-pagination>
          <!-- Button Row -->
          <div class="footer">
            <div class="footer-button-row">
              <el-button type="success" @click="Refresh">
                Refresh
              </el-button>
              <el-button type="danger" @click="showBatchDeleteDialog" :disabled="selectedTasks.length === 0">
                Batch Delete TODO 批量删除分享
              </el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

  <!-- 新增分享对话框 -->
 <el-dialog v-model="shareDialogVisible" :title="$t('workSpace.ShareTask')" width="500px">
  <el-form :model="shareForm" label-width="120px">
    <el-form-item :label="$t('workSpace.Expiration')">
      <div class="time-input-group">
        <el-input 
          v-model.number="shareForm.day" 
          :placeholder="$t('workSpace.Days')" 
          type="number" 
          min="0"
          class="time-input"
          @input="validateTime('day')">
        </el-input>
        <el-input 
          v-model.number="shareForm.hour" 
          :placeholder="$t('workSpace.Hours')" 
          type="number" 
          min="0" 
          max="23"
          class="time-input"
          @input="validateTime('hour')">
        </el-input>
        <el-input 
          v-model.number="shareForm.minute" 
          :placeholder="$t('workSpace.Minutes')" 
          type="number" 
          min="0" 
          max="59"
          class="time-input"
          @input="validateTime('minute')">
        </el-input>
      </div>
      <div v-if="timeError" class="time-error">{{ timeError }}</div>
    </el-form-item>
    
    <el-form-item :label="$t('workSpace.Recipient')">
      <el-input 
        v-model="shareForm.accepter" 
        :placeholder="$t('workSpace.RecipientPlaceholder')"
        clearable>
      </el-input>
    </el-form-item>
    
    <el-form-item :label="$t('workSpace.Company')">
      <el-input 
        v-model="shareForm.companyName" 
        :placeholder="$t('workSpace.CompanyPlaceholder')"
        clearable>
      </el-input>
    </el-form-item>

    <el-form-item :label="$t('workSpace.Password')">
      <el-input 
        v-model="shareForm.password" 
        type="password"
        :placeholder="$t('workSpace.PasswordPlaceholder')"
        show-password
        clearable>
      </el-input>
      <div class="password-hint">{{ $t('workSpace.PasswordHint') }}</div>
    </el-form-item>
  </el-form>
  
  <template #footer>
    <div class="dialog-footer">
      <el-button @click="shareDialogVisible = false">{{ $t('Cancel') }}</el-button>
      <el-button type="primary" @click="confirmShare">{{ $t('Confirm') }}</el-button>
    </div>
  </template>
</el-dialog>
    </div>
    
    <el-dialog v-model="batchDeleteDialogVisible" title="Warning" width="500">
      <span>The selected tasks will be deleted. Are you sure?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchDeleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="confirmBatchDelete">Confirm</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="Warning" width="500" align-center>
      <span>Task <strong style="color: #e74c3c;">{{ selectedTask?.task_name }}</strong> will be deleted</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" @click="deleteDialogVisible = false; deleteTask()">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 任务详细信息对话框 -->
    <el-dialog v-model="detailDialogVisible" title="Task Detail" width="550px" align-center>
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('database.task.task_name')">
          {{ selectedTask.task_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.details')">
          {{ selectedTask.details }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.type')">
          {{ (selectedTask.type?.split(':')[1] || "") === "single"     ? $t('taskType.Singleomic') :
             (selectedTask.type?.split(':')[1] || "") === "multi"      ? $t('taskType.Multiomics') :
             (selectedTask.type?.split(':')[1] || "") === "deno"       ? $t('taskType.Denoising')  : $t('taskType.Unknown')}}
          {{ (selectedTask.type?.split(':')[0] || "") === "annotation" ? $t('taskType.Annotation') :
             (selectedTask.type?.split(':')[0] || "") === "training"  ? $t('taskType.Training')  :
             (selectedTask.type?.split(':')[0] || "") === "denoising"  ? "" : $t('taskType.Unknown')}}
        </el-descriptions-item>
        
        <el-descriptions-item :label="$t('database.task.re_pretrain')" v-if="(selectedTask.type?.split(':')[0] || '') === 'training'">
          <el-tag :type="selectedTask.re_pretrain == true ? 'success' : 'warning'">
            {{ selectedTask.re_pretrain == true ? 'Yes' : 'No' }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.models.model_name')">
          {{ selectedTask.model_name }}
        </el-descriptions-item>

        <el-descriptions-item :label="$t('database.task.parameters')">
          <el-scrollbar max-height="150px">
            <el-row v-for="(param, index) in (selectedTask.parameters || selectedTask.default_parameters || '').split(',')" :key="index">
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
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('Confirm') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>

  <div class="mobile-task-drawer">
    <el-drawer
      v-model="mobileTaskDrawerVisible"
      title="Tasks"
      direction="btt"
      size="80%"
    >
      <el-table 
        :data="paginatedTaskList" 
        style="width: 100%"
        v-loading="loading">
        <el-table-column prop="task_name" :label="$t('database.task.task_name')">
          <template #default="{ row }">
            <font-awesome-icon :style="{ color: getStatusColor(row.status)}" :icon="['fas', 'circle']" />
            {{ row.task_name }}
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="$t('database.task.status')">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" :label="$t('Operations')" width="60">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showMobileActionSheet(row)">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination 
        class="pagination" 
        @current-change="handleCurrentChange"
        :current-page="currentPage" 
        :page-size="pageSize"
        layout="prev, pager, next" 
        :total="taskList.length">
      </el-pagination>
    </el-drawer>

    <!-- Mobile Action Sheet -->
    <el-dialog
      v-model="mobileActionSheetVisible"
      :title="selectedTask?.task_name"
      width="95%"
      class="mobile-action-dialog"
    >
      <div class="mobile-task-details">
        <div class="detail-item">
          <span class="detail-label">Status:</span>
          <el-tag :type="statusType(selectedTask?.status)">{{ statusText(selectedTask?.status) }}</el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">Type:</span>
          <span>{{ getTaskType(selectedTask) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Model:</span>
          <span>{{ selectedTask?.model_name ?? "Unknown" }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Start Time:</span>
          <span>{{ formatDate(selectedTask?.start_time) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">End Time:</span>
          <span>{{ (selectedTask?.end_time && selectedTask?.status === 2) ? formatDate(selectedTask?.end_time) : $t('Notcompletedyet') }}</span>
        </div>
      </div>
      <div class="mobile-action-buttons">
        <el-button type="success" @click="showCharts(selectedTask?.task_name)" :disabled="selectedTask?.status !== 2" block>
          {{ $t('navigateBar.Virtualization') }}
        </el-button>
        <el-button type="primary" @click="showDetailDialog(selectedTask)" block>
          {{ $t('Detail') }}
        </el-button>
        <el-button type="danger" @click="showDeleteDialog(selectedTask)" block>
          {{ $t('Delete') }}
        </el-button>
      </div>
    </el-dialog>
  </div>

  <div class="mobile-task-button" v-if="isMobileView">
    <el-button type="primary" circle @click="mobileTaskDrawerVisible = true">
      <el-icon><List /></el-icon>
    </el-button>
  </div>

  <!-- Model Details Dialog -->
  <el-dialog v-model="showModelDetails" :title="selectedData?.modelName" width="550px" align-center>
    <div class="model-details-info" style="width: 100%;">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('modelPage.ModelType')">{{ getModelTypeLabel(selectedData.modelType) }}</el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.user_name')">{{ selectedData.userName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.company_name')">{{ selectedData.companyName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('database.models.created_time')">{{ selectedData.createdTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('modelPage.Remark')">{{ selectedData.remark }}</el-descriptions-item>
        <el-descriptions-item :label="$t('modelPage.DefaultParameters')">
          <el-scrollbar max-height="150px">
            <el-row v-for="(param, index) in (selectedData.defaultParameters || '').split(',')" :key="index">
              <el-col :span="24">
                <el-tag type="info" class="param-tag">
                  {{ param.trim() }}
                </el-tag>
              </el-col>
            </el-row>
          </el-scrollbar>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showModelDetails = false">{{ $t('Close') }}</el-button>
        <el-button 
          type="warning" 
          @click="editModel(selectedData)" 
          :disabled="!isUserModel(selectedData)" 
          v-if="isUserModel(selectedData)">
          {{ $t('modelPage.Edit') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 修改对话框 -->
  <el-dialog v-model="showEditDialog" title="Edit Model" width="500px" align-center>
    <!-- 添加提示信息 -->
    <el-form :model="selectedData" label-width="120px" label-position="left">
      <div style="display: flex; gap: 20px;">
        <!-- 左侧：现有输入框 -->
        <div style="flex: 1;">
          <el-form-item label="Model Name">
            <el-input v-model="selectedData.modelName" disabled></el-input>
          </el-form-item>
          <el-form-item label="Remark">
            <el-input v-model="selectedData.remark"></el-input>
          </el-form-item>
        </div>
      </div>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showEditDialog = false">{{ $t('Cancel') }}</el-button>
        <el-button type="danger" @click="showDeleteModelDialog = true;">{{ $t('Delete') }}</el-button>
        <el-button type="primary" @click="modelEditingSave()">{{ $t('Save') }}</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 删除确认对话框 -->
  <el-dialog v-model="showDeleteModelDialog" title="Warning" width="500" align-center>
    <span>Model <strong style="color: #e74c3c;">{{ selectedData.modelName }}</strong> will be deleted</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showDeleteModelDialog = false">Cancel</el-button>
        <el-button type="danger" @click="showDeleteModelDialog = false; deleteData(selectedData.modelId)">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import MainHeader from "../components/MainHeader.vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import * as echarts from 'echarts';  // Import echarts
import { List, MoreFilled } from '@element-plus/icons-vue';

export default {
  name: "WorkSpace",
  components: {
    MainHeader,
    List,
    MoreFilled
  },
  data() {
    return {
      userData: JSON.parse(sessionStorage.getItem("userData")) || {},
      taskList: [], // 存储任务数据
      shareList: [], // 分享数据
      shareReceivedList: [], // 收到的分享数据
      paginatedTaskList: [], // 当前页的任务数据
      deleteDialogVisible: false,
      batchDeleteDialogVisible: false,
      detailDialogVisible: false,
      selectedTask: null,
      selectedTasks: [], // 存储多选选中的任务
      currentPage: 1, // 当前页
      pageSize: 10, // 每页显示条数
      sortOrder: '', // 当前排序方向
      sortProp: '', // 当前排序属性
      loading: false,
      shareLoading: false,
      isRightColumnExpanded: false, // 控制右侧列表是否展开
      statusChart: null, // 存储ECharts实例
      isMobileView: false,
      mobileTaskDrawerVisible: false,
      mobileActionSheetVisible: false,
      // 我的模型
      modelList: [], // 存储模型数据
      modelLoading: false, // 模型加载状态
      selectedData: {}, //需要展示详情的模型
      showModelDetails: false,
      showEditDialog: false,
      showDeleteModelDialog: false,

      activeTab: 'tasks', // 当前激活的TAB
      shareDialogVisible: false, // 分享对话框可见性
      shareForm: {
        due_time: '', // 过期时间
        permission: 'read' // 权限
      },
      shareCurrentPage: 1, // 分享列表当前页
      sharePageSize: 10, // 分享列表每页大小

      timeError: '',
      shareForm: {
      day: 0,
      hour: 0,
      minute: 0,
      accepter: '',
      companyName: '', //  companyName
      password: '',
    },
    };
  },
  computed: {
    // 新增计算属性
    paginatedShareList() {
      const start = (this.shareCurrentPage - 1) * this.sharePageSize;
      const end = start + this.sharePageSize;
      return this.shareList.slice(start, end);
    },
    // 计算各状态任务数量
    pendingCount() {
      return this.taskList.filter(task => task.status === 0).length;
    },
    processingCount() {
      return this.taskList.filter(task => task.status === 1).length;
    },
    completedCount() {
      return this.taskList.filter(task => task.status === 2).length;
    },
    errorCount() {
      return this.taskList.filter(task => task.status === -1).length;
    },
    receivedShareCount() {
      return this.shareReceivedList.length;
    },
    shareCount(){
      return this.shareList.length;
    },
    // 获取错误任务列表
    completedTasks() {
      return this.taskList.filter(task => task.status === 2);
    },
    sortedCompletedTasks() {
      return [...this.completedTasks].sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    },
    modelCount() {
      return this.modelList.length;
    },
    // 获取最近的模型（按创建时间排序）
    sortedRecentModels() {
      return [...this.modelList]
        .sort((a, b) => new Date(b.create_time || b.createdAt) - new Date(a.create_time || a.createdAt))
        // .slice(0, 5); // 只显示最近5个
    },
  },
  methods: {
    // 新增方法
    validateTime(type) {
    if (type === 'day') {
      if (this.shareForm.day < 0) {
        this.timeError = this.$t('workSpace.DaysPositive');
      } else {
        this.timeError = '';
      }
    } else if (type === 'hour') {
      if (this.shareForm.hour < 0 || this.shareForm.hour > 23) {
        this.timeError = this.$t('workSpace.HoursRange');
      } else {
        this.timeError = '';
      }
    } else if (type === 'minute') {
      if (this.shareForm.minute < 0 || this.shareForm.minute > 59) {
        this.timeError = this.$t('workSpace.MinutesRange');
      } else {
        this.timeError = '';
      }
    }
  },
    showShareDialog(task) {
      this.selectedTask = task;
      this.shareForm = {
        due_time: '',
        permission: 'read'
      };
      this.shareDialogVisible = true;
    },
    async confirmShare() {
    // 验证输入
    if (this.shareForm.day < 0) {
      this.timeError = this.$t('workSpace.DaysPositive');
      return;
    }
    
    if (this.shareForm.hour < 0 || this.shareForm.hour > 23) {
      this.timeError = this.$t('workSpace.HoursRange');
      return;
    }
    
    if (this.shareForm.minute < 0 || this.shareForm.minute > 59) {
      this.timeError = this.$t('workSpace.MinutesRange');
      return;
    }
    
    try {
      let userId = null;
      let companyId = null;
      
      // 验证接收者
      if (this.shareForm.accepter) {
        if (this.shareForm.accepter === this.userData.userName) {
          ElMessage.error(this.$t('workSpace.CannotShareToSelf'));
          return;
        }
        
        const userResponse = await axios.post(`/api/queryIfExistsUserByUserName?userName=${this.shareForm.accepter}`);
        const userData = userResponse.data.data; 
        if (userData.state === 0) {
          ElMessage.error(this.$t('workSpace.UserNotExist'));
          return;
        }
        userId = userData.userId;
      }
      console.log("1");
      // 验证公司
      if (this.shareForm.companyName) {
        const companyResponse = await axios.post(`/api/findCompanyByName?companyName=${this.shareForm.companyName}`);
        const companyData = companyResponse.data.data;
        if (companyData.state === 0) {
          ElMessage.error(this.$t('workSpace.CompanyNotExist'));
          return;
        }
        companyId = companyData.companyId;
      }
      console.log("2");
      // 计算分享时间
      const shareTime = new Date();
      const dueTime = new Date(
        shareTime.getTime() + 
        (this.shareForm.day || 0) * 24 * 60 * 60 * 1000 + 
        (this.shareForm.hour || 0) * 60 * 60 * 1000 + 
        (this.shareForm.minute || 0) * 60 * 1000
      );
      console.log("3");
      // 创建分享
      const shareData = {
                    taskId: this.selectedTask.task_id,
                    sharerId: this.userData.userId,
                    sharedTime: shareTime,
                    dueTime: dueTime,
                    receiverId: userId ?? -2,
                    companyId: companyId ?? -2,
                    password: this.shareForm.password,
                };
      console.log("4");
      // 发送请求
      const response = await axios.post('/api/share/insertShare', [shareData]);
      console.log("5");
      if (response.data.code === 200) {
        ElMessage.success(this.$t('workSpace.ShareSuccess'));
        this.fetchShareList();
      } else {
        ElMessage.error(response.data.msg);
      }
      console.log("6");
      this.shareDialogVisible = false;
    } catch (error) {
      console.error('Failed to share task:', error);
      ElMessage.error(this.$t('workSpace.ShareFailed'));
    }
  },
    
    disabledDate(time) {
      return time.getTime() < Date.now() - 8.64e7; // 不能选择今天之前的日期
    },
    
    copyShareLink(share) {
      const link = `${window.location.origin}/shared/${share.share_id}`;
      navigator.clipboard.writeText(link).then(() => {
        ElMessage.success(this.$t('workSpace.LinkCopied'));
      }).catch(() => {
        ElMessage.error(this.$t('workSpace.CopyFailed'));
      });
    },
    
    async showUnshareDialog(share) {
      try {
        await this.$confirm(this.$t('workSpace.ConfirmUnshare'), this.$t('Warning'), {
          confirmButtonText: this.$t('Confirm'),
          cancelButtonText: this.$t('Cancel'),
          type: 'warning'
        });
        
        const response = await axios.delete(`/api/share/delete/${share.share_id}`);
        if (response.data.code === 200) {
          ElMessage.success(this.$t('workSpace.UnshareSuccess'));
          this.fetchShareList(); // 刷新分享列表
        } else {
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to unshare:', error);
          ElMessage.error(this.$t('workSpace.UnshareFailed'));
        }
      }
    },
    
    handleShareSizeChange(val) {
      this.sharePageSize = val;
    },
    
    handleShareCurrentChange(val) {
      this.shareCurrentPage = val;
    },
     async fetchModelList() {
      try {
        this.modelLoading = true;
        const response = await axios.get("/api/models/findModelsByUserName?userName=" + this.userData.userName);
        if (response.data.code === 200) {
          this.modelList = response.data.data || [];
        } else {
          console.error("Failed to fetch model list:", response.data.msg);
          this.modelList = [];
        }
        this.modelLoading = false;
      } catch (error) {
        console.error("Failed to fetch model list:", error);
        this.modelLoading = false;
        this.modelList = [];
      }
    },
    editModel(model) {
      if (!this.isUserModel(model)) {
        ElMessage.warning('You can only edit your own models');
        return;
      }
      this.selectedData = model;
      this.showEditDialog = true;
    },
    isUserModel(model) {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      return userData && model.userName === userData.userName;
    },
    getModelTypeLabel(type) {
      switch (type) {
        case 'single': 
          return this.$t('modelPage.SingleModality');
        case 'multi': 
          return this.$t('modelPage.MultiModality');
        case 'deno': 
          return this.$t('modelPage.Denoising');
        default: 
          return type;
      }
    },
    async modelEditingSave() {
      const formData = new FormData();
      const data = this.selectedData;
      formData.append('modelId', data.modelId);
      formData.append('remark', data.remark);
      const response = await axios.post('api/models/updateModelRemark', formData);
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
      this.showEditDialog = false;
      this.showModelDetails = false;
    },
    async deleteData(dataId) {
      try {
        const response = await axios.delete(`/api/models/deleteModel?modelId=${dataId}`);
        if (response.data.code === 1) {
          ElMessage.success('Model deleted successfully');
        } else {
          console.error('Failed to delete:', response.data.msg);
          ElMessage.error(response.data.msg);
        }
      } catch (error) {
        console.error('Failed to delete:', error);
      }
      this.showDeleteModelDialog = false;
      this.showEditDialog = false;
      this.showModelDetails = false;
      window.location.reload();
    },
    // 获取模型类型显示文本
    getModelTypeText(type) {
      if (!type) return this.$t('taskType.Unknown');
      
      const typeMap = {
        'single': this.$t('taskType.Singleomic'),
        'multi': this.$t('taskType.Multiomics'),
        'deno': this.$t('taskType.Denoising'),
      };
      
      return typeMap[type.split(':')[0]] || type;
    },

    getShareProgress(startTime, dueTime) {
      if (!startTime || !dueTime) return 100; // 处理异常情况，默认 100%

      const start = new Date(startTime).getTime();
      const end = new Date(dueTime).getTime();
      const now = new Date().getTime();

      if (now >= end) return 100; // 已过期
      if (now <= start) return 0;  // 刚开始

      return Math.min(100, ((now - start) / (end - start)) * 100); // 计算进度
    },
    Refresh() {
      this.fetchShareList();
      this.fetchTaskList();
      this.fetchModelList();
    },
    // 切换右侧列表的展开/折叠状态
    toggleRightColumn() {
      this.isRightColumnExpanded = !this.isRightColumnExpanded;
      // 如果展开，可能需要重新计算分页
      if (this.isRightColumnExpanded) {
        this.updatePaginatedTaskList();
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.initStatusChart();
        }, 300); // 延迟 0.3 秒
      });
    },
    async fetchShareList() {
      try {
        this.shareLoading = true; // ShareLoading
        const response = await axios.get("/api/share/findSharesByUserId?userID=" + this.userData.userId);
        const responseReceived = await axios.get("/api/share/findSharesReceivedByUserId?userID=" + this.userData.userId);
        if (response.data.code === 200 && responseReceived.data.code === 200) {
          this.shareList = response.data.data;
          this.shareReceivedList = responseReceived.data.data;
        } else {
          console.error("Failed to fetch share list:", response.data.msg + responseReceived.data.msg);
        }
        this.shareLoading = false;
      } catch (error) {
        console.error("Failed to fetch share list:", error);
        this.shareLoading = false;
      }
    },
    // 调整图表大小方法
    resizeCharts() {
      if (this.statusChart) {
        this.statusChart.resize();
      }
    },
    // 初始化状态分布图表
    initStatusChart() {
      if (this.$refs.statusChart) {
        // 如果图表实例已存在，先销毁
        if (this.statusChart) {
          this.statusChart.dispose();
        }
        
        // 创建新的图表实例
        this.statusChart = echarts.init(this.$refs.statusChart);
        
        // 设置图表选项
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
          },
          series: [
            {
              name: 'Task Status',
              type: 'pie',
              radius: ['50%', '70%'], // 设置为环形图
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: this.pendingCount, name: 'Pending', itemStyle: { color: '#E6A23C' } },
                { value: this.processingCount, name: 'Processing', itemStyle: { color: '#409EFF' } },
                { value: this.completedCount, name: 'Completed', itemStyle: { color: '#67C23A' } },
                { value: this.errorCount, name: 'Error', itemStyle: { color: '#F56C6C' } }
              ]
            }
          ]
        };
        
        // 使用配置项设置图表
        this.statusChart.setOption(option);
      }
    },
    getStatusColor(status) {
      const colors = {
        0: "#E6A23C",
        1: "#409EFF",
        2: "#67C23A",
        '-1': "#F56C6C",
        4: "#909399"
      };
      return colors[status] || "#909399";
    },
    showDeleteDialog(task) {
      this.deleteDialogVisible = true;
      this.selectedTask = task;
    },
    showCharts(taskName) {  
      this.$router.push({ name: "Virtualization", query: { taskName } });  
    },
    showDetailDialog(task) {
      this.detailDialogVisible = true;
      this.selectedTask = task;
    },
    showBatchDeleteDialog() {
      if (this.selectedTasks.length === 0) {
        ElMessage.warning("Please select at least one task.");
        return;
      }
      this.batchDeleteDialogVisible = true;
    },
    async deleteTask() {
      try {
        await axios.get("/api/deleteTaskByTaskName?userName="+ this.userData.userName +"&taskName=" + this.selectedTask.task_name);
        ElMessage.success("Delete success.");
        this.Refresh();
      } catch (error) {
        console.error("Delete failed:", error);
        ElMessage.error("Delete failed.");
      }
    },
    async confirmBatchDelete() {
      this.batchDeleteDialogVisible = false;
      for (const task of this.selectedTasks) {
        await this.deleteTaskByTaskName(task.task_name);
      }
      ElMessage.success("Batch delete completed.");
      this.Refresh();
    },
    async deleteTaskByTaskName(taskName) {
      try {
        await axios.get("/api/deleteTaskByTaskName?userName="+ this.userData.userName +"&taskName=" + taskName);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    },
    async fetchTaskList() {
      try {
        this.loading = true;
        const response = await axios.get("/api/findTasksByUserID?userID=" + this.userData.userId);
        if (response.data.code === 200) {
          this.taskList = response.data.data;
          this.applySorting(); // 调用排序函数
          // 获取数据后重新初始化图表
          this.$nextTick(() => {
            setTimeout(() => {
              this.initStatusChart();
            }, 300); // 延迟 0.3 秒
          });
        } else {
          console.error("Failed to fetch task list:", response.data.msg);
        }
        this.loading = false;
      } catch (error) {
        console.error("Failed to fetch task list:", error);
        this.loading = false;
      }
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop;
      this.sortOrder = order;
      this.applySorting(); // 调用排序函数
    },
    applySorting() {
      if (this.sortProp && this.sortOrder) {
        this.taskList.sort((a, b) => {
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
      this.updatePaginatedTaskList();
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
    formatDate(dateString) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleString(undefined, options);
    },
    handleSelectionChange(val) {
      this.selectedTasks = val;
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.updatePaginatedTaskList();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.updatePaginatedTaskList();
    },
    updatePaginatedTaskList() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      this.paginatedTaskList = this.taskList.slice(start, end);
    },
    checkScreenSize() {
      this.isMobileView = window.innerWidth < 1151;
      if (this.isMobileView && this.isRightColumnExpanded) {
        this.isRightColumnExpanded = false;
      }
    },
    
    showMobileActionSheet(task) {
      this.selectedTask = task;
      this.mobileActionSheetVisible = true;
    },
    
    getTaskType(row) {
      if (!row) return '';
      
      let typeText = '';
      
      if (row.type?.split(':')[1]) {
        typeText += (row.type.split(':')[1] === "single" ? this.$t('taskType.Singleomic') :
                    row.type.split(':')[1] === "multi" ? this.$t('taskType.Multiomics') :
                    row.type.split(':')[1] === "deno" ? this.$t('taskType.Denoising') : 
                    this.$t('taskType.Unknown'));
      }
      
      if (row.type?.split(':')[0]) {
        if (row.type.split(':')[0] === "annotation") {
          typeText += ' ' + this.$t('taskType.Annotation');
        } else if (row.type.split(':')[0] === "training") {
          typeText += ' ' + this.$t('taskType.Training');
        }
      }
      
      return typeText || this.$t('taskType.Unknown');
    },
  },
  mounted() {
    this.Refresh(); // 组件挂载后获取任务数据
    // 设置图表响应式
    window.addEventListener('resize', this.resizeCharts);
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    // 组件销毁前清理图表实例和事件监听
    if (this.statusChart) {
      this.statusChart.dispose();
    }
    window.removeEventListener('resize', this.resizeCharts);
    window.removeEventListener('resize', this.checkScreenSize);
  }
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-top: 60px; /* Add top margin to accommodate the fixed header */
  height: calc(100vh - 60px); /* Adjust height to account for header */
}

/* Left Column Styles */
.left-column {
  width: 88%; /* Default width when right column is collapsed */
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.left-column.with-expanded-right {
  width: 25%; /* Width when right column is expanded */
}

.dashboard-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.dashboard-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.chart-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.donut-chart-wrapper {
  flex: 1;
}

.status-chart {
  width: 100%;
  height: 180px;
  /* position: absolute; */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.status-count {
  font-size: 18px;
  font-weight: bold;
  display: block; /* 让 span 变为块级元素 */
  text-align: right; /* 文字右对齐 */
  width: 100%; /* 确保占满父容器 */
}

.success-tasks-list {
  overflow-y: auto;
  background-color: #f0f0f0;
  height: 100%;
  border-radius: 10px;
}

.dark-mode .success-tasks-list {
  background-color: #302E2C;
}

.right-section{
  max-height: 100%;
}

.success-task-item {
  background: white;
  margin-bottom: 12px;
  margin-left: 10px;
  margin-right: 10px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.success-task-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.dark-mode .success-task-item {
  background: #383838;
  border-color: #4a4a4a;
}

.dark-mode .success-task-item:hover {
  border-color: #409eff;
  background: #404040;
}

.success-task-item:first-child {
  margin-top: 10px;
}

.success-task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.success-task-name {
  font-weight: 600;
  color: #303133;
  flex: 1;
  font-size: 14px;
}

.dark-mode .success-task-name {
  color: #e0e0e0;
}

.success-task-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-style: italic;
}

/* Right Column Styles */
.right-column {
  transition: width 0.3s ease;
  border-left: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  position: relative;
}

.right-column.collapsed {
  width: 12%; /* Collapsed width */
}

.right-column.expanded {
  width: 100%; /* Expanded width */
}

.column-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
}

.collapsed-task-list, 
.expanded-task-list {
  padding: 15px;
  padding-top: 60px; /* Space for the toggle button */
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: auto;
  padding: 10px;
  border-top: 1px solid #e6e6e6;
  /* position: absolute; */
}

.footer-button-row {
  display: flex;
  justify-content: space-between;
}

.pagination {
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

/* Accommodate to dark mode when active */
:deep(.dark-mode) .dashboard-card,
:deep(.dark) .dashboard-card {
  background-color: #1d1e1f;
  border-color: #3e3e3e;
  color: #e0e0e0;
}

:deep(.dark-mode) .success-task-details,
:deep(.dark) .success-task-details {
  color: #a0a0a0;
}

:deep(.dark-mode) .empty-state,
:deep(.dark) .empty-state {
  color: #a0a0a0;
}

:deep(.dark-mode) .right-column,
:deep(.dark) .right-column {
  border-left-color: #3e3e3e;
}

:deep(.dark-mode) .footer,
:deep(.dark) .footer {
  border-top-color: #3e3e3e;
}

/* Mobile Responsive Styles */
@media (max-width: 1150px) {
  .content-container {
    flex-direction: column;
    height: auto;
    overflow-y: auto;
  }
  
  .left-column {
    width: 95% !important;
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    padding: 10px;
    margin-top: 20px;
  }
  
  .right-column {
    display: none;
  }
  
  .dashboard-card {
    height: auto;
    min-height: 350px;
  }

  .success-tasks-list {
    max-height: 230px;
  }
}

/* Mobile Task Drawer */
.mobile-task-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: transparent;
  width: 50px;
  height: 50px;
}

.mobile-task-button .el-button{
  width: 50px;
  height: 50px;
}

.mobile-action-buttons .el-button + .el-button {
  margin-left: 0;        /* 去除横向间距 */
}

.mobile-task-details {
  margin-bottom: 20px;
}

.detail-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.detail-label {
  font-weight: bold;
  width: 100px;
  color: #606266;
}

.mobile-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Chart responsive fix */
.status-chart {
  height: 150px;
  min-height: 150px;
}

.left-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 保证上下空间拉满并底部对齐 */
  height: 100%;
}
/* Adjust card for smaller screens */
@media (max-width: 1150px) {
  .card-header {
    padding: 10px;
  }
  
  .status-count {
    font-size: 14px;
  }
  
  .status-chart {
    height: 120px;
  }
}

/* Make mobile dialog take more screen space */
.mobile-action-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
}

.param-tag {
  margin: 2px 0;
}

.el-scrollbar__view .el-row{
  margin-bottom: 0;
}

.share-status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.share-status-indefinite {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.share-status-expired {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.right-column-tabs {
  margin-top: 10px;
}

.right-column-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.right-column-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.time-input-group {
  display: flex;
  gap: 10px;
}

.time-input {
  flex: 1;
  max-width: 100px;
}

.time-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
}
</style>