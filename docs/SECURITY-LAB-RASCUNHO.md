# Security Lab – Rascunho Completo

> **Security Lab** – Python | Bug Bounty | Pentest | Hacking  
> Ferramentas e conhecimentos equivalentes ao Kali Linux, zero → Jr independente.

---

## 1. Visão geral

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAB (Python-first)                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   RECON              WEB APPS             EXPLOITATION        PASSWORD             │
│   ┌─────────┐       ┌─────────┐           ┌─────────┐        ┌─────────┐            │
│   │subfinder│       │  ffuf   │           │Metasploit│       │  Hydra  │            │
│   │ amass   │       │ nuclei  │           │sqlmap   │        │  John   │            │
│   │  httpx  │       │   ZAP   │           │impacket │        │hashcat  │            │
│   │  nmap   │       │ Burp    │           │pwntools │        │         │            │
│   └────┬────┘       └────┬────┘           └────┬────┘        └────┬────┘            │
│        │                  │                    │                  │                 │
│        └──────────────────┴────────────────────┴──────────────────┘                 │
│                                    │                                                 │
│                                    ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  PYTHON GLUE: requests, pwntools, impacket, scripts custom, automação        │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                                 │
│                                    ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │  TARGETS: DVWA, Juice Shop, WebGoat, PortSwigger (Docker)                    │   │
│   └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack equivalente ao Kali (por categoria)

### 2.1 Reconnaissance (Mapeamento)

| Ferramenta | Linguagem | Uso | Instalação |
|------------|-----------|-----|------------|
| **subfinder** | Go | Subdomain enumeration | `go install` / release |
| **amass** | Go | Attack surface mapping (OWASP) | `go install` / apt |
| **httpx** | Go | HTTP probing, tech detection | `go install` / release |
| **nmap** | C | Port scan, service detect | apt / brew |
| **theHarvester** | Python | OSINT, emails, subdomains | pip / apt |
| **sublist3r** | Python | Subdomains via APIs | pip / git |
| **dnsx** | Go | DNS toolkit | ProjectDiscovery |
| **waybackurls** | Go | Historical URLs | gau / waybackurls |
| **gau** | Go | Get All URLs | ProjectDiscovery |

*Python scripts:* wrappers, parsing de saída, automação de fluxo.

---

### 2.2 Web Application (Bug Bounty core)

| Ferramenta | Linguagem | Uso | Instalação |
|------------|-----------|-----|------------|
| **ffuf** | Go | Web fuzzer (dirs, params, vhost) | release / apt |
| **feroxbuster** | Rust | Dir/file brute force | release / brew |
| **nuclei** | Go | Vulnerability scanner (YAML templates) | release / apt |
| **OWASP ZAP** | Java | DAST, proxy, scan | apt / docker |
| **Burp Suite** | Java | Proxy, manual testing | manual |
| **sqlmap** | Python | SQL injection automation | pip / apt |
| **nikto** | Perl | Web server scanner | apt |
| **wfuzz** | Python | Web fuzzer | pip |
| **httpx** | Go | Probe, status, title, tech | release |

*Python scripts:* requests, BeautifulSoup, automação de testes, parsing de results.

---

### 2.3 Exploitation

| Ferramenta | Linguagem | Uso | Instalação |
|------------|-----------|-----|------------|
| **Metasploit** | Ruby | Exploit framework | apt |
| **sqlmap** | Python | SQLi | pip / apt |
| **impacket** | Python | Windows protocols, lateral move | pip |
| **pwntools** | Python | CTF, binary exploitation | pip |
| **searchsploit** | - | Exploit-DB search | apt |
| **crackmapexec** | Python | Network pentest, creds | pip |

*Python scripts:* exploits custom, chain de exploits.

---

### 2.4 Password Attacks

| Ferramenta | Linguagem | Uso | Instalação |
|------------|-----------|-----|------------|
| **Hydra** | C | Network login brute force | apt |
| **John the Ripper** | C | Password cracking | apt |
| **hashcat** | C | GPU cracking | apt |
| **cewl** | Ruby | Custom wordlist from site | apt |
| **crunch** | C | Wordlist generator | apt |

*Python scripts:* parsing de hashes, custom wordlists, integração.

---

