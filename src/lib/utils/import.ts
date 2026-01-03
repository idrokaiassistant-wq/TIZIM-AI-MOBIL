import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Task, Habit } from '../api/types';

export interface ImportData {
  tasks?: Task[];
  habits?: Habit[];
  finance?: any[];
  productivity?: any[];
}

export type ImportFormat = 'json' | 'csv' | 'excel';

/**
 * Validate imported data
 */
export function validateImportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.tasks) {
    if (!Array.isArray(data.tasks)) {
      errors.push('Tasks must be an array');
    } else {
      data.tasks.forEach((task: any, index: number) => {
        if (!task.title) {
          errors.push(`Task at index ${index} is missing title`);
        }
      });
    }
  }

  if (data.habits) {
    if (!Array.isArray(data.habits)) {
      errors.push('Habits must be an array');
    } else {
      data.habits.forEach((habit: any, index: number) => {
        if (!habit.title) {
          errors.push(`Habit at index ${index} is missing title`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Import data from JSON format
 */
export async function importFromJSON(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        const validation = validateImportData(data);
        
        if (!validation.valid) {
          reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Import data from CSV format
 */
export async function importFromCSV(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data: ImportData = {};
          const rows = results.data as any[];
          
          // Try to detect data type from headers
          if (rows.length > 0) {
            const firstRow = rows[0];
            const headers = Object.keys(firstRow);
            
            // Check if it's tasks
            if (headers.includes('Title') && (headers.includes('Category') || headers.includes('Status'))) {
              data.tasks = rows.map((row, index) => ({
                id: row.ID || `imported-${Date.now()}-${index}`,
                title: row.Title || '',
                description: row.Description || '',
                category: row.Category || 'Ish',
                priority: row.Priority || 'medium',
                status: row.Status || 'pending',
                due_date: row['Due Date'] || null,
                created_at: row['Created At'] || new Date().toISOString(),
              })) as Task[];
            }
            
            // Check if it's habits
            if (headers.includes('Title') && headers.includes('Frequency')) {
              data.habits = rows.map((row, index) => ({
                id: row.ID || `imported-${Date.now()}-${index}`,
                title: row.Title || '',
                description: row.Description || '',
                frequency: row.Frequency || 'daily',
                current_streak: parseInt(row.Streak) || 0,
                created_at: row['Created At'] || new Date().toISOString(),
              })) as Habit[];
            }
          }
          
          const validation = validateImportData(data);
          if (!validation.valid) {
            reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
            return;
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

/**
 * Import data from Excel format
 */
export async function importFromExcel(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const importData: ImportData = {};
        
        // Process each sheet
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          if (sheetName.toLowerCase().includes('task')) {
            importData.tasks = jsonData.map((row: any, index: number) => ({
              id: row.ID || `imported-${Date.now()}-${index}`,
              title: row.Title || '',
              description: row.Description || '',
              category: row.Category || 'Ish',
              priority: row.Priority || 'medium',
              status: row.Status || 'pending',
              due_date: row['Due Date'] || null,
              created_at: row['Created At'] || new Date().toISOString(),
            })) as Task[];
          } else if (sheetName.toLowerCase().includes('habit')) {
            importData.habits = jsonData.map((row: any, index: number) => ({
              id: row.ID || `imported-${Date.now()}-${index}`,
              title: row.Title || '',
              description: row.Description || '',
              frequency: row.Frequency || 'daily',
              current_streak: parseInt(row.Streak) || 0,
              created_at: row['Created At'] || new Date().toISOString(),
            })) as Habit[];
          } else if (sheetName.toLowerCase().includes('finance')) {
            importData.finance = jsonData;
          } else if (sheetName.toLowerCase().includes('productivity')) {
            importData.productivity = jsonData;
          }
        });
        
        const validation = validateImportData(importData);
        if (!validation.valid) {
          reject(new Error(`Validation failed: ${validation.errors.join(', ')}`));
          return;
        }
        
        resolve(importData);
      } catch (error) {
        reject(new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
}

/**
 * Main import function
 */
export async function importData(
  file: File,
  format: ImportFormat
): Promise<ImportData> {
  switch (format) {
    case 'json':
      return await importFromJSON(file);
    case 'csv':
      return await importFromCSV(file);
    case 'excel':
      return await importFromExcel(file);
    default:
      throw new Error(`Unsupported import format: ${format}`);
  }
}

/**
 * Detect file format from filename
 */
export function detectFileFormat(filename: string): ImportFormat | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'json':
      return 'json';
    case 'csv':
      return 'csv';
    case 'xlsx':
    case 'xls':
      return 'excel';
    default:
      return null;
  }
}

