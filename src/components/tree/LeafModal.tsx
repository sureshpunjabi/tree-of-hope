'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Leaf {
  id: string;
  author_name: string;
  message: string;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
}

interface LeafModalProps {
  leaf: Leaf | null;
  onClose: () => void;
  isOpen: boolean;
}

export const LeafModal: React.FC<LeafModalProps> = ({
  leaf,
  onClose,
  isOpen,
}) => {
  if (!isOpen || !leaf) {
    return null;
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200"
        onClick={onClose}
        style={{
          animation: 'fade-in 0.3s ease-out',
        }}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'pointer-events-none'
        )}
      >
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-md pointer-events-auto transform transition-all duration-300"
          style={{
            animation: 'slide-up 0.4s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with accent bar */}
          <div className="bg-gradient-to-r from-amber-100 to-green-100 px-6 py-4 border-b border-green-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Message from</p>
                <h2 className="text-xl font-bold text-amber-900">
                  {leaf.author_name}
                </h2>
              </div>
              {/* Close button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Message content */}
          <div className="px-6 py-6">
            {/* Leaf accent */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <p className="text-xs text-gray-500 font-medium">
                {formatDate(leaf.created_at)}
              </p>
            </div>

            {/* Message text */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {leaf.message}
              </p>
            </div>

            {/* Bottom accent */}
            <div className="h-1 w-16 bg-gradient-to-r from-green-400 to-green-200 rounded-full" />
          </div>

          {/* Footer action */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex gap-3">
            <button
              onClick={onClose}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200',
                'bg-green-100 text-green-700 hover:bg-green-200 active:scale-95'
              )}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
