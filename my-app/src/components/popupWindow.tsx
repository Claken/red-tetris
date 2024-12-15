import React from 'react';

interface PopupProps {
  show: boolean;
  title: string;
  children: any;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ show, title, children, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-gray-900 rounded-lg shadow-lg w-96 p-6 border-gray-400 border-4">
        <h2 className="text-xl text-white truncate font-bold mb-4 text-center">{title}</h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-200 hover:text-gray-400"
        >
          X
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Popup;
