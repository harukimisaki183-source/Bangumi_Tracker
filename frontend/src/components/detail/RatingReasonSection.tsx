import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function RatingReasonSection({
  data,
  isEditing,
  onChange,
}: {
  data?: { rating: number; reason: string };
  isEditing: boolean;
  onChange: (d: { rating: number; reason: string }) => void;
}) {
  const [rating, setRating] = useState(data?.rating || 0);
  const [reason, setReason] = useState(data?.reason || '');
  const [hover, setHover] = useState(0);

  const updateRating = (r: number) => {
    setRating(r);
    onChange({ rating: r, reason });
  };
  const updateReason = (r: string) => {
    setReason(r);
    onChange({ rating, reason: r });
  };

  if (!isEditing && !reason) return null;

  return (
    <div>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.button
                key={i}
                type="button"
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => updateRating(i + 1)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Star
                  className="w-7 h-7 cursor-pointer transition-colors"
                  style={{
                    color: i < (hover || rating) ? 'var(--star-filled)' : 'var(--star-empty)',
                    fill: i < (hover || rating) ? 'var(--star-filled)' : 'none',
                  }}
                />
              </motion.button>
            ))}
            {(hover || rating) > 0 && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold ml-2"
                style={{ color: 'var(--star-filled)', fontFamily: 'var(--font-display)' }}
              >
                {hover || rating} 星
              </motion.span>
            )}
          </div>
          <textarea
            value={reason}
            onChange={(e) => updateReason(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm rounded-xl transition-all resize-none"
            style={{
              background: 'var(--bg-sunken)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            placeholder="写下你的评分理由..."
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Star
                  className="w-5 h-5"
                  style={{
                    color: i < rating ? 'var(--star-filled)' : 'var(--star-empty)',
                    fill: i < rating ? 'var(--star-filled)' : 'none',
                  }}
                />
              </motion.div>
            ))}
            <span
              className="text-sm font-bold ml-2"
              style={{ color: 'var(--star-filled)', fontFamily: 'var(--font-display)' }}
            >
              {rating} 星
            </span>
          </div>
          <p className="body-text text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {reason}
          </p>
        </div>
      )}
    </div>
  );
}
