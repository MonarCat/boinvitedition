import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlatformBalance } from "@/hooks/usePlatformBalance";
import { History, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface PlatformPaymentHistoryProps {
  businessId: string;
}

export function PlatformPaymentHistory({ businessId }: PlatformPaymentHistoryProps) {
  const { paymentHistory, isLoading } = usePlatformBalance(businessId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Payment History</CardTitle>
        </div>
        <CardDescription>
          Recent platform balance clearance payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentHistory && paymentHistory.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-sm">
                      {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount, "KES")}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {payment.payment_method}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {payment.paystack_reference.substring(0, 12)}...
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payment.status === "completed" 
                            ? "default" 
                            : payment.status === "failed" 
                            ? "destructive" 
                            : "secondary"
                        }
                        className={
                          payment.status === "completed"
                            ? "bg-green-500"
                            : undefined
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No payment history yet</p>
            <p className="text-sm mt-1">Your payment records will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
