import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  DocumentTextIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface FileComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ComparisonResult {
  row: number;
  column: string;
  columnIndex: number;
  originalValue: string;
  newValue: string;
  type: 'added' | 'removed' | 'modified';
  status: 'pending' | 'accepted' | 'rejected';
}

interface ParsedCsvData {
  headers: string[];
  rows: string[][];
}

const FileComparisonModal: React.FC<FileComparisonModalProps> = ({
  isOpen,
  onClose
}) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [parsedFile1, setParsedFile1] = useState<ParsedCsvData | null>(null);
  const [parsedFile2, setParsedFile2] = useState<ParsedCsvData | null>(null);
  const [differences, setDifferences] = useState<ComparisonResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'added' | 'removed' | 'modified'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  // Parse CSV file content
  const parseCsv = useCallback((content: string): ParsedCsvData => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    
    return { headers, rows };
  }, []);

  // Read file content
  const readFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File, fileNumber: 1 | 2) => {
    try {
      const content = await readFile(file);
      const parsed = parseCsv(content);
      
      if (fileNumber === 1) {
        setFile1(file);
        setParsedFile1(parsed);
      } else {
        setFile2(file);
        setParsedFile2(parsed);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }, [readFile, parseCsv]);

  // Compare files and find differences
  const compareFiles = useCallback(() => {
    if (!parsedFile1 || !parsedFile2) return;
    
    setIsComparing(true);
    const newDifferences: ComparisonResult[] = [];
    
    // Get maximum rows between both files
    const maxRows = Math.max(parsedFile1.rows.length, parsedFile2.rows.length);
    
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      const row1 = parsedFile1.rows[rowIndex];
      const row2 = parsedFile2.rows[rowIndex];
      
      // Handle case where row exists in one file but not the other
      if (!row1 && row2) {
        newDifferences.push({
          row: rowIndex + 1,
          column: 'Entire Row',
          columnIndex: -1,
          originalValue: '',
          newValue: row2.join(','),
          type: 'added',
          status: 'pending'
        });
        continue;
      }
      
      if (row1 && !row2) {
        newDifferences.push({
          row: rowIndex + 1,
          column: 'Entire Row',
          columnIndex: -1,
          originalValue: row1.join(','),
          newValue: '',
          type: 'removed',
          status: 'pending'
        });
        continue;
      }
      
      if (!row1 || !row2) continue;
      
      // Compare each column
      const maxCols = Math.max(row1.length, row2.length);
      for (let colIndex = 0; colIndex < maxCols; colIndex++) {
        const val1 = row1[colIndex] || '';
        const val2 = row2[colIndex] || '';
        
        if (val1 !== val2) {
          const columnName = parsedFile1.headers[colIndex] || parsedFile2.headers[colIndex] || `Column ${colIndex + 1}`;
          
          let type: 'added' | 'removed' | 'modified' = 'modified';
          if (!val1 && val2) type = 'added';
          if (val1 && !val2) type = 'removed';
          
          newDifferences.push({
            row: rowIndex + 1,
            column: columnName,
            columnIndex: colIndex,
            originalValue: val1,
            newValue: val2,
            type,
            status: 'pending'
          });
        }
      }
    }
    
    setDifferences(newDifferences);
    setIsComparing(false);
  }, [parsedFile1, parsedFile2]);

  // Update difference status
  const updateDifferenceStatus = useCallback((index: number, status: 'accepted' | 'rejected') => {
    setDifferences(prev => 
      prev.map((diff, i) => i === index ? { ...diff, status } : diff)
    );
  }, []);

  // Apply accepted changes
  const applyChanges = useCallback(() => {
    if (!parsedFile1 || !parsedFile2) return;
    
    const acceptedDifferences = differences.filter(diff => diff.status === 'accepted');
    const updatedRows = [...parsedFile1.rows];
    
    acceptedDifferences.forEach(diff => {
      if (diff.type === 'added' && diff.columnIndex === -1) {
        // Add entire row
        updatedRows.push(diff.newValue.split(','));
      } else if (diff.type === 'removed' && diff.columnIndex === -1) {
        // Remove entire row
        updatedRows.splice(diff.row - 1, 1);
      } else if (diff.columnIndex >= 0) {
        // Modify specific cell
        if (updatedRows[diff.row - 1]) {
          updatedRows[diff.row - 1][diff.columnIndex] = diff.newValue;
        }
      }
    });
    
    // Generate corrected CSV
    const correctedCsv = [
      parsedFile1.headers.join(','),
      ...updatedRows.map(row => row.join(','))
    ].join('\n');
    
    // Download corrected file
    const blob = new Blob([correctedCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corrected_${file1?.name || 'file.csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [parsedFile1, parsedFile2, differences, file1]);

  // Filtered differences
  const filteredDifferences = useMemo(() => {
    return differences.filter(diff => {
      const typeMatch = filterType === 'all' || diff.type === filterType;
      const statusMatch = filterStatus === 'all' || diff.status === filterStatus;
      const searchMatch = !searchQuery.trim() || 
        diff.column.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diff.originalValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        diff.newValue.toLowerCase().includes(searchQuery.toLowerCase());
      
      return typeMatch && statusMatch && searchMatch;
    });
  }, [differences, filterType, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => ({
    total: differences.length,
    added: differences.filter(d => d.type === 'added').length,
    removed: differences.filter(d => d.type === 'removed').length,
    modified: differences.filter(d => d.type === 'modified').length,
    accepted: differences.filter(d => d.status === 'accepted').length,
    rejected: differences.filter(d => d.status === 'rejected').length,
    pending: differences.filter(d => d.status === 'pending').length
  }), [differences]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-7xl max-h-[95vh] overflow-hidden bg-white rounded-3xl shadow-wax-2xl border border-wax-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-wax-gray-100 bg-wax-elegant">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-wax-red-100 rounded-xl">
                <ScaleIcon className="w-6 h-6 text-wax-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-wax-gray-900 mb-1">
                  File Comparison & Correction
                </h2>
                <p className="text-sm text-wax-gray-600">
                  Compare CSV files, identify differences, and apply corrections
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={onClose}
              className="p-3 text-wax-gray-500 bg-white/80 backdrop-blur-sm border border-wax-gray-200/50 rounded-xl transition-all duration-200 hover:bg-white hover:text-wax-gray-700 hover:shadow-wax-md focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.button>
          </div>

          {/* File Upload Section */}
          <div className="p-6 border-b border-wax-gray-100 bg-wax-red-50/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* File 1 Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-wax-gray-700">
                  Original File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 1);
                    }}
                    className="hidden"
                    id="file1-upload"
                  />
                  <label
                    htmlFor="file1-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-wax-gray-300 rounded-xl cursor-pointer hover:border-wax-red-400 hover:bg-wax-red-50 transition-all duration-300"
                  >
                    <CloudArrowUpIcon className="w-8 h-8 text-wax-gray-400 mb-2" />
                    <span className="text-sm text-wax-gray-600">
                      {file1 ? file1.name : 'Click to upload original CSV'}
                    </span>
                  </label>
                </div>
                {parsedFile1 && (
                  <div className="text-xs text-wax-gray-600 bg-white rounded-lg p-3 border border-wax-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">File loaded successfully</span>
                    </div>
                    <div>Rows: {parsedFile1.rows.length} | Columns: {parsedFile1.headers.length}</div>
                  </div>
                )}
              </div>

              {/* File 2 Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-wax-gray-700">
                  Updated File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 2);
                    }}
                    className="hidden"
                    id="file2-upload"
                  />
                  <label
                    htmlFor="file2-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-wax-gray-300 rounded-xl cursor-pointer hover:border-wax-red-400 hover:bg-wax-red-50 transition-all duration-300"
                  >
                    <CloudArrowUpIcon className="w-8 h-8 text-wax-gray-400 mb-2" />
                    <span className="text-sm text-wax-gray-600">
                      {file2 ? file2.name : 'Click to upload updated CSV'}
                    </span>
                  </label>
                </div>
                {parsedFile2 && (
                  <div className="text-xs text-wax-gray-600 bg-white rounded-lg p-3 border border-wax-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">File loaded successfully</span>
                    </div>
                    <div>Rows: {parsedFile2.rows.length} | Columns: {parsedFile2.headers.length}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Compare Button */}
            {parsedFile1 && parsedFile2 && (
              <div className="mt-6 text-center">
                <motion.button
                  onClick={compareFiles}
                  disabled={isComparing}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-wax-red-600 text-white font-semibold rounded-xl shadow-wax-md transition-all duration-200 hover:bg-wax-red-700 hover:shadow-wax-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isComparing ? (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : (
                    <ScaleIcon className="w-5 h-5" />
                  )}
                  {isComparing ? 'Comparing Files...' : 'Compare Files'}
                </motion.button>
              </div>
            )}
          </div>

          {/* Results Section */}
          {differences.length > 0 && (
            <>
              {/* Stats Dashboard */}
              <div className="p-6 border-b border-wax-gray-100 bg-wax-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-wax-gray-900">{stats.total}</div>
                    <div className="text-xs text-wax-gray-600">Total Differences</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-emerald-600">{stats.added}</div>
                    <div className="text-xs text-wax-gray-600">Added</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
                    <div className="text-xs text-wax-gray-600">Removed</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-amber-600">{stats.modified}</div>
                    <div className="text-xs text-wax-gray-600">Modified</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-emerald-600">{stats.accepted}</div>
                    <div className="text-xs text-wax-gray-600">Accepted</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-xs text-wax-gray-600">Rejected</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-wax-sm">
                    <div className="text-2xl font-bold text-wax-gray-600">{stats.pending}</div>
                    <div className="text-xs text-wax-gray-600">Pending</div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-6 border-b border-wax-gray-100 bg-white">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wax-gray-400" />
                      <input
                        type="text"
                        placeholder="Search differences..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-wax-gray-200 rounded-xl focus:border-wax-red-500 focus:ring-4 focus:ring-wax-red-100 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    
                    {/* Type Filter */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                      className="px-4 py-3 border-2 border-wax-gray-200 rounded-xl focus:border-wax-red-500 focus:ring-4 focus:ring-wax-red-100 focus:outline-none transition-all duration-200 bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="added">Added</option>
                      <option value="removed">Removed</option>
                      <option value="modified">Modified</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                      className="px-4 py-3 border-2 border-wax-gray-200 rounded-xl focus:border-wax-red-500 focus:ring-4 focus:ring-wax-red-100 focus:outline-none transition-all duration-200 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-wax-gray-600">
                      {filteredDifferences.length} of {differences.length} differences
                    </div>
                    
                    <motion.button
                      onClick={applyChanges}
                      disabled={stats.accepted === 0}
                      className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-wax-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-wax-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <DocumentArrowDownIcon className="w-5 h-5" />
                      Apply Changes ({stats.accepted})
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Differences Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="bg-wax-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Column</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Original</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">New</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-wax-gray-700 uppercase tracking-wider border-b border-wax-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-wax-gray-200">
                    {filteredDifferences.map((difference, index) => (
                      <motion.tr
                        key={`${difference.row}-${difference.columnIndex}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-wax-red-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-wax-gray-900">
                          {difference.row}
                        </td>
                        <td className="px-4 py-4 text-sm text-wax-gray-900">
                          {difference.column}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            difference.type === 'added' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : difference.type === 'removed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {difference.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-wax-gray-900 max-w-xs truncate">
                          {difference.originalValue || <span className="text-wax-gray-400 italic">empty</span>}
                        </td>
                        <td className="px-4 py-4 text-sm text-wax-gray-900 max-w-xs truncate">
                          {difference.newValue || <span className="text-wax-gray-400 italic">empty</span>}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            difference.status === 'accepted' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : difference.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-wax-gray-100 text-wax-gray-800'
                          }`}>
                            {difference.status === 'accepted' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {difference.status === 'rejected' && <XMarkIcon className="w-3 h-3 mr-1" />}
                            {difference.status === 'pending' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                            {difference.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateDifferenceStatus(differences.indexOf(difference), 'accepted')}
                              disabled={difference.status === 'accepted'}
                              className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Accept change"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => updateDifferenceStatus(differences.indexOf(difference), 'rejected')}
                              disabled={difference.status === 'rejected'}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject change"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Empty State */}
          {differences.length === 0 && parsedFile1 && parsedFile2 && !isComparing && (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-wax-gray-900 mb-2">
                  No Differences Found
                </h3>
                <p className="text-wax-gray-600">
                  The files are identical. No changes needed.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileComparisonModal; 