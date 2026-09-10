# 鱼骨图设计器（YGT Flow）交接大纲

## 1. 项目概况

- 定位：基于 AntV X6 3.1.8 的零构建、纯静态前端鱼骨图编辑器，交互参照工作流设计器（拖拽组件、自由连线、属性面板）。
- 技术栈：原生 JS（无框架/无构建），X6 UMD（`lib/x6.min.js`），jsPDF（`lib/jspdf.umd.min.js`），localStorage 存储。
- 运行：`python -m http.server 8765 --bind 127.0.0.1`
  - 文档列表：`http://127.0.0.1:8765/index.html`
  - 编辑器：`http://127.0.0.1:8765/editor.html?docId=xxx`
- 全局命名空间：`window.YGT`，测试钩子 `window.__ygt = { ctx, toolbar }`。

## 2. 目录结构

```text
editor.html        编辑器页（内联 CSS + 主题变量 + 操作说明浮层）
index.html         文档列表页
js/ygt-core.js     数据模型 / localStorage / JSON 校验导入导出 / 层级校验 / 模板 cells
js/ygt-shapes.js   X6 shape 注册 / 鱼形 path / 7 套预设 / buildTemplate
js/ygt-canvas.js   画布、插件装配、交互、端口、连接点、自动重锚
js/ygt-props.js    右侧属性面板
js/ygt-toolbar.js  顶部工具条、模板下拉、导出、操作说明浮层
js/ygt-app.js      页面启动（initEditor / initIndex）
lib/               x6.min.js + jspdf.umd.min.js（本地离线）
tests/             Playwright 脚本（pN-check.js + pw.js）
docs/待考虑方案.md  暂缓的功能点
```

## 3. 数据模型 / 层级约定

- 业务节点统一记录 `data.parentId / order / level`，`data.kind` 为 `head/group/bone`。
- 保存/导入前校验：父级存在、无环、根节点存在、深度 ≤5、同级排序连续（`Y.core.validateHierarchy`）。
- 连线建立父子关系时自动写入层级（`assignEdgeHierarchy`）。
- 文档结构：`{ id, title, cells, canvas:{background}, updatedAt }`。

## 4. 图形与连线结构（重要）

- 主轴：`fish-head`（鱼头）+ `fish-tail`（鱼尾）+ `fish-spine`（鱼干/中脊，横向）。
- 一级鱼刺：`bone-node`（group），竖向连到鱼干，用 `port-top/port-bottom`。
- 二级鱼刺/子原因：`bone-node`（bone），横向连到一级鱼刺线体（edge-to-edge），用 `port-left/port-right`。
- 其他组件：`group-node`（原因分组）、`text-node`（文本框）、`image-node`（图片，可设为背景）、`dot-node`（连接点磁点）。
- 连线 shape：`bone-edge`（直线 connector）。

## 5. 端口方向机制（最近刚改）

- 端口四向：`port-left/right/top/bottom`。
- 自动重锚 `canvas.reanchorPorts(node)`：按「父端锚点 vs 节点中心」判断方向，左右端口按 x，上下端口按 y；拖拽跨过父级时自动翻转端口。
- 手动覆盖：节点 `data.portDir = 'auto'|'left'|'right'|'top'|'bottom'`；属性面板按连接轴显示「自动/左/右」或「自动/上/下」。
- 载入归一化：`applyCells` 后会跑一遍 `reanchorPorts`，修复旧文档端口接反；手动 `portDir` 优先。

## 6. 连接点（dot-node）

- 空心磁点圆点；一条线上可多个，可拖动、拖离成自由点、自动吸附线段。
- `Alt+单击线体` 在点击处添加；双击鱼干在鱼干上添加。
- 预览/导出时隐藏圆点并补齐线段空隙（`setPreview` / `withHiddenPorts`）。

## 7. 已实现功能清单

- 组件库拖拽、节点连线、双击编辑文字、属性面板样式（颜色/字号/字重/填充/边框/线宽/透明度）、批量样式、对齐分布。
- 鱼形 7 套预设、朝向切换、模板（空骨架/经典六原因/根因分析）。
- Undo/Redo、历史面板、复制/剪切/粘贴/快速复制、删除、清空。
- 图片、超链接、图片背景；导出 PNG/SVG/PDF/JSON、导入 JSON；多文档管理。
- 主题（浅色/深色）、工具栏图标、右下角缩放控件、两行工具栏、操作说明浮层（帮助按钮已移除，用「说明」）。
- 交互：空格+左键平移、方向键移动 1px（Shift 10px）、Ctrl+A 全选、拖拽吸附容差 20px、右键菜单、快捷键帮助、双击文本自动换行、Ctrl+滚轮缩放。

