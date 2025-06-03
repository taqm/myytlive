import { Avatar, Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useRef } from 'react';

export type ChatMessage = {
  timestamp: number;
  timestampText: string;
  message: string;
  username: string;
  userIcon?: string;
  superchat?: {
    amount: string;
    message: string;
  };
  badge?: string
};

type ChatPanelProps = {
  messages: ChatMessage[];
  onChatFileLoad: (messages: ChatMessage[]) => void;
};

export const ChatPanel = ({ messages, onChatFileLoad }: ChatPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const chatData: ChatMessage[] = [];

      for (let i = 0; i < lines.length; i++) {
        try {
          const line = lines[i];
          const data = JSON.parse(line);

          const message = convertToChatMessage(data);

          if (message) {
            chatData.push(message);
          } else {
            console.warn(`行 ${i + 1} の解析に失敗しました:`, data);
          }

        } catch (error) {
          console.warn(`行 ${i + 1} の解析に失敗しました:`, error);
          continue;
        }
      }

      if (chatData.length === 0) {
        throw new Error('有効なチャットメッセージが見つかりませんでした。');
      }

      onChatFileLoad(chatData);
    } catch (error) {
      console.error('チャットファイルの読み込みに失敗しました:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper 
      sx={{ 
        height: '70vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
      }}
      elevation={0}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          ライブ チャット
        </Typography>
        <IconButton size="small" onClick={handleUploadClick}>
          <UploadFileIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={handleUploadClick}
            >
              チャットファイルを読み込む
            </Button>
          </Box>
        ) : (
          messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Avatar
                  src={message.userIcon}
                  sx={{ width: 24, height: 24 }}
                >
                  {message.username[0]}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                      }}
                    >
                      {message.username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary' }}
                    >
                      {message.timestampText}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.message}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))
        )}
      </Box>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jsonl,.txt"
        style={{ display: 'none' }}
      />

      <Box
        sx={{
          p: 1,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar sx={{ width: 24, height: 24 }}>Y</Avatar>
        <Box
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            backgroundColor: 'action.hover',
            color: 'text.secondary',
            fontSize: '0.875rem',
          }}
        >
          チャットを送信...
        </Box>
        <IconButton size="small">
          <SentimentSatisfiedAltIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );
}; 

function convertToChatMessage(data: any): ChatMessage  | null{
  if (!data.replayChatItemAction) return null;
  if (!data.replayChatItemAction.actions[0]) return null;

  const act = data.replayChatItemAction.actions[0].addChatItemAction;
  if (!act) return null;

  const item = act.item;
  if (!item) return null;

  const renderer = item.liveChatTextMessageRenderer || item.liveChatPaidMessageRenderer;

  const message = renderer.message.runs[0].text;
  const username = renderer.authorName.simpleText;
  const timestampText = renderer.timestampText.simpleText;
  const timestamp = Math.floor(renderer.timestampUsec / 1000);
  const userIcon = renderer.authorPhoto.thumbnails[0].url;

  return {
    userIcon: userIcon,
    timestampText: timestampText,
    timestamp: timestamp,
    message: message,
    username: username,
    superchat: renderer.purchaseAmountText ? {
      amount: renderer.purchaseAmountText.simpleText,
      message: message,
    } : undefined,
    badge: renderer.authorBadges[0] ? renderer.authorBadges[0].liveChatAuthorBadgeRenderer.tooltip : undefined,
  };
}