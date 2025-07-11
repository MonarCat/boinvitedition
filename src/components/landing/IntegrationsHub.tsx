import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  MessageSquare, 
  ShoppingBag, 
  Calendar,
  Mail,
  FileSpreadsheet,
  CreditCard,
  MessageCircle,
  Globe,
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export const IntegrationsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('automation');

  const integrations = {
    automation: [
      {
        icon: Zap,
        name: "Zapier",
        description: "Connect with 5000+ apps and automate workflows",
        features: ["Automated workflows", "Data synchronization", "Custom triggers"],
        badge: "Most Popular",
        color: "bg-orange-100 text-orange-600",
        category: "Automation"
      },
      {
        icon: Calendar,
        name: "Google Workspace",
        description: "Sync calendars, emails, and documents seamlessly",
        features: ["Calendar sync", "Email integration", "Document sharing"],
        badge: "Essential",
        color: "bg-blue-100 text-blue-600",
        category: "Productivity"
      },
      {
        icon: FileSpreadsheet,
        name: "Microsoft Office",
        description: "Export data to Excel, sync with Outlook calendar",
        features: ["Excel reports", "Outlook sync", "Teams integration"],
        badge: "Enterprise",
        color: "bg-green-100 text-green-600",
        category: "Productivity"
      }
    ],
    messaging: [
      {
        icon: MessageSquare,
        name: "WhatsApp Business",
        description: "Book appointments directly through WhatsApp",
        features: ["Direct booking", "Automated confirmations", "Payment links"],
        badge: "Global Reach",
        color: "bg-green-100 text-green-600",
        category: "Messaging"
      },
      {
        icon: MessageCircle,
        name: "Telegram",
        description: "Secure messaging and booking automation",
        features: ["Bot integration", "Secure bookings", "Multi-language"],
        badge: "Secure",
        color: "bg-blue-100 text-blue-600",
        category: "Messaging"
      },
      {
        icon: MessageSquare,
        name: "Slack",
        description: "Team notifications and business alerts",
        features: ["Real-time alerts", "Team coordination", "Custom channels"],
        badge: "Team Favorite",
        color: "bg-purple-100 text-purple-600",
        category: "Communication"
      }
    ],
    payments: [
      {
        icon: CreditCard,
        name: "Stripe",
        description: "Global payment processing and subscription management",
        features: ["Global payments", "Subscription billing", "Fraud protection"],
        badge: "Recommended",
        color: "bg-blue-100 text-blue-600",
        category: "Payments"
      },
      {
        icon: CreditCard,
        name: "Paystack",
        description: "African payment gateway with mobile money support",
        features: ["Mobile money", "Bank transfers", "Local currencies"],
        badge: "Africa Leader",
        color: "bg-green-100 text-green-600",
        category: "Payments"
      },
      {
        icon: Smartphone,
        name: "M-Pesa",
        description: "Direct mobile money integration for East Africa",
        features: ["Instant payments", "Low fees", "Wide coverage"],
        badge: "Local Favorite",
        color: "bg-orange-100 text-orange-600",
        category: "Mobile Money"
      }
    ],
    marketing: [
      {
        icon: Mail,
        name: "Mailchimp",
        description: "Email marketing automation for customer retention",
        features: ["Email campaigns", "Customer segmentation", "Analytics"],
        badge: "Marketing Pro",
        color: "bg-yellow-100 text-yellow-600",
        category: "Email Marketing"
      },
      {
        icon: Globe,
        name: "Social Media",
        description: "Auto-post updates to Facebook, Instagram, Twitter",
        features: ["Auto-posting", "Social booking", "Review management"],
        badge: "Social Boost",
        color: "bg-pink-100 text-pink-600",
        category: "Social Media"
      },
      {
        icon: ShoppingBag,
        name: "Shopify",
        description: "Sell services as products in your online store",
        features: ["Service marketplace", "Product integration", "E-commerce"],
        badge: "E-commerce",
        color: "bg-purple-100 text-purple-600",
        category: "E-commerce"
      }
    ]
  };

  const benefits = [
    {
      title: "Seamless Workflow",
      description: "All your business tools work together automatically",
      icon: Zap
    },
    {
      title: "Global Reach",
      description: "Connect with customers worldwide through their preferred channels",
      icon: Globe
    },
    {
      title: "Time Savings",
      description: "Automate repetitive tasks and focus on growing your business",
      icon: CheckCircle
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            <Globe className="h-4 w-4 mr-2" />
            Integrations Hub
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Connect Everything Your
            <span className="text-blue-600"> Business Needs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Seamlessly integrate with the tools you already use and love. 
            From automation to payments, messaging to marketing - we've got you covered.
          </p>
        </div>

        {/* Benefits Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 rounded-xl bg-gray-50">
              <div className="inline-flex p-3 bg-white rounded-lg shadow-sm mb-4">
                <benefit.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Integrations Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
          </TabsList>

          {Object.entries(integrations).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {items.map((integration, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${integration.color}`}>
                            <integration.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {integration.badge}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{integration.description}</p>
                      <div className="space-y-2">
                        {integration.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        Connect {integration.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Integration Stats */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Trusted by Businesses Worldwide
            </h3>
            <p className="text-gray-600">
              Our integrations power thousands of businesses across the globe
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "50+", label: "Integrations Available" },
              { number: "5000+", label: "Apps Connected via Zapier" },
              { number: "99.9%", label: "Integration Uptime" },
              { number: "24/7", label: "Integration Support" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Connect Your Business Tools?
          </h3>
          <p className="text-gray-600 mb-6">
            Start integrating with your favorite tools in minutes, not hours.
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Explore All Integrations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
              Request Integration
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};