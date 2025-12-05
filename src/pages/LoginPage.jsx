import React, { useState } from 'react';
import styled from 'styled-components';
import { ChefHat, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors } from '../styles/GlobalStyles';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.white} 50%, ${colors.secondary[50]} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const LoginCard = styled.div`
  max-width: 400px;
  width: 100%;
  background: ${colors.white};
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 32px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.3);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: ${colors.gray[900]};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${colors.gray[600]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: ${colors.red[50]};
  border: 1px solid ${colors.red[200]};
  border-radius: 8px;
  color: ${colors.red[700]};
  font-size: 14px;
`;

const DemoCredentials = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${colors.blue[50]};
  border: 1px solid ${colors.blue[200]};
  border-radius: 8px;
  font-size: 14px;
  
  h4 {
    color: ${colors.blue[900]};
    margin-bottom: 8px;
    font-weight: 600;
  }
  
  p {
    color: ${colors.blue[700]};
    margin: 4px 0;
  }
`;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(email, password);
    } catch (err) {
      console.error('Login error:', err);
      setError(err?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@example.com');
    setPassword('demo');
  };

  return (
    <Container>
      <LoginCard>
        <Header>
          <IconContainer>
            <ChefHat size={32} color={colors.white} />
          </IconContainer>
          <Title>RecipePrice</Title>
          <Subtitle>Entre em sua conta</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            leftIcon={<Mail size={20} color={colors.gray[400]} />}
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            leftIcon={<Lock size={20} color={colors.gray[400]} />}
            required
          />

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          <Button
            type="submit"
            size="lg"
            loading={loading}
            style={{ width: '100%' }}
          >
            Entrar
          </Button>
        </Form>

        <DemoCredentials>
          <h4>Credenciais de Demonstração:</h4>
          <p>Email: demo@example.com</p>
          <p>Senha: demo</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fillDemoCredentials}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Usar Credenciais Demo
          </Button>
        </DemoCredentials>
      </LoginCard>
    </Container>
  );
};