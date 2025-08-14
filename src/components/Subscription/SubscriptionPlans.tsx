import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  limitations?: string[];
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    description: "Perfect for local market targeting",
    features: [
      "Local lead discovery",
      "Basic prospect scoring",
      "50 leads per month",
      "Email outreach templates",
      "Basic analytics",
      "Email support"
    ],
    limitations: ["Local targeting only", "Limited AI features"],
    buttonText: "Start with Starter"
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    description: "Global targeting with automation",
    features: [
      "Global lead discovery",
      "Advanced prospect scoring",
      "500 leads per month",
      "Multi-channel outreach (Email, LinkedIn, Twitter)",
      "Automated follow-up sequences",
      "Advanced analytics & reporting",
      "Priority support",
      "Custom pitch templates"
    ],
    popular: true,
    buttonText: "Go Pro"
  },
  {
    id: "elite",
    name: "Elite",
    price: 99,
    description: "Full AI power with CRM integration",
    features: [
      "Unlimited lead discovery",
      "AI-powered prospect scoring",
      "Unlimited leads",
      "Full automation suite",
      "AI negotiation assistant",
      "CRM integration",
      "Real-time deal coaching",
      "Custom integrations",
      "Dedicated account manager",
      "White-label options"
    ],
    buttonText: "Get Elite Access"
  }
];

interface SubscriptionPlansProps {
  user: User;
  currentPlan?: string;
  onPlanSelect: (planId: string) => void;
}

export default function SubscriptionPlans({ user, currentPlan = "starter", onPlanSelect }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanSelection = async (planId: string) => {
    setLoading(planId);
    try {
      // Here you would integrate with your payment processor (Stripe, etc.)
      // For now, we'll simulate the subscription process
      
      // Update user subscription in Supabase
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      onPlanSelect(planId);
      alert(`Successfully subscribed to ${planId} plan!`);
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert('Subscription failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black py-16 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)] opacity-30"></div>
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(255,255,255,0.01)_50%,transparent_51%)] bg-[length:20px_20px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <span className="text-white font-semibold">Pricing Plans</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Choose Your LeadSwift Plan
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Unlock the power of AI-driven global client acquisition. 
            Start closing deals faster with the right plan for your business.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`relative group transition-all duration-500 hover:scale-[1.05] animate-fadeIn`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div
                className={`relative bg-white/5 backdrop-blur-2xl rounded-2xl border transition-all duration-300 hover:bg-white/8 overflow-hidden ${
                  plan.popular 
                    ? 'border-white/30 shadow-2xl shadow-black/50' 
                    : 'border-white/10 hover:border-white/20'
                } ${
                  currentPlan === plan.id ? 'border-white/40 bg-white/10' : ''
                }`}
              >
                {/* Subtle hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/5 to-transparent"></div>
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {/* Current Plan Badge */}
                {currentPlan === plan.id && (
                  <div className="absolute -top-3 right-4 z-10">
                    <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                      Current
                    </div>
                  </div>
                )}

                <div className="p-8 relative z-10">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">{plan.description}</p>
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-gray-500 ml-2 text-sm">/month</span>
                    </div>
                    {plan.popular && (
                      <div className="text-xs text-gray-300 font-medium">
                        Best Value
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-medium text-white mb-4 text-sm">
                      What's included:
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-4 h-4 bg-white rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-300 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations && (
                    <div className="mb-8">
                      <h4 className="font-medium text-gray-400 mb-3 text-xs">
                        Limitations:
                      </h4>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3 text-gray-400 text-xs">
                            <div className="flex items-start gap-2">
                              <span className="text-gray-500 mt-0.5">•</span>
                              <span>{limitation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handlePlanSelection(plan.id)}
                    disabled={currentPlan === plan.id || loading === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                      currentPlan === plan.id
                        ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700'
                        : 'bg-white text-black hover:bg-gray-100 active:bg-gray-200'
                    }`}
                  >
                    {loading === plan.id ? 'Processing...' : currentPlan === plan.id ? 'Current Plan' : plan.buttonText}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16 animate-fadeIn">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 max-w-3xl mx-auto">
            <p className="text-sm text-gray-300 mb-6">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-400">
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white">Secure Payment</span>
                <span className="text-xs text-gray-500 mt-1">256-bit SSL encryption</span>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white">24/7 Support</span>
                <span className="text-xs text-gray-500 mt-1">Expert help anytime</span>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-white">Money-back Guarantee</span>
                <span className="text-xs text-gray-500 mt-1">30-day full refund</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