## 8. 关键 canvas API

```text
graph / selection / history / clipboard / exportPlugin
applyCells(cells)  getCells()
reanchorPorts(node)  addDotOnEdge(edge, pt)  addDotOnNode(node, pt)
getAttachedDots(id)  setImageBackground(node, on)
setPreview(on)  withHiddenPorts(fn)  batch(fn)  historyPush(label)
```

## 9. 测试体系

- Node 可执行：`C:\Users\jinzq\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`
- 浏览器：`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Playwright 封装：`tests/pw.js`（自动探测 playwright-core，勿删）。
- 运行：`node tests/pN-check.js`；判定 = 退出码 0 + `errors: []` + 无 `false` 断言。
- 已有关键回归：p1（核心）、p11/p15/p16/p17（连接点）、p19（缩放）、p24-portdir/p24-drag（横向端口）、p25-vertical（纵向端口）、p27-loadfix（载入归一化）。
- Vue 回归：`vue-smoke.js`（列表/模板/保存重载）、`vue-fish-preset.js`（预设切换）、`vue-preset7-style.js`（预设7样式）、`vue-export-zoom.js`（导出下拉/缩放布局）。
- 已知非缺陷：p7 输出 `rcaOk:false` 是脚本断言写法与模板标签不一致，p8 已验证 rca 正常。

## 10. 开发约束（AGENTS.md）

- 文件编辑用 Python（utf-8）或 apply_patch；禁止 PowerShell `Set-Content/Out-File/>` 写含中文文件。
- 最小变更：只改需求指定逻辑，不重构无关全局架构/API/命名。
- 禁空捕获异常；IO/网络加超时、重试、入参校验。

## 11. 待办 / 待考虑

- `docs/待考虑方案.md`：线段拖入画布自动吸附成真连线（已决定不实现，分析保留至后续优化计划）。
- UI 已落地：模板下拉应用后显示当前模板，聚焦时清空以支持重复应用。

## 12. Vue + FastAPI 改造（2026-08-25）

- 主入口改为 Vue 3 + Vite 前端（`vue/`）与 FastAPI 后端（`app/`），旧页面保留离线回归。
- 后端参考 `D:\workgroup\python_git\aireport\app`：`config.py`（app/jwt）、`middleware/auth.py`（JWT Bearer）、`routers/ygt_doc.py`（文档 CRUD）、SQLite + SQLAlchemy。
- Vue 请求统一走 `vue/src/api/client.js`：token 依次取 localStorage / URL `?token=` / cookie，请求自动加 `Authorization: Bearer`，401 清 token 并刷新。
- 编辑器复用 `js/ygt-core/shapes/canvas` 引擎，工具栏与属性面板改为 Vue 组件；存储改为后端 API。
- 运行：`.venv\Scripts\python -m app.main`（127.0.0.1:8766），token 生成见 `app/scripts/make_token.py`。
- 新增 `tests/vue-smoke.js`：列表页、经典模板 21 节点/20 边、保存、重载持久化；`node tests/vue-smoke.js`。
- token 使用：开发环境 `make_token.py` 本地自签（支持 `--check` 校验）；线上由 SSO 签发，
  通过 `config.example.yaml` 复制为 `config.yaml` 对齐 `jwt.secret_key/issuer/audience`。
  前端 401 逻辑已改为：带 token 请求 401 才清 token+刷新一次；无 token 显示错误页，不再死循环。
- 存储已切换为 `hl_ygt / hl_ygtmx`（PG 主表+明细表）：`positions` 存完整文档 JSON，
  明细表存业务节点层级（fqbh/pxbh/zyyypb/url/opentype），旧数据 positions 为空时前端自动重建布局。
  `config.yaml` 支持 sqlite/postgresql/oracle 三种数据库。

## 13. 最新会话交接（2026-08-27）

### 当前架构
- 前端：Vue 3 + Vite，`vue/src`；构建产物 `vue/dist`（相对路径 `base:'./'`，根路径和 `/vue/ygt/` 均可部署）。
- 后端：FastAPI，`app/`；数据存 PostgreSQL `hl_ygt / hl_ygtmx`，JWT Bearer 鉴权。
- 前端接口地址通过 `vue/dist/config.js` 的 `window.YGT_API_BASE` 配置（默认 `/api`）。
- 日志：运行后生成 `logs/app.log`、`logs/access.log`（UTF-8，按天滚动保留 30 天）。

### 运行命令
- 后端：`start.bat` 或 `.venv\Scripts\python.exe -m app.main`（127.0.0.1:8766）
- token：`token.bat`
- 开发前端：`cd vue && npm run dev`（Vite 代理 /api 到 8766）
- 构建前端：`build.bat`（根路径版）或 `build_frontend.bat`（生成 yugutu_frontend.zip）
- 后端 exe：`build_exe.bat`（dist/yugutu.exe + dist/config.yaml，API 版，不带前端）
- 整体包：`package.bat`（yugutu_package.zip）

### 部署注意
- exe 为 API 版，前端 `vue/dist` 单独挂到 Web 服务器（根路径或 /vue/ygt/ 均可，相对路径构建）。
- 前端跨域调后端需在 `config.js` 设置后端地址，后端 CORS 已放开。
- token 必须与后端 `config.yaml` 的 jwt 配置一致，否则 401。
- 后端部署需放行端口、`app.host` 设 `0.0.0.0`（如需外部访问）。

### 交互功能（已实现并回归）
- 连线起点（无箭头端）可拖拽：吸附线段/沿线跟随/拖空白变自由点。
- 连线终点（箭头端）可拖拽：只吸附控件端口小圆点。
- 右键菜单：解除起点吸附 / 解除终点吸附 / 节点与父线段解除吸附。
- 旧数据（positions 为空）按 hl_ygtmx 自动布局重建；排序按层级自动归一。
- 保存时后端按线段结构解析 fqbh/pxbh，不依赖 data.parentId。

### 待办/风险
- 暂无明确待办；改动尽量保持最小变更，前端静态文件改动后需 Ctrl+F5 或加版本号避免缓存。

## 14. UI 收尾（2026-08-31）

- 鱼形预设切换修复：Vue 属性面板传入选中的新值而非旧值。
- 预设 7 按 ygt7 定义实现：鱼头/鱼尾/鱼干/线条统一 `#FF9900`，各级线宽/箭头/字号/字重按定义；新增 `Y.shapes.applyPresetStyle(graph, preset, dir)`。
- 导出 PNG/SVG/PDF 移出工具栏，改为画布左上角「导出」下拉（JSON 保留工具栏）；预览/导出时隐藏。
- 缩放控件补回 Vue 样式，位于画布左上角，与导出按钮同一行（缩放在左、导出在右）。
- 工具栏图标修复：`icons.js` 补 SVG 外壳，保存图标颜色优先级修复为 `#fff`。
- 移除浅色/深色按钮；清空按钮去掉红色边框线。
- 组件库样式优化：悬浮卡片、分组小卡片、标题上下居中、鱼骨骨架区域高度 350px。
- 新增回归：`vue-fish-preset.js`、`vue-preset7-style.js`、`vue-export-zoom.js`；完整回归 6 项全部通过。
- dist 说明：2026-08-31 期间 dist 曾被清空并手动重建；后续发布前建议用 `build.bat` / `build_frontend.bat` / `package.bat` 重新生成。

