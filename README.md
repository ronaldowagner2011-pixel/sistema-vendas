# Sistema de Vendas — Guia de Deploy no Railway

## Pré-requisitos
- Conta no GitHub (github.com)
- Conta no Railway (railway.app)

---

## Passo 1 — Subir o código no GitHub

1. Acesse github.com e clique em "New repository"
2. Nome: sistema-vendas — clique em "Create repository"
3. No seu computador, abra a pasta vendas-app no terminal e execute:

git init
git add .
git commit -m "Sistema de vendas inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/sistema-vendas.git
git push -u origin main

---

## Passo 2 — Criar o banco de dados no Railway

1. Acesse railway.app e faça login
2. Clique em "New Project"
3. Escolha "Provision PostgreSQL"
4. Copie o valor de DATABASE_URL — vai usar no próximo passo

---

## Passo 3 — Deploy da aplicação no Railway

1. No mesmo projeto, clique em "+ New Service"
2. Escolha "GitHub Repo" e selecione "sistema-vendas"

---

## Passo 4 — Configurar variáveis de ambiente

No serviço, vá em "Variables" e adicione:

DATABASE_URL = (valor copiado do banco)
NEXTAUTH_SECRET = (gere com: openssl rand -base64 32)
NEXTAUTH_URL = https://seu-sistema.railway.app

---

## Passo 5 — Criar sua conta

1. Acesse: https://seu-sistema.railway.app/setup
2. Crie seu email e senha
3. Faça login em /login

---

## Acesso

https://seu-sistema.railway.app

Funciona de qualquer navegador, computador ou celular!
