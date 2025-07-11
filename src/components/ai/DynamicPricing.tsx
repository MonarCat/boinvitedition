import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, DollarSign, Clock, Calendar, Users, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingRule {
  id: string;
  name: string;
  condition: string;
  adjustment: string;
  isActive: boolean;
  confidence: number;
  expectedImpact: string;
}

interface DynamicPricingProps {
  businessId: string;
}

export const DynamicPricing: React.FC<DynamicPricingProps> = ({ businessId }) => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      name: 'Weekend Premium',
      condition: 'Saturday & Sunday',
      adjustment: '+25%',
      isActive: true,
      confidence: 95,
      expectedImpact: '+$1,200/month'
    },
    {
      id: '2',
      name: 'Peak Hours',
      condition: '6PM - 8PM weekdays',
      adjustment: '+15%',
      isActive: true,
      confidence: 88,
      expectedImpact: '+$800/month'
    },
    {
      id: '3',
      name: 'Low Demand',
      condition: 'Tuesday 10AM - 2PM',
      adjustment: '-10%',
      isActive: false,
      confidence: 82,
      expectedImpact: '+$450/month'
    },
    {
      id: '4',
      name: 'Holiday Rush',
      condition: 'December 15-31',
      adjustment: '+40%',
      isActive: true,
      confidence: 97,
      expectedImpact: '+$2,100/month'
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const toggleRule = (ruleId: string) => {
    setPricingRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const handleAnalyzePricing = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  const totalImpact = pricingRules
    .filter(rule => rule.isActive)
    .reduce((sum, rule) => {
      const amount = parseInt(rule.expectedImpact.replace(/[^\d]/g, ''));
      return sum + amount;
    }, 0);

  return (
    <Card className="h-full bg-gradient-to-br from-success/5 to-warning/5 border-success/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-success">
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="h-5 w-5" />
          </div>
          Dynamic Pricing AI
          <Badge variant="secondary" className="ml-auto bg-warning/20 text-warning-foreground">
            <Zap className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            AI-powered revenue optimization
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleAnalyzePricing}
            disabled={isAnalyzing}
            className="text-xs hover:bg-success/5"
          >
            {isAnalyzing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <BarChart3 className="h-3 w-3" />
                </motion.div>
                Analyzing Market...
              </>
            ) : (
              <>
                <BarChart3 className="h-3 w-3 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {pricingRules.map((rule, index) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all ${
                rule.isActive 
                  ? 'bg-success/5 border-success/20 shadow-sm' 
                  : 'bg-muted/30 border-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRule(rule.id)}
                    className="scale-75"
                  />
                  <span className="font-medium text-sm">{rule.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0 ${
                      rule.adjustment.startsWith('+') 
                        ? 'border-success/50 text-success' 
                        : 'border-warning/50 text-warning'
                    }`}
                  >
                    {rule.adjustment}
                  </Badge>
                </div>
                <Badge 
                  variant="secondary"
                  className="text-xs bg-primary/10 text-primary"
                >
                  {rule.confidence}% confidence
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {rule.condition}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {rule.expectedImpact}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-success/10">
              <DollarSign className="h-5 w-5 text-success mx-auto mb-1" />
              <div className="text-lg font-bold text-success">${totalImpact.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Monthly Impact</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-primary">
                {pricingRules.filter(r => r.isActive).length}/{pricingRules.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Rules</div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="text-xs text-muted-foreground mb-2">Revenue Trends</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-success to-warning"
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <span className="text-xs font-medium text-success">+78%</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            vs. fixed pricing model
          </div>
        </div>
      </CardContent>
    </Card>
  );
};