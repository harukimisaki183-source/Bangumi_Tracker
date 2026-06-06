import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface BasicInfo {
  director?: string;
  studio?: string;
  airDate?: string;
  episodes?: string;
  status?: string;
  actors?: string;
  characters?: string;
  [key: string]: string | undefined;
}

const fieldLabels: Record<string, string> = {
  director: '导演',
  studio: '制作公司',
  airDate: '首播日期',
  episodes: '集数',
  status: '状态',
  actors: '演员',
  characters: '主要角色',
};

export default function BasicInfoSection({
  data,
  isEditing,
  onChange,
}: {
  data?: BasicInfo;
  isEditing: boolean;
  onChange: (d: BasicInfo) => void;
}) {
  const [info, setInfo] = useState<BasicInfo>(data || {});
  const [customKey, setCustomKey] = useState('');

  const update = (k: string, v: string) => {
    const next = { ...info, [k]: v };
    setInfo(next);
    onChange(next);
  };

  const removeField = (k: string) => {
    const next = { ...info };
    delete next[k];
    setInfo(next);
    onChange(next);
  };

  if (!isEditing && Object.values(info).every((v) => !v)) return null;

  return (
    <div>
      {isEditing ? (
        <div className="space-y-3">
          {Object.entries(fieldLabels).map(([k, label]) => (
            <div key={k} className="flex items-center gap-3">
              <label
                className="w-24 text-sm text-right shrink-0"
                style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}
              >
                {label}
              </label>
              <input
                value={info[k] || ''}
                onChange={(e) => update(k, e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-xl transition-all"
                style={{
                  background: 'var(--bg-sunken)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)',
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
              />
            </div>
          ))}
          {Object.entries(info)
            .filter(([k]) => !fieldLabels[k])
            .map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <label
                  className="w-24 text-sm text-right shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {k}
                </label>
                <input
                  value={v || ''}
                  onChange={(e) => update(k, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl"
                  style={{
                    background: 'var(--bg-sunken)',
                    border: '1.5px solid var(--border)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <motion.button
                  onClick={() => removeField(k)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ color: 'var(--error)' }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          <div className="flex items-center gap-3">
            <input
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="字段名"
              className="w-24 px-2 py-2 text-sm rounded-xl"
              style={{
                background: 'var(--bg-sunken)',
                border: '1.5px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <motion.button
              onClick={() => {
                if (customKey) {
                  update(customKey, '');
                  setCustomKey('');
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
            >
              <Plus className="w-3.5 h-3.5" />
              添加字段
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {Object.entries(info)
            .filter(([_, v]) => v)
            .map(([k, v], i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-baseline gap-2 py-1.5"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span
                  className="text-xs font-medium shrink-0"
                  style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}
                >
                  {fieldLabels[k] || k}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {v}
                </span>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}
