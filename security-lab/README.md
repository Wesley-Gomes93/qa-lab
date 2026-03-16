# QA Security Lab 🔒

Security testing lab — part of [QA Lab](https://github.com/Wesley-Gomes93/qa-lab).

Intentionally vulnerable apps for practicing security testing, OWASP Top 10, API security, and automated scanning (ZAP, Nuclei, Dependency-Check, Secrets).

## Structure

```
security-lab/
├── apps/                 # Vulnerable targets (do not deploy to production)
│   ├── vulnerable-api/
│   └── vulnerable-web/
├── security-tests/       # Test suites
│   ├── api-security/
│   ├── owasp-top10/
│   └── auth-tests/
├── scanners/             # Security tool configs
│   ├── zap/
│   ├── nuclei/
│   ├── dependency-check/
│   └── secrets-scan/
├── pipelines/            # CI/CD security
├── reports/              # Scan results
├── scripts/              # Automation
└── docs/                 # Guides
```

## Quick Start

```bash
# 1. Na raiz do qa-lab: instale e suba o ambiente
make install
make dev

# 2. Vulnerable Web sobe em http://localhost:3001
# Practice Web (portal normal) em http://localhost:3002

# 3. Teste manualmente ou rode o scan
npm run security:scan   # ZAP, Nuclei, dependency-check, secrets
```

## Passo a passo (juniors)

| Guia | Conteúdo |
|------|----------|
| [EXPLORAR-VULNERABLE-WEB.md](docs/EXPLORAR-VULNERABLE-WEB.md) | Passo a passo por vulnerabilidade (XSS, redirect, debug) — URLs e payloads |
| [passo-a-passo-teste-vulnerabilidades.md](docs/passo-a-passo-teste-vulnerabilidades.md) | Checklist genérico (onde testar, o que testar) |

**Dica:** Acesse `http://localhost:3001/workshop.html` para links "Testar" de cada vulnerabilidade.

## Docs

- [OWASP Top 10](docs/owasp-top10.md)
- [Security Testing Guide](docs/security-testing-guide.md)
- [Architecture](docs/architecture.md)
