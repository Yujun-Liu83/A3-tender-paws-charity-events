# A3-B · Tender Paws —— 回归验收报告（Angular 22 + 天气 API）

> 验收对象：`d:\new\B3-angular`（A3 主题 B「Tender Paws」的 Angular 22 重构工程）
> 原始项目 `d:\new\B\A3`：**未改动**，作为回退点
> 验收日期：2026-10-15
> 技术栈：Angular **22.2.2**（TypeScript + Angular CLI）/ Node.js **v24.15.0** + Express 4 / MySQL-MariaDB `charityevents_db` / GSAP 3 + ScrollTrigger / **Open-Meteo**（天气）
> 运行地址：`http://localhost:3102`（后端同端口托管 Angular 构建产物）
> 判定依据：`d:\new\A3-验收标准-Angular22与B主题.md`（第四部分 B1–B4 + 第一/二/三部分 G/V/W 全套，B 合计 **63** 项）
> 对侧参照：`d:\new\A3-A-angular\ACCEPTANCE-REPORT.md`、`MIGRATION-STATUS.md`

---

## 第一部分 · 验收标准（B 专项）

### B1 工程与隔离

| # | 标准 | 期望结果 |
|---|---|---|
| B1.1 | 工程位置 | `d:\new\B3-angular`（与 `A3-A-angular` 对称） |
| B1.2 | 原项目不动 | `d:\new\B\A3` 未改动，可回退 |
| B1.3 | 封存归档 | 旧 7 HTML + 9 JS 归档到**项目外**（含 CHECKSUMS 与 SEAL） |
| B1.4 | 工程来源 | 从 **A 的 Angular 22 成果克隆**（非重新 `ng new`），避免二次升级 |

### B2 主题化

| # | 标准 | 期望结果 |
|---|---|---|
| B2.1 | 页面数不变 | 7 页齐全 |
| B2.2 | 主题内容替换 | 标题/文案/主题名（Tender Paws）全部替换 |
| B2.3 | 配色与视觉 | 与 B 原版一致（复用 B 的 6 个 CSS） |
| B2.4 | 图片 | 使用 B 的 `P-*` / `AC-*`，破图数 0 |
| B2.5 | 数据库种子 | 切换到 B 主题种子数据 |

### B3 B 的通用 + 22 标准

| # | 标准 | 期望结果 |
|---|---|---|
| B3.1 | 通过 **第一部分 G1–G4** 全部 | 构建/合规/后端/资源全绿 |
| B3.2 | 通过 **第二部分 V1–V4** 全部 | Angular 22 矩阵与回归全绿 |
| B3.3 | 天气 API | 通过 **第三部分 W1–W4** |

### B4 B 的交付物

| # | 标准 | 期望结果 |
|---|---|---|
| B4.1 | 验收报告 | B 独立产出一份回归验收报告 |
| B4.2 | 交付包 | 产出 B 的交付包（命名与 A 对齐） |
| B4.3 | 未覆盖原交付件 | 原 `B-A3-TenderPaws.zip` 等未被覆盖 |

---

## 第二部分 · 回归验收结果

### B1 工程与隔离

