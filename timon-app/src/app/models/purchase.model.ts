export interface Purchase {
  id?: string;
  userId: string;
  productId: string;
  timestamp: Date;
  amount: number;
}
