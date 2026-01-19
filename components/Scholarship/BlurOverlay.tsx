import { AlertCircle, Sparkles } from 'lucide-react';

interface BlurOverlayProps {
  isBlurred: boolean;
  remainingCount: number;
  accentColor: string;
  borderColor: string;
}

export const BlurOverlay: React.FC<BlurOverlayProps> = ({
  isBlurred,
  remainingCount,
  accentColor,
  borderColor,
}) => {
  if (!isBlurred) return null;

  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl">
      <div className="bg-white shadow-2xl rounded-2xl p-4 sm:p-8 text-center max-w-sm" style={{ border: `2px solid ${borderColor}` }}>
        <div className="mb-4 flex justify-center">
          <div className="rounded-full p-3 sm:p-4" style={{ backgroundColor: `rgba(165, 28, 48, 0.1)` }}>
            <AlertCircle style={{ color: accentColor }} size={28} />
          </div>
        </div>
        <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Unlock More Recommendations</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          Talk to our experts to view detailed information about this and {remainingCount} more personalized scholarship recommendations
        </p>
        <button className="text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:opacity-90 transition-colors w-full flex items-center justify-center gap-2 text-xs sm:text-sm" style={{ backgroundColor: accentColor }}>
          <Sparkles size={16} />
          Contact Our Experts
        </button>
      </div>
    </div>
  );
};