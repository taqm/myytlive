import { Box, Button, Paper, Typography } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

type VideoPlayerProps = {
  onTimeUpdate?: (currentTime: number) => void;
  onSeek?: () => void;
};

export const VideoPlayer = ({ onTimeUpdate, onSeek }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && (file.type.startsWith('video/') || file.type === 'video/webm' || file.name.endsWith('.mkv'))) {
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

  const handleSeeking = () => {
    if (onSeek) {
      onSeek();
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
      <Box 
        sx={{ 
          width: '100%', 
          position: 'relative',
          ...(isDragging && {
            outline: '2px dashed',
            outlineColor: 'primary.main',
            backgroundColor: 'action.hover',
          }),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              controls
              style={{ width: '100%', maxHeight: '70vh' }}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
              gap: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              動画ファイルをドラッグ&ドロップ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              または
            </Typography>
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
        accept="video/*,.webm,.mkv"
        style={{ display: 'none' }}
      />
    </Paper>
  );
}; 