### 2.5 Network / Sniffing

| Ferramenta | Linguagem | Uso | Instalação |
|------------|-----------|-----|------------|
| **Wireshark** | C | Packet analysis | apt |
| **nmap** | C | Network discovery | apt |
| **tcpdump** | C | Packet capture CLI | apt |
| **bettercap** | Go | MitM, sniffing, spoofing | apt |
| **mitmproxy** | Python | HTTP(S) proxy, intercept | pip |

*Python scripts:* Scapy (packets), mitmproxy scripts.

---

### 2.6 Defensive / Blue Team

| Ferramenta | Linguagem | Uso | Instalação |
|------------|-----------|-----|------------|
| **lynis** | Shell | System audit | apt |
| **chkrootkit** | C | Rootkit detection | apt |
| **rkhunter** | Shell | Rootkit hunter | apt |
| **fail2ban** | Python | Brute force defense | apt |
| **clamav** | C | Antivirus | apt |

---

### 2.7 Mobile (opcional, fase posterior)

| Ferramenta | Uso |
|------------|-----|
| **apktool** | Decompile APK |
| **jadx** | Java decompiler |
| **frida** | Dynamic instrumentation |
| **objection** | Mobile pentest runtime |

---

## 3. Bibliotecas Python essenciais

| Biblioteca | Uso no Lab |
|------------|------------|
| **requests** | HTTP, APIs, automação web |
| **BeautifulSoup / lxml** | Parse HTML, extrair dados |
| **pwntools** | Exploit dev, CTF |
| **impacket** | SMB, Kerberos, Windows |
| **scapy** | Packets, network |
| **paramiko** | SSH automation |
| **cryptography** | Crypto, hashes |
| **mitmproxy** | Proxy scripts |
| **selenium / playwright** | Browser automation, auth flows |
| **colorama** | Output colorido em CLI |
| **rich** | Tabelas, progress, CLI bonito |
| **click / argparse** | CLIs dos scripts |
| **pyyaml** | Parse configs, Nuclei templates |

---

## 4. Estrutura de pastas do Security Lab

```
security-lab/                          ← repo separado
│
├── docs/                              # Aprendizado
│   ├── 00-ROADMAP.md                  # Zero → Jr, progress tracker
│   ├── 01-FUNDAMENTOS.md              # HTTP, rede, ferramentas
│   ├── 02-OWASP-TOP-10.md             # Guia por vulnerabilidade
│   ├── 03-BUG-BOUNTY-READY.md         # Report, scope, ética
│   ├── CHEATSHEETS/
│   │   ├── sqli.md
│   │   ├── xss.md
│   │   ├── idor.md
│   │   └── recon.md
│   └── TOOLS-REFERENCE.md             # Este mapeamento Kali → Lab
│
├── tools/                             # Wrappers e scripts Python
│   ├── recon/
│   │   ├── subdomain_enum.py          # Chama subfinder/amass, parse
│   │   ├── tech_detect.py             # httpx, whatweb
│   │   └── wayback_collect.py         # URLs históricas
│   ├── web/
│   │   ├── fuzz_params.py             # Wrapper ffuf ou custom
│   │   ├── nuclei_scan.py             # Nuclei com templates
│   │   └── sqlmap_wrapper.py          # sqlmap automation
│   ├── exploitation/
│   │   └── (scripts custom conforme avança)
│   └── utils/
│       ├── report_generator.py        # Gera report em markdown/HTML
│       └── config_loader.py           # YAML/JSON config
│
├── scripts/                           # Bash/shell (recon, setup)
│   ├── recon_full.sh                 # Pipeline recon completo
│   ├── web_scan.sh                   # nuclei + nikto + custom
│   └── setup_tools.sh                # Instala ferramentas (brew, pip, etc.)
│
├── targets/                           # Apps vulneráveis (Docker)
│   ├── docker-compose.yml            # DVWA, Juice Shop, WebGoat
│   ├── README.md                     # Como usar cada target
│   └── configs/
│       ├── dvwa.env
│       └── juice-shop.env
│
├── exercises/                         # Exercícios guiados
│   ├── 01-first-sqli/
│   │   ├── README.md                 # Objetivo, hint, solução
│   │   └── solution.py               # (opcional) script solução
│   ├── 02-first-xss/
│   ├── 03-first-idor/
│   └── ...
│
├── challenges/                        # Desafios (menos guiado)
│   ├── challenge-01.md
│   └── ...
│
├── reports/                           # Templates
│   ├── template.md
│   └── examples/                     # Reports anonimizados
│
├── requirements.txt                   # Python deps
├── pyproject.toml                    # (opcional) projeto moderno
├── Makefile                          # make recon, make scan, make targets
├── README.md
└── .github/workflows/                # (opcional) CI para scans
    └── security-scan.yml
```

---

## 5. Script de setup (ferramentas)

O `scripts/setup_tools.sh` instala o necessário para rodar no macOS (ou Linux):

```bash
# Core (bug bounty + pentest)
# - ProjectDiscovery: subfinder, amass, httpx, nuclei, naabu, dnsx
# - Fuzzing: ffuf, feroxbuster
# - Python: requests, pwntools, impacket
# - Web: OWASP ZAP (Docker), sqlmap (pip)
# - Network: nmap (brew)
# - Password: hydra (brew)
```

*Alternativa:* Dockerfile com tudo pré-instalado (estilo Kali container).

---

## 6. Pipeline de execução típica

```
                    make recon          (ou python -m tools.recon)
                            │
                            ▼
                    subfinder → amass → httpx → nuclei (discovery)
                            │
                            ▼
                    make web-scan        (ou python -m tools.web)
                            │
                            ▼
                    ffuf (dirs) → nuclei (vulns) → sqlmap (se encontrar injection)
                            │
                            ▼
                    reports/             (template, evidência, severidade)
```

---

## 7. Decisões pendentes

| Decisão | Opções | Sugestão |
|---------|--------|----------|
| Onde fica | Repo separado / pasta qa-lab | Repo separado |
| Ambiente | macOS nativo / Docker (Kali-like) / ambos | macOS + Docker para targets |
| Ferramentas Go | Instalar local / Docker | Instalar local (releases oficiais) |
| Nível de automação | Mínimo (manual) / alto (scripts orquestram tudo) | Meio: scripts Python orquestram ferramentas externas |

---

## 8. Timeline sugerida (após QA Extended Lab)

```
Fase 0 - Setup
├── Criar repo security-lab
├── Estrutura de pastas
├── requirements.txt, setup_tools.sh
└── docs/00-ROADMAP.md, 01-FUNDAMENTOS.md

Fase 1 - Recon
├── Instalar subfinder, amass, httpx
├── tools/recon/subdomain_enum.py
├── scripts/recon_full.sh
└── Exercício: mapear um domínio público

Fase 2 - Web (bug bounty core)
├── Instalar ffuf, nuclei, sqlmap
├── targets/ com DVWA + Juice Shop
├── exercises/ 01-sqli, 02-xss, 03-idor
└── tools/web/ wrappers

Fase 3 - Exploitation + Reports
├── impacket, pwntools (básico)
├── reports/template.md
├── challenges/
└── docs/03-BUG-BOUNTY-READY.md

Fase 4 - Polish
├── Makefile, README completo
├── Progress tracker no ROADMAP
└── Link no QA Lab e portfolio
```

---

## 9. Resumo em uma frase

> **Um lab em Python com ferramentas e conhecimentos equivalentes ao Kali (recon, web, exploitation, password), targets vulneráveis em Docker, roadmap zero→Jr, preparado para bug bounty, pentest e hacking.**

---

## 10. Referência rápida: Kali category → Security Lab

| Kali (en.kali.tools) | Security Lab equivalente |
|----------------------|-------------------------|
| recon | subfinder, amass, theHarvester, httpx, dnsx |
| webapp, scanner | ffuf, nuclei, nikto, ZAP, sqlmap |
| fuzzer | ffuf, wfuzz, feroxbuster |
| exploitation | Metasploit, impacket, pwntools, sqlmap |
| cracker | Hydra, John, hashcat |
| sniffer | Wireshark, mitmproxy, tcpdump |
| wireless | aircrack-ng (se necessário, fase posterior) |
| defensive | lynis, fail2ban (conceitos, não foco inicial) |

---

*Rascunho pronto para planejar. Próximo passo: criar o repo e a Fase 0.*
