"use client";

export default function Modal({ isOpen, onClose, title, content }) {
  if (!isOpen) return null;

  const css = {
    opacity: 0.75
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black"
        style={css}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl mx-4 max-w-sm w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-violet-500 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-violet-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <p className="text-gray-600 leading-relaxed text-sm">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}