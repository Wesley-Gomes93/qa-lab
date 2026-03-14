#!/usr/bin/env bash
# Generate unified security report from scan outputs
# Usage: ./scripts/generate-report.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/reports"
SUMMARY_DIR="$REPORTS_DIR/summary"
OUTPUT_FILE="$SUMMARY_DIR/security-report-$(date +%Y%m%d-%H%M%S).md"

mkdir -p "$SUMMARY_DIR"

echo "# Security Lab — Scan Report" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**Generated:** $(date '+%Y-%m-%dT%H:%M:%S%z')" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "---" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# ZAP summary (nullglob evita erro quando não há arquivos)
shopt -s nullglob 2>/dev/null || true
if [ -d "$REPORTS_DIR/zap" ]; then
  echo "## OWASP ZAP" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  for f in "$REPORTS_DIR/zap"/*.json "$REPORTS_DIR/zap"/*.html; do
    [ -f "$f" ] && echo "- \`$(basename "$f")\`" >> "$OUTPUT_FILE"
  done
  echo "" >> "$OUTPUT_FILE"
fi

# Nuclei summary
if [ -d "$REPORTS_DIR/nuclei" ]; then
  echo "## Nuclei" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  for f in "$REPORTS_DIR/nuclei"/*.json "$REPORTS_DIR/nuclei"/*.txt; do
    [ -f "$f" ] && echo "- \`$(basename "$f")\`" >> "$OUTPUT_FILE"
  done
  echo "" >> "$OUTPUT_FILE"
fi

# Dependency-Check
if [ -f "$SUMMARY_DIR/deps.txt" ]; then
  echo "## Dependency-Check" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  cat "$SUMMARY_DIR/deps.txt" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

# Secrets
if [ -f "$SUMMARY_DIR/secrets.txt" ]; then
  echo "## Secrets Scan" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  cat "$SUMMARY_DIR/secrets.txt" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

echo "[+] Report saved: $OUTPUT_FILE"
cat "$OUTPUT_FILE"
