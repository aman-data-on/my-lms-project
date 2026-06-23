import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  ClipboardCheck, Clock, Trophy, Plus, X, ChevronDown, ChevronUp,
  GripVertical, Trash2, Save, Play, CheckCircle2, XCircle,
  ArrowRight, Timer, Lock, BookOpen, ChevronLeft, BarChart3
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface Assessment {
  id: string;
  title: string;
  course_id: string | null;
  time_limit: number;
  passing_score: number;
  courses?: { title: string; department: string; thumbnail_url: string | null } | null;
}

interface Question {
  id: string;
  assessment_id: string;
  type: string;
  question_text: string;
  options: any;
  correct_answer: string | null;
  matching_pairs: any;
  manual_grading: boolean;
  order_index: number;
}

interface Attempt {
  id: string;
  assessment_id: string;
  score: number | null;
  status: string;
  started_at: string;
}

interface CourseGroup {
  course_id: string;
  course_title: string;
  department: string;
  thumbnail_url: string | null;
  assessments: Assessment[];
}

const QUESTION_TYPES = [
  { id: 'multiple_choice', label: 'Multiple Choice' },
  { id: 'true_false', label: 'True or False' },
  { id: 'fill_blank', label: 'Fill in the Blank' },
  { id: 'matching', label: 'Matching' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'long_answer', label: 'Long Answer / Essay' },
];

const SALES_COURSE_ID = 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4';

const SALES_ASSESSMENT_ORDER = [
  'Phase 1 Assessment — Company & Products',
  'Phase 2 Assessment — Customers & Market',
  'Phase 3 Assessment — Competitive Positioning',
  'Phase 4 Assessment — Sales Skills',
  'Scenario-Based Final Assessment',
];

