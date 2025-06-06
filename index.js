// Add this at the very top of your script, before anything else
const style = document.createElement('style');
style.innerHTML = `
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400&display=swap');
body {
    font-family: 'Roboto', Arial, sans-serif;
    background: #f7f7f9;
    margin: 0;
    padding: 0;
}
form#letterheadForm {
    background: #fff;
    max-width: 400px;
    margin: 40px auto 20px auto;
    padding: 24px 32px 16px 32px;
    border-radius: 10px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    font-weight: 300;
}
form#letterheadForm label {
    display: block;
    margin-bottom: 14px;
    color: #222;
    font-size: 15px;
    font-weight: 300;
}
form#letterheadForm input[type="text"],
form#letterheadForm input[type="date"],
form#letterheadForm input[type="file"] {
    width: 100%;
    padding: 7px 10px;
    margin-top: 4px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 300;
    background: #fafbfc;
    box-sizing: border-box;
}
button {
    display: block;
    margin: 20px auto 0 auto;
    padding: 10px 28px;
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-family: inherit;
    font-weight: 400;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(25,118,210,0.08);
    transition: background 0.2s;
}
button:hover {
    background: #125ea8;
}
`;
document.head.appendChild(style);


document.addEventListener("DOMContentLoaded", () => {
    // Function to generate a random 8-digit hexadecimal string
    function random8Hex() {
        let hex = '';
        for (let i = 0; i < 8; i++) {
            hex += Math.floor(Math.random() * 16).toString(16);
        }
        return hex.toUpperCase();
    }

    // Create a form for custom details and image uploads
    const form = document.createElement("form");
    form.id = "letterheadForm";
    form.innerHTML = `
    <label>Company Name: <input type="text" id="companyName" placeholder="Enter Company Name"></label><br>    
    <label>Manager Name: <input type="text" id="managerName" required></label><br>
    <label>From Date: <input type="date" id="date_1" value="20XX-XX-XX" required></label><br>
    <label>To Date: <input type="date" id="date_2" value="20XX-XX-XX" required></label><br>
        <label>Bank Name: <input type="text" id="bank_name" value="Bank Name" required></label><br>
        <label>Account Number: <input type="text" id="account_number" required></label><br>
        <label>Employee Name: <input type="text" id="employeeName" required></label><br>
        <label>Employee ID: <input type="text" id="employeeId" required></label><br>
        <label>Company Logo: <input type="file" id="companyStamp" accept="image/*"></label><br>
       
    `;
    document.body.insertBefore(form, document.body.firstChild);

    // Function to generate the PDF
    function generateLetterhead() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Get form values
        const managerName = document.getElementById("managerName").value;
       
        const account_number = document.getElementById("account_number").value;

        if (!account_number) {
            alert("Please enter an account number.");
            return;
        }
        const companyName = document.getElementById("companyName").value || "Company Name";
        
        const employeeName = document.getElementById("employeeName").value;
        const employeeId = document.getElementById("employeeId").value;
        const companyStampInput = document.getElementById("companyStamp");
        
        const date_1 = document.getElementById("date_1").value;
        const date_2 = document.getElementById("date_2").value;
        const bank_name = document.getElementById("bank_name").value;

        // Add letterhead
        doc.setFontSize(16);
        const pageWidth = doc.internal.pageSize.getWidth();
        const textWidth = doc.getTextWidth(companyName);
        const x = (pageWidth - textWidth) / 2;
        doc.text(`${companyName}`, x, 20);
        doc.text("_______________________________________________________________", 10, 40);
        doc.setFontSize(12);
        doc.text("Address Line 1", 10, 30);
        doc.text("Address Line 2", 10, 40);
        

        // Add custom details
        doc.setFontSize(12);
        doc.text(`Manager:  ${managerName}`, 10, 70);
        doc.text(`Employee: ${employeeName}`, 10, 80);
        doc.text(`Employee ID: ${employeeId}`, 10, 90);

        // Add a description
        doc.setFontSize(12);
        const description =
            `Dear Sir/Madam,\n\n` +
            `I, ${managerName} holding account number ${account_number} in ${bank_name}, hereby allow ${employeeName} to act on my behalf for the purpose of managing my account, performing transactions,\n` +
            `and handling any issues related to my account. This Authorization will be valid from ${date_1} to ${date_2}.\n\n` +
            `${employeeName} bearing ID number ${employeeId} is hereby granted the following privileges for my account:\n` +
            `1. Withdrawal and deposit of funds.\n` +
            `2. Check issuance and clearance.\n` +
            `3. Requesting account statement and balance inquiry.\n` +
            `4. Demand Draft can be requested.\n\n` +
            `Kindly provide ${employeeName} with access to all necessary account information and grant permission to perform the above mentioned transactions during the specified period. Any transactions and requests made by ${employeeName} within the scope of this authorization should be treated as legitimate and processed accordingly.\n\n` +
            `Thank you for your cooperation and understanding.`;
        const descriptionLines = doc.splitTextToSize(description, 180);
        doc.text(descriptionLines, 10, 115);
        
        // Generate a barcode
        const barcodeCanvas = document.createElement("canvas");
        const n1 = random8Hex(); // Generate random 8-digit hex string
        JsBarcode(barcodeCanvas, n1, {
            format: "CODE128",
            width: 2,
            height: 40,
        });

        // Convert the barcode canvas to an image and add it to the PDF
        const barcodeImage = barcodeCanvas.toDataURL("image/png");
        doc.addImage(barcodeImage, "PNG", 10, 225, 50, 30);

        // Add a footer with the company stamp if available
if (companyStampInput.files && companyStampInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
        doc.addImage(e.target.result, "PNG", 10, 10, 30, 30);
        doc.save("letterhead.pdf");
    };
    reader.readAsDataURL(companyStampInput.files[0]); // <-- This line is required!
} 
else {
    // If no company stamp is uploaded, just save the PDF
    doc.save("letterhead.pdf");
}
    }

    // Add a button to trigger the PDF generation
    const button = document.createElement("button");
    button.textContent = "Generate Letterhead";
    button.onclick = generateLetterhead;
    document.body.appendChild(button);
});