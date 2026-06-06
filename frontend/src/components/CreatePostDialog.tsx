import { useState, useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function CreatePostDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (post: any) => void }) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (images.length + files.length > 9) { alert("最多9张图片"); return; }
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post("/upload/file", formData);
        setImages((prev) => [...prev, data.data.key]);
        setImageUrls((prev) => [...prev, data.data.url]);
      } catch {}
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim()) { alert("请输入内容"); return; }
    setSending(true);
    try {
      const { data } = await api.post("/posts", { content, images });
      const post = data.data;
      post.image_urls = imageUrls;
      post._count = { comments: 0, likes: 0, favorites: 0 };
      post.isLiked = false;
      post.isFavorited = false;
      onCreated(post);
      onClose();
    } catch (err: any) { toast.error(err.response?.data?.message || "发布失败"); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">发布帖子</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5}
          className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="分享你的想法..." />
        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20">
                <img src={url} className="w-full h-full object-cover rounded" />
                <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <button onClick={() => fileRef.current?.click()} disabled={images.length >= 9 || uploading}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 disabled:opacity-50">
            <ImagePlus className="w-5 h-5" /> {uploading ? "上传中..." : "添加图片"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          <button onClick={handleSubmit} disabled={sending || !content.trim()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {sending ? "发布中..." : "发布"}
          </button>
        </div>
      </div>
    </div>
  );
}