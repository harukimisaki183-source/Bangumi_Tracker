import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
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

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) { toast.error('请先填写邮箱'); return; }
    try {
      await api.post('/auth/send-code', { email });
      toast.success('验证码已发送');
      setCountdown(60);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '发送失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !code) { toast.error('请填写所有必填项'); return; }
    if (password !== confirmPassword) { toast.error('两次密码不一致'); return; }
    if (password.length < 8) { toast.error('密码至少需要8个字符'); return; }
    setLoading(true);
    try {
      await register(email, password, code);
      toast.success('注册成功');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (name: string) => ({
    borderColor: focusField === name ? 'var(--accent)' : undefined,
    boxShadow: focusField === name ? '0 0 0 3px var(--accent-glow)' : undefined,
  });

  return (
    <AuthLayout title="创建账号" subtitle="开始记录你的观影旅程">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            邮箱
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
            验证码
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
              placeholder="6位验证码"
              autoComplete="one-time-code"
            />
            <motion.button
              type="button"
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="btn-ghost whitespace-nowrap text-[0.8rem] disabled:opacity-40 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.97 }}
            >
              {countdown > 0 ? `${countdown}s` : '发送'}
            </motion.button>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusField('password')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={fieldStyle('password')}
            placeholder="至少8个字符"
            autoComplete="new-password"
          />
        </motion.div>

        {/* Confirm password */}
        <motion.div variants={itemVariants}>
          <label
            className="block text-[0.8rem] font-medium mb-2 tracking-wide"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            确认密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusField('confirm')}
            onBlur={() => setFocusField(null)}
            className="input-field w-full"
            style={fieldStyle('confirm')}
            placeholder="再次输入密码"
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
            {loading ? '注册中...' : '创建账号'}
          </motion.button>
        </motion.div>

        {/* Login link */}
        <motion.div variants={itemVariants} className="pt-1">
          <p
            className="text-center text-[0.8rem]"
            style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
          >
            已有账号？{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              登录
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  );
}
