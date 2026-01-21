import React from 'react';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

export const FreeMockSection: React.FC = () => {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const steps = [
    {
      number: 1,
      title: "Sign Up & Select Course",
      description: "While signing up, select the IELTS course from the course list."
    },
    {
      number: 2,
      title: "Navigate to Mock Test",
      description: "After logging in, go to Online IELTS → CD IELTS."
    },
    {
      number: 3,
      title: "Access Full Mock Test",
      description: "You will find one full-length mock test (151 minutes)."
    },
    {
      number: 4,
      title: "Complete the Test",
      description: "Please attempt this test completely."
    },
    {
      number: 5,
      title: "Get Detailed Feedback",
      description: "Based on your performance, we will analyse your results and share detailed feedback with you."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div 
        className="p-8 md:p-12 rounded-3xl text-center relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccent})` 
        }}
      >
        <div className="relative z-10">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Free Full-Length IELTS Mock Test
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Experience a complete IELTS exam simulation with 151 minutes of comprehensive testing and receive detailed feedback on your performance.
          </p>
          <div className="flex items-center justify-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>151 Minutes</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/50"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Full Feedback</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/50"></div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>All 4 Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">How to Access Your Free Mock Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-6 rounded-3xl bg-white transition-all"
              style={{ border: `1px solid ${borderColor}` }}
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: lightBg, color: accentColor }}
              >
                <span className="text-2xl font-bold">{step.number}</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div 
        className="p-8 rounded-3xl relative overflow-hidden"
        style={{ backgroundColor: lightBg, border: `1px solid ${borderColor}` }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
              Ready to Test Your Skills?
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Start your journey to IELTS success with our comprehensive mock test. Get instant access to a full-length simulation and receive personalized feedback to improve your score.
            </p>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
              <span>Complete 151-minute simulation covering all four modules</span>
            </div>
          </div>
          <div className="shrink-0">
            <a
              href="https://pte.goeduabroad.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-5 text-white font-bold rounded-2xl hover:shadow-2xl transition-all text-lg"
              style={{ backgroundColor: accentColor }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = secondaryAccent)}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = accentColor)}
            >
              Start Free Mock Test
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};