## 15. 最新交接（2026-09-01）

### 已修复
- 箭头与线段连接：根因是 X6 会按线宽自动改 marker `refX`，大箭头时箭头底部会伸到线段里。修复为 `blockMarkerAttrs` 显式设置 `refX = -箭头宽度`、`refY = 0`，实测线宽 10、箭头 24 时箭头底部正好贴线端且方向正确。
- 模板下拉去掉最后三项（医疗质控 / 护理不良事件 / 护理质量），只保留空骨架、经典六原因、根因分析。
- 组件库线段：拖入画布自动转成自由端 `bone-edge`（占位 arrow-line 节点在 `node:added` 时转换并删除）。
- 画布线段端点拖拽：拖动一端时另一端通过 `origin` 复位保持固定；中间拖拽仍是整线平移。

### 待办
- 已完成：箭头修复后完整回归 6 项全部通过（`vue-smoke`、`vue-fish-preset`、`vue-preset7-style`、`vue-export-zoom`、`p2-check`、`p21-check`，均为 `errors: []`）。
- 已完成：2026-09-01 用 `npm run build` 重建 `vue/dist`，重建后 6 项回归再次全部通过，均为 `errors: []`。

### 运行
- 后端：`start.bat`（127.0.0.1:8766），当前已启动（回归验证后保留运行）。
- token：`token.bat`。
- 开发前端：`cd vue && npm run dev`（Vite 代理 /api 到 8766）。

