# 鱼骨图工作流设计器（YGT Flow）
> 当前版本：鱼骨图 V2.0（2026-09-08 定稿）。V1.0 功能基线及后续版本记录见 docs/ygt-version-history.md。

基于 AntV X6 3.1.8 的零构建画布编辑器，目标形态参照流行工作流设计器：左侧组件库拖拽、画布自由摆放连线、双击编辑文字、属性面板改样式、保存/导入导出。

## 当前进度

**鱼骨图 V2.0（2026-09-08 定稿）**

当前版本功能基线与后续版本记录统一维护于 [docs/ygt-version-history.md](docs/ygt-version-history.md)，README 不再逐条重复历史进度。

V2.0 定稿新增：文档列表“新建鱼骨图”改为弹窗，包含名称输入、模板卡片与 7 套预设样式预览，创建后自动带入模板与样式进入编辑器。V1.2 新增：独立只读预览界面 `?docId=xxx&view=preview`，全屏仅保留缩放与 PNG/SVG/PDF 导出，支持按住空格 + 鼠标左键拖动平移（单击不拖动），触屏单指平移，不允许编辑。V1.1 新增：一二级鱼刺文字按框自动折行，超出显示省略号，拖动框体后即时重算；双击与属性面板支持回车换行。原有 V1.0 核心范围：7 套鱼形预设、模板、鱼头文字、四向端口与 edge-to-edge 连线、层级按线同步、悬空自动回连、层级树编辑、通用设置、导入导出、FastAPI 多库存储。

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
