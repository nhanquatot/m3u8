'use client';

import { useState } from 'react';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css'; // Or any style you prefer from highlight.js/styles

// Register a basic language for M3U8 (treat as plaintext with custom highlights)
hljs.registerLanguage('m3u8', () => {
  return {
    case_insensitive: true,
    keywords: {
      keyword: '#EXTM3U #EXTINF #EXT-X-VERSION #EXT-X-TARGETDURATION #EXT-X-MEDIA-SEQUENCE #EXT-X-ENDLIST',
    },
    contains: [
      {
        className: 'string',
        begin: /".*?"/,
      },
      {
        className: 'comment',
        begin: /^#(?![EXT])/,
        end: /$/,
      },
      {
        className: 'url',
        begin: /(http|https):\/\/[^\s]+/,
      },
      {
        className: 'segment',
        begin: /\.ts|\.m3u8$/,
      },
    ],
  };
});

export default function Home() {
  const [url, setUrl] = useState('');
  const [referer, setReferer] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setContent('');
    setLoading(true);

    try {
      const res = await fetch('/api/fetch-m3u8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, referer, userAgent }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setContent(data.content);
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">M3U8 Playlist Fetcher</h1>
      
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">M3U8 URL</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="https://example.com/playlist.m3u8"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="referer" className="block text-sm font-medium text-gray-700">Referer (optional)</label>
          <input
            id="referer"
            type="url"
            value={referer}
            onChange={(e) => setReferer(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="https://example.com"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="userAgent" className="block text-sm font-medium text-gray-700">User-Agent (optional)</label>
          <input
            id="userAgent"
            type="text"
            value={userAgent}
            onChange={(e) => setUserAgent(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Playlist'}
        </button>
      </form>
      
      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      {content && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-2">Playlist Content</h2>
          <pre className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-96">
            <code
              dangerouslySetInnerHTML={{
                __html: hljs.highlight(content, { language: 'm3u8' }).value,
              }}
            />
          </pre>
        </div>
      )}
    </div>
  );
}
