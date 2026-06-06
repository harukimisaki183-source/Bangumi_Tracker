import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '@/lib/api';
import WorkForm from '@/components/WorkForm';

export default function WorkCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      const { data: res } = await api.post('/works', data);
      toast.success('作品创建成功');
      navigate(`/works/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || '创建失败');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">创建新作品</h1>
      <WorkForm onSubmit={handleSubmit} submitLabel="创建作品" />
    </div>
  );
}
