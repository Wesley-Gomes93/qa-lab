# OWASP Dependency-Check

[OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/) — detecta dependências conhecidas com vulnerabilidades (CVEs).

## Uso local (Docker)

```bash
docker run --rm -v $(pwd):/src owasp/dependency-check --scan /src
```

## Integração

Ver `../../scripts/run-security-scan.sh` para execução automatizada.
