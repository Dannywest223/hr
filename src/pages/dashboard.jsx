import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, authHeader, getToken } from '../utils/auth'; // ✅ add this



import {
  Home,
  Briefcase,
  Users,
  FileText,
  Calendar,
  Search,
  Plus,
  User,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Award,
  Target,
  UserCheck,
  Code,
  Menu,
  X,
  LogOut,
  Download,
  Trash2
} from 'lucide-react';
import axios from 'axios';

// Candidate Modal Component


// Update your AddCandidateModal component

const AddCandidateModal = ({ show, onClose, onSubmit, jobs }) => {
  const [candidate, setCandidate] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    appliedJobs: [], // Will contain job _id strings
    experience: [], // Will contain experience objects with 'years' field
    resume: null,
    coverLetter: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableJobs = jobs || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!candidate.firstName || !candidate.lastName || !candidate.email) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }


    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidate.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 Submitting candidate:', candidate);

      // Ensure appliedJobs is an array of non-empty strings
      const appliedJobIds = candidate.appliedJobs.filter(id => id?.trim());

      if (appliedJobIds.length === 0) {
        alert('Please select at least one job');
        setIsSubmitting(false);
        return;
      }

      // Create FormData
      const formData = new FormData();

      console.log('🔥 candidate.appliedJobs before appending:', candidate.appliedJobs);


      // Basic fields
      formData.append('firstName', candidate.firstName.trim());
      formData.append('lastName', candidate.lastName.trim());
      formData.append('email', candidate.email.trim());
      formData.append('phone', candidate.phone.trim());

      // ✅ Fix: add job IDs as clean JSON string
      formData.append('appliedJobs', JSON.stringify(appliedJobIds));

      // ✅ Experience (already fine)
      formData.append('experience', JSON.stringify(candidate.experience));

      // Files
      if (candidate.resume) {
        formData.append('resume', candidate.resume);
      }

      if (candidate.coverLetter) {
        formData.append('coverLetter', candidate.coverLetter);
      }

      // Debug logs
      console.log('✅ Applied Jobs:', appliedJobIds);
      console.log('✅ Experience:', candidate.experience);

      // Submit to parent or API
      await onSubmit(formData);

      // Reset form
      setCandidate({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        appliedJobs: [],
        experience: [],
        resume: null,
        coverLetter: null
      });

    } catch (error) {
      console.error('❌ Error submitting candidate:', error);
      alert('Error submitting candidate: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, DOC, and DOCX files are allowed');
        e.target.value = '';
        return;
      }

      setCandidate(prev => ({
        ...prev,
        [fieldName]: file
      }));
    } else {
      setCandidate(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  // Handle job selection
  const handleJobSelection = (jobId) => {
    setCandidate(prev => {
      const jobIdStr = jobId.toString();
      const newAppliedJobs = prev.appliedJobs.some(id => id.toString() === jobIdStr)
        ? prev.appliedJobs.filter(id => id.toString() !== jobIdStr)
        : [...prev.appliedJobs, jobIdStr];

      console.log('🗂️ Updated appliedJobs:', newAppliedJobs);

      return {
        ...prev,
        appliedJobs: newAppliedJobs
      };
    });
  };


  // Experience management - CORRECTED to use 'years' field to match backend
  const addExperience = () => {
    setCandidate(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        years: '' // Using 'years' to match your backend schema
      }]
    }));
  };

  const removeExperience = (index) => {
    setCandidate(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setCandidate(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Candidate</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={candidate.firstName}
                onChange={(e) => setCandidate(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={candidate.lastName}
                onChange={(e) => setCandidate(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email *
            </label>
            <input
              type="email"
              value={candidate.email}
              onChange={(e) => setCandidate(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={candidate.phone}
              onChange={(e) => setCandidate(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Applied Jobs
            </label>
            {availableJobs.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableJobs.map((job) => (
                  <label key={job._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={candidate.appliedJobs.includes(job._id)}
                      onChange={() => handleJobSelection(job._id)}
                      className="rounded"
                    />
                    <span className="text-sm">{job.title}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No jobs available</p>
            )}
          </div>

          {/* Experience Section - CORRECTED to use 'years' field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Work Experience
              </label>
              <button
                type="button"
                onClick={addExperience}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Experience
              </button>
            </div>

            {candidate.experience.map((exp, index) => (
              <div key={index} className="border rounded-md p-3 mb-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Years of experience (e.g., 2 years, 2020-2022)"
                  value={exp.years}
                  onChange={(e) => handleExperienceChange(index, 'years', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm mb-2"
                />
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove Experience
                </button>
              </div>
            ))}
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Resume
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'resume')}
                accept=".pdf,.doc,.docx"
                className="w-full p-2 border rounded-md"
              />
              {candidate.resume && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {candidate.resume.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cover Letter
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'coverLetter')}
                accept=".pdf,.doc,.docx"
                className="w-full p-2 border rounded-md"
              />
              {candidate.coverLetter && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {candidate.coverLetter.name}
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};













// Meeting Modal Component
const AddMeetingModal = ({ show, onClose, onSubmit, candidates, jobs }) => {
  const [meeting, setMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 30,
    candidateId: '',
    jobId: '',
    notes: ''
  });

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Schedule Meeting</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(meeting); }}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={meeting.title}
              onChange={(e) => setMeeting({ ...meeting, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={meeting.date}
                onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={meeting.time}
                onChange={(e) => setMeeting({ ...meeting, time: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              min="15"
              step="15"
              value={meeting.duration}
              onChange={(e) => setMeeting({ ...meeting, duration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
            <select
              value={meeting.candidateId}
              onChange={(e) => setMeeting({ ...meeting, candidateId: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Candidate</option>
              {candidates.map(candidate => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.firstName} {candidate.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
            <select
              value={meeting.jobId}
              onChange={(e) => setMeeting({ ...meeting, jobId: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Job (Optional)</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={meeting.notes}
              onChange={(e) => setMeeting({ ...meeting, notes: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


import { useRef, useCallback } from 'react'; // Add these imports


export default function Dashboard() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');

  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);


  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    // Debounce the search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
        
        if (response.data.success) {
          setSearchResults(response.data.results);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms delay
  }, []);

  // Function to handle clicking on a search result
  const handleResultClick = (job) => {
    setSelectedJob(job);
    setSelectedJobId(job._id);
    setShowJobModal(true);
  };
  // Highlight matching text function
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="bg-yellow-200 font-semibold">{part}</span> : 
        part
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);















  





  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    positions: 1,
    requirements: ''
  });

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 30,
    candidateId: '',
    jobId: '',
    notes: ''
  });

  // Mock data (replace with API calls)
  const [upcomingMeetings, setUpcomingMeetings] = useState([
    { time: '3:15', candidate: 'Mini Soman', position: 'Mean stack developer, 4th phase interview', duration: '3:15 - 3:45', date: 'Today', variant: 'blue' },
    { time: '10:00', candidate: 'Sarah Johnson', position: 'Frontend Developer, Final interview', duration: '10:00 - 10:30', date: 'Today', variant: 'green' },
    { time: '2:00', candidate: 'Alex Chen', position: 'UI/UX Designer, Portfolio review', duration: '2:00 - 2:45', date: 'Today', variant: 'blue' },
    { time: '4:30', candidate: 'Emily Davis', position: 'Backend Developer, Technical round', duration: '4:30 - 5:00', date: 'Today', variant: 'green' },
    { time: '9:15', candidate: 'John Smith', position: 'Product Manager, Strategy discussion', duration: '9:15 - 10:00', date: 'Tomorrow', variant: 'blue' },
    { time: '11:00', candidate: 'Lisa Wang', position: 'Data Analyst, Case study presentation', duration: '11:00 - 11:45', date: 'Tomorrow', variant: 'green' },
    { time: '3:00', candidate: 'Michael Brown', position: 'DevOps Engineer, System design', duration: '3:00 - 3:30', date: 'Tomorrow', variant: 'blue' },
    { time: '5:15', candidate: 'Jessica Taylor', position: 'QA Engineer, Process review', duration: '5:15 - 5:45', date: 'Tomorrow', variant: 'green' },
  ]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);
  

  // Updated dashboard functions - replace your existing functions with these

  // Fixed fetchCandidates function
  // Enhanced Debug Version of Candidate Handlers

  const fetchCandidates = async () => {
    try {
      console.log('🔍 Fetching candidates...');
      const token = getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/candidates', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('📊 Raw API Response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        console.log(`✅ Fetched ${result.candidates.length} candidates`);

        // Quick summary first
        console.log('=== QUICK SUMMARY ===');
        result.candidates.forEach((candidate, index) => {
          const appliedJobsInfo = candidate.appliedJobs?.map(job => {
            // Check if job is populated (has title) or just an ObjectId
            if (typeof job === 'string') {
              return `ObjectId: ${job}`;
            } else if (job && typeof job === 'object') {
              if (job.title) {
                return `✅ ${job.title} at ${job.company || 'Unknown Company'}`;
              } else if (job._id) {
                return `⚠️ Unpopulated Job (ID: ${job._id})`;
              } else {
                return `❓ Unknown job object: ${JSON.stringify(job)}`;
              }
            }
            return `❌ Invalid job data: ${job}`;
          });

          console.log(`${index + 1}. ${candidate.firstName} ${candidate.lastName}:`);
          console.log(`   📧 ${candidate.email}`);
          console.log(`   💼 Applied Jobs (${candidate.appliedJobs?.length || 0}):`);
          if (appliedJobsInfo && appliedJobsInfo.length > 0) {
            appliedJobsInfo.forEach(info => console.log(`      ${info}`));
          } else {
            console.log('      ❌ No applied jobs');
          }
          console.log(`   💡 Experience: ${candidate.experience?.length || 0} entries`);
          console.log(''); // Empty line for readability
        });

        // Detailed analysis for first candidate only
        if (result.candidates.length > 0) {
          const firstCandidate = result.candidates[0];
          console.log('=== DETAILED FIRST CANDIDATE ANALYSIS ===');
          console.log('Full candidate object:', JSON.stringify(firstCandidate, null, 2));

          console.log('Applied Jobs detailed analysis:');
          if (firstCandidate.appliedJobs && firstCandidate.appliedJobs.length > 0) {
            firstCandidate.appliedJobs.forEach((job, index) => {
              console.log(`Job ${index + 1}:`, {
                rawValue: job,
                type: typeof job,
                isString: typeof job === 'string',
                isObject: typeof job === 'object' && job !== null,
                hasTitle: job?.title !== undefined,
                hasId: job?._id !== undefined,
                keys: typeof job === 'object' && job !== null ? Object.keys(job) : 'N/A'
              });
            });
          } else {
            console.log('No applied jobs found or empty array');
          }
        }

        // Check for potential issues
        console.log('=== POTENTIAL ISSUES DETECTED ===');
        const issues = [];

        result.candidates.forEach((candidate, index) => {
          // Check if appliedJobs contains unpopulated ObjectIds (strings)
          if (candidate.appliedJobs?.some(job => typeof job === 'string')) {
            issues.push(`Candidate ${index + 1}: appliedJobs contains ObjectId strings (not populated)`);
          }

          // Check if appliedJobs contains objects without titles
          if (candidate.appliedJobs?.some(job => typeof job === 'object' && job && !job.title)) {
            issues.push(`Candidate ${index + 1}: appliedJobs contains objects without job titles`);
          }

          // Check for missing data
          if (!candidate.firstName || !candidate.lastName) {
            issues.push(`Candidate ${index + 1}: Missing name information`);
          }
        });

        if (issues.length > 0) {
          console.warn('🚨 Issues found:');
          issues.forEach(issue => console.warn(`   - ${issue}`));
        } else {
          console.log('✅ No issues detected in candidate data');
        }

        setCandidates(result.candidates || []);

        // Return summary for potential further debugging
        return {
          success: true,
          candidatesCount: result.candidates.length,
          issues: issues,
          sampleCandidate: result.candidates[0] || null
        };
      } else {
        console.error('❌ Failed to fetch candidates:', result.message);
        setCandidates([]);
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('💥 Error fetching candidates:', error);
      setCandidates([]);
      return { success: false, error: error.message };
    }
  };





  // Enhanced Debug Version of Add Candidate
  const handleAddCandidate = async (formData) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('🚀 Submitting candidate to API...');
      console.log('=== FORM DATA ANALYSIS ===');

      // Enhanced FormData logging
      const formDataEntries = {};
      for (let [key, value] of formData.entries()) {
        console.log(`📝 ${key}:`, value);
        formDataEntries[key] = value;

        // Special handling for JSON fields
        if (key === 'appliedJobs' || key === 'experience') {
          try {
            const parsedValue = JSON.parse(value);
            console.log(`  └─ Parsed ${key}:`, parsedValue);
            console.log(`  └─ ${key} Type:`, typeof parsedValue);
            console.log(`  └─ ${key} Is Array:`, Array.isArray(parsedValue));
            console.log(`  └─ ${key} Length:`, parsedValue?.length);

            if (key === 'appliedJobs' && parsedValue.length > 0) {
              console.log('  └─ Applied Jobs Details:', parsedValue);
              parsedValue.forEach((jobId, index) => {
                console.log(`    └─ Job ${index + 1} ID:`, jobId);
              });
            }

            if (key === 'experience' && parsedValue.length > 0) {
              console.log('  └─ Experience Details:', parsedValue);
              parsedValue.forEach((exp, index) => {
                console.log(`    └─ Experience ${index + 1}:`, exp);
              });
            }
          } catch (parseError) {
            console.error(`  └─ ❌ Failed to parse ${key}:`, parseError);
          }
        }
      }

      const response = await fetch('http://localhost:5000/api/candidates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser handle it for FormData
        },
        body: formData
      });

      const result = await response.json();
      console.log('🎯 API Response:', result);

      if (result.success && result.candidate) {
        console.log('✅ Candidate created successfully!');
        console.log('🔍 Created candidate details:', {
          id: result.candidate._id,
          name: `${result.candidate.firstName} ${result.candidate.lastName}`,
          email: result.candidate.email,
          appliedJobsCount: result.candidate.appliedJobs?.length || 0,
          appliedJobsData: result.candidate.appliedJobs,
          experienceCount: result.candidate.experience?.length || 0,
          experienceData: result.candidate.experience
        });
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        console.log('🔄 Refetching candidates...');

        // Refetch all candidates to ensure data consistency
        await fetchCandidates();

        // Close the modal
        setShowAddCandidateModal(false);

        // Show success message
        alert('✅ Candidate added successfully!');

        return result.candidate;
      } else {
        throw new Error(result.message || 'Failed to add candidate');
      }
    } catch (error) {
      console.error('💥 Error adding candidate:', error);

      // Show error message to user
      alert(`❌ Error adding candidate: ${error.message}`);

      // Re-throw the error so the modal knows the submission failed
      throw error;
    }
  };



  // Enhanced Delete Handler (unchanged but with better logging)
  const handleDeleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting candidate:', candidateId);
      const token = getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('🗑️ Delete response:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        // Remove candidate from state
        setCandidates(prevCandidates =>
          prevCandidates.filter(candidate => candidate._id !== candidateId)
        );

        // Show success notification instead of alert
        setSuccessMessage('Candidate deleted successfully!');
        setShowSuccessNotification(true);
        console.log('✅ Candidate deleted successfully');
      } else {
        throw new Error(result.message || 'Failed to delete candidate');
      }
    } catch (error) {
      console.error('💥 Error deleting candidate:', error);
      alert(`❌ Error deleting candidate: ${error.message}`);
    }
  };



  const handleViewProfile = (candidate) => {
    navigate(`/candidate-profile/${candidate._id}`);
  };




  const renderCandidateCard = (candidate) => (
    <div
      key={candidate._id}
      className="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 group"
      onMouseEnter={() => setHoveredCandidate(candidate._id)}
      onMouseLeave={() => setHoveredCandidate(null)}
    >
      {/* Candidate Info */}
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-lg">
            {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {candidate.firstName} {candidate.lastName}
          </h3>
          <p className="text-sm text-gray-500 truncate">{candidate.email}</p>
          {candidate.phone && (
            <p className="text-sm text-gray-500">{candidate.phone}</p>
          )}

          {/* Experience */}
          {candidate.experience && candidate.experience.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Latest Experience:</p>
              <p className="text-sm text-gray-600">
                {candidate.experience[0].position} at {candidate.experience[0].company}
              </p>
              <p className="text-xs text-gray-500">
                {candidate.experience[0].years} years
              </p>
            </div>
          )}

          {/* Applied Jobs Count */}
          <div className="mt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {candidate.appliedJobs?.length || 0} Jobs Applied
            </span>
          </div>

          {/* Date Added */}
          <p className="text-xs text-gray-400 mt-2">
            Added: {new Date(candidate.addedDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Hover Actions */}
      {hoveredCandidate === candidate._id && (
        <div className="absolute top-2 right-2 flex space-x-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
          {/* View Profile Button */}
          <button
            onClick={() => handleViewProfile(candidate)}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-200"
            title="View Profile"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Profile</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCandidate(candidate._id);
            }}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors duration-200"
            title="Delete Candidate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );











  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // ... other existing state variables

  // Success Notification Component - Define inside Dashboard
  const SuccessNotification = ({ show, message, onClose }) => {
    useEffect(() => {
      if (show) {
        // Auto-hide after 3 seconds
        const timer = setTimeout(() => {
          onClose();
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [show, onClose]);

    if (!show) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 pointer-events-auto transform transition-all duration-300 ease-in-out animate-bounce">
          {/* Success Icon */}
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Message */}
          <div className="font-medium">
            {message}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="ml-2 text-green-200 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };






  const [jobsData, setJobsData] = useState([
    {
      _id: '1',
      title: 'Senior Data Analyst',
      daysAgo: '100 days ago',
      positionsLeft: 3,
      applications: 123,
      interviewed: 40,
      rejected: 33,
      feedbackPending: 7,
      offered: 2
    },
    {
      _id: '2',
      title: 'Junior Data Analyst',
      daysAgo: '78 days ago',
      positionsLeft: 7,
      applications: 567,
      interviewed: 22,
      rejected: 20,
      feedbackPending: 2,
      offered: 4
    },
    {
      _id: '3',
      title: 'Product Designer',
      daysAgo: '55 days ago',
      positionsLeft: 2,
      applications: 201,
      interviewed: 32,
      rejected: 18,
      feedbackPending: 14,
      offered: 0
    },
    {
      _id: '4',
      title: 'Java Developer',
      daysAgo: '45 days ago',
      positionsLeft: 5,
      applications: 231,
      interviewed: 23,
      rejected: 10,
      feedbackPending: 13,
      offered: 3
    },
    {
      _id: '5',
      title: 'Product Manager',
      daysAgo: '13 days ago',
      positionsLeft: 3,
      applications: 67,
      interviewed: 41,
      rejected: 22,
      feedbackPending: 19,
      offered: 1
    }
  ]);

  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Briefcase, label: 'Jobs', active: false },
    { icon: Users, label: 'Candidates', active: false },
    { icon: FileText, label: 'Reports', active: false },
    { icon: Calendar, label: 'Calendar', active: false },
  ];

  // Updated Dashboard Component - Candidate Management Section













  const calculateDaysAgo = (dateString) => {
    if (!dateString) return 'Unknown';

    const postDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };



  // Fetch initial data
  useEffect(() => {
    const initDashboard = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (!token) {
          navigate('/login', {
            replace: true,
            state: {
              message: 'Please log in to access the dashboard',
              type: 'info'
            }
          });
          return;
        }

        const userData = getUser();

        if (userData) {
          setUser(userData);
          setLoading(false);
        } else {
          await fetchUserData();
        }

      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setError('Failed to initialize dashboard');
        setLoading(false);
      }
    };

    initDashboard();
  }, [navigate]);

  // Load candidates and jobs data - but only after user is loaded
  useEffect(() => {
    if (user) { // Only fetch when user is available
      fetchCandidates();
      fetchJobs();
    }
  }, [user]); // Depend on user instead of empty array








  // Add these functions after your existing useEffect hooks and before the return statement

  // Job management functions
  // Add these functions after your existing useEffect hooks and before the return statement

  // Job management functions
  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform API jobs to match your existing format
          const transformedJobs = data.jobs.map(job => ({
            _id: job._id,
            title: job.title,
            description: job.description,
            positions: job.positions,
            requirements: job.requirements,
            daysAgo: calculateDaysAgo(job.postedDate), // Now this function exists
            positionsLeft: job.positions,
            applications: job.applications || 0,
            interviewed: job.interviewed || 0,
            rejected: job.rejected || 0,
            feedbackPending: job.feedbackPending || 0,
            offered: job.offered || 0
          }));

          // Replace existing jobs instead of combining to avoid duplicates
          setJobsData(transformedJobs);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs');
    }
  };

  // Updated handleAddJob function
  const handleAddJob = async (jobData) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      // Convert requirements string to array if it's a string
      const processedJobData = {
        ...jobData,
        requirements: typeof jobData.requirements === 'string'
          ? jobData.requirements.split('\n').filter(req => req.trim())
          : jobData.requirements
      };

      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedJobData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newJob = {
            _id: data.job._id,
            title: data.job.title,
            description: data.job.description,
            positions: data.job.positions,
            requirements: data.job.requirements,
            daysAgo: 'Just now',
            positionsLeft: data.job.positions,
            applications: 0,
            interviewed: 0,
            rejected: 0,
            feedbackPending: 0,
            offered: 0
          };

          setJobsData(prev => [newJob, ...prev]);
          setShowAddJobModal(false);

          // Show success notification instead of alert
          setSuccessMessage('Job created successfully!');
          setShowSuccessNotification(true);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error adding job:', error);
      // Show error as notification too
      setSuccessMessage('Failed to create job: ' + error.message);
      setShowSuccessNotification(true);
    }
  };




  // Fixed AddJobModal component - removed problematic useEffect
  const AddJobModal = ({ show, onClose, onSubmit }) => {
    // Use local state instead of props
    const [localJobData, setLocalJobData] = useState({
      title: '',
      description: '',
      positions: 1,
      requirements: ''
    });

    // Reset form when modal opens
    useEffect(() => {
      if (show) {
        setLocalJobData({
          title: '',
          description: '',
          positions: 1,
          requirements: ''
        });
      }
    }, [show]);

    if (!show) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(localJobData); // Pass local data to parent
    };

    const handleClose = () => {
      // Reset local form data
      setLocalJobData({
        title: '',
        description: '',
        positions: 1,
        requirements: ''
      });
      onClose();
    };



    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Post New Job</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              {/* X Icon - you might need to import X from lucide-react or use a simple X */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={localJobData.title}
                onChange={(e) => setLocalJobData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter job title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={localJobData.description}
                onChange={(e) => setLocalJobData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter job description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Positions Available</label>
              <input
                type="number"
                min="1"
                value={localJobData.positions}
                onChange={(e) => setLocalJobData(prev => ({
                  ...prev,
                  positions: parseInt(e.target.value) || 1
                }))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements (one per line)
              </label>
              <textarea
                value={localJobData.requirements}
                onChange={(e) => setLocalJobData(prev => ({ ...prev, requirements: e.target.value }))}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter each requirement on a new line"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };



















  // Your existing return JSX goes here - just add the modal components where needed
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#DDEAFB' }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative w-20 lg:w-20 bg-blue-800 text-white flex flex-col items-center py-6 space-y-8 z-30 transition-transform duration-300 ease-in-out`}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
        </div>

        <nav className="flex flex-col space-y-6">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`flex flex-col items-center space-y-2 cursor-pointer transition-colors ${item.active ? 'text-white' : 'text-blue-300 hover:text-white'}`}
                onClick={() => setActiveTab(item.label.toLowerCase())}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/20 px-4 lg:px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs or candidates..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64 lg:w-80 transition-all"
              />

              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Enhanced search results dropdown */}
              {searchResults.length > 0 && (
                <div className="relative z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-80 overflow-auto border border-gray-200">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </div>
                  {searchResults.map((result, index) => (
                    <div
                      key={result._id || index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      onClick={() => handleResultClick(result)}
                    >
                      {result.type === 'job' ? (
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {highlightMatch(result.title, searchQuery)}
                          </div>
                          {result.description && (
                            <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {highlightMatch(
                                result.description.length > 80 
                                  ? result.description.substring(0, 80) + '...' 
                                  : result.description, 
                                searchQuery
                              )}
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Job • {result.daysAgo}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              {result.positions} position{result.positions !== 1 ? 's' : ''}
                            </span>
                            {result.applications > 0 && (
                              <span>• {result.applications} applications</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        // For candidates (when you add them)
                        <div>
                          <div className="font-medium text-gray-900">
                            {highlightMatch(result.name, searchQuery)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Candidate • Applied for {result.appliedJobs?.length || 0} jobs
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
                  <div className="px-4 py-6 text-center text-gray-500">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="text-sm">No results found</div>
                    <div className="text-xs text-gray-400 mt-1">Try different keywords</div>
                  </div>
                </div>
              )}
            </div>
            
          </div>





 


          <div className="flex items-center space-x-2 relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900 hidden sm:block">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </span>

            <ChevronDown
              className="w-4 h-4 text-gray-500 cursor-pointer"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            />

            {showProfileDropdown && (
              <div className="absolute right-5 top-1 bg-white rounded-md shadow-lg py-1 w-40 z-[9999] border">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Dashboard Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {/* Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 lg:mb-8 gap-4">
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">Overview</h1>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowAddCandidateModal(true)}
                  className="bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Candidate</span>
                </button>
                <button
                  onClick={() => setShowAddJobModal(true)}
                  className="bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Job</span>
                </button>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
  {[
    { number: upcomingMeetings.length, title: 'Interview', subtitle: 'Scheduled', image: '/src/assets/0.png' },
    { number: '2', title: 'Interview Feedback', subtitle: 'Pending', image: '/src/assets/1.png' },
    { number: '44', title: 'Approval', subtitle: 'Pending', image: '/src/assets/2.png' },
    { number: '13', title: 'Offer Acceptance', subtitle: 'Pending', image: '/src/assets/3.png' }
  ].map((card, index) => (
    <div
      key={index}
      className="relative bg-white/70 backdrop-blur-md p-4 lg:p-6 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all"
    >
      {/* Glassy Floating Number Badge */}
      <div className="absolute -top-4 -left-4 text-blue-600 border border-blue-400 bg-white/20 backdrop-blur-sm text-base font-semibold w-10 h-10 lg:w-12 lg:h-12 rounded-md flex items-center justify-center shadow-sm z-10">
        {card.number}
      </div>

      {/* Content */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{card.title}</div>
          <div className="text-sm text-gray-600">{card.subtitle}</div>
        </div>

        {/* Enlarged Custom Image */}
        <div className="w-28 h-28 bg-blue-50/80 backdrop-blur-sm rounded-full flex items-center justify-center">
          <img
            src={card.image}
            alt={card.title}
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>
    </div>
  ))}
</div>

            {/* Second Row Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
  {[
    { number: '17', title: 'Documentations', subtitle: 'Pending', image: '/src/assets/4.png' },
    { number: '3', title: 'Training', subtitle: 'Pending', image: '/src/assets/5.png' },
    { number: '5', title: 'Supervisor Allocation', subtitle: 'Pending', image: '/src/assets/6.png' },
    { number: '56', title: 'Project Allocation', subtitle: 'Pending', image: '/src/assets/7.png' }
  ].map((card, index) => (
    <div
      key={index}
      className="relative bg-white/70 backdrop-blur-md p-4 lg:p-6 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all"
    >
      {/* Glassy Number Badge */}
      <div className="absolute -top-4 -left-4 text-blue-600 border border-blue-400 bg-white/20 backdrop-blur-sm text-base font-semibold w-10 h-10 lg:w-12 lg:h-12 rounded-md flex items-center justify-center shadow-sm z-10">
        {card.number}
      </div>

      {/* Card Content */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">{card.title}</div>
          <div className="text-sm text-gray-600">{card.subtitle}</div>
        </div>

        {/* Enlarged Image */}
        <div className="w-28 h-28 bg-blue-50/80 backdrop-blur-sm rounded-full flex items-center justify-center">
          <img
            src={card.image}
            alt={card.title}
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>
    </div>
  ))}
</div>

            {/* Require Attention Section */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/30">
              <div className="p-4 lg:p-6 border-b border-white/30">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Require Attention</h2>

                <div className="flex space-x-4 lg:space-x-8">
                  <button
                    className={`pb-2 font-medium text-sm lg:text-base ${activeTab === 'jobs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('jobs')}
                  >
                    Jobs
                  </button>
                  <button
                    className={`pb-2 font-medium text-sm lg:text-base ${activeTab === 'candidates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('candidates')}
                  >
                    Candidates
                  </button>
                  <button
                    className={`pb-2 font-medium text-sm lg:text-base ${activeTab === 'onboardings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('onboardings')}
                  >
                    Onboardings
                  </button>
                </div>
              </div>

              {activeTab === 'jobs' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positions Left</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewed</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback Pending</th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offered</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                      {jobsData.map((job, index) => (
                        <tr key={index} className="hover:bg-white/70 transition-colors">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                <div className="text-xs lg:text-sm text-gray-500">{job.daysAgo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{job.positionsLeft}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.applications}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.interviewed}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.rejected}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.feedbackPending}</td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{job.offered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}













              {activeTab === 'candidates' && (
                <div className="overflow-hidden">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="w-[25%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                        <th className="w-[20%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="w-[15%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="w-[20%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs</th>
                        <th className="w-[20%] px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
                      {candidates.map((candidate, index) => (
                        <tr
                          key={candidate._id || index}
                          className="hover:bg-white/70 transition-colors relative group"
                          onMouseEnter={() => setHoveredCandidate(candidate._id)}
                          onMouseLeave={() => setHoveredCandidate(null)}
                        >
                          <td className="px-2 py-3 overflow-hidden">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gray-200/80 backdrop-blur-sm rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <User className="w-3 h-3 text-gray-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-gray-900 truncate">{candidate.firstName} {candidate.lastName}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-2 py-3 text-xs text-gray-900 truncate">
                            {candidate.email}
                          </td>

                          <td className="px-2 py-3 text-xs text-gray-900 truncate">
                            {candidate.phone || 'N/A'}
                          </td>

                          <td className="px-2 py-3 text-xs text-gray-900 overflow-hidden">
                            {candidate.appliedJobs && candidate.appliedJobs.length > 0 ? (
                              <div className="space-y-1">
                                {candidate.appliedJobs.slice(0, 1).map((job, i) => {
                                  const jobTitle = typeof job === 'object' && job?.title
                                    ? job.title
                                    : typeof job === 'string'
                                      ? `Job ${job.slice(0, 6)}`
                                      : 'Unknown';

                                  return (
                                    <div key={i}>
                                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded truncate max-w-full">
                                        {jobTitle.length > 15 ? jobTitle.substring(0, 15) + '...' : jobTitle}
                                      </span>
                                    </div>
                                  );
                                })}
                                {candidate.appliedJobs.length > 1 && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    +{candidate.appliedJobs.length - 1} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-gray-500 text-xs">None</span>
                            )}
                          </td>

                          <td className="px-2 py-3 text-xs text-gray-900 overflow-hidden">
                            {candidate.experience && candidate.experience.length > 0 ? (
                              <div className="space-y-1">
                                {candidate.experience.slice(0, 1).map((exp, i) => (
                                  <div key={i} className="text-xs text-gray-700">
                                    <div className="font-medium text-gray-900 truncate">
                                      {(exp.position || exp.jobTitle || 'Position').length > 12
                                        ? (exp.position || exp.jobTitle || 'Position').substring(0, 12) + '...'
                                        : (exp.position || exp.jobTitle || 'Position')
                                      }
                                    </div>
                                    {exp.company && (
                                      <div className="text-gray-600 truncate">
                                        {exp.company.length > 12 ? exp.company.substring(0, 12) + '...' : exp.company}
                                      </div>
                                    )}
                                    {exp.years && (
                                      <div className="text-gray-500 truncate">
                                        {exp.years}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {candidate.experience.length > 1 && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    +{candidate.experience.length - 1} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-gray-500 text-xs">None</span>
                            )}
                          </td>

                          {/* Floating Action Buttons - Centered on Hover */}
                          {hoveredCandidate === candidate._id && (
                            <td className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm pointer-events-none">
                              <div className="flex space-x-2 animate-fadeIn pointer-events-auto">
                                {/* View Profile Button */}
                                <button
                                  onClick={() => handleViewProfile(candidate)}
                                  className="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50/90 backdrop-blur-sm hover:bg-blue-100/90 rounded-lg transition-all duration-200 border border-blue-200/50 shadow-sm hover:shadow-md"
                                  title="View Profile"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>View Profile</span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCandidate(candidate._id);
                                  }}
                                  className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50/90 backdrop-blur-sm hover:bg-red-100/90 rounded-lg transition-all duration-200 border border-red-200/50 shadow-sm hover:shadow-md"
                                  title="Delete Candidate"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Enhanced CSS for smoother animations */}
              <style jsx>{`
  @keyframes fadeIn {
    from { 
      opacity: 0; 
      transform: translateY(-8px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
  
  /* Ensure smooth transitions for the table rows */
  tr.group:hover {
    transform: translateZ(0);
  }
`}</style>









              {activeTab === 'onboardings' && (
                <div className="p-6 text-center text-gray-500">
                  Onboarding content will appear here
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Upcoming Meetings */}
          <div className="w-full lg:w-80 bg-white/70 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/30 p-4 lg:p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
              <Plus
                className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                onClick={() => setShowAddMeetingModal(true)}
              />
            </div>

            <div className="space-y-6 max-h-96 lg:max-h-full overflow-y-auto">
              {/* Today */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Today</h3>
                <div className="space-y-3">
                  {upcomingMeetings.filter(meeting => meeting.date === 'Today').map((meeting, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg backdrop-blur-sm border transition-all hover:shadow-md ${meeting.variant === 'blue'
                        ? 'border-blue-200/50'
                        : 'border-green-200/50'
                        }`}
                      style={{
                        backgroundColor: meeting.variant === 'blue' ? '#A0DBF457' : '#B0F1B65C'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`text-sm font-medium min-w-[40px] ${meeting.variant === 'blue' ? 'text-[#1B5CBE]' : 'text-[#2B5708]'
                            }`}
                        >
                          {meeting.time}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${meeting.variant === 'blue' ? 'text-[#1B5CBE]' : 'text-[#2B5708]'
                              }`}
                          >
                            {meeting.candidate}
                          </div>
                          <div
                            className={`text-xs ${meeting.variant === 'blue' ? 'text-[#1B5CBE]/70' : 'text-[#2B5708]/70'
                              }`}
                          >
                            {meeting.position}
                          </div>
                          <div
                            className={`text-xs ${meeting.variant === 'blue' ? 'text-[#1B5CBE]/70' : 'text-[#2B5708]/70'
                              }`}
                          >
                            {meeting.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tomorrow */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Tomorrow</h3>
                <div className="space-y-3">
                  {upcomingMeetings.filter(meeting => meeting.date === 'Tomorrow').map((meeting, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg backdrop-blur-sm border transition-all hover:shadow-md ${meeting.variant === 'blue'
                        ? 'border-blue-200/50'
                        : 'border-green-200/50'
                        }`}
                      style={{
                        backgroundColor: meeting.variant === 'blue' ? '#A0DBF457' : '#B0F1B65C'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`text-sm font-medium min-w-[40px] ${meeting.variant === 'blue' ? 'text-[#1B5CBE]' : 'text-[#2B5708]'
                            }`}
                        >
                          {meeting.time}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${meeting.variant === 'blue' ? 'text-[#1B5CBE]' : 'text-[#2B5708]'
                              }`}
                          >
                            {meeting.candidate}
                          </div>
                          <div
                            className={`text-xs ${meeting.variant === 'blue' ? 'text-[#1B5CBE]/70' : 'text-[#2B5708]/70'
                              }`}
                          >
                            {meeting.position}
                          </div>
                          <div
                            className={`text-xs ${meeting.variant === 'blue' ? 'text-[#1B5CBE]/70' : 'text-[#2B5708]/70'
                              }`}
                          >
                            {meeting.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* This Week */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">This Week</h3>
                <div className="space-y-3">
                  {['Sep 3', 'Sep 6', 'Sep 7', 'Sep 8'].map((date, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg backdrop-blur-sm border transition-all hover:shadow-md ${index % 2 === 0
                        ? 'border-blue-200/50'
                        : 'border-green-200/50'
                        }`}
                      style={{
                        backgroundColor: index % 2 === 0 ? '#A0DBF457' : '#B0F1B65C'
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`text-sm font-medium min-w-[40px] ${index % 2 === 0 ? 'text-[#1B5CBE]' : 'text-[#2B5708]'
                            }`}
                        >
                          {date}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${index % 2 === 0 ? 'text-[#1B5CBE]' : 'text-[#2B5708]'
                              }`}
                          >
                            Mini Soman
                          </div>
                          <div
                            className={`text-xs ${index % 2 === 0 ? 'text-[#1B5CBE]/70' : 'text-[#2B5708]/70'
                              }`}
                          >
                            Mean stack developer, 4th phase interview
                          </div>
                          <div
                            className={`text-xs ${index % 2 === 0 ? 'text-[#1B5CBE]/70' : 'text-[#2B5708]/70'
                              }`}
                          >
                            3:15 - 3:45
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCandidateModal
        show={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        onSubmit={handleAddCandidate}
        jobs={jobsData}
      />








      <AddJobModal
        show={showAddJobModal}
        onClose={() => setShowAddJobModal(false)}
        onSubmit={handleAddJob}
      // Remove jobData={newJob} and setJobData={setNewJob}
      />

      <SuccessNotification
        show={showSuccessNotification}
        message={successMessage}
        onClose={() => setShowSuccessNotification(false)}
      />



      <AddMeetingModal
        show={showAddMeetingModal}
        onClose={() => setShowAddMeetingModal(false)}
        onSubmit={handleAddMeeting}
        candidates={candidates}
        jobs={jobsData}
      />



      {/* Job Details Modal - Add this RIGHT BEFORE the closing </div> tags of your main container */}
{showJobModal && selectedJob && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Posted by {selectedJob.postedBy?.firstName} {selectedJob.postedBy?.lastName} • 
            {new Date(selectedJob.postedDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setShowJobModal(false)}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6">
        {/* Job Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{selectedJob.positions}</div>
            <div className="text-sm text-gray-600">Positions</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{selectedJob.applications}</div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{selectedJob.interviewed}</div>
            <div className="text-sm text-gray-600">Interviewed</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{selectedJob.offered}</div>
            <div className="text-sm text-gray-600">Offered</div>
          </div>
        </div>

        {/* Job Description */}
        {selectedJob.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
            </div>
          </div>
        )}

        {/* Requirements */}
        {selectedJob.requirements && selectedJob.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-2">
                {selectedJob.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Contact Information */}
        {selectedJob.postedBy && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedJob.postedBy.firstName?.[0]}{selectedJob.postedBy.lastName?.[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedJob.postedBy.firstName} {selectedJob.postedBy.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{selectedJob.postedBy.email}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-500">
          Job ID: {selectedJob._id}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJobModal(false)}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              setShowJobModal(false);
              setActiveTab('jobs');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View in Jobs List
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>






  );



  
}














// Add meeting handler
const handleAddMeeting = async (meetingData) => {
  try {
    // In a real app, you would post to your API
    // const res = await axios.post('/api/meetings', meetingData, {
    //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    // });

    // Find candidate for display
    const candidate = candidates.find(c => c._id === meetingData.candidateId);
    const job = jobs.find(j => j._id === meetingData.jobId);

    // Mock response
    const newMeeting = {
      time: meetingData.time,
      candidate: `${candidate.firstName} ${candidate.lastName}`,
      position: job ? job.title : 'General Interview',
      duration: `${meetingData.time} - ${meetingData.duration} minutes`,
      date: 'Today',
      variant: Math.random() > 0.5 ? 'blue' : 'green'
    };

    setUpcomingMeetings([newMeeting, ...upcomingMeetings]);
    setShowAddMeetingModal(false);
    showSuccessMessage('Meeting scheduled successfully!');
  } catch (err) {
    console.error('Error scheduling meeting:', err);
    showSuccessMessage('Failed to schedule meeting');
  }
};

// Success message
const showSuccessMessage = (message) => {
  // In a real app, use a proper toast notification
  alert(message);
};

// Logout handler
const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};


