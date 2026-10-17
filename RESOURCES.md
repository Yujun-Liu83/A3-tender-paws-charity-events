# Tender Paws A3 资源清单（团队项目）

## 品牌资产

| 资源 | 路径 | 用途 | 尺寸 |
|---|---|---|---|
| Logo | `source/assets/logo.svg` | header 品牌标识 | 32×32 |
| Favicon | `source/assets/favicon.ico` / `favicon.svg` | 浏览器 tab | 32×32 |
| OG image | `source/assets/og.jpg` | 社交分享预览 | 1200×630 |
| Empty state | `source/assets/empty-state.svg` | 空状态插图 | — |
| Admin placeholder | `source/assets/admin-placeholder.svg` | 后台占位 | — |

> 客户端 HTML 中以相对路径 `assets/<file>` 引用。

## 主题图片（P-01 ~ P-08 / AC-01 ~ AC-08）

| 编号 | 路径 | 用途 |
|---|---|---|
| P-01 | `source/assets/P-01.jpg` | 首页 hero / 活动图（Street Dog First Response） |
| P-02 | `source/assets/P-02.jpg` | 备用活动图 |
| P-03 | `source/assets/P-03.jpg` | 备用活动图 |
| P-04 | `source/assets/P-04.jpg` | 备用活动图 |
| P-05 | `source/assets/P-05.jpg` | 活动图（Shelter Intake Shift） |
| P-06 | `source/assets/P-06.jpg` | 活动图（Kennel Enrichment Session） |
| P-07 | `source/assets/P-07.jpg` | 备用活动图 |
| P-08 | `source/assets/P-08.jpg` | 备用活动图 |
| AC-01 | `source/assets/AC-01.jpg` | 活动图（Meet-and-Greet Adoption Hour） |
| AC-02 | `source/assets/AC-02.jpg` | 活动图（Foster Care Orientation） |
| AC-03 | `source/assets/AC-03.jpg` | 活动图（Adoption Guidance Clinic） |
| AC-04 | `source/assets/AC-04.jpg` | 备用活动图 |
| AC-05 | `source/assets/AC-05.jpg` | 活动图（Emergency Dog Rescue Drill） |
| AC-06 | `source/assets/AC-06.jpg` | 备用活动图 |
| AC-07 | `source/assets/AC-07.jpg` | 备用活动图 |
| AC-08 | `source/assets/AC-08.jpg` | 活动图（Foster Family Meetup） |

> 事件数据中 `events.image` 存放文件名，卡片/详情以 `assets/${event.image}` 渲染；
> `object-fit: cover` 适配，每张配描述性 `alt`（英文）。

## 第三方库

| 库 | 版本 | 路径 | 说明 |
|---|---|---|---|
| GSAP | 3.12.x | `source/client/vendor/gsap.min.js` | 物理拷贝到 `client/vendor/`，无新增依赖 |
| ScrollTrigger | 3.12.x | `source/client/vendor/ScrollTrigger.min.js` | 与 GSAP 配套 |

## 字体

```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

## 配色（CSS 变量）

| 变量 | 值 | 用途 |
|---|---|---|
| `--color-primary` | `#BF3F00` | 主色（暖橙） |
| `--color-primary-dark` | `#A53600` | hover / active |
| `--color-bg` | `#f4f2ec` | 背景（米白） |
| `--color-text` | `#37474f` | 正文 |
| `--color-accent` | `#e5b84b` | 辅色（暖黄） |

## 动效约束

- 禁用：parallax / marquee / shake / 大幅 zoom / 无限循环
- 允许：fade-in / slide-up（≤800ms）、hover translateY ≤4px
- 所有动效包裹 `@media (prefers-reduced-motion: reduce)` 兜底

## 文件规范

### 前台 + 后台（`source/client/`）
| 类型 | 文件 |
|---|---|
| HTML | `index.html` / `search.html` / `event.html` / `registration.html` / `admin.html` / `admin-form.html` / `admin-registrations.html`（共 7 页：4 前台 + 3 后台） |
| CSS | `styles.css` / `home.css` / `search.css` / `event.css` / `registration.css` / `admin.css` |
| JS | `app.js`（公共助手）+ `home.js` / `search.js` / `event.js` / `registration.js` / `animations.js` / `admin.js` / `admin-form.js` / `admin-registrations.js` |
| vendor | `gsap.min.js` / `ScrollTrigger.min.js` |

### 数据库（`source/database/`）
| 文件 | 说明 |
|---|---|
| `schema.sql` | `charityevents_db` 库 + organisations / categories / events / registrations 四表 + 外键 + `UNIQUE(event_id, email)` |
| `seed.sql` | 4 categories + 3 organisations + 8 events + 12 registrations |

### API（`source/api/`）
| 文件 | 说明 |
|---|---|
| `server.js` | Express 服务，端口 3102（`process.env.PORT`），静态服务 `client/`（页面）+ `/assets` → `source/assets/` + `/api` 路由 |
| `event_db.js` | MySQL 连接池（`charityevents_db`）+ 查询封装 |

### 项目根
| 文件 | 说明 |
|---|---|
| `package.json` | dependencies: express ^4.18.2 / mysql2 ^3.6.0；`npm start` |
| `README.md` | 项目说明 |
| `.env.example` | 环境变量示例（PORT / DB_*） |

## 隔离约束

- 库名 `charityevents_db`，端口 3102，与 A / C / D 互不可见
- vendor 物理拷贝到 `source/client/vendor/`，禁止跨包 `path.resolve` 引用
- `fetch()` 只允许 `/api/` 开头

## 缺失资源 TODO

- [x] `logo.svg`、`favicon.svg/ico`、`og.jpg`、`empty-state.svg`、`admin-placeholder.svg`、`P-01`~`P-08`、`AC-01`~`AC-08`、`og.jpg` 已放入 `source/assets/`
- [x] `database/schema.sql` + `seed.sql`（8 活动 + 12 报名）
