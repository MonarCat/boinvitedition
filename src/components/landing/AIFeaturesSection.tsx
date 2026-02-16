import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  Bell,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIFeaturesSection: React.FC = () => {
  const navigate = useNavigate();
  
  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Scheduling Assistant",
      description: "AI analyzes meeting patterns to suggest optimal time slots and automatically detects scheduling conflicts across departments",
      benefits: ["50% fewer scheduling conflicts", "Optimal time suggestions", "Department-aware scheduling"],
      badge: "Most Used",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Clock,
      title: "Attendance Prediction",
      description: "Machine learning predicts which employees are likely to miss mandatory trainings and sends personalized reminders",
      benefits: ["Reduce no-shows by 60%", "Smart reminder timing", "Historical pattern analysis"],
      badge: "Top Feature",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Bell,
      title: "Automated Reminders",
      description: "Intelligent reminder system that sends the right message at the right time through email, SMS, or WhatsApp",
      benefits: ["Multi-channel delivery", "Compliance deadline alerts", "Escalation workflows"],
      badge: "Essential",
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const impactStats = [
    { number: "60%", label: "Reduction in No-Shows", color: "text-green-600" },
    { number: "4hrs", label: "Time Saved Weekly", color: "text-blue-600" },
    { number: "70%", label: "Faster Coordination", color: "text-purple-600" },
    { number: "98%", label: "Attendance Rate", color: "text-orange-600" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <Sparkles className="h-4 w-4 mr-2" />
            Smart Meeting Management
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI That Makes HR 
            <span className="text-blue-600"> Work Smarter</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage intelligent automation to eliminate scheduling conflicts, 
            predict attendance issues, and ensure compliance deadlines are never missed.
          </p>
        </div>

        {/* Main AI Features */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
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

        {/* Impact Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {impactStats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm border">
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => navigate('/auth')}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
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
