import React, { useState, useEffect } from 'react';
import { X, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Máscara para WhatsApp / Telefone: (00) 00000-0000
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSave = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    e.preventDefault();
    
    updateProfile({
      name,
      email: email.trim().toLowerCase(),
      phone,
    });
    
    // Alerta direto e confiável
    alert('Dados atualizados com sucesso!');
    
    // Fecha o modal na hora
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="p-4 bg-amber-800 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">Meu Perfil</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-4">
          
          {/* Confirmação Visual de Sucesso */}
          {showSuccess && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-900 text-xs rounded-xl font-bold flex items-center justify-center gap-2">
              <CheckCircle size={18} className="text-green-600 shrink-0" />
              <span>Dados atualizados com sucesso!</span>
            </div>
          )}

          {/* Saldo de Pontos */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900">
              <Award size={20} className="text-amber-800" />
              <span className="text-xs font-bold">Clube Raízes de Fidelidade</span>
            </div>
            <span className="text-sm font-black text-amber-800">{user.points} pts</span>
          </div>

          {/* CPF (Somente Leitura) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">CPF</label>
            <input
              type="text"
              disabled
              value={user.cpf}
              className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 font-mono cursor-not-allowed"
            />
          </div>

          {/* Nome */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (showSuccess) setShowSuccess(false);
              }}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-800"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (showSuccess) setShowSuccess(false);
              }}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-800"
            />
          </div>

          {/* WhatsApp com Máscara */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">WhatsApp</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                handlePhoneChange(e);
                if (showSuccess) setShowSuccess(false);
              }}
              placeholder="(81) 99999-9999"
              maxLength={15}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-800 font-mono focus:outline-none focus:border-amber-800"
            />
          </div>

          {/* Botão Salvar */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md mt-2"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};