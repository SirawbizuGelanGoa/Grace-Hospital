'use client'; // Needed for hooks like useState, useEffect, useRouter

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Settings, User, LogOut, LayoutDashboard, ShieldAlert, Info, Wrench, Building2, Image as ImageIcon, Newspaper, Phone } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from '@/components/ui/skeleton';
import DynamicIcon from '@/lib/icons'; // Use DynamicIcon for potential future icon needs

// Very basic auth check using sessionStorage (NOT SECURE FOR PRODUCTION)
const checkAuth = () => {
   if (typeof window !== 'undefined') {
     return sessionStorage.getItem('isAdminAuthenticated') === 'true';
   }
   return false; // Assume not authenticated on server
 };


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null initial state

  useEffect(() => {
     const authStatus = checkAuth();
     setIsAuthenticated(authStatus);
    if (!authStatus && pathname !== '/admin/login') {
      console.log('User not authenticated, redirecting to login.');
      router.replace('/admin/login'); // Use replace to avoid login page in history
    }
  }, [router, pathname]); // Rerun on route change

  const handleLogout = () => {
     if (typeof window !== 'undefined') {
       sessionStorage.removeItem('isAdminAuthenticated');
     }
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

 // Display loading state while checking authentication
  if (isAuthenticated === null && pathname !== '/admin/login') {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                 <ShieldAlert className="h-12 w-12 text-primary animate-pulse" />
                 <p className="text-muted-foreground">Verifying access...</p>
                 <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
  }

  // If on the login page, don't render the sidebar layout
  if (pathname === '/admin/login') {
    return <>{children}<Toaster /></>; // Include Toaster for login page messages
  }

  // If authentication check finished and user is not authenticated (should have been redirected, but as fallback)
  if (!isAuthenticated) {
     // Optional: Can show a specific "Access Denied" message before redirect effect kicks in
     return (
         <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
                <ShieldAlert className="h-10 w-10 text-destructive" />
                <p className="text-lg font-semibold">Access Denied</p>
                <p className="text-muted-foreground text-sm">Redirecting to login...</p>
            </div>
        </div>
     );
  }


  // Render the admin layout for authenticated users
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 font-semibold text-lg text-sidebar-primary">
            <LayoutDashboard className="h-5 w-5"/>
            Admin Panel
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
               <SidebarMenuButton href="/admin" isActive={pathname === '/admin'} tooltip="Dashboard">
                 <Home />
                 Dashboard
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/about" isActive={pathname === '/admin/manage/about'} tooltip="Manage About Section">
                 <Info />
                  Manage About
               </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/services" isActive={pathname.startsWith('/admin/manage/services')} tooltip="Manage Services">
                 <Wrench />
                  Manage Services
               </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/facilities" isActive={pathname.startsWith('/admin/manage/facilities')} tooltip="Manage Facilities">
                 <Building2 />
                  Manage Facilities
               </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/departments" isActive={pathname.startsWith('/admin/manage/departments')} tooltip="Manage Departments">
                 {/* Using a more appropriate icon */}
                  <DynamicIcon name="ClipboardList" className="h-4 w-4 shrink-0" />
                  Manage Departments
               </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/gallery" isActive={pathname.startsWith('/admin/manage/gallery')} tooltip="Manage Gallery">
                 <ImageIcon />
                  Manage Gallery
               </SidebarMenuButton>
             </SidebarMenuItem>
              <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/news" isActive={pathname.startsWith('/admin/manage/news')} tooltip="Manage News & Events">
                 <Newspaper />
                  Manage News
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton href="/admin/manage/contact" isActive={pathname === '/admin/manage/contact'} tooltip="Manage Contact Info">
                 <Phone />
                  Manage Contact
               </SidebarMenuButton>
             </SidebarMenuItem>
             {/* Add more links for other sections if needed */}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {/* Example Footer Items (Commented out as per original) */}
            {/* <SidebarMenuItem>
               <SidebarMenuButton href="/admin/settings" isActive={pathname === '/admin/settings'} tooltip="Settings">
                 <Settings />
                 Settings
               </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
               <SidebarMenuButton href="/admin/profile" isActive={pathname === '/admin/profile'} tooltip="Profile">
                 <User />
                 Profile
               </SidebarMenuButton>
             </SidebarMenuItem> */}
             <SidebarMenuItem>
                 <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                     <LogOut />
                     Logout
                 </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <SidebarMenuButton href="/" tooltip="View Public Site" target="_blank" rel="noopener noreferrer">
                     <Home />
                     View Site
                 </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         {/* Main content area */}
        <div className="p-4 md:p-6 lg:p-8">
           {children}
        </div>
        <Toaster /> {/* Ensure Toaster is included for admin pages */}
      </SidebarInset>
    </SidebarProvider>
  );
}
