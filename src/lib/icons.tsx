'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';

// Type for the component props
interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * DynamicIcon component that renders a Lucide icon based on the provided name
 * 
 * @param {string} name - The name of the Lucide icon to render
 * @param {string} className - Optional CSS class names
 * @param {number} size - Optional size in pixels
 * @param {string} color - Optional color
 * @param {number} strokeWidth - Optional stroke width
 * @returns React component
 */
const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  className, 
  size = 24, 
  color,
  strokeWidth = 2
}) => {
  // Get the icon component from Lucide
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons];
  
  // If the icon exists, render it with the provided props
  if (IconComponent) {
    return (
      <IconComponent 
        className={className} 
        size={size} 
        color={color}
        strokeWidth={strokeWidth}
      />
    );
  }
  
  // Fallback to a default icon if the requested one doesn't exist
  return <LucideIcons.HelpCircle className={className} size={size} color={color} strokeWidth={strokeWidth} />;
};

export default DynamicIcon;

// Export a list of all available icon names for use in selectors
export const availableIconNames = Object.keys(LucideIcons)
  .filter(key => {
    const value = LucideIcons[key as keyof typeof LucideIcons];
    // Check if it's a function (React components are functions)
    // and if its name starts with an uppercase letter (convention for components)
    // and it's not one of the known non-icon utility exports.
    return typeof value === 'function' &&
           key[0] === key[0].toUpperCase() && // Ensures PascalCase like 'Activity'
           !['LucideIcon', 'LucideProps', 'createLucideIcon'].includes(key); // Exclude non-icon exports
  })
  .sort();

