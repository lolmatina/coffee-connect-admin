'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import React, { useEffect, useState } from 'react'
import SidebarHeaderButton from './header'
import { getSidebarItems, SidebarItem } from '@/lib/hooks/get-sidebar-items'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/lib/hooks'
import { selectIsAuthenticated } from '@/lib/slices/authSlice'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogoutMutation } from '@/lib/api/authApi'
import { clearCredentials } from '@/lib/slices/authSlice'
import { useRouter } from 'next/navigation'

function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setShowSidebar(isAuthenticated && pathname !== '/auth');
    }
  }, [isAuthenticated, pathname, mounted]);

  useEffect(() => {
    if (isAuthenticated && mounted) {
      const items = getSidebarItems();
      setSidebarItems(items);
    }
  }, [isAuthenticated, mounted]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      router.push('/auth');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (!mounted) return null;
  
  if (!showSidebar) return null;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarHeaderButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url} passHref>
                    <SidebarMenuButton>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar