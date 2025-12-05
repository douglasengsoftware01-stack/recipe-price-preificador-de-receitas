import React, { createContext, useContext, useState, useEffect } from 'react';
// Importa funções e objetos do Supabase para autenticação e acesso ao banco
import { supabase, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

// Cria um contexto de autenticação que será usado para compartilhar dados de usuário
const AuthContext = createContext();

// Hook personalizado para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Garante que o hook só seja usado dentro de um AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context; // Retorna o contexto (usuário, perfil e funções)
};

// Componente provedor que encapsula toda a aplicação para fornecer autenticação
export const AuthProvider = ({ children }) => {
  // Estado do usuário logado
  const [user, setUser] = useState(null);
  // Estado do perfil do usuário
  const [profile, setProfile] = useState(null);
  // Estado de carregamento (loading)
  const [loading, setLoading] = useState(true);

  // Função para buscar o perfil do usuário no Supabase
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles') // Tabela 'profiles'
        .select('*') // Seleciona todos os campos
        .eq('id', userId) // Filtra pelo ID do usuário
        .single(); // Retorna apenas um registro

      if (error) throw error;
      setProfile(data); // Atualiza o estado com os dados do perfil
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // useEffect para inicializar a autenticação e monitorar mudanças de sessão
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // Se houver usuário logado, atualiza estados de user e profile
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name
          });
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Se erro, cria usuário de demonstração offline
        setUser({
          id: 'demo-user-id',
          email: 'demo@example.com',
          name: 'Demo User'
        });
        setProfile({
          id: 'demo-user-id',
          name: 'Demo User',
          company_name: 'Demo Business',
          email: 'demo@example.com',
          monthly_working_hours: 160
        });
      } finally {
        setLoading(false); // Termina o carregamento
      }
    };

    initAuth();

    // Monitora mudanças de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Usuário entrou, atualiza estados
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name
          });
          await fetchProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          // Usuário saiu, limpa estados
          setUser(null);
          setProfile(null);
        }
      }
    );

    // Limpa a inscrição ao desmontar o componente
    return () => subscription.unsubscribe();
  }, []);

  // Função para login do usuário
  const signIn = async (email, password) => {
    try {
      setLoading(true);

      // Login demo (offline)
      if (email === 'demo@example.com' && password === 'demo') {
        setUser({
          id: 'demo-user-id',
          email: 'demo@example.com',
          name: 'Demo User'
        });

        // Carrega perfil demo do localStorage ou cria padrão
        const storedProfile = localStorage.getItem('demo-profile');
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        } else {
          const defaultProfile = {
            id: 'demo-user-id',
            name: 'Demo User',
            company_name: 'Demo Business',
            email: 'demo@example.com',
            monthly_working_hours: 160
          };
          setProfile(defaultProfile);
          localStorage.setItem('demo-profile', JSON.stringify(defaultProfile));
        }
        return;
      }

      // Checa se credenciais do Supabase são válidas
      if (supabaseUrl === 'https://demo.supabase.co' || supabaseAnonKey === 'demo-key') {
        throw new Error('Demo mode: Use demo@example.com with password "demo"');
      }

      try {
        // Tenta autenticar no Supabase
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (fetchError) {
        throw new Error('Connection failed. Try demo credentials: demo@example.com / demo');
      }
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout do usuário
  const signOut = async () => {
    // Se for usuário demo, apenas limpa estado local
    if (user?.id === 'demo-user-id') {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('demo-profile');
      localStorage.removeItem('demo-recipes');
      localStorage.removeItem('demo-ingredients');
      localStorage.removeItem('demo-packagings');
      localStorage.removeItem('demo-expenses');
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Função para atualizar o perfil do usuário
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    // Para usuário demo, apenas atualiza estado local
    if (user.id === 'demo-user-id') {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      localStorage.setItem('demo-profile', JSON.stringify(updatedProfile));
      return updatedProfile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Função para atualizar a senha do usuário
  const updatePassword = async (newPassword) => {
    if (user?.id === 'demo-user-id') {
      throw new Error('Não é possível alterar senha do usuário demo');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  // Objeto que será disponibilizado para toda aplicação via contexto
  const value = {
    user,
    profile,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    loading,
  };

  // Provider que envolve toda a aplicação e fornece o contexto
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
