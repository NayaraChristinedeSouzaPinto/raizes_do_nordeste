import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, CheckCircle, Award, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, selectedUnit, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Campos exigidos pelo fluxo de Fidelidade (CPF) e LGPD
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [isFidelidadeApplied, setIsFidelidadeApplied] = useState(false);

  if (!isOpen) return null;

  // Simula a validação do CPF no clube de fidelidade (Conforme CT05)
  const handleValidateCpf = (cpf: string) => {
    setCustomerCpf(cpf);
    // Se digitar 11 dígitos, simulamos que encontrou o cliente no programa de fidelidade
    if (cpf.replace(/\D/g, '').length === 11) {
      setIsFidelidadeApplied(true);
    } else {
      setIsFidelidadeApplied(false);
    }
  };

  // Desconto de 10% simulado para clientes cadastrados no Fidelidade (RF08 / CT05)
  const discount = isFidelidadeApplied ? totalAmount * 0.1 : 0;
  const finalAmount = totalAmount - discount;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
    setTimeout(() => {
      clearCart();
      setOrderPlaced(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCpf('');
      setIsFidelidadeApplied(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Cabeçalho da Modal */}
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
        <div className="p-4 flex-1 overflow-y-auto">
          {orderPlaced ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <CheckCircle size={64} className="text-green-600 animate-bounce" />
              <h3 className="text-xl font-bold text-gray-800">Pedido Confirmado!</h3>
              <p className="text-sm text-gray-600">
                {customerName ? `${customerName}, s` : 'S'}eu pedido foi enviado para a unidade <strong>{selectedUnit.name}</strong> e já está em preparação! {isFidelidadeApplied && 'Pontos de fidelidade creditados com sucesso! ⭐️'}
              </p>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <p className="text-lg font-medium">Seu carrinho está vazio</p>
              <p className="text-sm mt-1">Adicione algumas delícias nordestinas para começar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                📍 Retirada / Consumo em: <strong>{selectedUnit.name}</strong>
              </div>

              {cart.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                      {product.name}
                    </h4>
                    <span className="text-xs text-amber-800 font-bold">
                      R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold px-1">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
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

        {/* Rodapé, Checkout, Fidelidade (RF08/CT05) e LGPD (RF07/RNF04) */}
        {!orderPlaced && cart.length > 0 && (
          <form onSubmit={handleCheckout} className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">Identificação & Clube de Fidelidade:</label>
              
              <input
                type="text"
                required
                placeholder="Seu nome completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
              />

              <div className="relative">
                <input
                  type="text"
                  placeholder="CPF para Fidelidade (Opcional - Ex: 000...)"
                  value={customerCpf}
                  onChange={(e) => handleValidateCpf(e.target.value)}
                  maxLength={14}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
                <div className="absolute right-2.5 top-2 text-amber-700">
                  <Award size={16} />
                </div>
              </div>

              {isFidelidadeApplied && (
                <div className="p-2 bg-green-50 border border-green-200 text-green-800 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 animate-fade-in">
                  <Award size={14} className="shrink-0 text-green-600" />
                  <span>Cliente reconhecido! 10% de desconto aplicado pelo Clube Raízes.</span>
                </div>
              )}

              <input
                type="tel"
                required
                placeholder="WhatsApp / Telefone para aviso"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-700"
              />

              <p className="text-[10px] text-stone-500 leading-tight flex items-center gap-1">
                <ShieldCheck size={12} className="text-amber-800 shrink-0" />
                Em conformidade com a LGPD (RF07), seus dados são protegidos e usados apenas para o pedido e pontos de fidelidade.
              </p>
            </div>

            {/* Resumo de Valores */}
            <div className="space-y-1 pt-2 border-t border-gray-200 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
              {isFidelidadeApplied && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Desconto Fidelidade (10%):</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-base font-bold text-stone-900 pt-1">
                <span>Total:</span>
                <span className="text-amber-800">
                  R$ {finalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-sm"
            >
              Finalizar Pedido e Resgatar Pontos
            </button>
          </form>
        )}
      </div>
    </div>
  );
};