import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassSectionProps {
  icon: ReactNode;
  title: string;
  index: number;
  children: ReactNode;
  accentVar?: string;
}

const sectionVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.97,
    filter: 'blur(6px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 220,
      damping: 26,
      mass: 0.9,
      delay: 0.08 + i * 0.08,
    },
  }),
};

export default function GlassSection({
  icon,
  title,
  index,
  children,
  accentVar,
}: GlassSectionProps) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      custom={index}
      className="glass-strong relative overflow-hidden"
      style={{
        borderRadius: 'var(--radius-glass)',
        padding: '1.75rem',
      }}
    >
      {/* Decorative gradient blob */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: accentVar || 'var(--accent)' }}
      />

      {/* Section header */}
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: accentVar ? `${accentVar}20` : 'var(--accent-soft)',
          }}
        >
          <span style={{ color: accentVar || 'var(--accent)' }}>{icon}</span>
        </div>
        <h2
          className="heading-section text-lg"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
      </div>

      {/* Section content */}
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}
