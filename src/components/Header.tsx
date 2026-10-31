import React from 'react';
import { ShoppingBag, MapPin, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { UNITS_MOCK } from '../mocks/products';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { selectedUnit, setSelectedUnit, totalItems } = useCart();

  return (
    <header className="bg-amber-800 text-amber-50 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Marca / Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2.5 rounded-2xl text-amber-50">
            <UtensilsCrossed size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-amber-100">
              Raízes do Nordeste
            </h1>
            <p className="text-xs text-amber-200">Sabor e Tradição em Cada Prato</p>
          </div>
        </div>

        {/* Seletor de Unidades */}
        <div className="flex items-center gap-2 bg-amber-900/60 px-3 py-2 rounded-xl text-sm border border-amber-700/50">
          <MapPin size={18} className="text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300 font-medium hidden sm:inline">Unidade:</span>
          <select
            value={selectedUnit.id}
            onChange={(e) => {
              const unit = UNITS_MOCK.find((u) => u.id === e.target.value);
              if (unit) setSelectedUnit(unit);
            }}
            className="bg-transparent text-amber-100 font-semibold focus:outline-none cursor-pointer text-sm"
          >
            {UNITS_MOCK.map((unit) => (
              <option key={unit.id} value={unit.id} className="bg-amber-900 text-amber-100">
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botão do Carrinho */}
        <button
          onClick={onOpenCart}
          className="relative bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-sm transition-colors cursor-pointer shadow-sm"
        >
          <ShoppingBag size={20} />
          <span>Meu Pedido</span>
          {totalItems > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -mr-1">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};