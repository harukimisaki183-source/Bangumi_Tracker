import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/i18nStore';
import AuthLayout, { itemVariants } from '@/components/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t('login.fillAll')); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('login.success'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('login.title')} subtitle={t('login.subtitle')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            {t('login.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusField('email')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={{
              borderColor: focusField === 'email' ? 'var(--accent)' : undefined,
              boxShadow: focusField === 'email' ? '0 0 0 3px var(--accent-glow)' : undefined,
            }}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-2">
            <label
              className="block text-[0.8rem] font-medium tracking-wide"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
            >
              {t('login.password')}
            </label>
            <Link
              to="/forgot-password"
              className="text-[0.75rem] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField('password')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={{
              borderColor: focusField === 'password' ? 'var(--accent)' : undefined,
              boxShadow: focusField === 'password' ? '0 0 0 3px var(--accent-glow)' : undefined,
            }}
            placeholder={t('login.passwordPlaceholder')}
            autoComplete="current-password"
          />
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-2">
          <motion.button
            type="submit"
            disabled={loading}
            className="btn-accent w-full py-3 text-[0.9rem] disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? t('login.loggingIn') : t('login.submit')}
          </motion.button>
        </motion.div>

        {/* Register link */}
        <motion.div variants={itemVariants} className="pt-1">
          <p
            className="text-center text-[0.8rem]"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
          >
            {t('login.noAccount')}{' '}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              {t('login.createAccount')}
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
