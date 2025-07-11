import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, MessageCircle, DollarSign, Calendar } from 'lucide-react';
import { SmartBookingAssistant } from '@/components/ai/SmartBookingAssistant';
import { AIChatbot } from '@/components/ai/AIChatbot';
import { DynamicPricing } from '@/components/ai/DynamicPricing';
import { WhatsAppBooking } from '@/components/integrations/WhatsAppBooking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AIFeaturesPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Business Management
            </h1>
            <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Next-Gen
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Transform your business with intelligent automation, predictive analytics, and AI-driven customer experiences
            that increase revenue by up to 45% while reducing operational overhead.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-success">+45%</div>
              <div className="text-sm text-muted-foreground">Revenue Increase</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">-65%</div>
              <div className="text-sm text-muted-foreground">No-Show Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-accent-foreground mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent-foreground">98%</div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Booking Assistant */}
          <motion.div variants={itemVariants}>
            <SmartBookingAssistant businessId="demo" />
          </motion.div>

          {/* AI Chatbot */}
          <motion.div variants={itemVariants}>
            <AIChatbot businessId="demo" />
          </motion.div>

          {/* Dynamic Pricing */}
          <motion.div variants={itemVariants}>
            <DynamicPricing businessId="demo" />
          </motion.div>

          {/* WhatsApp Integration */}
          <motion.div variants={itemVariants}>
            <WhatsAppBooking businessId="demo" />
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Brain className="h-5 w-5" />
                Machine Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600">
                Advanced algorithms learn from your business patterns to optimize scheduling, pricing, and customer interactions automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <MessageCircle className="h-5 w-5" />
                Natural Language Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600">
                Our AI understands and responds to customer inquiries in multiple languages, providing 24/7 support and booking assistance.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <DollarSign className="h-5 w-5" />
                Revenue Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-600">
                Dynamic pricing algorithms maximize your revenue by adjusting prices based on demand, seasonality, and market conditions.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center p-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl border border-primary/20"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of businesses already using AI to increase revenue, reduce costs, and provide exceptional customer experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border border-primary/20 rounded-lg font-medium hover:bg-primary/5 transition-colors"
            >
              Schedule Demo
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIFeaturesPage;