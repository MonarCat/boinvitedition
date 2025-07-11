import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Bot, 
  TrendingUp, 
  Clock, 
  MessageCircle, 
  DollarSign,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const AIFeaturesSection: React.FC = () => {
  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Scheduling Assistant",
      description: "AI analyzes booking patterns to suggest optimal time slots and reduce scheduling conflicts",
      benefits: ["50% fewer conflicts", "Optimal time suggestions", "Pattern recognition"],
      badge: "New",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Bot,
      title: "AI Customer Support Bot",
      description: "24/7 automated customer service that handles FAQs, booking changes, and support requests",
      benefits: ["24/7 availability", "Instant responses", "Multi-language support"],
      badge: "Popular",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Dynamic Pricing Engine",
      description: "AI-powered pricing optimization based on demand, seasons, and market trends",
      benefits: ["Increase revenue by 30%", "Market-based pricing", "Seasonal adjustments"],
      badge: "Revenue Boost",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Clock,
      title: "No-Show Prediction",
      description: "Machine learning predicts and prevents no-shows with personalized reminders",
      benefits: ["Reduce no-shows by 60%", "Smart reminders", "Behavioral analysis"],
      badge: "Top Feature",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  const automationFeatures = [
    {
      icon: MessageCircle,
      title: "WhatsApp & Telegram Booking",
      description: "Customers can book directly through messaging apps",
      stat: "3x higher conversion"
    },
    {
      icon: Zap,
      title: "Smart Workflow Automation",
      description: "Automate follow-ups, reminders, and routine tasks",
      stat: "Save 4 hours daily"
    },
    {
      icon: DollarSign,
      title: "Payment Intelligence",
      description: "AI-optimized payment processing and fraud detection",
      stat: "99.9% success rate"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Features
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Future of Business Management is
            <span className="text-blue-600"> AI-First</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage cutting-edge artificial intelligence to automate operations, 
            predict customer behavior, and optimize your business performance.
          </p>
        </div>

        {/* Main AI Features */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {aiFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="grid grid-cols-1 gap-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Automation Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Global Market Ready Automations
            </h3>
            <p className="text-gray-600">
              Connect with customers worldwide through their preferred channels
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {automationFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50">
                <div className="inline-flex p-3 bg-white rounded-lg shadow-sm mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  {feature.stat}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* AI Benefits Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { number: "60%", label: "Reduction in No-Shows", color: "text-green-600" },
            { number: "4hrs", label: "Time Saved Daily", color: "text-blue-600" },
            { number: "30%", label: "Revenue Increase", color: "text-purple-600" },
            { number: "24/7", label: "AI Customer Support", color: "text-orange-600" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Experience AI Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
              Watch AI Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free 14-day trial • No credit card required • Setup in 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};