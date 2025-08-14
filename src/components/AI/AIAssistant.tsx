import { useState, useEffect } from "react";
import { 
  FaRobot, 
  FaTimes, 
  FaLightbulb, 
  FaChartLine, 
  FaBullseye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp
} from "react-icons/fa";

interface AIInsight {
  id: string;
  type: "suggestion" | "warning" | "opportunity" | "achievement";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: "low" | "medium" | "high";
}

interface AIAssistantProps {
  activeSection: string;
  userPlan: string;
  onSectionChange: (section: string) => void;
}

export default function AIAssistant({ activeSection, userPlan, onSectionChange }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [currentInsight, setCurrentInsight] = useState<AIInsight | null>(null);

  // Generate contextual AI insights based on current section and user behavior
  useEffect(() => {
    const generateInsights = () => {
      const newInsights: AIInsight[] = [];

      // Section-specific insights
      switch (activeSection) {
        case "Leads":
          newInsights.push({
            id: "leads-optimization",
            type: "suggestion",
            title: "Lead Quality Boost",
            message: "Your lead conversion rate could improve by 35% with better targeting. Try our AI Lead Discovery!",
            action: {
              label: "Discover Leads",
              onClick: () => onSectionChange("Lead Discovery")
            },
            priority: "high"
          });
          break;

        case "Lead Discovery":
          newInsights.push({
            id: "discovery-tip",
            type: "opportunity",
            title: "Hot Market Alert",
            message: "African fintech sector is 40% more active this week. Perfect timing for outreach!",
            priority: "high"
          });
          break;

        case "Pitch Composer":
          newInsights.push({
            id: "pitch-improvement",
            type: "suggestion",
            title: "Pitch Enhancement",
            message: "Leads respond 60% better to pitches mentioning recent company news. Want me to find recent updates?",
            action: {
              label: "Research Updates",
              onClick: () => console.log("Researching company updates...")
            },
            priority: "medium"
          });
          break;
      }

      // Plan-specific insights
      if (userPlan === "starter") {
        newInsights.push({
          id: "upgrade-suggestion",
          type: "opportunity",
          title: "Unlock Global Reach",
          message: "Upgrade to Pro and access 10x more international leads with AI automation!",
          action: {
            label: "View Plans",
            onClick: () => onSectionChange("Subscription")
          },
          priority: "medium"
        });
      }

      // Performance insights
      newInsights.push({
        id: "performance-boost",
        type: "achievement",
        title: "Great Progress!",
        message: "Your response rate increased 23% this week. Keep up the personalized approach!",
        priority: "low"
      });

      // Compliance warnings
      if (Math.random() > 0.7) {
        newInsights.push({
          id: "compliance-warning",
          type: "warning",
          title: "GDPR Reminder",
          message: "Remember to include unsubscribe links in EU outreach emails for compliance.",
          action: {
            label: "Check Compliance",
            onClick: () => onSectionChange("Compliance")
          },
          priority: "high"
        });
      }

      setInsights(newInsights);
      
      // Show the highest priority insight
      const highPriorityInsight = newInsights.find(i => i.priority === "high");
      if (highPriorityInsight && !currentInsight) {
        setCurrentInsight(highPriorityInsight);
        setIsOpen(true);
      }
    };

    generateInsights();
  }, [activeSection, userPlan, onSectionChange, currentInsight]);

  const getInsightIcon = (type: AIInsight["type"]) => {
    switch (type) {
      case "suggestion":
        return <FaLightbulb className="text-yellow-500" />;
      case "warning":
        return <FaExclamationTriangle className="text-red-500" />;
      case "opportunity":
        return <FaBullseye className="text-green-500" />;
      case "achievement":
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaRobot className="text-purple-500" />;
    }
  };

  const getInsightBgColor = (type: AIInsight["type"]) => {
    switch (type) {
      case "suggestion":
        return "bg-yellow-50 border-yellow-200";
      case "warning":
        return "bg-red-50 border-red-200";
      case "opportunity":
        return "bg-green-50 border-green-200";
      case "achievement":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 transform hover:scale-110 hover:rotate-3 z-50 flex items-center justify-center group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <FaRobot className="text-2xl relative z-10 group-hover:animate-bounce" />
        {insights.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {insights.length}
          </div>
        )}
      </button>

      {/* AI Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 z-40 max-h-[32rem] overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white p-6 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaRobot className="text-xl" />
              </div>
              <div>
                <span className="font-bold text-lg">AI Assistant</span>
                <p className="text-white/80 text-sm">Your intelligent lead advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-300 relative z-10"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Current Insight */}
          {currentInsight && (
            <div className={`p-5 border-b border-white/20 ${getInsightBgColor(currentInsight.type)} backdrop-blur-sm animate-fadeIn`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 rounded-2xl bg-white/80 shadow-lg">
                  <div className="text-xl">{getInsightIcon(currentInsight.type)}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base text-gray-800 mb-2">
                    {currentInsight.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    {currentInsight.message}
                  </p>
                  {currentInsight.action && (
                    <button
                      onClick={() => {
                        currentInsight.action?.onClick();
                        setCurrentInsight(null);
                      }}
                      className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      {currentInsight.action.label} ✨
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setCurrentInsight(null)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-white/50 p-2 rounded-xl transition-all duration-300"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          )}

          {/* All Insights */}
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {insights.map((insight, index) => (
              <div
                key={insight.id}
                className="group p-4 border-b border-white/10 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => setCurrentInsight(insight)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-2 rounded-xl bg-white/60 group-hover:bg-white/80 transition-all duration-300 shadow-sm">
                    <div className="text-lg">{getInsightIcon(insight.type)}</div>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-gray-800 mb-1">
                      {insight.title}
                    </h5>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {insight.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {insight.priority === "high" && (
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex-shrink-0 animate-pulse shadow-lg"></div>
                    )}
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to view
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-5 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-white/20">
            <h6 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wider">Quick Actions</h6>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSectionChange("Lead Discovery")}
                className="flex items-center gap-2 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25 font-semibold"
              >
                <FaBullseye className="text-sm" />
                Find Leads
              </button>
              <button
                onClick={() => onSectionChange("Pitch Composer")}
                className="flex items-center gap-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 font-semibold"
              >
                <FaArrowUp className="text-sm" />
                Create Pitch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
