import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  EyeIcon,
  SparklesIcon,
  DocumentTextIcon,
  CursorArrowRippleIcon,
  PhotoIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import type { AdTemplate } from '../../types';

interface TemplateSelectorProps {
  templates: AdTemplate[];
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  onCreateTemplate: () => void;
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onTemplateSelect,
  onCreateTemplate,
  className = ''
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AdTemplate | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, damping: 20, stiffness: 300 }
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <label className="flex items-center gap-2 block font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
          <DocumentTextIcon className="w-4 h-4" />
          Template Selection
        </label>
        <p className="text-sm text-gray-600 m-0">
          Choose a template for your ad campaign
        </p>
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 text-blue-600">
            <CheckCircleIconSolid className="w-4 h-4" />
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900 m-0">
                  {selectedTemplate.name}
                </h3>
                {selectedTemplate.isCustom && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Custom
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                <div><strong>Headline:</strong> {selectedTemplate.fields.headline}</div>
                <div className="mt-1">
                  <strong>Description:</strong> {selectedTemplate.fields.description}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">
                  {selectedTemplate.fields.callToAction}
                </span>
                
                <motion.button
                  onClick={() => setPreviewTemplate(selectedTemplate)}
                  className="flex items-center gap-1 px-2 py-1 bg-white/80 border border-blue-200 rounded-lg text-xs text-blue-700 cursor-pointer transition-all duration-200 hover:bg-white hover:border-blue-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  Preview
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Template Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        {/* Existing Templates */}
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          const isHovered = hoveredTemplate === template.id;
          
          return (
            <motion.div
              key={template.id}
              variants={itemVariants}
              className={`relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 shadow-sm'
              } ${
                isHovered ? '-translate-y-1 shadow-xl' : ''
              }`}
              onClick={() => onTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Template Content */}
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    template.isCustom ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {template.isCustom ? (
                      <StarIcon className="w-5 h-5 text-purple-600" />
                    ) : (
                      <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 m-0">
                        {template.name}
                      </h4>
                      {template.isCustom && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 m-0 leading-relaxed">
                      {template.fields.description.length > 80 
                        ? `${template.fields.description.substring(0, 80)}...`
                        : template.fields.description
                      }
                    </p>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-700 mb-1">
                    <strong>Headline:</strong> {template.fields.headline.length > 40 
                      ? `${template.fields.headline.substring(0, 40)}...`
                      : template.fields.headline
                    }
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    <CursorArrowRippleIcon className="w-3 h-3 mr-1" />
                    {template.fields.callToAction}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer transition-all duration-200 ${
                      isHovered ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-transparent'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EyeIcon className="w-3 h-3" />
                    Preview
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Create New Template Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-2xl p-8 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[200px] hover:border-blue-500 hover:bg-blue-100"
          onClick={onCreateTemplate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
            whileHover={{ 
              backgroundColor: '#dbeafe',
              rotate: 180
            }}
            transition={{ duration: 0.3 }}
          >
            <PlusIcon className="w-7 h-7 text-blue-600" />
          </motion.div>
          
          <h4 className="text-base font-semibold text-blue-700 m-0 mb-2">
            Create New Template
          </h4>
          <p className="text-sm text-blue-600 m-0 leading-relaxed">
            Design a custom template for your specific campaign needs
          </p>
          
          <motion.div
            className="flex items-center gap-1 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
            whileHover={{ backgroundColor: '#2563eb' }}
          >
            <SparklesIcon className="w-4 h-4" />
            Get Started
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 m-0">
                  Template Preview
                </h3>
                <motion.button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 bg-gray-100 border-none rounded-lg cursor-pointer hover:bg-gray-200"
                  whileTap={{ scale: 0.95 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="border-2 border-gray-200 rounded-2xl p-8 bg-gray-50">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    previewTemplate.isCustom ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {previewTemplate.isCustom ? (
                      <StarIcon className="w-6 h-6 text-purple-600" />
                    ) : (
                      <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 m-0">
                      {previewTemplate.name}
                    </h4>
                    {previewTemplate.isCustom && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Custom Template
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Headline
                    </label>
                    <p className="text-base text-gray-900 m-0 p-2 bg-white rounded-lg border border-gray-200">
                      {previewTemplate.fields.headline}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                      Description
                    </label>
                    <p className="text-sm text-gray-800 m-0 p-2 bg-white rounded-lg border border-gray-200 leading-relaxed">
                      {previewTemplate.fields.description}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Call to Action
                      </label>
                      <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
                        <CursorArrowRippleIcon className="w-4 h-4 mr-1" />
                        {previewTemplate.fields.callToAction}
                      </div>
                    </div>

                    {previewTemplate.fields.imageUrl && (
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-gray-700 mb-1 block">
                          Image
                        </label>
                        <div className="flex items-center gap-2">
                          <PhotoIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Image provided</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <motion.button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    onTemplateSelect(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Select This Template
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateSelector; 