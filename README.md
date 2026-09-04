# 鱼骨图工作流设计器（YGT Flow）
> 当前版本：鱼骨图 V1.0（2026-09-04）。V1.0 功能基线及后续版本记录见 docs/ygt-version-history.md。

基于 AntV X6 3.1.8 的零构建画布编辑器，目标形态参照流行工作流设计器：左侧组件库拖拽、画布自由摆放连线、双击编辑文字、属性面板改样式、保存/导入导出。

## 当前进度

**连接点交互已完成（2026-08-25）**

- 线段连接点：`Alt+单击线体` 在点击处生成空心磁点圆点；圆点可自由拖动、拖离线段成为自由连接点，并自动吸附线段（线段保持连续）。
- 鱼干连接点：双击鱼干在点击处生成连接点。
- 预览 / 导出时隐藏连接点圆点并补齐线段空隙。

**P14 严格层级模型已完成（2026-08-20）**

- 业务节点（鱼头 / 一级鱼刺 / 子原因）统一记录 `data.parentId / order / level`，层级不再靠连线猜测。
- 保存 / 导入前自动校验：父级存在、无循环、根节点存在、深度 ≤ 5、同级排序连续；不合法禁止保存或导入。
- 旧数据加载时自动补层级；新增节点默认挂根；端口/线段连线建立父子关系时自动写入父级与排序。
- 自动化回归（`tests/p14-check.js`）通过：模板层级、自动挂根、连线建父子、循环拦截保存、修复后持久化、非法导入拦截，0 控制台错误。
- 全量回归 P0-P5、P7-P13 全部通过。

**P10 历史跳转与多页 PDF 已完成（2026-08-18）**

- 历史面板点击跳转：每条操作记录带撤销深度，点击任意历史记录可一键撤销 / 重做到该操作后的状态（如从"删除元素"跳回删除前、再跳回模板初始态）。
- PDF 多页导出：超宽鱼骨图按横向 A4 自动分页平铺，避免单页压缩过小，每页保留标题。
- 自动化回归（`tests/p10-check.js`）通过：历史跳转状态与撤销深度正确、多页 PDF 下载成功；P1-P5、P7-P9 回归同步通过，0 控制台错误。

**P9 历史面板与批量编辑增强已完成（2026-08-18）**

- 撤销历史面板：工具条新增"历史"按钮，展示最近 30 条操作（模板应用、样式修改、删除、复制粘贴、移动、导入等），支持面板内撤销一步 / 重做一步。
- 批量编辑增强：多选时新增字号、字重、箭头大小、虚线开关，与原有颜色 / 填充 / 线宽 / 透明度一起批量生效。
- 自动化回归（`tests/p9-check.js`）通过：历史面板记录与撤销、批量字号 / 字重、批量箭头 / 虚线均正确；P1-P5、P7、P8 回归同步通过，0 控制台错误。

**P8 行业模板与 PDF 细节已完成（2026-08-18）**

- 模板扩展：新增根因分析（流程制度 / 人员操作 / 设备环境 / 沟通交接 / 培训教育 / 监督管理）与护理质量（基础护理 / 专科护理 / 护理文书 / 消毒隔离 / 患者安全 / 健康教育）。
- PDF 导出优化：PDF 首行绘制文档标题（居中），图片区域下移并等比适配，文件名使用当前标题。
- 触屏细节：工具栏 / 属性面板控件增加 `touch-action: manipulation`，避免移动端双击缩放。
- 自动化回归（`tests/p8-check.js`）通过：新模板标签正确、PDF 带标题下载且文件非空；P1-P5、P7 回归同步通过，0 控制台错误。

**P7 综合增强已完成（2026-08-18）**