## 16. 鱼头文字与颜色确认按钮（2026-09-01）

### 已实现
- 鱼头文字默认色改为跟随鱼头填充色（模板/新建生效），属性面板仍可单独改字色。
- 鱼头属性新增“文字方向”：横向 / 竖向；竖向一个字一行，文字中心与鱼头中心对齐，文字距鱼头 30px（按文档坐标，path 实际边界计算）。
- 属性面板所有颜色选择器改为自研取色弹层：色块 + Hex + RGB + 确认按钮，选色后点确认才应用。
- 颜色框旁不再显示 Hex 文本，Hex 输入仅在取色弹层内保留。
- 颜色块、色块选项、确认按钮覆盖全局 `#props button` 的 `margin-top: 10px`，保持取色器自身布局。
- `#props button` 全局边框色由 `--y-danger` 改为 `--y-border`，去掉红色边框。
- 界面颜色块（取色器入口）不再指定固定宽度，仅保留高度。
- 引擎 `js/ygt-shapes.js` 新增 `fishLabelText` / `fishPathBBox`，已同步 `vue/public/js`，dist 已重建。

### 回归
- 新增 `tests/vue-fish-text.js`、`tests/vue-color-picker.js`。
- 全量 8 项回归通过（原 6 项 + 新增 2 项），均为 `errors: []`。

## 17. 通用设置、层级树编辑与箭头修复（2026-09-02）

### 通用设置
- 点击空白处属性面板显示“通用鱼刺设置”：一级/二级/三级下拉 + 线条（颜色/线宽/箭头）+ 节点控件（字号/字色/字重/填充/边框/线宽/宽/高）+ 应用。
- 配置存 `doc.canvas.universalLevels`，随文档保存并在下次打开自动载入。

### 层级数据编辑（el-tree）
- 工具栏“数据”按钮打开 Element Plus `el-tree` 弹窗，版本 `element-plus ^2.14.5`。
- 树节点支持名称编辑、重要标志、新增子级/同级、删除、上移/下移、拖拽调级。
- 保存规则：只更新名称/重要标志变化的节点样式；新增节点自动布局；上移/下移交换排序与位置；拖拽调级只移动被拖节点，子节点跟随；未改动节点坐标与连线锚点保持不变。
- 零修改直接保存不会改写任何节点坐标或二级/三级线锚点比例。

### 箭头贴边修复
- `blockMarkerAttrs` 改为 `refX = -(线宽 + 5.5)`，所有设置箭头处传入当前线宽，箭头顶端精确贴住目标端口。

### 回归
- 新增 `vue-global-settings.js`、`vue-arrow-tip.js`、`vue-hierarchy-dialog.js`、`vue-hierarchy-noop.js`。
- 全量 12 项回归通过，均为 `errors: []`。

## 18. 层级按线同步与画布改级（2026-09-03）

### 修改前快照
- 回滚目录：`.rollback/pre-hierarchy-sync-20260902`（2492 个文件），出问题时可直接复制还原。

### 已实现
- 后端 `app/services/ygt_store.py`：`_resolve_parent` 改为线优先，source 是业务节点/父线 target 时取其父级，无有效连线或悬空一律 ROOT，不再优先读 `data.parentId`。
- 前端 `js/ygt-core.js` 新增 `Y.core.syncFromLines(cells)`，支持 X6 `position/size` 与模板 `x/y` 两种坐标格式；按线校正 `parentId/order/level`。
- `js/ygt-canvas.js`：新增 `syncHierarchyFromLines()`，加载回显与保存前自动校正；节点拖到目标端口松手触发改父级（成环/超 5 级拦截），连线拖动结束同步层级，悬空自动 ROOT。
- `HierarchyDialog.vue`：结构操作（新增/删除/拖动/上移下移）即时应用到画布并写入一步历史；名称/重要仍点保存生效；应用后同步 `origOrder` 避免重复交换。

### 回归
- 新增 `tests/db-line-parent-check.py`：验证线优先、悬空 ROOT、旧 data.parentId 不覆盖线层级。
- 全量 12 项前端回归通过，均为 `errors: []`。

### 悬空线自动回连（追加）
- `syncHierarchyFromLines` 新增自动修复：节点有明确业务父级但其连入线起点为悬空绝对点或线缺失时，自动把线源接到父级线体，并按排序分配锚点比例；接鱼头下的一级节点时连到鱼干上的点。
- 不做历史记录；保存/加载时自动执行。
- 新增 `tests/vue-dangling-repair.js` 回归通过；noop/smoke/hierarchy-dialog 同步通过。

