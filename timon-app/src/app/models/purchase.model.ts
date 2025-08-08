export interface Purchase {
  _id?: string;
  id?: string;
  userId: string;
  productId: string;
  amount: number;
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
