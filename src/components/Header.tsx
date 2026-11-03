import { useState } from 'react';
import { ShoppingBag, MapPin, User, LogOut, Award } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onOpenCart: () => void;
}

export function Header({ onOpenCart }: HeaderProps) {
  const { cartCount, selectedUnit, setSelectedUnit, units } = useCart();
  const { user, logout } = useAuth();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-amber-950 text-amber-50 shadow-md border-b border-amber-900">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logotipo e Slogan */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-800 p-2 rounded-xl text-amber-200">
              <span className="text-xl font-bold">🌿</span>
            </div>
            <div>
              <h1 className="font-black text-lg md:text-xl tracking-tight text-white leading-none">
                Raízes do Nordeste
              </h1>
              <span className="text-[11px] text-amber-300 font-medium">Sabor e Tradição em Cada Prato</span>
            </div>
          </div>

          {/* Botão Carrinho Mobile */}
          <button
            onClick={onOpenCart}
            className="md:hidden relative bg-amber-800 hover:bg-amber-700 p-2.5 rounded-xl text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-amber-950">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Seletor de Unidade (Multicanalidade por Filial) */}
        <div className="relative w-full md:w-auto flex items-center justify-center gap-2">
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
              className="w-full md:w-auto flex items-center justify-between gap-2 bg-amber-900/90 hover:bg-amber-900 border border-amber-700/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-amber-400 shrink-0" />
                <span>Unidade: <strong className="text-white">{selectedUnit.name}</strong></span>
              </div>
              <span className="text-[10px] bg-amber-800 px-2 py-0.5 rounded text-amber-200">Alterar</span>
            </button>

            {isUnitDropdownOpen && (
              <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 mt-1.5 bg-amber-950 border border-amber-800 rounded-xl shadow-xl overflow-hidden z-50">
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      setSelectedUnit(unit);
                      setIsUnitDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedUnit.id === unit.id
                        ? 'bg-amber-800 text-white font-bold'
                        : 'text-amber-200 hover:bg-amber-900/60'
                    }`}
                  >
                    <span>{unit.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ações (Autenticação / Conta / Carrinho Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-amber-900/80 hover:bg-amber-900 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-100 transition-all cursor-pointer border border-amber-700"
              >
                <div className="bg-amber-800 p-1 rounded-full text-amber-200">
                  <User size={14} />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold line-clamp-1">{user.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-amber-300 flex items-center gap-1">
                    <Award size={10} /> {user.points} pts
                  </div>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-amber-950 border border-amber-800 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                  <div className="px-3 py-2 border-b border-amber-900/80">
                    <p className="text-[11px] font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-amber-300">CPF: {user.cpf}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-300 hover:bg-amber-900/60 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} /> Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-amber-900/80 hover:bg-amber-900 border border-amber-700 px-4 py-2 rounded-xl text-xs font-semibold text-amber-100 transition-all cursor-pointer"
            >
              <User size={15} className="text-amber-300" />
              <span>Login</span>
            </button>
          )}

          {/* Botão Carrinho Desktop */}
          <button
            onClick={onOpenCart}
            className="relative bg-amber-700 hover:bg-amber-600 px-4 py-2 rounded-xl text-white font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-sm text-xs"
          >
            <ShoppingBag size={16} />
            <span>Meu Pedido</span>
            {cartCount > 0 && (
              <span className="bg-white text-amber-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Modal de Login / Cadastro */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}