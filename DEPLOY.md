# Bangumi_Tracker 云服务器部署文档

## 服务器信息

| 项目 | 值 |
|------|-----|
| IP | 111.230.114.217 |
| 系统 | Ubuntu 20.04 |
| 项目路径 | ~/Bangumi_Tracker |
| 操作系统用户 | root |

## 架构概览

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   前端:80     │────▶│  后端:3000    │────▶│ MariaDB:3306 │
│  nginx 静态   │     │  NestJS API  │     │   数据库      │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
            ┌────────────┐   ┌────────────┐
            │ Redis:6379 │   │ MinIO:9000 │
            │   缓存/队列 │   │  文件存储   │
            └────────────┘   └────────────┘
```

## 已安装服务

### 1. Node.js
- 版本：v20.20.2
- 路径：/usr/bin/node

### 2. MariaDB
```bash
# 状态检查
sudo systemctl status mariadb

# 登录
mysql -u root -pbangumi2026

# 数据库
数据库名：bangumi_tracker
用户名：root
密码：bangumi2026
```

### 3. Redis
```bash
# 状态检查
sudo systemctl status redis

# 测试连接
redis-cli ping  # 返回 PONG
```

### 4. MinIO
```bash
# 状态检查
sudo systemctl status minio

# 访问地址
API：http://localhost:9000
控制台：http://111.230.114.217:9001
用户名：minioadmin
密码：bangumi-minio-2026
```

## 部署步骤

### 第一步：克隆代码

```bash
cd ~
git clone https://github.com/Misaki-121/Bangumi_Tracker.git
cd Bangumi_Tracker
```

### 第二步：配置环境变量

```bash
cat > .env << 'EOF'
DATABASE_URL="mysql://root:bangumi2026@localhost:3306/bangumi_tracker"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=bangumi-tracker-jwt-secret-2026-abc123
JWT_REFRESH_SECRET=bangumi-tracker-refresh-secret-2026-xyz789
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=3340602134@qq.com
SMTP_PASS=dtkndovvycimcjjd
SMTP_FROM=3340602134@qq.com
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=bangumi-minio-2026
MINIO_BUCKET=bangumi
MINIO_USE_SSL=false
MINIO_PUBLIC_ENDPOINT=111.230.114.217
CORS_ORIGIN=http://111.230.114.217
PORT=3000
EOF
```

### 第三步：部署后端

```bash
cd ~/Bangumi_Tracker/backend

# 安装依赖
npm install

# 执行数据库迁移
npx prisma migrate deploy

# 填充种子数据
npx prisma db seed

# 构建
npm run build
```

### 第四步：部署前端

```bash
cd ~/Bangumi_Tracker/frontend

# 安装依赖
npm install

# 构建
npm run build
```

### 第五步：配置 nginx

```bash
# 安装 nginx
sudo apt install -y nginx

# 创建配置
sudo tee /etc/nginx/sites-available/bangumi << 'EOF'
server {
    listen 80;
    server_name 111.230.114.217;

    # 前端静态文件
    root /root/Bangumi_Tracker/frontend/dist;
    index index.html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件大小限制
    client_max_body_size 50m;
}
EOF

# 启用配置
sudo ln -sf /etc/nginx/sites-available/bangumi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重启
sudo nginx -t
sudo systemctl restart nginx
```

### 第六步：使用 pm2 运行后端

```bash
# 安装 pm2
npm install -g pm2

# 启动后端
cd ~/Bangumi_Tracker/backend
pm2 start dist/main.js --name bangumi-backend

# 设置开机自启
pm2 startup
pm2 save
```

## 常用运维命令

### 服务管理

```bash
# 查看后端状态
pm2 status

# 查看后端日志
pm2 logs bangumi-backend

# 重启后端
pm2 restart bangumi-backend

# 重启 nginx
sudo systemctl restart nginx

# 重启 MariaDB
sudo systemctl restart mariadb

# 重启 Redis
sudo systemctl restart redis

# 重启 MinIO
sudo systemctl restart minio
```

### 更新部署

```bash
cd ~/Bangumi_Tracker
git pull

# 更新后端
cd backend
npm install
npx prisma migrate deploy
npm run build
pm2 restart bangumi-backend

# 更新前端
cd ../frontend
npm install
npm run build
# nginx 自动生效，无需重启
```

### 数据库操作

```bash
# 进入数据库
mysql -u root -pbangumi2026

# 选择数据库
USE bangumi_tracker;

# 查看表
SHOW TABLES;

# 备份
mysqldump -u root -pbangumi2026 bangumi_tracker > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u root -pbangumi2026 bangumi_tracker < backup_file.sql
```

### MinIO 操作

```
浏览器访问：http://111.230.114.217:9001
用户名：minioadmin
密码：bangumi-minio-2026
创建 Bucket：bangumi（设置为公开读取）
```

## 端口列表

| 端口 | 服务 | 用途 |
|------|------|------|
| 80 | nginx | 前端页面 |
| 3000 | NestJS | 后端 API |
| 3306 | MariaDB | 数据库 |
| 6379 | Redis | 缓存 |
| 9000 | MinIO API | 文件存储 |
| 9001 | MinIO Console | 存储管理界面 |

## 安全配置

### 防火墙

```bash
# 开放必要端口
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw allow 9001

# 如需远程数据库访问（不建议）
sudo ufw allow 3306
```

### MariaDB 远程访问（可选）

```bash
# 编辑配置
sudo vim /etc/mysql/mariadb.conf.d/50-server.cnf
# 将 bind-address 改为 0.0.0.0

# 重启
sudo systemctl restart mariadb
```

## 故障排查

### 后端无法启动

```bash
# 查看日志
pm2 logs bangumi-backend

# 常见问题
1. 数据库连接失败 → 检查 MariaDB 是否运行
2. 端口占用 → lsof -i :3000
3. 环境变量缺失 → 检查 .env 文件
```

### 前端白屏

```bash
# 检查构建产物
ls ~/Bangumi_Tracker/frontend/dist/

# 检查 nginx 配置
sudo nginx -t
sudo cat /etc/nginx/sites-enabled/bangumi

# 查看 nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 数据库问题

```bash
# 检查 MariaDB 状态
sudo systemctl status mariadb

# 查看错误日志
sudo tail -f /var/log/mysql/error.log

# 检查连接
mysql -u root -pbangumi2026 -e "SELECT 1;"
```

## 注意事项

1. **Docker Hub 在国内被墙**，本项目采用原生部署，不使用 Docker
2. **HTTPS**：当前使用 HTTP，如需 HTTPS 请配置 Let's Encrypt
3. **备份**：建议定期备份数据库和 MinIO 数据
4. **日志**：关注 pm2 和 nginx 日志，及时发现问题
5. **更新**：每次代码更新后需重新构建并重启服务
