# Security Lab — Architecture

## Visão geral

```
security-lab/
├── apps/              # Alvos intencionalmente vulneráveis
│   ├── vulnerable-api   # API REST (Node/Express) para testes
│   └── vulnerable-web   # App web (HTML/JS) para testes
│
├── security-tests/    # Suítes de teste
│   ├── api-security   # Injeção, auth, rate limit
│   ├── owasp-top10    # Cenários mapeados ao Top 10
│   └── auth-tests     # Login, sessão, JWT
│
├── scanners/          # Ferramentas de scan
│   ├── zap            # OWASP ZAP
│   ├── nuclei         # Nuclei templates
│   ├── dependency-check
│   └── secrets-scan   # Gitleaks, trufflehog
│
├── pipelines/         # CI/CD
│   └── security-pipeline.yml
│
├── reports/           # Saída dos scans
├── scripts/           # Automação
└── docs/              # Documentação
```

## Fluxo de dados

```
[vulnerable apps] ←→ [security-tests] → [scanners] → [reports]
                         ↑                   ↑
                         |                   |
                    (manual/auto)      (ZAP, Nuclei, etc.)
```

## Integração com QA Lab

O Security Lab pode ser executado:
- **Standalone** — dentro de `security-lab/`
- **Via npm** — `npm run security:scan` (raiz do qa-lab)
- **Pipeline** — job de segurança no CI
