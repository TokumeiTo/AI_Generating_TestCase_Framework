const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ExcelJS = require('exceljs');
const axios = require('axios');
const FormData = require('form-data');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT;
const ROOT = path.resolve(__dirname, '..');
const FASTAPI_BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

// HTTP Helpers
function send(res, status, content, contentType = 'text/plain') {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(content);
}
function json(res, obj, status = 200) {
  send(res, status, JSON.stringify(obj), 'application/json');
}
function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
  });
}
function openUi() {
  let url = `http://localhost:${PORT}/`;
  exec(process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);
}

const server = http.createServer(async (req, res) => {
  try {
    const reqPath = (req.url || '').split('?')[0];

    // 🟩 GET HANDLERS
    if (req.method === 'GET' && reqPath === '/') {
      return send(res, 200, fs.readFileSync(path.join(ROOT, 'ui', 'index.html')), 'text/html; charset=utf-8');
    }

    // Serve UI Static Assets Asset Pipeline
    if (req.method === 'GET' && (reqPath.startsWith('/ui/') || reqPath.endsWith('.js') || reqPath.endsWith('.css'))) {
      const safePath = path.join(ROOT, String(reqPath || '').replace(/^\/+/, ''));
      if (fs.existsSync(safePath) && !fs.statSync(safePath).isDirectory()) {
        let contentType = 'text/plain';
        if (safePath.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
        if (safePath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
        return send(res, 200, fs.readFileSync(safePath), contentType);
      }
    }

    // 🟩 POST HANDLERS
    // -------------------------------------------------------------------
    // 🌟 AI BACKEND GENERATION ROUTER
    // -------------------------------------------------------------------
    if (req.method === 'POST' && reqPath === '/api/ai/generate') {
      try {
        const rawBody = await readBody(req);
        const parsedBody = JSON.parse(rawBody || '{}');


        // Extract engine selection from UI payload (default to groq if not provided)
        let selectedEngine = (parsedBody.engine || "groq").toLowerCase();
        if (selectedEngine === 'none') selectedEngine = 'groq';

        // ✅ Pass it as a query parameter (?engine=sealion or ?engine=groq)
        const fastapiResponse = await fetch(`${FASTAPI_BACKEND_URL}/api/v1/ai/generate-testcase?engine=${selectedEngine}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_data: parsedBody.file_data || "",
            file_name: parsedBody.file_name || "document.xlsx",
            target_keyword: parsedBody.target_keyword || "",
            execution_notes: parsedBody.execution_notes || ""
          })
        });

        const responseText = await fastapiResponse.text();
        res.writeHead(fastapiResponse.status, { 'Content-Type': 'application/json' });
        return res.end(responseText);

      } catch (err) {
        console.error("❌ Node Engine Proxy Forwarding Exception:", err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: `Internal Proxy Error: ${err.message}` }));
      }
    }

    // -------------------------------------------------------------------
    // 🌟 EXCEL EXPORT DISPATCHER (For Dashboard Download Actions)
    // -------------------------------------------------------------------
    if (req.method === 'POST' && reqPath === '/api/export/excel') {
      const body = JSON.parse(await readBody(req) || '{}');
      const rows = Array.isArray(body.rows) ? body.rows : [];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('BusinessScenarios');

      worksheet.columns = [
        { header: 'No', key: 'No', width: 8 },
        { header: 'カテゴリ (Category)', key: 'Category', width: 20 },
        { header: 'テスト項目 (TextItem)', key: 'TextItem', width: 40 },
        { header: '前提条件 (Precondition)', key: 'Precondition', width: 30 },
        { header: '確認手順 (Steps)', key: 'Steps', width: 45 },
        { header: '入力データ (InputData)', key: 'InputData', width: 25 },
        { header: '期待される結果 (ExpectedResult)', key: 'ExpectedResult', width: 45 },
        { header: '優先度 (Priority)', key: 'Priority', width: 12 }
      ];

      rows.forEach(r => worksheet.addRow(r));

      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Business_Test_Scenarios.xlsx"'
      });

      await workbook.xlsx.write(res);
      return res.end();
    }

    if (req.method === 'POST' && reqPath === '/shutdown') {
      json(res, { ok: true });
      setTimeout(() => process.exit(0), 300);
      return;
    }

    return send(res, 404, 'Not found');
  } catch (e) {
    return json(res, { success: false, error: e.stack || e.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 QA Business Analyst Web Dashboard initialized at: http://localhost:${PORT}/`);
  openUi();
});