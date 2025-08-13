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
      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center relative"
        >
          <FaRobot className="text-xl" />
          {insights.filter(i => i.priority === "high").length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {insights.filter(i => i.priority === "high").length}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaRobot className="text-lg" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Current Insight */}
          {currentInsight && (
            <div className={`p-4 border-b border-gray-200 ${getInsightBgColor(currentInsight.type)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getInsightIcon(currentInsight.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-800 mb-1">
                    {currentInsight.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {currentInsight.message}
                  </p>
                  {currentInsight.action && (
                    <button
                      onClick={() => {
                        currentInsight.action?.onClick();
                        setCurrentInsight(null);
                      }}
                      className="text-sm bg-white text-primary-accent border border-primary-accent px-3 py-1 rounded-lg hover:bg-primary-accent hover:text-white transition-colors"
                    >
                      {currentInsight.action.label}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setCurrentInsight(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          )}

          {/* All Insights */}
          <div className="max-h-64 overflow-y-auto">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setCurrentInsight(insight)}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-gray-800">
                      {insight.title}
                    </h5>
                    <p className="text-xs text-gray-600 truncate">
                      {insight.message}
                    </p>
                  </div>
                  {insight.priority === "high" && (
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSectionChange("Lead Discovery")}
                className="flex items-center gap-2 text-xs bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaBullseye className="text-xs" />
                Find Leads
              </button>
              <button
                onClick={() => onSectionChange("Pitch Composer")}
                className="flex items-center gap-2 text-xs bg-white text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FaArrowUp className="text-xs" />
                Create Pitch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
