# OWASP Top 10 (2021)

Referência para mapeamento de testes de segurança no Security Lab.

| # | Vulnerabilidade | Descrição resumida |
|---|-----------------|-------------------|
| A01 | **Broken Access Control** | Falhas em controle de acesso, exposição de recursos |
| A02 | **Cryptographic Failures** | Dados sensíveis sem criptografia adequada |
| A03 | **Injection** | SQL, NoSQL, Command, LDAP, etc. |
| A04 | **Insecure Design** | Arquitetura e design inseguros |
| A05 | **Security Misconfiguration** | Configurações padrão, headers ausentes |
| A06 | **Vulnerable Components** | Dependências desatualizadas/vulneráveis |
| A07 | **Auth Failures** | Autenticação e gerenciamento de sessão fracos |
| A08 | **Data Integrity Failures** | CI/CD, atualizações inseguras |
| A09 | **Logging Failures** | Falta de logging/monitoramento |
| A10 | **SSRF** | Server-Side Request Forgery |

## Como testar no Security Lab

- **vulnerable-api** e **vulnerable-web**: aplicações intencionalmente vulneráveis para praticar
- **security-tests/owasp-top10/**: suítes de teste mapeadas por categoria
- **scanners/zap** e **scanners/nuclei**: automação com templates OWASP
