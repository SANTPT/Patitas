<script setup>
import { ref } from 'vue';
import DashboardSidebar from './DashboardSidebar.vue';
import DashboardTopbar from './DashboardTopbar.vue';

const sidebarOpen = ref(false);
</script>

<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <DashboardSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <!-- Main Content wrapper -->
    <div class="dashboard-main">
      <DashboardTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="dashboard-content-area">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f7fafc;
}

.dashboard-main {
  flex-grow: 1;
  margin-left: 15.5rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.dashboard-content-area {
  flex-grow: 1;
  padding: 1.5rem;
  background-color: #f7fafc;
}

/* Responsive adjustment for mobile viewports */
@media (max-width: 992px) {
  .dashboard-main {
    margin-left: 0;
  }
}
</style>
