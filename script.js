function downloadFile() {
    const userId = document.getElementById('userId').value;
    const userEmail = document.getElementById('userEmail').value;
    const fileName = document.getElementById('fileName').value;

    if (!userId || !userEmail || !fileName) {
        document.getElementById('result').innerText = "Please fill in all fields.";
        return;
    }

    fetch('http://localhost:5000/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, fileName, userEmail })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = data.message;
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById('result').innerText = "Error in download request.";
    });
}

function suggestFileName() {
    let userInput = document.getElementById('fileName').value;
    let suggestionBox = document.getElementById('suggestion');

    // AI Feature: Suggest similar file names
    const commonFiles = ["report.pdf", "invoice.pdf", "data.csv", "summary.docx", "presentation.pptx"];
    let suggestion = commonFiles.find(file => file.includes(userInput.toLowerCase()));

    if (suggestion) {
        suggestionBox.innerText = `Did you mean: ${suggestion}?`;
    } else {
        suggestionBox.innerText = "";
    }
}