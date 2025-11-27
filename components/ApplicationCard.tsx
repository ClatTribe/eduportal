import React from 'react';
import { CheckCircle, Edit2, Trash2 } from 'lucide-react';

interface ApplicationBuilderRow {
  id?: number;
  user_id: string;
  university: string | null;
  program: string | null;
  documents: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

interface ApplicationCardProps {
  application: ApplicationBuilderRow;
  index: number;
  variant?: 'rectangular' | 'circular';
  onEdit?: (app: ApplicationBuilderRow, index: number) => void;
  onDelete?: (app: ApplicationBuilderRow) => void;
  onClick?: (app: ApplicationBuilderRow) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  index,
  variant = 'rectangular',
  onEdit,
  onDelete,
  onClick,
}) => {
  const documentsAttached = Object.values(application.documents || {}).filter(Boolean).length;

  // Rectangular variant (for application builder page)
  if (variant === 'rectangular') {
    return (
      <div
        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onClick?.(application)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">
              {application.university}
            </h3>
            <p className="text-gray-600 mt-1">{application.program}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(application.documents || {}).map(([key, value]) => {
                if (value) {
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold"
                    >
                      <CheckCircle size={10} />
                      {key}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
          {(onEdit || onDelete) && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(application, index);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(application);
                  }}
                  className="p-2 text-[#A51C30] hover:bg-[#FEF2F3] rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Circular variant (for home page)
  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => onClick?.(application)}
    >
      {/* Circular container */}
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#A51C30] to-[#8B1528] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="text-white font-bold text-sm md:text-base mb-1 line-clamp-2">
            {application.university}
          </div>
          <div className="text-white/90 text-xs line-clamp-2 mb-2">
            {application.program}
          </div>
          
          {/* Document count badge */}
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
            <CheckCircle size={12} className="text-white" />
            <span className="text-white text-xs font-semibold">
              {documentsAttached} docs
            </span>
          </div>
        </div>
      </div>

      {/* University name tooltip on hover */}
      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
          {application.university}
        </p>
        <p className="text-xs text-gray-600 line-clamp-1">
          {application.program}
        </p>
      </div>
    </div>
  );
};

export default ApplicationCard;