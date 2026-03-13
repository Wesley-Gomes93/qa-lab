# Guia completo: Makefile — aprenda e domine

> **Objetivo:** Entender Make, criar Makefiles eficientes e usar como orquestrador de tarefas em projetos.

---

## 1. O que é Make?

**Make** é uma ferramenta de build/orquestração que:
- Executa **targets** (tarefas) em uma ordem controlada
- Sabe **dependências** entre targets (só roda o que mudou)
- Usa **receitas** (comandos shell) para cada target
- Existe desde 1976 — simples, universal, presente em todo Unix/Mac/Linux

**Por que usar em 2025?**
- Rápido: não precisa de runtime (Node, Python)
- Universal: `make` vem no sistema
- Declarativo: você diz "o quê", não "como" em detalhes
- Cache inteligente: `make` não refaz o que já está ok (quando usa arquivos)

---

## 2. Anatomia de um Makefile

```makefile
# Comentário: começa com #
# Variável
VARIAVEL = valor

# Target: a "tarefa" que você pode executar
nome-do-target:
	comando1
	comando2
	# Cada linha de comando PRECISA de TAB (não espaços!)

# Target com dependências: roda dep1 e dep2 ANTES
target-principal: dep1 dep2
	comando principal
```

**Regra de ouro:** Linhas de comando **obrigatoriamente** começam com **TAB**. Espaços causam erro.

---

## 3. Sintaxe essencial

### 3.1 Targets e receitas

```makefile
hello:
	@echo "Olá!"          # @ suprime o eco do comando
	echo "Rodando..."     # sem @ mostra: echo "Rodando..."
```

- `make hello` → executa a receita
- `@` antes do comando → não mostra o comando, só a saída

### 3.2 Dependências

```makefile
build: lint
	npm run build

lint:
	npm run lint
```

`make build` → primeiro roda `lint`, depois `npm run build`.

### 3.3 Variáveis

```makefile
NPM = npm run
TEST_DIR = tests

test:
	$(NPM) tests:run
	cd $(TEST_DIR) && npx cypress run
```

### 3.4 .PHONY (targets que não são arquivos)

Por padrão, Make acha que cada target é um **arquivo**. Se o arquivo existir e for mais novo que as dependências, o target é "já feito".

Targets como `lint`, `test`, `dev` **não são arquivos**. Marque como `.PHONY`:

```makefile
.PHONY: lint test dev

lint:
	npm run lint

test:
	npm run test
```

### 3.5 Comandos em múltiplas linhas

```makefile
install: npm-install
	npm run frontend:install
	npm run backend:install
	npm run tests:install

# Cada linha roda em um shell separado! Para manter no mesmo shell:
install-tudo:
	npm run frontend:install && \
	npm run backend:install && \
	npm run tests:install
```

Ou use `;` para encadear no mesmo shell:
```makefile
ci:
	npm run lint; npm run test; npm run build
```

---

## 4. Vantagens do Make

| Vantagem | Explicação |
|----------|------------|
| **Unificação** | Um único ponto de entrada: `make ci` em vez de decorar 5 comandos |
| **Ordem garantida** | Dependências garantem lint → build → test |
| **Autocomplete** | `make <TAB>` mostra todos os targets |
| **Documentação viva** | O Makefile documenta o que o projeto pode fazer |
| **Integração CI** | CI chama `make ci` — mesmo comando local e remoto |
| **Sem dependência extra** | Não precisa instalar nada (já vem no OS) |
| **Cache (opcional)** | Com arquivos como targets, Make não refaz o que não mudou |

---

## 5. Padrões úteis

### 5.1 Target "help" (padrão)

```makefile
.PHONY: help
help:
	@echo "Comandos disponíveis:"
	@echo "  make install   - Instala dependências"
	@echo "  make dev       - Sobe ambiente"
	@echo "  make qa        - Roda QA completo"
	@echo "  make ci        - Simula pipeline CI"

# Tornar help o target padrão (quando só digita "make")
.DEFAULT_GOAL := help
```

### 5.2 Variáveis condicionais

```makefile
# Passar variável: make test SUITE=api
SUITE ?= all

test:
	npm run test -- --suite $(SUITE)
```

### 5.3 Targets que verificam pré-requisitos

```makefile
db-up:
	@which docker > /dev/null || (echo "Docker não instalado" && exit 1)
	cd database && docker-compose up -d
```

### 5.4 Silenciar comandos vs. modo debug

```makefile
# make (normal) - suprime comandos
# make V=1 ou make VERBOSE=1 - mostra tudo
ifeq ($(V),1)
  Q =
else
  Q = @
endif

lint:
	$(Q)npm run lint
```

---

## 6. Makefile do QA Lab — explicado

```makefile
# .PHONY: marca targets que NUNCA são arquivos
# Sem isso, "make lint" poderia achar que "lint" é um arquivo
.PHONY: install dev lint qa ci

# install depende de install-deps
# make install → roda install-deps, depois os comandos de install
install: install-deps
	npm run frontend:install
	npm run backend:install
	...

# qa depende de lint e contract
# make qa → lint, contract, tests:run, tests:pw (nessa ordem)
qa: lint contract
	npm run tests:clean-users
	npm run tests:run
	npm run tests:pw
```

**Por que essa ordem?**
1. `lint` — falha rápido se código está ruim
2. `contract` — valida API sem subir app completo
3. `tests:run` — precisa de app (assumindo que `dev` está rodando)
4. `tests:pw` — idem

---

## 7. Como evoluir o Makefile

### Adicionar Security Lab (futuro)

```makefile
security:
	@echo "==> Security Lab"
	cd security-lab && npm run audit
	cd security-lab && npm run scan

# Incluir no ci
ci: lint qa qa-extended security
	@echo "CI completo: OK"
```

### Adicionar paralelismo (Make nativo)

```makefile
# make -j4 roda até 4 targets em paralelo
parallel-qa:
	$(MAKE) -j2 qa-cypress qa-playwright
```

### Variáveis de ambiente

```makefile
# Ler .env se existir
-include .env
export  # Exporta variáveis para os comandos
```

---

## 8. Boas práticas

1. **Use .PHONY** em todos os targets que não geram arquivos.
2. **Crie um target `help`** — `make` ou `make help` deve listar os comandos.
3. **Use variáveis** para comandos repetidos (NPM, diretórios).
4. **Comente targets** com `#` — explique o que faz e quando usar.
5. **Fail fast** — coloque o que falha mais rápido primeiro (lint antes de testes).
6. **Mensagens claras** — `@echo "==> Rodando X"` ajuda a seguir o fluxo.

---

## 9. Recursos para aprender mais

| Recurso | O que aprender |
|---------|----------------|
| `man make` | Referência oficial (sistema) |
| [GNU Make Manual](https://www.gnu.org/software/make/manual/) | Documentação completa |
| [Makefile Tutorial](https://makefiletutorial.com/) | Tutorial interativo |
| Projetos open source | Busque "Makefile" no GitHub de projetos C/Go/Rust |

---

## 10. Cheat sheet rápido

```makefile
# Variável
X = valor

# Target com dep
a: b c
	cmd

# Phony
.PHONY: a b c

# Condicional
ifeq ($(X),y)
  ...
endif

# Target padrão
.DEFAULT_GOAL := help

# Incluir outro arquivo
include outro.mk
```

---

**Próximo passo:** Rode `make help` no QA Lab e experimente cada target. Depois, edite o Makefile e adicione um target seu para praticar.
