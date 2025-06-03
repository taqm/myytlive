import { Avatar, Box, Button, IconButton, Paper, Stack, Typography, InputBase } from '@mui/material';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useRef, useState } from 'react';

export type ChatMessage = {
  timestampSec: number;
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
  currentTime?: number;
};

const getSuperChatColors = (amount: string) => {
  // 金額を数値に変換（¥や,を除去）
  const value = parseInt(amount.replace(/[¥,]/g, ''));

  if (value >= 50000) {
    return {
      background: '#E62117',
      headerBackground: '#C00000',
      text: '#FFFFFF',
    };
  } else if (value >= 10000) {
    return {
      background: '#E91E63',
      headerBackground: '#C2185B',
      text: '#FFFFFF',
    };
  } else if (value >= 5000) {
    return {
      background: '#E65100',
      headerBackground: '#BF360C',
      text: '#FFFFFF',
    };
  } else if (value >= 2000) {
    return {
      background: '#F57C00',
      headerBackground: '#E65100',
      text: '#FFFFFF',
    };
  } else if (value >= 500) {
    return {
      background: '#FDD835',
      headerBackground: '#F9A825',
      text: '#000000',
    };
  } else if (value >= 200) {
    return {
      background: '#4CAF50',
      headerBackground: '#2E7D32',
      text: '#FFFFFF',
    };
  } else {
    return {
      background: '#2196F3',
      headerBackground: '#1976D2',
      text: '#FFFFFF',
    };
  }
};

const isMember = (badge?: string) => {
  if (!badge) return false;
  return badge.includes('メンバー') || badge.includes('Member') || badge.includes('member');
};

const isOwner = (badge?: string) => {
  if (!badge) return false;
  return badge.includes('オーナー') || badge.includes('Owner');
};

const isModerator = (badge?: string) => {
  if (!badge) return false;
  return badge.includes('モデレーター') || badge.includes('Moderator');
};

const getUsernameColor = (badge?: string) => {
  if (isOwner(badge)) return '#ffd600';
  if (isModerator(badge)) return '#5e84f1';
  if (isMember(badge)) return '#2ba640';
  return 'text.primary';
};

const getBadgeStyle = (badge?: string) => {
  if (isOwner(badge)) {
    return {
      color: '#ffd600',
      backgroundColor: 'rgba(255, 214, 0, 0.1)',
    };
  }
  if (isModerator(badge)) {
    return {
      color: '#5e84f1',
      backgroundColor: 'rgba(94, 132, 241, 0.1)',
    };
  }
  if (isMember(badge)) {
    return {
      color: '#2ba640',
      backgroundColor: 'rgba(43, 166, 64, 0.1)',
    };
  }
  return {
    color: 'text.secondary',
    backgroundColor: 'action.hover',
  };
};

const formatSeconds = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

