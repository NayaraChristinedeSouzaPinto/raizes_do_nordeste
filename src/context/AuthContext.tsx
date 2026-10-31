import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  points: number;
}

interface AuthContextData {
  user: UserProfile | null;
  login: (cpfOrEmail: string) => boolean;
  register: (user: UserProfile, lgpdAccepted: boolean) => boolean;
  logout: () => void;
  addPoints: (amountSpent: number) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('raizes_logged_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (identifier: string) => {
    // Simula a busca no banco local de usuários cadastrados
    const savedDb = localStorage.getItem('raizes_users_db');
    const users: UserProfile[] = savedDb ? JSON.parse(savedDb) : [];
    
    const found = users.find(u => u.cpf === identifier || u.email === identifier);
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

    // Verifica se já existe
    if (users.some(u => u.cpf === newUser.cpf)) {
      return false; // Usuário já existe
    }

    const userWithPoints = { ...newUser, points: 0 };
    users.push(userWithPoints);
    localStorage.setItem('raizes_users_db', JSON.stringify(users));
    
    // Loga automaticamente após o cadastro
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
    const earned = Math.floor(amountSpent * 10); // 10 pontos por real
    const updatedUser = { ...user, points: user.points + earned };
    setUser(updatedUser);
    localStorage.setItem('raizes_logged_user', JSON.stringify(updatedUser));

    // Atualiza também no "banco" geral
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, addPoints }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);