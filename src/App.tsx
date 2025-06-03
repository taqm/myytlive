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

  const handleChatFileLoad = (loadedMessages: ChatMessage[]) => {
    // タイムスタンプでソート
    const sortedMessages = [...loadedMessages].sort((a, b) => a.timestamp - b.timestamp);
    setMessages(sortedMessages);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: '1 1 70%' }}>
              <VideoPlayer />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: 350 }}>
              <ChatPanel 
                messages={messages}
                onChatFileLoad={handleChatFileLoad}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
