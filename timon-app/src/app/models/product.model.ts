export interface Product {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  rating?: number;
  numReviews?: number;
  averageRating?: string;
}
