class PreviewGrid {
  constructor(mountPointId) {
    this.container = document.getElementById(mountPointId);
    this.data = [];
  }

  /**
   * Called by AppCore.js when fetch yields resData.data
   * @param {Array} rowData 
   */
  updateData(rowData) {
    console.log("📊 PreviewGrid updating with items:", rowData);
    this.data = Array.isArray(rowData) ? rowData : [];
    this.render();
  }

  // Helper utility to convert tracking flags into styled, elegant inline UI pills
  formatProvenanceText(text) {
    if (!text) return "-";
    // Replace [Doc] and [AI Inferred] markers with Bootstrap layout components
    return text
      .replace(/\n/g, "<br>")
      .replace(/\[Doc\]/g, `<span class="badge bg-success-subtle text-success border border-success-subtle me-1" style="font-size: 10px; padding: 2px 4px;">Doc</span>`)
      .replace(/\[AI Inferred\]/g, `<span class="badge bg-purple-subtle text-purple border border-purple-subtle me-1" style="font-size: 10px; padding: 2px 4px; color: #6b21a8; background-color: #f3e8ff; border-color: #d8b4fe;">AI Inferred</span>`);
  }

  render() {
    if (!this.container) return;

    if (this.data.length === 0) {
      this.container.innerHTML = `
        <div class="p-5 text-center text-muted border rounded bg-light">
          No scenario records available. Upload a specification document (.xlsx or .docx) and click generate.
        </div>`;
      return;
    }

    let html = `
      <div class="table-responsive border rounded bg-white shadow-sm">
        <table class="table table-hover table-striped mb-0 text-start align-middle" style="font-size: 14px;">
          <thead class="table-dark text-nowrap">
            <tr>
              <th scope="col" class="text-center" style="width: 50px;">No</th>
              <th scope="col" style="width: 140px;">Category</th>
              <th scope="col" style="width: 260px;">Test Item / テスト項目</th>
              <th scope="col" style="width: 220px;">Precondition</th>
              <th scope="col" style="width: 240px;">Execution Steps</th>
              <th scope="col" style="width: 160px;">Input Data</th>
              <th scope="col" style="width: 220px;">Expected Result</th>
              <th scope="col" class="text-center" style="width: 90px;">Priority</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.data.forEach(row => {
      const priorityBadge = this.getPriorityBadge(row.Priority);
      
      // Pass content blocks through the text formatter to convert markers and handle line breaks
      const formattedPrecondition = this.formatProvenanceText(row.Precondition);
      const formattedSteps = this.formatProvenanceText(row.Steps);
      const formattedInputData = this.formatProvenanceText(row.InputData);
      const formattedExpected = this.formatProvenanceText(row.ExpectedResult);
      
      html += `
        <tr>
          <td class="text-center fw-bold text-secondary">${row.No}</td>
          <td><span class="badge bg-secondary-subtle text-secondary border px-2 py-1">${row.Category || "未分類"}</span></td>
          <td class="fw-semibold text-dark">${row.TextItem || ""}</td>
          <td class="text-muted" style="font-size: 13px;">${formattedPrecondition}</td>
          <td style="font-size: 13px; line-height: 1.4;">${formattedSteps}</td>
          <td><code>${formattedInputData}</code></td>
          <td class="text-dark" style="font-size: 13px; line-height: 1.4;">${formattedExpected}</td>
          <td class="text-center">${priorityBadge}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    this.container.innerHTML = html;
  }

  getPriorityBadge(priority) {
    const p = String(priority).toLowerCase();
    if (p === 'high') return '<span class="badge bg-danger px-2 py-1">High</span>';
    if (p === 'medium') return '<span class="badge bg-warning text-dark px-2 py-1">Medium</span>';
    return '<span class="badge bg-info text-dark px-2 py-1">Low</span>';
  }
}

window.PreviewGrid = PreviewGrid;