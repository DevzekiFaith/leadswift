import { useState, useEffect } from "react";
import { 
  FaChartLine, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimes,
  FaLightbulb,
  FaTarget,
  FaDollarSign,
  FaClock
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
        return <FaTarget className="text-purple-500" />;
      default:
        return <FaChartLine className="text-gray-500" />;
    }
  };

  if (!leadData || Object.keys(leadData).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Score Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreColor(score)}`}>
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
            ) : (
              getScoreIcon(score)
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Lead Score</h3>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {isLoading ? '--' : score}
              </span>
              <span className="text-gray-500 text-sm">/100</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-primary-accent hover:text-primary-dark transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Score Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${isLoading ? 0 : score}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Recommendation */}
      <div className={`p-3 rounded-lg mb-4 ${
        score >= 80 ? 'bg-green-50 border border-green-200' : 
        score >= 60 ? 'bg-yellow-50 border border-yellow-200' : 
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start gap-2">
          <FaLightbulb className={`mt-1 ${
            score >= 80 ? 'text-green-600' : 
            score >= 60 ? 'text-yellow-600' : 
            'text-red-600'
          }`} />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {score >= 80 ? 'High Priority Lead' : 
               score >= 60 ? 'Qualified Prospect' : 
               'Needs Qualification'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {score >= 80 ? 'Excellent fit - prioritize immediate outreach' : 
               score >= 60 ? 'Good potential - worth pursuing with personalized approach' : 
               'Consider additional qualification before investing time'}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Factors */}
      {showDetails && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800 text-sm">Scoring Factors</h4>
          {factors.map((factor, index) => (
            <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getFactorIcon(factor)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800">{factor.name}</span>
                  <span className={`text-sm font-semibold ${
                    factor.impact === 'positive' ? 'text-green-600' : 
                    factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    +{factor.score}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
