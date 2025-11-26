"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Lock,
  MessageSquare,
  Edit3,
  Save,
  X,
  Clock,
  Check,
} from "lucide-react"
import { supabase } from "../../../../../lib/supabase"

interface UploadedFile {
  name: string
  size: number
  uploadDate: string
  url: string
}

interface StudentDocument {
  id: string
  user_id: string
  username: string

  // Academic Documents (JSONB arrays)
  tenth_marksheets: UploadedFile[]
  twelfth_marksheets: UploadedFile[]
  graduation_docs: UploadedFile[]
  pg_docs: UploadedFile[]

  // Application Documents (JSONB arrays with verification)
  lor_docs: UploadedFile[]
  lor_feedback: string | null
  lor_feedback_updated_at: string | null
  lor_feedback_by: string | null
  lor_status: boolean

  sop_docs: UploadedFile[]
  sop_feedback: string | null
  sop_feedback_updated_at: string | null
  sop_feedback_by: string | null
  sop_status: boolean

  // Identity Documents (JSONB arrays with verification)
  passport_docs: UploadedFile[]
  passport_feedback: string | null
  passport_feedback_updated_at: string | null
  passport_feedback_by: string | null
  passport_status: boolean

  resume_docs: UploadedFile[]
  other_docs: UploadedFile[]

  created_at: string
  updated_at: string
}

interface DocumentFeedback {
  text: string
  updatedAt: string | null
  commentBy: string | null
  status: boolean
}

interface FeedbackState {
  lor: DocumentFeedback
  sop: DocumentFeedback
  passport: DocumentFeedback
}

interface EditingState {
  lor: boolean
  sop: boolean
  passport: boolean
}

interface DraftState {
  lor: string
  sop: string
  passport: string
}

type DocumentType = "lor" | "sop" | "passport"

interface DocumentCardProps {
  type: string
  title: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  files: UploadedFile[]
  feedback?: DocumentFeedback
  isEditing?: boolean
  draft?: string
  isSaving?: boolean
  onEdit?: () => void
  onSave?: () => void
  onDelete?: () => void
  onCancel?: () => void
  onDraftChange?: (value: string) => void
  onStatusToggle?: () => void
  hasVerification?: boolean
  formatDate: (date: string | null) => string
  formatFileSize: (size: number | null) => string
  handleDownload: (url: string | null, filename: string | null) => void
  handleViewInNewTab: (url: string | null) => void
}

