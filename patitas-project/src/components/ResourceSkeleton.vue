<template>
  <div class="skeleton-card">
    <div class="skeleton-img-wrap">
      <div class="skeleton-block skeleton-img"></div>
      <div class="skeleton-block skeleton-tag"></div>
    </div>
    <div class="skeleton-body">
      <div class="skeleton-block skeleton-title"></div>
      <div class="skeleton-desc">
        <div class="skeleton-block skeleton-line"></div>
        <div class="skeleton-block skeleton-line short"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-block skeleton-btn"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(26, 91, 130, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(26, 91, 130, 0.05);
}

.skeleton-img-wrap {
  position: relative;
  height: 12rem;
  background: #f0f3f6;
}

.skeleton-block {
  background: linear-gradient(90deg, #eaf0f6 25%, #f4f7fa 50%, #eaf0f6 75%);
  background-size: 200% 100%;
  animation: loading-pulse 1.5s infinite ease-in-out;
  border-radius: 0.5rem;
}

.skeleton-img {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.skeleton-tag {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 5rem;
  height: 1.5rem;
  border-radius: 5rem;
}

.skeleton-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 1rem;
}

.skeleton-title {
  width: 85%;
  height: 1.6rem;
  border-radius: 0.4rem;
}

.skeleton-desc {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  width: 100%;
  height: 0.9rem;
  border-radius: 0.3rem;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-footer {
  margin-top: auto;
  padding-top: 0.5rem;
}

.skeleton-btn {
  width: 100%;
  height: 2.5rem;
  border-radius: 5.5rem;
}

@keyframes loading-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
