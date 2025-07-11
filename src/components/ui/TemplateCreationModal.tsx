import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PlusIcon, 
  DocumentTextIcon,
  LinkIcon,
  PhotoIcon,
  CursorArrowRippleIcon,
  CheckIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import type { CreateTemplateRequest } from '../../types';

interface TemplateCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (templateData: CreateTemplateRequest) => Promise<void>;
  isSubmitting: boolean;
}

const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    type: 'custom',
    fields: {
      headline: '',
      description: '',
      callToAction: '',
      imageUrl: '',
      landingPageUrl: ''
    },
    variables: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formData.fields.headline.trim()) {
      newErrors.headline = 'Headline is required';
    }
    
    if (!formData.fields.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.fields.callToAction.trim()) {
      newErrors.callToAction = 'Call to action is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        type: 'custom',
        fields: {
          headline: '',
          description: '',
          callToAction: '',
          imageUrl: '',
          landingPageUrl: ''
        },
        variables: []
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const quickTemplates = [
    {
      name: 'Promotional',
      headline: 'Special Offer at {{location.name}}!',
      description: 'Visit our {{location.city}} location for exclusive deals and amazing service.',
      callToAction: 'Visit Us Today'
    },
    {
      name: 'Service',
      headline: 'Now Serving {{location.city}}!',
      description: 'We\'re excited to serve {{location.city}} with our premium services.',
      callToAction: 'Learn More'
    },
    {
      name: 'Location',
      headline: 'Find Us in {{location.city}}',
      description: 'Visit us at {{location.address}} or call {{location.phone}}.',
      callToAction: 'Get Directions'
    }
  ];

  const applyQuickTemplate = (template: typeof quickTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name + ' Template',
      fields: {
        ...prev.fields,
        headline: template.headline,
        description: template.description,
        callToAction: template.callToAction
      }
    }));
    setCurrentStep(2);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-2xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: 'var(--space-xl)', 
              borderBottom: '1px solid var(--gray-200)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{ 
                  padding: 'var(--space-sm)', 
                  background: 'var(--primary-100)', 
                  borderRadius: 'var(--radius-lg)' 
                }}>
                  <SparklesIcon style={{ width: '20px', height: '20px', color: 'var(--primary-600)' }} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: 'var(--gray-900)', 
                    margin: 0 
                  }}>
                    Create Custom Template
                  </h2>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--gray-500)', 
                    margin: 0 
                  }}>
                    Step {currentStep} of 3
                  </p>
                </div>
              </div>
              <motion.button
                onClick={handleClose}
                style={{
                  padding: 'var(--space-sm)',
                  color: 'var(--gray-400)',
                  background: 'none',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                  backgroundColor: 'var(--gray-100)',
                  color: 'var(--gray-600)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon style={{ width: '24px', height: '24px' }} />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div style={{ 
              padding: 'var(--space-lg) var(--space-xl)', 
              borderBottom: '1px solid var(--gray-100)' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: 'var(--space-sm)' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentStep >= 1 ? 'var(--primary-500)' : 'var(--gray-300)'
                  }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: currentStep >= 1 ? 'var(--primary-600)' : 'var(--gray-400)'
                  }}>
                    Quick Start
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentStep >= 2 ? 'var(--primary-500)' : 'var(--gray-300)'
                  }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: currentStep >= 2 ? 'var(--primary-600)' : 'var(--gray-400)'
                  }}>
                    Customize
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: currentStep >= 3 ? 'var(--primary-500)' : 'var(--gray-300)'
                  }} />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: currentStep >= 3 ? 'var(--primary-600)' : 'var(--gray-400)'
                  }}>
                    Review
                  </span>
                </div>
              </div>
              <div style={{ 
                width: '100%', 
                background: 'var(--gray-200)', 
                borderRadius: 'var(--radius-full)', 
                height: '4px' 
              }}>
                <div 
                  style={{ 
                    background: 'var(--primary-500)', 
                    height: '4px', 
                    borderRadius: 'var(--radius-full)', 
                    transition: 'width 0.3s ease',
                    width: `${(currentStep / 3) * 100}%`
                  }}
                />
              </div>
            </div>

            <div style={{ padding: 'var(--space-xl)' }}>
              {/* Step 1: Quick Start */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: 'var(--gray-900)', 
                      marginBottom: 'var(--space-sm)' 
                    }}>
                      Choose a starting point
                    </h3>
                    <p style={{ color: 'var(--gray-600)' }}>
                      Pick a template type or start from scratch
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {quickTemplates.map((template, index) => (
                      <motion.button
                        key={index}
                        onClick={() => applyQuickTemplate(template)}
                        style={{
                          padding: 'var(--space-lg)',
                          border: '1px solid var(--gray-200)',
                          borderRadius: 'var(--radius-xl)',
                          background: 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s ease'
                        }}
                        whileHover={{ 
                          scale: 1.02,
                          borderColor: 'var(--primary-300)',
                          backgroundColor: 'var(--primary-50)'
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          justifyContent: 'space-between' 
                        }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ 
                              fontWeight: 500, 
                              color: 'var(--gray-900)', 
                              marginBottom: 'var(--space-sm)' 
                            }}>
                              {template.name}
                            </h4>
                            <p style={{ 
                              fontSize: '0.875rem', 
                              color: 'var(--gray-600)', 
                              marginBottom: 'var(--space-sm)' 
                            }}>
                              {template.description}
                            </p>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: 'var(--space-xs) var(--space-sm)',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              background: 'var(--primary-100)',
                              color: 'var(--primary-700)',
                              fontWeight: 500
                            }}>
                              {template.callToAction}
                            </span>
                          </div>
                          <ArrowRightIcon style={{ 
                            width: '20px', 
                            height: '20px', 
                            color: 'var(--gray-400)' 
                          }} />
                        </div>
                      </motion.button>
                    ))}

                    <motion.button
                      onClick={() => setCurrentStep(2)}
                      style={{
                        padding: 'var(--space-lg)',
                        border: '2px dashed var(--gray-300)',
                        borderRadius: 'var(--radius-xl)',
                        background: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        borderColor: 'var(--primary-300)',
                        backgroundColor: 'var(--primary-50)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <PlusIcon style={{ 
                        width: '32px', 
                        height: '32px', 
                        color: 'var(--gray-400)', 
                        margin: '0 auto var(--space-sm)' 
                      }} />
                      <h4 style={{ 
                        fontWeight: 500, 
                        color: 'var(--gray-900)', 
                        marginBottom: 'var(--space-xs)' 
                      }}>
                        Start from scratch
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--gray-600)', 
                        margin: 0 
                      }}>
                        Create a completely custom template
                      </p>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Customize */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: 'var(--gray-900)', 
                      marginBottom: 'var(--space-sm)' 
                    }}>
                      Customize your template
                    </h3>
                    <p style={{ color: 'var(--gray-600)' }}>
                      Fill in the details for your ad template
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="form-group">
                      <label className="form-label">Template Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="form-input"
                        placeholder="Enter template name..."
                      />
                      {errors.name && (
                        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--error-500)' }}>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <DocumentTextIcon className="icon-sm" style={{ marginRight: 'var(--space-sm)' }} />
                        Headline
                      </label>
                      <input
                        type="text"
                        value={formData.fields.headline}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          fields: { ...prev.fields, headline: e.target.value }
                        }))}
                        className="form-input"
                        placeholder="Enter headline..."
                      />
                      {errors.headline && (
                        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--error-500)' }}>
                          {errors.headline}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        value={formData.fields.description}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          fields: { ...prev.fields, description: e.target.value }
                        }))}
                        className="form-input"
                        rows={3}
                        placeholder="Enter description..."
                      />
                      {errors.description && (
                        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--error-500)' }}>
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <CursorArrowRippleIcon className="icon-sm" style={{ marginRight: 'var(--space-sm)' }} />
                        Call to Action
                      </label>
                      <input
                        type="text"
                        value={formData.fields.callToAction}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          fields: { ...prev.fields, callToAction: e.target.value }
                        }))}
                        className="form-input"
                        placeholder="Enter call to action..."
                      />
                      {errors.callToAction && (
                        <p style={{ marginTop: 'var(--space-xs)', fontSize: '0.875rem', color: 'var(--error-500)' }}>
                          {errors.callToAction}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
                      <div className="form-group">
                        <label className="form-label">
                          <PhotoIcon className="icon-sm" style={{ marginRight: 'var(--space-sm)' }} />
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.fields.imageUrl}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            fields: { ...prev.fields, imageUrl: e.target.value }
                          }))}
                          className="form-input"
                          placeholder="Enter image URL..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <LinkIcon className="icon-sm" style={{ marginRight: 'var(--space-sm)' }} />
                          Landing Page URL
                        </label>
                        <input
                          type="url"
                          value={formData.fields.landingPageUrl}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            fields: { ...prev.fields, landingPageUrl: e.target.value }
                          }))}
                          className="form-input"
                          placeholder="Enter landing page URL..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 600, 
                      color: 'var(--gray-900)', 
                      marginBottom: 'var(--space-sm)' 
                    }}>
                      Review your template
                    </h3>
                    <p style={{ color: 'var(--gray-600)' }}>
                      Double-check everything looks good
                    </p>
                  </div>

                  <div style={{ 
                    background: 'var(--gray-50)', 
                    borderRadius: 'var(--radius-xl)', 
                    padding: 'var(--space-xl)',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <h4 style={{ 
                      fontWeight: 500, 
                      color: 'var(--gray-900)', 
                      marginBottom: 'var(--space-lg)' 
                    }}>
                      {formData.name}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Headline:</span>
                        <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-xs)', margin: 0 }}>
                          {formData.fields.headline}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Description:</span>
                        <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-xs)', margin: 0 }}>
                          {formData.fields.description}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Call to Action:</span>
                        <p style={{ color: 'var(--gray-600)', marginTop: 'var(--space-xs)', margin: 0 }}>
                          {formData.fields.callToAction}
                        </p>
                      </div>
                      {formData.fields.imageUrl && (
                        <div>
                          <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Image URL:</span>
                          <p style={{ 
                            color: 'var(--gray-600)', 
                            marginTop: 'var(--space-xs)', 
                            margin: 0,
                            wordBreak: 'break-all'
                          }}>
                            {formData.fields.imageUrl}
                          </p>
                        </div>
                      )}
                      {formData.fields.landingPageUrl && (
                        <div>
                          <span style={{ fontWeight: 500, color: 'var(--gray-700)' }}>Landing Page:</span>
                          <p style={{ 
                            color: 'var(--gray-600)', 
                            marginTop: 'var(--space-xs)', 
                            margin: 0,
                            wordBreak: 'break-all'
                          }}>
                            {formData.fields.landingPageUrl}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                paddingTop: 'var(--space-xl)', 
                borderTop: '1px solid var(--gray-100)' 
              }}>
                <button
                  type="button"
                  onClick={currentStep === 1 ? handleClose : prevStep}
                  className="btn btn-secondary"
                  style={{ padding: 'var(--space-sm) var(--space-lg)' }}
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>
                
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-primary"
                      style={{ 
                        padding: 'var(--space-sm) var(--space-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next
                      <ArrowRightIcon className="icon-sm" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn btn-primary"
                      style={{ 
                        padding: 'var(--space-sm) var(--space-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-sm)',
                        opacity: isSubmitting ? 0.7 : 1,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer'
                      }}
                      whileHover={!isSubmitting ? { scale: 1.05 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                    >
                      {isSubmitting ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid white',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="icon-sm" />
                          Create Template
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateCreationModal; 