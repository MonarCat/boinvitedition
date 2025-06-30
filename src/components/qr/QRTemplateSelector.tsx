
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodePrintTemplate } from './QRCodePrintTemplate';

interface QRTemplateSelectorProps {
  businessId: string;
  businessName: string;
}

export const QRTemplateSelector: React.FC<QRTemplateSelectorProps> = ({
  businessId,
  businessName
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'pink' | 'yellow' | 'blue' | 'red' | 'neutral'>('blue');

  const templates = [
    { id: 'pink' as const, name: 'Pink Vibrant', color: '#ec4899' },
    { id: 'yellow' as const, name: 'Yellow Bright', color: '#eab308' },
    { id: 'blue' as const, name: 'Blue Professional', color: '#3b82f6' },
    { id: 'red' as const, name: 'Red Bold', color: '#ef4444' },
    { id: 'neutral' as const, name: 'Neutral Classic', color: '#6b7280' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 QR Code Print Templates
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose a template style for your QR code prints
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto p-3"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.color }}
                />
                <span className="text-xs">{template.name}</span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Selected:</Badge>
            <span className="font-medium">
              {templates.find(t => t.id === selectedTemplate)?.name}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      <QRCodePrintTemplate
        businessId={businessId}
        businessName={businessName}
        templateStyle={selectedTemplate}
      />
    </div>
  );
};
