import { useEffect, useState } from 'react';
import { Eye, AlertCircle, Bug, Shield, Flag, Lock, HelpCircle, Globe, AlertTriangle } from 'lucide-react';
import api, { getErrorMessage } from '../../lib/apiClient';
import Loader from '../../Components/Loader';

// Define types
interface Report {
  id: string;
  name: string;
  email: string;
  reportType: 'bug' | 'security' | 'abuse' | 'privacy' | 'other' | 'website' | 'turf_issue';
  subject: string;
  message: string;
  date: string;
  time: string;
  status: 'pending' | 'resolved';
  turfId?: string;
  turfName?: string;
}

type ReportType = 'bug' | 'security' | 'abuse' | 'privacy' | 'other' | 'website' | 'turf_issue';

export default function AdminTurfReport() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; data: Report[] }>("/admin/reports");
      setReports(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'bug': return <Bug className="w-5 h-5 text-orange-500" />;
      case 'turf_issue': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'website': return <Globe className="w-5 h-5 text-emerald-500" />;
      case 'security': return <Shield className="w-5 h-5 text-red-500" />;
      case 'abuse': return <Flag className="w-5 h-5 text-red-600" />;
      case 'privacy': return <Lock className="w-5 h-5 text-blue-500" />;
      case 'other': return <HelpCircle className="w-5 h-5 text-gray-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getReportTypeBadge = (type: ReportType): string => {
    const badges: Record<ReportType, string> = {
      bug: 'bg-orange-100 text-orange-700 border-orange-200',
      turf_issue: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      website: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      security: 'bg-red-100 text-red-700 border-red-200',
      abuse: 'bg-red-100 text-red-800 border-red-200',
      privacy: 'bg-blue-100 text-blue-700 border-blue-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return badges[type] || badges.other;
  };

  const getReportTypeLabel = (type: ReportType): string => {
    const labels: Record<ReportType, string> = {
      bug: 'Bug Report',
      turf_issue: 'Turf Issue',
      website: 'Website Feedback',
      security: 'Security Issue',
      abuse: 'Report Abuse',
      privacy: 'Privacy Concern',
      other: 'Other Issue'
    };
    return labels[type] || 'Unknown';
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="my-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3 tracking-tight">
            Manage Reports
          </h1>
          <p className="text-gray-600 text-base">
            Monitor and manage reports for your assigned turfs.
          </p>
        </div>

        {loading && <Loader/>}
        {error && <p className="text-center py-8 text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Turf</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-lg font-medium">No reports found</p>
                        <p className="text-gray-400 text-sm mt-1">All reports have been handled or no turfs assigned</p>
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">#{report.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-gray-900">{report.name}</div>
                            <div className="text-sm text-gray-500">{report.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getReportTypeIcon(report.reportType)}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getReportTypeBadge(report.reportType)}`}>
                              {getReportTypeLabel(report.reportType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {report.reportType === 'turf_issue' ? report.turfName || 'Turf not specified' : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{report.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{report.date}</div>
                            <div className="text-sm text-gray-500">{report.time}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">View</span>
                            </button>
                          
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getReportTypeIcon(selectedReport.reportType)}
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getReportTypeBadge(selectedReport.reportType)}`}>
                  {getReportTypeLabel(selectedReport.reportType)}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">Reporter Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.email}</span>
                  </div>
                  {selectedReport.reportType === 'turf_issue' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turf:</span>
                      <span className="font-semibold text-gray-900">{selectedReport.turfName || 'Turf not specified'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold text-gray-900">{selectedReport.time}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Subject</h3>
                <p className="text-gray-900 font-medium text-lg">{selectedReport.subject}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Message Details</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedReport.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
