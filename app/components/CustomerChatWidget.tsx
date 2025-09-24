import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface CustomerChatWidgetProps {
  shopDomain: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

export function CustomerChatWidget({
  shopDomain,
  position = 'bottom-right',
  theme = 'light'
}: CustomerChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/customer-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          sessionId,
          shopDomain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const themeClasses = {
    light: {
      widget: 'bg-white border-gray-200',
      header: 'bg-blue-600 text-white',
      input: 'bg-white border-gray-300 text-gray-900',
      button: 'bg-blue-600 text-white hover:bg-blue-700',
      message: {
        user: 'bg-blue-600 text-white',
        bot: 'bg-gray-100 text-gray-900',
      },
    },
    dark: {
      widget: 'bg-gray-800 border-gray-600',
      header: 'bg-blue-700 text-white',
      input: 'bg-gray-700 border-gray-500 text-white',
      button: 'bg-blue-700 text-white hover:bg-blue-800',
      message: {
        user: 'bg-blue-700 text-white',
        bot: 'bg-gray-700 text-gray-100',
      },
    },
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={`fixed ${positionClasses[position]} z-50 w-14 h-14 rounded-full shadow-lg ${themeClasses[theme].button} transition-all duration-300 hover:scale-110`}
        aria-label="Open chat"
      >
        <svg
          className="w-6 h-6 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed ${positionClasses[position]} z-50 w-80 h-96 rounded-lg shadow-2xl border ${themeClasses[theme].widget} flex flex-col`}>
          {/* Header */}
          <div className={`px-4 py-3 rounded-t-lg ${themeClasses[theme].header} flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <p>Hi! I'm your AI assistant. How can I help you today?</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.sender === 'user'
                    ? `ml-auto ${themeClasses[theme].message.user}`
                    : `mr-auto ${themeClasses[theme].message.bot}`
                  }`}
              >
                {message.content}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>AI is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeClasses[theme].input}`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${inputValue.trim() && !isLoading
                    ? themeClasses[theme].button
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
