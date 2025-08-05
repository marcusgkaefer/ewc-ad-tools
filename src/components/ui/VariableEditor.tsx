import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { templateEngine } from '../../utils/templateEngine';
import type { VariableContext, TemplateVariable } from '../../types/meta';

interface VariableEditorProps {
  template: string;
  variables: TemplateVariable[];
  sampleData: VariableContext;
  onTemplateChange: (template: string) => void;
  onVariablesChange: (variables: TemplateVariable[]) => void;
  className?: string;
}

interface VariableSuggestion {
  name: string;
  type: 'location' | 'campaign' | 'custom' | 'helper';
  description: string;
  example: string;
}

const variableSuggestions: VariableSuggestion[] = [
  // Location variables
  { name: 'location.name', type: 'location', description: 'Location name', example: 'Chicago' },
  { name: 'location.city', type: 'location', description: 'City name', example: 'Chicago' },
  { name: 'location.state', type: 'location', description: 'State name', example: 'IL' },
  { name: 'location.zipCode', type: 'location', description: 'ZIP code', example: '60601' },
  { name: 'location.phoneNumber', type: 'location', description: 'Phone number', example: '(555) 123-4567' },
  { name: 'location.address', type: 'location', description: 'Full address', example: '123 Main St' },
  { name: 'location.landingPageUrl', type: 'location', description: 'Landing page URL', example: 'https://example.com' },
  
  // Campaign variables
  { name: 'campaign.name', type: 'campaign', description: 'Campaign name', example: 'Summer Sale' },
  { name: 'campaign.objective', type: 'campaign', description: 'Campaign objective', example: 'Engagement' },
  { name: 'campaign.platform', type: 'campaign', description: 'Platform name', example: 'Meta' },
  { name: 'campaign.budget', type: 'campaign', description: 'Campaign budget', example: '1000' },
  { name: 'campaign.startDate', type: 'campaign', description: 'Start date', example: '06/01/2024' },
  { name: 'campaign.endDate', type: 'campaign', description: 'End date', example: '08/31/2024' },
  
  // Helper functions
  { name: 'formatPhone', type: 'helper', description: 'Format phone number', example: '{{formatPhone location.phoneNumber}}' },
  { name: 'formatCurrency', type: 'helper', description: 'Format currency', example: '{{formatCurrency campaign.budget}}' },
  { name: 'formatDate', type: 'helper', description: 'Format date', example: '{{formatDate campaign.startDate}}' },
  { name: 'uppercase', type: 'helper', description: 'Convert to uppercase', example: '{{uppercase location.city}}' },
  { name: 'lowercase', type: 'helper', description: 'Convert to lowercase', example: '{{lowercase location.name}}' },
  { name: 'capitalize', type: 'helper', description: 'Capitalize first letter', example: '{{capitalize location.city}}' },
  { name: 'truncate', type: 'helper', description: 'Truncate text', example: '{{truncate location.name 20}}' },
  { name: 'conditional', type: 'helper', description: 'Conditional text', example: '{{conditional location.city "Chicago" "Other"}}' }
];

