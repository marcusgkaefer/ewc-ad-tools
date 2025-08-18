import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { LocationConfigModal } from "./components/ui/LocationConfigModal";
import AppHeader from "./components/ui/AppHeader";
import SimplifiedCampaignCreator from "./components/ui/SimplifiedCampaignCreator";
import type {
  LocationWithConfig,
} from "./types";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

function App() {
  const [showLocationConfigModal, setShowLocationConfigModal] = useState(false);
  const [selectedLocationToConfigure, setSelectedLocationToConfigure] = useState<LocationWithConfig | null>(null);
  const [showLocationConfigSuccess, setShowLocationConfigSuccess] = useState(false);
  const [configSuccessMessage, setConfigSuccessMessage] = useState("");
  const [showLocationConfigError, setShowLocationConfigError] = useState(false);
  const [configErrorMessage, setConfigErrorMessage] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-200/20 bg-size-[400%_400%] animate-gradient-shift">
      <div className="flex-1 p-6 relative z-10 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* App Header */}
          <AppHeader
            onSettingsClick={() => {
              // For simplified version, we need to trigger the settings modal from within that component
              // We'll use a custom event to communicate with the SimplifiedCampaignCreator
              window.dispatchEvent(new CustomEvent("openSettingsModal"));
            }}
          />

          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            <SimplifiedCampaignCreator />
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Location Configuration Modal */}
      {selectedLocationToConfigure && (
        <LocationConfigModal
          isOpen={showLocationConfigModal}
          onClose={() => {
            setShowLocationConfigModal(false);
            setSelectedLocationToConfigure(null);
          }}
          location={selectedLocationToConfigure}
          onSave={() => {
            // Show success notification
            setConfigSuccessMessage(
              `${
                selectedLocationToConfigure.name || "Location"
              } configuration saved successfully!`
            );
            setShowLocationConfigSuccess(true);
            setTimeout(() => setShowLocationConfigSuccess(false), 5000);

            setShowLocationConfigModal(false);
            setSelectedLocationToConfigure(null);
          }}
          onError={(error: string) => {
            setConfigErrorMessage(error);
            setShowLocationConfigError(true);
            setTimeout(() => setShowLocationConfigError(false), 5000);
          }}
        />
      )}

      {/* Location Configuration Notifications */}
      <AnimatePresence>
        {showLocationConfigSuccess && (
          <motion.div
            key="success-notification"
            initial={{ opacity: 0, x: -100, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100, y: 50 }}
            className="fixed bottom-6 left-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium">
                  {configSuccessMessage}
                </p>
              </div>
              <button
                onClick={() => setShowLocationConfigSuccess(false)}
                className="text-green-500 hover:text-green-700 transition-colors duration-200"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {showLocationConfigError && (
          <motion.div
            key="error-notification"
            initial={{ opacity: 0, x: -100, y: 50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100, y: 50 }}
            className="fixed bottom-6 left-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg z-50 max-w-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XMarkIcon className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-medium">{configErrorMessage}</p>
              </div>
              <button
                onClick={() => setShowLocationConfigError(false)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
