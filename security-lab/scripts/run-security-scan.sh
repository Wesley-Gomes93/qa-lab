#!/usr/bin/env bash
# Run security scans (ZAP, Nuclei, dependency-check, secrets)
# Usage: ./scripts/run-security-scan.sh [zap|nuclei|deps|secrets|all]

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/reports"

cd "$ROOT_DIR"

run_zap() {
  echo "[*] Running OWASP ZAP scan..."
  # TODO: Add ZAP Docker/CLI command
  mkdir -p "$REPORTS_DIR/zap"
  echo "ZAP scan placeholder - configure scanners/zap/" > "$REPORTS_DIR/zap/last-scan.txt"
  echo "[+] ZAP done"
}

run_nuclei() {
  echo "[*] Running Nuclei scan..."
  # TODO: Add Nuclei command
  mkdir -p "$REPORTS_DIR/nuclei"
  echo "Nuclei scan placeholder - configure scanners/nuclei/" > "$REPORTS_DIR/nuclei/last-scan.txt"
  echo "[+] Nuclei done"
}

run_dependency_check() {
  echo "[*] Running OWASP Dependency-Check..."
  # TODO: Add dependency-check command
  mkdir -p "$REPORTS_DIR/summary"
  echo "Dependency-check placeholder - configure scanners/dependency-check/" >> "$REPORTS_DIR/summary/deps.txt"
  echo "[+] Dependency-Check done"
}

run_secrets_scan() {
  echo "[*] Running secrets scan..."
  # TODO: Add gitleaks/trufflehog command
  mkdir -p "$REPORTS_DIR/summary"
  echo "Secrets scan placeholder - configure scanners/secrets-scan/" >> "$REPORTS_DIR/summary/secrets.txt"
  echo "[+] Secrets scan done"
}

case "${1:-all}" in
  zap)     run_zap ;;
  nuclei)  run_nuclei ;;
  deps)    run_dependency_check ;;
  secrets) run_secrets_scan ;;
  all)
    run_zap
    run_nuclei
    run_dependency_check
    run_secrets_scan
    echo "[+] All scans complete"
    ;;
  *)
    echo "Usage: $0 [zap|nuclei|deps|secrets|all]"
    exit 1
    ;;
esac
