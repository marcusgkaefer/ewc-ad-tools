// Component: ResultsStep
// Purpose: Display campaign generation results and provide file download options
// Props: Generation results, campaign data, and action callbacks
// State: Download progress and file preview state
// Dependencies: React, Framer Motion, Heroicons, FilePreview component

import { ArrowDownTrayIcon as DownloadIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useState } from 'react';

import type {
  CampaignConfiguration,
  LocationWithConfig,
  GenerationJob,
} from '../../types';
import FilePreview from '../ui/FilePreview';

interface ResultsStepProps {
  campaignConfig: CampaignConfiguration;
  selectedLocations: LocationWithConfig[];
  generationJob: GenerationJob | null;
  onBack: () => void;
  onRestart: () => void;
  onDownloadAll: () => void;
  onPreviewFile: (fileUrl: string, fileName: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function ResultsStep({
  campaignConfig,
  selectedLocations,
  generationJob,
  onBack,
  onRestart,
  onDownloadAll,
  onPreviewFile,
}: ResultsStepProps) {
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    setPreviewFile({ url: fileUrl, name: fileName });
    setShowFilePreview(true);
    onPreviewFile(fileUrl, fileName);
  };

  const closeFilePreview = () => {
    setShowFilePreview(false);
    setPreviewFile(null);
  };

  const totalBudget = campaignConfig.budget * selectedLocations.length;
  const isGenerating = !generationJob || generationJob.status === 'processing';
  const isComplete = generationJob?.status === 'completed';
  const hasError = generationJob?.status === 'failed';

  if (isGenerating) {
    return (
      <motion.div
        key="generating"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-4xl mx-auto"
      >
        <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                <ArrowPathIcon className="w-10 h-10 text-primary-600 animate-spin" />
              </div>
              <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
                Generating Campaign Files
              </h2>
              <p className="text-neutral-600 text-lg">
                Creating campaign files for {selectedLocations.length}{' '}
                locations...
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-2xl border border-primary-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-800">
                    {selectedLocations.length}
                  </div>
                  <div className="text-sm text-primary-600">Locations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-800">
                    {campaignConfig.ads.length}
                  </div>
                  <div className="text-sm text-primary-600">Ads</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-800">
                    ${totalBudget.toFixed(2)}
                  </div>
                  <div className="text-sm text-primary-600">Daily Budget</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-neutral-500">
              This may take a few minutes depending on the number of locations
              and ads.
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (hasError) {
    return (
      <motion.div
        key="error"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-4xl mx-auto"
      >
        <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XMarkIcon className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-red-600 mb-4">
                Generation Failed
              </h2>
              <p className="text-neutral-600 text-lg">
                {generationJob?.error ||
                  'An error occurred while generating campaign files.'}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={onBack}
                className="px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-xl font-medium transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50"
              >
                Go Back
              </button>
              <button
                onClick={onRestart}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium transition-all duration-300 hover:bg-primary-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!isComplete || !generationJob?.files) {
    return null;
  }

  return (
    <>
      <motion.div
        key="results"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-6xl mx-auto"
      >
        <div className="card-premium rounded-3xl p-10 shadow-elegant transition-all duration-300 hover:shadow-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full mb-4">
              <CheckCircleIcon className="w-10 h-10 text-success-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gradient-professional mb-4">
              Campaign Generated Successfully!
            </h2>
            <p className="text-neutral-600 text-lg">
              Your campaign files are ready for download.
            </p>
          </div>

          {/* Success Summary */}
          <div className="bg-gradient-to-r from-success-50 to-green-50 p-6 rounded-2xl border border-success-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-success-800">
                  {selectedLocations.length}
                </div>
                <div className="text-sm text-success-600">Locations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-800">
                  {campaignConfig.ads.length}
                </div>
                <div className="text-sm text-success-600">Ads Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-800">
                  {generationJob.files.length}
                </div>
                <div className="text-sm text-success-600">Files Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-800">
                  ${totalBudget.toFixed(2)}
                </div>
                <div className="text-sm text-success-600">Daily Budget</div>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-900 mb-4">
              Generated Files
            </h3>
            <div className="grid gap-4">
              {generationJob.files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white border-2 border-neutral-200 rounded-xl hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DocumentArrowDownIcon className="w-5 h-5 text-neutral-400" />
                    <div>
                      <div className="font-medium text-neutral-900">
                        {file.name}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {file.size
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : 'Unknown size'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreviewFile(file.url, file.name)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview file"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onDownloadAll}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-success-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-success-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <DownloadIcon className="w-5 h-5" />
              Download All Files
            </button>
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-300 text-primary-700 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all duration-300"
            >
              <SparklesIcon className="w-5 h-5" />
              Create New Campaign
            </button>
          </div>
        </div>
      </motion.div>

      {/* File Preview Modal */}
      {showFilePreview && previewFile && (
        <FilePreview
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          onClose={closeFilePreview}
        />
      )}
    </>
  );
}