// ─── Component ──────────────────────────────────────────────────────
export default function Assessments({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { user, isAdmin } = useAuth();

  // View state: 'courses' | 'list' | 'take' | 'result' | 'builder'
  const [view, setView] = useState<'courses' | 'list' | 'take' | 'result' | 'builder'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<CourseGroup | null>(null);

  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [assessmentInfo, setAssessmentInfo] = useState({ title: '', course_id: '', time_limit: 30, passing_score: 70 });
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuestionTypeMenu, setShowQuestionTypeMenu] = useState(false);
  const [allCourses, setAllCourses] = useState<{ id: string; title: string }[]>([]);

  // Taking assessment state
  const [takingAssessment, setTakingAssessment] = useState<Assessment | null>(null);
  const [takingQuestions, setTakingQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!takingAssessment || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [takingAssessment, submitted]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: aData } = await supabase.from('assessments').select('*, courses(title, department, thumbnail_url)').order('created_at', { ascending: false });
    const { data: cData } = await supabase.from('courses').select('id, title');
    const { data: atData } = await supabase.from('assessment_attempts').select('*').eq('user_id', user.id);
    const assessmentsList = (aData || []).filter((a: Assessment) => a.course_id);
    setAssessments(assessmentsList);
    setAllCourses(cData || []);
    setAttempts(atData || []);

    // Group by course
    const groups: Record<string, CourseGroup> = {};
    for (const a of assessmentsList) {
      const cid = a.course_id!;
      if (!groups[cid]) {
        groups[cid] = {
          course_id: cid,
          course_title: a.courses?.title || 'Unknown Course',
          department: a.courses?.department || '',
          thumbnail_url: a.courses?.thumbnail_url || null,
          assessments: [],
        };
      }
      groups[cid].assessments.push(a);
    }

    // Sort assessments within Sales Onboarding course
    if (groups[SALES_COURSE_ID]) {
      groups[SALES_COURSE_ID].assessments.sort((a, b) => {
        const idxA = SALES_ASSESSMENT_ORDER.indexOf(a.title);
        const idxB = SALES_ASSESSMENT_ORDER.indexOf(b.title);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    // Sort courses: Sales first, then by title
    const sortedGroups = Object.values(groups).sort((a, b) => {
      if (a.course_id === SALES_COURSE_ID) return -1;
      if (b.course_id === SALES_COURSE_ID) return 1;
      return a.course_title.localeCompare(b.course_title);
    });

    setCourseGroups(sortedGroups);
    setLoading(false);
  };

  const getAttempt = (assessmentId: string) => attempts.find(a => a.assessment_id === assessmentId);

  const getCourseStatus = (group: CourseGroup) => {
    const total = group.assessments.length;
    const passed = group.assessments.filter(a => {
      const att = getAttempt(a.id);
      return att?.status === 'passed';
    }).length;
    if (passed === total) return 'Completed';
    if (passed > 0) return 'In Progress';
    return 'Not Started';
  };

  const getCourseProgress = (group: CourseGroup) => {
    const total = group.assessments.length;
    const passed = group.assessments.filter(a => getAttempt(a.id)?.status === 'passed').length;
    return { passed, total, percent: total > 0 ? Math.round((passed / total) * 100) : 0 };
  };

  // ─── Sales Onboarding Lock Logic ──────────────────────────────────
  const isSalesAssessmentLocked = (assessmentIndex: number) => {
    if (isAdmin) return false;
    if (assessmentIndex === 0) return false;
    const prevAssessment = selectedCourse?.assessments[assessmentIndex - 1];
    if (!prevAssessment) return true;
    const prevAttempt = getAttempt(prevAssessment.id);
    return prevAttempt?.status !== 'passed';
  };

  // ─── Assessment Taking ────────────────────────────────────────────
  const startAssessment = async (assessment: Assessment) => {
    const { data: qData } = await supabase.from('questions').select('*').eq('assessment_id', assessment.id).order('order_index');
    setTakingAssessment(assessment);
    setTakingQuestions(qData || []);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(assessment.time_limit * 60);
    setSubmitted(false);
    setResult(null);
    setView('take');

    await supabase.from('assessment_attempts').insert({
      user_id: user?.id,
      assessment_id: assessment.id,
      status: 'in_progress',
    });
    await supabase.from('activities').insert({
      user_id: user?.id,
      type: 'assessment_started',
      title: 'Started an assessment',
      description: assessment.title,
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!takingAssessment || !user) return;
    setSubmitted(true);

    let correct = 0;
    let totalGradable = 0;
    const review: any[] = [];

    for (const q of takingQuestions) {
      const answer = answers[q.id];
      let isCorrect = false;
      if (!q.manual_grading) {
        totalGradable++;
        if (q.type === 'multiple_choice') {
          isCorrect = answer === q.correct_answer;
        } else if (q.type === 'true_false') {
          isCorrect = answer === q.correct_answer;
        } else if (q.type === 'fill_blank') {
          isCorrect = answer?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim();
        }
        if (isCorrect) correct++;
      }
      review.push({ question: q, answer, isCorrect });
    }

    const score = totalGradable > 0 ? Math.round((correct / totalGradable) * 100) : 0;
    const passed = score >= takingAssessment.passing_score;

    setResult({ score, passed, correct, total: totalGradable, review });

    await supabase.from('assessment_attempts').update({
      score,
      status: passed ? 'passed' : 'failed',
      answers,
      submitted_at: new Date().toISOString(),
    }).eq('user_id', user.id).eq('assessment_id', takingAssessment.id).eq('status', 'in_progress');

    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'assessment_completed',
      title: passed ? 'Passed an assessment' : 'Completed an assessment',
      description: `${takingAssessment.title} - Score: ${score}%`,
    });

    if (passed) {
      await supabase.from('certificates').insert({
        user_id: user.id,
        course_id: takingAssessment.course_id,
        course_name: takingAssessment.courses?.title || takingAssessment.title,
        score,
        certificate_id: `LMS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      });

      // Update phase progress for Sales Onboarding
      if (takingAssessment.course_id === SALES_COURSE_ID) {
        const idx = SALES_ASSESSMENT_ORDER.indexOf(takingAssessment.title);
        if (idx !== -1) {
          const phaseNum = idx + 1;
          await supabase.from('phase_progress').update({
            assessment_passed: true,
            assessment_score: score,
            status: 'completed',
          }).eq('user_id', user.id).eq('course_id', SALES_COURSE_ID).eq('phase_number', phaseNum);

          if (phaseNum < 5) {
            await supabase.from('phase_progress').update({ status: 'in_progress' }).eq('user_id', user.id).eq('course_id', SALES_COURSE_ID).eq('phase_number', phaseNum + 1);
          }
        }
      }
    }

    // Refresh attempts
    const { data: atData } = await supabase.from('assessment_attempts').select('*').eq('user_id', user.id);
    setAttempts(atData || []);

    setView('result');
  };

  // ─── Question Count ───────────────────────────────────────────────
  const getQuestionCount = async (assessmentId: string) => {
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('assessment_id', assessmentId);
    return count || 0;
  };

  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const a of assessments) {
        counts[a.id] = await getQuestionCount(a.id);
      }
      setQuestionCounts(counts);
    };
    if (assessments.length > 0) loadCounts();
  }, [assessments]);

  // ─── Builder Functions ────────────────────────────────────────────
  const handleCreateAssessment = async () => {
    if (!assessmentInfo.title) return;
    const { data, error } = await supabase.from('assessments').insert({
      title: assessmentInfo.title,
      course_id: assessmentInfo.course_id || null,
      time_limit: assessmentInfo.time_limit,
      passing_score: assessmentInfo.passing_score,
    }).select().single();

    if (data && !error) {
      for (const q of questions) {
        await supabase.from('questions').insert({
          assessment_id: data.id,
          type: q.type,
          question_text: q.question_text,
          options: q.options || null,
          correct_answer: q.correct_answer || null,
          matching_pairs: q.matching_pairs || null,
          manual_grading: q.manual_grading || false,
          order_index: q.order_index,
        });
      }
    }
    setShowBuilder(false);
    setAssessmentInfo({ title: '', course_id: '', time_limit: 30, passing_score: 70 });
    setQuestions([]);
    fetchData();
  };

  const addQuestion = (type: string) => {
    const base = {
      id: crypto.randomUUID(),
      type,
      question_text: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : null,
      correct_answer: null,
      matching_pairs: type === 'matching' ? [{ left: '', right: '' }, { left: '', right: '' }] : null,
      manual_grading: type === 'short_answer' || type === 'long_answer',
      order_index: questions.length,
    };
    setQuestions([...questions, base]);
    setShowQuestionTypeMenu(false);
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx: number, dir: number) => {
    if (idx + dir < 0 || idx + dir >= questions.length) return;
    const updated = [...questions];
    [updated[idx], updated[idx + dir]] = [updated[idx + dir], updated[idx]];
    setQuestions(updated);
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      multiple_choice: 'bg-blue-50 text-blue-700',
      true_false: 'bg-green-50 text-green-700',
      fill_blank: 'bg-amber-50 text-amber-700',
      matching: 'bg-purple-50 text-purple-700',
      short_answer: 'bg-rose-50 text-rose-700',
      long_answer: 'bg-slate-50 text-slate-700',
    };
    return colors[type] || 'bg-slate-50 text-slate-700';
  };

  // ─── Render Question ──────────────────────────────────────────────
  function renderQuestion(q: Question, idx: number, value: any, onChange: (val: any) => void) {
    return (
      <div key={q.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">Q{idx + 1}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(q.type)}`}>
            {QUESTION_TYPES.find(t => t.id === q.type)?.label}
          </span>
          {q.manual_grading && <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">Manual Grading</span>}
        </div>
        <p className="text-slate-800 font-medium mb-4">{q.question_text}</p>

        {q.type === 'multiple_choice' && (
          <div className="space-y-2">
            {q.options?.map((opt: string, oi: number) => (
              <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${value === opt ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name={`q-${q.id}`} checked={value === opt} onChange={() => onChange(opt)} className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === 'true_false' && (
          <div className="flex gap-3">
            {['True', 'False'].map(opt => (
              <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${value === opt.toLowerCase() ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name={`q-${q.id}`} checked={value === opt.toLowerCase()} onChange={() => onChange(opt.toLowerCase())} className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-slate-700">{opt}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === 'fill_blank' && (
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Your answer" />
        )}

        {q.type === 'matching' && (
          <div className="space-y-3">
            {q.matching_pairs?.map((pair: any, pi: number) => (
              <div key={pi} className="flex items-center gap-3">
                <span className="flex-1 p-2 bg-slate-50 rounded-lg text-sm text-slate-700">{pair.left}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <select value={value?.[pi] || ''} onChange={(e) => onChange({ ...value, [pi]: e.target.value })} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                  <option value="">Select match...</option>
                  {q.matching_pairs.map((p: any, i: number) => <option key={i} value={p.right}>{p.right}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {(q.type === 'short_answer' || q.type === 'long_answer') && (
          <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={q.type === 'long_answer' ? 6 : 3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Type your answer here..." />
        )}
      </div>
    );
  }

  // ─── VIEWS ────────────────────────────────────────────────────────

  // LEVEL 3: TAKING ASSESSMENT
  if (view === 'take' && takingAssessment && !submitted) {
    const currentQ = takingQuestions[currentQuestionIndex];
    return (
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <button onClick={() => { setTakingAssessment(null); setView('courses'); }} className="hover:text-primary-700">Assessments</button>
          <span>/</span>
          <button onClick={() => { setTakingAssessment(null); setView('list'); }} className="hover:text-primary-700 truncate max-w-[200px]">{selectedCourse?.course_title}</button>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{takingAssessment.title}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{takingAssessment.title}</h2>
            <p className="text-sm text-slate-500">Question {currentQuestionIndex + 1} of {takingQuestions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold ${timeLeft < 60 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-700'}`}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {currentQ && (
          <div className="space-y-6">
            {renderQuestion(currentQ, currentQuestionIndex, answers[currentQ.id], (val) => setAnswers({ ...answers, [currentQ.id]: val }))}
            <div className="flex justify-between">
              <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                Previous
              </button>
              {currentQuestionIndex < takingQuestions.length - 1 ? (
                <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="px-5 py-2.5 bg-primary-800 text-white rounded-lg hover:bg-primary-900 flex items-center gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Submit
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // LEVEL 3: RESULT
  if (view === 'result' && result) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <button onClick={() => setView('courses')} className="hover:text-primary-700">Assessments</button>
          <span>/</span>
          <button onClick={() => setView('list')} className="hover:text-primary-700 truncate max-w-[200px]">{selectedCourse?.course_title}</button>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{takingAssessment?.title}</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
            {result.passed ? <Trophy className="w-10 h-10 text-green-500" /> : <XCircle className="w-10 h-10 text-red-500" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{result.passed ? 'Congratulations!' : 'Assessment Completed'}</h2>
          <p className="text-slate-500 mb-6">{result.passed ? 'You passed the assessment!' : 'You did not meet the passing score.'}</p>

          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-700">{result.score}%</p>
              <p className="text-sm text-slate-500">Your Score</p>
            </div>
            <div className="w-px h-12 bg-slate-200" />
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-700">{takingAssessment?.passing_score}%</p>
              <p className="text-sm text-slate-500">Passing Score</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-slate-800 mb-3">Review</h4>
            <div className="space-y-2">
              {result.review.map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm text-slate-700 truncate flex-1">{i + 1}. {r.question.question_text.substring(0, 60)}...</span>
                  {r.question.manual_grading ? (
                    <span className="text-xs text-amber-600 font-medium">Manual grading</span>
                  ) : r.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            {result.passed && (
              <button onClick={() => onNavigate('certificates')} className="px-6 py-2.5 bg-primary-800 text-white font-medium rounded-lg hover:bg-primary-900 transition-colors">
                View Certificate
              </button>
            )}
            <button
              onClick={() => {
                setTakingAssessment(null);
                setSubmitted(false);
                setView('list');
              }}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back to Course Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL 2: ASSESSMENT LIST FOR A COURSE
  if (view === 'list' && selectedCourse) {
    const isSales = selectedCourse.course_id === SALES_COURSE_ID;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => setView('courses')} className="hover:text-primary-700">Assessments</button>
          <span>/</span>
          <span className="text-slate-800 font-medium">{selectedCourse.course_title}</span>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setView('courses')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{selectedCourse.course_title}</h2>
            <span className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">{selectedCourse.department}</span>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="space-y-4">
          {selectedCourse.assessments.map((assessment, index) => {
            const attempt = getAttempt(assessment.id);
            const locked = isSales && isSalesAssessmentLocked(index);
            const qCount = questionCounts[assessment.id] || 0;

            let leftBorder = 'border-l-4 border-slate-200';
            let statusBadge = null;
            let actionButton = null;

            if (locked) {
              leftBorder = 'border-l-4 border-slate-300';
              statusBadge = <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>;
            } else if (attempt?.status === 'passed') {
              leftBorder = 'border-l-4 border-green-500';
              statusBadge = <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</span>;
              actionButton = (
                <button onClick={() => startAssessment(assessment)} className="px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Retake
                </button>
              );
            } else if (attempt?.status === 'failed') {
              leftBorder = 'border-l-4 border-red-400';
              statusBadge = <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>;
              actionButton = (
                <button onClick={() => startAssessment(assessment)} className="px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Retake
                </button>
              );
            } else if (attempt?.status === 'in_progress') {
              leftBorder = 'border-l-4 border-blue-500';
              statusBadge = <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1"><Play className="w-3 h-3" /> In Progress</span>;
              actionButton = (
                <button onClick={() => startAssessment(assessment)} className="px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Continue
                </button>
              );
            } else {
              leftBorder = 'border-l-4 border-slate-200';
              statusBadge = <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-xs font-medium rounded-full">Not Started</span>;
              actionButton = (
                <button onClick={() => startAssessment(assessment)} className="px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Start
                </button>
              );
            }

            return (
              <div key={assessment.id} className={`bg-white rounded-xl border border-slate-100 shadow-sm p-6 ${leftBorder} ${locked ? 'opacity-60' : 'hover:shadow-md transition-shadow'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-sm font-bold text-primary-700">{index + 1}</span>
                      <h3 className="font-semibold text-slate-800">{assessment.title}</h3>
                      {statusBadge}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 ml-11">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {assessment.time_limit} min</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Pass: {assessment.passing_score}%</span>
                      <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {qCount} questions</span>
                      {attempt?.score !== null && attempt?.score !== undefined && (
                        <span className="font-medium text-slate-700">Score: {attempt.score}%</span>
                      )}
                    </div>
                    {locked && isSales && (
                      <p className="text-xs text-slate-400 ml-11 mt-2">Complete the previous assessment to unlock this one.</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {locked ? (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-slate-400" />
                      </div>
                    ) : actionButton}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ADMIN BUILDER VIEW
  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Create Assessment</h2>
            <p className="text-sm text-slate-500 mt-1">Build a new assessment with custom questions</p>
          </div>
          <button onClick={() => setShowBuilder(false)} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Title</label>
              <input type="text" value={assessmentInfo.title} onChange={(e) => setAssessmentInfo({ ...assessmentInfo, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="e.g. HR Policy Final Exam" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Linked Course</label>
              <select value={assessmentInfo.course_id} onChange={(e) => setAssessmentInfo({ ...assessmentInfo, course_id: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white">
                <option value="">None</option>
                {allCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit (minutes)</label>
              <input type="number" value={assessmentInfo.time_limit} onChange={(e) => setAssessmentInfo({ ...assessmentInfo, time_limit: parseInt(e.target.value) })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passing Score (%)</label>
              <input type="number" value={assessmentInfo.passing_score} onChange={(e) => setAssessmentInfo({ ...assessmentInfo, passing_score: parseInt(e.target.value) })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Questions ({questions.length})</h3>
              <div className="relative">
                <button onClick={() => setShowQuestionTypeMenu(!showQuestionTypeMenu)} className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
                {showQuestionTypeMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-2">
                    {QUESTION_TYPES.map(t => (
                      <button key={t.id} onClick={() => addQuestion(t.id)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">{t.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Question {idx + 1}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeBadge(q.type)}`}>{QUESTION_TYPES.find(t => t.id === q.type)?.label}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} className="p-1 hover:bg-white rounded disabled:opacity-30"><ChevronUp className="w-4 h-4 text-slate-500" /></button>
                      <button onClick={() => moveQuestion(idx, 1)} disabled={idx === questions.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-30"><ChevronDown className="w-4 h-4 text-slate-500" /></button>
                      <button onClick={() => removeQuestion(idx)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <input type="text" value={q.question_text} onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm mb-3" placeholder="Enter question text" />

                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2">
                      {q.options.map((opt: string, oi: number) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input type="radio" name={`correct-${q.id}`} checked={q.correct_answer === opt} onChange={() => updateQuestion(idx, 'correct_answer', opt)} className="w-4 h-4 text-primary-600" />
                          <input type="text" value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none" placeholder={`Option ${oi + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'true_false' && (
                    <div className="flex gap-3">
                      {['True', 'False'].map(opt => (
                        <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${q.correct_answer === opt.toLowerCase() ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:bg-white'}`}>
                          <input type="radio" name={`correct-${q.id}`} checked={q.correct_answer === opt.toLowerCase()} onChange={() => updateQuestion(idx, 'correct_answer', opt.toLowerCase())} className="w-4 h-4 text-primary-600" />
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'fill_blank' && (
                    <input type="text" value={q.correct_answer || ''} onChange={(e) => updateQuestion(idx, 'correct_answer', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Correct answer" />
                  )}

                  {(q.type === 'short_answer' || q.type === 'long_answer') && (
                    <div className="p-3 bg-amber-50 rounded-lg"><p className="text-xs text-amber-700">This question requires manual grading. No correct answer can be set automatically.</p></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
            <button onClick={() => setShowBuilder(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button onClick={handleCreateAssessment} disabled={!assessmentInfo.title || questions.length === 0} className="px-5 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 disabled:opacity-50">
              <Save className="w-4 h-4 inline mr-2" /> Save Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LEVEL 1: COURSE CARDS VIEW
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assessment Center</h2>
          <p className="text-sm text-slate-500 mt-1">Select a course to view and take its assessments</p>
        </div>
        <button onClick={() => setShowBuilder(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors">
          <Plus className="w-4 h-4" /> Create Assessment
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : courseGroups.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-1">No Assessments Available</h3>
          <p className="text-sm text-slate-500">There are no assessments linked to courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courseGroups.map((group) => {
            const status = getCourseStatus(group);
            const progress = getCourseProgress(group);
            const deptColors: Record<string, string> = {
              HR: 'bg-rose-50 text-rose-700 border-rose-200',
              IT: 'bg-blue-50 text-blue-700 border-blue-200',
              Finance: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              Sales: 'bg-amber-50 text-amber-700 border-amber-200',
              Operations: 'bg-slate-50 text-slate-700 border-slate-200',
              Marketing: 'bg-purple-50 text-purple-700 border-purple-200',
            };

            return (
              <div key={group.course_id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {group.thumbnail_url ? (
                    <img src={group.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-50">
                      <BookOpen className="w-12 h-12 text-primary-200" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${deptColors[group.department] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {group.department}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{group.course_title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><ClipboardCheck className="w-3.5 h-3.5" /> {group.assessments.length} Assessments</span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{progress.passed} of {progress.total} Completed</span>
                      <span className="font-medium text-primary-700">{progress.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div className="bg-primary-500 rounded-full h-1.5 transition-all" style={{ width: `${progress.percent}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      status === 'Completed' ? 'bg-green-50 text-green-700' :
                      status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {status === 'Completed' ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : status === 'In Progress' ? <Play className="w-3 h-3 inline mr-1" /> : <BarChart3 className="w-3 h-3 inline mr-1" />}
                      {status}
                    </span>
                    <button
                      onClick={() => { setSelectedCourse(group); setView('list'); }}
                      className="px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      View Assessments
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
