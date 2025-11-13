"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download, Eye, Calendar, User, CheckCircle, XCircle, Lock, MessageSquare, Edit3, Save, X, Clock, Check } from 'lucide-react';
import { supabase } from '../../../../../lib/supabase';

interface StudentDocument {
  id: string;
  user_id: string;
  username: string;
  lor_name: string | null;
  lor_url: string | null;
  lor_size: number | null;
  lor_uploaded_at: string | null;
  lor_feedback: string | null;
  lor_feedback_updated_at: string | null;
  lor_feedback_by: string | null;
  lor_status: boolean;
  sop_name: string | null;
  sop_url: string | null;
  sop_size: number | null;
  sop_uploaded_at: string | null;
  sop_feedback: string | null;
  sop_feedback_updated_at: string | null;
  sop_feedback_by: string | null;
  sop_status: boolean;
  resume_name: string | null;
  resume_url: string | null;
  resume_size: number | null;
  resume_uploaded_at: string | null;
  resume_feedback: string | null;
  resume_feedback_updated_at: string | null;
  resume_feedback_by: string | null;
  resume_status: boolean;
  created_at: string;
  updated_at: string;
}

interface DocumentFeedback {
  text: string;
  updatedAt: string | null;
  commentBy: string | null;
  status: boolean;
}

interface FeedbackState {
  lor: DocumentFeedback;
  sop: DocumentFeedback;
  resume: DocumentFeedback;
}

interface EditingState {
  lor: boolean;
  sop: boolean;
  resume: boolean;
}

interface DraftState {
  lor: string;
  sop: string;
  resume: string;
}

type DocumentType = 'lor' | 'sop' | 'resume';

interface DocumentCardProps {
  type: DocumentType;
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  filename: string | null;
  filesize: number | null;
  uploadDate: string | null;
  fileUrl: string | null;
  feedback: DocumentFeedback;
  isEditing: boolean;
  draft: string;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onStatusToggle: () => void;
  formatDate: (date: string | null) => string;
  formatFileSize: (size: number | null) => string;
  handleDownload: (url: string | null, filename: string | null) => void;
  handleViewInNewTab: (url: string | null) => void;
}

