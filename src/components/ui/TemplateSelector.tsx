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
    <div className={`template-selector ${className}`}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <DocumentTextIcon className="icon-sm" />
          Template Selection
        </label>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', margin: '0' }}>
          Choose a template for your ad campaign
        </p>
      </div>

      {/* Selected Template Preview */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 'var(--space-lg)',
            background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
            border: '2px solid var(--primary-200)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-lg)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 'var(--space-sm)',
            color: 'var(--primary-600)'
          }}>
            <CheckCircleIconSolid className="icon-sm" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--primary-100)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <DocumentTextIcon style={{ width: '24px', height: '24px', color: 'var(--primary-600)' }} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', margin: 0 }}>
                  {selectedTemplate.name}
                </h3>
                {selectedTemplate.isCustom && (
                  <span style={{
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: 'var(--secondary-100)',
                    color: 'var(--secondary-700)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-full)'
                  }}>
                    Custom
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: 'var(--space-sm)' }}>
                <div><strong>Headline:</strong> {selectedTemplate.fields.headline}</div>
                <div style={{ marginTop: 'var(--space-xs)' }}>
                  <strong>Description:</strong> {selectedTemplate.fields.description}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{
                  padding: 'var(--space-xs) var(--space-sm)',
                  background: 'var(--primary-600)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-md)'
                }}>
                  {selectedTemplate.fields.callToAction}
                </span>
                
                <motion.button
                  onClick={() => setPreviewTemplate(selectedTemplate)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: 'var(--primary-700)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <EyeIcon style={{ width: '14px', height: '14px' }} />
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)'
        }}
      >
        {/* Existing Templates */}
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;
          const isHovered = hoveredTemplate === template.id;
          
          return (
            <motion.div
              key={template.id}
              variants={itemVariants}
              style={{
                position: 'relative',
                background: 'white',
                border: `2px solid ${isSelected ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-lg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered ? 'var(--shadow-xl)' : isSelected ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
              }}
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
                  style={{
                    position: 'absolute',
                    top: 'var(--space-md)',
                    right: 'var(--space-md)',
                    width: '24px',
                    height: '24px',
                    background: 'var(--primary-500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckCircleIcon style={{ width: '16px', height: '16px', color: 'white' }} />
                </motion.div>
              )}

              {/* Template Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: template.isCustom ? 'var(--secondary-100)' : 'var(--primary-100)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {template.isCustom ? (
                      <StarIcon style={{ width: '20px', height: '20px', color: 'var(--secondary-600)' }} />
                    ) : (
                      <DocumentTextIcon style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gray-900)', margin: 0 }}>
                        {template.name}
                      </h4>
                      {template.isCustom && (
                        <span style={{
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'var(--secondary-100)',
                          color: 'var(--secondary-700)',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          borderRadius: 'var(--radius-full)'
                        }}>
                          Custom
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', margin: 0, lineHeight: 1.4 }}>
                      {template.fields.description.length > 80 
                        ? `${template.fields.description.substring(0, 80)}...`
                        : template.fields.description
                      }
                    </p>
                  </div>
                </div>

                {/* Preview Content */}
                <div style={{
                  padding: 'var(--space-sm)',
                  background: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-100)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-700)', marginBottom: 'var(--space-xs)' }}>
                    <strong>Headline:</strong> {template.fields.headline.length > 40 
                      ? `${template.fields.headline.substring(0, 40)}...`
                      : template.fields.headline
                    }
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: 'var(--space-xs) var(--space-sm)',
                    background: isSelected ? 'var(--primary-100)' : 'var(--gray-200)',
                    color: isSelected ? 'var(--primary-700)' : 'var(--gray-700)',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <CursorArrowRippleIcon style={{ width: '12px', height: '12px', marginRight: 'var(--space-xs)' }} />
                    {template.fields.callToAction}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-xs)',
                      padding: 'var(--space-xs) var(--space-sm)',
                      background: isHovered ? 'var(--primary-50)' : 'transparent',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      color: 'var(--gray-600)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{ scale: 1.05, backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <EyeIcon style={{ width: '12px', height: '12px' }} />
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
          style={{
            background: 'linear-gradient(135deg, var(--primary-50), var(--secondary-50))',
            border: '2px dashed var(--primary-300)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-xl)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '200px'
          }}
          onClick={onCreateTemplate}
          whileHover={{ 
            scale: 1.02,
            borderColor: 'var(--primary-500)',
            backgroundColor: 'var(--primary-100)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            style={{
              width: '64px',
              height: '64px',
              background: 'var(--primary-100)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-md)'
            }}
            whileHover={{ 
              backgroundColor: 'var(--primary-200)',
              rotate: 180
            }}
            transition={{ duration: 0.3 }}
          >
            <PlusIcon style={{ width: '28px', height: '28px', color: 'var(--primary-600)' }} />
          </motion.div>
          
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--primary-700)', margin: 0, marginBottom: 'var(--space-sm)' }}>
            Create New Template
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--primary-600)', margin: 0, lineHeight: 1.4 }}>
            Design a custom template for your specific campaign needs
          </p>
          
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              marginTop: 'var(--space-md)',
              padding: 'var(--space-sm) var(--space-md)',
              background: 'var(--primary-500)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
            whileHover={{ backgroundColor: 'var(--primary-600)' }}
          >
            <SparklesIcon style={{ width: '16px', height: '16px' }} />
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
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-lg)',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '600px',
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                padding: 'var(--space-xl)',
                boxShadow: 'var(--shadow-2xl)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                  Template Preview
                </h3>
                <motion.button
                  onClick={() => setPreviewTemplate(null)}
                  style={{
                    padding: 'var(--space-sm)',
                    background: 'var(--gray-100)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer'
                  }}
                  whileHover={{ backgroundColor: 'var(--gray-200)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✕
                </motion.button>
              </div>

              <div style={{
                border: '2px solid var(--gray-200)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-xl)',
                background: 'var(--gray-50)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: previewTemplate.isCustom ? 'var(--secondary-100)' : 'var(--primary-100)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {previewTemplate.isCustom ? (
                      <StarIcon style={{ width: '24px', height: '24px', color: 'var(--secondary-600)' }} />
                    ) : (
                      <DocumentTextIcon style={{ width: '24px', height: '24px', color: 'var(--primary-600)' }} />
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', margin: 0 }}>
                      {previewTemplate.name}
                    </h4>
                    {previewTemplate.isCustom && (
                      <span style={{
                        padding: 'var(--space-xs) var(--space-sm)',
                        background: 'var(--secondary-100)',
                        color: 'var(--secondary-700)',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        borderRadius: 'var(--radius-full)'
                      }}>
                        Custom Template
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 'var(--space-xs)', display: 'block' }}>
                      Headline
                    </label>
                    <p style={{ fontSize: '1rem', color: 'var(--gray-900)', margin: 0, padding: 'var(--space-sm)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                      {previewTemplate.fields.headline}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 'var(--space-xs)', display: 'block' }}>
                      Description
                    </label>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-800)', margin: 0, padding: 'var(--space-sm)', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', lineHeight: 1.5 }}>
                      {previewTemplate.fields.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 'var(--space-xs)', display: 'block' }}>
                        Call to Action
                      </label>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'var(--primary-500)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}>
                        <CursorArrowRippleIcon style={{ width: '16px', height: '16px', marginRight: 'var(--space-xs)' }} />
                        {previewTemplate.fields.callToAction}
                      </div>
                    </div>

                    {previewTemplate.fields.imageUrl && (
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: 'var(--space-xs)', display: 'block' }}>
                          Image
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <PhotoIcon style={{ width: '16px', height: '16px', color: 'var(--gray-500)' }} />
                          <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Image provided</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)' }}>
                <motion.button
                  onClick={() => setPreviewTemplate(null)}
                  className="btn btn-secondary"
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
                  className="btn btn-primary"
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