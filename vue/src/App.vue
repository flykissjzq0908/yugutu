<template>
  <div v-if="authError" class="ygt-auth-error">
    <p>{{ authError }}</p>
    <p class="hint">开发环境：运行 .venv\Scripts\python.exe -m app.scripts.make_token 获取访问地址</p>
  </div>
  <EditorView v-else-if="isEditor" />
  <DocListView v-else />
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DocListView from './views/DocListView.vue';
import EditorView from './views/EditorView.vue';
import { getInitAuthError } from './api/client';

const isEditor = computed(() => !!new URLSearchParams(window.location.search).get('docId'));
const authError = ref(getInitAuthError());

function onAuthError(event) {
  authError.value = event && event.detail ? event.detail : '认证失败';
}

onMounted(() => window.addEventListener('ygt-auth-error', onAuthError));
onBeforeUnmount(() => window.removeEventListener('ygt-auth-error', onAuthError));
</script>
