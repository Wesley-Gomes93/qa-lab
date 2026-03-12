#!/usr/bin/env node
/**
 * Runs axe-core accessibility tests against configured URLs.
 * Uses @axe-core/playwright (bundles Chromium via Playwright).
 * First run: npx playwright install chromium
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const urlsConfig = require('./urls.config.js');

const reportsDir = path.join(__dirname, '..', 'reports');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

/**
 * Guia de soluções em português para regras do axe-core.
 * Cada violação exibida terá descrição + solução + exemplo.
 */
const SOLUCOES_A11Y = {
  'image-alt': {
    descricao: 'Imagens precisam de texto alternativo para que leitores de tela possam descrever o conteúdo para usuários com deficiência visual.',
    solucao: 'Adicione o atributo <code>alt</code> em toda tag <code>&lt;img&gt;</code>. Para imagens decorativas, use <code>alt=""</code> ou <code>role="presentation"</code>.',
    exemplo: '<strong>Antes:</strong> <code>&lt;img src="foto.svg"&gt;</code><br><strong>Depois (informativa):</strong> <code>&lt;img src="foto.svg" alt="Descrição da imagem"&gt;</code><br><strong>Depois (decorativa):</strong> <code>&lt;img src="divisor.svg" alt="" role="presentation"&gt;</code>'
  },
  'role-img-alt': {
    descricao: 'Elementos com <code>role="img"</code> precisam de texto alternativo (aria-label ou aria-labelledby).',
    solucao: 'Adicione <code>aria-label="descrição"</code> ou <code>aria-labelledby="id-do-rotulo"</code>.',
    exemplo: '<code>&lt;div role="img" aria-label="Gráfico de vendas"&gt;...&lt;/div&gt;</code>'
  },
  'document-title': {
    descricao: 'O documento HTML deve ter um <code>&lt;title&gt;</code> que descreva o conteúdo da página.',
    solucao: 'Adicione um título único e descritivo dentro de <code>&lt;head&gt;</code>.',
    exemplo: '<code>&lt;title&gt;Nome do site – Página atual&lt;/title&gt;</code>'
  },
  'html-has-lang': {
    descricao: 'O elemento <code>&lt;html&gt;</code> deve ter o atributo <code>lang</code> para indicar o idioma.',
    solucao: 'Adicione <code>lang</code> no elemento html.',
    exemplo: '<code>&lt;html lang="pt-BR"&gt;</code>'
  },
  'html-lang-valid': {
    descricao: 'O valor do atributo <code>lang</code> deve ser válido (ex.: pt-BR, en, es).',
    solucao: 'Use códigos de idioma válidos conforme BCP 47 (ex.: pt-BR, en-US).',
    exemplo: '<code>&lt;html lang="pt-BR"&gt;</code>'
  },
  'label': {
    descricao: 'Campos de formulário precisam estar associados a um rótulo (label) visível ou via aria-label.',
    solucao: 'Use <code>&lt;label for="id-do-campo"&gt;</code> ou <code>aria-label</code>.',
    exemplo: '<code>&lt;label for="email"&gt;E-mail&lt;/label&gt; &lt;input id="email" type="email"&gt;</code>'
  },
  'button-name': {
    descricao: 'Botões precisam de um nome acessível (texto visível ou aria-label) para leitores de tela.',
    solucao: 'Coloque texto dentro do botão ou use <code>aria-label</code>.',
    exemplo: '<code>&lt;button&gt;Enviar&lt;/button&gt;</code> ou <code>&lt;button aria-label="Fechar"&gt;&amp;times;&lt;/button&gt;</code>'
  },
  'input-button-name': {
    descricao: 'Botões do tipo <code>input</code> precisam de <code>value</code> ou <code>aria-label</code>.',
    solucao: 'Use o atributo <code>value</code> ou <code>aria-label</code> no input do tipo button/submit.',
    exemplo: '<code>&lt;input type="submit" value="Enviar"&gt;</code>'
  },
  'link-name': {
    descricao: 'Links devem ter um texto descritivo. Evite "clique aqui" ou links vazios.',
    solucao: 'O texto do link deve descrever o destino. Use <code>aria-label</code> se necessário.',
    exemplo: '<code>&lt;a href="/produtos"&gt;Ver produtos&lt;/a&gt;</code>'
  },
  'color-contrast': {
    descricao: 'O contraste entre texto e fundo deve ser suficiente (mín. 4.5:1 para texto normal, 3:1 para texto grande).',
    solucao: 'Ajuste as cores. Use ferramentas como WebAIM Contrast Checker. Evite cinza claro em branco.',
    exemplo: 'Texto #333 em fundo #fff. Ou texto branco em fundo escuro.'
  },
  'heading-order': {
    descricao: 'Os títulos (h1, h2, h3...) devem seguir ordem lógica, sem pular níveis.',
    solucao: 'Use h1 para o título principal, depois h2, h3... sem pular de h2 para h4.',
    exemplo: '<code>&lt;h1&gt;Título&lt;/h1&gt; &lt;h2&gt;Seção&lt;/h2&gt; &lt;h3&gt;Subseção&lt;/h3&gt;</code>'
  },
  'region': {
    descricao: 'O conteúdo da página deve estar dentro de landmarks (header, nav, main, footer).',
    solucao: 'Use elementos HTML5: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>.',
    exemplo: '<code>&lt;main&gt;...&lt;/main&gt;</code> para o conteúdo principal'
  },
  'list': {
    descricao: 'Listas devem usar <code>&lt;ul&gt;</code>/<code>&lt;ol&gt;</code> com <code>&lt;li&gt;</code>.',
    solucao: 'Envolva itens de lista nas tags apropriadas.',
    exemplo: '<code>&lt;ul&gt;&lt;li&gt;Item 1&lt;/li&gt;&lt;li&gt;Item 2&lt;/li&gt;&lt;/ul&gt;</code>'
  },
  'listitem': {
    descricao: 'Elementos <code>&lt;li&gt;</code> devem estar dentro de <code>&lt;ul&gt;</code> ou <code>&lt;ol&gt;</code>.',
    solucao: 'Sempre coloque <code>&lt;li&gt;</code> dentro de <code>&lt;ul&gt;</code> ou <code>&lt;ol&gt;</code>.',
    exemplo: '<code>&lt;ul&gt;&lt;li&gt;Item&lt;/li&gt;&lt;/ul&gt;</code>'
  },
  'frame-title': {
    descricao: 'Iframes e frames precisam de um título acessível para leitores de tela.',
    solucao: 'Adicione o atributo <code>title</code> no iframe com descrição do conteúdo.',
    exemplo: '<code>&lt;iframe src="..." title="Vídeo do YouTube"&gt;&lt;/iframe&gt;</code>'
  },
  'aria-hidden-body': {
    descricao: 'Não use <code>aria-hidden="true"</code> no <code>&lt;body&gt;</code> — esconderia todo o conteúdo.',
    solucao: 'Remova aria-hidden do body. Use em elementos específicos, não no documento inteiro.',
    exemplo: 'Nunca: <code>&lt;body aria-hidden="true"&gt;</code>'
  },
  'aria-required-attr': {
    descricao: 'Elementos com roles ARIA precisam ter todos os atributos obrigatórios para aquela role.',
    solucao: 'Consulte a especificação ARIA. Ex.: role="tablist" precisa de role="tab" nos filhos.',
    exemplo: 'role="combobox" exige aria-expanded e aria-controls'
  },
  'aria-valid-attr': {
    descricao: 'Atributos que começam com <code>aria-</code> devem ser nomes ARIA válidos.',
    solucao: 'Remova atributos ARIA inexistentes. Consulte a lista oficial de atributos ARIA.',
    exemplo: 'aria-xxx não existe. Use aria-label, aria-describedby, etc.'
  },
  'aria-valid-attr-value': {
    descricao: 'Os valores dos atributos ARIA devem ser válidos para aquele atributo.',
    solucao: 'Ex.: aria-expanded só aceita "true" ou "false"; aria-level deve ser número.',
    exemplo: '<code>aria-expanded="true"</code> (não "sim" ou "1")'
  },
  'bypass': {
    descricao: 'A página deve ter um mecanismo para pular a navegação e ir direto ao conteúdo (skip link).',
    solucao: 'Adicione um link "Pular para o conteúdo" no início, visível ao focar com Tab.',
    exemplo: '<code>&lt;a href="#main"&gt;Pular para o conteúdo&lt;/a&gt;</code> e <code>&lt;main id="main"&gt;</code>'
  },
  'empty-heading': {
    descricao: 'Títulos (h1, h2...) não devem estar vazios.',
    solucao: 'Adicione texto ao heading ou use CSS para ocultar visualmente mantendo o texto no DOM.',
    exemplo: '<code>&lt;h2&gt;Nome da seção&lt;/h2&gt;</code>'
  },
  'page-has-heading-one': {
    descricao: 'A página deve ter pelo menos um <code>&lt;h1&gt;</code> como título principal.',
    solucao: 'Adicione um h1 que descreva o conteúdo da página.',
    exemplo: '<code>&lt;h1&gt;Nome da Página&lt;/h1&gt;</code>'
  },
  'landmark-one-main': {
    descricao: 'O documento deve ter um landmark <code>main</code> para o conteúdo principal.',
    solucao: 'Use <code>&lt;main&gt;</code> envolvendo o conteúdo principal.',
    exemplo: '<code>&lt;main&gt;...conteúdo...&lt;/main&gt;</code>'
  },
  'tabindex': {
    descricao: 'Evite <code>tabindex</code> maior que 0 — quebra a ordem natural de foco.',
    solucao: 'Use tabindex="0" para tornar focável, ou tabindex="-1" para foco programático. Nunca tabindex="1" ou mais.',
    exemplo: '<code>tabindex="0"</code> ou <code>tabindex="-1"</code>'
  },
  'nested-interactive': {
    descricao: 'Não aninhe elementos interativos (botão dentro de link, link dentro de link).',
    solucao: 'Coloque apenas um elemento interativo. Use JavaScript para o comportamento desejado.',
    exemplo: 'Não: <code>&lt;a&gt;&lt;button&gt;...&lt;/button&gt;&lt;/a&gt;</code>'
  },
  'select-name': {
    descricao: 'Elementos <code>&lt;select&gt;</code> precisam de um rótulo acessível.',
    solucao: 'Use <code>&lt;label for="id"&gt;</code> ou <code>aria-label</code>.',
    exemplo: '<code>&lt;label for="pais"&gt;País&lt;/label&gt; &lt;select id="pais"&gt;...&lt;/select&gt;</code>'
  },
  'definition-list': {
    descricao: 'Listas de definição (<code>&lt;dl&gt;</code>) devem ter <code>&lt;dt&gt;</code> e <code>&lt;dd&gt;</code> corretos.',
    solucao: 'Use <code>&lt;dl&gt;&lt;dt&gt;termo&lt;/dt&gt;&lt;dd&gt;definição&lt;/dd&gt;&lt;/dl&gt;</code>.',
    exemplo: '<code>&lt;dl&gt;&lt;dt&gt;HTML&lt;/dt&gt;&lt;dd&gt;Linguagem de marcação&lt;/dd&gt;&lt;/dl&gt;</code>'
  },
  'link-in-text-block': {
    descricao: 'Links não devem ser identificados apenas pela cor — usuários com daltonismo podem não diferenciar.',
    solucao: 'Adicione sublinhado ou outro indicador visual além da cor.',
    exemplo: 'Link azul sublinhado, ou com ícone ao lado'
  },
  'image-redundant-alt': {
    descricao: 'O texto alternativo não deve repetir o texto que já aparece ao lado da imagem.',
    solucao: 'Use <code>alt=""</code> se a imagem for redundante com o texto adjacente.',
    exemplo: 'Se o texto diz "Foto do produto", não use alt="Foto do produto" — use alt=""'
  },
  'meta-viewport': {
    descricao: 'A meta viewport não deve desabilitar zoom (maximum-scale=1 pode prejudicar usuários).',
    solucao: 'Remova maximum-scale ou use user-scalable=yes. Permita que usuários deem zoom.',
    exemplo: '<code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code>'
  },
  'object-alt': {
    descricao: 'Elementos <code>&lt;object&gt;</code> precisam de texto alternativo.',
    solucao: 'Adicione texto dentro do object ou use role="img" com aria-label.',
    exemplo: '<code>&lt;object data="..." aria-label="Descrição"&gt;Descrição&lt;/object&gt;</code>'
  },
  'svg-img-alt': {
    descricao: 'SVGs usados como imagens precisam de texto alternativo.',
    solucao: 'Use <code>role="img"</code> e <code>aria-label</code>, ou <code>&lt;title&gt;</code> dentro do SVG.',
    exemplo: '<code>&lt;svg role="img" aria-label="Ícone"&gt;...&lt;/svg&gt;</code>'
  },
  'input-image-alt': {
    descricao: 'Inputs do tipo image precisam do atributo <code>alt</code>.',
    solucao: 'Adicione alt no input: <code>&lt;input type="image" alt="Enviar formulário"&gt;</code>.',
    exemplo: '<code>&lt;input type="image" src="send.png" alt="Enviar"&gt;</code>'
  },
  'area-alt': {
    descricao: 'Áreas de mapas de imagem (<code>&lt;area&gt;</code>) precisam de <code>alt</code>.',
    solucao: 'Adicione o atributo alt em cada <code>&lt;area&gt;</code>.',
    exemplo: '<code>&lt;area shape="rect" coords="..." href="..." alt="Descrição"&gt;</code>'
  },
  'aria-command-name': {
    descricao: 'Botões e links ARIA precisam de um nome acessível.',
    solucao: 'Use <code>aria-label</code> ou texto visível dentro do elemento.',
    exemplo: '<code>&lt;div role="button" aria-label="Fechar"&gt;X&lt;/div&gt;</code>'
  },
  'aria-input-field-name': {
    descricao: 'Campos de input com role ARIA precisam de nome acessível.',
    solucao: 'Associe um label ou use <code>aria-label</code>.',
    exemplo: '<code>&lt;div role="textbox" aria-label="Buscar"&gt;&lt;/div&gt;</code>'
  },
  'duplicate-id-aria': {
    descricao: 'IDs usados em ARIA (aria-labelledby, aria-describedby) devem ser únicos na página.',
    solucao: 'Garanta que cada id exista apenas uma vez. IDs devem ser únicos.',
    exemplo: 'Não use o mesmo id="x" em dois elementos diferentes'
  },
  'form-field-multiple-labels': {
    descricao: 'Um campo de formulário não deve ter múltiplos elementos label associados.',
    solucao: 'Use apenas um label por campo (ou aria-label).',
    exemplo: 'Um input com um único &lt;label for="id"&gt;'
  },
  'label-title-only': {
    descricao: 'Labels não devem usar apenas o atributo title — não é acessível para leitores de tela.',
    solucao: 'Use <code>&lt;label for="id"&gt;</code> visível ou <code>aria-label</code>.',
    exemplo: '<code>&lt;label for="email"&gt;E-mail&lt;/label&gt;</code>'
  },
  'meta-refresh': {
    descricao: 'Evite meta refresh para redirecionar — prejudica usuários com deficiências.',
    solucao: 'Use redirecionamento no servidor (301/302) ou JavaScript com aviso ao usuário.',
    exemplo: 'Não use: <code>&lt;meta http-equiv="refresh" content="5"&gt;</code>'
  },
  'valid-lang': {
    descricao: 'Atributos <code>lang</code> devem ter valores válidos (ex.: pt-BR, en).',
    solucao: 'Use códigos BCP 47. Ex.: lang="pt-BR", lang="en-US".',
    exemplo: '<code>&lt;span lang="pt-BR"&gt;Texto em português&lt;/span&gt;</code>'
  },
  'summary-name': {
    descricao: 'Elementos <code>&lt;summary&gt;</code> (em details) precisam de texto discernível.',
    solucao: 'O summary deve ter texto ou aria-label que descreva o conteúdo expansível.',
    exemplo: '<code>&lt;summary&gt;Clique para expandir&lt;/summary&gt;</code>'
  }
};

