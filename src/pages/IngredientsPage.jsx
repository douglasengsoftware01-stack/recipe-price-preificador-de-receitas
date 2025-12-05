import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Edit, Trash2, ShoppingCart, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors } from '../styles/GlobalStyles';
import { Units } from '../types';

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

const IngredientCard = styled(Card)`
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

const IngredientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IngredientDetails = styled.div`
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

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.gray[300]};
  border-radius: 8px;
  background: ${colors.white};
  font-size: 16px;
  color: ${colors.gray[900]};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${colors.primary[500]};
    box-shadow: 0 0 0 3px ${colors.primary[500]}20;
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
    background: linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]});
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

export const IngredientsPage = () => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    cost_per_unit: ''
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      // Para usuário demo, usar dados mock
      if (user?.id === 'demo-user-id') {
        const storedIngredients = JSON.parse(localStorage.getItem('demo-ingredients') || '[]');
        
        if (storedIngredients.length === 0) {
          const mockIngredients = [
            {
              id: 'demo-ingredient-1',
              name: 'Farinha de Trigo',
              unit: 'kg',
              costPerUnit: 4.50,
              createdAt: new Date().toISOString(),
              userId: 'demo-user-id'
            },
            {
              id: 'demo-ingredient-2',
              name: 'Açúcar',
              unit: 'kg',
              costPerUnit: 3.20,
              createdAt: new Date().toISOString(),
              userId: 'demo-user-id'
            },
            {
              id: 'demo-ingredient-3',
              name: 'Ovos',
              unit: 'dúzia',
              costPerUnit: 8.00,
              createdAt: new Date().toISOString(),
              userId: 'demo-user-id'
            }
          ];
          localStorage.setItem('demo-ingredients', JSON.stringify(mockIngredients));
          setIngredients(mockIngredients);
        } else {
          setIngredients(storedIngredients);
        }
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedIngredients = data?.map(ingredient => ({
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        costPerUnit: Number(ingredient.cost_per_unit),
        createdAt: ingredient.created_at,
        userId: ingredient.user_id
      })) || [];

      setIngredients(transformedIngredients);
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingredient.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      // Para usuário demo, simular operação
      if (user.id === 'demo-user-id') {
        const newIngredient = {
          id: 'demo-ingredient-' + Date.now(),
          name: formData.name,
          unit: formData.unit,
          costPerUnit: parseFloat(formData.cost_per_unit) || 0,
          createdAt: new Date().toISOString(),
          userId: 'demo-user-id'
        };
        
        if (editingIngredient) {
          const updatedIngredients = ingredients.map(ing => 
            ing.id === editingIngredient.id 
              ? { ...editingIngredient, ...newIngredient, id: editingIngredient.id }
              : ing
          );
          setIngredients(updatedIngredients);
          localStorage.setItem('demo-ingredients', JSON.stringify(updatedIngredients));
        } else {
          const updatedIngredients = [newIngredient, ...ingredients];
          setIngredients(updatedIngredients);
          localStorage.setItem('demo-ingredients', JSON.stringify(updatedIngredients));
        }
        
        setIsModalOpen(false);
        setEditingIngredient(null);
        setFormData({ name: '', unit: '', cost_per_unit: '' });
        return;
      }
      
      if (editingIngredient) {
        const { error } = await supabase
          .from('ingredients')
          .update({
            name: formData.name,
            unit: formData.unit,
            cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingIngredient.id);

        if (error) throw error;
        
        // Atualizar estado local para edição
        setIngredients(prev => prev.map(ing => 
          ing.id === editingIngredient.id 
            ? {
                ...ing,
                name: formData.name,
                unit: formData.unit,
                costPerUnit: parseFloat(formData.cost_per_unit) || 0
              }
            : ing
        ));
      } else {
        const { data, error } = await supabase
          .from('ingredients')
          .insert([{
            name: formData.name,
            unit: formData.unit,
            cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
            user_id: user.id
          }])
          .select();

        if (error) throw error;
        
        // Adicionar novo ingrediente ao estado local
        if (data && data[0]) {
          const newIngredient = {
            id: data[0].id,
            name: data[0].name,
            unit: data[0].unit,
            costPerUnit: Number(data[0].cost_per_unit),
            createdAt: data[0].created_at,
            userId: data[0].user_id
          };
          setIngredients(prev => [newIngredient, ...prev]);
        }
      }

      setIsModalOpen(false);
      setEditingIngredient(null);
      setFormData({ name: '', unit: '', cost_per_unit: '' });
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Erro ao salvar ingrediente: ' + error.message);
    }
  };

  const handleEdit = (ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      cost_per_unit: ingredient.costPerUnit.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ingrediente?')) {
      try {
        // Para usuário demo, simular operação
        if (user?.id === 'demo-user-id') {
          const updatedIngredients = ingredients.filter(ing => ing.id !== id);
          setIngredients(updatedIngredients);
          localStorage.setItem('demo-ingredients', JSON.stringify(updatedIngredients));
          return;
        }
        
        const { error } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Atualizar estado local imediatamente
        const updatedIngredients = ingredients.filter(ing => ing.id !== id);
        setIngredients(updatedIngredients);
        localStorage.setItem('demo-ingredients', JSON.stringify(updatedIngredients));
      } catch (error) {
        console.error('Error deleting ingredient:', error);
        alert('Erro ao excluir ingrediente: ' + error.message);
      }
    }
  };

  const openNewModal = () => {
    setEditingIngredient(null);
    setFormData({ name: '', unit: '', cost_per_unit: '' });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <LoadingContainer>
        <div>
          <ShoppingCart size={32} color={colors.white} />
        </div>
        <p>Carregando ingredientes...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Ingredientes</h1>
          <p>Gerencie os ingredientes utilizados nas suas receitas</p>
        </HeaderContent>
        <Button onClick={openNewModal}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Novo Ingrediente
        </Button>
      </Header>

      <Card>
        <Input
          placeholder="Pesquisar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={20} color={colors.gray[400]} />}
        />
      </Card>

      <Grid>
        {filteredIngredients.map((ingredient) => (
          <IngredientCard key={ingredient.id} hover>
            <CardHeader>
              <IngredientInfo>
                <IconContainer>
                  <ShoppingCart size={24} color={colors.white} />
                </IconContainer>
                <IngredientDetails>
                  <h3>{ingredient.name}</h3>
                  <p>{ingredient.unit}</p>
                </IngredientDetails>
              </IngredientInfo>
              <Actions className="actions">
                <ActionButton onClick={() => handleEdit(ingredient)}>
                  <Edit size={16} />
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(ingredient.id)}>
                  <Trash2 size={16} />
                </ActionButton>
              </Actions>
            </CardHeader>

            <CostInfo>
              <span>Custo por {ingredient.unit}:</span>
              <span>R$ {ingredient.costPerUnit.toFixed(2)}</span>
            </CostInfo>
          </IngredientCard>
        ))}

        {filteredIngredients.length === 0 && (
          <EmptyState>
            <ShoppingCart size={64} />
            <h3>
              {searchTerm ? 'Nenhum ingrediente encontrado' : 'Nenhum ingrediente cadastrado'}
            </h3>
            <p>
              {searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando seu primeiro ingrediente'}
            </p>
            {!searchTerm && (
              <Button onClick={openNewModal}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Adicionar Ingrediente
              </Button>
            )}
          </EmptyState>
        )}
      </Grid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIngredient ? 'Editar Ingrediente' : 'Novo Ingrediente'}
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Nome do Ingrediente"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Farinha de trigo"
            required
          />

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.gray[700], 
              marginBottom: '8px' 
            }}>
              Unidade de Medida
            </label>
            <Select
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              required
            >
              <option value="">Selecione uma unidade</option>
              {Units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Custo por Unidade (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_per_unit}
            onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: e.target.value }))}
            placeholder=""
            leftIcon={<span style={{ color: colors.gray[500], fontSize: '14px' }}>R$</span>}
            required
          />

          <FormActions>
            <Button type="submit">
              {editingIngredient ? 'Atualizar' : 'Criar'} Ingrediente
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