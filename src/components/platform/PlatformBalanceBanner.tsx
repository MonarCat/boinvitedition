import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePlatformBalance } from "@/hooks/usePlatformBalance";
import { AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { PLATFORM_BALANCE_WARNING_RATIO } from "@/constants/platformConfig";

interface PlatformBalanceBannerProps {
  businessId: string;
}

export function PlatformBalanceBanner({ businessId }: PlatformBalanceBannerProps) {
  const { balanceInfo, isLoading, clearBalance, isClearing } = usePlatformBalance(businessId);

  if (isLoading || !balanceInfo) {
    return null;
  }

  const { is_restricted, total_balance, threshold_amount } = balanceInfo;

  // Only show banner if restricted or approaching threshold
  if (total_balance < threshold_amount * PLATFORM_BALANCE_WARNING_RATIO) {
    return null;
  }

  return (
    <Alert 
      variant={is_restricted ? "destructive" : "default"} 
      className={`mb-6 ${is_restricted ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'}`}
    >
      <AlertTriangle className={`h-5 w-5 ${is_restricted ? 'text-red-600' : 'text-amber-600'}`} />
      <AlertTitle className={is_restricted ? 'text-red-900' : 'text-amber-900'}>
        {is_restricted 
          ? '⚠️ Account Restricted - Action Required' 
          : '⚡ Platform Balance Alert'
        }
      </AlertTitle>
      <AlertDescription className={`flex items-center justify-between ${is_restricted ? 'text-red-800' : 'text-amber-800'}`}>
        <div>
          <p className="font-medium">
            Your platform balance is {formatCurrency(total_balance, "KES")}
          </p>
          <p className="text-sm mt-1">
            {is_restricted 
              ? 'Clear your balance immediately to continue accepting new bookings.' 
              : 'Consider clearing your balance soon to avoid account restrictions.'
            }
          </p>
        </div>
        <Button
          onClick={() => clearBalance()}
          disabled={isClearing}
          variant={is_restricted ? "destructive" : "default"}
          className="ml-4 shrink-0"
        >
          {isClearing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Clear Balance Now
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
