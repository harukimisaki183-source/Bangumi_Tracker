import { useState } from 'react';

export default function SynopsisSection({
  data,
  isEditing,
  onChange,
}: {
  data?: string;
  isEditing: boolean;
  onChange: (d: string) => void;
}) {
  const [text, setText] = useState(data || '');

  if (!isEditing && !text) return null;

  return (
    <div>
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(e.target.value);
          }}
          rows={6}
          className="w-full px-4 py-3 text-sm rounded-xl transition-all resize-none"
          style={{
            background: 'var(--bg-sunken)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.7,
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
          placeholder="作品简介..."
        />
      ) : (
        <p
          className="body-text text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
