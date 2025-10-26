const XLSX = require('xlsx');

/**
 * @desc Converts an Excel file buffer into a JSON array.
 * @param {Buffer} buffer - The buffer of the uploaded Excel file.
 * @param {string} sheetName - Optional name of the sheet to read (defaults to the first sheet).
 * @returns {Array<Object>} Array of objects representing the Excel rows.
 */
const excelToJson = (buffer, sheetName) => {
    try {
        // Read the file buffer
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        // Determine which sheet to read
        const targetSheetName = sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[targetSheetName];

        if (!worksheet) {
            throw new Error(`Sheet named "${targetSheetName}" not found in the workbook.`);
        }

        // Convert worksheet to JSON format
        const data = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, // Get header row as an array
            raw: false,
            defval: '' // Set default value for empty cells
        });

        // The first row is the header, which we use as keys
        const headers = data[0].map(header => 
            // Normalize header names (e.g., remove spaces and convert to lowercase/camelCase if needed)
            String(header).trim().replace(/\s/g, '').toLowerCase()
        );
        const rows = data.slice(1);

        // Map rows to objects using standardized headers
        const jsonResult = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index];
            });
            return obj;
        });

        return jsonResult;

    } catch (error) {
        console.error("Error processing Excel file:", error.message);
        throw new Error(`Excel processing failed: ${error.message}`);
    }
};

module.exports = { excelToJson };
