// utils/ExcelReader.ts
import * as XLSX from 'xlsx';
import * as path from 'path';

export interface TestData {
  name: string;
  postcode: string;
  address: string;
  city: string;
  country: string;
  [key: string]: string; // allows extra columns
}

/** Wraps a TestData row together with its 1-based row index for tracking. */
export interface UnusedRowResult {
  row: TestData;
  rowIndex: number;
}

export class ExcelReader {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  /**
   * Reads all rows from the given sheet (defaults to first sheet).
   * Column headers in row 1 must match: name, postcode, address, city, country
   * Returns an array of TestData objects, one per data row.
   */
  getAllRows(sheetName?: string): TestData[] {
    const workbook = XLSX.readFile(this.filePath);
    const sheet = sheetName
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error(
        `Sheet "${sheetName ?? workbook.SheetNames[0]}" not found in ${this.filePath}`
      );
    }

    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
    });

    return rows.map((row) => this.normaliseRow(row));
  }

  /**
   * Returns only the rows where the given column matches the expected value.
   * Example: getRowsByFilter('country', 'UK')
   */
  getRowsByFilter(column: keyof TestData, value: string): TestData[] {
    return this.getAllRows().filter(
      (row) => row[column]?.toString().toLowerCase() === value.toLowerCase()
    );
  }

  /**
   * Looks up a row by the value in the 'testcasenum' column (case-insensitive).
   * The 'testcasenum' column should be the first column and hold unique IDs
   * like TC001, TC002 etc.  This makes the mapping between test and data
   * explicit and readable in both the feature file and the Excel sheet.
   *
   * Example:
   *   const row = reader.getRowByTestCase('TC002');
   *   console.log(row.name, row.city);
   */
  xzcdgetRowByTestCase(testCaseNum: string, sheetName?: string): TestData {
    const rows = this.getAllRows(sheetName);
    const match = rows.find(
      (row) => row['testcasenum']?.toLowerCase() === testCaseNum.toLowerCase()
    );
    if (!match) {
      throw new Error(
        `No row found with testcasenum="${testCaseNum}" in ${this.filePath}. ` +
        `Available IDs: ${rows.map((r) => r['testcasenum']).filter(Boolean).join(', ')}`
      );
    }
    return match;
  }

  /**
   * Returns a single row by its 1-based row index (excludes header row).
   */
  getRowByIndex(rowIndex: number): TestData {
    const rows = this.getAllRows();
    if (rowIndex < 1 || rowIndex > rows.length) {
      throw new Error(
        `Row index ${rowIndex} is out of range. Sheet has ${rows.length} data row(s).`
      );
    }
    return rows[rowIndex - 1];
  }

  /**
   * Returns the first row whose 'status' column is NOT 'used' (case-insensitive).
   * If the sheet has no 'status' column at all, every row is treated as unused.
   * The returned object includes _rowIndex (1-based, excluding header) so you
   * can pass it straight to markRowAsUsed().
   *
   * Example:
   *   const { row, rowIndex } = reader.getNextUnusedRow();
   *   console.log(row.name, rowIndex);
   *   reader.markRowAsUsed(rowIndex);
   */
  getNextUnusedRow(sheetName?: string): UnusedRowResult {
    const workbook = XLSX.readFile(this.filePath);
    const sheetKey = sheetName ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetKey];

    if (!sheet) {
      throw new Error(`Sheet "${sheetKey}" not found in ${this.filePath}`);
    }

    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    for (let i = 0; i < rows.length; i++) {
      const status = rows[i]['status']?.toString().trim().toLowerCase();
      if (!status || status === '') {
        return { row: this.normaliseRow(rows[i]), rowIndex: i + 1 };
      }
    }

    throw new Error(
      `No unused rows remaining in "${sheetKey}" of ${this.filePath}. ` +
      `All rows have status="used". Add new rows or reset the status column.`
    );
  }

  /**
   * Writes 'used' into the 'status' column of the given 1-based data row
   * (i.e. row 1 = first data row after the header).
   * If the 'status' column does not exist it is created automatically.
   * The file is saved in place — no code push required.
   */
  markRowAsUsed(rowIndex: number, sheetName?: string): void {
    const workbook = XLSX.readFile(this.filePath);
    const sheetKey = sheetName ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetKey];

    if (!sheet) {
      throw new Error(`Sheet "${sheetKey}" not found in ${this.filePath}`);
    }

    const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');

    // Find the column letter for the 'status' header (row 0 = Excel row 1)
    let statusColIndex: number | null = null;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
      const cell = sheet[cellAddr];
      if (cell?.v?.toString().trim().toLowerCase() === 'status') {
        statusColIndex = col;
        break;
      }
    }

    // No 'status' column yet — append one
    if (statusColIndex === null) {
      statusColIndex = range.e.c + 1;
      const headerAddr = XLSX.utils.encode_cell({ r: 0, c: statusColIndex });
      sheet[headerAddr] = { v: 'status', t: 's' };
      // Expand the sheet range to include the new column
      sheet['!ref'] = XLSX.utils.encode_range({
        s: range.s,
        e: { r: range.e.r, c: statusColIndex },
      });
    }

    // rowIndex is 1-based data row; Excel row index = rowIndex (header is r:0)
    const cellAddr = XLSX.utils.encode_cell({ r: rowIndex, c: statusColIndex });
    sheet[cellAddr] = { v: 'used', t: 's' };

    XLSX.writeFile(workbook, this.filePath);
    console.log(`[ExcelReader] Row ${rowIndex} marked as "used" in ${this.filePath}`);
  }

  /**
   * Clears all 'status' values so every row becomes available again.
   * Useful for resetting between test cycles.
   */
  resetAllRows(sheetName?: string): void {
    const workbook = XLSX.readFile(this.filePath);
    const sheetKey = sheetName ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetKey];

    if (!sheet) {
      throw new Error(`Sheet "${sheetKey}" not found in ${this.filePath}`);
    }

    const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');

    let statusColIndex: number | null = null;
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
      if (sheet[cellAddr]?.v?.toString().trim().toLowerCase() === 'status') {
        statusColIndex = col;
        break;
      }
    }

    if (statusColIndex === null) {
      console.log('[ExcelReader] No status column found — nothing to reset.');
      return;
    }

    for (let row = 1; row <= range.e.r; row++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: statusColIndex });
      if (sheet[cellAddr]) {
        sheet[cellAddr] = { v: '', t: 's' };
      }
    }

    XLSX.writeFile(workbook, this.filePath);
    console.log(`[ExcelReader] All rows reset in "${sheetKey}" of ${this.filePath}`);
  }

  /**
   * Returns all available sheet names in the workbook.
   */
  
  
  private normaliseRow(raw: Record<string, string>): TestData {
    // Trim keys and values to avoid whitespace issues in header names
    const normalised: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      normalised[key.trim().toLowerCase()] = value?.toString().trim() ?? '';
    }
    return {
      name: normalised['name'] ?? '',
      postcode: normalised['postcode'] ?? '',
      address: normalised['address'] ?? '',
      city: normalised['city'] ?? '',
      country: normalised['country'] ?? '',
      ...normalised,
    };
  }
}
