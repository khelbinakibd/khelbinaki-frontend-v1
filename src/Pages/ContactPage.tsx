import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import api, { getErrorMessage } from '../lib/apiClient';
import { toast } from 'sonner';

type TurfOption = {
  id: string;
  name: string;
};

export default function ContactPage() {
  const [isReportMode, setIsReportMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [turfs, setTurfs] = useState<TurfOption[]>([]);
  const [loadingTurfs, setLoadingTurfs] = useState(false);
  const [turfsError, setTurfsError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    reportType: 'bug',
    turfId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'reportType' && value !== 'turf_issue' ? { turfId: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isReportMode && formData.reportType === 'turf_issue' && !formData.turfId) {
      toast.error('Please select a turf for this report.');
      return;
    }

    try {
      setSubmitting(true);
      if (isReportMode) {
        await api.post('/report', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject,
          message: formData.message,
          reportType: formData.reportType,
          turfId: formData.reportType === 'turf_issue' ? formData.turfId : undefined,
        });
        toast.success('Report submitted successfully!');
      } else {
        await api.post('/contact', {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        });
        toast.success('Message sent successfully!');
      }
      resetForm();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      reportType: 'bug',
      turfId: ''
    });
  };

  const toggleMode = () => {
    setIsReportMode(!isReportMode);
    resetForm();
  };

  useEffect(() => {
    if (!isReportMode) {
      return;
    }

    if (turfs.length > 0) {
      return;
    }

    let isMounted = true;

    const loadTurfs = async () => {
      try {
        setLoadingTurfs(true);
        setTurfsError(null);

        const response = await api.get('/turfs');
        
        console.log('getting response', response)
        if (!isMounted) {
          return;
        }

        const items = (response.data?.data ?? []) as Array<{ _id: string; name: string }>;
        
        setTurfs(items.map(({ _id, name }) => ({
          id: _id,
          name,
        })));
      } catch (err) {
        if (isMounted) {
          setTurfsError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoadingTurfs(false);
        }
      }
    };

    loadTurfs();

    return () => {
      isMounted = false;
    };
  }, [isReportMode, turfs.length]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="sm:flex  space-y-5 items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isReportMode ? 'Report an Issue' : 'Contact Us'}
              </h1>
              <p className="text-gray-600 text-xs sm:text-base mt-2">
                {isReportMode 
                  ? 'Help us improve by reporting bugs, issues, or concerns'
                  : 'Get in touch with our team - we\'d love to hear from you'
                }
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${!isReportMode ? 'text-emerald-600' : 'text-gray-500'}`}>
                Contact
              </span>
              <button
                onClick={toggleMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  isReportMode ? 'bg-red-500' : 'bg-emerald-500'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isReportMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${isReportMode ? 'text-red-600' : 'text-gray-500'}`}>
                Report
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="">      
          {/* Contact Form */}
          <div className="">
            <form className="bg-white rounded-2xl shadow-lg p-8" onSubmit={handleSubmit}>
              <div className="space-y-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none hover:border-gray-300"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none hover:border-gray-300"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone (Contact Mode) */}
                {!isReportMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none hover:border-gray-300"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                )}

                {/* Report Type (Report Mode) */}
                {isReportMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Report Type
                    </label>
                    <div className="relative">
                      <select
                        name="reportType"
                        value={formData.reportType}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-200 outline-none hover:border-gray-300"
                      >
                        <option value="bug">Bug Report</option>
                        <option value="turf_issue">Turf Issue / Complaint</option>
                        <option value="website">Website Feedback</option>
                        <option value="security">Security Issue</option>
                        <option value="abuse">Report Abuse</option>
                        <option value="privacy">Privacy Concern</option>
                        <option value="other">Other Issue</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Turf Selection - Only for Turf Issues */}
                {isReportMode && formData.reportType === 'turf_issue' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Turf {turfs.length > 0 && `(${turfs.length} available)`}
                    </label>
                    <div className="relative">
                      <select
                        name="turfId"
                        value={formData.turfId}
                        onChange={handleChange}
                        required
                        disabled={loadingTurfs || turfs.length === 0}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-200 outline-none hover:border-gray-300 disabled:opacity-60"
                      >
                        <option value="">{loadingTurfs ? 'Loading turfs...' : turfs.length === 0 ? 'No turfs available' : 'Select a turf'}</option>
                        {turfs.map((turf) => (
                          <option key={turf.id} value={turf.id}>
                            {turf.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {turfsError && (
                      <p className="text-sm text-red-500">{turfsError}</p>
                    )}
                    {!loadingTurfs && turfs.length === 0 && !turfsError && (
                      <p className="text-sm text-gray-500">No turfs available at the moment.</p>
                    )}
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none hover:border-gray-300"
                      placeholder={isReportMode ? "Brief description of the issue" : "What can we help you with?"}
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isReportMode ? 'Issue Details' : 'Message'}
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 outline-none hover:border-gray-300 resize-none"
                      placeholder={isReportMode ? "Please provide as much detail as possible about the issue you're experiencing..." : "Tell us more about your inquiry..."}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    {isReportMode 
                      ? "We'll investigate your report within 24-48 hours"
                      : "We typically respond within 2-4 hours"
                    }
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex text-sm sm:text-base items-center px-4 py-2 sm:px-8 sm:py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 ${
                      isReportMode 
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none`}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? 'Submitting...' : (isReportMode ? 'Submit Report' : 'Send Message')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
