import { motion } from 'framer-motion';

const skeletonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 20,
      delay: i * 0.05,
    },
  }),
};

export default function WorkCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      className="masonry-item"
      variants={skeletonVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <div
        className="overflow-hidden"
        style={{
          borderRadius: 'var(--radius-card)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Cover shimmer */}
        <div
          className="animate-shimmer"
          style={{
            aspectRatio: '3/4',
          }}
        />

        {/* Body shimmer */}
        <div className="p-4 space-y-3">
          <div
            className="animate-shimmer h-4 rounded-full"
            style={{ width: '75%' }}
          />
          <div className="space-y-2">
            <div
              className="animate-shimmer h-3 rounded-full"
              style={{ width: '100%', animationDelay: '0.1s' }}
            />
            <div
              className="animate-shimmer h-3 rounded-full"
              style={{ width: '60%', animationDelay: '0.2s' }}
            />
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-shimmer w-3.5 h-3.5 rounded-sm"
                style={{ animationDelay: `${i * 0.05}s` }}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            {[0.3, 0.5, 0.25].map((w, i) => (
              <div
                key={i}
                className="animate-shimmer h-5 rounded-full"
                style={{ width: `${w * 100}%`, maxWidth: '4rem', animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
