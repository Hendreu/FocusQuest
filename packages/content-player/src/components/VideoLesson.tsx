import React, { useRef, useEffect, useState } from 'react'
import type { VideoContent } from '@repo/types'
import { useVideoProgress } from '../hooks/useVideoProgress'

interface VideoLessonProps {
  content: VideoContent
  lessonId: string
  onComplete?: () => void
}

export function VideoLesson({ content, lessonId, onComplete }: VideoLessonProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { progress, isCompleted, savedPosition, onTimeUpdate, onLoadedMetadata } =
    useVideoProgress(lessonId)

  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [completedFired, setCompletedFired] = useState(false)

  // Resume saved position after metadata loads
  function handleLoadedMetadata() {
    const vid = videoRef.current
    if (!vid) return
    onLoadedMetadata(vid.duration)
    if (savedPosition > 0) vid.currentTime = savedPosition
  }

  function handleTimeUpdate() {
    const vid = videoRef.current
    if (!vid) return
    onTimeUpdate(vid.currentTime, vid.duration)
  }

  useEffect(() => {
    if (isCompleted && !completedFired) {
      setCompletedFired(true)
      onComplete?.()
    }
  }, [isCompleted, completedFired, onComplete])

  function togglePlay() {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) {
      void vid.play()
      setIsPlaying(true)
    } else {
      vid.pause()
      setIsPlaying(false)
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const vid = videoRef.current
    if (!vid) return
    vid.currentTime = (Number(e.target.value) / 100) * vid.duration
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
    setIsMuted(val === 0)
  }

  function toggleMute() {
    const vid = videoRef.current
    if (!vid) return
    vid.muted = !vid.muted
    setIsMuted(vid.muted)
  }

  function handleSpeed(s: number) {
    if (videoRef.current) videoRef.current.playbackRate = s
    setSpeed(s)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      void document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // YouTube embed path
  if (content.embedUrl) {
    const sep = content.embedUrl.includes('?') ? '&' : '?'
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src={`${content.embedUrl}${sep}rel=0&modestbranding=1`}
          title="Video lesson"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
    )
  }

  return (
    <div style={{ background: '#000', borderRadius: '0.5rem', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={content.url}
        poster={content.thumbnailUrl ?? undefined}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ width: '100%', display: 'block' }}
        // Captions
        crossOrigin={content.captionsUrl ? 'anonymous' : undefined}
      >
        {content.captionsUrl && (
          <track kind="captions" src={content.captionsUrl} default label="Legendas" />
        )}
      </video>

      {/* Controls */}
      <div
        style={{
          background: 'rgba(0,0,0,0.85)',
          padding: '0.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        {/* Seek bar */}
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={handleSeek}
          aria-label="Posição do vídeo"
          style={{ width: '100%', cursor: 'pointer' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.25rem' }}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Volume */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolume}
            aria-label="Volume"
            style={{ width: '80px', cursor: 'pointer' }}
          />

          {/* Speed */}
          <select
            value={speed}
            onChange={(e) => handleSpeed(Number(e.target.value))}
            aria-label="Velocidade"
            style={{ background: '#333', color: '#fff', border: 'none', borderRadius: '0.25rem', padding: '0.15rem 0.4rem', cursor: 'pointer' }}
          >
            {[0.75, 1, 1.25, 1.5].map((s) => (
              <option key={s} value={s}>{s}x</option>
            ))}
          </select>

          {/* Progress indicator */}
          <span style={{ marginLeft: 'auto', color: '#aaa', fontSize: '0.8rem' }}>
            {Math.round(progress)}% assistido
          </span>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>
    </div>
  )
}
