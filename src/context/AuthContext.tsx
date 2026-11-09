import React, { createContext, useContext, useState } from 'react';

export interface FidelityTransaction {
  id: string;
  title: string;
  date: string;
  points: string;
  type: 'earned' | 'redeemed';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password?: string;
  points: number;
  history?: FidelityTransaction[];
}

interface AuthContextData {
  user: UserProfile | null;
  login: (identifier: string, pass: string) => boolean;
  register: (user: UserProfile, lgpdAccepted: boolean) => boolean;
  logout: () => void;
  addPoints: (amountSpent: number, orderId?: string) => void;
  redeemPoints: (cost: number) => boolean;
  processCheckoutPoints: (amountSpent: number, hasReward: boolean, orderId?: string) => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  resetPassword: (identifier: string, newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('raizes_logged_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (identifier: string, pass: string) => {
    const savedDb = localStorage.getItem('raizes_users_db');
    const users: UserProfile[] = savedDb ? JSON.parse(savedDb) : [];
    
    const cleanIdentifier = identifier.trim().toLowerCase();
    const numbersOnlyIdentifier = identifier.replace(/\D/g, '');
    
    const found = users.find(u => {
      const cleanUserCpf = u.cpf.replace(/\D/g, '');
      const matchCpf = numbersOnlyIdentifier.length > 0 && cleanUserCpf === numbersOnlyIdentifier;
      const matchEmail = u.email.toLowerCase() === cleanIdentifier;
      
      return (matchCpf || matchEmail) && u.password === pass;
    });

    if (found) {
      setUser(found);
      localStorage.setItem('raizes_logged_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const register = (newUser: UserProfile, lgpdAccepted: boolean) => {
    if (!lgpdAccepted) return false;

    const savedDb = localStorage.getItem('raizes_users_db');
    const users: UserProfile[] = savedDb ? JSON.parse(savedDb) : [];

    const newCleanCpf = newUser.cpf.replace(/\D/g, '');

    // Verifica se já existe usuário com o mesmo CPF
    if (users.some(u => u.cpf.replace(/\D/g, '') === newCleanCpf)) {
      return false; 
    }

    const formattedUser = {
      ...newUser,
      email: newUser.email.trim().toLowerCase(),
      points: 0,
      history: []
    };

    users.push(formattedUser);
    localStorage.setItem('raizes_users_db', JSON.stringify(users));
    
    setUser(formattedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(formattedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('raizes_logged_user');
  };

  const addPoints = (amountSpent: number, orderId?: string) => {
    if (!user) return;
    const earned = Math.floor(amountSpent / 10);
    if (earned <= 0) return;

    const today = new Date().toLocaleDateString('pt-BR');
    const newTransaction: FidelityTransaction = {
      id: Date.now().toString(),
      title: orderId ? `Pedido #${orderId}` : 'Pedido Realizado',
      date: today,
      points: `+${earned} pts`,
      type: 'earned',
    };

    const currentHistory = user.history || [];
    const updatedUser = { 
      ...user, 
      points: user.points + earned,
      history: [newTransaction, ...currentHistory]
    };

    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    const savedDb = localStorage.getItem('raizes_users_db');
    if (savedDb) {
      const users: UserProfile[] = JSON.parse(savedDb);
      const index = users.findIndex(u => u.cpf.replace(/\D/g, '') === user.cpf.replace(/\D/g, ''));
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('raizes_users_db', JSON.stringify(users));
      }
    }
  };

  const redeemPoints = (cost: number) => {
    if (!user || user.points < cost) return false;

    const today = new Date().toLocaleDateString('pt-BR');
    const newTransaction: FidelityTransaction = {
      id: Date.now().toString(),
      title: 'Resgate Fidelidade',
      date: today,
      points: `-${cost} pts`,
      type: 'redeemed',
    };

    const currentHistory = user.history || [];
    const updatedUser = { 
      ...user, 
      points: user.points - cost,
      history: [newTransaction, ...currentHistory]
    };

    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    const savedDb = localStorage.getItem('raizes_users_db');
    if (savedDb) {
      const users: UserProfile[] = JSON.parse(savedDb);
      const index = users.findIndex(u => u.cpf.replace(/\D/g, '') === user.cpf.replace(/\D/g, ''));
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('raizes_users_db', JSON.stringify(users));
      }
    }
    return true;
  };

  const processCheckoutPoints = (amountSpent: number, hasReward: boolean, orderId?: string) => {
    if (!user) return;
    
    const earned = Math.floor(amountSpent / 10);
    const redemptionCost = hasReward ? 10 : 0;
    const newTotalPoints = Math.max(0, user.points - redemptionCost + earned);

    const today = new Date().toLocaleDateString('pt-BR');
    const newTransactions: FidelityTransaction[] = [];

    if (earned > 0) {
      newTransactions.push({
        id: `${Date.now()}-earned`,
        title: `#${orderId} - Pedido Realizado`,
        date: today,
        points: `+${earned} pts`,
        type: 'earned',
      });
    }

    if (hasReward) {
      newTransactions.push({
        id: `${Date.now()}-redeem`,
        title: `#${orderId} - Resgate Clube Raízes`,
        date: today,
        points: `-10 pts`,
        type: 'redeemed',
      });
    }

    const currentHistory = user.history || [];
    const updatedUser = { 
      ...user, 
      points: newTotalPoints,
      history: [...newTransactions, ...currentHistory]
    };

    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    const savedDb = localStorage.getItem('raizes_users_db');
    if (savedDb) {
      const users: UserProfile[] = JSON.parse(savedDb);
      const index = users.findIndex(u => u.cpf.replace(/\D/g, '') === user.cpf.replace(/\D/g, ''));
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('raizes_users_db', JSON.stringify(users));
      }
    }
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { 
      ...user, 
      ...updatedData, 
      email: updatedData.email ? updatedData.email.trim().toLowerCase() : user.email,
      cpf: user.cpf 
    };
    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    const savedDb = localStorage.getItem('raizes_users_db');
    if (savedDb) {
      const users: UserProfile[] = JSON.parse(savedDb);
      const index = users.findIndex(u => u.cpf.replace(/\D/g, '') === user.cpf.replace(/\D/g, ''));
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('raizes_users_db', JSON.stringify(users));
      }
    }
  };

  const resetPassword = (identifier: string, newPass: string) => {
    const savedDb = localStorage.getItem('raizes_users_db');
    const users: UserProfile[] = savedDb ? JSON.parse(savedDb) : [];
    
    const cleanIdentifier = identifier.trim().toLowerCase();
    const numbersOnly = identifier.replace(/\D/g, '');

    const index = users.findIndex(u => {
      const userCpfClean = u.cpf.replace(/\D/g, '');
      const matchCpf = numbersOnly.length > 0 && userCpfClean === numbersOnly;
      const matchEmail = u.email.toLowerCase() === cleanIdentifier;
      return matchCpf || matchEmail;
    });

    if (index === -1) return false;

    users[index].password = newPass;
    localStorage.setItem('raizes_users_db', JSON.stringify(users));

    if (user && (user.cpf.replace(/\D/g, '') === users[index].cpf.replace(/\D/g, '') || user.email.toLowerCase() === cleanIdentifier)) {
      const updatedUser = { ...user, password: newPass };
      setUser(updatedUser);
      localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, addPoints, redeemPoints, processCheckoutPoints, updateProfile, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);