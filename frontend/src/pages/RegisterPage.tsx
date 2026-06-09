import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/i18nStore';
import AuthLayout, { itemVariants } from '@/components/AuthLayout';
import api from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) { toast.error(t('register.fillEmail')); return; }
    try {
      await api.post('/auth/send-code', { email });
      toast.success(t('register.codeSent'));
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('register.sendFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !code) { toast.error(t('register.fillAll')); return; }
    if (password !== confirmPassword) { toast.error(t('register.passwordMismatch')); return; }
    if (password.length < 8) { toast.error(t('register.passwordTooShort')); return; }
    setLoading(true);
    try {
      await register(email, password, code);
      toast.success(t('register.success'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('register.failed'));
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name: string) => ({
    borderColor: focusField === name ? 'var(--accent)' : undefined,
    boxShadow: focusField === name ? '0 0 0 3px var(--accent-glow)' : undefined,
  });

  return (
    <AuthLayout title={t('register.title')} subtitle={t('register.subtitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            {t('register.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusField('email')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={fieldStyle('email')}
            placeholder="your@email.com"
            autoComplete="email"
          />
        </motion.div>

        {/* Verification code */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            {t('register.code')}
          </label>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onFocus={() => setFocusField('code')}
              onBlur={() => setFocusField(null)}
              maxLength={6}
              className="input-field flex-1"
              style={fieldStyle('code')}
              placeholder={t('register.codePlaceholder')}
              autoComplete="one-time-code"
            />
            <motion.button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="btn-ghost whitespace-nowrap text-[0.8rem] disabled:opacity-40 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.97 }}
            >
              {countdown > 0 ? `${countdown}s` : t('register.sendCode')}
            </motion.button>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            {t('register.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField('password')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={fieldStyle('password')}
            placeholder={t('register.passwordPlaceholder')}
            autoComplete="new-password"
          />
        </motion.div>

        {/* Confirm password */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            {t('register.confirmPassword')}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusField('confirm')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={fieldStyle('confirm')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            autoComplete="new-password"
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
            {loading ? t('register.registering') : t('register.submit')}
          </motion.button>
        </motion.div>

        {/* Login link */}
        <motion.div variants={itemVariants} className="pt-1">
          <p
            className="text-center text-[0.8rem]"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
          >
            {t('register.hasAccount')}{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              {t('register.login')}
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
