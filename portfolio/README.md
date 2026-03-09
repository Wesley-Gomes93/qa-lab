 # Meu portfólio

Portfólio pessoal em HTML/CSS estático, com destaque para o QA Lab.

## Deploy na Vercel

### Opção A: Deploy a partir desta pasta (dentro do qa-lab)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **Import Git Repository** e escolha o repositório `qa-lab`
3. Em **Root Directory**, clique em **Edit** e informe: `portfolio`
4. Em **Framework Preset**, selecione **Other** (ou deixe em branco)
5. Clique em **Deploy**

### Opção B: Portfólio em repositório separado

1. Crie um novo repositório no GitHub (ex.: `meu-portfolio`)
2. Copie o conteúdo da pasta `portfolio/` para o novo repo
3. Em [vercel.com/new](https://vercel.com/new), importe o repositório `meu-portfolio`
4. Clique em **Deploy** (não precisa alterar nenhuma configuração)

### Opção C: Deploy via CLI

```bash
cd portfolio
npx vercel
```

Siga as instruções no terminal e faça login se solicitado.

---

## Personalize antes do deploy

Edite `index.html` e ajuste:

- **Links do GitHub:** substitua `wesley-gomes93` pelo seu usuário real
- **LinkedIn:** substitua `wesley-gomes93` pela URL do seu perfil
- **E-mail:** troque `seu-email@exemplo.com` pelo seu e-mail
- **Nome e texto:** adapte a seção "Sobre" e "Hero" ao seu gosto
