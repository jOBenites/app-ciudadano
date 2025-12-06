import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  id: string;
  sender: 'user' | 'police';
  text: string;
  timestamp: string;
}

export function PoliceChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    pollIntervalRef.current = window.setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/chat-messages`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/chat-messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            sender: 'user',
            text: newMessage
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        // Fetch messages immediately to show the new message
        setTimeout(() => fetchMessages(), 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3>Chat con Policía</h3>
            <p className="text-sm text-indigo-100">En línea - Tiempo de respuesta: 2-5 min</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-indigo-100' : 'bg-blue-100'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Bot className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <div className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <p>{message.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Este chat es monitoreado por personal autorizado. En caso de emergencia, llama al 911.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-gray-900 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setNewMessage('Necesito reportar una actividad sospechosa')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors text-left"
          >
            📢 Reportar actividad sospechosa
          </button>
          <button
            onClick={() => setNewMessage('¿Cuál es el tiempo de respuesta en mi zona?')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors text-left"
          >
            ⏱️ Tiempo de respuesta
          </button>
          <button
            onClick={() => setNewMessage('¿Cómo puedo mejorar la seguridad en mi comunidad?')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors text-left"
          >
            💡 Consejos de seguridad
          </button>
        </div>
      </div>
    </div>
  );
}