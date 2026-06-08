export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'improvement';
}

export const CURRENT_VERSION = 'v1.1.1';

export const changelog: ChangelogEntry[] = [
  {
    id: 'v1.1.1',
    date: '2026-06-08',
    title: '社区帖子删除功能',
    description: '作者可以在社区主页直接删除自己发布的帖子，删除后帖子及所有评论、点赞、收藏将永久清除。',
    type: 'feature',
  },
  {
    id: 'v1.1.0',
    date: '2026-06-08',
    title: '设置中心与精美主题',
    description: '新增设置面板，支持语言切换（中/英）和主题管理。新增手账拼贴精美主题，修复消息红点不消失的问题。',
    type: 'feature',
  },
  {
    id: 'v1.0.5',
    date: '2026-06-07',
    title: '新增消息通知功能',
    description: '在导航栏添加消息图标，可查看站点更新日志和修复记录。',
    type: 'feature',
  },
  {
    id: 'v1.0.4',
    date: '2026-06-06',
    title: '修复头像显示问题',
    description: '修复用户头像 URL 持久化问题，评论区头像现在可以点击跳转。',
    type: 'fix',
  },
  {
    id: 'v1.0.3',
    date: '2026-06-05',
    title: '首页与个人主页优化',
    description: '首页仅展示自己的作品，个人主页支持查看其他用户的资料。',
    type: 'improvement',
  },
  {
    id: 'v1.0.2',
    date: '2026-06-04',
    title: '社区功能完善',
    description: '新增社区帖子发布、评论、点赞和收藏功能。',
    type: 'feature',
  },
  {
    id: 'v1.0.1',
    date: '2026-06-03',
    title: '作品管理功能',
    description: '支持创建、编辑和删除追番作品，包含评分和剧集记录。',
    type: 'feature',
  },
  {
    id: 'v1.0.0',
    date: '2026-06-01',
    title: '站点正式上线',
    description: '追番记录站正式上线，支持用户注册、登录和基础追番功能。',
    type: 'feature',
  },
];
