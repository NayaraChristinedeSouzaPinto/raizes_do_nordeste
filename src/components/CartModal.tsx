import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Award, 
  ShieldCheck, 
  User, 
  Gift, 
  QrCode, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutSuccess?: (order: {
    id: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    status: 'Recebido' | 'Em Preparação' | 'Pronto';
    createdAt: string;
  }) => void;
}

type PaymentMethod = 'pix' | 'credit' | 'debit';
type CheckoutStep = 'cart' | 'payment' | 'pix-qrcode' | 'processing' | 'error';

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onCheckoutSuccess }) => {
  const { cart, selectedUnit, updateQuantity, removeFromCart, totalAmount, clearCart, addToCart } = useCart();
  const { user, processCheckoutPoints } = useAuth();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [simulateError, setSimulateError] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');

  // Estados para os dados do cartão e validação
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardError, setCardError] = useState('');

  // Sempre que o modal abrir ou o carrinho mudar, reseta para a etapa inicial do carrinho
  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('cart');
      setOrderPlaced(false);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardError('');
    }
  }, [isOpen]);

  // Se houver novos itens adicionados, garante que sai da tela de sucesso anterior
  useEffect(() => {
    if (cart.length > 0 && orderPlaced) {
      setOrderPlaced(false);
      setCheckoutStep('cart');
    }
  }, [cart]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setOrderPlaced(false);
    setCheckoutStep('cart');
    setCopiedKey(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardError('');
    onClose();
  };

  const hasRewardInCart = cart.some(item => item.product.id.startsWith('reward-'));
  const pointsToEarn = Math.floor(totalAmount / 10);

  const handleProceedToPayment = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setCheckoutStep('payment');
  };

  // Funções de formatação e limpeza em tempo real para o cartão
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(value);
    setCardError('');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
    setCardError('');
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardCvv(value);
    setCardError('');
  };

  // Clique em Concluir Pagamento
  const handleInitialPaymentSubmit = () => {
    if (paymentMethod === 'pix') {
      // Se for PIX, abre a tela com a chave gerada e o QR Code
      setCheckoutStep('pix-qrcode');
    } else {
      // Validações para Cartão
      const cleanNumber = cardNumber.replace(/\s/g, '');
      if (cleanNumber.length < 16) {
        setCardError('O número do cartão deve conter exatamente 16 dígitos.');
        return;
      }
      if (cardExpiry.length < 5) {
        setCardError('Informe a validade correta no formato MM/AA.');
        return;
      }
      if (cardCvv.length < 3) {
        setCardError('O CVV deve conter pelo menos 3 dígitos.');
        return;
      }

      setCardError('');
      // Se passou nas validações, processa direto simulando o gateway
      handleProcessCheckout();
    }
  };

  // Simula a transação no Gateway Externo
  const handleProcessCheckout = () => {
    setCheckoutStep('processing');

    setTimeout(() => {
      if (simulateError) {
        setCheckoutStep('error');
      } else {
        const orderData = {
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          items: cart.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          })),
          total: totalAmount,
          status: 'Recebido' as const,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        processCheckoutPoints(totalAmount, hasRewardInCart);

        if (onCheckoutSuccess) {
          onCheckoutSuccess(orderData);
        }

        clearCart();
        setOrderPlaced(true);
        setCheckoutStep('cart');
      }
    }, 2000);
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136raizes-nordeste-pagamento-oficial");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleRedeemItem = (itemName: string) => {
    if (!user || user.points < 10) return;

    if (hasRewardInCart) {
      setRedeemSuccessMsg('Limite de 1 item de resgate por pedido atingido!');
      setTimeout(() => setRedeemSuccessMsg(''), 4000);
      return;
    }

    const rewardImage = itemName.includes('Bolo') 
      ? '/products/Bolo_de_Macaxeira.png' 
      : '/products/Cafe_Coado.png';

    addToCart({
      id: `reward-${Date.now()}`,
      name: `${itemName}`,
      description: 'Item resgatado com pontos do Clube Raízes',
      price: 0,
      category: 'sobremesas',
      image: rewardImage
    });
    setRedeemSuccessMsg(`"${itemName}" adicionado como resgate!`);
    setTimeout(() => setRedeemSuccessMsg(''), 4000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Cabeçalho */}
          <div className="p-4 bg-amber-800 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {checkoutStep === 'payment' ? 'Forma de Pagamento' : checkoutStep === 'pix-qrcode' ? 'Pagamento via PIX' : 'Seu Pedido'}
            </h2>
            <button
              onClick={handleCloseModal}
              className="p-1 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            
            {/* ETAPA: PIX QR CODE E CHAVE COPIA E COLA */}
            {checkoutStep === 'pix-qrcode' && (
              <div className="space-y-4 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-xs text-emerald-800 font-semibold block">Escaneie o QR Code ou copie a chave abaixo</span>
                  <span className="text-lg font-black text-emerald-950">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 border-2 border-dashed border-emerald-300 rounded-2xl inline-block shadow-inner mx-auto">
                  <div className="w-36 h-36 bg-emerald-900/10 rounded-xl flex items-center justify-center mx-auto text-emerald-800">
                    <QrCode size={96} />
                  </div>
                  <span className="text-[10px] text-stone-500 mt-2 block font-mono">PIX Copia e Cola Oficial</span>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-bold text-stone-700 block">Chave Pix (Copia e Cola):</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="00020126580014br.gov.bcb.pix0136raizes-nordeste-pagamento-oficial"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg text-[10px] text-stone-600 font-mono select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPixKey}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                      {copiedKey ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                {/* Simulação */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[11px] text-left">
                  <span className="font-bold text-amber-950 block">🧪 Simulação:</span>
                  <label className="flex items-center gap-2 text-stone-700 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={simulateError}
                      onChange={(e) => setSimulateError(e.target.checked)}
                      className="rounded text-amber-800 focus:ring-amber-800 cursor-pointer"
                    />
                    <span>Simular falha PIX</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('payment')}
                    className="w-1/3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessCheckout}
                    className="w-2/3 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Confirmar Pagamento
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA: PROCESSANDO PAGAMENTO */}
            {checkoutStep === 'processing' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <Loader2 size={56} className="text-amber-800 animate-spin" />
                <h3 className="text-lg font-bold text-stone-800">Validando Pagamento...</h3>
                <p className="text-xs text-stone-500 max-w-xs">
                  Consultando pagamento junto ao gateway externo. Aguarde um instante.
                </p>
              </div>
            )}

            {/* ETAPA: ERRO / RECUSA */}
            {checkoutStep === 'error' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <AlertCircle size={64} className="text-red-600 animate-bounce" />
                <h3 className="text-xl font-bold text-stone-800">Pagamento Não Aprovado</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  O gateway externo recusou ou não identificou a transação. Ajuste a forma de pagamento.
                </p>
                <div className="w-full pt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('payment')}
                    className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulateError(false);
                      setCheckoutStep('cart');
                    }}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Voltar ao Carrinho
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA: SELEÇÃO DE PAGAMENTO */}
            {checkoutStep === 'payment' && (
              <div className="space-y-4">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-xs text-stone-500 block">Total a pagar:</span>
                  <span className="text-2xl font-black text-amber-900">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700 block">
                    Selecione a forma de pagamento:
                  </label>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-amber-800 bg-amber-50 text-amber-900 ring-2 ring-amber-800/20'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <QrCode size={18} className="text-emerald-600" />
                        <span>PIX</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Recomendado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'credit'
                          ? 'border-amber-800 bg-amber-50 text-amber-900 ring-2 ring-amber-800/20'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard size={18} className="text-amber-800" />
                        <span>Cartão de Crédito</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('debit')}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'debit'
                          ? 'border-amber-800 bg-amber-50 text-amber-900 ring-2 ring-amber-800/20'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CreditCard size={18} className="text-amber-700" />
                        <span>Cartão de Débito</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Campos do Cartão */}
                {paymentMethod !== 'pix' && (
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
                    <span className="font-bold text-stone-700 block">Insira os dados do cartão:</span>
                    
                    {cardError && (
                      <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg font-medium">
                        ⚠️ {cardError}
                      </div>
                    )}

                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                      className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-800 font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="MM/AA" 
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-800 font-mono"
                      />
                      <input 
                        type="text" 
                        placeholder="CVV" 
                        value={cardCvv}
                        onChange={handleCvvChange}
                        maxLength={4}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-800 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Simulação */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[11px]">
                  <span className="font-bold text-amber-950 block">🧪 Simulação:</span>
                  <label className="flex items-center gap-2 text-stone-700 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={simulateError}
                      onChange={(e) => setSimulateError(e.target.checked)}
                      className="rounded text-amber-800 focus:ring-amber-800 cursor-pointer"
                    />
                    <span>Simular falha de transação</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-1/3 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleInitialPaymentSubmit}
                    className="w-2/3 py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                  >
                    Concluir Pagamento
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA: CARRINHO NORMAL */}
            {checkoutStep === 'cart' && (
              <>
                {orderPlaced ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <CheckCircle size={64} className="text-green-600 animate-bounce" />
                    <h3 className="text-xl font-bold text-stone-800">Pedido Confirmado!</h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {user?.name.split(' ')[0]}, seu pedido foi enviado para a unidade <strong>{selectedUnit.name}</strong> e já está em preparação!
                    </p>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold">
                      ⭐️ Saldo de pontos atualizado no seu perfil com sucesso!
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
                            {product.price === 0 ? <span className="text-green-700">GRÁTIS</span> : `R$ ${(product.price * quantity).toFixed(2).replace('.', ',')}`}
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
              </>
            )}
          </div>

          {/* Rodapé e Ação */}
          {checkoutStep === 'cart' && !orderPlaced && cart.length > 0 && (
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

                  <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <div className="flex items-center gap-1.5">
                        <Gift size={14} />
                        <span>Resgatar Prêmio (10 pts):</span>
                      </div>
                      {hasRewardInCart && (
                        <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                          Resgate aplicado
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={user.points < 10 || hasRewardInCart}
                        onClick={() => handleRedeemItem('Bolo de Macaxeira')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                          user.points >= 10 && !hasRewardInCart
                            ? 'bg-amber-800 hover:bg-amber-900 text-white border-amber-800'
                            : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        🍰 Bolo de Macaxeira
                      </button>
                      <button
                        type="button"
                        disabled={user.points < 10 || hasRewardInCart}
                        onClick={() => handleRedeemItem('Café Coado')}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                          user.points >= 10 && !hasRewardInCart
                            ? 'bg-amber-800 hover:bg-amber-900 text-white border-amber-800'
                            : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                      >
                        ☕ Café Coado
                      </button>
                    </div>
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

              <div className="space-y-1 pt-2 border-t border-stone-200 text-xs text-stone-600">
                <div className="flex justify-between items-center text-base font-bold text-stone-900 pt-1">
                  <span>Total do Pedido:</span>
                  <span className="text-amber-800">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                className={`w-full font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-sm ${
                  user
                    ? 'bg-amber-800 hover:bg-amber-900 text-white'
                    : 'bg-amber-700 hover:bg-amber-800 text-white'
                }`}
              >
                {user ? 'Ir para Pagamento' : 'Entre para Finalizar!'}
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