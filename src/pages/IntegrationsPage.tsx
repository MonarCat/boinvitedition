import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ZapierWebhook } from '@/components/integrations/ZapierWebhook';
import { SlackNotification } from '@/components/integrations/SlackNotification';
import { 
  ArrowLeft,
  Zap, 
  MessageSquare, 
  ShoppingBag,
  Globe,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const IntegrationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('zapier');

  const integrationCategories = [
    {
      id: 'zapier',
      name: 'Zapier',
      icon: Zap,
      description: 'Connect with 5000+ apps',
      color: 'bg-orange-100 text-orange-600',
      component: <ZapierWebhook />
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: MessageSquare,
      description: 'Team notifications',
      color: 'bg-purple-100 text-purple-600',
      component: <SlackNotification />
    },
    {
      id: 'shopify',
      name: 'Shopify',
      icon: ShoppingBag,
      description: 'E-commerce integration',
      color: 'bg-green-100 text-green-600',
      component: (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              Shopify Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                Transform your Boinvit services into a full e-commerce experience with Shopify integration.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Service Marketplace</h4>
                  <p className="text-sm text-gray-600">Sell your services as products in your Shopify store</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Inventory Sync</h4>
                  <p className="text-sm text-gray-600">Sync service availability with product inventory</p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Join Waitlist
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const benefits = [
    {
      title: "Automate Everything",
      description: "Set up workflows once and let them run automatically",
      icon: Zap
    },
    {
      title: "Stay Connected",
      description: "Get notified instantly when important events happen",
      icon: MessageSquare
    },
    {
      title: "Scale Globally",
      description: "Connect with customers worldwide through their preferred channels",
      icon: Globe
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Integrations</h1>
                <p className="text-sm text-gray-500">Connect Boinvit with your favorite tools</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Boinvit with Everything
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Seamlessly integrate with the tools you already use and love. 
            Automate workflows, sync data, and scale your business globally.
          </p>
          
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="inline-flex p-3 bg-blue-50 rounded-lg mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Tabs */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {integrationCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {integrationCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="flex justify-center">
                  {category.component}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Popular Use Cases */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Popular Automation Use Cases
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "New Booking → Email Marketing",
                description: "Automatically add new customers to your email marketing campaigns",
                apps: ["Zapier", "Mailchimp", "Gmail"],
                color: "bg-blue-50 border-blue-200"
              },
              {
                title: "Payment → Slack Alert",
                description: "Get instant Slack notifications when payments are received",
                apps: ["Slack", "Paystack", "Stripe"],
                color: "bg-green-50 border-green-200"
              },
              {
                title: "No-Show → Follow-up SMS",
                description: "Automatically send follow-up messages to customers who miss appointments",
                apps: ["Zapier", "WhatsApp", "Twilio"],
                color: "bg-orange-50 border-orange-200"
              },
              {
                title: "New Review → Social Media",
                description: "Share positive reviews automatically on your social media channels",
                apps: ["Zapier", "Facebook", "Twitter"],
                color: "bg-purple-50 border-purple-200"
              },
              {
                title: "Booking Data → Google Sheets",
                description: "Keep a backup of all booking data in Google Sheets for analysis",
                apps: ["Zapier", "Google Sheets", "Excel"],
                color: "bg-yellow-50 border-yellow-200"
              },
              {
                title: "Staff Alert → Team Chat",
                description: "Alert your team instantly when new bookings come in",
                apps: ["Slack", "Microsoft Teams", "Discord"],
                color: "bg-pink-50 border-pink-200"
              }
            ].map((useCase, index) => (
              <Card key={index} className={`hover:shadow-md transition-shadow ${useCase.color}`}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.apps.map((app, appIndex) => (
                      <Badge key={appIndex} variant="secondary" className="text-xs">
                        {app}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Get Started CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Automate Your Business?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Start connecting your favorite tools and watch your productivity soar. 
            Most integrations can be set up in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.open('https://help.boinvit.com/integrations', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;