### 加载后连线视图异步刷新（追加）
- 根因：保存模型正确（子线 source 指向父线），但 X6 加载时父线/子线视图未完成首帧，渲染沿用旧路径。
- 修复：`applyCells` 在 `zoomToFit` 后通过 `requestAnimationFrame` 连续两帧强制对所有 `bone-edge` 视图 `update()`，只重算 SVG 路径，不改模型/坐标/历史。
- 验证：真实文档加载后 `ygt_edge_2` 渲染起点从错误的 `(-1.44,0)` 修正为父线上的 `(20.69,152.67)`，无需人工拖动。
- 稳定快照：`.rollback/stable-line-refresh-20260903`，后续功能改坏可还原。

## 19. edge-to-edge 刷新收敛（2026-09-03）

### 修改前快照
- 回滚目录：`.rollback/pre-edge-refresh-converge-20260903`（2498 个文件），出问题时可直接复制还原。

### 已实现
- `js/ygt-canvas.js` 与 `vue/public/js/ygt-canvas.js` 的 `applyCells` 不再对全部 `bone-edge` 做 `5 遍全量 update × 2 帧`。
- 改为按 edge-to-edge 依赖链计算受影响边：只刷新 `source/target` 直接或间接引用其他 `bone-edge` 的边，父线先于子线更新；仍保留 `requestAnimationFrame` 双帧与 `setTimeout` 兜底。
- 只重算 SVG 视图，不写模型、不改坐标/层级、不进历史。

### 回归
- 新增 `tests/vue-edge-refresh-converge.js`：4 层 edge-to-edge 链 + 普通绝对连线；断言子线实际渲染起点与父线锚点一致（误差 < 0.01）、普通边起点保持原坐标、层级校验通过、无控制台错误。
- 原 12 项前端回归 + `vue-dangling-repair.js` + 新回归全部通过，均为 `errors: []`。

## 20. Git 接入与 V1.0 基线（2026-09-04）

- 当前版本定为鱼骨图 V1.0，基线提交 `c7df4fa`，标签 `v1.0`，本地与 GitHub `origin/main` 一致。
- Git 历史已重建为干净单根提交，历史与当前树均不含 `.bat`、真实 `config.yaml`、调试脚本、内网 IP 与示例数据库口令。
- 调试脚本本地文件保留，已加入 `.gitignore` 并从 Git 跟踪移除。
- `.rollback` 旧快照已清理，后续回退以 Git 标签为准。
- V1.0 功能基线记录在 `docs/ygt-version-history.md`，README 当前进度已同步。
- 新项目 Git 初始化可使用技能 `git-project-init`（`C:\Users\jinzq\.codex\skills\git-project-init`）。

## 21. 文字边框省略号与多行编辑（2026-09-04）

- 一级/二级鱼刺及原因分组文字按节点框动态折行，超出按框截断并显示省略号，原文保存在 `label/text`；拖动框体或属性面板改宽高后即时重算。
- 双击编辑改为多行文本域：Enter 换行，Ctrl/Cmd+Enter 或失焦提交，Esc 取消；属性面板文本输入同步改为 textarea。
- 引擎修改同步根目录 `js/*` 与 `vue/public/js/*`，`vue/dist` 已重建。
- 修复：`graph.fromJSON` 载入时不会触发 `node:added`，改为 `applyCells` 双帧后静默重算并刷新骨刺节点文字视图，历史文档载入即显示省略号且不误标脏状态。
- 新增回归 `tests/vue-text-fit-ellipsis.js`、`tests/vue-text-load-ellipsis.js` 通过；版本记录见 `docs/ygt-version-history.md` V1.1。

## 22. 独立只读预览界面（2026-09-07）

- 新增 `?docId=xxx&view=preview` 只读预览页：无工具栏/组件库/属性面板，仅缩放与 PNG/SVG/PDF 导出。
- 画布引擎新增 `readonly: true` 分支：隐藏端口/选择框/连接点，禁用节点拖拽、双击编辑、右键菜单与快捷键；按住空格 + 鼠标左键拖动平移（单击不拖动），触屏沿用单指平移。
- 文档列表新增“预览”按钮；默认编辑器路径不受影响。
- 新增回归 `tests/vue-preview-readonly.js` 通过；版本记录见 `docs/ygt-version-history.md` V1.2。

## 23. 鱼骨图 V2.0 定稿（2026-09-08）

