import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, Home, Briefcase, Users, FileText, Calendar, 
  ArrowLeft, Edit, Linkedin, Twitter, Globe, 
  CheckCircle, X, MessageSquare, BookOpen, Check, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getToken } from '../utils/auth';

// Define tabs array at the top level
const tabs = ['General', 'Evaluations', 'Experience', 'Education', 'Events', 'Documents', 'Messages'];

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [searchQuery, setSearchQuery] = useState('');
  const [evaluation, setEvaluation] = useState({
    qualificationsMatch: true,
    experienceRelevance: true,
    education: true,
    keywordsMatch: false,
    yearsOfExperience: true,
    jobStability: false,
    culturalFit: true,
    interviewPerformance: true,
    references: false,
    additionalFactors: true
  });
  const [score, setScore] = useState(76);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('home');
  const [jobs, setJobs] = useState([]);
  const [showJobsList, setShowJobsList] = useState(false);

  // Generate initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        // Fetch candidate
        const candidateRes = await fetch(`${backendUrl}/api/candidates/${id}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        const candidateData = await candidateRes.json();
        
        if (candidateData.success) {
          setCandidate(candidateData.candidate);
          if (candidateData.candidate.evaluation) {
            setEvaluation(candidateData.candidate.evaluation);
            updateScore(candidateData.candidate.evaluation);
          }
        } else {
          throw new Error(candidateData.message || 'Failed to fetch candidate');
        }
       
       
        
        // Fetch jobs
      

        const jobsRes = await fetch(`${backendUrl}/api/jobs`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        const jobsData = await jobsRes.json();
        if (jobsData.success) setJobs(jobsData.jobs);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateScore = (evalData) => {
    const totalCriteria = 10;
    let positiveCount = 0;
    
    for (const key in evalData) {
      if (evalData[key]) positiveCount++;
    }
    
    const newScore = Math.round((positiveCount / totalCriteria) * 100);
    setScore(newScore);
  };

  const handleEvaluationChange = (criteria, value) => {
    const newEvaluation = {
      ...evaluation,
      [criteria]: value
    };
    setEvaluation(newEvaluation);
    updateScore(newEvaluation);
    saveEvaluation(newEvaluation);
  };

  const saveEvaluation = async (evalData) => {
    try {
      const response = await fetch(`${backendUrl}/api/candidates/${id}/evaluation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evaluation: evalData })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save evaluation');
      }
    } catch (err) {
      console.error('Error saving evaluation:', err);
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const renderJobsList = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-20 top-0 w-80 bg-white shadow-lg rounded-br-lg border border-gray-200 z-10"
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">All Jobs ({jobs.length})</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {jobs.map((job) => (
            <motion.div
              key={job._id}
              whileHover={{ backgroundColor: '#f8fafc' }}
              className="p-4 border-b border-gray-100 cursor-pointer"
              onClick={() => setShowJobsList(false)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-500">{job.positions} position(s)</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  job.status === 'active' ? 'bg-green-100 text-green-800' : 
                  job.status === 'closed' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>{job.applications} applicants</span>
                <span className="mx-2">•</span>
                <span>{job.interviewed} interviewed</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let dates = [];
    let day = 1;
    
    for (let i = 0; i < 6; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || day > daysInMonth) {
          week.push(<td key={j} className="p-2"></td>);
        } else {
          week.push(
            <td key={j} className={`p-2 text-center ${day === today.getDate() ? 'bg-blue-100 rounded-full' : ''}`}>
              {day}
            </td>
          );
          day++;
        }
      }
      dates.push(<tr key={i}>{week}</tr>);
      if (day > daysInMonth) break;
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold mb-4">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <table className="w-full">
          <thead>
            <tr>
              {days.map(day => (
                <th key={day} className="p-2 text-sm font-medium text-gray-500">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates}
          </tbody>
        </table>
      </motion.div>
    );
  };

  const renderReports = () => {
    if (!candidate) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-semibold mb-4">Candidate Full Report</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Full Name:</p>
                <p className="font-medium">{candidate.firstName} {candidate.lastName}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{candidate.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{candidate.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
          
          {candidate.experience?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Work Experience</h3>
              <div className="space-y-4">
                {candidate.experience.map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                    {exp.years && <p className="text-sm text-gray-500">{exp.years}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">Documents</h3>
            <div className="space-y-2">
              {candidate.resume && (
                <p className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-medium">Resume:</span> 
                  <button 
                    onClick={() => handleDownload(candidate.resume)}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Download
                  </button>
                </p>
              )}
              {candidate.coverLetter && (
                <p className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="font-medium">Cover Letter:</span> 
                  <button 
                    onClick={() => handleDownload(candidate.coverLetter)}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Download
                  </button>
                </p>
              )}
            </div>
          </div>
          
          {candidate.appliedJobs?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Applied Jobs</h3>
              <div className="space-y-2">
                {candidate.appliedJobs.map((job, index) => (
                  <p key={index} className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{job.title || `Job ${index + 1}`}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">Evaluation Summary</h3>
            <p>Overall Score: <span className="font-medium">{score}%</span></p>
            <div className="mt-2 space-y-1">
              {Object.entries(evaluation).map(([key, value]) => (
                <p key={key} className="flex items-center">
                  {value ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 mr-2 text-red-500" />
                  )}
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderEvaluationForm = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Candidate Evaluation</h2>
            <p className="text-sm text-gray-500 mt-1">Score: {score}%</p>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="space-y-4">
              {[
                { name: 'Qualifications Match', key: 'qualificationsMatch' },
                { name: 'Experience Relevance', key: 'experienceRelevance' },
                { name: 'Education', key: 'education' },
                { name: 'Keywords Match', key: 'keywordsMatch' },
                { name: 'Years of Experience', key: 'yearsOfExperience' },
                { name: 'Job Stability', key: 'jobStability' },
                { name: 'Cultural Fit', key: 'culturalFit' },
                { name: 'Interview Performance', key: 'interviewPerformance' },
                { name: 'References', key: 'references' },
                { name: 'Additional Factors', key: 'additionalFactors' }
              ].map((item) => (
                <div 
                  key={item.key} 
                  className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <div className="flex space-x-2">
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        evaluation[item.key] 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      onClick={() => handleEvaluationChange(item.key, true)}
                      aria-label="Mark as good"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        !evaluation[item.key] 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      onClick={() => handleEvaluationChange(item.key, false)}
                      aria-label="Mark as bad"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowEvaluationModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setShowEvaluationModal(false);
                  saveEvaluation(evaluation);
                }}
              >
                Save Evaluation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg text-gray-700">Loading candidate data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg text-gray-700">Candidate not found</div>
      </div>
    );
  }

  const candidateInitials = getInitials(candidate.firstName, candidate.lastName);












  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-20 bg-blue-900 flex flex-col items-center py-6 space-y-8">
        {/* Logo */}
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-full"></div>
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col space-y-6">
          <button 
            className={`flex flex-col items-center ${activeSidebarTab === 'home' ? 'text-white' : 'text-white opacity-60 hover:opacity-100'} cursor-pointer`}
            onClick={() => {
              setActiveSidebarTab('home');
              setShowReports(false);
              setShowCalendar(false);
              setShowJobsList(false);
            }}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button 
            className={`flex flex-col items-center ${activeSidebarTab === 'jobs' ? 'text-white' : 'text-white opacity-60 hover:opacity-100'} cursor-pointer relative`}
            onClick={() => {
              setActiveSidebarTab('jobs');
              setShowJobsList(!showJobsList);
              setShowReports(false);
              setShowCalendar(false);
            }}
          >
            <Briefcase className="w-6 h-6" />
            <span className="text-xs mt-1">Jobs</span>
            {showJobsList && renderJobsList()}
          </button>
          
          <button 
            className={`flex flex-col items-center ${activeSidebarTab === 'candidates' ? 'text-white' : 'text-white opacity-60 hover:opacity-100'} cursor-pointer`}
            onClick={() => {
              setActiveSidebarTab('candidates');
              setShowReports(false);
              setShowCalendar(false);
              setShowJobsList(false);
            }}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Candidates</span>
          </button>
          
          <button 
            className={`flex flex-col items-center ${showReports ? 'text-white' : 'text-white opacity-60 hover:opacity-100'} cursor-pointer`}
            onClick={() => {
              setShowReports(true);
              setShowCalendar(false);
              setShowJobsList(false);
              setActiveSidebarTab('');
            }}
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs mt-1">Reports</span>
          </button>
          
          <button 
            className={`flex flex-col items-center ${showCalendar ? 'text-white' : 'text-white opacity-60 hover:opacity-100'} cursor-pointer`}
            onClick={() => {
              setShowCalendar(true);
              setShowReports(false);
              setShowJobsList(false);
              setActiveSidebarTab('');
            }}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1">Calendar</span>
          </button>
        </div>
      </div>






      

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{candidateInitials}</span>
            </div>
            <span className="text-gray-700 font-medium">{candidate.firstName} {candidate.lastName}</span>
          </div>
        </div>

        {/* Breadcrumb and Back Button */}
        <div className="px-8 py-4 flex items-center justify-between bg-white border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Candidates</span>
            <span>›</span>
            <span className="text-gray-700">{candidate.firstName} {candidate.lastName}</span>
          </div>
          <button 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Go Back</span>
          </button>
        </div>

        {/* Profile Content */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          {showReports ? (
            renderReports()
          ) : showCalendar ? (
            renderCalendar()
          ) : (
            <div className="flex space-x-8">
              {/* Left Column */}
              <div className="flex-1">
                {/* Profile Header */}
                <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-xl font-semibold">
                        {candidateInitials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl font-semibold text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </h1>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Interview</span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600 mb-3">
                        <span>{candidate.email}</span>
                        <span>{candidate.phone || 'No phone number'}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                        <Linkedin className="w-5 h-5 text-blue-600 cursor-pointer" />
                        <Twitter className="w-5 h-5 text-blue-400 cursor-pointer" />
                        <Globe className="w-5 h-5 text-gray-500 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                            if (tab === 'Education') setShowEducationModal(true);
                            if (tab === 'Messages') setShowMessagesModal(true);
                          }}
                          className={`py-4 text-sm font-medium ${activeTab === tab ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* General Tab Content */}
                    {activeTab === 'General' && (
                      <>
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Candidate Files</h3>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            {candidate.resume && (
                              <motion.div 
                                whileHover={{ y: -2 }}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleDownload(candidate.resume)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                  <span className="text-sm font-medium text-gray-700">Resume.pdf</span>
                                </div>
                                <span className="text-xs text-gray-500">Click to download</span>
                              </motion.div>
                            )}
                            {candidate.coverLetter && (
                              <motion.div 
                                whileHover={{ y: -2 }}
                                className="bg-red-50 border border-red-200 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleDownload(candidate.coverLetter)}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                                  <span className="text-sm font-medium text-gray-700">Cover_letter.pdf</span>
                                </div>
                                <span className="text-xs text-gray-500">Click to download</span>
                              </motion.div>
                            )}
                          </div>
                          {(candidate.resume || candidate.coverLetter) && (
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                              View All Files
                            </button>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
                          </div>
                          
                          {candidate.experience && candidate.experience.length > 0 ? (
                            candidate.experience.map((exp, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                              >
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-base font-semibold text-gray-900">{exp.position}</h4>
                                </div>
                                <div className="flex items-center space-x-2 mb-3">
                                  <span className="text-gray-600">{exp.company}</span>
                                  {exp.years && <span className="text-gray-400">({exp.years})</span>}
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-gray-500 italic">No work experience provided</div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Evaluations Tab Content */}
                    {activeTab === 'Evaluations' && (
                      <div className="text-center py-8">
                        <button 
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          onClick={() => setShowEvaluationModal(true)}
                        >
                          Open Evaluation Form
                        </button>
                      </div>
                    )}

                    {/* Experience Tab Content */}
                    {activeTab === 'Experience' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                        {candidate.experience && candidate.experience.length > 0 ? (
                          candidate.experience.map((exp, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mb-6 border-l-4 border-blue-500 pl-4"
                            >
                              <h4 className="text-lg font-semibold text-gray-800">{exp.position}</h4>
                              <p className="text-gray-600">
                                {exp.company} • {exp.years || 'No duration specified'}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">No work experience provided</div>
                        )}
                      </div>
                    )}

                    {/* Documents Tab Content */}
                    {activeTab === 'Documents' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Documents</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {candidate.resume && (
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleDownload(candidate.resume)}
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Resume</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Click to view/download</p>
                            </motion.div>
                          )}
                          {candidate.coverLetter && (
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleDownload(candidate.coverLetter)}
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Cover Letter</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-2">Click to view/download</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-80">
                {/* Current Status */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Round</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Technical</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Assigned to</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{candidateInitials}</span>
                        </div>
                        <span className="text-sm text-gray-700">{candidate.firstName} {candidate.lastName}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Interview Date</span>
                      <span className="text-gray-700">Jul 30, 2024</span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative w-16 h-16">
                      <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">{score}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">Score:</div>
                        <div className="text-lg font-semibold text-green-600">
                          {score >= 80 ? 'Excellent Fit' : 
                           score >= 60 ? 'Good Fit' : 
                           score >= 40 ? 'Potential Fit' : 'Poor Fit'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Criteria</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Qualifications Match', key: 'qualificationsMatch' },
                      { name: 'Experience Relevance', key: 'experienceRelevance' },
                      { name: 'Education', key: 'education' },
                      { name: 'Keywords Match', key: 'keywordsMatch' },
                      { name: 'Years of Experience', key: 'yearsOfExperience' },
                      { name: 'Job Stability', key: 'jobStability' },
                      { name: 'Cultural Fit', key: 'culturalFit' },
                      { name: 'Interview Performance', key: 'interviewPerformance' },
                      { name: 'References', key: 'references' },
                      { name: 'Additional Factors', key: 'additionalFactors' }
                    ].map((item) => (
                      <div key={item.key} className="flex justify-between items-center">
                        <span className="text-gray-700">{item.name}</span>
                        {evaluation[item.key] ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && renderEvaluationForm()}

      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Education Information</h2>
            <p className="mb-6">Please check the candidate's CV or resume for education details.</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowEducationModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Modal */}
      {showMessagesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Messages with {candidate.firstName}</h2>
            <div className="border rounded-lg p-4 h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                <p>No messages yet</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setShowMessagesModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}