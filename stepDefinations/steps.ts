import { Given, When, Then, After } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals'
import * as path from 'path';
import { LoginPage , SecurePage} from '../pageObject';

import { ExcelReader, TestData } from '../utils/ExcelReader';


Given(/^I am on the login page$/, async () => {
    await LoginPage.open();
    // await LoginPage.getData();
});

When(/^I login with (.*) and (.*)$/, async (username, password) => {
    await LoginPage.login(username, password)
});

Then(/^I should see a flash message saying (.*)$/, async (message) => {
    await expect(SecurePage.flashAlert).toBeExisting();
    await expect(SecurePage.flashAlert).toHaveText(expect.stringContaining(message));
    expect("tet").toHaveText("tet");
    
});

// ─── Excel-driven steps ──────────────────────────────────────────────────────

// Shared state scoped to each scenario
let excelRows: TestData[] = [];
let currentRow: TestData;
let currentRowIndex: number | undefined;
let activeExcelReader: ExcelReader | null = null;

// ── After hook: automatically marks the row as used once the scenario ends ──
// Only fires when @excel-track tag is present on the scenario.
After({ tags: '@excel-track' }, () => {
    if (activeExcelReader && currentRowIndex !== undefined) {
        activeExcelReader.markRowAsUsed(currentRowIndex);
    }
    activeExcelReader = null;
    currentRowIndex = undefined;
});

// ── Load all rows (no tracking) ──
Given(/^I load test data from Excel file "([^"]+)"$/, (filePath: string) => {
    const reader = new ExcelReader(path.resolve(process.cwd(), filePath));
    excelRows = reader.getAllRows();
    console.log(`Loaded ${excelRows.length} rows from ${filePath}`);
});

Then(/^I should see (\d+) rows of user data$/, (expectedCount: string) => {
    expect(excelRows.length).toBe(Number(expectedCount));
    excelRows.forEach((row, i) => {
        console.log(
            `Row ${i + 1}: name=${row.name} | postcode=${row.postcode} | ` +
            `address=${row.address} | city=${row.city} | country=${row.country}`
        );
    });
});

// ── Pick a specific row by index (no tracking) ──
When(/^I use row (\d+) from the Excel data$/, (rowIndex: string) => {
    const reader = new ExcelReader(path.resolve(process.cwd(), 'testdata/users.xlsx'));
    currentRow = reader.getRowByIndex(Number(rowIndex));
    console.log(`Using Excel row ${rowIndex}:`, currentRow);
});

// ── Pick a row by testcasenum (e.g. TC001) ──
// Column 'testcasenum' in Excel acts as a stable key linking test to data.
// Usage in feature: When I use test case "TC002" from "testdata/users.xlsx"
When(/^I use test case "([^"]+)" from "([^"]+)"$/, (tcNum: string, filePath: string) => {
    const reader = new ExcelReader(path.resolve(process.cwd(), filePath));
    currentRow = reader.getRowByTestCase(tcNum);
    console.log(`[Excel] TC=${tcNum} → name=${currentRow.name} | ` +
        `postcode=${currentRow.postcode} | city=${currentRow.city} | country=${currentRow.country}`);
});

// ── Pick the NEXT unused row and mark it used after the scenario ──
// Use @excel-track tag on your scenario to activate the After hook above.
Given(/^I pick the next unused user from "([^"]+)"$/, (filePath: string) => {
    activeExcelReader = new ExcelReader(path.resolve(process.cwd(), filePath));
    const result = activeExcelReader.getNextUnusedRow();
    currentRow = result.row;
    currentRowIndex = result.rowIndex;
    console.log(`[Excel] Picked row ${currentRowIndex}: name=${currentRow.name} | ` +
        `city=${currentRow.city} | country=${currentRow.country}`);
});

Then(/^the user name should be "([^"]+)"$/, (expectedName: string) => {
    expect(currentRow.name).toBe(expectedName);
});

Then(/^the user city should be "([^"]+)"$/, (expectedCity: string) => {
    expect(currentRow.city).toBe(expectedCity);
});

Then(/^the user name should not be empty$/, () => {
    expect(currentRow.name.length).toBeGreaterThan(0);
    console.log(
        `[Excel] Using: name=${currentRow.name} | postcode=${currentRow.postcode} | ` +
        `address=${currentRow.address} | city=${currentRow.city} | country=${currentRow.country}`
    );
});

