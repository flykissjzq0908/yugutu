<template>
  <div class="ygt-guide-overlay" role="dialog" aria-modal="true" aria-labelledby="guide-title" @click.self="$emit('close')">
    <div class="ygt-guide-dialog">
      <div class="ygt-guide-head">
        <span id="guide-title">操作说明</span>
        <button type="button" title="关闭" aria-label="关闭" @click="$emit('close')">&times;</button>
      </div>
      <div class="ygt-guide-body">
        <h4>一、基础操作</h4>
        <ul>
          <li>从左侧「组件」库把鱼头 / 鱼尾 / 鱼干 / 一级鱼刺 / 二级鱼刺 / 内容 / 文本框 / 图片拖到画布。</li>
          <li>从节点端口拖出连线到另一节点，即可建立连接。</li>
          <li>双击节点或连线上的文字进行编辑。</li>
          <li>选中元素后，用右侧「属性」面板修改颜色、字体、字号、背景、边框、线宽等样式。</li>
        </ul>

        <h4>二、鱼骨图结构</h4>
        <ul>
          <li>鱼头 + 鱼尾 + 鱼干组成主轴。</li>
          <li>一级鱼刺连到鱼干；二级鱼刺（子原因）连到一级鱼刺的线体上。</li>
          <li>层级关系（父级 / 顺序 / 层级）自动保存，保存与导入时会自动校验。</li>
        </ul>

        <h4>三、连接点</h4>
        <ul>
          <li><kbd>Alt</kbd> + 单击线体：在点击处添加一个空心连接点。</li>
          <li>双击鱼干：在鱼干上添加连接点。</li>
          <li>连接点可自由拖动，也可拖离线段成为自由连接点；靠近线段会自动吸附。</li>
          <li>预览与导出时会隐藏连接点并补齐线段空隙。</li>
        </ul>

        <h4>四、模板与画布</h4>
        <ul>
          <li>顶部「模板」下拉：空骨架 / 经典六原因 / 根因分析 等。</li>
          <li>右下角缩放控件或 <kbd>Ctrl</kbd>+滚轮 缩放；<kbd>空格</kbd>+左键 平移画布。</li>
        </ul>

        <h4>五、预览与导出</h4>
        <ul>
          <li>「预览」隐藏端口与连接点，只显示最终效果。</li>
          <li>支持导出 PNG / SVG / PDF / JSON，并可通过「导入 JSON」恢复。</li>
        </ul>

        <h4>六、快捷键</h4>
        <ul>
          <li><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> 撤销 / 重做</li>
          <li><kbd>Ctrl</kbd>+<kbd>C</kbd> / <kbd>V</kbd> / <kbd>X</kbd> / <kbd>D</kbd> 复制 / 粘贴 / 剪切 / 快速复制</li>
          <li><kbd>Ctrl</kbd>+<kbd>A</kbd> 全选 · <kbd>Ctrl</kbd>+<kbd>S</kbd> 保存 · <kbd>Delete</kbd> 删除</li>
          <li>方向键 移动 1px · <kbd>Shift</kbd>+方向键 移动 10px</li>
          <li><kbd>空格</kbd>+左键 平移 · <kbd>Ctrl</kbd>+<kbd>=</kbd> / <kbd>Ctrl</kbd>+<kbd>-</kbd> 缩放 · <kbd>Ctrl</kbd>+<kbd>0</kbd> 实际大小</li>
        </ul>

        <div class="ygt-guide-note">提示：图片节点可在属性面板设为背景；「主题」按钮可切换浅色 / 深色。</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close']);
</script>
