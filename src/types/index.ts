export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'cuscuz' | 'tapioca' | 'bebidas' | 'pratos' | 'sobremesas';
  image: string;
  tag?: string;
  availableUnits?: string[];
}

export interface Unit {
  id: string;
  name: string;
  city: string;
  address: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}