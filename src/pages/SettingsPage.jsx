import React, { useState } from 'react';
import styled from 'styled-components';
import { Settings, Clock, Save } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
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

const MaxWidthContainer = styled.div`
  max-width: 768px;
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

const InfoCard = styled.div`
  background: ${colors.blue[50]};
  border: 1px solid ${colors.blue[200]};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const InfoContent = styled.div`
  h4 {
    font-weight: 500;
    color: ${colors.blue[900]};
    margin-bottom: 4px;
  }
  
  p {
    font-size: 14px;
    color: ${colors.blue[700]};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ExamplesCard = styled.div`
  background: ${colors.gray[50]};
  border-radius: 8px;
  padding: 16px;
  
  h4 {
    font-weight: 500;
    color: ${colors.gray[900]};
    margin-bottom: 8px;
  }
`;

const ExamplesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  p {
    font-size: 14px;
    color: ${colors.gray[600]};
  }
`;

const MessageCard = styled.div`
  padding: 12px;
  background: ${colors.green[50]};
  border: 1px solid ${colors.green[200]};
  border-radius: 8px;
  margin-bottom: 24px;
  
  p {
    font-size: 14px;
    color: ${colors.green[700]};
  }
`;

const HelpCard = styled(Card)`
  background: linear-gradient(to right, ${colors.secondary[50]}, ${colors.secondary[100]});
  border: 1px solid ${colors.secondary[200]};
  margin-top: 24px;
`;

const HelpHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
`;

const HelpIconContainer = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(to right, ${colors.secondary[500]}, ${colors.secondary[600]});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HelpContent = styled.div`
  h4 {
    font-weight: 500;
    color: ${colors.secondary[900]};
    margin-bottom: 8px;
  }
  
  p {
    font-size: 14px;
    color: ${colors.secondary[700]};
    margin-bottom: 12px;
  }
`;

const FormulaCard = styled.div`
  background: ${colors.white};
  border-radius: 8px;
  padding: 12px;
  
  p {
    font-size: 12px;
    color: ${colors.secondary[800]};
    font-family: 'Courier New', monospace;
  }
`;

export const SettingsPage = () => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    monthlyWorkingHours: profile?.monthly_working_hours || 160
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await updateProfile({
        monthly_working_hours: formData.monthlyWorkingHours
      });
      setMessage('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>Configurações da Empresa</h1>
          <p>Configure os parâmetros gerais para cálculo de precificação</p>
        </HeaderContent>
      </Header>

      {/* Success Message */}
      {message && (
        <MessageCard>
          <p>{message}</p>
        </MessageCard>
      )}

      <MaxWidthContainer>
        <Card>
          <CardHeader>
            <IconContainer>
              <Settings size={24} color={colors.white} />
            </IconContainer>
            <CardTitle>
              <h3>Configurações Gerais</h3>
              <p>Defina os parâmetros básicos da sua empresa</p>
            </CardTitle>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
            <InfoCard>
              <InfoHeader>
                <Clock size={20} color={colors.blue[600]} />
                <InfoContent>
                  <h4>Tempo de Funcionamento</h4>
                  <p>
                    Este valor será usado para calcular o rateio das despesas fixas baseado no tempo de preparo de cada receita.
                  </p>
                </InfoContent>
              </InfoHeader>
            </InfoCard>

            <Input
              label="Horas de Funcionamento Mensal"
              type="number"
              min="1"
              step="0.5"
              value={formData.monthlyWorkingHours}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                monthlyWorkingHours: parseFloat(e.target.value) || 0 
              }))}
              placeholder="160"
              required
              rightIcon={<span style={{ color: colors.gray[500], fontSize: '14px' }}>horas</span>}
            />

            <ExamplesCard>
              <h4>Exemplos de Cálculo:</h4>
              <ExamplesList>
                <p>• 8 horas/dia × 20 dias úteis = 160 horas/mês</p>
                <p>• 10 horas/dia × 22 dias úteis = 220 horas/mês</p>
                <p>• 12 horas/dia × 25 dias úteis = 300 horas/mês</p>
              </ExamplesList>
            </ExamplesCard>

            <div style={{ display: 'flex', gap: '16px', paddingTop: '16px' }}>
              <Button 
                type="submit" 
                loading={isSaving}
                style={{ flex: 1 }}
              >
                <Save size={16} style={{ marginRight: '8px' }} />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </Form>
        </Card>

        {/* Info Card */}
        <HelpCard>
          <HelpHeader>
            <HelpIconContainer>
              <Clock size={20} color={colors.white} />
            </HelpIconContainer>
            <HelpContent>
              <h4>Como funciona o rateio por tempo?</h4>
              <p>
                As despesas fixas mensais são divididas pelo total de horas de funcionamento, 
                gerando um custo por hora. Este valor é então multiplicado pelo tempo de preparo 
                de cada receita para calcular o rateio proporcional das despesas fixas.
              </p>
              <FormulaCard>
                <p>
                  Rateio = (Despesas Fixas ÷ Horas Mensais) × (Tempo Preparo ÷ 60)
                </p>
              </FormulaCard>
            </HelpContent>
          </HelpHeader>
        </HelpCard>
      </MaxWidthContainer>
    </Container>
  );
};