import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, Send, ExternalLink, Bell } from 'lucide-react';

interface SlackNotificationProps {
  title?: string;
  description?: string;
  eventType?: 'booking' | 'payment' | 'alert' | 'custom';
  data?: Record<string, any>;
}

export const SlackNotification: React.FC<SlackNotificationProps> = ({
  title = "Slack Integration",
  description = "Get real-time notifications in your Slack workspace",
  eventType = 'booking',
  data = {}
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [channel, setChannel] = useState('#general');
  const [notificationType, setNotificationType] = useState(eventType);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const notificationTemplates = {
    booking: {
      title: "New Booking Received",
      color: "#36a64f",
      icon: "📅",
      fields: [
        { title: "Customer", value: data.customer_name || "John Doe" },
        { title: "Service", value: data.service || "Hair Cut" },
        { title: "Date & Time", value: `${data.booking_date || "2025-01-12"} at ${data.booking_time || "2:30 PM"}` },
        { title: "Amount", value: `${data.currency || "$"}${data.amount || "25.00"}` }
      ]
    },
    payment: {
      title: "Payment Received",
      color: "#2eb886",
      icon: "💰",
      fields: [
        { title: "Amount", value: `${data.currency || "$"}${data.amount || "25.00"}` },
        { title: "Customer", value: data.customer_name || "John Doe" },
        { title: "Payment Method", value: data.payment_method || "Card" },
        { title: "Reference", value: data.reference || "PAY_123456" }
      ]
    },
    alert: {
      title: "System Alert",
      color: "#ff6b6b",
      icon: "🚨",
      fields: [
        { title: "Alert Type", value: data.alert_type || "No Show" },
        { title: "Business", value: data.business_name || "Style Studio" },
        { title: "Details", value: data.details || "Customer missed appointment" },
        { title: "Time", value: new Date().toLocaleString() }
      ]
    }
  };

  const sendSlackNotification = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Slack webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const template = notificationTemplates[notificationType as keyof typeof notificationTemplates];

    try {
      const slackMessage = {
        channel: channel,
        username: "Boinvit Bot",
        icon_emoji: ":office:",
        attachments: [
          {
            color: template.color,
            title: `${template.icon} ${template.title}`,
            fields: template.fields.map(field => ({
              title: field.title,
              value: field.value,
              short: true
            })),
            footer: "Boinvit Business Platform",
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slackMessage),
      });

      if (response.ok) {
        setIsConnected(true);
        toast({
          title: "Notification Sent",
          description: `Test notification sent to ${channel} successfully!`,
        });
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending Slack notification:", error);
      toast({
        title: "Error",
        description: "Failed to send Slack notification. Please check your webhook URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-purple-600" />
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
            <li>Go to your Slack workspace settings</li>
            <li>Create a new Incoming Webhook integration</li>
            <li>Select the channel for notifications</li>
            <li>Copy the webhook URL and paste it below</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open('https://api.slack.com/messaging/webhooks', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Slack Webhooks Guide
          </Button>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="webhook-url">Slack Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Input
              id="channel"
              placeholder="#general"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Notification Type */}
        <div>
          <Label htmlFor="notification-type">Notification Type</Label>
          <Select value={notificationType} onValueChange={(value) => setNotificationType(value as 'booking' | 'payment' | 'alert' | 'custom')}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">📅 New Booking</SelectItem>
              <SelectItem value="payment">💰 Payment Received</SelectItem>
              <SelectItem value="alert">🚨 System Alert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Button */}
        <Button 
          onClick={sendSlackNotification}
          disabled={isLoading || !webhookUrl.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>Sending Test...</>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </>
          )}
        </Button>

        {/* Status */}
        {isConnected && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-700 border-green-300">
                ✓ Connected
              </Badge>
              <span className="text-sm text-green-700">
                Successfully connected to {channel}
              </span>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Notification Preview:</h4>
          <div className="bg-background border-l-4 border-purple-500 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">
                {notificationTemplates[notificationType as keyof typeof notificationTemplates].icon}
              </span>
              <span className="font-medium">
                {notificationTemplates[notificationType as keyof typeof notificationTemplates].title}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {notificationTemplates[notificationType as keyof typeof notificationTemplates].fields.map((field, index) => (
                <div key={index}>
                  <span className="font-medium text-muted-foreground">{field.title}:</span>
                  <br />
                  <span>{field.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded-lg text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <h5 className="font-medium text-sm">Booking Events</h5>
            <p className="text-xs text-muted-foreground">New bookings, cancellations, reschedules</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <h5 className="font-medium text-sm">Payment Events</h5>
            <p className="text-xs text-muted-foreground">Successful payments, refunds, disputes</p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <h5 className="font-medium text-sm">System Alerts</h5>
            <p className="text-xs text-muted-foreground">No-shows, errors, important updates</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};