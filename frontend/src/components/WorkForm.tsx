import { useState, useRef, useEffect } from "react";
import { Star, Upload, X } from "lucide-react";
import api from "@/lib/api";

interface WorkFormProps {
  initialData?: {
    name: string;
    type: string;
    subtype?: string;
    region?: string;
    rating: number;
    cover: string;
    cover_url: string;
    description: string;
    url: string;
    tags: string[];
  };
  onSubmit: (data: any) => Promise<void>;
  submitLabel: string;
  isEdit?: boolean;
}

const typeOptions = [
  { value: "movie", label: "电影" },
  { value: "series", label: "剧集" },
  { value: "anime", label: "动漫" },
];

const subtypeOptions: Record<string, { value: string; label: string }[]> = {
  movie: [
    { value: "original", label: "原创" },
    { value: "remake", label: "翻拍" },
    { value: "manga", label: "漫改" },
    { value: "novel", label: "小说改" },
    { value: "documentary", label: "纪实" },
  ],
  series: [
    { value: "original", label: "原创" },
    { value: "remake", label: "翻拍" },
    { value: "manga", label: "漫改" },
    { value: "novel", label: "小说改" },
  ],
  anime: [
    { value: "original", label: "原创" },
    { value: "manga", label: "漫改" },
    { value: "novel", label: "小说改" },
  ],
};

const regionOptions = [
  { value: "europe_us", label: "欧美" },
  { value: "japan_korea", label: "日韩" },
  { value: "china_mainland", label: "中国大陆" },
  { value: "china_hk_tw", label: "中国港台地区" },
];

export default function WorkForm({ initialData, onSubmit, submitLabel, isEdit }: WorkFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "anime");
  const [subtype, setSubtype] = useState(initialData?.subtype || "");
  const [region, setRegion] = useState(initialData?.region || "");
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [cover, setCover] = useState(initialData?.cover || "");
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [presetTags, setPresetTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/works/tags").then(({ data }) => {
      setPresetTags(data.data.map((t: any) => t.name));
    }).catch(() => {});
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload/file", formData);
      setCover(data.data.key);
      setCoverUrl(data.data.url);
    } catch { alert("上传失败"); } finally { setUploading(false); }
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { alert("请输入名称"); return; }
    if (rating < 1) { alert("请选择评分"); return; }
    if (!cover) { alert("请上传封面"); return; }
    if (!region) { alert("请选择地区"); return; }
    setLoading(true);
    try { await onSubmit({ name, type, subtype: subtype || undefined, region, rating, cover, description: isEdit ? initialData?.description || description : description, url, tags }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">封面截图 *</label>
        <div onClick={() => fileInputRef.current?.click()} className="w-48 h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden">
          {coverUrl ? <img src={coverUrl} alt="cover" className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><Upload className="w-8 h-8 mx-auto mb-2" /><p className="text-sm">点击上传封面</p></div>}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        {uploading && <p className="text-sm text-indigo-600 mt-1">上传中...</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="作品名称" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">类型 *</label>
        <div className="flex gap-3">
          {typeOptions.map((opt) => (<button key={opt.value} type="button" onClick={() => { setType(opt.value); setSubtype(""); }} className={"px-4 py-2 rounded-lg border text-sm font-medium transition-colors " + (type === opt.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-700 hover:border-indigo-400")}>{opt.label}</button>))}
        </div>
      </div>
      {subtypeOptions[type] && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">子类型</label>
          <div className="flex flex-wrap gap-2">
            {subtypeOptions[type].map((opt) => (<button key={opt.value} type="button" onClick={() => setSubtype(subtype === opt.value ? "" : opt.value)} className={"px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors " + (subtype === opt.value ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-white text-gray-600 hover:border-indigo-300")}>{opt.label}</button>))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">地区 *</label>
        <div className="flex flex-wrap gap-2">
          {regionOptions.map((opt) => (<button key={opt.value} type="button" onClick={() => setRegion(opt.value)} className={"px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors " + (region === opt.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 hover:border-indigo-300")}>{opt.label}</button>))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">评分 *</label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (<button key={i} type="button" onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(i + 1)}><Star className={"w-7 h-7 cursor-pointer transition-colors " + (i < (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-300")} /></button>))}
          {rating > 0 && <span className="ml-2 text-sm text-gray-500">{rating} 星</span>}
        </div>
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">简介</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="作品简介（选填）" />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">观看网址</label>
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (<span key={tag} className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">{tag}<X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} /></span>))}
        </div>
        <div className="flex gap-2">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }} className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="输入自定义标签，回车添加" />
        </div>
        {presetTags.length > 0 && (<div className="flex flex-wrap gap-1.5 mt-2">{presetTags.filter((t) => !tags.includes(t)).map((tag) => (<button key={tag} type="button" onClick={() => addTag(tag)} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-indigo-100 hover:text-indigo-700 transition-colors">+ {tag}</button>))}</div>)}
      </div>
      <button type="submit" disabled={loading || uploading} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">{loading ? "提交中..." : submitLabel}</button>
    </form>
  );
}