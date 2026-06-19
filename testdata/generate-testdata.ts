/**
 * Run once to create the sample Excel test data file:
 *   npx ts-node testdata/generate-testdata.ts
 *
 * Produces: testdata/users.xlsx
 * Columns : name | postcode | address | city | country
 */
import * as XLSX from 'xlsx';
import * as path from 'path';

const rows = [
  { name: 'Alice Smith',   postcode: 'SW1A 1AA', address: '10 Downing Street',  city: 'London',       country: 'UK' },
  { name: 'Bob Johnson',   postcode: 'M1 1AE',   address: '1 Piccadilly Gardens', city: 'Manchester', country: 'UK' },
  { name: 'Clara Müller',  postcode: '10115',    address: 'Unter den Linden 1', city: 'Berlin',        country: 'Germany' },
  { name: 'David Rossi',   postcode: '00184',    address: 'Via Labicana 125',   city: 'Rome',          country: 'Italy' },
  { name: 'Eva Dupont',    postcode: '75001',    address: '1 Rue de Rivoli',    city: 'Paris',         country: 'France' },
];

const worksheet = XLSX.utils.json_to_sheet(rows);
const workbook  = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

const outputPath = path.resolve(__dirname, 'users.xlsx');
XLSX.writeFile(workbook, outputPath);
console.log(`Sample Excel file created at: ${outputPath}`);
