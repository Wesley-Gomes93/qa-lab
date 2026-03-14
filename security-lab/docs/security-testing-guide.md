# Security Testing Guide — Security Lab

## Fluxo recomendado

1. **Subir as apps vulneráveis**
   ```bash
   cd apps/vulnerable-api && npm start
   cd apps/vulnerable-web && npm start
   ```

2. **Executar testes manuais/automatizados**
   - `security-tests/api-security/` — testes de API
   - `security-tests/auth-tests/` — autenticação e sessão
   - `security-tests/owasp-top10/` — cenários OWASP

3. **Rodar scanners**
   ```bash
   ./scripts/run-security-scan.sh all
   ```

4. **Gerar relatório**
   ```bash
   ./scripts/generate-report.sh
   ```

## Ferramentas

| Ferramenta | Uso |
|------------|-----|
| **OWASP ZAP** | Scan de aplicação web (automático e manual) |
| **Nuclei** | Templates de vulnerabilidades conhecidas |
| **Dependency-Check** | Análise de dependências (CVEs) |
| **Secrets Scan** | Detecção de secrets em código |

## Referências

- [OWASP Top 10](https://owasp.org/Top10/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Project Nuclei](https://github.com/projectdiscovery/nuclei)
- [OWASP Dependency-Check](https://owasp.org/www-project-dependency-check/)
