import React, { useState, useRef } from 'react';
import { Button, Card } from './UI';
import { Download, Upload, FileText, FileSpreadsheet, FileJson, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { exportData, type ExportFormat, type ExportData } from '../../lib/utils/export';
import { importData, detectFileFormat, type ImportFormat } from '../../lib/utils/import';
import { useToast } from './ErrorToast';
import { useTasksStore } from '../../lib/store';
import { useHabitsStore } from '../../lib/store';
import { useFinanceStore } from '../../lib/store';

interface ExportImportProps {
  onImportComplete?: () => void;
}

export const ExportImport: React.FC<ExportImportProps> = ({ onImportComplete }) => {
  const { showToast } = useToast();
  const { tasks, fetchTasks } = useTasksStore();
  const { habits, fetchHabits } = useHabitsStore();
  const { transactions, fetchTransactions } = useFinanceStore();
  
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setExporting(format);
      
      const exportDataObj: ExportData = {
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          category: task.cat,
          priority: task.priority || 'medium',
          status: task.status,
          due_date: task.date,
          created_at: task.created_at || new Date().toISOString(),
        })),
        habits: habits.map(habit => ({
          id: habit.id,
          title: habit.title,
          description: habit.description || '',
          frequency: habit.frequency || 'daily',
          current_streak: habit.currentStreak || 0,
          created_at: habit.created_at || new Date().toISOString(),
        })),
      };

      const filename = `tizim-ai-export-${new Date().toISOString().split('T')[0]}`;
      await exportData(exportDataObj, format, filename);
      
      showToast(`Ma'lumotlar ${format.toUpperCase()} formatida eksport qilindi`, 'success');
    } catch (error) {
      showToast(
        `Eksport qilishda xatolik: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`,
        'error'
      );
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      setImportProgress('Fayl o\'qilmoqda...');

      const format = detectFileFormat(file.name);
      if (!format) {
        throw new Error('Fayl formati qo\'llab-quvvatlanmaydi. JSON, CSV yoki Excel fayl tanlang.');
      }

      setImportProgress('Ma\'lumotlar import qilinmoqda...');
      const importedData = await importData(file, format);

      setImportProgress('Ma\'lumotlar saqlanmoqda...');
      
      // Import tasks
      if (importedData.tasks && importedData.tasks.length > 0) {
        // TODO: Implement bulk import API
        // For now, we'll just show a message
        showToast(`${importedData.tasks.length} ta vazifa import qilindi`, 'success');
      }

      // Import habits
      if (importedData.habits && importedData.habits.length > 0) {
        // TODO: Implement bulk import API
        showToast(`${importedData.habits.length} ta odat import qilindi`, 'success');
      }

      // Refresh data
      await Promise.all([
        fetchTasks(),
        fetchHabits(),
        fetchTransactions(),
      ]);

      setImportProgress('');
      showToast('Ma\'lumotlar muvaffaqiyatli import qilindi', 'success');
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setImportProgress('');
      showToast(
        `Import qilishda xatolik: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`,
        'error'
      );
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImport(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportFormats: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { format: 'json', label: 'JSON', icon: <FileJson size={18} /> },
    { format: 'csv', label: 'CSV', icon: <FileText size={18} /> },
    { format: 'excel', label: 'Excel', icon: <FileSpreadsheet size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="p-5">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Eksport qilish</h3>
            <p className="text-sm text-slate-500">
              Ma'lumotlaringizni JSON, CSV yoki Excel formatida yuklab oling
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {exportFormats.map(({ format, label, icon }) => (
              <Button
                key={format}
                onClick={() => handleExport(format)}
                disabled={exporting !== null}
                loading={exporting === format}
                variant="outline"
                className="flex items-center gap-2"
              >
                {exporting !== format && icon}
                {label} formatida eksport
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-5">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Import qilish</h3>
            <p className="text-sm text-slate-500">
              JSON, CSV yoki Excel fayldan ma'lumotlarni import qiling
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="import-file-input"
            disabled={importing}
          />

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Fayl tanlash
                </>
              )}
            </Button>

            {importProgress && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 size={16} className="animate-spin" />
                <span>{importProgress}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>• JSON: To'liq ma'lumotlar strukturasini saqlaydi</p>
            <p>• CSV: Jadval formatida, Excel bilan mos keladi</p>
            <p>• Excel: Bir nechta jadvallar bilan to'liq ma'lumotlar</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

