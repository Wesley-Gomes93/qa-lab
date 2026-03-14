# OWASP ZAP

[OWASP ZAP](https://www.zaproxy.org/) — scanner de vulnerabilidades web para testes de penetração automatizados.

## Uso local (Docker)

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:3000
```

## Integração

Ver `../../scripts/run-security-scan.sh` para execução automatizada.