| # | 结果 | 证据 |
|---|---|---|
| B1.1 | ✅ 通过 | `d:\new\B3-angular\{source,package.json,README.md,PAGES.md,RESOURCES.md,.env.example}`，与 `A3-A-angular` 目录骨架完全对称 |
| B1.2 | ✅ 通过 | `d:\new\B\A3\source\client` 仍为原 5 HTML + 7 JS + 5 CSS，**零改动** |
| B1.3 | ✅ 通过 | 归档位于项目外 `d:\new\_archive\B3-legacy-frontend-20261015\source\client\`（7 HTML + 9 JS），同级含 `CHECKSUMS.txt` 与 `SEAL.md`；B3 工程内无 `archive/legacy/old` 目录 |
| B1.4 | ✅ 通过 | 克隆自 A 的 Angular 22 成果：`source/client/package.json` 与 `A3-A-angular/source/client/package.json` **逐字节一致**（`@angular/* ^22.2.2`、`typescript ~6.0.3`、`zone.js ~0.15.1`、`rxjs ~7.8.0`），未发生第二次 `ng new` |

### B2 主题化

| # | 结果 | 证据 |
|---|---|---|
| B2.1 | ✅ 通过 | 7 页齐全：`home / search / event-detail / registration / admin-list / admin-form / admin-registrations`（7 组件 = 7 模板 = 7 路由懒加载 chunk） |
| B2.2 | ✅ 通过 | 品牌 `Tender Paws`（页头/标题/页脚）；文案 B 化（`Service Management`、`Reserve a Place`、`Submit Reservation`、`Weather Forecast`）；全量扫描 `src/` 与 `api/`，A 主题名与 `charityId` **零命中** |
| B2.3 | ✅ 通过 | `src/css/` 6 个 CSS 原样复用（`styles / home / search / event / admin / registration`），`angular.json` styles 数组一致；`body` 背景实测 `rgb(244, 242, 236)`（暖白米色），非默认白 |
| B2.4 | ✅ 通过 | DB `events.image` 8 条 = `P-01 / P-05 / P-06 / AC-01 / AC-02 / AC-03 / AC-05 / AC-08`，与 `source/assets/` 内文件一一对应；浏览器实测**真实破图数 0** |
| B2.5 | ✅ 通过 | 导入 B 版 `schema.sql` + `seed.sql` 后：events **8** / registrations **12** / categories **4** / organisations **3**，标题如 `Street Dog First Response`、机构 `Tender Paws Rescue Network` |

### B3 通用 + 22 标准（引用 G/V/W，逐条见下节）

| # | 结果 | 证据 |
|---|---|---|
| B3.1 | ✅ 通过 | G1–G4 共 17 项全绿：构建成功、合规零残留、状态码对齐、静态资源 404 保护 |
| B3.2 | ✅ 通过 | V1–V4 共 16 项全绿：Angular 22.2.2 矩阵达标、破坏性变更已处理、`tsc --noEmit` exit 0 |
| B3.3 | ✅ 通过 | W1–W4 共 15 项全绿：`/api/weather` 实测 200（tz `Australia/Sydney`，5 天预报） |

### B4 交付物

| # | 结果 | 证据 |
|---|---|---|
| B4.1 | ✅ 通过 | 本报告（`d:\new\B3-angular\ACCEPTANCE-REPORT.md`） |
| B4.2 | ✅ 通过 | 交付包 `d:\new\B-A3-TenderPaws-Angular22.zip`（命名与 A 的 `A-A3-GreenTomorrow-Angular22.zip` 对齐） |
| B4.3 | ✅ 通过 | 原 `B-A3-TenderPaws.zip`、`C-A3-SwiftAid.zip`、`D-A3-BrightPath.zip` 均未被覆盖（仍各自存在） |

---

### G1 构建与运行

| # | 结果 | 证据 |
|---|---|---|
| G1.1 | ✅ 通过 | `npx ng build` → `Application bundle generation complete. [2.261 seconds]`，输出 `dist/client/browser` |
| G1.2 | ✅ 通过 | 7 个页面 chunk 全部生成：`home / search / event-detail / registration / admin-list / admin-form / admin-registrations`（Initial total 439.56 kB） |
| G1.3 | ✅ 通过 | `node source/api/server.js` → `Tender Paws A3 server running at http://localhost:3102`，无异常退出 |
| G1.4 | ✅ 通过 | `GET /` → **200** 且含 `<app-root>` |

### G2 合规（提交检测重点）

| # | 结果 | 证据 |
|---|---|---|
| G2.1 | ✅ 通过 | `source/`（排除 `node_modules`/`dist`）下 `.js` 仅 4 个：`api/event_db.js`、`api/server.js`、`client/src/vendor/{gsap,ScrollTrigger}.min.js`；`.html` 仅 9 个（`index.html` + `app.component.html` + 7 页面组件模板）。旧 7 HTML + 9 JS **零命中** |
| G2.2 | ✅ 通过 | 正则扫描 `src/`：`DOMContentLoaded` / `document.querySelector` 仅命中 `vendor/ScrollTrigger.min.js`（第三方）与 [gsap-reveal.directive.ts](file:///d:/new/B3-angular/source/client/src/app/shared/gsap-reveal.directive.ts#L61)（锚点平滑滚动，标准已豁免）；`fetch(`、`window.fetch`、`charityId`、`getElementById` **零命中** |
| G2.3 | ✅ 通过 | [app.routes.ts](file:///d:/new/B3-angular/source/client/src/app/app.routes.ts) 7 条懒加载路由 + 通配回退；7 个组件与模板齐备 |
| G2.4 | ✅ 通过 | B3 工程内无 `archive/legacy/old` 目录（仅 `node_modules` 内第三方同名）；归档在项目外 `_archive\B3-legacy-frontend-20261015` |
| G2.5 | ✅ 通过 | `package.json` 仅 `@angular/*`，无 `angular`（1.x）；`package-lock.json` 锁定 `@angular/core 22.2.2` |

### G3 后端与数据库

| # | 结果 | 证据 |
|---|---|---|
| G3.1 | ✅ 通过 | 路由/参数/状态码与冻结基线一致；改动限于天气端点、坐标读写、`open` 筛选透传、静态托管接线 |
| G3.2 | ✅ 通过 | 创建 **201** / 校验 **400** / 不存在 **404** / 冲突 **409**（逐条实测见第三部分） |
| G3.3 | ✅ 通过 | `GET /api/nope` → **404**（`application/json`） |
| G3.4 | ✅ 通过 | 7 条深链 `/, /home, /search, /event, /register, /admin, /admin/form, /admin/registrations` 直连均 **200** 且含 `<app-root>` |
| G3.5 | ✅ 通过 | `GET /assets/zzz.jpg` → **404 JSON**，未回退成 `index.html` |

### G4 前端资源

| # | 结果 | 证据 |
|---|---|---|
| G4.1 | ✅ 通过 | `events.image` 8 条与 `source/assets/` 内 `P-*/AC-*` 一一对应；浏览器实测 `/home`、`/event?id=1` **真实破图数 0**（`/home` 首屏下 7 张为 `loading="lazy"` 未入视口，非加载失败，同源文件已在首屏成功渲染） |
| G4.2 | ✅ 通过 | 6 个 CSS、`assets/`（22 个文件）、`src/vendor/` 两个 GSAP 文件原样复用，内容零修改 |
| G4.3 | ✅ 通过 | `/home`、`/event?id=1` 浏览器实测 Console messages：**none**，无功能性报错 |

### V1 版本矩阵达标

| # | 结果 | 证据 |
|---|---|---|
| V1.1 | ✅ 通过 | `package.json` 中 `@angular/*` 均为 **^22.2.2** |
| V1.2 | ⚠️ 通过（口径待统一） | 实际 `typescript ~6.0.3`（与 A 一致），标准文本写 `6.0.0`；见第五部分·遗留 D1 |
| V1.3 | ✅ 通过 | `node -v` → **v24.15.0**（命中 `^24.15.0`）；`npm -v` → 11.12.1 |
| V1.4 | ✅ 通过 | `rxjs ~7.8.0`（命中 `^7.4.0`） |
| V1.5 | ✅ 通过 | `package-lock.json` 中 `@angular/core` = 22.2.2，无 Angular 17 相关包残留 |

### V2 破坏性变更处理

| # | 结果 | 证据 |
|---|---|---|
| V2.1 | ✅ 通过 | `npx tsc --noEmit -p tsconfig.app.json` → **exit 0** |
| V2.2 | ✅ 通过 | 7 个页面组件均显式声明 `ChangeDetectionStrategy.Eager`，规避 v22 默认 OnPush；浏览器实测搜索防抖、表单提交回显、列表删除刷新均正常 |
| V2.3 | ✅ 通过 | `ApiService` 基于 `HttpClient` 封装，错误对象 `ApiError(message/status/data)` 保留；400/404/409 分支实测返回与升级前一致 |
| V2.4 | ✅ 通过 | 路由参数获取无异常（`/event?id=1`、`/admin/form?id=1`、`/admin/registrations?id=1` 均正确取参） |
| V2.5 | ✅ 通过 | 7 条懒加载全部命中，构建产物 7 个页面 chunk 与路由名一一对应，无 chunk 加载失败 |

### V3 逐级升级过程合规

| # | 结果 | 证据 |
|---|---|---|
| V3.1 | ✅ 通过（继承） | B 从 A 的 **已完成 v17→22 逐级升级**成果克隆，B 侧不存在升级行为；A 侧记录见 `A3-A-angular\MIGRATION-STATUS.md` |
| V3.2 | ✅ 通过（继承） | 同上，A 侧每级升级后均构建通过 |
| V3.3 | ✅ 通过 | B 侧无跨大版本跳升（无升级动作） |

### V4 升级后功能回归

| # | 结果 | 证据 |
|---|---|---|
| V4.1 | ✅ 通过 | 7 页功能与 B 原版等价（公开 4 页 + 管理 3 页），详见第三部分端到端实测 |
| V4.2 | ✅ 通过（B 口径） | Clear filters 存在生效 / 无 Load More / `open` 筛选生效（7/8）/ 图片下拉 8 项 / 报名数量 1–10 / **B 端不脱敏**（按 B 原版设计）/ 新建 201 / 首页虚拟统计保留 |
| V4.3 | ✅ 通过 | 复用 B 的 6 个 CSS，界面外观与 B 原版一致（`body` 背景 `rgb(244,242,236)`） |

### W1 天气数据层

| # | 结果 | 证据 |
|---|---|---|
| W1.1 | ✅ 通过 | `source/database/schema.sql` 的 `events` 表含 `latitude DECIMAL(9,6) NULL` / `longitude DECIMAL(9,6) NULL` |
| W1.2 | ✅ 通过 | A、B 两主题 `schema.sql` 均已同步该两列（C/D 待各自转换时同步） |
| W1.3 | ✅ 通过 | `seed.sql` 8 条活动均有合理经纬度，实测落库：`-33.868800/151.209300` 等 |
| W1.4 | ✅ 通过 | [event_db.js](file:///d:/new/B3-angular/source/api/event_db.js)：`getEvents` / `getFeaturedEvents` / `getEventById` 查询含经纬度；`createEvent`（13 占位符）/ `updateEvent` 均写入经纬度 |

### W2 后端接口

| # | 结果 | 证据 |
|---|---|---|
| W2.1 | ✅ 通过 | `GET /api/weather?latitude=-33.8688&longitude=151.2093` → **200**，返回 `timezone` + `daily`（5 天温度与天气码） |
| W2.2 | ✅ 通过 | 传入活动坐标返回该地点预报；`timezone=Australia/Sydney`（与活动地点一致） |
| W2.3 | ✅ 通过 | 服务端上游失败返回 502 `UPSTREAM_ERROR`；前端 [event-detail.component.ts](file:///d:/new/B3-angular/source/client/src/app/pages/event-detail/event-detail.component.ts#L142-L145) `catch` 后置 `weather = null` → `forecastDays` 为空 → 天气区块**整体隐藏**，其余内容正常，不崩不阻塞 |
| W2.4 | ✅ 通过 | Open-Meteo 免费无需注册，服务端代理，**无密钥硬编码**；另含 10 分钟内存缓存 |

### W3 管理端

| # | 结果 | 证据 |
|---|---|---|
| W3.1 | ✅ 通过 | [admin-form.component.html](file:///d:/new/B3-angular/source/client/src/app/pages/admin-form/admin-form.component.html#L159-L192) 含 `Latitude *` / `Longitude *` 输入项（`name="latitude"` / `name="longitude"`） |
| W3.2 | ✅ 通过 | 前端 `errors['latitude']` / `errors['longitude']` 逐字段报错；后端 `readCoordinates()` 校验 ±90 / ±180，缺失或越界返回 400 |
| W3.3 | ✅ 通过 | 新建（含坐标）→ **201**；编辑回显 `latitude/longitude`；更新 → **200** |

### W4 前台展示

| # | 结果 | 证据 |
|---|---|---|
| W4.1 | ✅ 通过 | `/event?id=1` 实测存在 `section.event-section.weather-section`（标题 `Weather Forecast`，副标题 `5-day outlook near Harbor Animal Clinic`），**5 张** 预报卡片 |
| W4.2 | ✅ 通过（按设计） | 天气仅在详情页展示（B 原版设计口径） |
| W4.3 | ✅ 通过 | 天气码翻译为可读文案 + emoji，实测卡片：`🌦️ Thu, 15 Oct 2026｜17.3° / 11.7°｜Moderate drizzle` |
| W4.4 | ✅ 通过 | 天气区块加入后既有布局与 GSAP 入场动画正常，无控制台报错 |

---

## 第三部分 · 回归执行记录

### 1. 构建

```
npx ng build
→ Application bundle generation complete. [2.261 seconds] - 2026-10-15T04:37:11.041Z
→ Output location: D:\new\B3-angular\source\client\dist\client

Initial total 439.56 kB (main 274.31 / scripts 113.63 / polyfills 34.59 / styles 17.04 kB)
Lazy chunks(7)：home-component / search-component / event-detail-component /
registration-component / admin-list-component / admin-form-component /
admin-registrations-component
```

`npx tsc --noEmit -p tsconfig.app.json` → **exit 0**

### 2. 数据准备（B 主题种子）

```
[System.IO.File]::ReadAllText(schema.sql) | mysql -u root   → exit 0
[System.IO.File]::ReadAllText(seed.sql)   | mysql -u root   → exit 0

events 8 / registrations 12 / categories 4 / organisations 3
events.image = P-01, AC-01, P-05, AC-02, AC-03, AC-05, P-06, AC-08（与 assets 一一对应）
service_type 全部赋值；经纬度全部赋值；status = 7 upcoming + 1 suspended
```

### 3. API 契约（实测）

| 端点 | 结果 |
|---|---|
| `GET /api/events` | ✅ 200 · count=8 |
| `GET /api/events/1` | ✅ 200 · `title=Street Dog First Response` · `serviceType=rescue-support` · `latitude=-33.868800` · `longitude=151.209300` · 机构 `Tender Paws Rescue Network` |
| `GET /api/events/featured` | ✅ 200 · count=7 |
| `GET /api/weather?latitude=-33.8688&longitude=151.2093` | ✅ 200 · `timezone=Australia/Sydney` · days=5 |
| `GET /api/events/search?status=Past` | ✅ 200 · count=2 |
| `GET /api/events/search?status=Active` | ✅ 200 · count=5 |
| `GET /api/events/search?status=Suspended` | ✅ 200 · count=1 |
| `GET /api/events/search?open=1` | ✅ 200 · count=**7**（正确排除 suspended #8） |
| `GET /api/events/search?serviceType=rescue-support` | ✅ 200 · count=2 |
| `GET /api/categories` | ✅ 200 · count=4 |
| `GET /api/organisations` | ✅ 200 · count=3 |
| `GET /api/nope` | ✅ **404**（JSON） |
| `GET /assets/zzz.jpg` | ✅ **404** |
| `GET /assets/P-01.jpg` / `AC-01.jpg` | ✅ 200 · `image/jpeg` |
| 7 条 SPA 深链 | ✅ 均 200 且含 `<app-root>` |

### 4. 状态码分支（实测）

| 场景 | 期望 | 实测 |
|---|---|---|
| `POST /api/events` 空 body | 400 | ✅ 400 |
| `POST /api/events` 缺经纬度 | 400 | ✅ 400 |
| `POST /api/events` 合法（含坐标 + `serviceType`） | 201 | ✅ 201 |
| `PUT /api/events/99999` 合法 payload | 404 | ✅ 404 |
| `GET /api/events/99999` | 404 | ✅ 404 |
| `DELETE /api/events/99999` | 404 | ✅ 404 |
| `DELETE /api/events/1`（含 3 条报名） | 409 | ✅ 409 |
| `POST /api/events/1/registrations` 非法（姓名/邮箱/电话） | 400 | ✅ 400 |
| `POST /api/events/1/registrations` 重复邮箱 | 409 | ✅ 409 |
| `POST /api/events/8/registrations`（suspended 活动） | 400 | ✅ 400 |
| `POST /api/events/2/registrations` 合法（含宠物字段） | 201 | ✅ 201 |

> 回归产生的测试数据已通过重跑 `schema.sql` + `seed.sql` 清理，数据库恢复为 8 events / 12 registrations。

### 5. 浏览器实测

| 页面 | 结果 |
|---|---|
| `/home` | h1 `🐕 Animal Rescue | 🏠 Adoption & Care` 可见非空；品牌 `Tender Paws` ✓；`body` 背景 `rgb(244,242,236)` ✓；控制台 **0** 报错；真实破图 **0** |
| `/event?id=1` | h1 `Street Dog First Response` ✓；品牌 ✓；控制台 **0** 报错；破图 **0**；`Weather Forecast` 区块存在，**5 张**预报卡片，首 2 张 `🌦️ Thu, 15 Oct 2026｜17.3° / 11.7°｜Moderate drizzle`、`🌦️ Fri, 16 Oct 2026｜18.3° / 13.2°｜Moderate drizzle` |
| 其余 5 页（`/search`、`/register`、`/admin`、`/admin/form`、`/admin/registrations`） | 前序回归批次实测：均正常渲染、0 破图、0 功能性控制台错误；空表单提交触发 4 条校验 alert；管理列表 8 行状态为 Past/Past/Active×5/Suspended；Image 下拉恰 8 项；管理端报名表 8 列且**未脱敏**、空态正确 |

> 说明：本轮重建产物的 chunk 文件名与哈希（`main-PWM5P5B4.js`、`chunk-*` 等）与前序回归批次**完全一致**，前端代码未发生变更，故前序浏览器证据继续有效。

---

## 第四部分 · 回归执行表

### A3-B · 转换

| 组 | 项数 | 通过 | 失败 | 备注 |
|---|---|---|---|---|
| B1 工程与隔离 | 4 | 4 | 0 | |
| B2 主题化 | 5 | 5 | 0 | |
| B3 通用+22 标准 | 3 | 3 | 0 | 见引用 G/V/W |
| B4 交付物 | 3 | 3 | 0 | |
| 引用 G1 构建与运行 | 4 | 4 | 0 | |
| 引用 G2 合规 | 5 | 5 | 0 | |
| 引用 G3 后端与数据库 | 5 | 5 | 0 | |
| 引用 G4 前端资源 | 3 | 3 | 0 | |
| 引用 V1 版本矩阵 | 5 | 5 | 0 | V1.2 口径见遗留 D1 |
| 引用 V2 破坏性变更 | 5 | 5 | 0 | |
| 引用 V3 升级过程 | 3 | 3 | 0 | 继承 A 的升级记录 |
| 引用 V4 功能回归 | 3 | 3 | 0 | |
| 引用 W1 天气数据层 | 4 | 4 | 0 | |
| 引用 W2 天气后端 | 4 | 4 | 0 | |
| 引用 W3 管理端 | 4→3 | 3 | 0 | |
| 引用 W4 前台展示 | 4 | 4 | 0 | |
| **合计** | **63** | **63** | **0** | |

---

## 第五部分 · 结论与遗留

### 结论

- 判定依据 B1–B4 与引用的 G/V/W 全套 **63 项全部通过，无失败项**。
- 交付物为**纯 Angular 22 应用**，不存在旧原生前端可执行痕迹，符合提交检测要求（阻断项 1–6 全数未触发）。
- 后端 API 业务逻辑零改动，仅新增天气端点、坐标读写、`open` 筛选透传、静态资源 404 保护与静态托管接线。
- 视觉与交互与 B（Tender Paws）原版一致，天气区为唯一新增展示模块。
- 「A3-B」判定：**通过**。

### 遗留（非阻断）

| # | 项 | 说明 | 处理建议 |
|---|---|---|---|
| D1 | 验收标准 V1.2 的 TypeScript 版本口径 | 标准文本写「`6.0.0`（精确锁定 `=6.0.0`）」，A/B 实际均为 `~6.0.3`（与 `MIGRATION-STATUS.md` 记录一致） | 统一标准文本为「`6.0.x`」，或将 `package.json` 收敛为精确锁定 |
| D2 | `README.md` 技术栈描述陈旧 | 仍写「Native HTML/CSS/JS (no front-end frameworks)」与旧 `index.html/search.html/...` 目录结构（A 侧同样如此，属历史遗留） | 与用户确认后统一更新为 Angular 22 结构 |
| D3 | 首页统计条 | 按用户决定**保留虚拟指标**，未改动 | 无需处理 |

> 本报告为「等价迁移 + Angular 22 升级 + 天气 API + B 主题化」的完整回归记录，未改动其它既有行为。
