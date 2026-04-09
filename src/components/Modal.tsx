import React from 'react';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  title?: string;
}

export function Modal({ children, isOpen, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
