import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Edit, Trash2, ChefHat, Search, Package, ShoppingCart, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors } from '../styles/GlobalStyles';
import { generateRecipeReport } from '../utils/pdfGenerator';
import { ImageUpload } from '../components/ui/ImageUpload';
import { generateRecipeExcel } from '../utils/excelGenerator';

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

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

const RecipeCard = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &:hover .actions {
    opacity: 1;
  }
`;

const RecipeImage = styled.div`
  position: relative;
  height: 192px;
  background: linear-gradient(to right, ${colors.gray[100]}, ${colors.gray[200]});
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
`;

const Actions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px;
  background: ${colors.white};
  color: ${colors.gray[600]};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.danger ? colors.red[600] : colors.primary[600]};
    background: ${props => props.danger ? colors.red[50] : colors.primary[50]};
  }
`;

const RecipeInfo = styled.div`
  h3 {
    font-weight: 600;
    color: ${colors.gray[900]};
    font-size: 18px;
    margin-bottom: 12px;
  }
`;

const RecipeStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 12px;
  
  .stat {
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${colors.gray[600]};
  }
`;

const CostInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${colors.gray[100]};
  
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

const IngredientRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: end;
  padding: 12px;
  background: ${colors.gray[50]};
  border-radius: 8px;
  
  .ingredient-select {
    flex: 1;
  }
  
  .quantity-input {
    width: 96px;
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
    background: linear-gradient(to right, ${colors.primary[500]}, ${colors.primary[600]});
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

export const RecipesPage = () => {
  const { user, profile } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [packagings, setPackagings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    imageFile: null,
    imagePreview: '',
    selectedIngredients: [],
    packagingId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Para usuário demo, usar dados mock
      if (user?.id === 'demo-user-id') {
        const mockRecipes = [
          {
            id: 'demo-recipe-1',
            name: 'Bolo de Chocolate',
            image_url: null,
            created_at: new Date().toISOString(),
            user_id: 'demo-user-id',
            recipe_ingredients: [
              {
                quantity: 2,
                ingredients: {
                  id: 'demo-ingredient-1',
                  name: 'Farinha de Trigo',
                  unit: 'kg',
                  cost_per_unit: 4.50
                }
              },
              {
                quantity: 1,
                ingredients: {
                  id: 'demo-ingredient-2',
                  name: 'Açúcar',
                  unit: 'kg',
                  cost_per_unit: 3.20
                }
              }
            ],
            recipe_packaging: [
              {
                packagings: {
                  id: 'demo-packaging-1',
                  name: 'Caixa de Papelão Pequena',
                  unit_cost: 2.50
                }
              }
            ]
          }
        ];
        
        const mockIngredients = [
          {
            id: 'demo-ingredient-1',
            name: 'Farinha de Trigo',
            unit: 'kg',
            cost_per_unit: 4.50
          },
          {
            id: 'demo-ingredient-2',
            name: 'Açúcar',
            unit: 'kg',
            cost_per_unit: 3.20
          },
          {
            id: 'demo-ingredient-3',
            name: 'Ovos',
            unit: 'dúzia',
            cost_per_unit: 8.00
          }
        ];
        
        const mockPackagings = [
          {
            id: 'demo-packaging-1',
            name: 'Caixa de Papelão Pequena',
            unit_cost: 2.50
          },
          {
            id: 'demo-packaging-2',
            name: 'Saco Plástico',
            unit_cost: 0.50
          }
        ];
        
        setRecipes(mockRecipes);
        setIngredients(mockIngredients);
        setPackagings(mockPackagings);
        setLoading(false);
        return;
      }
      
      // Load recipes with ingredients and packaging
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          *,
          recipe_ingredients (
            quantity,
            ingredients (*)
          ),
          recipe_packaging (
            packagings (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;
      setRecipes(recipesData || []);

      // Load ingredients
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('*')
        .order('name');

      if (ingredientsError) throw ingredientsError;
      setIngredients(ingredientsData || []);

      // Load packagings
      const { data: packagingsData, error: packagingsError } = await supabase
        .from('packagings')
        .select('*')
        .order('name');

      if (packagingsError) throw packagingsError;
      setPackagings(packagingsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Para usuário demo, simular operação
      if (user.id === 'demo-user-id') {
        const newRecipe = {
          id: 'demo-recipe-' + Date.now(),
          name: formData.name,
          image_url: formData.imagePreview,
          created_at: new Date().toISOString(),
          user_id: 'demo-user-id',
          recipe_ingredients: formData.selectedIngredients.map(si => {
            const ingredient = ingredients.find(ing => ing.id === si.ingredientId);
            return {
              quantity: parseFloat(si.quantity) || 0,
              ingredients: ingredient
            };
          }),
          recipe_packaging: formData.packagingId ? [{
            packagings: packagings.find(pkg => pkg.id === formData.packagingId)
          }] : []
        };
        
        if (editingRecipe) {
          const updatedRecipes = recipes.map(recipe => 
            recipe.id === editingRecipe.id 
              ? { ...newRecipe, id: editingRecipe.id }
              : recipe
          );
          setRecipes(updatedRecipes);
          localStorage.setItem('demo-recipes', JSON.stringify(updatedRecipes));
        } else {
          const updatedRecipes = [newRecipe, ...recipes];
          setRecipes(updatedRecipes);
          localStorage.setItem('demo-recipes', JSON.stringify(updatedRecipes));
        }
        
        setIsModalOpen(false);
        setEditingRecipe(null);
        setFormData({ name: '', imageFile: null, imagePreview: '', selectedIngredients: [], packagingId: '' });
        return;
      }
      
      let recipeId = editingRecipe?.id;
      
      if (editingRecipe) {
        // Update recipe
        const { error: recipeError } = await supabase
          .from('recipes')
          .update({
            name: formData.name,
            image_url: formData.imagePreview,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRecipe.id);

        if (recipeError) throw recipeError;

        // Delete existing ingredients and packaging
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', editingRecipe.id);
        await supabase.from('recipe_packaging').delete().eq('recipe_id', editingRecipe.id);

      } else {
        // Create new recipe
        const { data: newRecipe, error: recipeError } = await supabase
          .from('recipes')
          .insert([{
            name: formData.name,
            image_url: formData.imagePreview,
            user_id: user.id
          }])
          .select()
          .single();

        if (recipeError) throw recipeError;
        recipeId = newRecipe.id;
      }

      // Add ingredients
      if (formData.selectedIngredients.length > 0) {
        const ingredientsToInsert = formData.selectedIngredients.map(si => ({
          recipe_id: recipeId,
          ingredient_id: si.ingredientId,
          quantity: parseFloat(si.quantity) || 0
        }));

        const { error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsToInsert);

        if (ingredientsError) throw ingredientsError;
      }

      // Add packaging
      if (formData.packagingId) {
        const { error: packagingError } = await supabase
          .from('recipe_packaging')
          .insert([{
            recipe_id: recipeId,
            packaging_id: formData.packagingId
          }]);

        if (packagingError) throw packagingError;
      }

      // Recarregar dados para atualizar com relacionamentos
      await loadData();
      setIsModalOpen(false);
      setEditingRecipe(null);
      setFormData({ name: '', imageFile: null, imagePreview: '', selectedIngredients: [], packagingId: '' });

    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Erro ao salvar receita: ' + error.message);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      imageFile: null,
      imagePreview: recipe.image_url || '',
      selectedIngredients: recipe.recipe_ingredients?.map(ri => ({
        ingredientId: ri.ingredients.id,
        quantity: ri.quantity
      })) || [],
      packagingId: recipe.recipe_packaging?.[0]?.packagings?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        // Para usuário demo, simular operação
        if (user?.id === 'demo-user-id') {
          const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
          setRecipes(updatedRecipes);
          localStorage.setItem('demo-recipes', JSON.stringify(updatedRecipes));
          return;
        }
        
        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Atualizar estado local imediatamente
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Erro ao excluir receita: ' + error.message);
      }
    }
  };

  const openNewModal = () => {
    setEditingRecipe(null);
    setFormData({ name: '', imageFile: null, imagePreview: '', selectedIngredients: [], packagingId: '' });
    setIsModalOpen(true);
  };
  const handleImageChange = (file, preview) => {
    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imagePreview: preview
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      selectedIngredients: [...prev.selectedIngredients, { ingredientId: '', quantity: '' }]
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.filter((_, i) => i !== index)
    }));
  };

  const calculateRecipeCost = (recipe) => {
    const ingredientsCost = recipe.recipe_ingredients?.reduce((total, ri) => {
      return total + (parseFloat(ri.quantity) * parseFloat(ri.ingredients.cost_per_unit));
    }, 0) || 0;
    
    const packagingCost = recipe.recipe_packaging?.[0]?.packagings?.unit_cost ? 
      parseFloat(recipe.recipe_packaging[0].packagings.unit_cost) : 0;
    
    return ingredientsCost + packagingCost;
  };

  const generateReport = () => {
    generateRecipeReport(recipes, profile?.company_name);
  };

  const generateExcelReport = () => {
    generateRecipeExcel(recipes, profile?.company_name);
  };
  if (loading) {
    return (
      <LoadingContainer>
        <div>
          <ChefHat size={32} color={colors.white} />
        </div>
        <p>Carregando receitas...</p>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Receitas</h1>
          <p>Gerencie suas receitas e seus ingredientes</p>
        </HeaderContent>
        <HeaderActions>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={generateReport} variant="secondary">
              <FileText size={16} style={{ marginRight: '8px' }} />
              PDF
            </Button>
            <Button onClick={generateExcelReport} variant="ghost">
              <FileText size={16} style={{ marginRight: '8px' }} />
              Excel
            </Button>
          </div>
          <Button onClick={openNewModal}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Nova Receita
          </Button>
        </HeaderActions>
      </Header>

      <Card>
        <Input
          placeholder="Pesquisar receitas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={20} color={colors.gray[400]} />}
        />
      </Card>

      <Grid>
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} hover>
            <RecipeImage>
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.name} />
              ) : (
                <div className="placeholder">
                  <ChefHat size={64} color={colors.gray[400]} />
                </div>
              )}
              
              <Actions className="actions">
                <ActionButton onClick={() => handleEdit(recipe)}>
                  <Edit size={16} />
                </ActionButton>
                <ActionButton danger onClick={() => handleDelete(recipe.id)}>
                  <Trash2 size={16} />
                </ActionButton>
              </Actions>
            </RecipeImage>

            <RecipeInfo>
              <h3>{recipe.name}</h3>
              
              <RecipeStats>
                <div className="stat">
                  <ShoppingCart size={16} />
                  <span>{recipe.recipe_ingredients?.length || 0} ingredientes</span>
                </div>
                {recipe.recipe_packaging?.[0] && (
                  <div className="stat">
                    <Package size={16} />
                    <span>{recipe.recipe_packaging[0].packagings.name}</span>
                  </div>
                )}
              </RecipeStats>

              <CostInfo>
                <span>Custo total:</span>
                <span>R$ {calculateRecipeCost(recipe).toFixed(2)}</span>
              </CostInfo>
            </RecipeInfo>
          </RecipeCard>
        ))}

        {filteredRecipes.length === 0 && (
          <EmptyState>
            <ChefHat size={64} />
            <h3>
              {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita cadastrada'}
            </h3>
            <p>
              {searchTerm ? 'Tente buscar com outros termos' : 'Comece adicionando sua primeira receita'}
            </p>
            {!searchTerm && (
              <Button onClick={openNewModal}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Adicionar Receita
              </Button>
            )}
          </EmptyState>
        )}
      </Grid>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecipe ? 'Editar Receita' : 'Nova Receita'}
        size="lg"
      >
        <Form onSubmit={handleSubmit}>
          <Input
            label="Nome da Receita"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Bolo de Chocolate"
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
              Imagem da Receita (opcional)
            </label>
            <ImageUpload
              value={formData.imagePreview}
              onChange={handleImageChange}
              placeholder="Selecione uma imagem para a receita"
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.gray[700], 
              marginBottom: '8px' 
            }}>
              Embalagem (opcional)
            </label>
            <Select
              value={formData.packagingId}
              onChange={(e) => setFormData(prev => ({ ...prev, packagingId: e.target.value }))}
            >
              <option value="">Sem embalagem</option>
              {packagings.map(packaging => (
                <option key={packaging.id} value={packaging.id}>
                  {packaging.name} - R$ {parseFloat(packaging.unit_cost).toFixed(2)}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: colors.gray[700] }}>
                Ingredientes
              </label>
              <Button type="button" onClick={addIngredient} size="sm" variant="ghost">
                <Plus size={16} style={{ marginRight: '4px' }} />
                Adicionar
              </Button>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.selectedIngredients.map((selectedIng, index) => (
                <IngredientRow key={index}>
                  <div className="ingredient-select">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: colors.gray[700], marginBottom: '4px' }}>
                      Ingrediente
                    </label>
                    <Select
                      value={selectedIng.ingredientId}
                      onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                      required
                    >
                      <option value="">Selecionar ingrediente</option>
                      {ingredients.map(ingredient => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="quantity-input">
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: colors.gray[700], marginBottom: '4px' }}>
                      Qtd
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={selectedIng.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    style={{
                      padding: '8px',
                      color: colors.red[600],
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = colors.red[50]}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <Trash2 size={16} />
                  </button>
                </IngredientRow>
              ))}

              {formData.selectedIngredients.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 0', color: colors.gray[500] }}>
                  <ShoppingCart size={32} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '14px' }}>Nenhum ingrediente adicionado</p>
                </div>
              )}
            </div>
          </div>

          <FormActions>
            <Button type="submit">
              {editingRecipe ? 'Atualizar' : 'Criar'} Receita
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