- PDF 导出：jsPDF 已本地化到 `lib/jspdf.umd.min.js`，工具条新增 PDF 按钮（横向 A4，图片等比适配）。
- 模板扩展：新增医疗质控（制度流程 / 人员素质 / 设备设施 / 药品耗材 / 环境因素 / 管理监督）与护理不良事件（护理人员 / 患者因素 / 设备材料 / 流程制度 / 环境因素 / 沟通协作）模板。
- 视觉精修：连线样式预设（默认蓝 / 深色加粗 / 暖色 / 蓝色虚线），鱼头标题间距微调。
- 交互细节：复制 / 剪切 / 粘贴 / 快速复制 / 删除均有全局提示；删除提示 Ctrl+Z 可恢复；空画布显示引导层并可一键生成空骨架；工具条新增清空画布。
- 触屏模拟回归：通过 CDP 触摸事件模拟组件库拖拽与双指缩放，验证通过（真机仍建议手动回归）。
- 自动化回归（`tests/p7-check.js`）通过，P1-P5 回归同步通过，0 控制台错误。

**P5 撤销粒度与触屏适配已完成（2026-08-18）**

- 撤销粒度优化：对齐 / 分布 / 批量样式 / 鱼形切换通过 `model.startBatch/stopBatch` 合并为单步撤销；节点拖拽一次操作对应一步撤销。
- 快捷键修复：原 X6 Keyboard 只监听画布容器，点击面板后 Ctrl+Z 等失效；已改为 document 级统一监听，输入框内保留原生撤销，Ctrl+S 保存全局生效。
- 触屏适配：画布 `touch-action: none`，单指平移 / 双指缩放处理（仅响应真实触摸事件），组件库 / 属性面板支持一键折叠腾出画布空间。
- 自动化回归（`tests/p5-check.js`）通过：对齐、分布、批量样式、拖拽均为单步撤销；面板折叠正常；0 控制台错误；P1-P4 回归同步通过。

**P4 超链接与复制粘贴完善已完成（2026-08-18）**

- 属性面板新增节点超链接：URL 输入、新窗口 / 当前窗口打开方式、一键打开链接按钮；URL 随文档保存 / 导出持久化。
- 复制粘贴完善：Ctrl+C / Ctrl+V / Ctrl+X、Ctrl+D 快速复制；粘贴 / 复制后自动选中新元素并保证 ID 唯一；属性面板新增复制 / 粘贴按钮。
- 自动化回归（`tests/p4-check.js`）通过：URL 设置与持久化、打开链接弹窗、复制粘贴节点数 +1、Ctrl+D +1、ID 唯一、重载数据一致，0 控制台错误；P1 / P2 / P3 回归同步通过。

**P3 图片节点与对齐分布已完成（2026-08-18）**

- 组件库新增图片节点，支持属性面板填写图片 URL 或选择本地图片（转 dataURL 持久化）。
- 多选节点支持对齐与分布：左对齐、水平居中、右对齐、顶对齐、垂直居中、底对齐、横向等距、纵向等距。
- 自动化回归（`tests/p3-check.js`）通过：三节点顶对齐 y 一致、横向等距间隔一致、图片 URL 设置与保存重载后持久化，0 控制台错误；P1 / P2 回归同步通过。

**P2 鱼形预设与批量样式已完成（2026-08-18）**

- 属性面板新增鱼形预设切换（7 套旧版鱼形 path）与朝向切换（左 / 右），鱼头鱼尾联动更新并持久化。
- 多选元素支持批量样式：字体颜色、填充、边框、边框线宽、线条颜色、线宽、透明度。
- 属性面板新增置顶 / 置底层级操作。
- 经典六原因模板布局修正（子原因不再与鱼头重叠），模板 / 导入 / 加载后自动 `zoomToFit`。
- 自动化回归（`tests/p2-check.js`）通过：预设切换尺寸正确、朝向与文本锚点正确、批量填充生效、保存重载后样式持久化，0 控制台错误；P0 / P1 回归同步通过。

**P1 编辑器外壳已完成（2026-08-18）**

- 正式页面：`index.html` 文档列表 + `editor.html` 画布编辑器。
- 功能：
  - 左侧组件库拖拽鱼头 / 鱼尾 / 中脊 / 一级二级鱼刺 / 内容节点 / 原因分组 / 文本框
  - 自由摆放、端口连线、双击内联编辑文字、右键平移、Ctrl+滚轮缩放
  - 右侧属性面板：画布背景、文字、字号、字色、字重、填充、边框、线宽、透明度；连线颜色 / 线宽 / 箭头 / 虚线
  - 顶部工具条：新建、模板（空骨架 / 经典六原因）、撤销重做、保存、导入导出 JSON、导出 PNG/SVG
  - localStorage 多文档管理；`beforeunload` 未保存提示；Ctrl+S 保存
  - 鱼头 / 鱼尾使用旧版 Raphael 的真实 path 数据，7 套鱼形预设数据已内置
