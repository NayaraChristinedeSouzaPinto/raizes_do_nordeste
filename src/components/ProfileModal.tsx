import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle, ArrowUpRight, ArrowDownLeft, Gift, User, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'perfil' | 'fidelidade'>('perfil');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone ? formatPhone(user.phone) : '');
    }
    setShowSuccess(false);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Utiliza exclusivamente o histórico do usuário logado
  const history = user.history || [];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email: email.trim().toLowerCase(), phone });
    alert('Dados atualizados com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-4 bg-amber-800 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">Meu Perfil</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-amber-200 bg-amber-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'perfil' ? 'border-amber-800 text-amber-900 bg-white' : 'border-transparent text-stone-500 hover:text-amber-900'
            }`}
          >
            <User size={15} /> Dados Cadastrais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fidelidade')}
            className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              activeTab === 'fidelidade' ? 'border-amber-800 text-amber-900 bg-white' : 'border-transparent text-stone-500 hover:text-amber-900'
            }`}
          >
            <Award size={15} /> Extrato de Pontos
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Card de Pontos */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-amber-900">
              <Award size={20} className="text-amber-800 shrink-0" />
              <div>
                <span className="text-xs font-bold block">Clube Raízes de Fidelidade</span>
                <span className="text-[10px] text-amber-700">Some 1 ponto a cada R$ 10,00 gastos</span>
              </div>
            </div>
            <span className="text-sm font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              {user.points} pts
            </span>
          </div>

          {activeTab === 'perfil' && (
            <div className="space-y-4">
              {showSuccess && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-900 text-xs rounded-xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle size={18} className="text-green-600 shrink-0" />
                  <span>Dados atualizados com sucesso!</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">CPF</label>
                <input type="text" disabled value={user.cpf} className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 font-mono cursor-not-allowed" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Nome Completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-800" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-800" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">WhatsApp</label>
                <input type="text" value={phone} onChange={handlePhoneChange} placeholder="(81) 99999-9999" maxLength={15} className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 font-mono focus:outline-none focus:border-amber-800" />
              </div>

              <button type="button" onClick={handleSave} className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md mt-2">
                Salvar Alterações
              </button>
            </div>
          )}

          {activeTab === 'fidelidade' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-700 block mb-1">
                Histórico de Pontos e Resgates:
              </span>

              {history.length > 0 ? (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${item.type === 'earned' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                          {item.type === 'earned' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-stone-800">{item.title}</p>
                          <span className="text-[10px] text-stone-400">{item.date}</span>
                        </div>
                      </div>

                      <span className={`font-mono font-black ${item.type === 'earned' ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-stone-200 rounded-xl text-stone-400 space-y-2">
                  <History size={28} className="mx-auto text-stone-300" />
                  <p className="text-xs font-semibold">Nenhuma movimentação ainda.</p>
                  <p className="text-[10px]">Faça seu primeiro pedido para acumular pontos!</p>
                </div>
              )}

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 flex items-center gap-2 mt-4">
                <Gift size={16} className="text-amber-800 shrink-0" />
                <span>Troque seus pontos por produtos direto no checkout!</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};