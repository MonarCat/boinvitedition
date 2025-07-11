import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Zap, Send, ExternalLink, Copy } from 'lucide-react';

interface ZapierWebhookProps {
  title?: string;
  description?: string;
  triggerData?: Record<string, any>;
  defaultWebhookUrl?: string;
}

export const ZapierWebhook: React.FC<ZapierWebhookProps> = ({
  title = "Zapier Integration",
  description = "Connect your Boinvit account with thousands of apps through Zapier",
  triggerData = {},
  defaultWebhookUrl = ""
}) => {
  const [webhookUrl, setWebhookUrl] = useState(defaultWebhookUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTrigger, setLastTrigger] = useState<Date | null>(null);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering Zapier webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          event_type: "manual_trigger",
          data: triggerData,
          source: "boinvit"
        }),
      });

      setLastTrigger(new Date());
      toast({
        title: "Webhook Triggered",
        description: "Your Zapier webhook has been triggered successfully. Check your Zap's history to confirm.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyExampleData = () => {
    const exampleData = JSON.stringify({
      timestamp: new Date().toISOString(),
      event_type: "new_booking",
      data: {
        booking_id: "bk_123456",
        customer_name: "John Doe",
        customer_email: "john@example.com",
        service: "Hair Cut",
        business_name: "Style Studio",
        booking_date: "2025-01-12",
        booking_time: "14:30",
        amount: 25.00,
        currency: "USD"
      }
    }, null, 2);
    
    navigator.clipboard.writeText(exampleData);
    toast({
      title: "Copied",
      description: "Example webhook data copied to clipboard",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Setup Instructions */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a new Zap in your Zapier account</li>
            <li>Add "Webhooks by Zapier" as the trigger</li>
            <li>Select "Catch Hook" and copy the webhook URL</li>
            <li>Paste the URL below and test the connection</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Zapier
          </Button>
        </div>

        {/* Webhook URL Input */}
        <form onSubmit={handleTrigger} className="space-y-4">
          <div>
            <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !webhookUrl.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>Testing Connection...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Test Webhook
              </>
            )}
          </Button>
        </form>

        {/* Status */}
        {lastTrigger && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-700 border-green-300">
                ✓ Connected
              </Badge>
              <span className="text-sm text-green-700">
                Last triggered: {lastTrigger.toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Example Data */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Example Webhook Data:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={copyExampleData}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <pre className="text-xs text-muted-foreground overflow-x-auto bg-background p-3 rounded border">
{JSON.stringify({
  timestamp: "2025-01-12T10:30:00Z",
  event_type: "new_booking",
  data: {
    booking_id: "bk_123456",
    customer_name: "John Doe",
    customer_email: "john@example.com",
    service: "Hair Cut",
    business_name: "Style Studio",
    booking_date: "2025-01-12",
    booking_time: "14:30",
    amount: 25.00,
    currency: "USD"
  }
}, null, 2)}
          </pre>
        </div>

        {/* Use Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-1">Popular Automations</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• New booking → Add to Google Sheets</li>
              <li>• Payment received → Update CRM</li>
              <li>• Client message → Send to Slack</li>
            </ul>
          </div>
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-1">Marketing Integrations</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• New client → Add to Mailchimp</li>
              <li>• Booking confirmed → Send SMS</li>
              <li>• Review received → Post to social</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};