import React from 'react';
import { Check, X } from 'lucide-react';

export const PainPoints: React.FC = () => {
  return (
    <section className="py-24" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="container mx-auto px-6">
        <div
          className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: '#A51C30' }}
        >
          <div className="grid md:grid-cols-2">
            {/* Other Platforms */}
            <div
              className="p-10 border-b md:border-b-0 md:border-r"
              style={{ backgroundColor: '#FEF2F3', borderColor: '#FECDD3', color: '#A51C30' }}
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A51C30' }}></span>
                Other Platforms
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <X className="shrink-0" style={{ color: '#A51C30' }} />
                  <span>Unsolicited calls & SMS bombardment after signup</span>
                </li>
                <li className="flex gap-4">
                  <X className="shrink-0" style={{ color: '#A51C30' }} />
                  <span>Impossible to delete account or stop data sharing</span>
                </li>
                <li className="flex gap-4">
                  <X className="shrink-0" style={{ color: '#A51C30' }} />
                  <span>Biased, paid, or fake reviews</span>
                </li>
                <li className="flex gap-4">
                  <X className="shrink-0" style={{ color: '#A51C30' }} />
                  <span>Outdated fee structures and eligibility criteria</span>
                </li>
              </ul>
            </div>

            {/* EduAbroad Way */}
            <div
              className="p-10"
              style={{
                background: 'linear-gradient(135deg, #A51C30, #FECDD3)',
                color: '#FFFFFF',
              }}
            >
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FEF2F3' }}></span>
                EduAbroad
              </h3>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <Check className="shrink-0" style={{ color: '#FFFFFF' }} />
                  <span>100% Private. You initiate contact, not us.</span>
                </li>
                <li className="flex gap-4">
                  <Check className="shrink-0" style={{ color: '#FFFFFF' }} />
                  <span>Full data control. Delete account instantly.</span>
                </li>
                <li className="flex gap-4">
                  <Check className="shrink-0" style={{ color: '#FFFFFF' }} />
                  <span>Verified student reviews only via LinkedIn/College email.</span>
                </li>
                <li className="flex gap-4">
                  <Check className="shrink-0" style={{ color: '#FFFFFF' }} />
                  <span>Real-time API sync with university databases.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-[#A51C30] text-sm mb-6">
            Join 10,000+ students who switched for peace of mind.
          </p>
          <button
            className="px-8 py-3 font-bold rounded-full transition-all shadow-lg"
            style={{
              backgroundColor: '#A51C30',
              color: '#FFFFFF',
              boxShadow: '0 10px 20px rgba(165, 28, 48, 0.3)',
            }}
          >
            Experience the Difference
          </button>
        </div>
      </div>
    </section>
  );
};
