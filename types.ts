export type Restaurant = {
  id: string;
  name: string;
  rating: number;
  active: boolean;
  address?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  price?: number;
  description?: string;
};
