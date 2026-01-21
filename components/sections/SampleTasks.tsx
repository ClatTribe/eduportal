import { Headphones, BookOpen, MessageCircle, PenTool, Download, Eye } from "lucide-react";

export default function SampleSectionsPage() {
  const accentColor = '#A51C30';
  const secondaryAccent = '#8B1528';
  const borderColor = '#FECDD3';
  const lightBg = '#FEF2F3';

  const sections = [
    {
      title: "Listening Section",
      icon: Headphones,
      color: accentColor,
      bg: lightBg,
      description: "Practice authentic IELTS listening exercises",
      file: "LISTENING SECTION (1).pdf",
    },
    {
      title: "Reading Section",
      icon: BookOpen,
      color: accentColor,
      bg: lightBg,
      description: "Comprehensive reading passages and questions",
      file: "READING.pdf",
    },
    {
      title: "Speaking Section",
      icon: MessageCircle,
      color: accentColor,
      bg: lightBg,
      description: "Guided speaking prompts and strategies",
      file: "SPEAKING.pdf",
    },
    {
      title: "Writing Section",
      icon: PenTool,
      color: accentColor,
      bg: lightBg,
      description: "Task 1 & Task 2 sample questions",
      file: "WRITING.pdf",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div 
          className="p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-8 shadow-lg"
          style={{
            backgroundColor: 'white',
            border: `2px solid ${borderColor}`
          }}
        >
          <div className="flex-1">
            <h2 
              className="text-3xl font-bold mb-3"
              style={{ color: accentColor }}
            >
              Master Every IELTS Section
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Download comprehensive practice materials for all four IELTS sections. 
              Perfect for structured preparation and skill assessment.
            </p>
          </div>

          <button 
            className="px-8 py-4 font-bold rounded-2xl hover:scale-105 transition-transform shrink-0 shadow-md"
            style={{
              background: `linear-gradient(to right, ${accentColor}, ${secondaryAccent})`,
              color: 'white'
            }}
          >
            Get Full Access
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            const pdfPath = `/samplesections/${encodeURIComponent(section.file)}`;

            return (
              <div
                key={i}
                className="group p-6 rounded-2xl transition-all shadow-md hover:shadow-xl"
                style={{
                  backgroundColor: 'white',
                  border: `2px solid ${borderColor}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                }}
              >
                <div className="flex items-center gap-6">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: section.bg,
                      color: section.color
                    }}
                  >
                    <Icon className="w-8 h-8" />
                  </div>

                  <div className="flex-1">
                    <h4 
                      className="text-xl font-bold mb-1 transition-colors"
                      style={{ color: accentColor }}
                    >
                      {section.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={pdfPath}
                    download
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                    style={{
                      background: `linear-gradient(to right, ${accentColor}, ${secondaryAccent})`,
                      color: 'white'
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </a>

                  <a
                    href={pdfPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-110"
                    style={{
                      border: `2px solid ${borderColor}`,
                      backgroundColor: lightBg,
                      color: accentColor
                    }}
                    title="View PDF"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accentColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = borderColor;
                    }}
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div 
          className="p-6 rounded-2xl text-center"
          style={{
            backgroundColor: lightBg,
            border: `1px solid ${borderColor}`
          }}
        >
          <p className="text-gray-700 font-medium">
            💡 <span style={{ color: accentColor, fontWeight: 'bold' }}>Pro Tip:</span> Practice each section regularly to build confidence and improve your band score.
          </p>
        </div>
      </div>
    </div>
  );
}