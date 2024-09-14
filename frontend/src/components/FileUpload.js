import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [jsonResponse, setJsonResponse] = useState(null);  // New state for JSON response
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setJsonResponse(null);  // Clear JSON response when a new file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a zip file.');
      return;
    }

    const formData = new FormData();
    formData.append('zip_file', file);

    try {
      setLoading(true);
      setMessage('');
      setJsonResponse(null);  // Clear previous response

      const response = await axios.post('http://localhost:5000/js/npm-parser', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('File uploaded and processed successfully!');
      setJsonResponse(response.data);  // Set the JSON response
      console.log(response.data);

    } catch (error) {
      setMessage(`Error: ${error.response ? error.response.data.error : error.message}`);
      setJsonResponse(null);  // Clear JSON response on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Upload Your Zip File</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              className="border border-gray-300 p-3 rounded-lg w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>

          {message && <p className={`text-center mt-4 ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
          
          {/* Display the JSON response */}
          {jsonResponse && (
            <div className="mt-6">
              <h3 className="text-center text-xl font-semibold text-gray-700">Parsed JSON Response:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-gray-700 overflow-auto max-h-96">
                {JSON.stringify(jsonResponse, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FileUpload;
