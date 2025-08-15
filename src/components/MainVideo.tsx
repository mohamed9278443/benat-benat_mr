import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MainVideoProps {
  videoUrl: string;
  className?: string;
}

export const MainVideo: React.FC<MainVideoProps> = ({ videoUrl, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Convert video URLs to embed format
  const getEmbedUrl = (url: string) => {
    // YouTube URLs
    const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const youtubeMatch = url.match(youtubeRegExp);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
      return `https://www.youtube.com/embed/${youtubeMatch[2]}?enablejsapi=1`;
    }

    // TikTok URLs
    if (url.includes('tiktok.com')) {
      const tiktokRegExp = /(?:https?:\/\/)?(?:www\.)?(?:vm\.)?tiktok\.com\/[@\w\-._]*\/video\/(\d+)/;
      const tiktokMatch = url.match(tiktokRegExp);
      if (tiktokMatch) {
        return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
      }
      // Handle short URLs
      const shortRegExp = /(?:https?:\/\/)?(?:vm\.)?tiktok\.com\/(\w+)/;
      const shortMatch = url.match(shortRegExp);
      if (shortMatch) {
        return url; // TikTok short URLs need to be handled differently
      }
    }

    // Facebook URLs
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      const fbRegExp = /(?:https?:\/\/)?(?:www\.)?(?:facebook\.com\/watch\/?\?v=|fb\.watch\/)(\d+)/;
      const fbMatch = url.match(fbRegExp);
      if (fbMatch) {
        return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${fbMatch[1]}`;
      }
    }

    return url;
  };

  const isExternalVideo = videoUrl.includes('youtube.com') || 
                         videoUrl.includes('youtu.be') || 
                         videoUrl.includes('tiktok.com') || 
                         videoUrl.includes('facebook.com') || 
                         videoUrl.includes('fb.watch');

  // Generate thumbnail from video
  const generateThumbnail = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 1; // Capture frame at 1 second
    
    video.addEventListener('seeked', function captureThumbnail() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setThumbnail(thumbnailDataUrl);
      }
      
      video.currentTime = 0; // Reset to beginning
      video.removeEventListener('seeked', captureThumbnail);
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => {
      setDuration(video.duration);
      if (!thumbnail) {
        generateThumbnail();
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));
    video.addEventListener('play', () => setShowThumbnail(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
      video.removeEventListener('play', () => setShowThumbnail(false));
    };
  }, [thumbnail]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
      setShowThumbnail(false);
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime += seconds;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isExternalVideo) {
    const embedUrl = getEmbedUrl(videoUrl);
    
    return (
      <div className={`w-full max-w-4xl mx-auto ${className}`}>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="فيديو توضيحي"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-auto"
        onClick={togglePlay}
        poster={thumbnail || "/placeholder.svg"}
      >
        <source src={videoUrl} type="video/mp4" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>

      {/* Custom Thumbnail Overlay */}
      {showThumbnail && thumbnail && !isPlaying && (
        <div 
          className="absolute inset-0 cursor-pointer bg-black/20 flex items-center justify-center"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
            <Play className="h-8 w-8 text-black ml-1" />
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4 text-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm">{formatTime(duration)}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
