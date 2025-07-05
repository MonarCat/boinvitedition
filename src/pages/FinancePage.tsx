import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  Download, 
  ArrowUpRight, 
  Banknote,
  Settings as SettingsIcon,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useFinance } from '@/hooks/useFinance';
import { formatCurrency } from '../utils/format';

const FinancePage: React.FC = () => {
  const { toast } = useToast();
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const {
    loading,
    error,
    summary,
    transactions,
    withdrawals,
    paymentAccounts,
    createWithdrawalRequest,
  } = useFinance();
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading financial data",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      toast({
        title: "Invalid amount",
        description: "Minimum withdrawal amount is KES 100",
        variant: "destructive",
      });
      return;
    }
    
    const defaultAccount = paymentAccounts.find(acc => acc.isDefault);
    if (!defaultAccount) {
      toast({
        title: "No payment account",
        description: "Please set up a payment account first",
        variant: "destructive",
      });
      return;
    }
    
    const result = await createWithdrawalRequest(amount, defaultAccount.id);
    if (result) {
      toast({
        title: "Withdrawal requested",
        description: `${formatCurrency(amount)} withdrawal initiated. It will be processed within 24-48 hours.`,
      });
      setWithdrawAmount('');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Finance</h1>
        
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="fees">Platform Fees</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {loading && !summary ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-2xl font-bold">
                      {summary ? formatCurrency(summary.totalRevenue) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Banknote className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {summary ? formatCurrency(summary.availableBalance) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Funds ready for withdrawal</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-2xl font-bold">
                      {summary ? formatCurrency(summary.pendingBalance) : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Funds within 24hr holding period</p>
                </CardContent>
              </Card>
            </div>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>View your recent payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && transactions.length === 0 ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  ) : transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          <p className={`text-xs ${
                            transaction.status === 'completed' ? 'text-green-500' :
                            transaction.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No transactions found
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Statement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw Funds</CardTitle>
                <CardDescription>
                  Withdraw your available funds to your registered account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Available for withdrawal</p>
                      <p className="text-sm text-muted-foreground">Minimum: KES 100</p>
                    </div>
                    <div className="text-right">
                      {loading && !summary ? (
                        <Loader2 className="h-5 w-5 animate-spin ml-auto" />
                      ) : (
                        <p className="text-2xl font-bold">
                          {summary ? formatCurrency(summary.availableBalance) : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">KES</span>
                      <Input 
                        id="amount" 
                        className="pl-12" 
                        placeholder="0.00"
                        type="number"
                        min="100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleWithdrawRequest}
                    disabled={!withdrawAmount || parseFloat(withdrawAmount) < 100}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Request Withdrawal
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && withdrawals.length === 0 ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  ) : withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <p className="font-medium">Withdrawal #{withdrawal.id.split('-')[1]}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                          <p className={`text-xs ${
                            withdrawal.status === 'completed' ? 'text-green-500' :
                            withdrawal.status === 'processing' ? 'text-blue-500' :
                            withdrawal.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No withdrawal history found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Platform Fees Tab */}
          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Fee Summary</CardTitle>
                <CardDescription>Overview of platform fees applied to your transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Standard Fee Rate</p>
                      <p className="text-2xl font-bold">5%</p>
                      <p className="text-xs text-muted-foreground mt-1">Of each successful transaction</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Total Fees Paid</p>
                      {loading && !summary ? (
                        <div className="flex items-center h-8">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <p className="text-2xl font-bold">
                          {summary ? formatCurrency(summary.totalFees) : 'N/A'}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Fee Breakdown</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>Platform commission</span>
                        <span>3.5%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Payment processing</span>
                        <span>1.0%</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Service fee</span>
                        <span>0.5%</span>
                      </li>
                      <li className="flex justify-between font-medium pt-2 border-t">
                        <span>Total</span>
                        <span>5.0%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Account Settings</CardTitle>
                <CardDescription>Manage your payment account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading && paymentAccounts.length === 0 ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                  ) : paymentAccounts.length > 0 ? (
                    paymentAccounts.map(account => (
                      <div key={account.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {account.isDefault ? 'Primary' : 'Secondary'} Payment Account
                            </p>
                            <p className="text-sm">
                              {account.type === 'mpesa' ? 'M-Pesa' : account.bankName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {account.type === 'mpesa' ? account.phoneNumber : account.accountNumber}
                            </p>
                          </div>
                          <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                            Active
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No payment accounts found
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input id="phone" defaultValue="+254 712 345 678" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Account Holder Name</Label>
                      <Input id="name" defaultValue="John Doe" />
                    </div>
                    
                    <Button variant="outline">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Update Account Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic Withdrawals</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically withdraw funds when balance exceeds KES 10,000
                      </p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Transaction Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for all financial transactions
                      </p>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FinancePage;
