import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

// Stagger children: each child gets a delay based on index
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 26 },
  },
};

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background: subtle gradient mesh — not noisy, just atmospheric */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Floating accent orb — singular, restrained */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: '28rem',
          height: '28rem',
          background: 'var(--accent)',
          opacity: 0.08,
          top: '-8rem',
          right: '-6rem',
        }}
        animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary orb — bottom-left, cooler tone */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: '20rem',
          height: '20rem',
          background: 'var(--secondary)',
          opacity: 0.06,
          bottom: '-6rem',
          left: '-4rem',
        }}
        animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Main card — generous, breathing */}
      <motion.div
        className="w-full max-w-[26rem] relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        {/* Logo — anchored high, cinematic */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 200, damping: 22 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group"
          >
            <motion.div
              whileHover={{ rotate: 6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Film
                className="w-7 h-7 transition-colors"
                style={{ color: 'var(--accent)' }}
              />
            </motion.div>
            <span
              className="heading-section text-xl tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              追番记录站
            </span>
          </Link>
        </motion.div>

        {/* Form container — glass with accent bar */}
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: 'var(--radius-glass)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturation))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturation))',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {/* Accent gradient bar — top edge signature */}
          <div
            className="h-[2px] w-full"
            style={{ background: 'var(--accent-gradient)' }}
          />

          <div className="p-8 pt-7">
            {/* Title area */}
            <motion.div
              className="mb-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
            >
              <h1
                className="heading-display text-xl"
                style={{ color: 'var(--text-primary)', textWrap: 'balance' }}
              >
                {title}
              </h1>
              <p
                className="mt-1.5 text-[0.8rem] leading-relaxed"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
              >
                {subtitle}
              </p>
            </motion.div>

            {/* Form fields — staggered reveal */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {children}
            </motion.div>
          </div>
        </div>

        {/* Footer whisper */}
        <motion.p
          className="text-center mt-8 text-xs"
          style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © 2026 追番记录站
        </motion.p>
      </motion.div>
    </div>
  );
}

// Re-export itemVariants for child forms to use
export { itemVariants };
