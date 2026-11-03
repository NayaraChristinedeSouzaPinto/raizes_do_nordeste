import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register, resetPassword } = useAuth();
  
  // Modos do modal: 'login' | 'register' | 'forgot'
  const [modalMode, setModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados do Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados do Cadastro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdChecked, setLgpdChecked] = useState(false);

  // Estados de Esqueci minha senha (Simulação em 2 passos)
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Estados de visibilidade da senha (Olhinho)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  if (!isOpen) return null;

  // Função para formatar o CPF automaticamente: 000.000.000-00
  const formatCPF = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
    if (numbersOnly.length <= 3) return numbersOnly;
    if (numbersOnly.length <= 6) return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3)}`;
    if (numbersOnly.length <= 9) return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6)}`;
    return `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3, 6)}.${numbersOnly.slice(6, 9)}-${numbersOnly.slice(9)}`;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  // Função para formatar o telefone automaticamente: (81) 98888-8888
  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
    if (numbersOnly.length <= 2) return numbersOnly;
    if (numbersOnly.length <= 7) return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2)}`;
    return `(${numbersOnly.slice(0, 2)}) ${numbersOnly.slice(2, 7)}-${numbersOnly.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMsg('Por favor, preencha o CPF/E-mail e a senha.');
      return;
    }

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

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setErrorMsg('Por favor, digite um CPF válido contendo 11 números.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Por favor, informe um e-mail válido (ex: seu@email.com).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem. Verifique novamente!');
      return;
    }

    if (!lgpdChecked) {
      setErrorMsg('Você precisa aceitar os termos da LGPD para criar a conta.');
      return;
    }

    const success = register({ name, email, phone, cpf, password, points: 0 }, lgpdChecked);
    if (success) {
      setErrorMsg('');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('Este CPF já está cadastrado no sistema.');
    }
  };

  // Passo 1 da Recuperação: Valida silenciosamente no localStorage
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) {
      setErrorMsg('Por favor, informe seu CPF ou e-mail.');
      return;
    }

    const savedDb = localStorage.getItem('raizes_users_db');
    const users: any[] = savedDb ? JSON.parse(savedDb) : [];

    const cleanIdentifier = forgotIdentifier.replace(/\D/g, '');

    const userExists = users.some(
      (u) =>
        u.email.toLowerCase() === forgotIdentifier.toLowerCase() ||
        (cleanIdentifier.length === 11 && u.cpf.replace(/\D/g, '') === cleanIdentifier)
    );

    setErrorMsg('');

    if (userExists) {
      // Se encontrou, gera o código e avança para o passo 2
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(code);
      setSuccessMsg('');
      setForgotStep(2);
    } else {
      // Se não encontrou, exibe a mensagem neutra de segurança (LGPD) e fica na etapa 1
      setSuccessMsg(
        'Se você possui cadastro, siga as instruções de redefinição de senha enviadas para o e-mail informado.'
      );
      setForgotIdentifier('');
    }
  };

  // Passo 2 da Recuperação: Validar Código e Redefinir Senha
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCodeInput !== generatedCode) {
      setErrorMsg(`Código incorreto! Use o código simulado enviado: ${generatedCode}`);
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('As novas senhas digitadas não coincidem.');
      return;
    }

    const success = resetPassword(forgotIdentifier, newPassword);
    if (success) {
      setErrorMsg('');
      setSuccessMsg('Senha redefinida com sucesso! Faça login com a nova senha.');
      setTimeout(() => {
        setSuccessMsg('');
        setModalMode('login');
        setForgotStep(1);
        setForgotIdentifier('');
        setResetCodeInput('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2500);
    } else {
      setErrorMsg('Nenhum usuário encontrado com este CPF ou E-mail.');
    }
  };

  const titles = {
    login: 'Acessar sua Conta',
    register: 'Criar Conta no Clube Raízes',
    forgot: 'Recuperar Senha'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Cabeçalho */}
        <div className="bg-amber-900 text-white p-4 flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <User size={18} className="text-amber-300" />
            {titles[modalMode]}
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
          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODO LOGIN */}
          {modalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">CPF ou e-mail cadastrado:</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: 000.000.000-00 ou seu@email.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Senha:</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-stone-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Digite sua senha"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setModalMode('forgot'); setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                >
                  Esqueci minha senha
                </button>
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
                  onClick={() => { setModalMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                >
                  Ainda não tem conta? Cadastre-se agora
                </button>
              </div>
            </form>
          )}

          {/* MODO CADASTRO */}
          {modalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-0.5">Nome Completo:</label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-0.5">CPF (Apenas números):</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={handleCpfChange}
                    className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-0.5">WhatsApp:</label>
                  <div className="relative flex items-center">
                    <Phone size={13} className="absolute left-2.5 text-stone-400" />
                    <input
                      type="tel"
                      required
                      placeholder="(81) 98888-8888"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full pl-8 pr-2 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-0.5">E-mail:</label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                  />
                </div>
              </div>

              {/* Senha e Confirmação */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-0.5">Senha:</label>
                  <div className="relative flex items-center">
                    <Lock size={13} className="absolute left-2.5 text-stone-400" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-0.5">Confirmar:</label>
                  <div className="relative flex items-center">
                    <Lock size={13} className="absolute left-2.5 text-stone-400" />
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Termo LGPD */}
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
                    Concordo com a política de privacidade e autorizo o tratamento dos meus dados (LGPD) para fins de cadastro no Clube Fidelidade.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md text-xs mt-2"
              >
                Concluir Cadastro
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setModalMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                >
                  Já tem uma conta? Faça login
                </button>
              </div>
            </form>
          )}

          {/* MODO ESQUECI A SENHA - SIMULAÇÃO EM 2 ETAPAS */}
          {modalMode === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                /* Etapa 1: Pedir CPF / E-mail */
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Informe seu CPF ou E-mail cadastrado:
                    </label>
                    <div className="relative flex items-center">
                      <User size={16} className="absolute left-3 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Seu CPF ou e-mail"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md text-xs"
                  >
                    Enviar Código de Verificação
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setModalMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs text-amber-800 hover:underline font-semibold cursor-pointer"
                    >
                      Voltar para o Login
                    </button>
                  </div>
                </form>
              ) : (
                /* Etapa 2: Digitar Código Simulado e Nova Senha */
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl font-medium space-y-1">
                    <p>📧 <strong>E-mail simulado enviado!</strong></p>
                    <p className="text-[11px] text-stone-600">
                      Código de verificação para testes: <strong className="text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300 font-mono text-xs">{generatedCode}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-0.5">Código de Verificação:</label>
                    <input
                      type="text"
                      required
                      placeholder={`Digite o código (${generatedCode})`}
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 font-mono tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-0.5">Nova Senha:</label>
                      <div className="relative flex items-center">
                        <KeyRound size={13} className="absolute left-2.5 text-stone-400" />
                        <input
                          type={showForgotNewPassword ? 'text' : 'password'}
                          required
                          placeholder="Nova senha"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-8 pr-8 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                          className="absolute right-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showForgotNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-0.5">Confirme a Senha:</label>
                      <div className="relative flex items-center">
                        <KeyRound size={13} className="absolute left-2.5 text-stone-400" />
                        <input
                          type={showForgotConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Repita a senha"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full pl-8 pr-8 py-2 text-xs text-stone-900 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                          className="absolute right-2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showForgotConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-md text-xs mt-2"
                  >
                    Salvar Nova Senha
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-xs text-stone-600 hover:underline font-semibold cursor-pointer"
                    >
                      Voltar etapa
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="bg-stone-50 px-6 py-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
          <ShieldCheck size={13} className="text-amber-800" />
          <span>Dados protegidos em conformidade com a LGPD.</span>
        </div>
      </div>
    </div>
  );
};