class ControlPanel {
  constructor(mountId, onGenerate) {
    this.mountPoint = document.getElementById(mountId);
    this.onGenerate = onGenerate;
    this.render();
    this.setupListeners();
  }

  render() {
    this.mountPoint.className = "card";
    this.mountPoint.innerHTML = `
      <style>
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .full-width { grid-column: span 2; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group label { font-weight: 600; color: #475569; font-size: 12px; }
        .input-ctrl { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; transition: border 0.2s; background: white; }
        .input-ctrl:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(30,58,138,0.1); }
        .btn-primary { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; max-width: 200px;}
        .btn-primary:hover { background: var(--primary-hover); }
        /* Added disabled styling */
        .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; opacity: 0.7; }
      </style>
      <div class="form-grid">
        <div class="field-group">
          <label><i class="fa-solid fa-key"></i> Target Keyword / 対象キーワード</label>
          <input type="text" id="targetKeyword" class="input-ctrl" placeholder="e.g., 非課税口座">
        </div>
        
        <div class="field-group">
          <label><i class="fa-solid fa-microchip"></i> AI Processing Engine / AIモデル選択</label>
          <select id="engineSelect" class="input-ctrl">
            <option value="groq" selected>Groq Cloud (Llama 3.3 - 70B)</option>
            <option value="sealion">SEA-LION Engine (Qwen v4.5 - 27B)</option>
          </select>
        </div>

        <div class="field-group full-width">
          <label><i class="fa-solid fa-comment-dots"></i> Execution Notes</label>
          <input type="text" id="executionNotes" class="input-ctrl" placeholder="Optional context...">
        </div>
        <div class="field-group full-width">
          <label><i class="fa-solid fa-file-excel"></i> Upload Design Specification Document (.xlsx)</label>
          <input type="file" id="specFile" class="input-ctrl" accept=".xlsx">
        </div>
      </div>
      <button id="btnGenerate" class="btn-primary"><i class="fa-solid fa-wand-magic-sparkles"></i> Generate Scenarios</button>
    `;
  }

  setupListeners() {
    const btnGenerate = this.mountPoint.querySelector('#btnGenerate');

    btnGenerate.addEventListener('click', () => {
      const fileInput = document.getElementById('specFile');
      const file = fileInput.files[0];

      if (!file) return alert("Please select a design specification file (.xlsx).");

      // 1. Immediately disable button and change UI to loading state
      btnGenerate.disabled = true;
      btnGenerate.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];

          const payload = {
            file_data: base64Data,
            file_name: file.name,
            target_keyword: document.getElementById('targetKeyword').value.trim(),
            execution_notes: document.getElementById('executionNotes').value.trim(),
            engine: document.getElementById('engineSelect').value
          };

          // 2. Await the generation process (assuming onGenerate returns a Promise)
          await this.onGenerate(payload);

        } catch (error) {
          console.error("Generation failed:", error);
          alert("An error occurred during test case generation.");
        } finally {
          // 3. Re-enable button and restore original state when done (or on error)
          btnGenerate.disabled = false;
          btnGenerate.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Scenarios`;
        }
      };

      reader.onerror = () => {
        alert("Failed to read file.");
        btnGenerate.disabled = false;
        btnGenerate.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Generate Scenarios`;
      };

      reader.readAsDataURL(file);
    });
  }
}