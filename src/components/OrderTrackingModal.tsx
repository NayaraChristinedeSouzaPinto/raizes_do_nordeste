import React from 'react';
import { X, Clock, ChefHat, PackageCheck, ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'Recebido' | 'Em Preparação' | 'Pronto';
  createdAt: string;
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus?: (newStatus: 'Recebido' | 'Em Preparação' | 'Pronto') => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus 
}) => {
  if (!isOpen) return null;

  // Sem pedido ativo
  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-4 bg-amber-800 text-white flex items-center justify-between">
            <h2 className="text-lg font-bold">Rastreio do Pedido</h2>
            <button onClick={onClose} className="p-1 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 text-center space-y-3">
            <ShoppingBag size={48} className="mx-auto text-amber-700/40" />
            <p className="text-sm font-semibold text-stone-700">Nenhum pedido recente encontrado.</p>
            <p className="text-xs text-stone-500">Faça um pedido no cardápio para acompanhar o status em tempo real!</p>
          </div>
        </div>
      </div>
    );
  }

  // Passos do rastreio
  const steps = [
    { key: 'Recebido', label: 'Pedido Recebido', icon: Clock, desc: 'Aguardando confirmação da cozinha' },
    { key: 'Em Preparação', label: 'Em Preparação', icon: ChefHat, desc: 'Seus pratos estão sendo preparados' },
    { key: 'Pronto', label: 'Pronto para Retirada', icon: PackageCheck, desc: 'Retire no balcão da unidade' },
  ];

  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case 'Recebido': return 0;
      case 'Em Preparação': return 1;
      case 'Pronto': return 2;
      default: return 0;
    }
  };

  const currentIdx = getCurrentStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="p-4 bg-amber-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Rastreio do Pedido</h2>
            <span className="text-[11px] text-amber-200 font-mono">Pedido #{order.id}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Linha do Tempo de Status */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentIdx;
              const isCurrent = index === currentIdx;

              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {index < steps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-8 ${index < currentIdx ? 'bg-amber-800' : 'bg-stone-200'}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                    isCurrent ? 'bg-amber-800 text-white ring-4 ring-amber-100' : isCompleted ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-400'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-amber-900' : isCompleted ? 'text-stone-800' : 'text-stone-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-stone-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <p className="text-xs font-bold text-amber-900 border-b border-amber-200/60 pb-1.5">Itens do Pedido</p>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-stone-700">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="font-mono font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-amber-200/60 pt-2 flex justify-between text-xs font-black text-amber-950">
              <span>Total Pago</span>
              <span className="font-mono">R$ {order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* TESTE TROCA STATUS */}
          {onUpdateStatus && (
            <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl space-y-2">
              <span className="font-bold text-stone-800 text-[11px] block">
                🧪 Painel de Teste (Simular Mudança de Status):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateStatus('Recebido')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                    order.status === 'Recebido'
                      ? 'bg-amber-800 text-white border-amber-800'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  Recebido
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('Em Preparação')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                    order.status === 'Em Preparação'
                      ? 'bg-amber-800 text-white border-amber-800'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  Em Preparo
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus('Pronto')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                    order.status === 'Pronto'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  Pronto
                </button>
              </div>
            </div>
          )}

          {/* Botão Fechar */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
          >
            Fechar Rastreio
          </button>

        </div>
      </div>
    </div>
  );
};