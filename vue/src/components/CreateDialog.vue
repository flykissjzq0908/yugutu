<template>
  <div class="create-dialog-mask" @mousedown.self="close">
    <section class="create-dialog" role="dialog" aria-modal="true" aria-label="新建鱼骨图">
      <header class="dialog-header">
        <h2>新建鱼骨图</h2>
        <button type="button" class="dialog-close" title="关闭" @click="close">×</button>
      </header>

      <div class="dialog-body">
        <p v-if="error" class="create-error">{{ error }}</p>

        <section class="dialog-section">
          <label class="dialog-label" for="create-doc-name">鱼骨图名称</label>
          <input id="create-doc-name" v-model="title" class="create-name" type="text" maxlength="60"
                 @keyup.enter="submit" />
        </section>

        <section class="dialog-section">
          <h3 class="dialog-h3">模板</h3>
          <div class="template-grid">
            <button v-for="t in templates" :key="t.key" type="button" class="choose-card"
                    :class="{ selected: selectedTemplate === t.key }"
                    @click="selectedTemplate = t.key">
              <FishPreview class="choose-preview" :preset="selectedPreset" :bone-count="t.bones" />
              <span class="choose-name">{{ t.name }}</span>
              <span class="choose-desc">{{ t.desc }}</span>
            </button>
          </div>
        </section>

        <section class="dialog-section">
          <h3 class="dialog-h3">鱼骨样式</h3>
          <div class="style-grid">
            <button v-for="p in presets" :key="p" type="button" class="style-card"
                    :class="{ selected: selectedPreset === p }"
                    @click="selectedPreset = p">
              <FishPreview class="style-preview" :preset="p" :bone-count="3" :active="selectedPreset === p" />
              <span class="style-name">{{ p }}</span>
            </button>
          </div>
        </section>
      </div>

      <footer class="dialog-actions">
        <button type="button" class="ghost-action" @click="close">取消</button>
        <button type="button" class="primary-action" :disabled="creating" @click="submit">
          {{ creating ? '创建中...' : '创建并进入编辑器' }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import FishPreview from './FishPreview.vue';
import { ygtApi } from '../api/ygt';
import { errorMessage } from '../api/client';

const emit = defineEmits(['close']);

const TEMPLATES = [
  { key: 'empty', name: '空骨架', desc: '鱼头、鱼尾、鱼干', bones: 0 },
  { key: 'classic', name: '经典六原因', desc: '人 机 料 法 环 测', bones: 6 },
  { key: 'rca', name: '根因分析', desc: '流程 人员 设备 环境', bones: 6 }
];

const title = ref('未命名鱼骨图');
const selectedTemplate = ref('classic');
const selectedPreset = ref('ygt1');
const creating = ref(false);
const error = ref('');

const presets = computed(() => {
  const list = window.YGT && window.YGT.shapes && window.YGT.shapes.FISH && window.YGT.shapes.FISH.presets;
  return list && list.length ? list : ['ygt1', 'ygt2', 'ygt3', 'ygt4', 'ygt5', 'ygt6', 'ygt7'];
});

const templates = TEMPLATES;

function close() {
  if (!creating.value) emit('close');
}

async function submit() {
  if (creating.value) return;
  const name = (title.value || '').trim() || '未命名鱼骨图';
  creating.value = true;
  error.value = '';
  try {
    const cells = window.YGT.core.templateCells(selectedTemplate.value, {
      preset: selectedPreset.value,
      title: name
    });
    const doc = await ygtApi.create({
      title: name,
      version: '1.0',
      cells,
      canvas: { background: '#ffffff' }
    });
    window.location.href = window.location.pathname + '?docId=' + encodeURIComponent(doc.id);
  } catch (e) {
    error.value = '创建失败：' + errorMessage(e);
    creating.value = false;
  }
}
</script>

<style scoped>
.create-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(15, 23, 42, .46);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.create-dialog {
  width: min(960px, 100%);
  max-height: calc(100vh - 48px);
  background: var(--y-panel, #ffffff);
  border: 1px solid var(--y-border, #e2e8f0);
  border-radius: 10px;
  box-shadow: 0 18px 50px rgba(15,23,42,.24);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--y-border, #e2e8f0);
}
.dialog-header h2 { margin: 0; font-size: 17px; }
.dialog-close {
  width: 30px; height: 30px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 6px;
  background: transparent;
  color: var(--y-muted, #64748b);
  font-size: 18px;
  cursor: pointer;
}
.dialog-close:hover { border-color: var(--y-primary, #1a73e8); color: var(--y-primary, #1a73e8); }
.dialog-body {
  overflow: auto;
  padding: 18px 20px 8px;
}
.create-error { color: var(--y-danger, #dc2626); margin: 0 0 12px; }
.dialog-section { margin-bottom: 20px; }
.dialog-label, .dialog-h3 { display: block; margin: 0 0 10px; font-size: 14px; font-weight: 600; }
.create-name {
  width: min(480px, 100%);
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
  outline: none;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
}
.create-name:focus { border-color: var(--y-primary, #1a73e8); }
.template-grid, .style-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.style-grid { grid-template-columns: repeat(7, minmax(0, 1fr)); }
.choose-card, .style-card {
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 8px;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
  cursor: pointer;
  padding: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;
}
.choose-card.selected, .style-card.selected {
  border-color: var(--y-primary, #1a73e8);
  box-shadow: 0 0 0 2px rgba(26, 115, 232, .18);
}
.choose-preview, .style-preview { height: 116px; }
.style-preview { height: 88px; }
.choose-name { font-size: 14px; font-weight: 600; }
.choose-desc { font-size: 12px; color: var(--y-muted, #64748b); }
.style-name { text-align: center; font-size: 12px; color: var(--y-muted, #64748b); }
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--y-border, #e2e8f0);
}
.dialog-actions button {
  height: 36px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid var(--y-border, #cbd5e1);
  background: #ffffff;
  color: var(--y-text, #1f2937);
}
.dialog-actions .primary-action {
  background: var(--y-primary, #1a73e8);
  border-color: var(--y-primary, #1a73e8);
  color: #fff;
}
.dialog-actions button:disabled { opacity: .55; cursor: default; }
@media (max-width: 1080px) {
  .style-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .template-grid { grid-template-columns: 1fr; }
  .style-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