const StudentDocumentsPage = () => {
  const params = useParams()
  const router = useRouter()

  const userId = params.username as string

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [student, setStudent] = useState<StudentDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackState>({
    lor: { text: "", updatedAt: null, commentBy: null, status: false },
    sop: { text: "", updatedAt: null, commentBy: null, status: false },
    passport: { text: "", updatedAt: null, commentBy: null, status: false },
  })
  const [isEditing, setIsEditing] = useState<EditingState>({
    lor: false,
    sop: false,
    passport: false,
  })
  const [draft, setDraft] = useState<DraftState>({
    lor: "",
    sop: "",
    passport: "",
  })
  const [isSaving, setIsSaving] = useState<EditingState>({
    lor: false,
    sop: false,
    passport: false,
  })

  useEffect(() => {
    const isAuth = sessionStorage.getItem("agency_authenticated") === "true"
    setIsAuthenticated(isAuth)
    setCheckingAuth(false)

    if (!isAuth) {
      router.push("/agency/dashboard")
    }
  }, [router])

  useEffect(() => {
    if (isAuthenticated && userId && !checkingAuth) {
      fetchStudentDocuments()
    }
  }, [isAuthenticated, userId, checkingAuth])

  const fetchStudentDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase.from("student_documents").select("*").eq("user_id", userId)

      if (fetchError) {
        console.error("❌ Fetch error:", fetchError)
        setError("Failed to load student documents")
        return
      }

      if (!data || data.length === 0) {
        setError("Student not found")
        return
      }

      setStudent(data[0])

      setFeedback({
        lor: {
          text: data[0].lor_feedback || "",
          updatedAt: data[0].lor_feedback_updated_at,
          commentBy: data[0].lor_feedback_by,
          status: data[0].lor_status || false,
        },
        sop: {
          text: data[0].sop_feedback || "",
          updatedAt: data[0].sop_feedback_updated_at,
          commentBy: data[0].sop_feedback_by,
          status: data[0].sop_status || false,
        },
        passport: {
          text: data[0].passport_feedback || "",
          updatedAt: data[0].passport_feedback_updated_at,
          commentBy: data[0].passport_feedback_by,
          status: data[0].passport_status || false,
        },
      })
    } catch (err) {
      console.error("❌ Error fetching student documents:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "N/A"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Not uploaded"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = async (url: string | null, filename: string | null) => {
    if (!url || !filename) return

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download error:", err)
      alert("Failed to download file")
    }
  }

  const handleViewInNewTab = (url: string | null) => {
    if (!url) return
    window.open(url, "_blank")
  }

  const handleEditFeedback = (type: DocumentType) => {
    setDraft((prev) => ({ ...prev, [type]: feedback[type].text || "" }))
    setIsEditing((prev) => ({ ...prev, [type]: true }))
  }

  const handleSaveFeedback = async (type: DocumentType) => {
    if (!student) {
      alert("❌ Error: Student data not loaded")
      return
    }

    if (!draft[type].trim()) {
      alert("⚠️ Please enter a comment before saving")
      return
    }

    setIsSaving((prev) => ({ ...prev, [type]: true }))

    try {
      const updatePayload = {
        [`${type}_feedback`]: draft[type].trim(),
        [`${type}_feedback_updated_at`]: new Date().toISOString(),
        [`${type}_feedback_by`]: "Agency Admin",
      }

      const { data: updateData, error: updateError } = await supabase
        .from("student_documents")
        .update(updatePayload)
        .eq("user_id", student.user_id)
        .select()

      if (updateError) {
        console.error("❌ Update error:", updateError)
        throw updateError
      }

      if (!updateData || updateData.length === 0) {
        throw new Error("No rows were updated. Please check permissions.")
      }

      setFeedback((prev) => ({
        ...prev,
        [type]: {
          text: draft[type].trim(),
          updatedAt: new Date().toISOString(),
          commentBy: "Agency Admin",
          status: prev[type].status,
        },
      }))
      setIsEditing((prev) => ({ ...prev, [type]: false }))

      alert("✅ Feedback saved successfully!")
      await fetchStudentDocuments()
    } catch (err) {
      console.error("❌ Error saving feedback:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      alert("❌ Failed to save feedback: " + errorMessage)
    } finally {
      setIsSaving((prev) => ({ ...prev, [type]: false }))
    }
  }

  const handleDeleteFeedback = async (type: DocumentType) => {
    if (!student) return
    if (!confirm(`Are you sure you want to delete ${type.toUpperCase()} feedback?`)) return

    setIsSaving((prev) => ({ ...prev, [type]: true }))

    try {
      const { data, error } = await supabase
        .from("student_documents")
        .update({
          [`${type}_feedback`]: null,
          [`${type}_feedback_updated_at`]: null,
          [`${type}_feedback_by`]: null,
        })
        .eq("user_id", student.user_id)
        .select()

      if (error) {
        console.error("❌ Delete error:", error)
        throw error
      }

      setFeedback((prev) => ({
        ...prev,
        [type]: { text: "", updatedAt: null, commentBy: null, status: prev[type].status },
      }))
      setIsEditing((prev) => ({ ...prev, [type]: false }))

      alert("✅ Feedback deleted successfully!")
      await fetchStudentDocuments()
    } catch (err) {
      console.error("❌ Error deleting feedback:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      alert("❌ Failed to delete feedback: " + errorMessage)
    } finally {
      setIsSaving((prev) => ({ ...prev, [type]: false }))
    }
  }

  const handleCancelEdit = (type: DocumentType) => {
    setIsEditing((prev) => ({ ...prev, [type]: false }))
    setDraft((prev) => ({ ...prev, [type]: "" }))
  }

  const handleStatusToggle = async (type: DocumentType) => {
    if (!student) return

    const newStatus = !feedback[type].status

    try {
      const { error } = await supabase
        .from("student_documents")
        .update({ [`${type}_status`]: newStatus })
        .eq("user_id", student.user_id)

      if (error) {
        console.error("❌ Status update error:", error)
        throw error
      }

      setFeedback((prev) => ({
        ...prev,
        [type]: { ...prev[type], status: newStatus },
      }))

      alert(`✅ Document ${newStatus ? "verified" : "unverified"} successfully!`)
      await fetchStudentDocuments()
    } catch (err) {
      console.error("❌ Error updating status:", err)
      alert("❌ Failed to update verification status")
    }
  }

  if (checkingAuth) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view student documents</p>
          <button
            onClick={() => router.push("/agency/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-xl text-red-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          Loading student documents...
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <XCircle className="mx-auto text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || "Student Not Found"}</h2>
          <p className="text-gray-600 mb-6">Unable to load student documents. Please try again.</p>
          <button
            onClick={() => router.push("/agency/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all font-semibold flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const allRequiredDocsUploaded =
    student.tenth_marksheets?.length > 0 &&
    student.twelfth_marksheets?.length > 0 &&
    student.lor_docs?.length > 0 &&
    student.sop_docs?.length > 0 &&
    student.passport_docs?.length > 0

  const DocumentCard: React.FC<DocumentCardProps> = ({
    type,
    title,
    icon: Icon,
    files,
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
    hasVerification = false,
    formatDate,
    formatFileSize,
    handleDownload,
    handleViewInNewTab,
  }) => {
    const hasFiles = files && files.length > 0
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
      if (isEditing && textareaRef.current) {
        const textarea = textareaRef.current
        const length = textarea.value.length
        textarea.focus()
        textarea.setSelectionRange(length, length)
      }
    }, [isEditing])

    return (
      <div
        className={`bg-white rounded-xl shadow-lg p-6 border-2 ${hasFiles ? "border-green-200" : "border-gray-200"}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                hasFiles ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gray-200"
              }`}
            >
              <Icon className={hasFiles ? "text-white" : "text-gray-500"} size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className={`text-sm ${hasFiles ? "text-green-600" : "text-gray-500"}`}>
                {hasFiles ? `${files.length} file(s) uploaded` : "Not uploaded"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasFiles && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <CheckCircle size={16} />
                {files.length}/5
              </div>
            )}
            {hasVerification && feedback?.status && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <Check size={16} />
                Verified
              </div>
            )}
          </div>
        </div>

        {hasFiles ? (
          <div className="space-y-4">
            {/* Files List */}
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadDate)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewInNewTab(file.url)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-1 text-sm"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownload(file.url, file.name)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center gap-1 text-sm"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Button */}
            {hasVerification && (
              <button
                onClick={onStatusToggle}
                className={`w-full px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  feedback?.status
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Check size={18} />
                {feedback?.status ? "Verified" : "Mark as Verified"}
              </button>
            )}

            {/* Feedback Section */}
            {hasVerification && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Agency Feedback</h4>
                      {feedback?.text && feedback?.updatedAt && (
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
                        {feedback?.text ? "Edit" : "Add"}
                      </button>
                      {feedback?.text && (
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

                {!isEditing && feedback?.text ? (
                  <div className="bg-white border border-purple-200 rounded-lg p-3">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{feedback.text}</p>
                  </div>
                ) : !isEditing && !feedback?.text ? (
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
                      onChange={(e) => onDraftChange?.(e.target.value)}
                      placeholder="Enter your feedback here..."
                      rows={6}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={onSave}
                        disabled={isSaving || !draft?.trim()}
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
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <XCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-600">No documents uploaded yet</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <button
            onClick={() => router.push("/agency/dashboard")}
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{student.username}</h1>
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
            <div
              className={`px-4 py-2 rounded-lg font-semibold ${
                allRequiredDocsUploaded ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
              }`}
            >
              {allRequiredDocsUploaded ? "✓ Complete" : "⚠ Incomplete"}
            </div>
          </div>
        </div>

        {/* Application Status Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Application Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                student.tenth_marksheets?.length > 0 ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {student.tenth_marksheets?.length > 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">10th Grade</span>
              </div>
              <p className={`text-sm ${student.tenth_marksheets?.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {student.tenth_marksheets?.length || 0} file(s)
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                student.twelfth_marksheets?.length > 0 ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {student.twelfth_marksheets?.length > 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">12th Grade</span>
              </div>
              <p className={`text-sm ${student.twelfth_marksheets?.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {student.twelfth_marksheets?.length || 0} file(s)
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                student.graduation_docs?.length > 0 ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {student.graduation_docs?.length > 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">Graduation</span>
              </div>
              <p className={`text-sm ${student.graduation_docs?.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {student.graduation_docs?.length || 0} file(s)
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                student.lor_docs?.length > 0 ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {student.lor_docs?.length > 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">LOR</span>
              </div>
              <p className={`text-sm ${student.lor_docs?.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {student.lor_docs?.length || 0} file(s)
                {feedback.lor.status && " • Verified"}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                student.sop_docs?.length > 0 ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {student.sop_docs?.length > 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">SOP</span>
              </div>
              <p className={`text-sm ${student.sop_docs?.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {student.sop_docs?.length || 0} file(s)
                {feedback.sop.status && " • Verified"}
              </p>
            </div>

            <div
              className={`p-4 rounded-lg border-2 ${
                student.passport_docs?.length > 0 ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {student.passport_docs?.length > 0 ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span className="font-semibold text-gray-800">Passport</span>
              </div>
              <p className={`text-sm ${student.passport_docs?.length > 0 ? "text-green-600" : "text-gray-500"}`}>
                {student.passport_docs?.length || 0} file(s)
                {feedback.passport.status && " • Verified"}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Documents Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-red-600" size={24} />
            Academic Marksheets
          </h2>
          <div className="space-y-4">
            <DocumentCard
              type="tenth"
              title="10th Grade Marksheet"
              icon={FileText}
              files={student.tenth_marksheets || []}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />

            <DocumentCard
              type="twelfth"
              title="12th Grade Marksheet"
              icon={FileText}
              files={student.twelfth_marksheets || []}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />

            <DocumentCard
              type="graduation"
              title="Graduation Degree / Marksheets"
              icon={FileText}
              files={student.graduation_docs || []}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />

            <DocumentCard
              type="pg"
              title="Postgraduate Degree / Marksheets"
              icon={FileText}
              files={student.pg_docs || []}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />
          </div>
        </div>

        {/* Application Documents Section (with Verification) */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="text-red-600" size={24} />
            Application Documents (Verified)
          </h2>
          <div className="space-y-4">
            <DocumentCard
              type="lor"
              title="Letter of Recommendation (LOR)"
              icon={FileText}
              files={student.lor_docs || []}
              hasVerification={true}
              feedback={feedback.lor}
              isEditing={isEditing.lor}
              draft={draft.lor}
              isSaving={isSaving.lor}
              onEdit={() => handleEditFeedback("lor")}
              onSave={() => handleSaveFeedback("lor")}
              onDelete={() => handleDeleteFeedback("lor")}
              onCancel={() => handleCancelEdit("lor")}
              onDraftChange={(value) => setDraft((prev) => ({ ...prev, lor: value }))}
              onStatusToggle={() => handleStatusToggle("lor")}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />

            <DocumentCard
              type="sop"
              title="Statement of Purpose (SOP)"
              icon={FileText}
              files={student.sop_docs || []}
              hasVerification={true}
              feedback={feedback.sop}
              isEditing={isEditing.sop}
              draft={draft.sop}
              isSaving={isSaving.sop}
              onEdit={() => handleEditFeedback("sop")}
              onSave={() => handleSaveFeedback("sop")}
              onDelete={() => handleDeleteFeedback("sop")}
              onCancel={() => handleCancelEdit("sop")}
              onDraftChange={(value) => setDraft((prev) => ({ ...prev, sop: value }))}
              onStatusToggle={() => handleStatusToggle("sop")}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />
          </div>
        </div>

        {/* Identity & Supporting Documents Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="text-red-600" size={24} />
            Identity & Supporting Documents
          </h2>
          <div className="space-y-4">
            <DocumentCard
              type="passport"
              title="Passport"
              icon={FileText}
              files={student.passport_docs || []}
              hasVerification={true}
              feedback={feedback.passport}
              isEditing={isEditing.passport}
              draft={draft.passport}
              isSaving={isSaving.passport}
              onEdit={() => handleEditFeedback("passport")}
              onSave={() => handleSaveFeedback("passport")}
              onDelete={() => handleDeleteFeedback("passport")}
              onCancel={() => handleCancelEdit("passport")}
              onDraftChange={(value) => setDraft((prev) => ({ ...prev, passport: value }))}
              onStatusToggle={() => handleStatusToggle("passport")}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />

            <DocumentCard
              type="resume"
              title="Resume / CV"
              icon={FileText}
              files={student.resume_docs || []}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />

            <DocumentCard
              type="other"
              title="Other Documents"
              icon={FileText}
              files={student.other_docs || []}
              formatDate={formatDate}
              formatFileSize={formatFileSize}
              handleDownload={handleDownload}
              handleViewInNewTab={handleViewInNewTab}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDocumentsPage
