import { useEffect, useRef, useState } from "react";
import { 
  Box, 
  IconButton, 
  TextField, 
  Typography, 
  Paper, 
  Divider, 
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  Avatar,
  Chip,
  CircularProgress
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  ExitToApp as ExitIcon,
  Route as RouteIcon,
  DirectionsCar as FleetIcon,
  Update as UpdateIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  History as HistoryIcon,
  Star as StarIcon,
  MoreVert as MoreIcon,
  AttachFile as AttachIcon,
  Mood as MoodIcon,
  Mic as MicIcon
} from "@mui/icons-material";
import axios from "axios";
import config from './../config';
import './ChatBot.css';

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseBotData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map(item => ({ sender: "bot", message: item }));
    } else if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => ({
        sender: "bot",
        message: `${key}. ${value}`
      }));
    } else {
      return [];
    }
  };
  
  const handleToggleChat = async () => {
    if (open) {
      await axios.post(`${config.CHATBOT_API_BASE_URL}/api/reset`);
      setChat([]);
      setInput("");
      setOpen(false);
    } else {
      setIsLoading(true);
      try {
        const res = await axios.post(`${config.CHATBOT_API_BASE_URL}/api/start_conversation`);
        const response = res.data.response;
        const botMsgs = [
          { sender: "bot", message: response.message },
          ...parseBotData(response.data)
        ];
        setChat(botMsgs);
        setOpen(true);
      } catch (err) {
        setChat([{ sender: "bot", message: "Failed to load conversation. Please try again later." }]);
        setOpen(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    const updatedChat = [...chat, { sender: "user", message: userMsg }];
    setChat(updatedChat);
    setInput("");
    setIsLoading(true);

    if (userMsg.toLowerCase() === "exit") {
      await axios.post(`${config.CHATBOT_API_BASE_URL}/api/reset`);
      setChat([]);
      setOpen(false);
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("token:",token)
    try {
      const res = await axios.post(
        `${config.CHATBOT_API_BASE_URL}/api/send_message`, 
        { message: userMsg }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resMsg = res.data.response;

      const botMessages = [
        { sender: "bot", message: resMsg.message },
        ...parseBotData(resMsg.data)
      ];
      
      setChat([...updatedChat, ...botMessages]);
    } catch (error) {
      setChat([...updatedChat, { sender: "bot", message: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => scrollToBottom(), [chat]);

  const renderMessage = (msg, i) => {
    const isUser = msg.sender === "user";
    
    if (isUser) {
      return (
        <Box key={i} sx={{ display: "flex", justifyContent: "flex-end", mb: 2, px: 2 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            maxWidth: '90%'
          }}>
            <Box sx={{
              bgcolor: "primary.main",
              color: "black",
              p: 1.5,
              borderRadius: "18px 18px 4px 18px",
              maxWidth: "100%",
              border:"1px solid #a8bc7b",
              background: "#a8bc7b5e",
              wordBreak: 'break-word'
            }}>
              <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>{msg.message}</Typography>
            </Box>
            <Avatar sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'primary.dark',
              '& svg': { fontSize: '1rem' }
            }}>
              <UserIcon />
            </Avatar>
          </Box>
        </Box>
      );
    }

    // Special rendering for bot messages with options
    if (msg.message.includes("Please select any of the following")) {
      return (
        <Box key={i} sx={{ mb: 3, px: 2 }}>
          <Box sx={{
            bgcolor: "background.paper",
            p: 2,
            borderRadius: "16px",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 1.5
            }}>
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: "#a8bc7b",
                '& svg': { fontSize: '1rem' }
              }}>
                <BotIcon />
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>AI Assistant</Typography>
              {/* <Chip 
                label="Online" 
                size="small" 
                color="#a8bc7b"
                sx={{ 
                  height: 18,
                  fontSize: '0.65rem',
                  ml: 'auto',
                  '& .MuiChip-label': { px: 0.75 }
                }} 
              /> */}
            </Box>
            
            <Divider sx={{ mb: 2, opacity: 0.5 }} />
            
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {msg.message}
            </Typography>
            
            <List dense sx={{ p: 0 }}>
              {[
                { icon: <RouteIcon color="primary" />, text: "Plan a route" },
                { icon: <FleetIcon color="success" />, text: "Get fleet status" },
                { icon: <UpdateIcon color="info" />, text: "Update fleet status" },
                
              
                // { icon: <HelpIcon />, text: "Get help", color: "error" }
              ].map((item, index) => (
                <ListItem 
                  key={index} 
                  button 
                  sx={{ 
                    borderRadius: "8px", 
                    p: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box color={`${item.color}.main`}>
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { fontWeight: 500 }
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      );
    }

    // Default bot message
    return (
      <Box key={i} sx={{ display: "flex", justifyContent: "flex-start", mb: 2, px: 2 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '90%'
        }}>
          <Avatar sx={{ 
            width: 20, 
            height: 20, 
            bgcolor: '#a8bc7b',
            '& svg': { fontSize: '1rem' }
          }}>
            <BotIcon />
          </Avatar>
          <Box sx={{
            bgcolor: "background.paper",
            p: 1,
            borderRadius: "18px 18px 18px 4px",
            maxWidth: "100%",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            wordBreak: 'break-word'
          }}>
            <Typography variant="body1" sx={{ fontSize: '0.875rem' }}>{msg.message}</Typography>
            {isLoading && i === chat.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={16} thickness={5} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {!open ? (
        <Box sx={{ 
          position: 'relative',
          '&:hover .floating-button-tooltip': {
            opacity: 1,
            transform: 'translateX(0)'
          }
        }}>
          <IconButton 
            onClick={handleToggleChat}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              width: 46,
              height: 46,
              "&:hover": { 
                bgcolor: "#539fb8",
                transform: "scale(1.1)",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)"
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)"
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} thickness={4} sx={{ color: 'white' }} />
            ) : (
              <ChatIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>
          <Box className="floating-button-tooltip" sx={{
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            mr: 1,
            bgcolor: "#a8bc7b",
            color: 'text.primary',
            px: 1.5,
            py: 0.5,
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            opacity: 0,
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            <StarIcon sx={{ fontSize: '0.875rem', color: 'warning.main' }} />
            AI Assistant
          </Box>
        </Box>
      ) : (
        <Fade in={open}>
          <Paper elevation={10} sx={{ 
            width: 333, 
            height: 453, 
            display: "flex", 
            flexDirection: "column",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
            background: "linear-gradient(to bottom, #f8f9fa, #f1f3f5)",
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            {/* Header */}
            <Box sx={{ 
              p: 1.5, 
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#539fb8",
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: "#a8bc7b",
                  '& svg': { fontSize: '1rem' }
                }}>
                  <BotIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    Fleet AI Assistant
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    opacity: 0.9,
                    fontSize: '0.65rem'
                  }}>
                    <Box sx={{ 
                      width: 6, 
                      height: 6, 
                      bgcolor: 'success.light', 
                      borderRadius: '50%',
                      mr: 0.5,
                      boxShadow: '0 0 6px rgba(76, 175, 80, 0.8)'
                    }} />
                    Online 
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* <IconButton size="small" sx={{ color: "white", opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <HistoryIcon fontSize="small" />
                </IconButton> */}
                {/* <IconButton size="small" sx={{ color: "white", opacity: 0.8, '&:hover': { opacity: 1 } }}>
                  <MoreIcon fontSize="small" />
                </IconButton> */}
                <IconButton 
                  size="small" 
                  onClick={handleToggleChat}
                  sx={{ 
                    color: "white", 
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.2)'
                    } 
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Chat Content */}
            <Box sx={{ 
              flex: 1, 
              p: 1,
              overflowY: "auto",
              background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '3px'
              }
            }}>
              {/* Welcome message */}
              <Box sx={{ 
                textAlign: 'center', 
                p: 2,
                mb: 1
              }}>
                <Chip 
                  label="Today" 
                  size="small" 
                  sx={{ 
                    bgcolor: 'background.default',
                    fontSize: '0.65rem',
                    height: 20,
                    mb: 1
                  }} 
                />
                <Typography variant="caption" sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  fontSize: '0.75rem'
                }}>
                  Conversation started at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Typography>
              </Box>
              
              {chat.map((msg, i) => renderMessage(msg, i))}
              <div ref={chatEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ 
              p: 1.5, 
              borderTop: "1px solid rgba(0, 0, 0, 0.05)",
              bgcolor: "background.paper",
              position: 'relative'
            }}>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                mb: 1
              }}>
                <IconButton size="small" sx={{ color: "text.secondary" }}>
                  <AttachIcon fontSize="small" />
                </IconButton>
                <TextField
                  fullWidth
                 
                  size="small"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  sx={{
                    
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "24px", fontSize:"10px",padding:"5px",
                      bgcolor: "background.default",
                      "& fieldset": {
                        borderColor: "rgba(0, 0, 0, 0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(0, 0, 0, 0.15)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "primary.main",
                        boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.2)"
                      },
                    },
                  }}
                //   InputProps={{
                //     startAdornment: (
                //       <IconButton size="small" sx={{ mr: -1, color: "text.secondary" }}>
                //         <MoodIcon fontSize="small" />
                //       </IconButton>
                //     ),
                //   }}
                />
                {input ? (
                  <IconButton 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    sx={{ 
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { 
                        bgcolor: "primary.dark",
                        transform: "scale(1.05)"
                      },
                      "&:disabled": { bgcolor: "grey.300" },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton size="small" sx={{ color: "text.secondary" }}>
                    <MicIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="caption" sx={{ 
                display: "flex", 
                alignItems: "center",
                justifyContent: "center",
                color: "text.disabled",
                fontSize: '0.65rem'
              }}>
                <ExitIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7 }} /> 
                Type "exit" to end conversation
              </Typography>
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
};

export default ChatBot;