- 自动化回归（`tests/p1-check.js`）全部通过：模板生成 21 节点 / 20 边，属性修改与撤销正确，保存 / 重载 / 导入 / 导出 / 文档列表闭环，0 控制台错误。

**P0 技术验证（2026-08-18）**

- X6 3.1.8 UMD 核心已本地化到 `lib/x6.min.js`，可离线使用。
- 验证页 `tests/p0-validation.html` 已验证：
  - 8 个官方插件可用：Stencil、Dnd、Selection、Snapline、Keyboard、Clipboard、Export、History。
  - 组件库拖拽入画布：测试中节点数 14 → 15，拖拽成功。
  - 双击节点内联编辑文字：提交后 SVG 文字更新成功。
  - 导出 SVG/PNG：下载文件名正确（`鱼骨图P0.svg` / `鱼骨图P0.png`）。
  - localStorage 保存 → 清空 → 恢复：恢复后节点数一致。
  - 自动化检查 0 个控制台/页面错误。

## 文件结构

```text
lib/                  X6 3.1.8 本地资源（x6.min.js + LICENSE）
                      jsPDF 2.5.1 本地资源（jspdf.umd.min.js + LICENSE）
js/
  ygt-core.js         数据模型 / localStorage 文档存储 / JSON 校验导入导出
  ygt-shapes.js       鱼形 shapes / 7 套鱼形 path / 模板生成
  ygt-canvas.js       画布、插件装配、组件库、内联编辑
  ygt-props.js        右侧属性面板
  ygt-toolbar.js      顶部工具条
  ygt-app.js          编辑器页 / 文档列表页启动逻辑
tests/
  p0-validation.html  P0 验证页（组件库 + 画布 + 示例鱼骨图）
  p0-check.js         Playwright 自动化验证脚本
  p0-debug.js         浏览器 DOM 调试脚本
  p1-check.js         P1 功能回归脚本（模板/属性/撤销/保存/导入导出/列表）
  p2-check.js         P2 功能回归脚本（鱼形预设/朝向/批量样式/层级/持久化）
  p3-check.js         P3 功能回归脚本（图片节点/对齐分布/持久化）
  p4-check.js         P4 功能回归脚本（超链接/复制粘贴/快速复制/持久化）
  p5-check.js         P5 功能回归脚本（撤销粒度/快捷键/面板折叠/触屏冒烟）
  p7-check.js         P7 功能回归脚本（模板/PDF/连线预设/提示/空画布引导/触屏模拟）
  p8-check.js         P8 功能回归脚本（行业模板/PDF 标题导出）
  p9-check.js         P9 功能回归脚本（历史面板/批量编辑增强）
  p10-check.js        P10 功能回归脚本（历史跳转/多页 PDF）
  p14-check.js        P14 功能回归脚本（严格层级/校验/持久化）
  pw.js               测试运行时 playwright-core 自动探测
  shots/              自动化截图输出
npm-libs/             X6 npm 包临时下载目录（非运行依赖，可删除）
npm-libs-p7/          jsPDF npm 包临时下载目录（非运行依赖，可删除）
index.html            文档列表页
editor.html           画布编辑器页
```

## 运行

直接用 Chrome/Edge 打开 `index.html` 进入文档列表，或打开 `editor.html` 直接编辑。

自动化验证（本机 Node + Edge）：

```text
node tests/p0-check.js
node tests/p1-check.js
node tests/p2-check.js
node tests/p3-check.js
node tests/p4-check.js
node tests/p5-check.js
node tests/p7-check.js
node tests/p8-check.js
node tests/p9-check.js
node tests/p10-check.js
node tests/p14-check.js
```

## 数据格式

文档存储为 localStorage（`ygt.documents` 列表 + `ygt.doc.<id>` 全量 JSON），
结构：`{version, id, title, createdAt, updatedAt, canvas:{background}, cells:[]}`，
其中 `cells` 为 X6 `graph.toJSON()` 的节点 / 连线数组。

