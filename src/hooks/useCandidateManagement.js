export const useCandidateManagement = () => {
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    // Fetch candidates from API
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/candidates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setCandidates(response.data.candidates);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch candidates');
        console.error('Error fetching candidates:', err);
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch jobs for the dropdown
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setJobs(response.data.jobs);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
  
    // Add new candidate
    const addCandidate = async (formData) => {
      try {
        console.log('=== FormData being sent ===');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
    
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/api/candidates',
          formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.data.success) {
          await fetchCandidates();
          return response.data;
        }
      } catch (err) {
        console.error('❌ FRONTEND ERROR:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
        
        const errorMessage = err.response?.data?.message || 'Server error while creating candidate';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    };
  
    // Delete candidate
    const deleteCandidate = async (candidateId) => {
      if (!window.confirm('Are you sure you want to delete this candidate?')) {
        return;
      }
  
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          await fetchCandidates(); // Refresh the list
          return response.data;
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete candidate');
        console.error('Error deleting candidate:', err);
        throw err;
      }
    };
  
    // Get single candidate
    const getCandidate = async (candidateId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          return response.data.candidate;
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch candidate');
        console.error('Error fetching candidate:', err);
        throw err;
      }
    };
  
    return {
      candidates,
      jobs,
      loading,
      error,
      fetchCandidates,
      fetchJobs,
      addCandidate,
      deleteCandidate,
      getCandidate,
      setError
    };
  };
