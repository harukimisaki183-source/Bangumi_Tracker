# 追番记录站（Bangumi Tracker）

个人观影/追番记录与分享社区 — 记录你的每一次观影体验

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Zustand |
| 后端 | NestJS + TypeScript + Prisma ORM + JWT + Nodemailer |
| 数据库 | MySQL 8.0 + Redis |
| 存储 | MinIO（兼容 S3 协议） |
| 部署 | Docker Compose + Nginx |

## 快速开始

### 1. 克隆项目

```bash
git clone <repo-url>
cd Bangumi_Tracker
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入你的 SMTP、JWT 等配置
```

### 3. 启动服务

```bash
docker compose up -d
```

服务启动后：
- 前端：http://localhost
- 后端 API：http://localhost:3000/api
- MinIO 控制台：http://localhost:9001
- MySQL：localhost:3306
- Redis：localhost:6379

数据库会在首次启动时自动迁移和种子（预设标签：热血/战斗/日常/后宫/推理）。

## 本地开发

### 后端

```bash
cd backend
cp .env.example .env  # 填入本地数据库配置
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器运行在 http://localhost:5173，API 请求自动代理到 http://localhost:3000。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码 | `password` |
| `MYSQL_DATABASE` | 数据库名 | `bangumi_tracker` |
| `JWT_SECRET` | JWT 签名密钥 | 必填 |
| `JWT_REFRESH_SECRET` | Refresh Token 密钥 | 必填 |
| `SMTP_HOST` | SMTP 服务器 | `smtp.qq.com` |
| `SMTP_PORT` | SMTP 端口 | `465` |
| `SMTP_USER` | SMTP 用户名 | 必填 |
| `SMTP_PASS` | SMTP 授权码 | 必填 |
| `SMTP_FROM` | 发件人地址 | 必填 |
| `MINIO_ROOT_USER` | MinIO 用户名 | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | MinIO 密码 | `minioadmin` |
| `MINIO_BUCKET` | MinIO 存储桶 | `bangumi` |
| `CORS_ORIGIN` | 前端域名 | `http://localhost` |

## 项目结构

```
Bangumi_Tracker/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── src/
│   │   ├── auth/          # 鉴权（注册/登录/忘记密码/刷新Token）
│   │   ├── user/          # 用户（个人资料/我的帖子/我的番剧）
│   │   ├── work/          # 作品（CRUD/标签/搜索/详情页6段式）
│   │   ├── community/     # 社区（帖子/评论/点赞/收藏）
│   │   ├── upload/        # 文件上传（MinIO presigned URL）
│   │   ├── prisma/        # Prisma ORM
│   │   ├── redis/         # Redis
│   │   ├── health/        # 健康检查
│   │   └── common/        # 过滤器/拦截器
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── Dockerfile
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/         # 页面（首页/详情/社区/个人/认证）
    │   ├── components/    # 组件（WorkCard/PostCard/WorkForm/详情6段）
    │   ├── stores/        # Zustand 状态管理
    │   ├── lib/           # API客户端/工具函数
    │   └── layouts/       # 布局
    ├── Dockerfile
    ├── nginx.conf
    └── package.json
```

## API 端点（26个）

### 鉴权
- `POST /api/auth/send-code` — 发送验证码
- `POST /api/auth/register` — 注册
- `POST /api/auth/login` — 登录
- `POST /api/auth/refresh` — 刷新 Token
- `POST /api/auth/forgot-password` — 重置密码

### 作品
- `POST /api/works` — 创建作品
- `GET /api/works` — 作品列表（分页/筛选/排序）
- `GET /api/works/tags` — 获取标签
- `GET /api/works/search?q=xxx` — 搜索作品
- `GET /api/works/:id` — 作品详情
- `PATCH /api/works/:id` — 更新作品
- `DELETE /api/works/:id` — 删除作品

### 社区
- `POST /api/posts` — 发帖
- `GET /api/posts` — 帖子列表
- `GET /api/posts/:id` — 帖子详情+评论
- `DELETE /api/posts/:id` — 删帖
- `POST /api/posts/:id/comments` — 评论
- `POST /api/posts/:id/like` — 点赞 toggle
- `POST /api/posts/:id/favorite` — 收藏 toggle

### 用户
- `GET /api/users/me` — 个人资料
- `PATCH /api/users/me` — 更新资料
- `GET /api/users/me/posts` — 我的帖子
- `GET /api/users/me/works` — 我的番剧
- `GET /api/users/:id` — 公开资料

### 文件上传
- `GET /api/upload/presigned-url` — 获取上传签名 URL
- `GET /api/upload/file-url` — 获取文件公共 URL

### 健康检查
- `GET /api/health` — 服务状态

## License

MIT
