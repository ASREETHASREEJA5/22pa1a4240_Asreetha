import React, { useState, useEffect, useCallback } from 'react';

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [urls, setUrls] = useState([{ id: 1, originalUrl: '', validity: 30, shortcode: '' }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState([]);
  const [activeTab, setActiveTab] = useState('shortener');

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const statsPromises = results.map(async (res) => {
        const shortcode = res.shortLink.split('/').pop();
        try {
          const statResponse = await fetch(`${BACKEND_URL}/shorturls/${shortcode}`);
          if (!statResponse.ok) throw new Error(`HTTP error! status: ${statResponse.status}`);
          return await statResponse.json();
        } catch {
          return null;
        }
      });
      const fetchedStats = (await Promise.all(statsPromises)).filter(Boolean);
      setStatistics(fetchedStats);
    } catch {
      setError('Failed to fetch statistics.');
    } finally {
      setLoading(false);
    }
  }, [results]);

  useEffect(() => {
    if (activeTab === 'statistics') fetchStatistics();
  }, [activeTab, fetchStatistics]);

  const handleUrlChange = (id, field, value) => {
    setUrls((prevUrls) =>
      prevUrls.map((url) => (url.id === id ? { ...url, [field]: value } : url))
    );
  };

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls((prevUrls) => [
        ...prevUrls,
        { id: prevUrls.length + 1, originalUrl: '', validity: 30, shortcode: '' },
      ]);
    } else {
      setError('You can only shorten up to 5 URLs at a time.');
    }
  };

  const validateInput = (urlEntry) => {
    if (!urlEntry.originalUrl) return 'Original URL is required.';
    try {
      new URL(urlEntry.originalUrl);
    } catch (_) {
      return 'Invalid URL format.';
    }
    if (urlEntry.validity && (isNaN(urlEntry.validity) || urlEntry.validity <= 0)) {
      return 'Validity must be a positive integer.';
    }
    if (urlEntry.shortcode && !/^[a-zA-Z0-9]+$/.test(urlEntry.shortcode)) {
      return 'Custom shortcode must be alphanumeric.';
    }
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    setResults([]);

    const newResults = [];
    for (const urlEntry of urls) {
      const validationError = validateInput(urlEntry);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      try {
        const payload = {
          url: urlEntry.originalUrl,
          validity: urlEntry.validity ? parseInt(urlEntry.validity) : undefined,
          shortcode: urlEntry.shortcode || undefined,
        };
        const response = await fetch(`${BACKEND_URL}/shorturls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        newResults.push({ ...data, originalUrl: urlEntry.originalUrl });
      } catch (err) {
        setError(`Failed to shorten ${urlEntry.originalUrl}: ${err.message}`);
        break;
      }
    }
    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔗 URL Shortener</h1>
          <div>
            <button
              className={`px-4 py-2 rounded-md mr-2 ${
                activeTab === 'shortener' ? 'bg-indigo-900' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('shortener')}
            >
              Shorten URL
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'statistics' ? 'bg-indigo-900' : 'hover:bg-indigo-800'
              }`}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-8 p-4">
        {activeTab === 'shortener' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">Shorten Your URLs</h2>
            {error && (
              <div className="bg-red-200 border border-red-500 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {urls.map((urlEntry) => (
              <div key={urlEntry.id} className="mb-6 border border-gray-200 p-4 rounded-md bg-gray-50">
                <div className="mb-4">
                  <label htmlFor={`originalUrl-${urlEntry.id}`} className="block text-gray-800 text-sm font-bold mb-2">
                    Original Long URL
                  </label>
                  <input
                    type="text"
                    id={`originalUrl-${urlEntry.id}`}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-indigo-400"
                    value={urlEntry.originalUrl}
                    onChange={(e) => handleUrlChange(urlEntry.id, 'originalUrl', e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor={`validity-${urlEntry.id}`} className="block text-gray-800 text-sm font-bold mb-2">
                    Validity in Minutes (optional, default 30)
                  </label>
                  <input
                    type="number"
                    id={`validity-${urlEntry.id}`}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-indigo-400"
                    value={urlEntry.validity}
                    onChange={(e) => handleUrlChange(urlEntry.id, 'validity', e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor={`shortcode-${urlEntry.id}`} className="block text-gray-800 text-sm font-bold mb-2">
                    Custom Shortcode (optional, alphanumeric)
                  </label>
                  <input
                    type="text"
                    id={`shortcode-${urlEntry.id}`}
                    className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-indigo-400"
                    value={urlEntry.shortcode}
                    onChange={(e) => handleUrlChange(urlEntry.id, 'shortcode', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-semibold py-2 px-4 rounded mr-2"
              onClick={addUrlField}
            >
              ➕ Add Another URL
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Shortening...' : '🚀 Shorten All'}
            </button>

            {results.length > 0 && (
              <div className="mt-8 border border-green-300 bg-green-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Shortened URLs</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {results.map((result, index) => (
                    <li key={index} className="mb-3">
                      <p>Original: {result.originalUrl}</p>
                      <p>
                        Short Link:{' '}
                        <a href={result.shortLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          {result.shortLink}
                        </a>
                      </p>
                      <p className="text-sm text-gray-600">
                        Expires: {new Date(result.expiry).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-700">📊 URL Statistics</h2>
            {loading && <p>Loading statistics...</p>}
            {error && (
              <div className="bg-red-200 border border-red-500 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {statistics.length === 0 && !loading && !error && (
              <p className="text-gray-600">No statistics available. Shorten some URLs first.</p>
            )}
            <ul className="list-disc pl-5">
              {statistics.map((stat, index) => (
                <li key={index} className="mb-4 border border-gray-200 p-4 rounded-md bg-gray-50">
                  <p className="text-lg font-medium text-blue-700">Short Link: {BACKEND_URL}/{stat.shortcode}</p>
                  <p className="text-gray-700">Original URL: {stat.originalUrl}</p>
                  <p className="text-gray-500 text-sm">Created At: {new Date(stat.createdAt).toLocaleString()}</p>
                  <p className="text-gray-500 text-sm">Expires At: {new Date(stat.expiryAt).toLocaleString()}</p>
                  <p className="text-gray-700 font-semibold">Total Clicks: {stat.totalClicks}</p>
                  {stat.detailedClicks && stat.detailedClicks.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-md font-semibold">Detailed Clicks:</h4>
                      <ul className="list-disc pl-5 text-sm">
                        {stat.detailedClicks.map((click, clickIndex) => (
                          <li key={clickIndex}>
                            Timestamp: {new Date(click.timestamp).toLocaleString()}, Referrer: {click.referrer}, IP: {click.ip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
