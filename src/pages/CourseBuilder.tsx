import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BlockEditor, BlockPicker } from '../components/BlockEditor';
import { newBlock, type BlockBase, type BlockType } from '../lib/blocks';
import {
  ArrowLeft, Send, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  ArrowUp, ArrowDown, BookOpen, AlertCircle, Settings
} from 'lucide-react';

interface BuilderLesson {
  id?: string;
  title: string;
  type: string;
  video_url: string | null;
  duration: string;
  description: string;
  blocks: BlockBase[];
}

interface BuilderSection {
  name: string;
  lessons: BuilderLesson[];
}

interface CourseForm {
  title: string;
  description: string;
  department: string;
  thumbnail_url: string;
  duration: string;
  difficulty: string;
  instructor: string;
  tags: string;
  status: 'draft' | 'published';
  enrollment: 'open' | 'restricted';
  certificate: boolean;
  passing_score: number;
  prerequisite_course_id: string | null;
}

const DEPARTMENTS = ['Sales', 'HR', 'IT', 'Finance', 'Operations', 'Management'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const LESSON_TYPES = [
  { id: 'reading', label: 'Reading' },
  { id: 'video', label: 'Video' },
  { id: 'task', label: 'Task' },
];

export default function CourseBuilder({
  editingCourseId,
  onNavigate,
}: {
  editingCourseId?: string | null;
  onNavigate: (page: string, data?: any) => void;
}) {
  const { isAdmin } = useAuth();
  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '', description: '', department: 'Sales', thumbnail_url: '', duration: '',
    difficulty: 'Beginner', instructor: '', tags: '', status: 'draft',
    enrollment: 'open', certificate: true, passing_score: 70, prerequisite_course_id: null,
  });
  const [sections, setSections] = useState<BuilderSection[]>([
    { name: 'Introduction', lessons: [defaultLesson()] },
  ]);
  const [allCourses, setAllCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [activeBlockPicker, setActiveBlockPicker] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  function defaultLesson(): BuilderLesson {
    return { title: '', type: 'reading', video_url: null, duration: '', description: '', blocks: [newBlock('text')] };
  }

  useEffect(() => {
    if (!isAdmin) return;
    const init = async () => {
      const { data: courses } = await supabase.from('courses').select('id, title').order('title');
      setAllCourses(courses || []);

      if (editingCourseId) {
        const { data: course } = await supabase.from('courses').select('*').eq('id', editingCourseId).single();
        if (course) {
          setCourseForm({
            title: course.title || '',
            description: course.description || '',
            department: course.department || 'Sales',
            thumbnail_url: course.thumbnail_url || '',
            duration: course.duration || '',
            difficulty: course.difficulty || 'Beginner',
            instructor: course.instructor || '',
            tags: course.tags || '',
            status: course.status || 'draft',
            enrollment: course.enrollment || 'open',
            certificate: course.certificate ?? true,
            passing_score: course.passing_score ?? 70,
            prerequisite_course_id: course.prerequisite_course_id || null,
          });
        }
        const { data: lessons } = await supabase.from('lessons').select('*').eq('course_id', editingCourseId).order('order_index');
        if (lessons && lessons.length > 0) {
          const sectionMap: Record<string, BuilderLesson[]> = {};
          for (const l of lessons) {
            const secName = l.section || 'General';
            if (!sectionMap[secName]) sectionMap[secName] = [];
            const blocks = parseBlocks(l.video_url);
            sectionMap[secName].push({
              id: l.id,
              title: l.title,
              type: l.type,
              video_url: blocks.length > 0 ? null : l.video_url,
              duration: l.duration || '',
              description: '',
              blocks,
            });
          }
          const secs = Object.entries(sectionMap).map(([name, ls]) => ({ name, lessons: ls }));
          setSections(secs.length > 0 ? secs : [{ name: 'General', lessons: [defaultLesson()] }]);
        }
      }
      setLoading(false);
    };
    init();
  }, [isAdmin, editingCourseId]);

  // Parse blocks from video_url. If it's a JSON array, parse as blocks. Otherwise treat as legacy HTML.
  function parseBlocks(videoUrl: string | null): BlockBase[] {
    if (!videoUrl) return [newBlock('text')];
    const trimmed = videoUrl.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        if (Array.isArray(parsed) && parsed.length === 0) return [newBlock('text')];
      } catch {
        // Fall through to legacy HTML
      }
    }
    // Legacy HTML string → wrap in a single text block
    return [{ id: `block-legacy-${Date.now()}`, type: 'text' as BlockType, data: { html: trimmed } }];
  }

  const computeDuration = useCallback(() => {
    let total = 0;
    for (const s of sections) {
      for (const l of s.lessons) {
        if (l.duration) {
          const match = l.duration.match(/(\d+)/);
          if (match) {
            if (l.duration.toLowerCase().includes('h')) total += parseInt(match[1]) * 60;
            else total += parseInt(match[1]);
          }
        }
      }
    }
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [sections]);

  // ── Section / Lesson CRUD ──────────────────────────────────────────
  const addSection = () => setSections([...sections, { name: `Section ${sections.length + 1}`, lessons: [] }]);

  const updateSectionName = (idx: number, name: string) => {
    const updated = [...sections];
    updated[idx].name = name;
    setSections(updated);
  };

  const removeSection = (idx: number) => setSections(sections.filter((_, i) => i !== idx));

  const moveSection = (idx: number, dir: -1 | 1) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[ni]] = [updated[ni], updated[idx]];
    setSections(updated);
  };

  const addLesson = (sIdx: number) => {
    const updated = [...sections];
    updated[sIdx].lessons.push(defaultLesson());
    setSections(updated);
    const lessonFlatIdx = updated.slice(0, sIdx).reduce((acc, s) => acc + s.lessons.length, 0) + updated[sIdx].lessons.length - 1;
    setExpandedLessons(prev => new Set([...prev, lessonFlatIdx]));
  };

  const updateLesson = (sIdx: number, lIdx: number, field: string, value: any) => {
    const updated = [...sections];
    (updated[sIdx].lessons[lIdx] as any)[field] = value;
    setSections(updated);
  };

  const removeLesson = (sIdx: number, lIdx: number) => {
    const updated = [...sections];
    updated[sIdx].lessons = updated[sIdx].lessons.filter((_, i) => i !== lIdx);
    setSections(updated);
  };

  const moveLesson = (sIdx: number, lIdx: number, dir: -1 | 1) => {
    const ni = lIdx + dir;
    if (ni < 0 || ni >= sections[sIdx].lessons.length) return;
    const updated = [...sections];
    const ls = [...updated[sIdx].lessons];
    [ls[lIdx], ls[ni]] = [ls[ni], ls[lIdx]];
    updated[sIdx].lessons = ls;
    setSections(updated);
  };

  const toggleLessonExpand = (flatIdx: number) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(flatIdx)) next.delete(flatIdx);
      else next.add(flatIdx);
      return next;
    });
  };

  // ── Block CRUD within a lesson ─────────────────────────────────────
  const getLessonLocation = (flatIdx: number): [number, number] => {
    let count = 0;
    for (let s = 0; s < sections.length; s++) {
      for (let l = 0; l < sections[s].lessons.length; l++) {
        if (count === flatIdx) return [s, l];
        count++;
      }
    }
    return [0, 0];
  };

  const addBlockToLesson = (flatIdx: number, type: BlockType) => {
    const [s, l] = getLessonLocation(flatIdx);
    const blocks = [...sections[s].lessons[l].blocks, newBlock(type)];
    updateLesson(s, l, 'blocks', blocks);
  };

  const updateBlockData = (flatIdx: number, blockIdx: number, data: Record<string, any>) => {
    const [s, l] = getLessonLocation(flatIdx);
    const blocks = [...sections[s].lessons[l].blocks];
    blocks[blockIdx] = { ...blocks[blockIdx], data };
    updateLesson(s, l, 'blocks', blocks);
  };

  const deleteBlock = (flatIdx: number, blockIdx: number) => {
    const [s, l] = getLessonLocation(flatIdx);
    const blocks = sections[s].lessons[l].blocks.filter((_, i) => i !== blockIdx);
    updateLesson(s, l, 'blocks', blocks.length > 0 ? blocks : [newBlock('text')]);
  };

  const moveBlock = (flatIdx: number, blockIdx: number, dir: -1 | 1) => {
    const [s, l] = getLessonLocation(flatIdx);
    const ni = blockIdx + dir;
    if (ni < 0 || ni >= sections[s].lessons[l].blocks.length) return;
    const blocks = [...sections[s].lessons[l].blocks];
    [blocks[blockIdx], blocks[ni]] = [blocks[ni], blocks[blockIdx]];
    updateLesson(s, l, 'blocks', blocks);
  };

  // ── Save ────────────────────────────────────────────────────────────
  const handleSave = async (status: 'draft' | 'published') => {
    setSaveErr('');
    if (!courseForm.title.trim()) { setSaveErr('Please enter a course title.'); return; }
    setSaving(true);
    setSaveMsg('');

    const duration = computeDuration();
    let courseId = editingCourseId;

    const coursePayload: any = {
      title: courseForm.title,
      description: courseForm.description,
      department: courseForm.department,
      thumbnail_url: courseForm.thumbnail_url || null,
      duration,
      status,
    };

    try {
      if (editingCourseId) {
        const { error: updErr } = await supabase.from('courses').update({ ...coursePayload, status }).eq('id', editingCourseId);
        if (updErr) throw updErr;
        const { error: delErr } = await supabase.from('lessons').delete().eq('course_id', editingCourseId);
        if (delErr) throw delErr;
      } else {
        const { data, error: insErr } = await supabase.from('courses').insert(coursePayload).select().single();
        if (insErr) throw insErr;
        courseId = data?.id;
      }

      // A missing courseId here means the insert silently returned nothing —
      // surface it rather than reporting a false success.
      if (!courseId) throw new Error('Could not resolve the saved course. Please try again.');

      let orderIndex = 0;
      for (const section of sections) {
        for (const lesson of section.lessons) {
          if (!lesson.title.trim()) continue;
          // If blocks contain a single legacy text block, store the HTML directly as video_url
          let videoUrl: string | null = null;
          if (lesson.blocks.length === 1 && lesson.blocks[0].type === 'text' && lesson.blocks[0].data.legacy) {
            videoUrl = lesson.blocks[0].data.html;
          } else if (lesson.blocks.length > 0) {
            videoUrl = JSON.stringify(lesson.blocks);
          }
          const { error: lessonErr } = await supabase.from('lessons').insert({
            course_id: courseId,
            title: lesson.title,
            type: lesson.type,
            video_url: videoUrl,
            duration: lesson.duration || null,
            order_index: orderIndex++,
            section: section.name,
          });
          if (lessonErr) throw lessonErr;
        }
      }

      setSaving(false);
      setSaveMsg(status === 'published' ? 'Course published successfully!' : 'Draft saved successfully!');
      setTimeout(() => { setSaveMsg(''); onNavigate('admin'); }, 1500);
    } catch (err: any) {
      // Never report success on failure — show the real error and stay on the page.
      setSaving(false);
      setSaveErr(err?.message || 'Could not save the course. Please try again.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700">Access Denied</h3>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  let flatLessonIdx = -1;

  return (
    <div className="-m-4 md:-m-8 min-h-screen bg-slate-50">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => onNavigate('admin')}
            className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-lg font-bold text-slate-800 truncate">
            {courseForm.title || 'Untitled Course'}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {saveErr
            ? <span className="text-sm text-red-600 mr-2">{saveErr}</span>
            : saveMsg && <span className="text-sm text-green-600 mr-2 hidden sm:inline">{saveMsg}</span>}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-800 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Left column - 70% */}
        <div className="w-full lg:w-[70%] space-y-6">
          {/* Course Info Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" /> Course Information
            </h3>
            <div>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Course Title"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select
                  value={courseForm.difficulty}
                  onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={4}
                placeholder="Describe what students will learn..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="e.g. 4h 30m"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={courseForm.tags}
                  onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
                  placeholder="e.g. sales, onboarding, cloud — comma separated"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Curriculum Builder */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Curriculum Builder</h3>
              <button onClick={addSection} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium">
                <Plus className="w-4 h-4" /> Add Section
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((section, sIdx) => (
                <div key={sIdx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                    <input
                      type="text"
                      value={section.name}
                      onChange={(e) => updateSectionName(sIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button onClick={() => moveSection(sIdx, -1)} disabled={sIdx === 0} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30">
                      <ArrowUp className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={() => moveSection(sIdx, 1)} disabled={sIdx === sections.length - 1} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30">
                      <ArrowDown className="w-4 h-4 text-slate-500" />
                    </button>
                    {sections.length > 1 && (
                      <button onClick={() => removeSection(sIdx)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Lessons */}
                  <div className="space-y-2 ml-6">
                    {section.lessons.map((lesson, lIdx) => {
                      flatLessonIdx++;
                      const thisFlatIdx = flatLessonIdx;
                      const isExpanded = expandedLessons.has(thisFlatIdx);
                      return (
                        <div key={lIdx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                          {/* Lesson row */}
                          <div className="flex items-center gap-2 p-3">
                            <button onClick={() => toggleLessonExpand(thisFlatIdx)} className="p-1 hover:bg-slate-100 rounded flex-shrink-0">
                              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                            </button>
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(sIdx, lIdx, 'title', e.target.value)}
                              placeholder="Lesson title"
                              className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <select
                              value={lesson.type}
                              onChange={(e) => updateLesson(sIdx, lIdx, 'type', e.target.value)}
                              className="px-2 py-2 border border-slate-200 rounded text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                              {LESSON_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                            <input
                              type="text"
                              value={lesson.duration}
                              onChange={(e) => updateLesson(sIdx, lIdx, 'duration', e.target.value)}
                              placeholder="15 min"
                              className="w-20 px-2 py-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <button onClick={() => moveLesson(sIdx, lIdx, -1)} disabled={lIdx === 0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30">
                              <ArrowUp className="w-4 h-4 text-slate-500" />
                            </button>
                            <button onClick={() => moveLesson(sIdx, lIdx, 1)} disabled={lIdx === section.lessons.length - 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30">
                              <ArrowDown className="w-4 h-4 text-slate-500" />
                            </button>
                            <button onClick={() => removeLesson(sIdx, lIdx)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Lesson Content Editor (expandable) */}
                          {isExpanded && (
                            <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3">
                              {lesson.blocks.map((block, bIdx) => (
                                <BlockEditor
                                  key={block.id}
                                  block={block}
                                  onChange={(data) => updateBlockData(thisFlatIdx, bIdx, data)}
                                  onDelete={() => deleteBlock(thisFlatIdx, bIdx)}
                                  onMoveUp={() => moveBlock(thisFlatIdx, bIdx, -1)}
                                  onMoveDown={() => moveBlock(thisFlatIdx, bIdx, 1)}
                                  canMoveUp={bIdx > 0}
                                  canMoveDown={bIdx < lesson.blocks.length - 1}
                                />
                              ))}
                              <button
                                onClick={() => setActiveBlockPicker(thisFlatIdx)}
                                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium py-2"
                              >
                                <Plus className="w-4 h-4" /> Add Block
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => addLesson(sIdx)}
                      className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      <Plus className="w-4 h-4" /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - 30% Settings */}
        <div className="hidden lg:block w-[30%] flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" /> Course Settings
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={courseForm.status}
                onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Enrollment</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="radio" checked={courseForm.enrollment === 'open'} onChange={() => setCourseForm({ ...courseForm, enrollment: 'open' })} />
                  Open
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="radio" checked={courseForm.enrollment === 'restricted'} onChange={() => setCourseForm({ ...courseForm, enrollment: 'restricted' })} />
                  Restricted
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Certificate on completion</label>
              <button
                onClick={() => setCourseForm({ ...courseForm, certificate: !courseForm.certificate })}
                className={`relative w-11 h-6 rounded-full transition-colors ${courseForm.certificate ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${courseForm.certificate ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passing Score</label>
              <input
                type="number"
                value={courseForm.passing_score}
                onChange={(e) => setCourseForm({ ...courseForm, passing_score: parseInt(e.target.value) || 70 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prerequisite Course</label>
              <select
                value={courseForm.prerequisite_course_id || ''}
                onChange={(e) => setCourseForm({ ...courseForm, prerequisite_course_id: e.target.value || null })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                <option value="">None</option>
                {allCourses.filter(c => c.id !== editingCourseId).map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Total Duration</label>
              <input
                type="text"
                value={computeDuration()}
                readOnly
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Block Picker Modal */}
      {activeBlockPicker !== null && (
        <BlockPicker
          onInsert={(type) => addBlockToLesson(activeBlockPicker, type)}
          onClose={() => setActiveBlockPicker(null)}
        />
      )}
    </div>
  );
}
