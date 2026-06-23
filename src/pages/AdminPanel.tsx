import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { setUsers as setReportUsers, setCourses as setReportCourses } from '../lib/reportData';
import {
  Shield, BookOpen, Users, ClipboardCheck, Plus, Edit3, Trash2, Eye, EyeOff,
  Search,
  CheckCircle2, AlertCircle, X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  department: string;
  thumbnail_url: string | null;
  duration: string;
  status: string;
  created_at: string;
  lessons?: { count: number }[];
  enrollments?: { count: number }[];
}



interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  job_title: string;
  employee_id: string;
  created_at: string;
  role: string;
}

interface Assessment {
  id: string;
  title: string;
  course_id: string | null;
  time_limit: number;
  passing_score: number;
  created_at: string;
  courses?: { title: string } | null;
  questions?: { count: number }[];
}

const DEPARTMENTS = ['HR', 'IT', 'Finance', 'Sales', 'Operations', 'Management'];

export default function AdminPanel({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { isAdmin, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'assessments'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    password: '',
    employee_id: '',
    department: 'HR',
    job_title: '',
    role: 'employee' as 'employee' | 'admin',
  });

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin, activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    if (activeTab === 'courses') {
      const { data } = await supabase.from('courses').select('*, lessons(count), enrollments(count)').order('created_at', { ascending: false });
      setCourses(data || []);
      setReportCourses(data || []);
    } else if (activeTab === 'users') {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers(data || []);
      setReportUsers(data || []);
    } else if (activeTab === 'assessments') {
      const { data } = await supabase.from('assessments').select('*, courses(title), questions(count)').order('created_at', { ascending: false });
      setAssessments(data || []);
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all lessons.')) return;
    await supabase.from('lessons').delete().eq('course_id', id);
    await supabase.from('courses').delete().eq('id', id);
    fetchAll();
  };

  const handleToggleStatus = async (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    await supabase.from('courses').update({ status: newStatus }).eq('id', course.id);
    fetchAll();
  };

  const openEditCourse = (course: Course) => {
    onNavigate('course-builder', { editingCourseId: course.id });
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Delete this assessment and all its questions?')) return;
    await supabase.from('questions').delete().eq('assessment_id', id);
    await supabase.from('assessments').delete().eq('id', id);
    fetchAll();
  };

  // User handlers
  const resetUserForm = () => {
    setUserForm({
      full_name: '',
      email: '',
      password: '',
      employee_id: '',
      department: 'HR',
      job_title: '',
      role: 'employee',
    });
    setEditingUser(null);
  };

  const openEditUser = (user: Profile) => {
    setEditingUser(user);
    setUserForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      employee_id: user.employee_id,
      department: user.department,
      job_title: user.job_title,
      role: user.role as 'employee' | 'admin',
    });
    setShowUserForm(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.full_name || !userForm.email || (!editingUser && !userForm.password)) return;

    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;

    if (editingUser) {
      // Update existing user
      await supabase.from('profiles').update({
        full_name: userForm.full_name,
        employee_id: userForm.employee_id,
        department: userForm.department,
        job_title: userForm.job_title,
        role: userForm.role,
      }).eq('id', editingUser.id);

      if (userForm.password) {
        // Update password via edge function
        await fetch(`${supabaseUrl}/functions/v1/seed-users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: editingUser.email,
            password: userForm.password,
            updateOnly: true,
          }),
        });
      }
    } else {
      // Create new user via edge function
      const res = await fetch(`${supabaseUrl}/functions/v1/seed-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userForm.email,
          password: userForm.password,
          full_name: userForm.full_name,
          employee_id: userForm.employee_id,
          department: userForm.department,
          job_title: userForm.job_title,
          role: userForm.role,
          createNew: true,
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        alert('Failed to create user: ' + (result.error || 'Unknown error'));
        return;
      }
    }

    setShowUserForm(false);
    resetUserForm();
    fetchAll();
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.id === userId) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!confirm('Are you sure you want to remove this user?')) return;

    // Delete profile
    await supabase.from('profiles').delete().eq('id', userId);
    fetchAll();
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  const deptColors: Record<string, string> = {
    HR: 'bg-rose-50 text-rose-700',
    IT: 'bg-blue-50 text-blue-700',
    Finance: 'bg-emerald-50 text-emerald-700',
    Sales: 'bg-amber-50 text-amber-700',
    Operations: 'bg-slate-50 text-slate-700',
    Marketing: 'bg-purple-50 text-purple-700',
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Access Denied</h3>
          <p className="text-sm text-slate-500 mt-1">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" />
            Admin Panel
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage courses, users, and assessments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {([
            { id: 'courses', label: 'Course Management', icon: BookOpen },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'assessments', label: 'Assessment Management', icon: ClipboardCheck },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-primary-700' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Management */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <button
              onClick={() => onNavigate('course-builder')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900"
            >
              <Plus className="w-4 h-4" /> Add New Course
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Course Title</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Lessons</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Enrolled</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-primary-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800">{course.title}</p>
                            <p className="text-xs text-slate-400">{course.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${deptColors[course.department] || 'bg-slate-50 text-slate-700'}`}>
                          {course.department}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{course.lessons?.[0]?.count || 0}</td>
                      <td className="px-4 py-3 text-slate-600">{course.enrollments?.[0]?.count || 0}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(course)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                            course.status === 'published'
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {course.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditCourse(course)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate('course-detail', { courseId: course.id })}
                            className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                            title="Preview"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCourses.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No courses found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{users.length}</span> Users
            </p>
            <button
              onClick={() => { resetUserForm(); setShowUserForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Job Title</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs">
                          {u.full_name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${deptColors[u.department] || 'bg-slate-50 text-slate-700'}`}>
                        {u.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.job_title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {u.role === 'admin' ? 'Administrator' : 'Employee'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditUser(u)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">No users found</div>
            )}
          </div>
        </div>
      )}

      {/* Assessment Management */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">All Assessments</h3>
            <button
              onClick={() => onNavigate('assessments')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900"
            >
              <Plus className="w-4 h-4" /> Create Assessment
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Linked Course</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Questions</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Time Limit</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Created</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.title}</td>
                    <td className="px-4 py-3 text-slate-600">{a.courses?.title || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{a.questions?.[0]?.count || 0}</td>
                    <td className="px-4 py-3 text-slate-600">{a.time_limit} min</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteAssessment(a.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assessments.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">No assessments found</div>
            )}
          </div>
        </div>
      )}

      {/* Course Form Modal — removed, handled by CourseBuilder full page */}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => { setShowUserForm(false); resetUserForm(); }} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  placeholder="john@company.com"
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password {editingUser && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  placeholder="Min 8 characters"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={userForm.employee_id}
                    onChange={(e) => setUserForm({ ...userForm, employee_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <select
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={userForm.job_title}
                    onChange={(e) => setUserForm({ ...userForm, job_title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'employee' | 'admin' })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setShowUserForm(false); resetUserForm(); }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-5 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
