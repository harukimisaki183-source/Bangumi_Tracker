import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'zh' | 'en';

interface I18nState {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      lang: 'zh',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'bangumi-lang' }
  )
);

/* ── Translation dictionaries ───────────────────────────────── */

const zh = {
  // Nav
  'nav.home': '首页',
  'nav.community': '社区',
  'nav.messages': '消息',
  'nav.profile': '个人中心',
  'nav.login': '登录',
  'nav.register': '注册',
  'nav.logout': '登出',
  'nav.siteName': '追番记录站',

  // Settings
  'settings.title': '设置',
  'settings.theme': '界面主题',
  'settings.theme.light': '浅色',
  'settings.theme.dark': '深色',
  'settings.theme.warm': '暖色调',
  'settings.theme.cool': '冷色调',
  'settings.theme.scrapbook': '手账拼贴',
  'settings.theme.premium': '精美主题',
  'settings.language': '语言',
  'settings.language.zh': '中文',
  'settings.language.en': 'English',

  // Notifications
  'notification.title': '更新日志',
  'notification.count': '共 {count} 条',
  'notification.feature': '新功能',
  'notification.fix': '修复',
  'notification.improvement': '优化',

  // Home
  'home.hero.title': '追番记录站',
  'home.hero.subtitle': '记录每一次心动的观影体验，发现属于你的作品宇宙',
  'home.tab.all': '全部',
  'home.tab.movie': '电影',
  'home.tab.series': '剧集',
  'home.tab.anime': '动漫',
  'home.search': '搜索作品...',
  'home.create': '创建作品',
  'home.empty.title': '还没有作品',
  'home.empty.subtitle': '创建你的第一个作品，开始记录观影旅程',
  'home.empty.cta': '去创建第一个作品 →',

  // Types
  'type.movie': '电影',
  'type.series': '剧集',
  'type.anime': '动漫',

  // Detail
  'detail.back': '返回',
  'detail.share': '分享',
  'detail.edit': '编辑详情',
  'detail.save': '保存',
  'detail.saving': '保存中...',
  'detail.cancel': '取消',
  'detail.delete': '删除',
  'detail.deleteConfirm': '删除作品',
  'detail.deleteWarning': '此操作不可撤销',
  'detail.deleteMessage': '删除后不可恢复，确认删除？',
  'detail.deleting': '删除中...',
  'detail.confirmDelete': '确认删除',
  'detail.section.basic': '基本信息',
  'detail.section.rating': '评分理由',
  'detail.section.synopsis': '内容简介',
  'detail.section.episodes': '单集介绍',
  'detail.section.production': '制作背景',
  'detail.section.related': '相关作品',
  'detail.creator': '创建者',

  // Form
  'form.workName': '作品名称',
  'form.cover': '封面截图',
  'form.create': '创建作品',

  // Footer
  'footer.copyright': '© 2026 追番记录站 — 记录你的每一次观影体验',

  // Common
  'common.linkCopied': '链接已复制到剪贴板',
  'common.notFound': '作品不存在',
  'common.saveSuccess': '保存成功',
  'common.saveFailed': '保存失败',
  'common.deleteSuccess': '作品已删除',
  'common.deleteFailed': '删除失败',
  'common.uploadFailed': '上传失败',
} as const;

const en: Record<keyof typeof zh, string> = {
  // Nav
  'nav.home': 'Home',
  'nav.community': 'Community',
  'nav.messages': 'Messages',
  'nav.profile': 'Profile',
  'nav.login': 'Login',
  'nav.register': 'Register',
  'nav.logout': 'Logout',
  'nav.siteName': 'Bangumi Tracker',

  // Settings
  'settings.title': 'Settings',
  'settings.theme': 'Theme',
  'settings.theme.light': 'Light',
  'settings.theme.dark': 'Dark',
  'settings.theme.warm': 'Warm',
  'settings.theme.cool': 'Cool',
  'settings.theme.scrapbook': 'Scrapbook',
  'settings.theme.premium': 'Premium Themes',
  'settings.language': 'Language',
  'settings.language.zh': '中文',
  'settings.language.en': 'English',

  // Notifications
  'notification.title': 'Changelog',
  'notification.count': '{count} entries',
  'notification.feature': 'Feature',
  'notification.fix': 'Fix',
  'notification.improvement': 'Improvement',

  // Home
  'home.hero.title': 'Bangumi Tracker',
  'home.hero.subtitle': 'Record every heart-racing viewing experience, discover your own universe of works',
  'home.tab.all': 'All',
  'home.tab.movie': 'Movie',
  'home.tab.series': 'Series',
  'home.tab.anime': 'Anime',
  'home.search': 'Search works...',
  'home.create': 'Create Work',
  'home.empty.title': 'No works yet',
  'home.empty.subtitle': 'Create your first work and start tracking your viewing journey',
  'home.empty.cta': 'Create your first work →',

  // Types
  'type.movie': 'Movie',
  'type.series': 'Series',
  'type.anime': 'Anime',

  // Detail
  'detail.back': 'Back',
  'detail.share': 'Share',
  'detail.edit': 'Edit Details',
  'detail.save': 'Save',
  'detail.saving': 'Saving...',
  'detail.cancel': 'Cancel',
  'detail.delete': 'Delete',
  'detail.deleteConfirm': 'Delete Work',
  'detail.deleteWarning': 'This action cannot be undone',
  'detail.deleteMessage': 'This will be permanently deleted. Are you sure?',
  'detail.deleting': 'Deleting...',
  'detail.confirmDelete': 'Confirm Delete',
  'detail.section.basic': 'Basic Info',
  'detail.section.rating': 'Rating Reason',
  'detail.section.synopsis': 'Synopsis',
  'detail.section.episodes': 'Episodes',
  'detail.section.production': 'Production',
  'detail.section.related': 'Related Works',
  'detail.creator': 'Creator',

  // Form
  'form.workName': 'Work Name',
  'form.cover': 'Cover Image',
  'form.create': 'Create Work',

  // Footer
  'footer.copyright': '© 2026 Bangumi Tracker — Record every viewing experience',

  // Common
  'common.linkCopied': 'Link copied to clipboard',
  'common.notFound': 'Work not found',
  'common.saveSuccess': 'Saved successfully',
  'common.saveFailed': 'Save failed',
  'common.deleteSuccess': 'Work deleted',
  'common.deleteFailed': 'Delete failed',
  'common.uploadFailed': 'Upload failed',
};

const dictionaries = { zh, en };

/* ── Translation hook ────────────────────────────────────────── */

export type TranslationKey = keyof typeof zh;

export function useTranslation() {
  const lang = useI18nStore((s) => s.lang);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = dictionaries[lang]?.[key] ?? dictionaries.zh[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return { t, lang };
}
