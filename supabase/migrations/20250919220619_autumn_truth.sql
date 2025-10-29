
  /*# Initial Schema for Recipe Pricing System

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `name` (text)
      - `company_name` (text)
      - `avatar_url` (text)
      - `monthly_working_hours` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ingredients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `unit` (text)
      - `cost_per_unit` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `packagings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `unit_cost` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `fixed_expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `monthly_value` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `recipes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `recipe_ingredients`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, references recipes)
      - `ingredient_id` (uuid, references ingredients)
      - `quantity` (numeric)
      - `created_at` (timestamp)
    
    - `recipe_packaging`
      - `id` (uuid, primary key)
      - `recipe_id` (uuid, references recipes)
      - `packaging_id` (uuid, references packagings)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- ================================================
-- TABELAS PRINCIPAIS
-- ================================================

-- Cria a tabela 'profiles' para armazenar informações dos usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY, -- ID do usuário vinculado ao Supabase Auth
  name text, -- Nome do usuário
  company_name text, -- Nome da empresa
  avatar_url text, -- URL do avatar
  monthly_working_hours numeric DEFAULT 160, -- Horas mensais padrão
  created_at timestamptz DEFAULT now(), -- Data de criação
  updated_at timestamptz DEFAULT now() -- Data de atualização
);

-- Cria a tabela 'ingredients' para armazenar ingredientes de receitas
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- ID único gerado automaticamente
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL, -- ID do usuário dono do ingrediente
  name text NOT NULL, -- Nome do ingrediente
  unit text NOT NULL, -- Unidade de medida (ex: kg, L)
  cost_per_unit numeric NOT NULL DEFAULT 0, -- Custo por unidade
  created_at timestamptz DEFAULT now(), -- Data de criação
  updated_at timestamptz DEFAULT now() -- Data de atualização
);

-- Cria a tabela 'packagings' para embalagens de receitas
CREATE TABLE IF NOT EXISTS packagings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, -- Nome da embalagem
  unit_cost numeric NOT NULL DEFAULT 0, -- Custo da embalagem
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cria a tabela 'fixed_expenses' para despesas fixas do usuário
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, -- Nome da despesa fixa
  monthly_value numeric NOT NULL DEFAULT 0, -- Valor mensal
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cria a tabela 'recipes' para armazenar receitas do usuário
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL, -- Nome da receita
  image_url text, -- URL da imagem da receita
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de relacionamento entre receitas e ingredientes
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  quantity numeric NOT NULL DEFAULT 0, -- Quantidade do ingrediente
  created_at timestamptz DEFAULT now()
);

-- Tabela de relacionamento entre receitas e embalagens
CREATE TABLE IF NOT EXISTS recipe_packaging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  packaging_id uuid REFERENCES packagings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ================================================
-- HABILITAÇÃO DE ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packagings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_packaging ENABLE ROW LEVEL SECURITY;

-- ================================================
-- POLÍTICAS DE ACESSO (RLS)
-- ================================================

-- Perfis: usuário pode visualizar, atualizar e inserir apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ingredientes: usuário pode gerenciar apenas seus próprios ingredientes
CREATE POLICY "Users can manage own ingredients"
  ON ingredients FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Embalagens: usuário pode gerenciar apenas suas próprias embalagens
CREATE POLICY "Users can manage own packagings"
  ON packagings FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Despesas fixas: usuário pode gerenciar apenas suas próprias despesas
CREATE POLICY "Users can manage own fixed_expenses"
  ON fixed_expenses FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Receitas: usuário pode gerenciar apenas suas próprias receitas
CREATE POLICY "Users can manage own recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Ingredientes de receitas: usuário só pode gerenciar os ingredientes das próprias receitas
CREATE POLICY "Users can manage recipe_ingredients for own recipes"
  ON recipe_ingredients FOR ALL
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

-- Embalagens de receitas: usuário só pode gerenciar embalagens das próprias receitas
CREATE POLICY "Users can manage recipe_packaging for own recipes"
  ON recipe_packaging FOR ALL
  TO authenticated
  USING (
    recipe_id IN (
      SELECT id FROM recipes WHERE user_id = auth.uid()
    )
  );

-- ================================================
-- BUCKETS DE ARMAZENAMENTO
-- ================================================

-- Cria bucket público para imagens de receitas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Cria bucket público para avatares de usuários
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- POLÍTICAS DE ARMAZENAMENTO
-- ================================================

-- Permitir upload de imagens de receitas apenas para usuários autenticados
CREATE POLICY "Users can upload recipe images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'recipe-images');

-- Permitir visualização de imagens de receitas
CREATE POLICY "Users can view recipe images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'recipe-images');

-- Permitir atualização de imagens de receitas pelo próprio usuário
CREATE POLICY "Users can update own recipe images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir exclusão de imagens de receitas pelo próprio usuário
CREATE POLICY "Users can delete own recipe images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir upload de avatares apenas para usuários autenticados
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Permitir visualização de avatares
CREATE POLICY "Users can view avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- Permitir atualização de avatar apenas pelo próprio usuário
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir exclusão de avatar apenas pelo próprio usuário
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
