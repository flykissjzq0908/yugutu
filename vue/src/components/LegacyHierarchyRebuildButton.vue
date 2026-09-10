<template>
  <button id="btn-rebuild-layout" type="button" class="ygt-rebuild-trigger"
          :disabled="busy" title="按当前上下级关系重新生成鱼骨图布局"
          @click="run">
    按层级重建布局
  </button>
</template>

<script setup>
import { ref } from 'vue';
import { rebuildLegacyLayout } from '../legacy/legacyLayoutAdapter.js';

const props = defineProps({
  canvas: { type: Object, required: true },
  ygtstyle: { type: String, default: '' }
});
const emit = defineEmits(['toast']);
const busy = ref(false);

async function run() {
  if (busy.value) return;
  busy.value = true;
  try {
    const result = await rebuildLegacyLayout(props.canvas, props.ygtstyle);
    const message = result.message || (result.ok ? '已按层级重建布局，预设：' + result.preset : '重建布局失败');
    emit('toast', message, !result.ok);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.ygt-rebuild-trigger {
  height: 32px;
  padding: 0 14px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
  cursor: pointer;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .12);
}
.ygt-rebuild-trigger:hover:not(:disabled) {
  border-color: var(--y-primary, #1a73e8);
  color: var(--y-primary, #1a73e8);
}
.ygt-rebuild-trigger:disabled {
  cursor: wait;
  opacity: .65;
}
</style>
