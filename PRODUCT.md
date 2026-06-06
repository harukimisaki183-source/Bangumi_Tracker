# 追番记录站

## Purpose
个人向动漫/影视追番记录平台，用于记录观影体验、评分、详细分析，并支持社区交流。

## Target Users
动漫/影视爱好者，需要一个精致的个人观影数据库，而非传统的 Wiki 式信息站。

## Register
Product（设计服务产品，非品牌营销页）

## Brand Personality
- Playful Sophistication（活泼而精致）
- 打破传统 Wiki 站的沉闷感
- 物理感十足的交互，毛玻璃容器，非对称布局

## Anti-References
- MyAnimeList（信息密度高但视觉沉闷）
- 传统 Wiki 站（纯文字堆砌，缺乏设计感）
- 千篇一律的 SaaS Dashboard

## Tech Stack
- React 18 + TypeScript + Vite
- Framer Motion（动画引擎）
- Tailwind CSS v4（CSS 变量驱动主题）
- Zustand（状态管理）
- shadcn/ui 兼容组件

## Design System
- 4 主题矩阵：亮/暗 × 暖色(落日橘)/冷色(冰川蓝)
- CSS 变量驱动，data-mode + data-accent 属性切换
- 字体：Outfit (display) + DM Sans (body)
- Glassmorphism 容器 + 噪点纹理 + 渐变光球

## Key Surfaces
- `/` 首页 — 瀑布流卡片 + Hero 区
- `/works/:id` 详情页 — 六段式 Glassmorphism 容器
- `/community` 社区页
- `/login` `/register` 认证页
