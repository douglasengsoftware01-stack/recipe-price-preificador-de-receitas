import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors } from '../styles/GlobalStyles';

const Container = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

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
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PackagingCard = styled(Card)`
  position: relative;
  
  &:hover .actions {
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PackagingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(to right, ${colors.blue[500]}, ${colors.blue[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PackagingDetails = styled.div`
  h3 {
    font-weight: 600;
    color: ${colors.gray[900]};
    margin-bottom: 2px;
  }
  
  p {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
`;

const Actions = styled.div`
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: none;
  color: ${colors.gray[600]};
  
  &:hover {
    color: ${props => props.danger ? colors.red[600] : colors.primary[600]};
    background: ${props => props.danger ? colors.red[50] : colors.primary[50]};
  }
`;

const CostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  span:first-child {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
  
  span:last-child {
    font-weight: bold;
    color: ${colors.primary[600]};
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
  
  svg {
    margin: 0 auto 16px;
    color: ${colors.gray[300]};
  }
  
  h3 {
    font-size: 18px;
    font-weight: 500;
    color: ${colors.gray[900]};
    margin-bottom: 8px;
  }
  
  p {
    color: ${colors.gray[600]};
    margin-bottom: 24px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormActions = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 16px;
  
  button {
    flex: 1;
  }
`;

const LoadingContainer = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  
  div {
    width: 64px;
    height: 64px;
    background: linear-gradient(to right, ${colors.blue[500]}, ${colors.blue[600]});
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
  }
  
  p {
    color: ${colors.gray[600]};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export const PackagingPage = () => {
  const { user } = useAuth();
  const [packagings, setPackagings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackaging, setEditingPackaging] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    unit_cost: ''
  });

  useEffect(() => {
    loadPackagings();
  }, []);

  const loadPackagings = async () => {
    try {
      // Para usuário demo, usar dados mock
      if (user?.id === 'demo-user-id') {
        const storedPackagings = JSON.parse(localStorage.getItem('demo-packagings') || '[]');
        
        if (storedPackagings.length === 0) {
          const mockPackagings = [
            {
              id: 'demo-packaging-1',
              name: 'Caixa de Papelão Pequena',
              unit_cost: 2.50,
              created_at: new Date().toISOString(),
              user_id: 'demo-user-id'
            },
            {
              id: 'demo-packaging-2',
              name: 'Saco Plástico',
              unit_cost: 0.50,
              created_at: new Date().toISOString(),
              user_id: 'demo-user-id'
            }
          ];
          localStorage.setItem('demo-packagings', JSON.stringify(mockPackagings));
          setPackagings(mockPackagings);
        } else {
          setPackagings(storedPackagings);
        }
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('packagings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackagings(data || []);
    } catch (error) {
      console.error('Error loading packagings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackagings = packagings.filter(packaging =>
    packaging.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      // Para usuário demo, simular operação
      if (user.id === 'demo-user-id') {
        const newPackaging = {
          id: 'demo-packaging-' + Date.now(),
          name: formData.name,
          unit_cost: parseFloat(formData.unit_cost) || 0,
          created_at: new Date().toISOString(),
          user_id: 'demo-user-id'
        };
        
        if (editingPackaging) {
          const updatedPackagings = packagings.map(pkg => 
            pkg.id === editingPackaging.id 
              ? { ...editingPackaging, ...newPackaging, id: editingPackaging.id }
              : pkg
          );
          setPackagings(updatedPackagings);
          localStorage.setItem('demo-packagings', JSON.stringify(updatedPackagings));
        } else {
          const updatedPackagings = [newPackaging, ...packagings];
          setPackagings(updatedPackagings);
          localStorage.setItem('demo-packagings', JSON.stringify(updatedPackagings));
        }
        
        setIsModalOpen(false);
        setEditingPackaging(null);
        setFormData({ name: '', unit_cost: '' });
        return;
      }
      
      if (editingPackaging) {
        const { error } = await supabase
          .from('packagings')
          .update({
            name: formData.name,
            unit_cost: parseFloat(formData.unit_cost) || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPackaging.id);

        if (error) throw error;
        
        // Atualizar estado local para edição
        setPackagings(prev => prev.map(pkg => 
          pkg.id === editingPackaging.id 
            ? {
                ...pkg,
                name: formData.name,
                unit_cost: parseFloat(formData.unit_cost) || 0
              }
            : pkg
        ));
      } else {
        const { data, error } = await supabase
          .from('packagings')
          .insert([{
            name: formData.name,
            unit_cost: parseFloat(formData.unit_cost) || 0,
            user_id: user.id
          }])
          .select();

        if (error) throw error;
        
        // Adicionar nova embalagem ao estado local
        if (data && data[0]) {
          setPackagings(prev => [data[0], ...prev]);
        }
      }

      setIsModalOpen(false);
      setEditingPackaging(null);
      setFormData({ name: '', unit_cost: '' });
    } catch (error) {
      console.error('Error saving packaging:', error);
      alert('Erro ao salvar embalagem: ' + error.message);
    }
  };

  const handleEdit = (packaging) => {
    setEditingPackaging(packaging);
    setFormData({
      name: packaging.name,
      unit_cost: packaging.unit_cost.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta embalagem?')) {
      try {
        // Para usuário demo, simular operação
        if (user?.id === 'demo-user-id') {
          const updatedPackagings = packagings.filter(pkg => pkg.id !== id);
          setPackagings(updatedPackagings);
          localStorage.setItem('demo-packagings', JSON.stringify(updatedPackagings));
          return;
        }
        
        const { error } = await supabase
          .from('packagings')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Atualizar estado local imediatamente
        const updatedPackagings = packagings.filter(pkg => pkg.id !== id);
        setPackagings(updatedPackagings);
        localStorage.setItem('demo-packagings', JSON.stringify(updatedPackagings));
      } catch (error) {
        console.error('Error deleting packaging:', error);
        alert('Erro ao excluir embalagem: ' + error.message);
      }
    }
  };

  const openNewModal = () => {
    setEditingPackaging(null);
    setFormData({ name: '', unit_cost: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div>
          <Package size={32} color={colors.white} />
        </div>
        <p>Carregando embalagens...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Embalagens</h1>
          <p>Gerencie as embalagens utilizadas nas suas receitas</p>
        </HeaderContent>
        <Button onClick={openNewModal}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Nova Embalagem
        </Button>
      </Header>

      <Card>
        <Input
          placeholder="Pesquisar embalagens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={20} color={colors.gray[400]} />}
        />
      </Card>

      <Grid>
        {filteredPackagings.map((packaging) => (
          <PackagingCard key={packaging.id} hover>
            <CardHeader>
              <PackagingInfo>
                <IconContainer>
                  <Package size={24} color={colors.white} />
                </IconContainer>
                <PackagingDetails>
                  <h3>{packaging.name}</h3>
                  <p>Embalagem</p>
                </PackagingDetails>
              </PackagingInfo>
              <Actions className="actions">
                <ActionButton onClick={() => handleEdit(packaging)}>
                  <Edit size={16} />
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(packaging.id)}>
                  <Trash2 size={16} />
                </ActionButton>
              </Actions>
            </CardHeader>

            <CostInfo>
              <span>Custo unitário:</span>
              <span>R$ {parseFloat(packaging.unit_cost).toFixed(2)}</span>
            </CostInfo>
          </PackagingCard>
        ))}

        {filteredPackagings.length === 0 && (
          <EmptyState>
            <Package size={64} />
            <h3>
              {searchTerm ? 'Nenhuma embalagem encontrada' : 'Nenhuma embalagem cadastrada'}
            </h3>
            <p>
              {searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando sua primeira embalagem'}
            </p>
            {!searchTerm && (
              <Button onClick={openNewModal}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Adicionar Embalagem
              </Button>
            )}
          </EmptyState>
        )}
      </Grid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackaging ? 'Editar Embalagem' : 'Nova Embalagem'}
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Nome da Embalagem"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Caixa de papelão pequena"
            required
          />

          <Input
            label="Custo Unitário (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.unit_cost}
            onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value }))}
            placeholder=""
            leftIcon={<span style={{ color: colors.gray[500], fontSize: '14px' }}>R$</span>}
            required
          />

          <FormActions>
            <Button type="submit">
              {editingPackaging ? 'Atualizar' : 'Criar'} Embalagem
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </Container>
  );
};