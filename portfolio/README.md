# Meu portfólio

Portfólio pessoal em HTML/CSS estático, com destaque para o QA Lab.

## Screenshot da pipeline

Para exibir o print da pipeline no portfolio:

1. Acesse https://github.com/Wesley-Gomes93/qa-lab/actions
2. Abra um run que passou (verde)
3. Faça um screenshot mostrando lint, build, tests, e2e, report
4. Salve em `portfolio/images/pipeline-verde.png`

Se o arquivo não existir, o portfolio mostra uma mensagem alternativa.

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

- **GitHub:** já configurado para `Wesley-Gomes93/qa-lab`
- **LinkedIn:** já configurado para `wesley-gomes93`
- **E-mail:** troque `seu-email@exemplo.com` pelo seu e-mail real
- **Nome e texto:** adapte a seção "Sobre" e "Hero" ao seu gosto
