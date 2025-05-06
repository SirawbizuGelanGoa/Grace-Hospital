'use client'; // Allow usage in client components if needed, though primarily for server

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// Type guard to check if a key is a valid Lucide icon name
const isValidIconName = (name: string): name is keyof typeof LucideIcons => {
  return name in LucideIcons;
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (isValidIconName(name)) {
    const IconComponent = LucideIcons[name];
    // Ensure it's a component (functions are valid components in React)
    if (typeof IconComponent === 'function' || typeof IconComponent === 'object') {
       // @ts-ignore Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'typeof LucideIcons'.
       const ConcreteIconComponent = IconComponent as React.ElementType;
      return <ConcreteIconComponent {...props} />;
    }
  }

  // Fallback icon or null if the name is invalid or not a component
  console.warn(`Lucide icon "${name}" not found. Rendering fallback.`);
  const FallbackIcon = LucideIcons.HelpCircle; // Or any other default icon
  return <FallbackIcon {...props} />;
};

export default DynamicIcon;

// Function to get an icon component directly (useful in server components)
export const getLucideIcon = (name: string): React.ElementType | typeof LucideIcons.HelpCircle => {
    if (isValidIconName(name)) {
      const IconComponent = LucideIcons[name];
       if (typeof IconComponent === 'function' || typeof IconComponent === 'object') {
          // @ts-ignore
          return IconComponent as React.ElementType;
       }
    }
    console.warn(`Lucide icon "${name}" not found. Returning fallback.`);
    return LucideIcons.HelpCircle; // Fallback icon
}
