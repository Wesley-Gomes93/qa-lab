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
# Run security scan
./scripts/run-security-scan.sh

# Or use npm (from qa-lab root)
npm run security:scan
```

## Docs

- [OWASP Top 10](docs/owasp-top10.md)
- [Security Testing Guide](docs/security-testing-guide.md)
- [Architecture](docs/architecture.md)