- 定稿当前版本为鱼骨图 V2.0；V1.x 历史功能与文档不回改。
- 新建流程收口为列表页弹窗：名称 + 模板卡片 + 7 套预设预览，创建后直接进入编辑器。
- 只新增 `CreateDialog.vue`、`FishPreview.vue` 与列表入口，不修改后端/编辑/保存/导出业务逻辑。
- UI 示意图（3 套方向）仅存放在可视化临时目录，不纳入 V2.0。
- 回归：`vue-create-dialog.js`、`vue-smoke.js`、`vue-preview-readonly.js` 通过。

## 24. Oracle/独立打包交接（2026-09-09）

- 最新提交：`1b1df53 feat: 文档列表过滤刷新与层级弹窗UI优化`
- 基线提交：`28816c9 feat: 定稿鱼骨图 V2.0 新建弹窗与样式预览`
- 分支：`main`，项目根：`D:\workgroup\yugutu_20260818`

### 已实现/已定稿

- V2.0 新建弹窗：模板卡片、7 套预设样式预览，创建后进入编辑器
- 只读预览页：`?docId=xxx&view=preview`，仅缩放 + PNG/SVG/PDF 导出
- 文档列表：`ksid/lylx/lyid` 过滤、刷新按钮
- 层级弹窗：Figma 风格样式、第 5 级子节点限制、居中提示浮层
- PDF 单页整图缩放，SVG 内容包围盒导出

### 当前未提交

- `app/models.py`：Oracle 连接超时参数改为 `tcp_connect_timeout`
- `config.oracle.yaml`：Oracle 配置模板
- `yugutu_standalone.spec`：独立打包 spec
- `build_exe_standalone.bat`：独立打包脚本（`.gitignore` 忽略 `.bat`）
- `standalone_dist/`：已生成 exe，但仍是 Oracle 修复前版本

### 待办/未定稿

- 线段拖动“挂点/子线长度保持”需求未定稿，相关 ygt-canvas 改动已回退
- 重新打包：`build_exe_standalone.bat`
- 提交：`app/models.py`、`config.oracle.yaml`、`yugutu_standalone.spec`

### 使用说明

- 独立版 exe：`standalone_dist\yugutu_standalone.exe`
- Oracle 配置：先填 `config.oracle.yaml`，再覆盖 `config.yaml`
- 重新打包前先构建前端，脚本已内置 `npm run build`

## 25. 鱼骨图 V3.0 定稿（2026-09-10）

- 定稿当前版本为鱼骨图 V3.0；V2.0 及之前历史功能与文档不回改。
- Git：提交 V3.0 代码与文档，并创建标签 `v3.0`。
- 层级弹窗新增节点/连线按当前画布同层级样式继承；第 4、5 级无独立定义时沿用最近一个已定义级别的完整样式。
- 通用鱼刺设置的应用层级新增“四级鱼刺”。
- 新增、删除、排序子鱼刺后，按兄弟顺序重算父线锚点比例，新增子线不再堆在父线中点。
- 同步包含文档列表过滤刷新、Oracle 连接超时修复、`config.oracle.yaml` 与独立打包 spec。
- 回归：`vue-hierarchy-style.js`、`vue-hierarchy-noop.js`、`vue-hierarchy-dialog.js`、`vue-preset7-style.js`、`vue-global-settings.js` 通过，均为 `errors: []`。
- `standalone_dist/` 仍是本地生成的未跟踪目录，不纳入 Git。

## 26. 鱼骨图 V3.1 定稿（2026-09-10）

- 定稿当前版本为鱼骨图 V3.1；V3.0 及之前历史功能与文档不回改。
- 新增“斜线角度”和“按角度刷新鱼骨图”：按层级、order 奇偶、鱼头方向计算，仅在主动刷新时执行。
- `layoutByAngle()` 增加上下/左右半平面约束，避免刷新后线段越界。
- 无位置数据初始化改为按层级和 order 奇偶布局，同级父线锚点按比例分配。
- 顶部/底部鱼刺子节点按父线方向展开，无位置布局相交检测为 `pairs: []`。
- 无位置数据载入不再自动调用角度刷新。
- Oracle 模式启动时跳过自动建表，使用现有 `hl_ygt` / `hl_ygtmx` 表。
- 回归：`vue-angle-layout.js`、`vue-legacy-ratio.js`、`vue-hierarchy-noop.js` 通过。
- 本次不提交 `temp/` 与 `standalone_dist/`。

