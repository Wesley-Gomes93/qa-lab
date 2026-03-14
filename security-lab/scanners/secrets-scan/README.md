# Secrets Scan (Gitleaks / TruffleHog)

Detecta secrets e credenciais expostas no código (API keys, senhas, tokens).

## Opções

- **Gitleaks**: https://github.com/gitleaks/gitleaks
- **TruffleHog**: https://github.com/trufflesecurity/trufflehog

## Uso local (Gitleaks)

```bash
# brew install gitleaks (macOS)
gitleaks detect --source . --report-path reports/secrets-scan.json
```

## Integração

Ver `../../scripts/run-security-scan.sh` para execução automatizada.
