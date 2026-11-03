import React, { useState } from 'react';
import { X, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  // Estados do Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados do Cadastro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [lgpdChecked, setLgpdChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ajuste para passar a senha junto com o identificador no login, se o seu AuthContext exigir
    const success = login(loginIdentifier, loginPassword);
    if (success) {
      setErrorMsg('');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('CPF/E-mail ou senha incorretos. Verifique seus dados!');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lgpdChecked) {
      setErrorMsg('Você precisa aceitar os termos da LGPD para criar a conta.');
      return;
    }

    // Passando a senha junto para salvar no cadastro
    const success = register({ name, email, phone, cpf, password, points: 0 }, lgpdChecked);
    if (success) {
      setErrorMsg('');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('Este CPF já está cadastrado no sistema.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Cabeçalho */}
        <div className="bg-amber-900 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-base">
            {isRegistering ? 'Criar Conta no Clube Raízes' : 'Acessar sua Conta'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {!isRegistering ? (
            /* Formulário de Login */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">CPF ou e-mail cadastrado:</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 000.000.000-00 ou seu@email.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                  <User size={16} className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Senha:</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Digite sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700 placeholder:text-stone-400"
                  />
                  <Lock size={16} className="absolute left-3 top-3 text-stone-400" />
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-sm"
              >
                Entrar na Conta
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
                  className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                >
                  Ainda não tem conta? Cadastre-se agora
                </button>
              </div>
            </form>
          ) : (
            /* Formulário de Cadastro com LGPD e Senha */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-0.5">Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-0.5">CPF:</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-0.5">WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    placeholder="(41) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-0.5">E-mail:</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-0.5">Senha de Acesso:</label>
                <input
                  type="password"
                  required
                  placeholder="Crie uma senha segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                />
              </div>

              {/* Termo de Consentimento LGPD no Cadastro */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 mt-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="lgpd"
                    checked={lgpdChecked}
                    onChange={(e) => setLgpdChecked(e.target.checked)}
                    className="mt-0.5 accent-amber-800 cursor-pointer"
                  />
                  <label htmlFor="lgpd" className="text-[11px] text-amber-950 leading-tight cursor-pointer">
                    Concordo com a política de privacidade e autorizo o tratamento dos meus dados pessoais (LGPD) para fins de cadastro no Clube Fidelidade e processamento de pedidos.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-md text-sm mt-2"
              >
                Concluir Cadastro
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
                  className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                >
                  Já tem uma conta? Faça login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};