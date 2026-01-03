import * as XLSX from 'xlsx';
import type { Task, Habit } from '../api/types';

export interface ExportData {
  tasks?: Task[];
  habits?: Habit[];
  finance?: any[];
  productivity?: any[];
}

export type ExportFormat = 'json' | 'csv' | 'excel';

/**
 * Export data to JSON format
 */
export async function exportToJSON(data: ExportData, filename: string = 'export'): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV format
 */
export async function exportToCSV(data: ExportData, filename: string = 'export'): Promise<void> {
  const csvRows: string[] = [];

  // Export tasks
  if (data.tasks && data.tasks.length > 0) {
    csvRows.push('=== TASKS ===');
    const taskHeaders = ['ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Due Date', 'Created At'];
    csvRows.push(taskHeaders.join(','));
    
    data.tasks.forEach(task => {
      const row = [
        task.id,
        `"${(task.title || '').replace(/"/g, '""')}"`,
        `"${(task.description || '').replace(/"/g, '""')}"`,
        task.category || '',
        task.priority || '',
        task.status || '',
        task.due_date || '',
        task.created_at || '',
      ];
      csvRows.push(row.join(','));
    });
    csvRows.push('');
  }

  // Export habits
  if (data.habits && data.habits.length > 0) {
    csvRows.push('=== HABITS ===');
    const habitHeaders = ['ID', 'Title', 'Description', 'Frequency', 'Streak', 'Created At'];
    csvRows.push(habitHeaders.join(','));
    
    data.habits.forEach(habit => {
      const row = [
        habit.id,
        `"${(habit.title || '').replace(/"/g, '""')}"`,
        `"${(habit.description || '').replace(/"/g, '""')}"`,
        habit.frequency || '',
        habit.current_streak?.toString() || '0',
        habit.created_at || '',
      ];
      csvRows.push(row.join(','));
    });
    csvRows.push('');
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to Excel format
 */
export async function exportToExcel(data: ExportData, filename: string = 'export'): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Export tasks
  if (data.tasks && data.tasks.length > 0) {
    const taskData = data.tasks.map(task => ({
      ID: task.id,
      Title: task.title || '',
      Description: task.description || '',
      Category: task.category || '',
      Priority: task.priority || '',
      Status: task.status || '',
      'Due Date': task.due_date || '',
      'Created At': task.created_at || '',
    }));
    const taskSheet = XLSX.utils.json_to_sheet(taskData);
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks');
  }

  // Export habits
  if (data.habits && data.habits.length > 0) {
    const habitData = data.habits.map(habit => ({
      ID: habit.id,
      Title: habit.title || '',
      Description: habit.description || '',
      Frequency: habit.frequency || '',
      Streak: habit.current_streak || 0,
      'Created At': habit.created_at || '',
    }));
    const habitSheet = XLSX.utils.json_to_sheet(habitData);
    XLSX.utils.book_append_sheet(workbook, habitSheet, 'Habits');
  }

  // Export finance
  if (data.finance && data.finance.length > 0) {
    const financeSheet = XLSX.utils.json_to_sheet(data.finance);
    XLSX.utils.book_append_sheet(workbook, financeSheet, 'Finance');
  }

  // Export productivity
  if (data.productivity && data.productivity.length > 0) {
    const productivitySheet = XLSX.utils.json_to_sheet(data.productivity);
    XLSX.utils.book_append_sheet(workbook, productivitySheet, 'Productivity');
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Main export function
 */
export async function exportData(
  data: ExportData,
  format: ExportFormat,
  filename: string = 'tizim-ai-export'
): Promise<void> {
  switch (format) {
    case 'json':
      await exportToJSON(data, filename);
      break;
    case 'csv':
      await exportToCSV(data, filename);
      break;
    case 'excel':
      await exportToExcel(data, filename);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

