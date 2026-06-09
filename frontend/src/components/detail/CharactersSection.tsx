import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';

interface Character {
  name: string;
  image?: string;
  image_url?: string;
  description?: string;
}

export default function CharactersSection({
  data,
  isEditing,
  onChange,
}: {
  data?: Character[];
  isEditing: boolean;
  onChange: (d: Character[]) => void;
}) {
  const [characters, setCharacters] = useState<Character[]>(data || []);
  const [expanded, setExpanded] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (index: number, field: keyof Character, value: string) => {
    const next = [...characters];
    next[index] = { ...next[index], [field]: value };
    setCharacters(next);
    onChange(next);
  };

  const addCharacter = () => {
    const next = [...characters, { name: '', description: '' }];
    setCharacters(next);
    onChange(next);
  };

  const removeCharacter = (index: number) => {
    const next = characters.filter((_, i) => i !== index);
    setCharacters(next);
    onChange(next);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: res } = await api.post('/upload/file', formData);
      const next = [...characters];
      next[index] = { ...next[index], image: res.data.key, image_url: res.data.url };
      setCharacters(next);
      onChange(next);
    } catch {} finally { setUploading(null); }
  };

  if (!isEditing && characters.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? '收起' : '展开'} ({characters.length})
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {isEditing ? (
              <div className="space-y-4">
                {characters.map((char, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}>
                    <div
                      className="w-14 h-14 rounded-lg shrink-0 overflow-hidden cursor-pointer flex items-center justify-center"
                      style={{ background: 'var(--bg-muted)', border: '1.5px dashed var(--border)' }}
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      {char.image_url ? (
                        <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </div>
                    <input
                      ref={(el) => { fileInputRefs.current[index] = el; }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e)}
                      className="hidden"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        value={char.name}
                        onChange={(e) => update(index, 'name', e.target.value)}
                        placeholder="角色名"
                        className="w-full px-2 py-1 text-sm rounded-lg"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <textarea
                        value={char.description || ''}
                        onChange={(e) => update(index, 'description', e.target.value)}
                        placeholder="角色设定与介绍"
                        rows={2}
                        className="w-full px-2 py-1 text-xs rounded-lg resize-none"
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>
                    <button onClick={() => removeCharacter(index)} className="self-start p-1" style={{ color: 'var(--error)' }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCharacter}
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
                >
                  <Plus className="w-3.5 h-3.5" /> 添加角色
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {characters.map((char, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg-sunken)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-12 h-12 rounded-lg shrink-0 overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                      {char.image_url ? (
                        <img src={char.image_url} alt={char.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        {char.name}
                      </p>
                      {char.description && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                          {char.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
