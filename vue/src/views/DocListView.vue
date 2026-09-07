<template>
  <div class="ygt-app">
    <header class="doc-header">
      <h1>鱼骨图编辑器</h1>
      <button class="btn-primary" type="button" :disabled="loading" @click="createDoc">新建鱼骨图</button>
    </header>
    <main class="doc-main">
      <p v-if="loading" class="empty">加载中...</p>
      <p v-else-if="error" class="empty">{{ error }}</p>
      <template v-else>
        <div v-for="item in docs" :key="item.id" class="doc-row">
          <div class="doc-title">{{ item.title || '未命名鱼骨图' }}</div>
          <div class="doc-time">更新于 {{ formatTime(item.updatedAt) }}</div>
          <div class="doc-ops">
            <button type="button" @click="open(item)">打开</button>
            <button type="button" @click="preview(item)">预览</button>
            <button type="button" @click="rename(item)">重命名</button>
            <button type="button" class="danger" @click="remove(item)">删除</button>
          </div>
        </div>
        <p v-if="!docs.length" class="empty">暂无鱼骨图，点击右上角新建</p>
      </template>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ygtApi } from '../api/ygt';
import { errorMessage } from '../api/client';

const docs = ref([]);
const loading = ref(false);
const error = ref('');

function formatTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

async function load() {
  loading.value = true;
  error.value = '';
  try {
    docs.value = await ygtApi.list();
  } catch (e) {
    error.value = errorMessage(e);
  } finally {
    loading.value = false;
  }
}

function open(item) {
  window.location.href = window.location.pathname + '?docId=' + encodeURIComponent(item.id);
}

function preview(item) {
  window.location.href = window.location.pathname + '?docId=' + encodeURIComponent(item.id) + '&view=preview';
}

async function createDoc() {
  const name = window.prompt('新文档名称', '未命名鱼骨图');
  try {
    const cells = window.YGT && window.YGT.core ? window.YGT.core.templateCells('empty') : [];
    const doc = await ygtApi.create({
      title: (name && name.trim()) || '未命名鱼骨图',
      cells,
      canvas: { background: '#ffffff' }
    });
    window.location.href = window.location.pathname + '?docId=' + encodeURIComponent(doc.id);
  } catch (e) {
    error.value = errorMessage(e);
  }
}

async function rename(item) {
  const name = window.prompt('新的文档名称', item.title || '');
  if (!name || !name.trim()) return;
  try {
    const updated = await ygtApi.rename(item.id, name.trim());
    const index = docs.value.findIndex((x) => x.id === item.id);
    if (index >= 0) docs.value[index] = { ...docs.value[index], title: updated.title, updatedAt: updated.updatedAt };
  } catch (e) {
    error.value = errorMessage(e);
  }
}

async function remove(item) {
  if (!window.confirm(`确定删除《${item.title || '未命名'}》？该操作不可恢复。`)) return;
  try {
    await ygtApi.remove(item.id);
    docs.value = docs.value.filter((x) => x.id !== item.id);
  } catch (e) {
    error.value = errorMessage(e);
  }
}

onMounted(load);
</script>
