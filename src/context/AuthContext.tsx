import React, { createContext, useContext, useState } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password?: string;
  points: number;
}

interface AuthContextData {
  user: UserProfile | null;
  login: (identifier: string, pass: string) => boolean;
  register: (user: UserProfile, lgpdAccepted: boolean) => boolean;
  logout: () => void;
  addPoints: (amountSpent: number) => void;
  redeemPoints: (cost: number) => boolean;
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
    
    const found = users.find(u => (u.cpf === identifier || u.email === identifier) && u.password === pass);
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

    if (users.some(u => u.cpf === newUser.cpf)) {
      return false; 
    }

    const userWithPoints = { ...newUser, points: 0 };
    users.push(userWithPoints);
    localStorage.setItem('raizes_users_db', JSON.stringify(users));
    
    setUser(userWithPoints);
    localStorage.setItem('raizes_logged_user', JSON.stringify(userWithPoints));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('raizes_logged_user');
  };

  const addPoints = (amountSpent: number) => {
    if (!user) return;
    const earned = Math.floor(amountSpent / 10); // 1 ponto a cada R$ 10 gastos
    const updatedUser = { ...user, points: user.points + earned };
    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    const savedDb = localStorage.getItem('raizes_users_db');
    if (savedDb) {
      const users: UserProfile[] = JSON.parse(savedDb);
      const index = users.findIndex(u => u.cpf === user.cpf);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('raizes_users_db', JSON.stringify(users));
      }
    }
  };

  const redeemPoints = (cost: number) => {
    if (!user || user.points < cost) return false;
    const updatedUser = { ...user, points: user.points - cost };
    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    const savedDb = localStorage.getItem('raizes_users_db');
    if (savedDb) {
      const users: UserProfile[] = JSON.parse(savedDb);
      const index = users.findIndex(u => u.cpf === user.cpf);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('raizes_users_db', JSON.stringify(users));
      }
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, addPoints, redeemPoints }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);