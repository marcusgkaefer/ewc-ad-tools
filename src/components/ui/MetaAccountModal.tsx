import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { metaApiService } from '../../services/metaApiService';
import { metaIntegrationService } from '../../services/metaIntegrationService';
import type { MetaAccount, MetaAuthState } from '../../types/meta';

interface MetaAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accountId: string, accountName: string) => void;
}

interface ConnectionStep {
  id: 'auth' | 'account' | 'permissions' | 'success';
  title: string;
  description: string;
}

const connectionSteps: ConnectionStep[] = [
  {
    id: 'auth',
    title: 'Connect Meta Account',
    description: 'Enter your Meta access token to connect your advertising account'
  },
  {
    id: 'account',
    title: 'Select Account',
    description: 'Choose which Meta advertising account to use'
  },
  {
    id: 'permissions',
    title: 'Verify Permissions',
    description: 'Confirm the required permissions are granted'
  },
  {
    id: 'success',
    title: 'Connection Successful',
    description: 'Your Meta account has been successfully connected'
  }
];

export default function MetaAccountModal({ isOpen, onClose, onSuccess }: MetaAccountModalProps) {
  const [currentStep, setCurrentStep] = useState<'auth' | 'account' | 'permissions' | 'success'>('auth');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<MetaAccount | null>(null);
  const [accounts, setAccounts] = useState<MetaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('auth');
      setAccessToken('');
      setShowToken(false);
      setSelectedAccount(null);
      setAccounts([]);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleTokenSubmit = async () => {
    if (!accessToken.trim()) {
      setError('Please enter your Meta access token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Test the token
      const isAuthenticated = await metaApiService.authenticate(accessToken);
      
      if (!isAuthenticated) {
        setError('Invalid access token. Please check your token and try again.');
        return;
      }

      // Get accounts
      const availableAccounts = await metaApiService.getAccounts();
      setAccounts(availableAccounts);
      
      if (availableAccounts.length === 1) {
        setSelectedAccount(availableAccounts[0]);
        setCurrentStep('permissions');
      } else {
        setCurrentStep('account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Meta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = (account: MetaAccount) => {
    setSelectedAccount(account);
    setCurrentStep('permissions');
  };

  const handlePermissionsConfirm = async () => {
    if (!selectedAccount) return;

    setIsLoading(true);
    setError(null);

    try {
      // Save account to database
      await metaIntegrationService.saveMetaAccount({
        user_id: 'current-user-id', // TODO: Get from auth context
        account_id: selectedAccount.account_id,
        account_name: selectedAccount.name,
        access_token: accessToken
      });

      // Sync ads
      await metaIntegrationService.syncMetaAds(selectedAccount.account_id);

      setCurrentStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess(selectedAccount.account_id, selectedAccount.name);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save account connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing during loading
    onClose();
  };

  const getStepIndex = (step: string) => {
    return connectionSteps.findIndex(s => s.id === step);
  };

  const isStepComplete = (step: string) => {
    const currentIndex = getStepIndex(currentStep);
    const stepIndex = getStepIndex(step);
    return stepIndex < currentIndex;
  };

  const isStepActive = (step: string) => {
    return step === currentStep;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Connect Meta Account</h2>
                  <p className="text-sm text-neutral-600">Link your Meta advertising account</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 py-4 bg-neutral-50">
              <div className="flex items-center justify-between">
                {connectionSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                          isStepComplete(step.id)
                            ? 'bg-green-100 text-green-600'
                            : isStepActive(step.id)
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        {isStepComplete(step.id) ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-neutral-900">{step.title}</div>
                        <div className="text-xs text-neutral-500">{step.description}</div>
                      </div>
                    </div>
                    {index < connectionSteps.length - 1 && (
                      <div className="flex-1 h-px bg-neutral-300 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {currentStep === 'auth' && (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Enter Meta Access Token
                      </h3>
                      <p className="text-sm text-neutral-600 mb-4">
                        You'll need to generate an access token from Meta Business Manager. 
                        Make sure it has the following permissions: ads_management, ads_read
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Access Token
                        </label>
                        <div className="relative">
                          <input
                            type={showToken ? 'text' : 'password'}
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="Enter your Meta access token"
                            className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600"
                          >
                            {showToken ? (
                              <EyeSlashIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-red-700">{error}</span>
                        </div>
                      )}

                      <button
                        onClick={handleTokenSubmit}
                        disabled={isLoading || !accessToken.trim()}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            Connect Account
                            <ArrowRightIcon className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Select Advertising Account
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Choose which Meta advertising account you'd like to connect
                      </p>
                    </div>

                    <div className="space-y-3">
                      {accounts.map((account) => (
                        <button
                          key={account.account_id}
                          onClick={() => handleAccountSelect(account)}
                          className="w-full p-4 border border-neutral-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-neutral-900">{account.name}</div>
                              <div className="text-sm text-neutral-600">
                                Account ID: {account.account_id}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {account.business_name && `Business: ${account.business_name}`}
                              </div>
                            </div>
                            <ArrowRightIcon className="w-5 h-5 text-neutral-400" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 'permissions' && selectedAccount && (
                  <motion.div
                    key="permissions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Verify Permissions
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Confirm that your access token has the required permissions
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                          <div className="font-semibold text-blue-900">{selectedAccount.name}</div>
                        </div>
                        <div className="text-sm text-blue-700">
                          <div>Account ID: {selectedAccount.account_id}</div>
                          {selectedAccount.business_name && (
                            <div>Business: {selectedAccount.business_name}</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">ads_management</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircleIcon className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-green-700">ads_read</span>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-red-700">{error}</span>
                        </div>
                      )}

                      <button
                        onClick={handlePermissionsConfirm}
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            Complete Connection
                            <CheckCircleIcon className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                      <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        Connection Successful!
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Your Meta account has been successfully connected and your ads are being synced.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}