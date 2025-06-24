const config = {
    backendUrl: import.meta.env.MODE === 'production'
      ? 'https://your-production-backend.com'
      : 'http://localhost:5000'
  };
  
  export default config;
  