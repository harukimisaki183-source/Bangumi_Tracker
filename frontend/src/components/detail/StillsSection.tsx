import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Upload } from 'lucide-react';
import api from '@/lib/api';

interface Still {
  key: string;
  url: string;
}

export default function StillsSection({
  data,
  isEditing,
  onChange,
}: {
  data?: Still[];
  isEditing: boolean;
  onChange: (d: Still[]) => void;
}) {
  const [stills, setStills] = useState<Still[]>(data || []);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: res } = await api.post('/upload/file', formData);
      const next = [...stills, { key: res.data.key, url: res.data.url }];
      setStills(next);
      onChange(next);
    } catch {} finally { setUploading(false); }
  };

  const removeStill = (index: number) => {
    const next = stills.filter((_, i) => i !== index);
    setStills(next);
    onChange(next);
  };

  if (!isEditing && stills.length === 0) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {stills.map((still, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative group"
          >
            <div className="w-32 h-20 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <img src={still.url} alt={`剧照 ${i + 1}`} className="w-full h-full object-cover" />
            </div>
            {isEditing && (
              <button
                onClick={() => removeStill(i)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'var(--error)', color: 'white' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        ))}
        {isEditing && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
            style={{ background: 'var(--bg-sunken)', border: '1.5px dashed var(--border)' }}
          >
            <Upload className="w-5 h-5 mb-1" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {uploading ? '上传中...' : '添加剧照'}
            </span>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}
