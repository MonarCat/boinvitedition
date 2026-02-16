import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlatformBalance } from "@/hooks/usePlatformBalance";
import { FileText, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface PlatformBreakdownModalProps {
  businessId: string;
}

export function PlatformBreakdownModal({ businessId }: PlatformBreakdownModalProps) {
  const { unpaidTransactions, balanceInfo, isLoading } = usePlatformBalance(businessId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          View Breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Platform Fee Breakdown</DialogTitle>
          <DialogDescription>
            Detailed breakdown of platform fees from completed services
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            {balanceInfo && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Fee</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(balanceInfo.platform_balance, "KES")}
                  </p>
                </div>
                {balanceInfo.subscription_balance > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Fee</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(balanceInfo.subscription_balance, "KES")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(balanceInfo.total_balance, "KES")}
                  </p>
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div>
              <h3 className="text-sm font-medium mb-3">Unpaid Transactions</h3>
              {unpaidTransactions && unpaidTransactions.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service Amount</TableHead>
                        <TableHead>Fee %</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpaidTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {format(new Date(transaction.transaction_date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(transaction.service_amount, "KES")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {transaction.fee_percentage}%
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(transaction.platform_fee_amount, "KES")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === "unpaid" ? "destructive" : "default"}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No unpaid transactions</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Platform fees are calculated as 3% of each completed service. 
                These fees accumulate and should be cleared regularly to maintain an active account.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
