"use client";
import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Trash2, 
  BookOpen, 
  Award, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Globe, 
  DollarSign,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import DefaultLayout from '../defaultLayout';

interface Course {
  id: number;
  University: string | null;
  'Program Name': string | null;
  Concentration: string | null;
  'Website URL': string | null;
  Campus: string | null;
  Country: string | null;
  'Study Level': string | null;
  Duration: string | null;
  'Open Intakes': string | null;
  'Yearly Tuition Fees': string | null;
  'Scholarship Available': string | null;
  'IELTS Score': string | null;
  'TOEFL Score': string | null;
  'Entry Requirements': string | null;
}

interface Scholarship {
  id: number;
  country_region: string;
  scholarship_name: string;
  provider: string;
  degree_level: string;
  deadline: string;
  detailed_eligibility: string;
  link: string;
}

interface ShortlistItem {
  id: number;
  user_id: string;
  item_type: 'course' | 'scholarship';
  course_id: number | null;
  scholarship_id: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  scholarship?: Scholarship;
}

const ShortlistBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'scholarships'>('courses');
  const [shortlistItems, setShortlistItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchShortlistItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShortlistItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: shortlistData, error: shortlistError } = await supabase
        .from('shortlist_builder')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (shortlistError) throw shortlistError;

      const itemsWithDetails = await Promise.all(
        (shortlistData || []).map(async (item) => {
          if (item.item_type === 'course' && item.course_id) {
            const { data: courseData } = await supabase
              .from('courses')
              .select('*')
              .eq('id', item.course_id)
              .single();
            
            return { ...item, course: courseData };
          } else if (item.item_type === 'scholarship' && item.scholarship_id) {
            const { data: scholarshipData } = await supabase
              .from('scholarship')
              .select('*')
              .eq('id', item.scholarship_id)
              .single();
            
            return { ...item, scholarship: scholarshipData };
          }
          return item;
        })
      );

      setShortlistItems(itemsWithDetails);
    } catch (err) {
      console.error('Error fetching shortlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shortlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (itemId: number) => {
    if (!confirm('Are you sure you want to remove this item from your shortlist?')) return;

    try {
      const { error } = await supabase
        .from('shortlist_builder')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setShortlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    }
  };

  const updateStatus = async (itemId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shortlist_builder')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setShortlistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const updateNotes = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from('shortlist_builder')
        .update({ notes: noteText, updated_at: new Date().toISOString() })
        .eq('id', itemId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setShortlistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, notes: noteText, updated_at: new Date().toISOString() } : item
        )
      );
      
      setEditingNotes(null);
      setNoteText('');
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes. Please try again.');
    }
  };

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website";
    
    if (dateString.toLowerCase().includes("varies") || 
        dateString.toLowerCase().includes("rolling") ||
        dateString.toLowerCase().includes("typically")) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      interested: { color: 'bg-blue-100 text-blue-700', icon: <Heart size={14} />, label: 'Interested' },
      applied: { color: 'bg-purple-100 text-purple-700', icon: <CheckCircle size={14} />, label: 'Applied' },
      accepted: { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} />, label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-700', icon: <X size={14} />, label: 'Rejected' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={14} />, label: 'Pending' },
    };

    const config = statusConfig[status] || statusConfig.interested;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const filteredItems = shortlistItems.filter(item => {
    if (activeTab === 'courses' && item.item_type !== 'course') return false;
    if (activeTab === 'scholarships' && item.item_type !== 'scholarship') return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const courseCount = shortlistItems.filter(item => item.item_type === 'course').length;
  const scholarshipCount = shortlistItems.filter(item => item.item_type === 'scholarship').length;

  if (!user) {
    return (
      <DefaultLayout>
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
              <p className="text-gray-600">Please login to view your shortlist</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-red-600 mb-2 flex items-center gap-3">
              <Heart size={36} />
              My Shortlist
            </h1>
            <p className="text-gray-600">
              Manage your saved courses and scholarships in one place
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'courses'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <GraduationCap size={20} />
                  Courses
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'courses' ? 'bg-white text-red-600' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {courseCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('scholarships')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'scholarships'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Award size={20} />
                  Scholarships
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'scholarships' ? 'bg-white text-red-600' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {scholarshipCount}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="all">All</option>
                  <option value="interested">Interested</option>
                  <option value="applied">Applied</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p>Loading your shortlist...</p>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No {activeTab} in your shortlist yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start exploring and save items you're interested in
                </p>
                <div className="flex gap-4 justify-center">
                  <a
                    href="/course-finder"
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    <GraduationCap size={20} />
                    Browse Courses
                  </a>
                  <a
                    href="/scholarship-finder"
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    <Award size={20} />
                    Browse Scholarships
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    {item.item_type === 'course' && item.course ? (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <GraduationCap className="text-red-600 flex-shrink-0 mt-1" size={24} />
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                  {item.course['Program Name'] || 'Unknown Program'}
                                </h3>
                                <p className="text-gray-600 text-sm font-medium">
                                  {item.course.University}
                                </p>
                                {item.course.Concentration && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">Concentration:</span> {item.course.Concentration}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getStatusBadge(item.status)}
                              {item.course['Study Level'] && (
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                  {item.course['Study Level']}
                                </span>
                              )}
                              {item.course['Scholarship Available'] === 'Yes' && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                  <Sparkles size={12} />
                                  Scholarship Available
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromShortlist(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <MapPin size={12} />
                              <span>Campus</span>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">{item.course.Campus || 'N/A'}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Globe size={12} />
                              <span>Country</span>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">{item.course.Country || 'N/A'}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar size={12} />
                              <span>Duration</span>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">{item.course.Duration || 'N/A'}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <DollarSign size={12} />
                              <span>Tuition</span>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">
                              {item.course['Yearly Tuition Fees'] || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          >
                            <option value="interested">Interested</option>
                            <option value="applied">Applied</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <FileText size={14} />
                              Notes
                            </label>
                            {editingNotes !== item.id && (
                              <button
                                onClick={() => {
                                  setEditingNotes(item.id);
                                  setNoteText(item.notes || '');
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                {item.notes ? 'Edit' : 'Add Note'}
                              </button>
                            )}
                          </div>
                          {editingNotes === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateNotes(item.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNoteText('');
                                  }}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                              {item.notes || 'No notes added yet'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {item.course['Website URL'] && (
                            <a
                              href={item.course['Website URL'].startsWith('http') 
                                ? item.course['Website URL'] 
                                : `https://${item.course['Website URL']}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                            >
                              <BookOpen size={16} />
                              View Details
                            </a>
                          )}
                          <span className="text-xs text-gray-500">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : item.item_type === 'scholarship' && item.scholarship ? (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <Award className="text-red-600 flex-shrink-0 mt-1" size={24} />
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">
                                  {item.scholarship.scholarship_name}
                                </h3>
                                <p className="text-gray-600 text-sm font-medium">
                                  {item.scholarship.provider}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getStatusBadge(item.status)}
                              {item.scholarship.degree_level && (
                                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                                  {item.scholarship.degree_level}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromShortlist(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <MapPin size={12} />
                              <span>Country</span>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">
                              {item.scholarship.country_region}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                              <Calendar size={12} />
                              <span>Deadline</span>
                            </div>
                            <p className="font-medium text-gray-800 text-sm">
                              {formatDeadline(item.scholarship.deadline)}
                            </p>
                          </div>
                        </div>

                        {item.scholarship.detailed_eligibility && (
                          <div className="mb-4 bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-700 mb-1">Eligibility</p>
                            <p className="text-sm text-gray-600">{item.scholarship.detailed_eligibility}</p>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Application Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          >
                            <option value="interested">Interested</option>
                            <option value="applied">Applied</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                              <FileText size={14} />
                              Notes
                            </label>
                            {editingNotes !== item.id && (
                              <button
                                onClick={() => {
                                  setEditingNotes(item.id);
                                  setNoteText(item.notes || '');
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                {item.notes ? 'Edit' : 'Add Note'}
                              </button>
                            )}
                          </div>
                          {editingNotes === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateNotes(item.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNoteText('');
                                  }}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                              {item.notes || 'No notes added yet'}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {item.scholarship.link && (
                            <a
                              href={item.scholarship.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                            >
                              <ExternalLink size={16} />
                              Apply Now
                            </a>
                          )}
                          <span className="text-xs text-gray-500">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ShortlistBuilder;