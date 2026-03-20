'use client';

import { useState } from 'react';

interface VideoContent {
  url?: string;
  sourceType: 'upload' | 'embed';
}

interface VideoEditorProps {
  content: VideoContent | null;
  onChange: (content: VideoContent) => void;
}

export function VideoEditor({ content, onChange }: VideoEditorProps) {
  const [mode, setMode] = useState<'upload' | 'embed'>(content?.sourceType || 'upload');
  const [url, setUrl] = useState(content?.url || '');
  const [fileName, setFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleModeChange = (newMode: 'upload' | 'embed') => {
    setMode(newMode);
    onChange({ sourceType: newMode, url: url });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onChange({ sourceType: mode, url: newUrl });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        alert('File too large. Max 500MB.');
        return;
      }
      setFileName(file.name);
      
      // Simulate upload progress
      setUploadProgress(10);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Simulate finished upload URL
            const fakeUrl = `https://example.com/videos/${encodeURIComponent(file.name)}`;
            setUrl(fakeUrl);
            onChange({ sourceType: 'upload', url: fakeUrl });
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const isEmbed = mode === 'embed';
  const looksLikeYouTubeOrVimeo = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', backgroundColor: 'var(--color-surface, #f8fafc)' }}>
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="videoMode"
            checked={!isEmbed}
            onChange={() => handleModeChange('upload')}
          />
          Upload arquivo
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="videoMode"
            checked={isEmbed}
            onChange={() => handleModeChange('embed')}
          />
          URL embed
        </label>
      </div>

      {!isEmbed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            border: '2px dashed var(--color-border)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            backgroundColor: 'var(--color-background)'
          }}>
            <span style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
              {fileName || 'Clique para selecionar ou arraste um arquivo'}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
              Máx: 500MB (MP4, WebM)
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </label>
          {uploadProgress > 0 && (
            <div style={{ width: '100%', height: '0.5rem', backgroundColor: 'var(--color-border)', borderRadius: '0.25rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: `${uploadProgress}%`, transition: 'width 0.3s' }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>URL do vídeo (YouTube / Vimeo)</label>
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://youtube.com/watch?v=..."
            style={{
              padding: '0.75rem',
              border: '1px solid var(--color-border)',
              borderRadius: '0.25rem',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-foreground)'
            }}
          />
          {looksLikeYouTubeOrVimeo && (
            <div style={{ marginTop: '1rem', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff' }}>Preview simulação do iframe para: {url}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
