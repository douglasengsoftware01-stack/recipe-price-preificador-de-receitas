import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Camera, Save, Lock, Building } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../lib/supabase';
import { colors, Container } from '../styles/GlobalStyles';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const HeaderContent = styled.div`
  h1 {
    font-size: 24px;
    font-weight: bold;
    color: ${colors.gray[900]};
    margin-bottom: 4px;
  }
  
  p {
    color: ${colors.gray[600]};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.div`
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${colors.gray[900]};
  }
  
  p {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
`;

const AvatarSection = styled.div`
  margin-bottom: 24px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${colors.gray[700]};
    margin-bottom: 8px;
  }
`;

const AvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarPlaceholder = styled.div`
  width: 64px;
  height: 64px;
  background: ${colors.gray[200]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CameraButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: ${colors.primary[500]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${colors.primary[600]};
  }
  
  input {
    display: none;
  }
`;

const AvatarInfo = styled.div`
  p {
    font-size: 14px;
    color: ${colors.gray[600]};
    margin-bottom: 4px;
  }
  
  span {
    font-size: 12px;
    color: ${colors.gray[500]};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageCard = styled.div`
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 24px;
  
  ${props => props.type === 'success' && `
    background: ${colors.green[50]};
    border: 1px solid ${colors.green[200]};
    color: ${colors.green[700]};
  `}
  
  ${props => props.type === 'error' && `
    background: ${colors.red[50]};
    border: 1px solid ${colors.red[200]};
    color: ${colors.red[700]};
  `}
  
  p {
    font-size: 14px;
  }
`;

const WarningCard = styled.div`
  background: ${colors.yellow[50]};
  border: 1px solid ${colors.yellow[200]};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  
  p {
    font-size: 14px;
    color: ${colors.yellow[700]};
    
    strong {
      font-weight: 600;
    }
  }
`;

export const ProfilePage = () => {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    company_name: profile?.company_name || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(formData);
      setMessage('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('As senhas não coincidem');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      setPasswordLoading(false);
      return;
    }

    try {
      await updatePassword(passwordData.newPassword);
      setMessage('Senha alterada com sucesso!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const avatarUrl = await uploadImage(file, 'avatars', fileName);
      await updateProfile({ avatar_url: avatarUrl });
      setMessage('Foto atualizada com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload da foto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Meu Perfil</h1>
          <p>Gerencie suas informações pessoais e configurações</p>
        </HeaderContent>
      </Header>

      {/* Messages */}
      {message && (
        <MessageCard type="success">
          <p>{message}</p>
        </MessageCard>
      )}

      {error && (
        <MessageCard type="error">
          <p>{error}</p>
        </MessageCard>
      )}

      <Grid>
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <IconContainer>
              <User size={24} color={colors.white} />
            </IconContainer>
            <CardTitle>
              <h3>Informações Pessoais</h3>
              <p>Atualize seus dados pessoais</p>
            </CardTitle>
          </CardHeader>

          {/* Avatar Upload */}
          <AvatarSection>
            <label>Foto do Perfil</label>
            <AvatarContainer>
              <AvatarWrapper>
                {profile?.avatar_url ? (
                  <Avatar>
                    <img src={profile.avatar_url} alt="Avatar" />
                  </Avatar>
                ) : (
                  <AvatarPlaceholder>
                    <User size={32} color={colors.gray[400]} />
                  </AvatarPlaceholder>
                )}
                <CameraButton>
                  <Camera size={12} color={colors.white} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </CameraButton>
              </AvatarWrapper>
              <AvatarInfo>
                <p>Clique no ícone da câmera para alterar sua foto</p>
                <span>Formatos aceitos: JPG, PNG (máx. 5MB)</span>
              </AvatarInfo>
            </AvatarContainer>
          </AvatarSection>

          <Form onSubmit={handleProfileSubmit}>
            <Input
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite seu nome completo"
              leftIcon={<User size={20} color={colors.gray[400]} />}
            />

            <Input
              label="Nome da Empresa"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Digite o nome da sua empresa"
              leftIcon={<Building size={20} color={colors.gray[400]} />}
            />

            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              leftIcon={<User size={20} color={colors.gray[400]} />}
            />

            <Button type="submit" loading={loading} style={{ width: '100%' }}>
              <Save size={16} style={{ marginRight: '8px' }} />
              Salvar Alterações
            </Button>
          </Form>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <IconContainer style={{ background: `linear-gradient(to right, ${colors.red[500]}, ${colors.red[600]})` }}>
              <Lock size={24} color={colors.white} />
            </IconContainer>
            <CardTitle>
              <h3>Alterar Senha</h3>
              <p>Mantenha sua conta segura</p>
            </CardTitle>
          </CardHeader>

          <Form onSubmit={handlePasswordSubmit}>
            <Input
              label="Nova Senha"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Digite a nova senha"
              leftIcon={<Lock size={20} color={colors.gray[400]} />}
              required
            />

            <Input
              label="Confirmar Nova Senha"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirme a nova senha"
              leftIcon={<Lock size={20} color={colors.gray[400]} />}
              required
            />

            <WarningCard>
              <p>
                <strong>Importante:</strong> A nova senha deve ter pelo menos 6 caracteres.
              </p>
            </WarningCard>

            <Button type="submit" loading={passwordLoading} variant="danger" style={{ width: '100%' }}>
              <Lock size={16} style={{ marginRight: '8px' }} />
              Alterar Senha
            </Button>
          </Form>
        </Card>
      </Grid>
    </Container>
  );
};