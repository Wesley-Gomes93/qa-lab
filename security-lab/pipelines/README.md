# Pipelines

- `security-pipeline.yml` — Template do pipeline de segurança (Dependency-Check, Gitleaks)
- `github-actions/` — Workflows adicionais (o pipeline principal está em `.github/workflows/security-lab.yml`)

Para rodar localmente: `./scripts/run-security-scan.sh` ou `npm run security:scan`
