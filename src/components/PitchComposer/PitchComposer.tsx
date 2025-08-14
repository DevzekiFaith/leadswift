import { useState, useRef, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

interface LeadProfile {
  name: string;
  company: string;
  title: string;
  location: string;
  industry: string;
  interestLevel: number;
  budget: string;
  painPoints: string[];
  recentActivity: string;
}

// Mock lead profile data
const mockLeadProfile: LeadProfile = {
  name: "Sarah Chen",
  company: "TechFlow Solutions",
  title: "VP of Marketing",
  location: "San Francisco, CA",
  industry: "SaaS",
  interestLevel: 92,
  budget: "$25,000 - $50,000",
  painPoints: [
    "Struggling with B2B lead generation",
    "Need to scale marketing operations",
    "Looking for African market expertise"
  ],
  recentActivity: "Posted about needing marketing help on LinkedIn 2 days ago"
};

interface PitchComposerProps {
  user: User;
  selectedLead?: any;
}

export default function PitchComposer({ user, selectedLead }: PitchComposerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: `Hey ${user.email?.split('@')[0]}, I've analyzed Sarah Chen's profile and crafted a personalized pitch for TechFlow Solutions. She's looking for marketing help with African market expertise - perfect match for your services! Want to preview the pitch?`,
      timestamp: new Date(Date.now() - 5000)
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIPitch = async () => {
    setIsTyping(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const aiPitch = `Subject: Unlock African Markets for TechFlow Solutions 🌍

Hi Sarah,

I noticed your recent LinkedIn post about scaling B2B marketing operations. As someone who's helped 50+ SaaS companies break into emerging markets, I believe TechFlow Solutions has incredible potential in Africa.

Here's what caught my attention:
• Your focus on B2B lead generation aligns perfectly with Africa's growing tech ecosystem
• The $25-50K budget range is ideal for our comprehensive market entry strategy
• Your timing is perfect - African SaaS adoption is up 40% this year

What I can offer TechFlow:
✅ Localized lead generation across 15 African countries
✅ Cultural adaptation of your marketing materials
✅ Direct connections to 200+ African tech decision-makers
✅ Proven framework that generated $2M+ for similar SaaS companies

I'd love to show you our case study with a similar SF-based SaaS company that achieved 300% ROI in their African expansion.

Would you be open to a 15-minute call this week to discuss how we can accelerate TechFlow's growth in these high-potential markets?

Best regards,
${user.email?.split('@')[0]}

P.S. I'm based in [Your Location] but work extensively with African markets - giving you the best of both worlds: international standards with local expertise.`;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: aiPitch,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let aiResponse = "";
    
    if (inputMessage.toLowerCase().includes("preview") || inputMessage.toLowerCase().includes("show")) {
      aiResponse = "Perfect! Let me generate a personalized pitch for Sarah Chen. This will take into account her company's needs, recent activity, and the African market angle that makes you unique.";
      setTimeout(generateAIPitch, 1000);
    } else if (inputMessage.toLowerCase().includes("edit") || inputMessage.toLowerCase().includes("change")) {
      aiResponse = "Great idea! I can help you refine the pitch. What specific changes would you like to make? I can adjust the tone, add more technical details, or emphasize different value propositions.";
    } else if (inputMessage.toLowerCase().includes("send")) {
      aiResponse = "Excellent! I'll prepare this pitch for sending. Would you like me to:\n\n1. Send via LinkedIn DM\n2. Send as an email\n3. Schedule for optimal timing\n4. Add it to your follow-up sequence\n\nI recommend LinkedIn first since she's active there, followed by email in 3 days if no response.";
    } else {
      aiResponse = "I understand! Let me help you with that. Based on Sarah's profile, I can adjust the pitch to better match your style and her specific needs. What aspect would you like to focus on?";
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: aiResponse,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
  };

  const saveEditedMessage = () => {
    setMessages(prev => prev.map(msg => 
      msg.id === editingMessageId 
        ? { ...msg, content: editingContent }
        : msg
    ));
    setEditingMessageId(null);
    setEditingContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Left Sidebar - Lead Profile */}
      <div className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50 p-6 overflow-y-auto shadow-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">👤</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Lead Profile</h2>
          </div>
          
          {/* Profile Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 text-white mb-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center text-xl font-bold shadow-lg">
                {mockLeadProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{mockLeadProfile.name}</h3>
                <p className="text-sm text-gray-300">{mockLeadProfile.title}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 font-medium">{mockLeadProfile.company}</p>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div className="bg-gray-700/30 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-400 mb-2 block">📍 Location</label>
              <p className="text-white font-semibold">{mockLeadProfile.location}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-400 mb-2 block">🏢 Industry</label>
              <p className="text-white font-semibold">{mockLeadProfile.industry}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-400 mb-2 block">💰 Budget Range</label>
              <p className="text-white font-semibold">{mockLeadProfile.budget}</p>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-400 mb-3 block">⚡ Interest Level</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-600 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-primary h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${mockLeadProfile.interestLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">{mockLeadProfile.interestLevel}%</span>
              </div>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-400 mb-3 block flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Pain Points
              </label>
              <ul className="space-y-3">
                {mockLeadProfile.painPoints.map((point, index) => (
                  <li key={index} className="group flex items-start gap-3 p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl border border-red-500/20 hover:border-red-400/40 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <span className="text-sm text-white font-medium leading-relaxed group-hover:text-red-100 transition-colors duration-300">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gray-700/30 rounded-xl p-4">
              <label className="text-sm font-medium text-gray-400 mb-3 block flex items-center gap-2">
                <span className="text-lg">📈</span>
                Recent Activity
              </label>
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl"></div>
                <div className="relative p-4 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl border border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg">🔥</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium leading-relaxed group-hover:text-blue-100 transition-colors duration-300">
                        {mockLeadProfile.recentActivity}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-blue-200">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Hot lead - act fast!</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col bg-gray-800/30 backdrop-blur-sm">
        {/* Header */}
        <div className="border-b border-gray-700/50 p-6 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">✨</span>
                </div>
                <h1 className="text-3xl font-bold text-white">AI Pitch Composer</h1>
              </div>
              <p className="text-gray-300 font-medium">Create personalized pitches with AI assistance</p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600/50 hover:border-gray-500 transition-all duration-200 font-medium">
                📋 Templates
              </button>
              <button className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05]">
                📤 Send Pitch
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl ${
                    message.type === 'user'
                      ? 'bg-gradient-primary text-white border-purple-400/30 hover:shadow-purple-500/20'
                      : 'bg-gray-800/50 border-gray-700/50 text-white hover:shadow-gray-500/10'
                  }`}
                >
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none text-text-primary"
                        rows={6}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditedMessage}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>

                {/* Message Actions */}
                {message.type === 'ai' && editingMessageId !== message.id && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditMessage(message.id, message.content)}
                      className="text-xs text-gray-500 hover:text-primary-accent transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button className="text-xs text-gray-500 hover:text-primary-accent transition-colors">
                      📋 Copy
                    </button>
                    <button className="text-xs text-gray-500 hover:text-primary-accent transition-colors">
                      🔄 Regenerate
                    </button>
                  </div>
                )}

                {/* Timestamp */}
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                message.type === 'user' 
                  ? 'bg-gradient-primary text-white order-1 ml-3' 
                  : 'bg-gray-200 text-gray-600 order-2 mr-3'
              }`}>
                {message.type === 'user' ? user.email?.charAt(0).toUpperCase() : '🤖'}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700/50 p-6 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message to refine the pitch..."
                className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
                rows={3}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.05] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isTyping ? '⏳' : '📤'} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
