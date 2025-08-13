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
    <div className="h-full flex bg-background">
      {/* Left Sidebar - Lead Profile */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Lead Profile</h2>
          
          {/* Profile Header */}
          <div className="bg-gradient-primary rounded-lg p-4 text-white mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-xl font-bold">
                {mockLeadProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{mockLeadProfile.name}</h3>
                <p className="text-sm opacity-90">{mockLeadProfile.title}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">{mockLeadProfile.company}</p>
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p className="text-text-primary">{mockLeadProfile.location}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Industry</label>
              <p className="text-text-primary">{mockLeadProfile.industry}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Budget Range</label>
              <p className="text-text-primary">{mockLeadProfile.budget}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Interest Level</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${mockLeadProfile.interestLevel}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-text-primary">{mockLeadProfile.interestLevel}%</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Pain Points</label>
              <ul className="mt-1 space-y-1">
                {mockLeadProfile.painPoints.map((point, index) => (
                  <li key={index} className="text-sm text-text-primary flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Recent Activity</label>
              <p className="text-sm text-text-primary bg-blue-50 p-2 rounded-lg">
                {mockLeadProfile.recentActivity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                ✨ AI Pitch Composer
              </h1>
              <p className="text-sm text-gray-600">
                Crafting personalized pitch for {mockLeadProfile.name}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                📋 Templates
              </button>
              <button className="px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm hover:opacity-90 transition-all">
                📤 Send Pitch
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-primary text-white'
                      : 'bg-white border border-gray-200 text-text-primary'
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

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to generate a pitch, make edits, or send the message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] animate-bounce-subtle"
            >
              Send
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setInputMessage("Generate a pitch for this lead")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              🎯 Generate Pitch
            </button>
            <button
              onClick={() => setInputMessage("Make it more casual and friendly")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              😊 Make Casual
            </button>
            <button
              onClick={() => setInputMessage("Add more technical details")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              🔧 Add Details
            </button>
            <button
              onClick={() => setInputMessage("Ready to send this pitch")}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              📤 Send Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
