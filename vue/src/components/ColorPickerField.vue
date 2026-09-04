<template>
  <div ref="rootRef" class="color-field">
    <button ref="btnRef" type="button" class="color-swatch" :style="{ background: modelValue }" @click.stop="toggle"></button>
    <div v-if="open" class="color-popup" :style="popupStyle" @mousedown.stop>
      <div class="color-swatches">
        <button
          v-for="c in palette"
          :key="c"
          type="button"
          class="color-swatch-option"
          :class="{ active: temp === c }"
          :style="{ background: c }"
          :data-color="c"
          @click="pick(c)"
        ></button>
      </div>
      <div class="color-preview-row">
        <span class="color-preview" :style="{ background: temp }"></span>
        <span class="color-hex">{{ temp }}</span>
      </div>
      <div class="color-input-row">
        <label>Hex</label>
        <input type="text" :value="temp" @input="onHexInput($event.target.value)" placeholder="#rrggbb">
      </div>
      <div class="color-input-row">
        <label>R</label>
        <input type="number" min="0" max="255" :value="rgb.r" @input="onRgbInput('r', $event.target.value)">
        <label>G</label>
        <input type="number" min="0" max="255" :value="rgb.g" @input="onRgbInput('g', $event.target.value)">
        <label>B</label>
        <input type="number" min="0" max="255" :value="rgb.b" @input="onRgbInput('b', $event.target.value)">
      </div>
      <button type="button" class="color-confirm" @click="confirm">确认</button>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, reactive, ref } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '#1a73e8' }
});
const emit = defineEmits(['apply']);

const palette = [
  '#1a73e8', '#0f172a', '#475569', '#94a3b8', '#cbd5e1', '#e2e8f0',
  '#ffffff', '#f59e0b', '#f97316', '#dc2626', '#e11d48', '#f472b6',
  '#16a34a', '#84cc16', '#0891b2', '#06b6d4', '#9333ea', '#f3e8ff',
  '#fef3c7', '#fee2e2', '#dcfce7', '#dbeafe', '#1e293b', '#FF9900'
];

const rootRef = ref(null);
const btnRef = ref(null);
const open = ref(false);
const temp = ref(props.modelValue);
const rgb = reactive({ r: 26, g: 115, b: 232 });
const popupStyle = ref({});

function normalizeHex(value) {
  let hex = String(value || '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  return /^[0-9a-fA-F]{6}$/.test(hex) ? '#' + hex.toLowerCase() : null;
}

function hexToRgb(value) {
  const hex = normalizeHex(value);
  if (!hex) return null;
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((n) => ('0' + Math.max(0, Math.min(255, Math.round(Number(n) || 0))).toString(16)).slice(-2)).join('');
}

function syncRgb() {
  const c = hexToRgb(temp.value);
  if (c) Object.assign(rgb, c);
}

function toggle() {
  if (open.value) {
    open.value = false;
    return;
  }
  temp.value = props.modelValue;
  syncRgb();
  open.value = true;
  nextTick(() => {
    const r = btnRef.value ? btnRef.value.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    const left = Math.max(8, Math.min(r.left, window.innerWidth - 260));
    const top = Math.max(8, Math.min(r.bottom + 6, window.innerHeight - 260));
    popupStyle.value = { left: left + 'px', top: top + 'px' };
  });
}

function pick(color) {
  temp.value = color;
  syncRgb();
}

function onHexInput(value) {
  temp.value = value;
  syncRgb();
}

function onRgbInput(key, value) {
  rgb[key] = Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
  temp.value = rgbToHex(rgb.r, rgb.g, rgb.b);
}

function confirm() {
  const hex = normalizeHex(temp.value);
  if (hex) {
    temp.value = hex;
    emit('apply', hex);
    open.value = false;
  }
}

function onDocMousedown(e) {
  if (open.value && rootRef.value && !rootRef.value.contains(e.target)) {
    open.value = false;
  }
}

document.addEventListener('mousedown', onDocMousedown);
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMousedown));
</script>

<style scoped>
#props .color-field .color-swatch {
  margin-top: 0;
  height: 28px;
}
#props .color-field .color-swatch-option {
  margin-top: 0;
  width: 22px;
  height: 22px;
}
#props .color-field .color-confirm {
  margin-top: 0;
  border-color: var(--y-border, #cbd5e1);
}
.color-field {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.color-swatch {
  height: 28px;
  padding: 0;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  cursor: pointer;
}
.color-hex {
  font-size: 11px;
  color: var(--y-text, #1f2937);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.color-popup {
  position: fixed;
  z-index: 3000;
  width: 232px;
  padding: 10px;
  background: var(--y-panel, #ffffff);
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
}
.color-swatches {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  margin-bottom: 8px;
}
.color-swatch-option {
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid rgba(15, 23, 42, 0.15);
  border-radius: 4px;
  cursor: pointer;
}
.color-swatch-option.active {
  outline: 2px solid var(--y-accent, #1a73e8);
  outline-offset: 1px;
}
.color-preview-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.color-preview {
  width: 34px;
  height: 22px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
}
.color-input-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.color-input-row label {
  font-size: 12px;
  color: var(--y-text, #1f2937);
  min-width: 24px;
}
.color-input-row input[type="text"],
.color-input-row input[type="number"] {
  height: 26px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  padding: 0 6px;
  font-size: 12px;
  min-width: 0;
}
.color-input-row input[type="text"] {
  flex: 1 1 auto;
}
.color-input-row input[type="number"] {
  width: 42px;
}
.color-confirm {
  width: 100%;
  height: 30px;
  border: 1px solid var(--y-border, #cbd5e1);
  border-radius: 4px;
  background: var(--y-panel, #ffffff);
  color: var(--y-text, #1f2937);
  cursor: pointer;
}
</style>
