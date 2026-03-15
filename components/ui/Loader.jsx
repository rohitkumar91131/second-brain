import React from 'react';
import { Loader as LucideLoader } from 'lucide-react';

export default function Loader({ className = "", size = 28 }) {
  return (
    <div className={`flex items-center justify-center h-full w-full ${className}`}>
      <LucideLoader size={size} className="animate-spin text-indigo-500" />
    </div>
  );
}