const StudentDocumentsPage = () => {
  const params = useParams();
  const router = useRouter();
  
  const userId = params.username as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [student, setStudent] = useState<StudentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackState>({
    lor: { text: '', updatedAt: null, commentBy: null, status: false },
    sop: { text: '', updatedAt: null, commentBy: null, status: false },
    resume: { text: '', updatedAt: null, commentBy: null, status: false }
  });
  const [isEditing, setIsEditing] = useState<EditingState>({
    lor: false,
    sop: false,
    resume: false
  });
  const [draft, setDraft] = useState<DraftState>({
    lor: '',
    sop: '',
    resume: ''
  });
  const [isSaving, setIsSaving] = useState<EditingState>({
    lor: false,
    sop: false,
    resume: false
  });

  useEffect(() => {
    const isAuth = sessionStorage.getItem('agency_authenticated') === 'true';
    setIsAuthenticated(isAuth);
    setCheckingAuth(false);
    
    if (!isAuth) {
      router.push('/agency/dashboard');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated && userId && !checkingAuth) {
      fetchStudentDocuments();
    }
  }, [isAuthenticated, userId, checkingAuth]);

  const fetchStudentDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('student_documents')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError);
        setError('Failed to load student documents');
        return;
      }

      if (!data || data.length === 0) {
        setError('Student not found');
        return;
      }

      setStudent(data[0]);

      setFeedback({
        lor: {
          text: data[0].lor_feedback || '',
          updatedAt: data[0].lor_feedback_updated_at,
          commentBy: data[0].lor_feedback_by,
          status: data[0].lor_status || false
        },
        sop: {
          text: data[0].sop_feedback || '',
          updatedAt: data[0].sop_feedback_updated_at,
          commentBy: data[0].sop_feedback_by,
          status: data[0].sop_status || false
        },
        resume: {
          text: data[0].resume_feedback || '',
          updatedAt: data[0].resume_feedback_updated_at,
          commentBy: data[0].resume_feedback_by,
          status: data[0].resume_status || false
        }
      });
    } catch (err) {
      console.error('❌ Error fetching student documents:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not uploaded';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (url: string | null, filename: string | null) => {
    if (!url || !filename) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    }
  };

  const handleViewInNewTab = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const handleEditFeedback = (type: DocumentType) => {
    setDraft(prev => ({ ...prev, [type]: feedback[type].text || '' }));
    setIsEditing(prev => ({ ...prev, [type]: true }));
  };

  const handleSaveFeedback = async (type: DocumentType) => {
    if (!student) {
      alert('❌ Error: Student data not loaded');
      return;
    }

    if (!draft[type].trim()) {
      alert('⚠️ Please enter a comment before saving');
      return;
    }
    
    setIsSaving(prev => ({ ...prev, [type]: true }));
    
    try {
      const updatePayload = {
        [`${type}_feedback`]: draft[type].trim(),
        [`${type}_feedback_updated_at`]: new Date().toISOString(),
        [`${type}_feedback_by`]: 'Agency Admin'
      };

      const { data: updateData, error: updateError } = await supabase
        .from('student_documents')
        .update(updatePayload)
        .eq('user_id', student.user_id)
        .select();

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      if (!updateData || updateData.length === 0) {
        throw new Error('No rows were updated. Please check permissions.');
      }

      setFeedback(prev => ({
        ...prev,
        [type]: {
          text: draft[type].trim(),
          updatedAt: new Date().toISOString(),
          commentBy: 'Agency Admin',
          status: prev[type].status
        }
      }));
      setIsEditing(prev => ({ ...prev, [type]: false }));
      
      alert('✅ Feedback saved successfully!');
      await fetchStudentDocuments();
      
    } catch (err) {
      console.error('❌ Error saving feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('❌ Failed to save feedback: ' + errorMessage);
    } finally {
      setIsSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDeleteFeedback = async (type: DocumentType) => {
    if (!student) return;
    if (!confirm(`Are you sure you want to delete ${type.toUpperCase()} feedback?`)) return;
    
    setIsSaving(prev => ({ ...prev, [type]: true }));
    
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .update({
          [`${type}_feedback`]: null,
          [`${type}_feedback_updated_at`]: null,
          [`${type}_feedback_by`]: null
        })
        .eq('user_id', student.user_id)
        .select();

      if (error) {
        console.error('❌ Delete error:', error);
        throw error;
      }

      setFeedback(prev => ({
        ...prev,
        [type]: { text: '', updatedAt: null, commentBy: null, status: prev[type].status }
      }));
      setIsEditing(prev => ({ ...prev, [type]: false }));
      
      alert('✅ Feedback deleted successfully!');
      await fetchStudentDocuments();
      
    } catch (err) {
      console.error('❌ Error deleting feedback:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert('❌ Failed to delete feedback: ' + errorMessage);
    } finally {
      setIsSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleCancelEdit = (type: DocumentType) => {
    setIsEditing(prev => ({ ...prev, [type]: false }));
    setDraft(prev => ({ ...prev, [type]: '' }));
  };

  const handleStatusToggle = async (type: DocumentType) => {
    if (!student) return;
    
    const newStatus = !feedback[type].status;
    
    try {
      const { error } = await supabase
        .from('student_documents')
        .update({ [`${type}_status`]: newStatus })
        .eq('user_id', student.user_id);

      if (error) {
        console.error('❌ Status update error:', error);
        throw error;
      }

      setFeedback(prev => ({
        ...prev,
        [type]: { ...prev[type], status: newStatus }
      }));

      alert(`✅ Document ${newStatus ? 'verified' : 'unverified'} successfully!`);
      await fetchStudentDocuments();
      
    } catch (err) {
      console.error('❌ Error updating status:', err);
      alert('❌ Failed to update verification status');
    }
  };

  if (checkingAuth) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view student documents
          </p>
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-xl text-red-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          Loading student documents...
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || 'Student Not Found'}
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to load student documents. Please try again.
          </p>
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isComplete = !!(student.lor_url && student.sop_url && student.resume_url);

  const DocumentCard: React.FC<DocumentCardProps> = ({ 
    type,
    title, 
    icon: Icon, 
    filename, 
    filesize, 
    uploadDate, 
    fileUrl,
    feedback,
    isEditing,
    draft,
    isSaving,
    onEdit,
    onSave,
    onDelete,
    onCancel,
    onDraftChange,
    onStatusToggle,
    formatDate,
    formatFileSize,
    handleDownload,
    handleViewInNewTab
  }) => {
    const isUploaded = !!fileUrl;
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (isEditing && textareaRef.current) {
        const textarea = textareaRef.current;
        const length = textarea.value.length;
        textarea.focus();
        textarea.setSelectionRange(length, length);
      }
    }, [isEditing]);

    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
        isUploaded ? 'border-green-200' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isUploaded ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gray-200'
            }`}>
              <Icon className={isUploaded ? 'text-white' : 'text-gray-500'} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className={`text-sm ${isUploaded ? 'text-green-600' : 'text-gray-500'}`}>
                {isUploaded ? 'Uploaded' : 'Not uploaded'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUploaded && (
              <CheckCircle className="text-green-500" size={28} />
            )}
            {feedback.status && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <Check size={16} />
                Verified
              </div>
            )}
          </div>
        </div>

        {isUploaded ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">Filename</p>
                    <p className="font-semibold text-gray-800 truncate">{filename}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileText className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="font-semibold text-gray-800">{formatFileSize(filesize)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="text-gray-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Uploaded</p>
                    <p className="font-semibold text-gray-800">{formatDate(uploadDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewInNewTab(fileUrl)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Eye size={18} />
                View
              </button>
              <button
                onClick={() => handleDownload(fileUrl, filename)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={onStatusToggle}
                className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  feedback.status
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Check size={18} />
                {feedback.status ? 'Verified' : 'Verify'}
              </button>
            </div>

            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Agency Feedback</h4>
                    {feedback.text && feedback.updatedAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock size={14} />
                        <span>{formatDate(feedback.updatedAt)}</span>
                        {feedback.commentBy && (
                          <>
                            <span>•</span>
                            <span>By: {feedback.commentBy}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={onEdit}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold flex items-center gap-1 text-sm"
                    >
                      <Edit3 size={14} />
                      {feedback.text ? 'Edit' : 'Add'}
                    </button>
                    {feedback.text && (
                      <button
                        onClick={onDelete}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all font-semibold flex items-center gap-1 text-sm disabled:opacity-50"
                      >
                        <X size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!isEditing && feedback.text ? (
                <div className="bg-white border border-purple-200 rounded-lg p-3">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                    {feedback.text}
                  </p>
                </div>
              ) : !isEditing && !feedback.text ? (
                <div className="bg-white border border-purple-200 rounded-lg p-6 text-center">
                  <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600 text-sm">No feedback yet</p>
                </div>
              ) : null}

              {isEditing && (
                <div className="space-y-3">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => onDraftChange(e.target.value)}
                    placeholder="Enter your feedback here..."
                    rows={6}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={onSave}
                      disabled={isSaving || !draft.trim()}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={onCancel}
                      disabled={isSaving}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <XCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">Document not yet uploaded</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <button
            onClick={() => router.push('/agency/dashboard')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 mb-4 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={32} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {student.username}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Registered: {formatDate(student.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Last Updated: {formatDate(student.updated_at)}
                </span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              isComplete 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {isComplete ? '✓ Complete' : '⚠ Incomplete'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Application Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              student.lor_url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {student.lor_url ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">LOR</span>
              </div>
              <p className={`text-sm ${student.lor_url ? 'text-green-600' : 'text-gray-500'}`}>
                {student.lor_url ? 'Uploaded' : 'Pending'}
              </p>
              {feedback.lor.status && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <Check size={12} />
                  <span>Verified</span>
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              student.sop_url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {student.sop_url ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">SOP</span>
              </div>
              <p className={`text-sm ${student.sop_url ? 'text-green-600' : 'text-gray-500'}`}>
                {student.sop_url ? 'Uploaded' : 'Pending'}
              </p>
              {feedback.sop.status && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <Check size={12} />
                  <span>Verified</span>
                </div>
              )}
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              student.resume_url ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {student.resume_url ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">Resume</span>
              </div>
              <p className={`text-sm ${student.resume_url ? 'text-green-600' : 'text-gray-500'}`}>
                {student.resume_url ? 'Uploaded' : 'Pending'}
              </p>
              {feedback.resume.status && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <Check size={12} />
                  <span>Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <DocumentCard
            type="lor"
            title="Letter of Recommendation"
            icon={FileText}
            filename={student.lor_name}
            filesize={student.lor_size}
            uploadDate={student.lor_uploaded_at}
            fileUrl={student.lor_url}
            feedback={feedback.lor}
            isEditing={isEditing.lor}
            draft={draft.lor}
            isSaving={isSaving.lor}
            onEdit={() => handleEditFeedback('lor')}
            onSave={() => handleSaveFeedback('lor')}
            onDelete={() => handleDeleteFeedback('lor')}
            onCancel={() => handleCancelEdit('lor')}
            onDraftChange={(value) => setDraft(prev => ({ ...prev, lor: value }))}
            onStatusToggle={() => handleStatusToggle('lor')}
            formatDate={formatDate}
            formatFileSize={formatFileSize}
            handleDownload={handleDownload}
            handleViewInNewTab={handleViewInNewTab}
          />

          <DocumentCard
            type="sop"
            title="Statement of Purpose"
            icon={FileText}
            filename={student.sop_name}
            filesize={student.sop_size}
            uploadDate={student.sop_uploaded_at}
            fileUrl={student.sop_url}
            feedback={feedback.sop}
            isEditing={isEditing.sop}
            draft={draft.sop}
            isSaving={isSaving.sop}
            onEdit={() => handleEditFeedback('sop')}
            onSave={() => handleSaveFeedback('sop')}
            onDelete={() => handleDeleteFeedback('sop')}
            onCancel={() => handleCancelEdit('sop')}
            onDraftChange={(value) => setDraft(prev => ({ ...prev, sop: value }))}
            onStatusToggle={() => handleStatusToggle('sop')}
            formatDate={formatDate}
            formatFileSize={formatFileSize}
            handleDownload={handleDownload}
            handleViewInNewTab={handleViewInNewTab}
          />

          <DocumentCard
            type="resume"
            title="Resume / CV"
            icon={FileText}
            filename={student.resume_name}
            filesize={student.resume_size}
            uploadDate={student.resume_uploaded_at}
            fileUrl={student.resume_url}
            feedback={feedback.resume}
            isEditing={isEditing.resume}
            draft={draft.resume}
            isSaving={isSaving.resume}
            onEdit={() => handleEditFeedback('resume')}
            onSave={() => handleSaveFeedback('resume')}
            onDelete={() => handleDeleteFeedback('resume')}
            onCancel={() => handleCancelEdit('resume')}
            onDraftChange={(value) => setDraft(prev => ({ ...prev, resume: value }))}
            onStatusToggle={() => handleStatusToggle('resume')}
            formatDate={formatDate}
            formatFileSize={formatFileSize}
            handleDownload={handleDownload}
            handleViewInNewTab={handleViewInNewTab}
          />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Student ID</p>
              <p className="font-mono text-sm text-gray-800 break-all">{student.user_id}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Full Name</p>
              <p className="font-semibold text-gray-800">{student.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDocumentsPage;