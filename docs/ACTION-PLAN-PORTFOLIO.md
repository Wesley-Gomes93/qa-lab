# Action Plan – QA Lab Portfolio (Jr → Pleno)

**Objective:** Polish QA Lab for Brazil + International market, then build complementary project.

**Total estimated time:** ~2–3 weeks (phases 1–3) + ~1–2 weeks (phase 4)

---

## Phase 1: Documentation in English (Priority: MAX) ✅ DONE

**Goal:** All key docs in English for international visibility.

### 1.1 Docs translated

| # | Doc | Current | Effort | Notes |
|---|-----|---------|--------|-------|
| 1 | AGENT-TEST-WRITER.md | PT | 1–2h | High visibility – agent is a differentiator |
| 2 | API.md | PT? | 1h | API reference – recruiters may skim |
| 3 | TESTES-CYPRESS-VS-PLAYWRIGHT.md | PT | 1h | Strategy doc – important for interviews |
| 4 | CONTRACT-TESTING.md | PT/EN? | 30min | Check first |
| 5 | PIPELINE.md | PT/EN? | 30min | Check first |
| 6 | RELATORIOS.md | PT | 30min | Reports |
| 7 | CENARIOS-DASHBOARD.md | PT | 20min | Dashboard scenarios |
| 8 | COMO-ESCREVER-TESTES-CYPRESS-PLAYWRIGHT.md | PT | 45min | How to write tests |
| 9 | PASSO-A-PASSO-DO-ZERO-AO-PIPELINE.md | PT | 1h | Step-by-step guide |
| 10 | SOBRE-O-PROJETO.md | PT | 30min | About the project |
| 11 | LINT.md | PT | 20min | Lint config |
| 12 | TESTE-PERFORMANCE-TICTAC.md | PT/EN? | 30min | Check first |
| 13 | docs/README.md (index) | PT | 20min | Doc index |

**Already in English:** README.md (root), test-strategy.md

### 1.2 Deliverables

- [ ] All docs above translated to English
- [ ] Optionally: rename PT files (e.g. RODAR-TESTES.md → RUNNING-TESTS.md) for consistency
- [ ] docs/README.md updated with English links

**Phase 1 total:** ~8–10 hours

---

## Phase 2: Architecture Decisions + Polish (Priority: HIGH) ✅ DONE

**Goal:** Show Pleno-level thinking – documented decisions and reflections.

### 2.1 README additions

| Task | Description | Effort |
|------|--------------|--------|
| Add "Architecture Decisions" section | Why Cypress + Playwright, why agents, why contract testing | 1h |
| Ensure "What I Learned" is complete | Already exists – review and expand if needed | 30min |
| Add "Trade-offs" subsection | What you chose NOT to do and why | 30min |

### 2.2 Cross-links and cleanup

| Task | Description | Effort |
|------|--------------|--------|
| Update main README doc table | Point to English docs | 15min ✅ |
| Remove or archive obsolete docs | If any | 15min |

**Phase 2 total:** ~2–3 hours ✅

---

## Phase 3: Agent Improvements (Priority: HIGH) ✅ CORE DONE

**Goal:** Make the agent more robust and impressive.

### 3.1 Documentation (included in Phase 1)

- AGENT-TEST-WRITER.md in English ✅

### 3.2 Agent code improvements (suggested)

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 1 | Better error handling | User sees clear messages when API key missing or LLM fails | 1h ✅ |
| 2 | Support more suites in prompts | Ensure all suites (api, auth, admin, dashboard, ui, performance) are in system prompt | 30min ✅ |
| 3 | Example output in docs | Add "before/after" – prompt in, test out | 30min ✅ |
| 4 | Optional: add `--dry-run` | Show what would be generated without writing | 1h |

### 3.3 Agent polish (optional)

| # | Improvement | Impact | Effort |
|---|-------------|--------|--------|
| 5 | Validate generated test before running | If syntax error, don't run – show fix suggestion | 2h |
| 6 | Improve Failure Analyzer output | Clearer suggestions, link to relevant doc | 2h |

**Phase 3 total (core):** ~2–3 hours | **Phase 3 (optional):** +4h

---

## Phase 4: Complementary Project (Priority: AFTER 1–3)

**Goal:** Second project showing API testing or Accessibility depth.

### 4.1 Choose one

| Option | Project | Effort | Best for |
|--------|---------|--------|----------|
| **A** | API Testing (Newman + public API) | 1–2 weeks | API depth, international |
| **B** | Accessibility (axe-core + report) | 3–5 days | A11y demand, international |
| **C** | Mobile (Appium/Maestro) | 1–2 weeks | Mobile niche |

**Recommendation:** Option A (API) or B (A11y) – higher ROI for QA Pleno.

### 4.2 Complementary project checklist

- [ ] Separate repo or folder (e.g. `qa-api-lab`)
- [ ] README in English
- [ ] Clear scope: what it tests, why
- [ ] Link from QA Lab README: "See also: [API Testing Project](link)"

---

## Summary Timeline

| Phase | Focus | Est. time | When |
|-------|-------|-----------|------|
| **1** | All docs in English | 8–10h | Week 1 |
| **2** | Architecture decisions + polish | 2–3h | Week 1–2 |
| **3** | Agent improvements | 2–5h | Week 2 |
| **4** | Complementary project | 1–2 weeks | Week 3–4 |

---

## Priority Order (Your Question)

**Maximum priority:** 

1. **All docs in English** ← Phase 1
2. **README in English** ← Already done ✅
3. **Improve agent** ← Phase 3 (docs in Phase 1, code in Phase 3)

So: **Phase 1 first** (docs), then Phase 2 (decisions), then Phase 3 (agent). Phase 4 after.

---

## Quick Start

```bash
# Start with the most visible docs
# 1. Translate AGENT-TEST-WRITER.md
# 2. Translate TESTES-CYPRESS-VS-PLAYWRIGHT.md  
# 3. Translate API.md
# 4. Continue down the list
```
