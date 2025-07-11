import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, Clock, TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookingSuggestion {
  id: string;
  time: string;
  confidence: number;
  reason: string;
  clientName: string;
  service: string;
}

interface SmartBookingAssistantProps {
  businessId: string;
}

export const SmartBookingAssistant: React.FC<SmartBookingAssistantProps> = ({ businessId }) => {
  const [suggestions, setSuggestions] = useState<BookingSuggestion[]>([
    {
      id: '1',
      time: '2:00 PM',
      confidence: 92,
      reason: 'Peak booking time for this service',
      clientName: 'Sarah Johnson',
      service: 'Haircut & Style'
    },
    {
      id: '2',
      time: '4:30 PM',
      confidence: 87,
      reason: 'Client prefers afternoon slots',
      clientName: 'Mike Chen',
      service: 'Massage Therapy'
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeSlots = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-primary">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-5 w-5" />
          </div>
          AI Booking Assistant
          <Badge variant="secondary" className="ml-auto bg-accent/20 text-accent-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Optimal booking suggestions
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleAnalyzeSlots}
            disabled={isAnalyzing}
            className="text-xs hover:bg-primary/5"
          >
            {isAnalyzing ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Brain className="h-3 w-3" />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-3 w-3 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{suggestion.time}</span>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0"
                    style={{
                      borderColor: suggestion.confidence > 90 ? 'hsl(var(--success))' : 
                                  suggestion.confidence > 80 ? 'hsl(var(--warning))' : 'hsl(var(--muted))',
                      color: suggestion.confidence > 90 ? 'hsl(var(--success))' : 
                             suggestion.confidence > 80 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))'
                    }}
                  >
                    {suggestion.confidence}% match
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {suggestion.clientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{suggestion.clientName}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm">{suggestion.service}</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                💡 {suggestion.reason}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
              <div className="text-xs font-medium">+15%</div>
              <div className="text-xs text-muted-foreground">Bookings</div>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary mx-auto mb-1" />
              <div className="text-xs font-medium">-30%</div>
              <div className="text-xs text-muted-foreground">No-shows</div>
            </div>
            <div className="p-2 rounded-lg bg-accent/10">
              <Calendar className="h-4 w-4 text-accent-foreground mx-auto mb-1" />
              <div className="text-xs font-medium">98%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};