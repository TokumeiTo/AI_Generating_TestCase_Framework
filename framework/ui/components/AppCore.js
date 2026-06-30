document.addEventListener("DOMContentLoaded", () => {
    const NODE_SERVER_PROXY = "http://localhost:3877";

    // Inside your main DOMContentLoaded wrapper script block:
    const handleGenerate = async (payload) => {
        try {
            // Extract out the active engine selected by the user dropdown view
            const targetEngine = payload.engine || "groq";

            const cleanPayload = {...payload, engine: targetEngine};

            const response = await fetch(`${NODE_SERVER_PROXY}/api/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Pass the base structure payload data directly upstream
                body: JSON.stringify(cleanPayload)
            });

            const resData = await response.json();

            if (resData.success && resData.data) {
                previewGridComponent.updateData(resData.data);
            } else {
                alert(resData.error || "Error mapping scenario processing block.");
            }
        } catch (err) {
            console.error("Pipeline failure:", err);
        }
    };

    const handleSave = (finalRows) => {
        console.log("Saving row states to memory ledger...", finalRows);
        alert("Row transformations saved seamlessly.");
    };

    const handleExport = async (finalRows) => {
        try {
            const response = await fetch(`${NODE_SERVER_PROXY}/api/export/excel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rows: finalRows }),
            });

            if (!response.ok) throw new Error("Network download response failed.")

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Business_Test_Scenarios.xlsx";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Failed parsing Excel document serialization stream.");
        }
    };

    // Instantiate Components cleanly across targets
    const controlPanelComponent = new ControlPanel("control-panel-target", handleGenerate);
    // At the top of your layout setup initialization:
    const previewGridComponent = new PreviewGrid('previewGridContainer'); // Ensure ID matches your index.html div!
});