async function runA11y() {
  const results = [];
  let hasViolations = false;

  const browser = await chromium.launch({ headless: true });

  for (const url of urlsConfig.urls) {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const axeResults = await new AxeBuilder({ page }).analyze();
      const violations = axeResults.violations || [];
      results.push({ url, violations });
      if (violations.length > 0) hasViolations = true;
      console.log(`${url}: ${violations.length} violation(s)`);
    } catch (err) {
      console.error(`Error testing ${url}:`, err.message);
      results.push({ url, error: err.message, violations: [] });
    }
    await context.close();
  }

  await browser.close();

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const jsonPath = path.join(reportsDir, `a11y-results-${timestamp}.json`);
  const jsonLatestPath = path.join(reportsDir, 'a11y-results-latest.json');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');
  fs.writeFileSync(jsonLatestPath, JSON.stringify(results, null, 2), 'utf8');

  const html = generateHtmlReport(results);
  const htmlPath = path.join(reportsDir, `a11y-report-${timestamp}.html`);
  const htmlLatestPath = path.join(reportsDir, 'a11y-report-latest.html');
  fs.writeFileSync(htmlPath, html, 'utf8');
  fs.writeFileSync(htmlLatestPath, html, 'utf8');

  printSummary(results, reportsDir);
  process.exit(0);
}

