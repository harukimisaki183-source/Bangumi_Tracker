import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Camera, Save, LogOut, Film, FileText, KeyRound, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import WorkCard from "@/components/WorkCard";

type Tab = "posts" | "works";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const { user, logout, fetchMe } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("works");
  const [posts, setPosts] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [form, setForm] = useState({ nickname: "", gender: "", age: "", privacy_age: false, privacy_gender: false });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const isOwnProfile = !urlId || (user && String(user.id) === urlId);
  const profileId = urlId || user?.id;

  useEffect(() => {
    if (isOwnProfile) {
      api.get("/users/me").then(({ data }) => {
        const p = data.data;
        setProfile(p);
        setForm({ nickname: p.nickname || "", gender: p.gender || "", age: p.age?.toString() || "", privacy_age: p.privacy_age, privacy_gender: p.privacy_gender });
        setLoading(false);
      }).catch(() => { navigate("/login"); });
    } else {
      api.get(`/users/${urlId}`).then(({ data }) => {
        setProfile(data.data);
        setLoading(false);
      }).catch(() => { toast.error("用户不存在"); navigate("/"); });
    }
  }, [urlId, navigate, isOwnProfile]);

  useEffect(() => {
    if (!profileId) return;
    if (isOwnProfile) {
      if (tab === "posts") api.get("/users/me/posts").then(({ data }) => setPosts(data.data.posts)).catch(() => {});
      else api.get("/users/me/works").then(({ data }) => setWorks(data.data.works)).catch(() => {});
    } else {
      if (tab === "posts") api.get(`/users/${profileId}/posts`).then(({ data }) => setPosts(data.data.posts)).catch(() => {});
      else api.get(`/users/${profileId}/works`).then(({ data }) => setWorks(data.data.works)).catch(() => {});
    }
  }, [tab, profileId, isOwnProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload/file", formData);
      await api.patch("/users/me", { avatar: data.data.key });
      setProfile((p: any) => ({ ...p, avatar: data.data.url }));
      toast.success("头像更新成功");
      fetchMe();
    } catch { toast.error("上传失败"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = { nickname: form.nickname, privacy_age: form.privacy_age, privacy_gender: form.privacy_gender };
      if (form.gender) payload.gender = form.gender;
      if (form.age) payload.age = +form.age;
      const { data } = await api.patch("/users/me", payload);
      setProfile(data.data);
      setEditing(false);
      toast.success("资料更新成功");
      fetchMe();
    } catch (err: any) { toast.error(err.response?.data?.message || "更新失败"); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("请填写所有必填项");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("新密码至少需要8个字符");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("两次新密码不一致");
      return;
    }
    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("密码修改成功");
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "密码修改失败");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>;
  if (!profile) return null;

  const tabClass = (t: Tab) => "flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-colors " + (tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {!isOwnProfile && (
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-4">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
        )}
        <div className="bg-white border rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold overflow-hidden">
                {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : (profile.nickname?.[0] || "?")}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700">
                  <Camera className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-16 text-sm text-gray-500">昵称</label>
                    <input value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="flex-1 px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-16 text-sm text-gray-500">性别</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="flex-1 px-3 py-1.5 border rounded-lg text-sm">
                      <option value="">不设置</option><option value="male">男</option><option value="female">女</option><option value="other">其他</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-400"><input type="checkbox" checked={form.privacy_gender} onChange={(e) => setForm({ ...form, privacy_gender: e.target.checked })} /> 隐藏</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-16 text-sm text-gray-500">年龄</label>
                    <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="flex-1 px-3 py-1.5 border rounded-lg text-sm" min="1" max="150" />
                    <label className="flex items-center gap-1 text-xs text-gray-400"><input type="checkbox" checked={form.privacy_age} onChange={(e) => setForm({ ...form, privacy_age: e.target.checked })} /> 隐藏</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? "保存中..." : "保存"}
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-1.5 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold">{profile.nickname || "未设置昵称"}</h1>
                  {isOwnProfile && <p className="text-sm text-gray-500 mt-1">{profile.email}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                    {profile.gender && <span>{profile.gender === "male" ? "男" : profile.gender === "female" ? "女" : "其他"}</span>}
                    {profile.age && <span>{profile.age}岁</span>}
                    <span>加入于 {new Date(profile.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                  {isOwnProfile && (
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setEditing(true)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">编辑资料</button>
                      <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="flex items-center gap-1 px-4 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
                        <KeyRound className="w-4 h-4" /> 修改密码
                      </button>
                      <button onClick={handleLogout} className="flex items-center gap-1 px-4 py-1.5 border border-red-200 text-red-500 rounded-lg text-sm hover:bg-red-50"><LogOut className="w-4 h-4" /> 登出</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isOwnProfile && showPasswordForm && !editing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">修改密码</h3>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">原密码</label>
                  <input type="password" value={passwordForm.oldPassword} onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="请输入原密码" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">新密码</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="至少8个字符" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">确认新密码</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="再次输入新密码" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} disabled={changingPassword} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                    <KeyRound className="w-4 h-4" /> {changingPassword ? "修改中..." : "确认修改"}
                  </button>
                  <button onClick={() => { setShowPasswordForm(false); setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">取消</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button onClick={() => setTab("works")} className={tabClass("works")}><Film className="w-4 h-4" /> {isOwnProfile ? "我的番剧" : "TA的作品"}</button>
          <button onClick={() => setTab("posts")} className={tabClass("posts")}><FileText className="w-4 h-4" /> {isOwnProfile ? "我的帖子" : "TA的帖子"}</button>
        </div>

        {tab === "works" ? (
          works.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {works.map((w: any) => <WorkCard key={w.id} work={w} />)}
            </div>
          ) : <div className="text-center py-16 text-gray-400">{isOwnProfile ? "还没有作品，" : "还没有作品"}{isOwnProfile && <Link to="/works/create" className="text-indigo-600 hover:underline">去创建</Link>}</div>
        ) : (
          posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((p: any) => (
                <Link key={p.id} to={"/posts/" + p.id} className="block bg-white border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <p className="text-gray-800 line-clamp-2">{p.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{p._count.likes} 赞</span><span>{p._count.comments} 评论</span>
                    <span>{new Date(p.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="text-center py-16 text-gray-400">{isOwnProfile ? "还没有帖子，" : "还没有帖子"}{isOwnProfile && <Link to="/community" className="text-indigo-600 hover:underline">去发布</Link>}</div>
        )}
      </motion.div>
    </div>
  );
}