# 项目经验教训（招聘人格评测）

<!-- 新的经验教训将追加在此处 -->

## 2026-04-14 搬迁网络与 assessment 公网可用性

- **场景**：Dell 换机房/网线，内网 IP 变更；公网 `assessment.suuntoyun.com` 出现 502。
- **问题**：`cloudflared` 仍把域名指到 `http://192.168.13.44:30080`，新环境下该地址不可达或端口无服务。
- **教训**：Tunnel 的 `ingress` 里 **不要用会随搬迁失效的「旧固定内网 IP」**；优先 **`http://127.0.0.1:<应用端口>`**（与 PM2 监听一致），改 IP 后不必改 tunnel。

## 2026-04-14 Next.js `output: 'standalone'` 与静态资源

- **场景**：页面能打开但无样式，`/_next/static/*` 404。
- **问题**：只部署了 `standalone`，未把 **`.next/static`**（及 **`public`**）同步进 `standalone/.next/static`（及 `standalone/public`）。
- **教训**：每次 **`npm run build`** 后执行 **`rsync` 静态与 public 到 standalone**（或写进部署脚本）。

## 2026-04-14 standalone 内 `data/` 与 `next build`

- **场景**：服务器上在源码目录执行 `next build` 后，评测数据「又没了」。
- **问题**：**`next build` 会重新生成 `.next/standalone`，其中的 `data/` 可能被重置**，与「唯一真库」（如 `/mnt/data/k8s/personality-assessment/assessment.db`）脱节。
- **教训**：构建后 **固定一步：从权威路径拷回 `assessment.db*`**，或 **`DATABASE_PATH` 指向 standalone 外的目录**，避免构建覆盖业务库。

## 2026-04-14 PM2 端口与多应用同机

- **场景**：按文档把评测绑在 3000，但本机 3000 已被其他 Next（如 draw-io）占用。
- **问题**：端口冲突或错连到别的应用。
- **教训**：评测独占 **`PORT`（如 3015）** + **`ecosystem.config.cjs` 持久化环境变量**；Tunnel 指到该端口。

## 2026-04-14 API 蛇形字段与前端驼峰

- **场景**：后台列表统计、时间正常，「候选人信息」整列为空。
- **问题**：`GET /api/sessions` 使用 **`...session` 展开 SQL 行**，JSON 为 **`candidate_name`**，前端只读 **`candidateName`**。
- **教训**：列表/详情 API **必须显式映射为前端契约（驼峰）**；客户端可在 **`sessionApi.get/getAll`** 再做 **`normalizeSessionFromApi`** 双保险；`answers`/`results` 用 **try/catch 式安全 JSON 解析**，避免单行坏数据拖垮整表。
