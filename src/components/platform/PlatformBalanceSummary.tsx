import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlatformBalance } from "@/hooks/usePlatformBalance";
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PlatformBalanceSummaryProps {
  businessId: string;
}

export function PlatformBalanceSummary({ businessId }: PlatformBalanceSummaryProps) {
  const { balanceInfo, isLoading, clearBalance, isClearing } = usePlatformBalance(businessId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!balanceInfo) {
    return null;
  }

  const { is_restricted, platform_balance, subscription_balance, total_balance, threshold_amount, message } = balanceInfo;

  // Determine card style based on balance status
  const getCardStyle = () => {
    if (is_restricted) {
      return "border-red-500 bg-red-50/50";
    }
    if (total_balance >= threshold_amount * 0.4) {
      return "border-amber-500 bg-amber-50/50";
    }
    return "border-green-500 bg-green-50/50";
  };

  const getIcon = () => {
    if (is_restricted) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    if (total_balance >= threshold_amount * 0.4) {
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusBadge = () => {
    if (is_restricted) {
      return <Badge variant="destructive">Restricted</Badge>;
    }
    if (total_balance >= threshold_amount * 0.4) {
      return <Badge variant="default" className="bg-amber-500">Action Needed</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">All Clear</Badge>;
  };

  return (
    <Card className={`transition-colors ${getCardStyle()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">Platform Balance</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {total_balance === 0 ? "You're all cleared. Keep growing! 🚀" : "Commission fees from completed services"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Platform Fee (3%)</span>
            <span className="font-semibold">{formatCurrency(platform_balance, "KES")}</span>
          </div>
          
          {subscription_balance > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subscription Fee</span>
              <span className="font-semibold">{formatCurrency(subscription_balance, "KES")}</span>
            </div>
          )}
          
          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium">Total Due</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(total_balance, "KES")}
              </span>
            </div>
          </div>
        </div>

        {/* Warning/Restriction Message */}
        {total_balance > 0 && (
          <Alert variant={is_restricted ? "destructive" : "default"}>
            <AlertDescription className="text-sm">
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {total_balance > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => clearBalance()}
              disabled={isClearing}
              className="flex-1"
              variant={is_restricted ? "destructive" : "default"}
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Clear Now
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center">
          {is_restricted 
            ? "Clear your balance to continue accepting new bookings"
            : total_balance >= threshold_amount * 0.4
            ? "Consider clearing your balance soon to avoid restrictions"
            : "Platform fees accumulate from completed services"
          }
        </p>
      </CardContent>
    </Card>
  );
}
