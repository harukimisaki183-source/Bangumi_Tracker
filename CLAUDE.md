# Bangumi_Tracker 项目开发指南

> 本文件是项目的完整技术参考，用于快速了解项目结构和开发规范，避免每次都要通读所有源码。

## 项目概览

追番记录站 — 一个用于记录观影体验的全栈 Web 应用。用户可以创建作品、评分、写剧集笔记、在社区发帖互动。

**当前版本：v1.2.0**

## 技术栈

| 层 | 技术 |
|---|------|
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS v4 + CSS 自定义属性（主题系统） |
| 状态管理 | Zustand（带 persist 中间件） |
| 路由 | react-router-dom v7 |
| 动画 | framer-motion |
| 图标 | lucide-react |
| 提示 | sonner |
| 后端框架 | NestJS |
| 数据库 | MariaDB + Prisma ORM |
| 缓存 | Redis |
| 文件存储 | MinIO |
| 部署 | Nginx + PM2，服务器 111.230.114.217 |

## 目录结构

前端组件按功能分布在 src/components、src/pages、src/layouts、src/stores、src/data、src/lib 目录下。后端按模块分布在 src/auth、src/user、src/work、src/community、src/upload、src/prisma、src/redis、src/health 目录下。

## 前端架构

### 路由结构（App.tsx）

页面路由定义在 App.tsx 中，使用 react-router-dom v7。需要登录的页面包裹在 ProtectedRoute 组件内。布局由 MainLayout 统一管理导航栏和页脚。

### 状态管理（Zustand Stores）

五个 Zustand Store 分别管理认证、主题、国际化、作品和社区数据。其中 authStore、themeStore、i18nStore 使用 persist 中间件持久化到 localStorage。

### 主题系统

主题通过 html 标签的 data-mode 和 data-accent 属性控制。data-mode 支持 light 和 dark，data-accent 支持 warm、cool 和 scrapbook 三种色调。

CSS 变量定义在 frontend/src/index.css 中，每种组合约 40 个自定义属性，涵盖表面、文字、强调色、边框、玻璃效果、卡片、导航、语义色等。

组件推荐使用 style={{ color: var(--text-primary) }} 内联 CSS 变量的方式设置颜色，确保主题切换时自动适配。

添加新主题需要：在 index.css 添加变量集，在 themeStore.ts 扩展 AccentScheme 类型，在 applyTheme 的 colors 映射中添加条目，在 index.html 的 FOUC 脚本中添加白名单，在 SettingsDialog.tsx 添加选项。

### i18n 国际化系统

i18nStore.ts 提供 useTranslation() hook，返回 t(key, params?) 翻译函数。中文为默认语言，英文为第二语言。添加翻译需在 zh 和 en 两个字典中同步添加键值。

### 组件约定

动画使用 framer-motion，图标统一用 lucide-react，标题字体用 Outfit（--font-display），正文字体用 DM Sans（--font-body）。

## 后端架构

### API 端点

认证模块（/api/auth）：发送验证码、注册、登录、刷新 token、重置密码、修改密码。

用户模块（/api/users）：获取和更新个人信息。

作品模块（/api/works）：作品 CRUD，支持类型/搜索/作者筛选和游标分页，详情内容存储为 JSON。

社区模块（/api/posts）：帖子 CRUD、评论、点赞、收藏。删除帖子会级联删除所有评论、点赞和收藏。

文件模块（/api/upload）：上传文件到 MinIO，获取公开 URL。

### 数据库模型（Prisma）

User、Work、Post、Comment、Like、Favorite 六个模型。Comment、Like、Favorite 与 Post 设置了 onDelete: Cascade，删除帖子时自动清理关联数据。

### 认证机制

JWT 双 token 模式：短期 accessToken + 长期 refreshToken。前端 axios 拦截器自动附加 token，401 时自动刷新。

## 版本管理

版本号在三个地方同步：frontend/package.json、frontend/src/data/changelog.ts（CURRENT_VERSION 常量）、DEPLOY.md 头部。NotificationBell 组件自动读取 CURRENT_VERSION，无需手动更新。

发布步骤：更新 changelog.ts 条目和 CURRENT_VERSION → 更新 package.json → 更新 DEPLOY.md。

## 部署

服务器 111.230.114.217，用户 root。前端更新：git pull → npm run build → sudo cp -r dist/* /var/www/bangumi/。后端更新：git pull → tsc → pm2 restart bangumi-backend。

## 常见开发任务

添加新页面：在 pages/ 创建组件 → App.tsx 添加路由 → 需要登录则放 ProtectedRoute 内。

添加新组件：在 components/ 创建 → 使用 CSS 变量确保主题兼容 → framer-motion 添加动画。

添加新 API：后端在对应 module 添加 controller + service → 前端用 lib/api.ts 的 axios 调用。

修改主题样式：在 index.css 的属性选择器块中修改变量，每个 accent 需要 light + dark 两套。