## 关键技术结论

1. X6 3.1.8 的 UMD 构建把全部插件类（`X6.Selection`、`X6.Stencil`、`X6.Dnd` 等）打进核心包，无需再引 `@antv/x6-plugin-*` 独立包。
2. 插件在 UMD 中的 API 增强（`graph.exportPNG`、`graph.bindKey`、`graph.history` 等）未打进核心，必须持有插件实例调用：`exportPlugin.exportPNG()`、`keyboard.bindKey()`、`history.undo()`。
3. Stencil 组件默认绝对定位铺满最近定位祖先，容器需要 `position: relative`。

## 下一步

后续候选：后端持久化（暂缓）、真机触屏回归、更多行业模板、多文档合并、撤销历史持久化；线段自动吸附方案见 `docs/待考虑方案.md`。

## Vue + FastAPI 改造（2026-08-25）

主入口已改为 Vue 3 + FastAPI 的浏览器/后端模式，旧版 `index.html / editor.html` 保留供离线回归：

```text
app/                 FastAPI 后端（参考 aireport/app 结构）
  config.py          配置（app / jwt 段，支持 config.yaml）
  middleware/auth.py JWT Bearer 鉴权（get_current_user）
  models.py          SQLite + SQLAlchemy（data/yugutu.db）
  routers/ygt_doc.py 文档 CRUD（list/create/get/save/rename/delete）
  scripts/make_token.py  生成开发 token 与打开地址
vue/                 Vue 3 + Vite 前端
  src/api/client.js  axios + token（localStorage/URL/cookie 初始化，401 自动清 token）
  src/views/         文档列表 + 编辑器（工具栏/属性面板均为 Vue 组件）
  public/            X6/jsPDF 与 ygt 引擎文件的构建副本
tests/vue-smoke.js   Vue 页面级冒烟（列表/模板/保存/重载）
```

运行：

```text
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
cd vue && npm install && npm run build && cd ..
.venv\Scripts\python -m app.main
```

打开 `http://127.0.0.1:8766/` 后，先执行
`.venv\Scripts\python -m app.scripts.make_token` 获得带 token 的地址；
开发调试可用 `cd vue && npm run dev`（Vite 5173 已代理 `/api` 到 8766）。

## 数据库存储（hl_ygt / hl_ygtmx）

- 主表 `hl_ygt`：`xh=文档ID`、`ygmc=标题`、`positions=完整文档JSON(version/canvas/cells)`、
  `leaftype=鱼朝向`、`cjrq=创建/更新时间`、`version` 每次保存 +1。
- 明细表 `hl_ygtmx`：业务节点（bone-node/group-node）一行一条，`xhid=节点ID`、
  `xh=文档ID`、`lbmc=节点文本`、`fqbh=父级ID(根为ROOT)`、`pxbh=排序`、
  `zyyypb=重要标志(加粗标红)`、`url/opentype=超链接`；鱼头只存 `ygmc`，不进明细。
- 保存：主表 upsert，明细按 `xh` 先删后插；删除文档同时删两表。
- 读取：`positions` 有值直接还原（属性面板全部属性都在 JSON 里）；
  `positions` 为空时用 `hl_ygtmx` 按上下级自动布局重建显示。
- 数据库类型由 `config.yaml` 的 `database.type` 控制：`sqlite / postgresql / oracle`。

### token 使用方式（开发 / 线上）

- 开发环境：`make_token.py` 用当前 jwt 配置本地签发 token，可拼到 URL
  （`?token=...`）或写入浏览器 localStorage 的 `token` 键；前端请求自动带
  `Authorization: Bearer`。可加 `--check <token>` 校验签名。
- 线上环境：token 由统一登录系统签发，本项目不生成；后端只负责从请求头解析并校验。
  将 `config.example.yaml` 复制为 `config.yaml`，把 `jwt.secret_key / issuer / audience`
  配成与 SSO 一致，重启后端即可。前端获取 token 的优先级：localStorage → URL `?token=` → cookie。
- 前端收到 401 且本次请求带过 token 时会清除 token 并刷新一次；
  从未带 token 时直接显示“缺少 token”错误页，不再无限刷新。
