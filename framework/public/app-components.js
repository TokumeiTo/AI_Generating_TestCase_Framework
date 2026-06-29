export const AppState = {
  folders: [],
  previewStatus: 'Generated',
  
  setState(updates) {
    Object.assign(this, updates);
    this.render();
  },

  init() {
    this.interceptLegacyFunctions();
    this.loadInitialFolders();
  },

  async loadInitialFolders() {
    try {
      const r = await fetch('/template-folders');
      const data = await r.json();
      this.setState({ folders: data.folders || [] });
    } catch (e) {
      console.error("Failed loading backend template folders", e);
    }
  },

  interceptLegacyFunctions() {
    // Save a copy of his original function so we can fallback to it
    const originalGenerate = window.generateTemplates;

    // Overwrite the global function dynamically at runtime!
    window.generateTemplates = async () => {
      const variablesInput = document.getElementById('variablesInput');
      const log = document.getElementById('log');
      const statusText = document.getElementById('statusText');
      const previewPanel = document.getElementById('previewPanel');
      const previewStatus = document.getElementById('previewStatus');
      const reportFrame = document.getElementById('reportFrame');
      const templateFolder = document.getElementById('templateFolder');

      const inputText = variablesInput.value.trim();
      const isAIPrompt = inputText.length > 0 && !inputText.includes('=') && !inputText.startsWith('#');

      if (isAIPrompt) {
        statusText.textContent = 'Generating';
        log.textContent = 'Generating updated templates...\n✨ Natural language prompt identified. Routing request to FastAPI AI Service...\n';
        reportFrame.src = 'about:blank';

        try {
          const r = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenario_text: inputText })
          });
          const aiData = await r.json();

          if (!aiData.success || !aiData.data) throw new Error(aiData.message || 'FastAPI AI Engine generation failure.');

          window.generatedId = 'AI_GEN_' + Date.now().toString().slice(-6);
          window.currentFolder = templateFolder.value || 'AI_Workspace';
          window.latestResultRoot = '';
          window.activeIndex = 0;

          window.previewData = [{
            templateName: "AI_Generated_Flow",
            rows: aiData.data
          }];

          log.textContent += '🟩 AI Generation Success! Displaying results in editable grid.\n';
          statusText.textContent = 'Generated via AI';
          previewPanel.classList.remove('hidden');
          previewStatus.textContent = 'Generated ID: ' + window.generatedId;

          window.renderTabs();
          window.renderPreview();
          return; // Stop here! Don't let his code run.
        } catch (err) {
          log.textContent += '🟥 AI Engine Redirection Error: ' + err.message + '\n';
          statusText.textContent = 'AI Generate Failed';
          return;
        }
      }

      // If it's NOT an AI prompt, pass control right back to his original function completely safely!
      originalGenerate();
    };
  },

  render() {
    const selectEl = document.getElementById('templateFolder');
    if (!selectEl) return;

    // Keep his selected value from wiping out when rendering options
    const currentValue = selectEl.value;
    selectEl.innerHTML = this.folders.map(f => 
      `<option value="${f}" ${f === currentValue ? 'selected' : ''}>${f}</option>`
    ).join('');
  }
};