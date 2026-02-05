import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCSV(text) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      currentLine.push(currentField);
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      // Line ending
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      if (currentField || currentLine.length > 0) {
        currentLine.push(currentField);
        lines.push(currentLine);
        currentLine = [];
        currentField = '';
      }
    } else {
      currentField += char;
    }
  }
  
  // Handle last field and line
  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField);
    lines.push(currentLine);
  }
  
  return lines;
}

function csvToJson(csvFilePath, jsonOutputPath) {
  console.log(`Reading CSV file: ${csvFilePath}`);
  const csvText = fs.readFileSync(csvFilePath, 'utf8');
  
  console.log('Parsing CSV...');
  const rows = parseCSV(csvText);
  
  if (rows.length === 0) {
    throw new Error('CSV file is empty');
  }
  
  // First row is headers
  const headers = rows[0];
  console.log(`Found ${headers.length} columns: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
  
  // Convert remaining rows to objects
  const jsonData = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === headers.length) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j];
      }
      jsonData.push(obj);
    }
  }
  
  console.log(`Converted ${jsonData.length} rows to JSON`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(jsonOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write JSON file
  console.log(`Writing JSON to: ${jsonOutputPath}`);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2), 'utf8');
  
  console.log('✓ Conversion complete!');
  console.log(`✓ Input: ${csvFilePath}`);
  console.log(`✓ Output: ${jsonOutputPath}`);
  console.log(`✓ Records: ${jsonData.length}`);
  
  // Show file sizes
  const inputSize = fs.statSync(csvFilePath).size;
  const outputSize = fs.statSync(jsonOutputPath).size;
  console.log(`✓ Input size: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`✓ Output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node csv-to-json.js <input-csv-path> <output-json-path>');
  console.error('');
  console.error('Example:');
  console.error('  node csv-to-json.js data/input.csv output/result.json');
  console.error('  node csv-to-json.js ../public/data.csv ./processed.json');
  process.exit(1);
}

const csvPath = path.resolve(args[0]);
const jsonPath = path.resolve(args[1]);

// Check if input file exists
if (!fs.existsSync(csvPath)) {
  console.error(`❌ Error: Input file not found: ${csvPath}`);
  process.exit(1);
}

try {
  csvToJson(csvPath, jsonPath);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
