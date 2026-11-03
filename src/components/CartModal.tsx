import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CheckCircle, Award, ShieldCheck, User, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, selectedUnit, updateQuantity, removeFromCart, totalAmount, checkoutCart, addToCart } = useCart();
  const { user, redeemPoints } = useAuth();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Cálculo dos pontos que serão ganhos nesta compra (1 ponto a cada R$ 10,00)
  const pointsToEarn = Math.floor(totalAmount / 10);

  const handleCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    checkoutCart(); // Credita os pontos e limpa o carrinho
    setOrderPlaced(true);
  };

  const handleRedeemItem = (itemName: string) => {
    const success = redeemPoints(10);
    if (success) {
      // Adiciona o produto resgatado com preço 0 ao carrinho
      addToCart({
        id: `reward-${Date.now()}`,
        name: `${itemName} (Resgate Fidelidade)`,
        description: 'Item resgatado com pontos do Clube Raízes',
        price: 0,
        category: 'sobremesas',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80'
      });
      setRedeemSuccessMsg(`Resgate de "${itemName}" realizado com sucesso!`);
      setTimeout(() => setRedeemSuccessMsg(''), 4000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Cabeçalho */}
          <div className="p-4 bg-amber-800 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold">Seu Pedido</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Conteúdo do Carrinho */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {orderPlaced ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <CheckCircle size={64} className="text-green-600 animate-bounce" />
                <h3 className="text-xl font-bold text-stone-800">Pedido Confirmado!</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {user?.name.split(' ')[0]}, seu pedido foi enviado para a unidade <strong>{selectedUnit.name}</strong> e já está em preparação!
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold">
                  ⭐️ Você ganhou pontos no Clube Raízes! Saldo atualizado no perfil.
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-20">
                <p className="text-lg font-medium">Seu carrinho está vazio</p>
                <p className="text-sm mt-1">Adicione algumas delícias nordestinas para começar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  📍 Retirada em: <strong>{selectedUnit.name}</strong>
                </div>

                {redeemSuccessMsg && (
                  <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-medium text-center">
                    🎉 {redeemSuccessMsg}
                  </div>
                )}

                {cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-stone-800 line-clamp-1">
                        {product.name}
                      </h4>
                      <span className="text-xs text-amber-800 font-bold">
                        {product.price === 0 ? <span className="text-green-700">GRÁTIS (Resgate)</span> : `R$ ${(product.price * quantity).toFixed(2).replace('.', ',')}`}
                      </span>
                      {product.price > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1 bg-stone-200 hover:bg-stone-300 rounded-md transition-colors cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold px-1">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1 bg-stone-200 hover:bg-stone-300 rounded-md transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rodapé e Ação */}
          {!orderPlaced && cart.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-amber-950">
                      <Award size={16} className="text-amber-800 shrink-0" />
                      <span><strong>{user.name}</strong> • <strong>{user.points} pts</strong></span>
                    </div>
                    <span className="text-[11px] text-amber-900 font-medium">
                      +{pointsToEarn} pts neste pedido
                    </span>
                  </div>

                  {/* Vitrine de Resgate por Pontos */}
                  <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Gift size={14} />
                      <span>Resgate Prêmios (10 pts cada):</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={user.points < 10}
                        onClick={() => handleRedeemItem('Bolo de Macaxeira')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                          user.points >= 10
                            ? 'bg-amber-800 hover:bg-amber-900 text-white border-amber-800'
                            : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        🍰 Bolo de Macaxeira
                      </button>
                      <button
                        type="button"
                        disabled={user.points < 10}
                        onClick={() => handleRedeemItem('Café Coado')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                          user.points >= 10
                            ? 'bg-amber-800 hover:bg-amber-900 text-white border-amber-800'
                            : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        ☕ Café Coado
                      </button>
                    </div>
                    {user.points < 10 && (
                      <p className="text-[10px] text-stone-500 text-center">
                        Faltam {10 - user.points} pts para liberar o resgate.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-900">
                    <User size={16} className="shrink-0" />
                    <span>Faça login para juntar pontos de fidelidade!</span>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px] shrink-0"
                  >
                    Entrar
                  </button>
                </div>
              )}

              {/* Valores */}
              <div className="space-y-1 pt-2 border-t border-stone-200 text-xs text-stone-600">
                <div className="flex justify-between items-center text-base font-bold text-stone-900 pt-1">
                  <span>Total do Pedido:</span>
                  <span className="text-amber-800">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Botão de Finalização */}
              <button
                type="button"
                onClick={handleCheckout}
                className={`w-full font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-sm ${
                  user
                    ? 'bg-amber-800 hover:bg-amber-900 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white'
                }`}
              >
                {user ? 'Finalizar Pedido!' : 'Entre para Finalizar!'}
              </button>

              <p className="text-[10px] text-stone-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-amber-800 shrink-0" />
                Dados protegidos em conformidade com a LGPD.
              </p>
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};