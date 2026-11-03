import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Award, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
    if (numbersOnly.length <= 2) return numbersOnly;
    if (numbersOnly.length <= 7) return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2)}`;
    return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 7)}-${numbersOnly.slice(7)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, email });
    setSuccessMsg('Dados atualizados com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        <div className="bg-amber-900 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <User size={18} className="text-amber-300" />
            Meu Perfil & Fidelidade
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Card de Fidelidade */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-950">
              <Award size={22} className="text-amber-800" />
              <div>
                <p className="text-xs font-bold">Clube Raízes de Fidelidade</p>
                <p className="text-[11px] text-stone-600">1 ponto a cada R$ 10 gastos</p>
              </div>
            </div>
            <span className="bg-amber-800 text-white font-bold px-2.5 py-1 rounded-lg text-xs">
              {user.points} pts
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Nome Completo:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">CPF (Inalterável):</label>
              <input
                type="text"
                disabled
                value={user.cpf}
                className="w-full px-3 py-2 text-xs text-stone-500 bg-stone-200 border border-stone-300 rounded-xl cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">WhatsApp:</label>
              <div className="relative flex items-center">
                <Phone size={13} className="absolute left-2.5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  className="w-full pl-8 pr-2 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">E-mail:</label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md text-xs mt-2"
          >
            Salvar Alterações
          </button>
        </form>

        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
          <ShieldCheck size={13} className="text-amber-800" />
          <span>Dados protegidos em conformidade com a LGPD.</span>
        </div>
      </div>
    </div>
  );
};