/**
 * Fissales Chatbot Widget
 * Customer-facing chatbot integration script
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    appUrl: 'https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app',
    position: 'bottom-right', // 'bottom-right' or 'bottom-left'
    theme: 'light', // 'light' or 'dark'
    enabled: true,
    debug: false
  };

  // Helper functions for cookie management (from Villma reference)
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  function getOrCreateSessionId() {
    let sessionId = getCookie('fissales_chatbot_sessionId');
    if (!sessionId) {
      if (window.crypto && window.crypto.randomUUID) {
        sessionId = crypto.randomUUID();
      } else {
        // Fallback for older browsers
        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      }
      setCookie('fissales_chatbot_sessionId', sessionId);
    }
    return sessionId;
  }

  // Get shop domain from current page
  function getShopDomain() {
    const hostname = window.location.hostname;
    if (hostname.includes('.myshopify.com')) {
      return hostname;
    }
    // For custom domains, try to get from Shopify global object
    if (window.Shopify && window.Shopify.shop) {
      return window.Shopify.shop + '.myshopify.com';
    }
    return null;
  }

  // Get customer ID from Shopify context
  function getCustomerId() {
    if (window.Shopify && window.Shopify.customer) {
      return window.Shopify.customer.id;
    }
    return null;
  }

  // Load React and necessary dependencies
  function loadDependencies() {
    return new Promise((resolve, reject) => {
      // Check if React is already loaded
      if (window.React && window.ReactDOM) {
        resolve();
        return;
      }

      // Load React from CDN
      const reactScript = document.createElement('script');
      reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
      reactScript.crossOrigin = 'anonymous';
      
      const reactDOMScript = document.createElement('script');
      reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
      reactDOMScript.crossOrigin = 'anonymous';

      let loadedCount = 0;
      const onLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          resolve();
        }
      };

      reactScript.onload = onLoad;
      reactDOMScript.onload = onLoad;
      reactScript.onerror = reject;
      reactDOMScript.onerror = reject;

      document.head.appendChild(reactScript);
      document.head.appendChild(reactDOMScript);
    });
  }

  // Customer Chat Widget Component (simplified version without JSX)
  function CustomerChatWidget({ shopDomain, position, theme }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [sessionId, setSessionId] = React.useState('');

    React.useEffect(() => {
      const newSessionId = getOrCreateSessionId();
      setSessionId(newSessionId);
    }, []);

    const sendMessage = async (message) => {
      if (!message.trim() || isLoading) return;

      const userMessage = {
        id: Date.now().toString(),
        content: message.trim(),
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);

      try {
        const chatEnvelope = {
          message: message.trim(),
          sessionId,
          customerId: getCustomerId() // Get from Shopify context
        };

        const response = await fetch(`${CONFIG.appUrl}/api/customer-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shop-Domain': shopDomain,
          },
          body: JSON.stringify({ chatEnvelope }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        const botMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response || 'Sorry, I could not process your request.',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
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

    const handleSubmit = (e) => {
      e.preventDefault();
      sendMessage(inputValue);
    };

    const toggleChat = () => {
      setIsOpen(!isOpen);
    };

    const positionClasses = {
      'bottom-right': 'bottom: 1rem; right: 1rem;',
      'bottom-left': 'bottom: 1rem; left: 1rem;',
    };

    const themeClasses = {
      light: {
        widget: 'background-color: white; border: 1px solid #e5e7eb; color: #111827;',
        header: 'background-color: #2563eb; color: white;',
        input: 'background-color: white; border: 1px solid #d1d5db; color: #111827;',
        button: 'background-color: #2563eb; color: white;',
        message: {
          user: 'background-color: #2563eb; color: white;',
          bot: 'background-color: #f3f4f6; color: #111827;',
        },
      },
      dark: {
        widget: 'background-color: #1f2937; border: 1px solid #4b5563; color: #f9fafb;',
        header: 'background-color: #1d4ed8; color: white;',
        input: 'background-color: #374151; border: 1px solid #6b7280; color: white;',
        button: 'background-color: #1d4ed8; color: white;',
        message: {
          user: 'background-color: #1d4ed8; color: white;',
          bot: 'background-color: #374151; color: #f9fafb;',
        },
      },
    };

    return React.createElement('div', null, [
      // Chat Toggle Button
      React.createElement('button', {
        key: 'toggle',
        onClick: toggleChat,
        style: {
          position: 'fixed',
          [position.split('-')[0]]: '1rem',
          [position.split('-')[1]]: '1rem',
          zIndex: 9999,
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          ...themeClasses[theme].button,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        },
        'aria-label': 'Open chat',
      }, React.createElement('svg', {
        style: { width: '1.5rem', height: '1.5rem', margin: 'auto', display: 'block' },
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24',
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
      }))),

      // Chat Widget
      isOpen && React.createElement('div', {
        key: 'widget',
        style: {
          position: 'fixed',
          [position.split('-')[0]]: '1rem',
          [position.split('-')[1]]: '1rem',
          zIndex: 9999,
          width: '20rem',
          height: '24rem',
          borderRadius: '0.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          ...themeClasses[theme].widget,
        },
      }, [
        // Header
        React.createElement('div', {
          key: 'header',
          style: {
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            ...themeClasses[theme].header,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        }, [
          React.createElement('div', {
            key: 'header-left',
            style: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
          }, [
            React.createElement('div', {
              key: 'status',
              style: {
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#10b981',
                borderRadius: '50%',
              },
            }),
            React.createElement('span', {
              key: 'title',
              style: { fontWeight: '600' },
            }, 'AI Assistant'),
          ]),
          React.createElement('button', {
            key: 'close',
            onClick: toggleChat,
            style: {
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            },
            'aria-label': 'Close chat',
          }, React.createElement('svg', {
            style: { width: '1.25rem', height: '1.25rem' },
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
          }, React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M6 18L18 6M6 6l12 12'
          }))),
        ]),

        // Messages Area
        React.createElement('div', {
          key: 'messages',
          style: {
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          },
        }, [
          messages.length === 0 && React.createElement('div', {
            key: 'welcome',
            style: {
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.875rem',
            },
          }, React.createElement('p', null, 'Hi! I\'m your AI assistant. How can I help you today?')),
          
          ...messages.map((message) => React.createElement('div', {
            key: message.id,
            style: {
              maxWidth: '12rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              ...(message.sender === 'user' 
                ? { marginLeft: 'auto', ...themeClasses[theme].message.user }
                : { marginRight: 'auto', ...themeClasses[theme].message.bot }
              ),
            },
          }, message.content)),
          
          isLoading && React.createElement('div', {
            key: 'loading',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6b7280',
              fontSize: '0.875rem',
            },
          }, [
            React.createElement('div', {
              key: 'dots',
              style: { display: 'flex', gap: '0.25rem' },
            }, [1, 2, 3].map(i => React.createElement('div', {
              key: i,
              style: {
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#9ca3af',
                borderRadius: '50%',
                animation: `bounce 1.4s ease-in-out ${i * 0.1}s infinite both`,
              },
            }))),
            React.createElement('span', { key: 'text' }, 'AI is typing...'),
          ]),
        ]),

        // Input Area
        React.createElement('div', {
          key: 'input',
          style: {
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
          },
        }, React.createElement('form', {
          onSubmit: handleSubmit,
          style: { display: 'flex', gap: '0.5rem' },
        }, [
          React.createElement('input', {
            key: 'input-field',
            type: 'text',
            value: inputValue,
            onChange: (e) => setInputValue(e.target.value),
            placeholder: 'Type your message...',
            style: {
              flex: 1,
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
              outline: 'none',
              ...themeClasses[theme].input,
            },
            disabled: isLoading,
          }),
          React.createElement('button', {
            key: 'send',
            type: 'submit',
            disabled: !inputValue.trim() || isLoading,
            style: {
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
              ...(inputValue.trim() && !isLoading 
                ? themeClasses[theme].button 
                : { backgroundColor: '#d1d5db', color: '#6b7280' }
              ),
            },
          }, 'Send'),
        ])),
      ]),
    ]);
  }

  // Initialize the chatbot
  function init() {
    const shopDomain = getShopDomain();
    
    if (!shopDomain) {
      if (CONFIG.debug) console.warn('Fissales Chatbot: Could not determine shop domain');
      return;
    }

    if (!CONFIG.enabled) {
      if (CONFIG.debug) console.log('Fissales Chatbot: Disabled by configuration');
      return;
    }

    // Load dependencies and initialize
    loadDependencies()
      .then(() => {
        // Create container
        const container = document.createElement('div');
        container.id = 'fissales-chatbot-container';
        document.body.appendChild(container);

        // Render the widget
        ReactDOM.render(
          React.createElement(CustomerChatWidget, {
            shopDomain,
            position: CONFIG.position,
            theme: CONFIG.theme,
          }),
          container
        );

        if (CONFIG.debug) console.log('Fissales Chatbot: Initialized successfully');
      })
      .catch((error) => {
        console.error('Fissales Chatbot: Failed to initialize', error);
      });
  }

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }
    
    #fissales-chatbot-container * {
      box-sizing: border-box;
    }
    
    #fissales-chatbot-container button:hover {
      transform: scale(1.05);
    }
  `;
  document.head.appendChild(style);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose configuration for customization
  window.FissalesChatbot = {
    config: CONFIG,
    init: init,
  };

})();