export const ChatPanel = ({ messages, onChatFileLoad, currentTime }: ChatPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  // スクロール位置の監視
  const handleScroll = () => {
    if (!chatBoxRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatBoxRef.current;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 50;
    
    setAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom);
  };

  // 最下部にスクロール
  const scrollToBottom = () => {
    if (!chatBoxRef.current) return;
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    setAutoScroll(true);
    setShowScrollButton(false);
  };

  // 現在の再生時間に応じてメッセージをフィルタリング
  useEffect(() => {
    if (currentTime === undefined) {
      setVisibleMessages(messages);
      return;
    }

    const filtered = messages.filter(msg => msg.timestampSec <= currentTime);
    setVisibleMessages(filtered);

    // 自動スクロールが有効な場合のみスクロール
    if (autoScroll && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [currentTime, messages, autoScroll]);

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

      // タイムスタンプでソート
      chatData.sort((a, b) => a.timestampSec - b.timestampSec);
      onChatFileLoad(chatData);
      setAutoScroll(true);
    } catch (error) {
      console.error('チャットファイルの読み込みに失敗しました:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const currentSeconds = Math.floor(currentTime || 0);
    const newMessage: ChatMessage = {
      timestampSec: currentSeconds,
      timestampText: formatSeconds(currentSeconds),
      message: inputMessage.trim(),
      username: 'あなた',
      userIcon: undefined,
    };

    onChatFileLoad([...messages, newMessage]);
    setInputMessage('');
    setAutoScroll(true);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper 
      sx={{ 
        height: '70vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
        position: 'relative',
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
        ref={chatBoxRef}
        onScroll={handleScroll}
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
          visibleMessages.map((message, index) => (
            <Box 
              key={index} 
              sx={{ 
                p: 1,
                '&:hover': {
                  backgroundColor: message.superchat ? undefined : 'action.hover',
                },
                ...(message.superchat && {
                  backgroundColor: getSuperChatColors(message.superchat.amount).background,
                }),
              }}
            >
              {message.superchat ? (
                <Box>
                  <Box
                    sx={{
                      backgroundColor: getSuperChatColors(message.superchat.amount).headerBackground,
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={message.userIcon}
                        sx={{ width: 24, height: 24 }}
                      >
                        {message.username[0]}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color: getSuperChatColors(message.superchat.amount).text,
                            display: 'block',
                          }}
                        >
                          {message.username}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: getSuperChatColors(message.superchat.amount).text,
                            opacity: 0.8,
                          }}
                        >
                          {message.superchat.amount}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ 
                          color: getSuperChatColors(message.superchat.amount).text,
                          opacity: 0.8,
                        }}
                      >
                        {message.timestampText}
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getSuperChatColors(message.superchat.amount).text,
                      px: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {message.message}
                  </Typography>
                </Box>
              ) : (
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Avatar
                    src={message.userIcon}
                    sx={{ width: 24, height: 24 }}
                  >
                    {message.username[0]}
                  </Avatar>
                  <Box
                    sx={{
                      flex: 1,
                      ...(isOwner(message.badge) && {
                        p: 1,
                        border: '1px solid',
                        borderColor: '#ffd600',
                        borderRadius: 1,
                        backgroundColor: 'rgba(255, 214, 0, 0.1)',
                      }),
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 'bold',
                          color: getUsernameColor(message.badge),
                        }}
                      >
                        {message.username}
                      </Typography>
                      {message.badge && (
                        <Typography
                          variant="caption"
                          sx={{
                            ...getBadgeStyle(message.badge),
                            px: 0.5,
                            borderRadius: 0.5,
                          }}
                        >
                          {message.badge}
                        </Typography>
                      )}
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
              )}
            </Box>
          ))
        )}
      </Box>

      {showScrollButton && (
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            bottom: 80,
            zIndex: 1,
          }}
        >
          <IconButton
            onClick={scrollToBottom}
            sx={{
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <ArrowDownwardIcon />
          </IconButton>
        </Box>
      )}

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
        <Avatar sx={{ width: 24, height: 24 }}>あ</Avatar>
        <InputBase
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="チャットを送信..."
          sx={{
            flex: 1,
            p: 1,
            borderRadius: 1,
            backgroundColor: 'action.hover',
            fontSize: '0.875rem',
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        <Stack direction="row" spacing={1}>
          <IconButton size="small">
            <SentimentSatisfiedAltIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            sx={{
              color: inputMessage.trim() ? 'primary.main' : 'text.disabled',
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
};

function convertToChatMessage(data: any): ChatMessage | null {
  if (!data.replayChatItemAction) return null;
  if (!data.replayChatItemAction.actions[0]) return null;

  const act = data.replayChatItemAction.actions[0].addChatItemAction;
  if (!act) return null;

  const item = act.item;
  if (!item) return null;

  const renderer = item.liveChatTextMessageRenderer || item.liveChatPaidMessageRenderer;

  const message = renderer.message.runs[0].text;
  const username = renderer.authorName.simpleText;
  const timestampText = renderer.timestampText.simpleText; // hh:mm:ss or mm:ss

  const timestampSec = (() => {
    const isNegative = timestampText.startsWith('-');
    const timeText = isNegative ? timestampText.slice(1) : timestampText;
    
    const parts = timeText.split(':');
    let seconds = 0;
    if (parts.length === 3) { // hh:mm:ss
      seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    } else if (parts.length === 2) { // mm:ss
      seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    return isNegative ? -seconds : seconds;
  })();

  console.log(timestampSec);

  const userIcon = renderer.authorPhoto.thumbnails[0].url;

  return {
    userIcon: userIcon,
    timestampText: timestampText,
    timestampSec: timestampSec,
    message: message,
    username: username,
    superchat: renderer.purchaseAmountText ? {
      amount: renderer.purchaseAmountText.simpleText,
      message: message,
    } : undefined,
    badge: renderer.authorBadges?.[0] ? renderer.authorBadges[0].liveChatAuthorBadgeRenderer.tooltip : undefined,
  };
}