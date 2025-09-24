'use client';
import { useState, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github.css';

// Đăng ký ngôn ngữ m3u8 tùy chỉnh
hljs.registerLanguage('m3u8', () => {
  return {
    case_insensitive: true,
    keywords: {
      keyword:
        '#EXTM3U #EXTINF #EXT-X-VERSION #EXT-X-TARGETDURATION #EXT-X-MEDIA-SEQUENCE #EXT-X-ENDLIST',
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
  const contentRef = useRef<HTMLPreElement>(null);

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

  // Hàm tải nội dung dưới dạng file .txt
  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playlist.m3u8.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const highlightedContent = content
    ? hljs.highlight(content, { language: 'm3u8' }).value
    : '';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4 pt-8">
      <h1 className="text-3xl font-bold mb-6">M3U8 Playlist Fetcher</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md"
      >
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            M3U8 URL
          </label>
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
          <label htmlFor="referer" className="block text-sm font-medium text-gray-700">
            Referer (optional)
          </label>
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
          <label htmlFor="userAgent" className="block text-sm font-medium text-gray-700">
            User-Agent (optional)
          </label>
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
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Playlist Content</h2>
            <button
              onClick={handleDownload}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Download .txt
            </button>
          </div>
          {/* Khử scroll bằng cách bỏ max-h và dùng whitespace-pre-wrap */}
          <pre
            ref={contentRef}
            className="bg-white p-4 rounded-lg shadow-md overflow-x-auto whitespace-pre-wrap font-mono text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      )}
    </div>
  );
}