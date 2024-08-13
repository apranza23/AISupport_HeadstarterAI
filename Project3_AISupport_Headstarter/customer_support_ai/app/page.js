'use client';

import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I am your support assistant. How may I assist you?" },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let lastMessageIndex = messages.length - 1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: updatedMessages[lastMessageIndex].content + text,
          };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box width={"100vw"} height={"100vh"} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
      <Stack direction={'column'} width={'500px'} height={'700px'} border={'1px solid black'} p={2} spacing={3}>
        <Stack direction={'column'} spacing={2} flexGrow={1} overflow={'auto'} maxHeight={'100%'}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              display={'flex'}
              justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
              color={'white'}
              borderRadius={16}
              p={3}
              bgcolor={msg.role === 'assistant' ? 'grey' : 'blue'}
            >
              {msg.content}
            </Box>
          ))}
          <div ref={messagesEndRef} />
          <Stack direction={'row'} spacing={2}>
            <TextField
              label='Message'
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <Button variant="contained" onClick={sendMessage}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
