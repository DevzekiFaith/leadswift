import { useState, useEffect } from "react";
import { 
  FaChartLine, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimes,
  FaLightbulb,
  FaDollarSign,
  FaClock,
  FaBullseye
} from "react-icons/fa";
import { leadSwiftAPI, LeadData } from "../../services/api";

interface ScoringFactor {
  name: string;
  score: number;
  impact: "positive" | "negative" | "neutral";
  description: string;
}

interface InstantScoringProps {
  leadData: Partial<LeadData>;
  onScoreUpdate?: (score: number, factors: ScoringFactor[]) => void;
}

export default function InstantScoring({ leadData, onScoreUpdate }: InstantScoringProps) {
  const [score, setScore] = useState<number>(0);
  const [factors, setFactors] = useState<ScoringFactor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Real-time scoring as user types or selects filters
  useEffect(() => {
    const scoreTimeout = setTimeout(async () => {
      if (Object.keys(leadData).length > 0) {
        setIsLoading(true);
        try {
          // Call AI scoring API
          const result = await leadSwiftAPI.scoreLead(leadData);
          const newScore = result.score;
          
          // Generate detailed scoring factors
          const newFactors = generateScoringFactors(leadData, newScore);
          
          setScore(newScore);
          setFactors(newFactors);
          onScoreUpdate?.(newScore, newFactors);
        } catch (error) {
          console.error('Scoring failed:', error);
          // Fallback to mock scoring
          const mockScore = calculateMockScore(leadData);
          const mockFactors = generateScoringFactors(leadData, mockScore);
          setScore(mockScore);
          setFactors(mockFactors);
          onScoreUpdate?.(mockScore, mockFactors);
        } finally {
          setIsLoading(false);
        }
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(scoreTimeout);
  }, [leadData, onScoreUpdate]);

  const calculateMockScore = (data: Partial<LeadData>): number => {
    let baseScore = 50;
    
    // Industry scoring
    if (data.industry === "SaaS" || data.industry === "Fintech") baseScore += 20;
    if (data.industry === "CleanTech") baseScore += 15;
    
    // Budget scoring
    if (data.budget?.includes("75,000") || data.budget?.includes("100,000")) baseScore += 25;
    if (data.budget?.includes("25,000") || data.budget?.includes("50,000")) baseScore += 15;
    
    // Urgency scoring
    if (data.urgency === "High") baseScore += 20;
    if (data.urgency === "Medium") baseScore += 10;
    
    // Location scoring (international markets)
    if (data.country === "US" || data.country === "GB") baseScore += 15;
    if (data.country === "CA" || data.country === "AU") baseScore += 10;
    
    return Math.min(Math.max(baseScore, 0), 100);
  };

  const generateScoringFactors = (data: Partial<LeadData>, totalScore: number): ScoringFactor[] => {
    const factors: ScoringFactor[] = [];

    // Budget factor
    if (data.budget) {
      const budgetValue = extractBudgetValue(data.budget);
      factors.push({
        name: "Budget Range",
        score: budgetValue > 50000 ? 25 : budgetValue > 25000 ? 15 : 5,
        impact: budgetValue > 25000 ? "positive" : "neutral",
        description: `${data.budget} indicates ${budgetValue > 50000 ? "high" : budgetValue > 25000 ? "medium" : "low"} spending capacity`
      });
    }

    // Industry factor
    if (data.industry) {
      const highValueIndustries = ["SaaS", "Fintech", "AI/ML"];
      const isHighValue = highValueIndustries.includes(data.industry);
      factors.push({
        name: "Industry Match",
        score: isHighValue ? 20 : 10,
        impact: isHighValue ? "positive" : "neutral",
        description: `${data.industry} sector ${isHighValue ? "shows strong growth potential" : "has moderate potential"}`
      });
    }

    // Urgency factor
    if (data.urgency) {
      const urgencyScore = data.urgency === "High" ? 20 : data.urgency === "Medium" ? 10 : 5;
      factors.push({
        name: "Decision Urgency",
        score: urgencyScore,
        impact: data.urgency === "High" ? "positive" : data.urgency === "Low" ? "negative" : "neutral",
        description: `${data.urgency} urgency suggests ${data.urgency === "High" ? "immediate" : data.urgency === "Medium" ? "near-term" : "long-term"} decision timeline`
      });
    }

    // Geographic factor
    if (data.country) {
      const premiumMarkets = ["US", "GB", "CA", "AU"];
      const isPremium = premiumMarkets.includes(data.country);
      factors.push({
        name: "Market Premium",
        score: isPremium ? 15 : 5,
        impact: isPremium ? "positive" : "neutral",
        description: `${data.location || data.country} market offers ${isPremium ? "high-value" : "standard"} opportunities`
      });
    }

    // Platform diversity factor
    if (data.platforms && data.platforms.length > 0) {
      factors.push({
        name: "Platform Presence",
        score: data.platforms.length * 3,
        impact: data.platforms.length > 2 ? "positive" : "neutral",
        description: `Active on ${data.platforms.length} platform${data.platforms.length > 1 ? "s" : ""} indicates good digital presence`
      });
    }

    return factors;
  };

  const extractBudgetValue = (budget: string): number => {
    const numbers = budget.match(/\d+,?\d*/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[numbers.length - 1].replace(',', ''));
    }
    return 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <FaCheckCircle className="text-green-600" />;
    if (score >= 60) return <FaExclamationTriangle className="text-yellow-600" />;
    return <FaTimes className="text-red-600" />;
  };

  const getFactorIcon = (factor: ScoringFactor) => {
    switch (factor.name) {
      case "Budget Range":
        return <FaDollarSign className="text-green-500" />;
      case "Decision Urgency":
        return <FaClock className="text-blue-500" />;
      case "Industry Match":
        return <FaBullseye className="text-purple-500" />;
      default:
        return <FaChartLine className="text-gray-500" />;
    }
  };

  if (!leadData || Object.keys(leadData).length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500">
      {/* Score Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getScoreColor(score)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
            {isLoading ? (
              <div className="animate-spin w-6 h-6 border-3 border-current border-t-transparent rounded-full"></div>
            ) : (
              <div className="text-xl">{getScoreIcon(score)}</div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-1">AI Lead Score</h3>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black bg-gradient-to-r ${score >= 80 ? 'from-green-600 to-emerald-500' : score >= 60 ? 'from-yellow-600 to-orange-500' : 'from-red-600 to-pink-500'} bg-clip-text text-transparent`}>
                {isLoading ? '--' : score}
              </span>
              <span className="text-gray-400 text-sm font-medium">/100</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {showDetails ? '👁️ Hide Details' : '🔍 Show Details'}
        </button>
      </div>

      {/* Score Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${
              score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 
              score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 
              'bg-gradient-to-r from-red-500 to-pink-400'
            }`}
            style={{ width: `${isLoading ? 0 : score}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
          <span>Poor</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Quick Recommendation */}
      <div className={`p-4 rounded-2xl mb-6 backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${
        score >= 80 ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/50 shadow-green-500/10' : 
        score >= 60 ? 'bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border-yellow-200/50 shadow-yellow-500/10' : 
        'bg-gradient-to-br from-red-50/80 to-pink-50/80 border-red-200/50 shadow-red-500/10'
      } shadow-lg`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${
            score >= 80 ? 'bg-green-100 text-green-600' : 
            score >= 60 ? 'bg-yellow-100 text-yellow-600' : 
            'bg-red-100 text-red-600'
          }`}>
            <FaLightbulb className="text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-gray-800 mb-2">
              {score >= 80 ? '🎯 High Priority Lead' : 
               score >= 60 ? '✅ Qualified Prospect' : 
               '⚠️ Needs Qualification'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {score >= 80 ? 'Excellent fit - prioritize immediate outreach with personalized messaging' : 
               score >= 60 ? 'Good potential - worth pursuing with tailored approach and value proposition' : 
               'Consider additional qualification and research before investing significant time'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Factors */}
      {showDetails && (
        <div className="space-y-4 animate-fadeIn">
          <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></span>
            Scoring Breakdown
          </h4>
          {factors.map((factor, index) => (
            <div key={index} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-white/60 to-gray-50/60 backdrop-blur-sm rounded-2xl border border-white/30 hover:border-purple-200/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]">
              <div className="flex-shrink-0 p-2 rounded-xl bg-white/80 shadow-sm group-hover:shadow-md transition-all duration-300">
                <div className="text-lg">{getFactorIcon(factor)}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-800">{factor.name}</span>
                  <span className={`text-sm font-black px-2 py-1 rounded-lg ${
                    factor.impact === 'positive' ? 'bg-green-100 text-green-700' : 
                    factor.impact === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    +{factor.score}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
