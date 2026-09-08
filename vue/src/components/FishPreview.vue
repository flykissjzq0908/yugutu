<template>
  <div class="fish-preview" :class="{ 'fish-preview-active': active }">
    <svg viewBox="0 0 260 120" class="fish-preview-svg" role="img">
      <rect :x="spine.x" :y="spine.y" :width="spine.width" height="4" rx="2" :fill="color" opacity="0.9"></rect>
      <g v-if="tail" :transform="tail.transform">
        <path :d="tail.d" :fill="color"></path>
      </g>
      <g v-if="head" :transform="head.transform">
        <path :d="head.d" :fill="color"></path>
      </g>
      <path v-for="(line, i) in bonePaths" :key="i" :d="line.d" :stroke="color" stroke-width="2" fill="none"></path>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  preset: { type: String, default: 'ygt1' },
  boneCount: { type: Number, default: 0 },
  active: { type: Boolean, default: false }
});

function pathBounds(d) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  svg.appendChild(path);
  document.body.appendChild(svg);
  const b = path.getBBox();
  document.body.removeChild(svg);
  return b;
}

function fitPath(d, x, y, maxW, maxH) {
  const b = pathBounds(d);
  const scale = Math.min(maxW / b.width, maxH / b.height, 1);
  return {
    d,
    transform: `translate(${x - b.x * scale} ${y - b.y * scale}) scale(${scale})`,
    b: { x, y, width: b.width * scale, height: b.height * scale }
  };
}

const color = computed(() => (props.preset === 'ygt7' ? '#FF9900' : '#1a73e8'));
const fish = computed(() => {
  const F = window.YGT && window.YGT.shapes && window.YGT.shapes.FISH;
  const p = props.preset && F && F.headPaths[props.preset] ? props.preset : 'ygt1';
  const paths = F.headPaths[p].toright;
  const tail = fitPath(paths.g_fish_tail, 6, 32, 78, 56);
  const baseHead = fitPath(paths.g_fish_head, 152, 18, 86, 78);
  const headShift = 40;
  const head = fitPath(paths.g_fish_head, 152 + headShift, 18, 86, 78);
  const spineStart = tail.b.x + tail.b.width;
  const spineEnd = baseHead.b.x;
  const join = 14;
  const baseSpine = {
    x: spineStart - join,
    y: 56,
    width: Math.max(30, spineEnd - spineStart + join * 2)
  };
  return {
    color: p === 'ygt7' ? '#FF9900' : '#1a73e8',
    tail,
    head,
    spine: { ...baseSpine, width: baseSpine.width + headShift },
    boneSpine: baseSpine
  };
});

const tail = computed(() => fish.value.tail);
const head = computed(() => fish.value.head);
const spine = computed(() => fish.value.spine);
const boneSpine = computed(() => fish.value.boneSpine);

const bonePaths = computed(() => {
  const rows = Math.min(Math.max(props.boneCount, 0), 8);
  const sp = boneSpine.value;
  const out = [];
  if (!sp || sp.width <= 0 || rows === 0) return out;
  const cols = Math.min(3, Math.max(1, rows));
  const margin = Math.min(24, sp.width * 0.16);
  const startX = sp.x + margin;
  const endX = sp.x + sp.width - margin;
  const maxLen = Math.hypot(24, 34);
  const startY = sp.y + 2;
  for (let i = 0; i < rows; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const col = i % cols;
    const x = cols === 1 ? (startX + endX) / 2 : startX + ((endX - startX) * col) / (cols - 1);
    const y = startY + side * (34 + Math.floor(i / cols) * 20);
    const dx = x + 24 - x;
    const dy = y - startY;
    const len = Math.hypot(dx, dy) || 1;
    const ratio = len > maxLen ? maxLen / len : 1;
    out.push({ d: `M${x},${startY} L${x + dx * ratio},${startY + dy * ratio}` });
  }
  return out;
});
</script>

<style scoped>
.fish-preview {
  width: 100%;
  height: 100%;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f8fafc;
  overflow: hidden;
}
.fish-preview-active {
  background: #eef4ff;
}
.fish-preview-svg {
  width: 100%;
  height: auto;
  max-height: 110px;
}
</style>
