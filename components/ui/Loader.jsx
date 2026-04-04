import React from 'react';
import { Loader as LucideLoader } from 'lucide-react';

export default function Loader({ className = "", size = 28, center = true }) {
  return (
    <div className={`${center ? 'flex items-center justify-center' : ''} ${className}`}>
      <LucideLoader size={size} className="animate-spin text-indigo-500" />
    </div>
  );
}