export default function VariableEditor({
  template,
  variables,
  sampleData,
  onTemplateChange,
  onVariablesChange,
  className = ''
}: VariableEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'variables'>('editor');
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [suggestions, setSuggestions] = useState<VariableSuggestion[]>([]);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    missingVariables: string[];
    errors: string[];
    warnings: string[];
  }>({
    isValid: true,
    missingVariables: [],
    errors: [],
    warnings: []
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update validation when template changes
  useEffect(() => {
    const availableVariables = templateEngine.getAvailableVariables(sampleData);
    const validationResult = templateEngine.validateTemplate(template, availableVariables);
    setValidation(validationResult);
  }, [template, sampleData]);

  // Get template preview
  const getPreview = () => {
    try {
      return templateEngine.compileTemplate(template, sampleData);
    } catch (error) {
      return template;
    }
  };

  // Handle template change
  const handleTemplateChange = (value: string) => {
    onTemplateChange(value);
    
    // Update cursor position for suggestions
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  // Insert variable at cursor position
  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = template.substring(0, start) + `{{${variable}}}` + template.substring(end);
    
    onTemplateChange(newValue);
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = start + variable.length + 4; // +4 for {{}}
        textareaRef.current.setSelectionRange(newPosition, newPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Handle keydown for auto-completion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '{' && e.ctrlKey) {
      e.preventDefault();
      setShowSuggestions(true);
    }
  };

  // Filter suggestions based on current input
  const getFilteredSuggestions = (): VariableSuggestion[] => {
    if (!showSuggestions) return [];

    const currentWord = getCurrentWord();
    if (!currentWord) return variableSuggestions;

    return variableSuggestions.filter(suggestion =>
      suggestion.name.toLowerCase().includes(currentWord.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(currentWord.toLowerCase())
    );
  };

  // Get current word at cursor position
  const getCurrentWord = (): string => {
    if (!textareaRef.current) return '';
    
    const text = textareaRef.current.value;
    const cursor = textareaRef.current.selectionStart;
    
    // Find the start of the current word
    let start = cursor;
    while (start > 0 && /[\w.]/.test(text[start - 1])) {
      start--;
    }
    
    return text.substring(start, cursor);
  };

  // Add custom variable
  const addCustomVariable = () => {
    const newVariable: TemplateVariable = {
      name: `custom_${variables.length + 1}`,
      type: 'custom',
      value: '',
      isRequired: false,
      description: ''
    };
    onVariablesChange([...variables, newVariable]);
  };

  // Update variable
  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const newVariables = [...variables];
    newVariables[index] = { ...newVariables[index], ...updates };
    onVariablesChange(newVariables);
  };

  // Remove variable
  const removeVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index);
    onVariablesChange(newVariables);
  };

  // Get variable icon
  const getVariableIcon = (type: string) => {
    switch (type) {
      case 'location':
        return <MapPinIcon className="w-4 h-4" />;
      case 'campaign':
        return <BuildingOfficeIcon className="w-4 h-4" />;
      case 'custom':
        return <CodeBracketIcon className="w-4 h-4" />;
      default:
        return <DocumentTextIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Variable Editor</h3>
          <p className="text-sm text-neutral-600">
            Edit template variables with real-time preview and validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPreview ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'editor'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('variables')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'variables'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Variables
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Template Editor */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Template Content
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={template}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your template with variables like {{location.name}}..."
                    rows={8}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                  
                  {/* Variable Suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                      >
                        {getFilteredSuggestions().map((suggestion, index) => (
                          <button
                            key={suggestion.name}
                            onClick={() => {
                              insertVariable(suggestion.name);
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center gap-3"
                          >
                            {getVariableIcon(suggestion.type)}
                            <div className="flex-1">
                              <div className="font-medium text-neutral-900">{suggestion.name}</div>
                              <div className="text-sm text-neutral-600">{suggestion.description}</div>
                            </div>
                            <div className="text-xs text-neutral-500 font-mono">{suggestion.example}</div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="mt-2 text-xs text-neutral-500">
                  Press Ctrl+{ to show variable suggestions
                </div>
              </div>

              {/* Validation */}
              {!validation.isValid && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-700">Template Validation Errors</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700">Template Warnings</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Preview with Sample Data</h4>
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{getPreview()}</div>
                  </div>
                </div>
              </div>

              {/* Sample Data */}
              <div>
                <h4 className="text-sm font-medium text-neutral-700 mb-2">Sample Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sampleData.location && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Location</span>
                      </div>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div><strong>Name:</strong> {sampleData.location.name}</div>
                        <div><strong>City:</strong> {sampleData.location.city}</div>
                        <div><strong>State:</strong> {sampleData.location.state}</div>
                        <div><strong>Phone:</strong> {sampleData.location.phoneNumber}</div>
                      </div>
                    </div>
                  )}

                  {sampleData.campaign && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Campaign</span>
                      </div>
                      <div className="text-sm text-green-700 space-y-1">
                        <div><strong>Name:</strong> {sampleData.campaign.name}</div>
                        <div><strong>Objective:</strong> {sampleData.campaign.objective}</div>
                        <div><strong>Platform:</strong> {sampleData.campaign.platform}</div>
                        <div><strong>Budget:</strong> ${sampleData.campaign.budget}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'variables' && (
            <motion.div
              key="variables"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-700">Custom Variables</h4>
                <button
                  onClick={addCustomVariable}
                  className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Variable
                </button>
              </div>

              <div className="space-y-3">
                {variables.map((variable, index) => (
                  <div key={index} className="p-4 border border-neutral-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getVariableIcon(variable.type)}
                        <span className="font-medium text-neutral-900">{variable.name}</span>
                        {variable.isRequired && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeVariable(index)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Default Value
                        </label>
                        <input
                          type="text"
                          value={variable.value}
                          onChange={(e) => updateVariable(index, { value: e.target.value })}
                          placeholder="Enter default value"
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, { description: e.target.value })}
                          placeholder="Enter description"
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={variable.isRequired}
                          onChange={(e) => updateVariable(index, { isRequired: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-neutral-700">Required variable</span>
                      </label>
                    </div>
                  </div>
                ))}

                {variables.length === 0 && (
                  <div className="text-center py-8 text-neutral-500">
                    <CodeBracketIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                    <p>No custom variables defined</p>
                    <p className="text-sm">Click "Add Variable" to create custom variables</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}