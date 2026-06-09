import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import WorkForm from '@/components/WorkForm';

export default function WorkEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/works/${id}`).then(({ data }) => {
      setWork(data.data);
      setLoading(false);
    }).catch(() => {
      toast.error('作品不存在');
      navigate('/');
    });
  }, [id, navigate]);

  const handleSubmit = async (data: any) => {
    try {
      await api.patch(`/works/${id}`, data);
      toast.success('更新成功');
      navigate(`/works/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '更新失败');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!work) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">编辑作品</h1>
      <WorkForm
        initialData={{
          name: work.name,
          type: work.type,
          rating: work.rating,
          cover: work.cover,
          cover_url: work.cover_url,
          description: work.description || '',
          url: work.url || '',
          tags: work.tags.map((t: any) => t.name),
        }}
        onSubmit={handleSubmit}
        submitLabel="保存修改"
        isEdit={true}
      />
    </div>
  );
}
