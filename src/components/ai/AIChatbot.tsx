import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, Bot, User, Sparkles, Clock, Calendar, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'booking' | 'payment' | 'general';
}

interface AIChatbotProps {
  businessId: string;
  className?: string;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ businessId, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI booking assistant. I can help you schedule appointments, check availability, process payments, and answer any questions about your services. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let botResponse = '';
      let responseType: 'booking' | 'payment' | 'general' = 'general';

      if (inputValue.toLowerCase().includes('book') || inputValue.toLowerCase().includes('appointment')) {
        botResponse = 'I\'d be happy to help you book an appointment! What service are you interested in and what date works best for you? I can also suggest optimal times based on your preferences.';
        responseType = 'booking';
      } else if (inputValue.toLowerCase().includes('payment') || inputValue.toLowerCase().includes('pay')) {
        botResponse = 'I can help you with payment processing. Would you like to set up automatic payments, check your payment history, or process a payment for a booking?';
        responseType = 'payment';
      } else if (inputValue.toLowerCase().includes('reschedule') || inputValue.toLowerCase().includes('change')) {
        botResponse = 'No problem! I can help you reschedule your appointment. Please provide your booking reference number or email, and I\'ll show you available alternative times.';
        responseType = 'booking';
      } else if (inputValue.toLowerCase().includes('cancel')) {
        botResponse = 'I understand you need to cancel an appointment. I\'ll need your booking reference or email to locate your appointment. Please note our cancellation policy for any applicable fees.';
        responseType = 'booking';
      } else {
        botResponse = 'I\'m here to help with bookings, payments, rescheduling, and general questions about our services. Is there something specific I can assist you with today?';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: responseType
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-3 w-3" />;
      case 'payment':
        return <CreditCard className="h-3 w-3" />;
      default:
        return <MessageCircle className="h-3 w-3" />;
    }
  };

  return (
    <Card className={`h-full flex flex-col bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20 ${className}`}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-3 text-accent-foreground">
          <div className="p-2 rounded-lg bg-accent/10">
            <Bot className="h-5 w-5" />
          </div>
          AI Assistant
          <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className={`text-xs ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-accent text-accent-foreground'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col max-w-[80%] ${
                  message.sender === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`p-3 rounded-lg text-sm ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border shadow-sm'
                  }`}>
                    {message.text}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    {message.type && getMessageIcon(message.type)}
                    <Clock className="h-3 w-3" />
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border rounded-lg p-3 shadow-sm">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-accent rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-accent rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-accent rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t bg-card/50">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setInputValue('Book an appointment')}
            >
              📅 Book appointment
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setInputValue('Check my bookings')}
            >
              📋 My bookings
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setInputValue('Payment help')}
            >
              💳 Payment help
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};