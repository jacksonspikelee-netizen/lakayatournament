import React, { useState, useEffect } from 'react';
import { FileCheck2, Printer, Crown, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Certificate } from '../types';

export const CertificatesView: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    apiRequest<Certificate[]>('/certificates/my')
      .then(data => setCertificates(Array.isArray(data) ? data : []))
      .catch(() => setCertificates([]));
  }, []);

  return (
    <div id="certificates-view-container" className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-wide flex items-center space-x-3">
            <FileCheck2 className="w-8 h-8 text-teal-400" />
            <span>Official Championship Diplomas</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Verifiable diplomas signed by President DJSPIDEED THEKING for tournament triumphs.
          </p>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        {!Array.isArray(certificates) || certificates.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-display font-bold text-lg text-white">No Certificates on Record</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Win an official 12-player LakayaTOURNAMENT championship bracket to earn your verified diploma with unique certificate verification number!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden"
              >
                {/* Haitian Flag Accent */}
                <div className="h-1.5 w-24 flex rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-[#0047AB]" />
                  <div className="h-full w-1/2 bg-[#D21034]" />
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-amber-400 font-bold tracking-wider">
                      {cert.certificate_number}
                    </span>
                    <h3 className="font-display font-black text-xl text-white mt-1">
                      {cert.title}
                    </h3>
                  </div>
                  <Crown className="w-6 h-6 text-amber-400 shrink-0" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Conferred upon <strong className="text-white text-sm">{cert.recipient_name}</strong> for outstanding performance and winning 1st place in {cert.tournament_name}.
                </p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Date: {cert.issue_date}</span>
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition flex items-center space-x-1.5 shadow"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Diploma Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-4 border-amber-500 rounded-3xl p-8 space-y-6 text-center shadow-2xl text-white my-8 printable-certificate">
            {/* Haitian Ribbon Banner */}
            <div className="h-2 w-36 mx-auto flex rounded-full overflow-hidden mb-2">
              <div className="h-full w-1/2 bg-[#0047AB]" />
              <div className="h-full w-1/2 bg-[#D21034]" />
            </div>

            <img
              src="/logo.jpg"
              alt="LakayaTOURNAMENT"
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-amber-400"
              referrerPolicy="no-referrer"
            />

            <div>
              <span className="font-tech text-xs tracking-[0.3em] text-amber-400 uppercase font-bold">
                LAKAYATOURNAMENT OFFICIAL ESPORTS DIPLOMA
              </span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-white mt-1">
                CERTIFICATE OF CHAMPIONSHIP
              </h2>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Official Verification Code: {selectedCert.certificate_number}
              </div>
            </div>

            <div className="space-y-3 py-6 border-y border-amber-500/30">
              <p className="text-xs text-slate-300">This official diploma proudly certifies that</p>
              <div className="font-display font-black text-3xl text-amber-300 tracking-wide">
                {selectedCert.recipient_name}
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                has triumphed in <strong className="text-white">{selectedCert.tournament_name}</strong> and demonstrated elite esports mastery under official LakayaTOURNAMENT regulations.
              </p>
            </div>

            <div className="flex justify-between items-end pt-4 text-left">
              <div>
                <div className="text-[10px] text-slate-400">ISSUED DATE</div>
                <div className="text-xs font-bold text-white">{selectedCert.issue_date}</div>
              </div>

              <div className="text-center">
                <div className="font-display font-bold text-amber-400 text-sm">DJSPIDEED THEKING</div>
                <div className="text-[10px] text-slate-400">President & League Commissioner</div>
              </div>
            </div>

            <div className="flex justify-center space-x-3 pt-4 no-print">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Diploma</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-6 py-2.5 bg-slate-800 text-slate-300 text-xs rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
