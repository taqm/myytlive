import { Box, Button, Paper, Typography } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

type VideoPlayerProps = {
  onTimeUpdate?: (currentTime: number) => void;
};

export const VideoPlayer = ({ onTimeUpdate }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFileName(file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      // 秒に変換
      const currentTimeSec = Math.floor(videoRef.current.currentTime);
      onTimeUpdate(currentTimeSec);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const SEEK_SECONDS = 5;

    switch (event.key) {
      case 'ArrowLeft':
        video.currentTime = Math.max(0, video.currentTime - SEEK_SECONDS);
        break;
      case 'ArrowRight':
        video.currentTime = Math.min(video.duration, video.currentTime + SEEK_SECONDS);
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ width: '100%', position: 'relative' }}>
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              controls
              style={{ width: '100%', maxHeight: '70vh' }}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                color: 'text.secondary',
                textAlign: 'left',
              }}
            >
              {fileName}
            </Typography>
          </>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '70vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Button variant="contained" onClick={handleUploadClick}>
              動画をアップロード
            </Button>
          </Box>
        )}
      </Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        style={{ display: 'none' }}
      />
    </Paper>
  );
}; 