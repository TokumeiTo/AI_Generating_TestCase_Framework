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
    // Fallback assignment to ensure we have an array
    this.data = Array.isArray(rowData) ? rowData : [];
    this.render();
  }

  render() {
    if (!this.container) return;

    if (this.data.length === 0) {
      this.container.innerHTML = `
        <div class="p-5 text-center text-muted border rounded bg-light">
          No scenario records available. Upload a specification matrix and click generate.
        </div>`;
      return;
    }

    // Build standard corporate matrix table layout matching your schema keys
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

    // Map through each object item and safely inject rows
    this.data.forEach(row => {
      const priorityBadge = this.getPriorityBadge(row.Priority);
      
      // Clean up strings for HTML safety and convert newlines (\n) to visual line breaks (<br>)
      const formattedSteps = (row.Steps || "").replace(/\n/g, "<br>");
      
      html += `
        <tr>
          <td class="text-center fw-bold text-secondary">${row.No}</td>
          <td><span class="badge bg-secondary-subtle text-secondary border px-2 py-1">${row.Category || "未分類"}</span></td>
          <td class="fw-semibold text-dark">${row.TextItem || ""}</td>
          <td class="text-muted" style="font-size: 13px;">${row.Precondition || "-"}</td>
          <td style="font-size: 13px; line-height: 1.4;">${formattedSteps || "-"}</td>
          <td><code>${row.InputData || "-"}</code></td>
          <td class="text-success-emphasis" style="font-size: 13px;">${row.ExpectedResult || ""}</td>
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

// Export or attach to window scope based on your frontend modules design
window.PreviewGrid = PreviewGrid;