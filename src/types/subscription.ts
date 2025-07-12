
export interface PayAsYouGoModel {
  commission_rate: 0.05; // Fixed 5% commission
  description: 'Pay only when you get paid - 5% commission on successful payments';
  features: string[];
}

export interface UserBusiness {
  id: string;
  commission_rate: number;
  status: 'active' | 'inactive';
}
