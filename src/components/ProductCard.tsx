import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);

    setTimeout(() => {
      setIsAdded(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-amber-100 flex flex-col justify-between group">
      <div>
        {/* Imagem em destaque total */}
        <div className="relative overflow-hidden rounded-2xl mb-5 w-full h-64 bg-amber-50 shadow-inner">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/products/placeholder.png';
            }}
          />
          {product.tag && (
            <span className="absolute top-3 left-3 bg-amber-900 text-amber-50 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md tracking-wide">
              {product.tag}
            </span>
          )}
        </div>

        {/* Título com tom marrom escuro elegante */}
        <h3 className="font-extrabold text-amber-950 text-xl mb-2">{product.name}</h3>
        
        {/* Descrição com tom terroso suave */}
        <p className="text-stone-700 text-sm leading-relaxed mb-6 font-medium">
          {product.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
        <div>
          <span className="text-xs text-stone-400 block font-semibold uppercase tracking-wider">Valor</span>
          <span className="text-2xl font-black text-amber-900">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <button
          onClick={handleAdd}
          className={`px-5 py-3 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all duration-300 cursor-pointer shadow-sm active:scale-95 ${
            isAdded
              ? 'bg-emerald-700 text-white ring-4 ring-emerald-300 border border-emerald-600 scale-105'
              : 'bg-amber-900 hover:bg-amber-950 text-amber-50 border border-transparent'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} className="animate-bounce" />
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <Plus size={18} />
              <span>Adicionar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};