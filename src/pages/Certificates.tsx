import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Award, Download, Eye, X, GraduationCap, Calendar, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface Certificate {
  id: string;
  course_name: string;
  score: number | null;
  certificate_id: string;
  issued_at: string;
}

const ADMIN_EXAMPLE_CERT: Certificate = {
  id: 'admin-example',
  course_name: 'Sales Onboarding Training Programme — Leapswitch & CloudPe',
  score: 92,
  certificate_id: 'CERT-SALES-ADMIN-001',
  issued_at: new Date().toISOString(),
};

export default function Certificates() {
  const { user, isAdmin } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      setCertificates(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const downloadPDF = async () => {
    if (!certRef.current || !selectedCert) return;
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);
    const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const yPos = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, 'PNG', 0, yPos, imgWidth, imgHeight);
    pdf.save(`certificate-${selectedCert.certificate_id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const allCerts = isAdmin ? [ADMIN_EXAMPLE_CERT, ...certificates] : certificates;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Certificates</h2>
        <p className="text-sm text-slate-500 mt-1">View and download your earned certificates</p>
      </div>

      {allCerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No certificates yet</h3>
          <p className="text-sm text-slate-500">Complete courses and pass assessments to earn certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCerts.map((cert) => (
            <div
              key={cert.id}
              className={`bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition-shadow ${cert.id === 'admin-example' ? 'border-primary-200 ring-1 ring-primary-100' : 'border-slate-100'}`}
            >
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              {cert.id === 'admin-example' && (
                <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full mb-2">Example Certificate</span>
              )}
              <h3 className="font-semibold text-slate-800 mb-1">{cert.course_name}</h3>
              <div className="space-y-2 mb-4">
                {cert.id === 'admin-example' && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <GraduationCap className="w-4 h-4" />
                    Recipient: System Administrator
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(cert.issued_at)}
                </div>
                {cert.score && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <TrendingUp className="w-4 h-4" />
                    Score: {cert.score}%
                  </div>
                )}
                <div className="text-xs text-slate-400 font-mono">{cert.certificate_id}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View
                </button>
                <button
                  onClick={() => { setSelectedCert(cert); setTimeout(downloadPDF, 500); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-slate-800">Certificate Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button onClick={() => setSelectedCert(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-8 flex justify-center">
              {selectedCert.id === 'admin-example' ? (
                <AdminCertificateDesign cert={selectedCert} certRef={certRef} />
              ) : (
                <StandardCertificateDesign cert={selectedCert} certRef={certRef} userName={user?.full_name || ''} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Example Certificate Design ──────────────────────────────
function AdminCertificateDesign({ cert, certRef }: { cert: Certificate; certRef: React.RefObject<HTMLDivElement> }) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="scale-90 origin-top">
      <div
        ref={certRef}
        className="w-[920px] h-[650px] bg-white relative overflow-hidden"
        style={{ padding: '8px', background: '#1E3A8A' }}
      >
        {/* Inner border (lighter blue) */}
        <div className="w-full h-full relative overflow-hidden" style={{ border: '4px solid #3B82F6', background: '#ffffff' }}>
          {/* Watermark diagonal text */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                transform: 'rotate(-35deg)',
                fontSize: '120px',
                fontWeight: 900,
                color: '#3B82F6',
                opacity: 0.04,
                whiteSpace: 'nowrap',
                letterSpacing: '20px',
              }}
            >
              LEAPSWITCH LEAPSWITCH
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full px-12 py-10 text-center">
            {/* Top: Logo */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-14 h-14 bg-primary-800 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#1E3A8A' }}>Onboard LMS</h1>
            </div>

            {/* Gold divider */}
            <div className="w-40 h-1 mb-5" style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

            {/* Main heading */}
            <h2 className="text-4xl font-extrabold mb-3 tracking-wide" style={{ color: '#1E3A8A', fontFamily: 'Georgia, serif' }}>
              CERTIFICATE OF COMPLETION
            </h2>

            <p className="text-sm text-slate-500 mb-3">This is to certify that</p>

            {/* Recipient name */}
            <div className="mb-3">
              <h3 className="text-3xl font-bold" style={{ color: '#1E3A8A', fontFamily: 'Georgia, serif' }}>
                System Administrator
              </h3>
              <div className="mx-auto mt-1 h-0.5 w-72" style={{ background: '#CBD5E1' }} />
            </div>

            <p className="text-sm text-slate-500 mb-2">has successfully completed the</p>

            {/* Course name */}
            <div className="mb-3">
              <p className="text-xl font-bold" style={{ color: '#1E3A8A' }}>
                Sales Onboarding Training Programme
              </p>
              <p className="text-lg font-semibold" style={{ color: '#1E3A8A' }}>
                Leapswitch Networks &amp; CloudPe
              </p>
            </div>

            <p className="text-sm text-slate-600 max-w-2xl mb-2 leading-relaxed">
              demonstrating knowledge of cloud infrastructure, sales fundamentals, competitive positioning, and professional sales execution.
            </p>

            {/* Bottom row: date, signatures, seal */}
            <div className="w-full flex items-end justify-between mt-4">
              {/* Date (left) */}
              <div className="text-left">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-slate-700">{today}</p>
              </div>

              {/* Signatures (center) */}
              <div className="flex gap-12">
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-slate-400 mb-1" />
                  <p className="text-xs text-slate-600 font-medium">HR Manager</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-slate-400 mb-1" />
                  <p className="text-xs text-slate-600 font-medium">Sales Head</p>
                </div>
              </div>

              {/* Certificate ID (right) */}
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="text-sm font-mono text-slate-700">{cert.certificate_id}</p>
              </div>
            </div>

            {/* Seal badge */}
            <div className="flex justify-center -mt-2">
              <div
                className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  border: '3px solid #FBBF24',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                }}
              >
                <Star className="w-5 h-5 text-white fill-white" />
                <span className="text-[9px] text-white font-bold tracking-wide">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Standard Certificate Design ────────────────────────────────────
function StandardCertificateDesign({
  cert,
  certRef,
  userName,
}: {
  cert: Certificate;
  certRef: React.RefObject<HTMLDivElement>;
  userName: string;
}) {
  return (
    <div
      ref={certRef}
      className="w-[800px] h-[560px] bg-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
        border: '12px solid #1E3A8A',
      }}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary-800" />
      <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-primary-800" />
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-primary-800" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary-800" />

      <div className="flex flex-col items-center justify-center h-full px-16 text-center">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-primary-800 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-primary-900">Onboard LMS</h1>
            <p className="text-xs text-slate-500 tracking-widest uppercase">Certificate of Completion</p>
          </div>
        </div>

        {/* Decorative line */}
        <div className="w-32 h-0.5 bg-primary-300 mb-6" />

        {/* Body */}
        <p className="text-sm text-slate-500 mb-3">This certifies that</p>
        <h2 className="text-3xl font-bold text-primary-800 mb-3">{userName}</h2>
        <p className="text-sm text-slate-500 mb-4">has successfully completed</p>
        <h3 className="text-xl font-semibold text-slate-800 mb-6">{cert.course_name}</h3>

        {/* Score badge */}
        {cert.score && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            Achieved {cert.score}% score
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between w-full mt-auto pt-8">
          <div className="text-left">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Date</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(cert.issued_at)}</p>
          </div>
          <div className="text-center">
            <div className="w-32 h-0.5 bg-slate-300 mb-2" />
            <p className="text-xs text-slate-400">Authorized Signature</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Certificate ID</p>
            <p className="text-sm font-mono text-slate-700">{cert.certificate_id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
