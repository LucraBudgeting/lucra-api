import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { logger } from '@/libs/logger';

type CsvRecord = Record<string, string>;

const csvFilePath = path.resolve(
  process.cwd(),
  'documents/transactions-personal-finance-category-taxonomy.csv'
);

async function readCsvToRecord(filePath: string): Promise<CsvRecord> {
  return await new Promise((resolve, reject) => {
    const record: CsvRecord = {};

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const key = row.DETAILED;
        const value = row.DESCRIPTION;
        if (key && value) {
          record[key] = value;
        }
      })
      .on('end', () => {
        resolve(record);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function getCategoryListDictionary(): Promise<CsvRecord> {
  try {
    console.log('Current directory:', process.cwd());

    return await readCsvToRecord(csvFilePath);
  } catch (error) {
    logger.error('Error reading CSV file:', error);
    throw error;
  }
}
