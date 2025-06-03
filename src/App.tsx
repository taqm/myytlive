import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { VideoPlayer } from './components/VideoPlayer';
import { ChatPanel, type ChatMessage } from './components/ChatPanel';
import { useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const handleChatFileLoad = (loadedMessages: ChatMessage[]) => {
    // タイムスタンプでソート
    const sortedMessages = [...loadedMessages].sort((a, b) => a.timestampSec - b.timestampSec);
    setMessages(sortedMessages);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeek = () => {
    setShouldScrollToBottom(true);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: '1 1 70%' }}>
              <VideoPlayer 
                onTimeUpdate={handleTimeUpdate}
                onSeek={handleSeek}
              />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: 350 }}>
              <ChatPanel 
                messages={messages}
                onChatFileLoad={handleChatFileLoad}
                currentTime={currentTime}
                shouldScrollToBottom={shouldScrollToBottom}
                onScrollComplete={() => setShouldScrollToBottom(false)}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
