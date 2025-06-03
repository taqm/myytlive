import { Box, Button, Paper } from '@mui/material';
import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

type VideoPlayerProps = {
  onTimeUpdate?: (currentTime: number) => void;
};

export const VideoPlayer = ({ onTimeUpdate }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
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

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ width: '100%', position: 'relative' }}>
        {videoUrl ? (
          <video
            ref={videoRef}
            controls
            style={{ width: '100%', maxHeight: '70vh' }}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
          />
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