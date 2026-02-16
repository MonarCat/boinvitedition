import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { PlatformBalanceInfo, PlatformTransaction, PlatformPayment } from "@/types/finance";

export function usePlatformBalance(businessId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch platform balance status
  const { data: balanceInfo, isLoading: balanceLoading } = useQuery({
    queryKey: ["platform-balance", businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .rpc("check_platform_balance_restriction", {
          p_business_id: businessId,
        });

      if (error) {
        console.error("Error fetching platform balance:", error);
        throw error;
      }

      return data?.[0] as PlatformBalanceInfo;
    },
    enabled: !!businessId,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch unpaid platform transactions
  const { data: unpaidTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["platform-transactions", businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("platform_transactions")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "unpaid")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching platform transactions:", error);
        throw error;
      }

      return data as PlatformTransaction[];
    },
    enabled: !!businessId,
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["platform-payments", businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("platform_payments")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching payment history:", error);
        throw error;
      }

      return data as PlatformPayment[];
    },
    enabled: !!businessId,
  });

  // Initiate platform balance clearance
  const clearBalance = useMutation({
    mutationFn: async () => {
      if (!businessId) {
        throw new Error("Business ID is required");
      }

      const { data, error } = await supabase.functions.invoke(
        "clear-platform-balance",
        {
          body: { business_id: businessId },
        }
      );

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      return data;
    },
    onSuccess: (data) => {
      // Redirect to Paystack payment page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    },
    onError: (error: Error) => {
      console.error("Error initiating payment:", error);
      toast.error(`Payment failed: ${error.message}`);
    },
  });

  // Refetch balance after payment
  const refetchBalance = () => {
    queryClient.invalidateQueries({ queryKey: ["platform-balance", businessId] });
    queryClient.invalidateQueries({ queryKey: ["platform-transactions", businessId] });
    queryClient.invalidateQueries({ queryKey: ["platform-payments", businessId] });
  };

  return {
    balanceInfo,
    unpaidTransactions,
    paymentHistory,
    isLoading: balanceLoading || transactionsLoading || historyLoading,
    clearBalance: clearBalance.mutate,
    isClearing: clearBalance.isPending,
    refetchBalance,
  };
}
