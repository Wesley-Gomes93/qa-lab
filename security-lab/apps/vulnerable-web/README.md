# Vulnerable Web

Intentionally vulnerable web app for security testing practice. Part of [QA Security Lab](../README.md).

**⚠️ Do NOT deploy to production.**

## Run

```bash
npm install
npm run dev
```

App runs on `http://localhost:3001`

## Vulnerabilities (intentional)

| Vulnerability | Endpoint | How to test |
|---------------|----------|-------------|
| **Reflected XSS** | `GET /search?q=` | Try `?q=<script>alert(1)</script>` |
| **Stored XSS** | `POST /comment`, `GET /comments` | Submit comment with `<img src=x onerror=alert(1)>` |
| **DOM-based XSS** | `/dom-xss.html#` | Try `#<img src=x onerror=alert(1)>` |
| **Open Redirect** | `GET /redirect?url=` | Try `?url=https://evil.com` |
| **Information Disclosure** | `GET /debug` | Exposes env vars and fake admin password |
| **Information Disclosure** | HTML comment | View source of `index.html` |
| **Path Traversal** | `GET /file?name=` | Try `?name=../../../etc/passwd` (Linux/Mac) |
| **Missing CSRF token** | `POST /comment` | Form has no CSRF token |

## OWASP Top 10 mapping

- **A03:2021 – Injection** (XSS)
- **A04:2021 – Insecure Design** (Open Redirect)
- **A05:2021 – Security Misconfiguration** (Debug endpoint)
- **A07:2021 – Identification and Authentication Failures** (Info disclosure)
