import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../lib/api';
import { User, Building2, Briefcase, Mail, IdCard, Calendar, Camera, Save } from 'lucide-react';

const DEPARTMENTS = ['HR', 'IT', 'Finance', 'Sales', 'Operations', 'Marketing'];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    employee_id: user?.employee_id || '',
    department: user?.department || '',
    job_title: user?.job_title || '',
  });

  const mutation = useMutation({
    mutationFn: () => updateProfile(user!.id, form),
    onSuccess: async () => {
      await refreshUser();
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (err: any) => setError(err.message || 'Failed to update profile'),
  });

  const handleSave = () => {
    if (!user) return;
    setError('');
    setMessage('');
    mutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your profile and preferences</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <Save className="w-4 h-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
              {form.full_name?.charAt(0) || user?.full_name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center hover:bg-slate-50">
              <Camera className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{form.full_name || user?.full_name}</h3>
            <p className="text-sm text-slate-500">{form.job_title || user?.job_title} &middot; {form.department || user?.department}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.onboarding_batch}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="Your full name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="EMP-001"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-white appearance-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                placeholder="Software Engineer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Onboarding Batch</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                defaultValue={user?.onboarding_batch || ''}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Assigned by system</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="px-6 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
