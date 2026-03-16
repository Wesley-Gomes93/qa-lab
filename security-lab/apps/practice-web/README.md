# Practice Web — Portal para Prática de Security

Um **portal que parece normal**, sem botões ou links óbvios de "teste aqui".  
O objetivo é navegar como em um site real e descobrir vulnerabilidades você mesmo.

## Como subir

```bash
cd security-lab/apps/practice-web
npm install
npm run dev
```

Acesse: **http://localhost:3002**

## O que fazer

1. **Navegue normalmente** — use o menu, preencha formulários, clique nos links.
2. **Pense como um atacante** — o que um usuário malicioso tentaria?
3. **Teste os parâmetros** — URLs com `?param=valor`, formulários, etc.
4. **Observe o código-fonte** — Ctrl+U às vezes revela coisas interessantes.
5. **Rote comum** — `/status`, `/debug`, `/api`, `.env` — existem endpoints além do menu?

## Dica

Em testes de segurança reais, você não tem um mapa. Aqui também não tem — só um portal comum com 5 rotas no menu. O resto é exploração.
