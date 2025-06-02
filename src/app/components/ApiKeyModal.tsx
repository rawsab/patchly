import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ApiKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
};

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(apiKey);
    setApiKey('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            style={{ zIndex: 99999 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              duration: 0.2,
              ease: [0.16, 1, 0.3, 1], // Custom ease curve for smooth animation
            }}
            className="fixed inset-0 z-[100000] flex items-center justify-center"
          >
            <div
              className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 border border-[#D1D5E8]"
              style={{ letterSpacing: '-0.025em' }}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>

              <h2 className="text-xl font-semibold mb-2 text-[#202020]">Add API Key</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your OpenAI API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D1D5E8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#687BED] focus:border-transparent"
                    placeholder="sk-..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#687BED] hover:bg-[#5A6BD9] rounded-lg transition-colors border border-[#5A6BD9]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
