import { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent } from 'react-youtube';
import type { Timer } from '../../types';
import { X, Play, Pause, Volume2, VolumeX, CheckCircle, Music, Link as LinkIcon } from 'lucide-react';
import { useTimers } from '../../hooks/useTimers';
import toast from 'react-hot-toast';

interface ActiveSessionModalProps {
  timer: Timer;
  onClose: () => void;
}

const STATIONS = [
  { id: 'jfKfPfyJRdk', name: 'Lofi Girl' },
  { id: 'kgx4WGK0oNU', name: 'Jazz Focus' },
  { id: '4xDzrJKXOOY', name: 'Synthwave' },
  { id: 'hXrtQc0pQuw', name: 'Brown Noise' },
];

export const ActiveSessionModal = ({ timer, onClose }: ActiveSessionModalProps) => {
  const { logHistory } = useTimers();
  const [timeLeft, setTimeLeft] = useState(timer.duration_minutes * 60);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoId, setVideoId] = useState(STATIONS[0].id);
  const [customVideoTitle, setCustomVideoTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showStations, setShowStations] = useState(false);
  
  const playerRef = useRef<any>(null);

  // Extract YouTube ID from URL
  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(customUrl);
    if (id) {
      setVideoId(id);
      setCustomUrl('');
      setShowStations(false);
      
      // Fetch video title to display instead of 'Custom Radio'
      try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
        const data = await response.json();
        if (data.title) {
          setCustomVideoTitle(data.title);
          toast.success(`Cargando: ${data.title}`);
        } else {
          setCustomVideoTitle('Custom Radio');
          toast.success('Video cargado correctamente');
        }
      } catch (err) {
        setCustomVideoTitle('Custom Radio');
        toast.success('Video cargado correctamente');
      }
    } else {
      toast.error('URL de YouTube inválida');
    }
  };

  // Generador de tono de alarma usando AudioContext del navegador
  const playAlarmSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
    oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1.5);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isCompleted) {
      setIsCompleted(true);
      setIsActive(false);
      
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }

      playAlarmSound();

      logHistory({
        timer_id: timer.id,
        title: timer.title,
        duration_completed: timer.duration_minutes,
        status: 'completed',
      }).catch(console.error);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isCompleted, timer, logHistory]);

  const handleClose = () => {
    if (!isCompleted && timeLeft < timer.duration_minutes * 60) {
      logHistory({
        timer_id: timer.id,
        title: timer.title,
        duration_completed: Math.floor((timer.duration_minutes * 60 - timeLeft) / 60),
        status: 'abandoned',
      }).catch(console.error);
    }
    onClose();
  };

  const toggleMusic = () => {
    if (playerRef.current) {
      if (isMusicPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    event.target.playVideo();
    event.target.setVolume(30);
    setIsMusicPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div 
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-8 md:p-12 text-center shadow-2xl dark:bg-slate-900 transition-all duration-500 flex flex-col max-h-[90vh]"
        style={{ borderTop: `8px solid ${timer.color}` }}
      >
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 md:right-6 md:top-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-10 bg-slate-100 dark:bg-slate-800 rounded-full p-2"
        >
          <X size={24} />
        </button>

        <div className="overflow-y-auto flex-1 hide-scrollbar">
          <h2 className="mb-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-4 md:mt-0 px-8">
            {timer.title}
          </h2>
          <p className="mb-8 text-sm md:text-base text-slate-500 dark:text-slate-400">
            Stay focused. Do not close this window.
          </p>

          <div className="relative mx-auto flex h-48 w-48 md:h-64 md:w-64 items-center justify-center rounded-full border-8"
               style={{ borderColor: isCompleted ? '#10B981' : `${timer.color}40` }}>
            <div className="text-5xl md:text-6xl font-black tabular-nums text-slate-900 dark:text-white tracking-tighter">
              {formatTime(timeLeft)}
            </div>
            
            {!isCompleted && isActive && (
               <svg className="absolute inset-0 h-full w-full -rotate-90 animate-[spin_60s_linear_infinite] opacity-50">
                 <circle cx="50%" cy="50%" r="48%" stroke={timer.color} strokeWidth="4" fill="none" strokeDasharray="720" strokeDashoffset="0" />
               </svg>
            )}
          </div>

          {isCompleted && (
            <div className="mt-8 flex animate-bounce items-center justify-center gap-2 text-emerald-500">
              <CheckCircle size={32} />
              <span className="text-xl font-bold">Session Completed!</span>
            </div>
          )}

          <div className="mt-10 flex items-center justify-center gap-6">
            <button 
              onClick={() => setIsActive(!isActive)}
              disabled={isCompleted}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-all"
            >
              {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
          </div>

          {/* Player Controls */}
          <div className="mt-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowStations(!showStations)}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:scale-105 transition-transform shrink-0"
              >
                <Music size={18} />
              </button>
              
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {STATIONS.find(s => s.id === videoId)?.name || customVideoTitle || 'Custom Radio'}
                </p>
                <p className="text-xs text-slate-500 truncate">YouTube Background</p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={toggleMusic} className="rounded-full bg-white p-2.5 shadow-sm dark:bg-slate-700 text-slate-700 dark:text-white hover:scale-105 transition-transform">
                  {isMusicPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>
                <button onClick={toggleMute} className="rounded-full bg-white p-2.5 shadow-sm dark:bg-slate-700 text-slate-700 dark:text-white hover:scale-105 transition-transform">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>
            </div>

            {/* Stations Selection */}
            {showStations && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  {STATIONS.map(station => (
                    <button
                      key={station.id}
                      onClick={() => {
                        setVideoId(station.id);
                        setShowStations(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        videoId === station.id 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-white text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                      }`}
                    >
                      {station.name}
                    </button>
                  ))}
                </div>
                
                <form onSubmit={handleCustomUrl} className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      placeholder="Paste YouTube URL..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full bg-white dark:bg-slate-700 text-sm rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none border border-slate-200 dark:border-slate-600 focus:border-indigo-500"
                    />
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    Play
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="hidden">
          <YouTube 
            videoId={videoId} 
            opts={{ playerVars: { autoplay: 1, controls: 0 } }} 
            onReady={onPlayerReady} 
            onStateChange={(e) => {
              // Update playing state if it changes outside our controls
              if (e.data === 1) setIsMusicPlaying(true);
              if (e.data === 2) setIsMusicPlaying(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};