function printSummary(results, reportsDir) {
  const totalUrls = results.length;
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const urlsWithIssues = results.filter(r => (r.violations?.length || 0) > 0).length;

  console.log('\n' + '─'.repeat(50));
  console.log('  RESUMO – Testes de Acessibilidade (axe-core)');
  console.log('─'.repeat(50));
  console.log(`  URLs analisadas:     ${totalUrls}`);
  console.log(`  URLs com problemas:  ${urlsWithIssues}`);
  console.log(`  Total de violações:  ${totalViolations}`);
  console.log('─'.repeat(50));
  console.log('\n  Relatórios:');
  console.log(`    HTML:  ${path.join(reportsDir, 'a11y-report-latest.html')}`);
  console.log(`    JSON:  ${path.join(reportsDir, 'a11y-results-latest.json')}`);
  console.log('\n  Para ver o relatório visual: open a11y-tests/reports/a11y-report-latest.html\n');
}

function generateHtmlReport(results) {
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const urlsWithIssues = results.filter(r => (r.violations?.length || 0) > 0).length;

  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Acessibilidade – axe-core</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #333; }
    .summary { background: #e8f4f8; padding: 1.25rem; margin: 1.5rem 0; border-radius: 8px; border-left: 4px solid #22d3ee; }
    .summary table { border-collapse: collapse; margin-top: 0.5rem; }
    .summary td { padding: 0.25rem 1rem 0.25rem 0; }
    .summary td:first-child { font-weight: 600; color: #555; }
    .url { background: #f5f5f5; padding: 1rem; margin: 1rem 0; border-radius: 8px; }
    .violation { margin: 0.5rem 0; padding: 0.75rem; background: #fff3cd; border-left: 4px solid #ffc107; }
    .violation.critical { background: #f8d7da; border-color: #dc3545; }
    .violation.serious { background: #ffeaa7; border-color: #e17055; }
    .violation-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .badge { font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; }
    .badge-critical { background: #dc3545; color: white; }
    .badge-serious { background: #e17055; color: white; }
    .badge-moderate { background: #ffc107; color: #333; }
    .violation-help { margin: 0.5rem 0; font-weight: 500; }
    .violation-desc { margin: 0.5rem 0; font-size: 0.95rem; color: #444; }
    .violation-fix { background: #e8f5e9; padding: 0.75rem; margin: 0.5rem 0; border-radius: 6px; font-size: 0.9rem; }
    .violation-exemplo { margin-top: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 4px; font-size: 0.85rem; line-height: 1.5; }
    .fix-note { font-size: 0.8rem; color: #666; }
    .violation-link { margin: 0.5rem 0; }
    .violation-link a { color: #0d6efd; }
    .violation-details { margin-top: 0.5rem; font-size: 0.9rem; }
    .violation-details summary { cursor: pointer; }
    .node-list { margin: 0.5rem 0; padding-left: 1.5rem; }
    .node-list code { font-size: 0.8rem; word-break: break-all; }
    .no-violations { color: #28a745; }
    .meta { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Relatório de Acessibilidade (axe-core)</h1>
  <p class="meta">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>

  <div class="summary">
    <strong>Resumo</strong>
    <table>
      <tr><td>URLs analisadas</td><td>${results.length}</td></tr>
      <tr><td>URLs com violações</td><td>${urlsWithIssues}</td></tr>
      <tr><td>Total de violações</td><td>${totalViolations}</td></tr>
    </table>
  </div>

  <h2>Resultados por URL</h2>
`;

  for (const r of results) {
    html += `  <div class="url"><h2>${escapeHtml(r.url)}</h2>`;
    if (r.error) {
      html += `<p class="error">Erro ao analisar: ${escapeHtml(r.error)}</p>`;
    } else if (!r.violations || r.violations.length === 0) {
      html += `<p class="no-violations">✓ Nenhuma violação encontrada nesta URL</p>`;
    } else {
      for (const v of r.violations) {
        const severity = (v.impact || 'moderate').toLowerCase();
        const guia = SOLUCOES_A11Y[v.id];
        const fixHtml = getSolucaoHtml(v, guia);
        const severidadePt = { critical: 'Crítico', serious: 'Sério', moderate: 'Moderado', minor: 'Menor' }[severity] || severity;
        html += `<div class="violation ${severity}">
          <div class="violation-header">
            <strong>${escapeHtml(v.id)}</strong>
            <span class="badge badge-${severity}">${severidadePt}</span>
          </div>
          <p class="violation-help">${escapeHtml(v.help)}</p>
          ${guia?.descricao ? `<p class="violation-desc"><strong>O que significa:</strong> ${guia.descricao}</p>` : (v.description ? `<p class="violation-desc"><strong>O que significa:</strong> ${escapeHtml(v.description)}</p>` : '')}
          ${fixHtml}
          ${(v.helpUrl) ? `<p class="violation-link"><a href="${escapeHtml(v.helpUrl)}" target="_blank" rel="noopener">📖 Documentação completa (Deque)</a></p>` : ''}
          <details class="violation-details">
            <summary>${(v.nodes || []).length} elemento(s) afetado(s) — clique para ver</summary>
            <ul class="node-list">${(v.nodes || []).slice(0, 8).map(n => `
              <li><code>${escapeHtml(String(n.html || (Array.isArray(n.target) ? n.target.join(' ') : n.target) || '').slice(0, 180))}</code></li>`).join('')}
            </ul>
            ${(v.nodes || []).length > 8 ? `<p class="node-more">+ ${(v.nodes || []).length - 8} outros</p>` : ''}
          </details>
        </div>`;
      }
    }
    html += `</div>`;
  }

  html += '</body></html>';
  return html;
}

function getSolucaoHtml(v, guia) {
  if (guia?.solucao || guia?.exemplo) {
    let html = '<div class="violation-fix">';
    html += `<p><strong>Como corrigir:</strong> ${guia.solucao || ''}</p>`;
    if (guia.exemplo) {
      html += `<div class="violation-exemplo"><strong>Exemplo:</strong><br>${guia.exemplo}</div>`;
    }
    html += '</div>';
    return html;
  }
  const fix = v.fix || v.remediation;
  let msg = '';
  if (fix) {
    if (fix.any && fix.any.length) msg = fix.any.map(f => f.message).join(' ');
    else if (fix.none && fix.none.length) msg = fix.none.map(f => f.message).join(' ');
    else if (typeof fix === 'string') msg = fix;
    else if (fix.message) msg = fix.message;
  }
  if (msg) {
    return `<div class="violation-fix"><strong>Como corrigir:</strong> ${escapeHtml(msg)} <span class="fix-note">(tradução técnica do axe)</span></div>`;
  }
  return `<div class="violation-fix"><strong>Como corrigir:</strong> Consulte a documentação completa da regra usando o link abaixo para ver a solução detalhada.</div>`;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

runA11y().catch((err) => {
  console.error(err);
  process.exit(1);
});
