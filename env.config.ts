
import * as path from "path";
import * as fs from "fs";

const env = process.env.ENV || 'TST'; // default fallback

const testDataPath = path.join(__dirname, '../wdio-cucumber/data/testData.json');
const rawData = fs.readFileSync(testDataPath, 'utf-8');
const parsedData = JSON.parse(rawData);

export const testData = {
  ...parsedData.common,
  ...parsedData[env]
};

export const currentEnv = env;
