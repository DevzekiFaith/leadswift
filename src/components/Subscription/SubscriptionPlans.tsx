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
    <div className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            Choose Your LeadSwift Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the power of AI-driven global client acquisition. 
            Start closing deals faster with the right plan for your business.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                plan.popular 
                  ? 'border-primary-accent ring-4 ring-primary-accent ring-opacity-20' 
                  : 'border-gray-200 hover:border-primary-accent'
              } ${
                currentPlan === plan.id ? 'ring-4 ring-green-500 ring-opacity-30' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {currentPlan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-text-primary">${plan.price}</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limitations */}
                  {plan.limitations && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-500">
                            <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanSelection(plan.id)}
                  disabled={loading === plan.id || currentPlan === plan.id}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-center transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-gradient-primary text-white hover:opacity-90 shadow-lg'
                      : currentPlan === plan.id
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-gray-100 text-text-primary hover:bg-gray-200 border-2 border-gray-300 hover:border-primary-accent'
                  } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure Payment
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              24/7 Support
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Money-back Guarantee
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
