import { Calendar, Home, MapPin, Settings, User, Coffee } from "lucide-react"
import { Role } from "../enums"
import { store } from "../store"
import { LucideIcon } from "lucide-react"

// Define the type for sidebar items
export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
}

const getSuperAdminSidebarItems = (): SidebarItem[] => {
    return [
        {
            title: 'Dashboard',
            icon: Home,
            url: '/dashboard',
        },
        {
            title: 'Brands',
            icon: Settings,
            url: '/brand',
        },
        {
            title: 'Locations',
            icon: MapPin,
            url: '/locations',
        },
        {
            title: 'Users',
            icon: User, 
            url: '/users',
        },
        {
            title: 'Menu',
            icon: Coffee,
            url: '/menu',
        }
    ]
}

const getCoffeeShopOwnerSidebarItems = (): SidebarItem[] => {
    return [
        {
            title: 'Dashboard',
            icon: Home,
            url: '/dashboard',
        },
        {
            title: 'Brands',
            icon: Settings,
            url: '/brand',
        },
        {
            title: 'Locations',
            icon: MapPin,
            url: '/locations',
        },
        {
            title: 'Users',
            icon: User,
            url: '/users',
        },
        {
            title: 'Menu',
            icon: Coffee,
            url: '/menu',
        },
        {
            title: 'Orders',
            icon: Calendar,
            url: '/orders',
        },
        {
            title: 'Profile',
            icon: User,
            url: '/profile',
        }
    ]
}

const getCoffeeShopManagerSidebarItems = (): SidebarItem[] => {
    return [
        {
            title: 'Dashboard',
            icon: Home,
            url: '/dashboard',
        }, {
            title: 'My location',
            icon: MapPin,
            url: '/my-location',
        }, {
            title: 'Menu',
            icon: Coffee,
            url: '/menu',
        },
        {
            title: 'Orders',
            icon: Calendar,
            url: '/orders',
        },
        {
            title: 'Profile',
            icon: User,
            url: '/profile',
        }
    ]
}

const getStaffSidebarItems = (): SidebarItem[] => {
    return [
        {
            title: 'Orders',
            icon: Calendar,
            url: '/orders',
        },
        {
            title: 'Profile',
            icon: User,
            url: '/profile',
        }
    ]
}

export const getSidebarItems = (): SidebarItem[] => {
    // Get the user role from the auth slice
    const state = store.getState();
    const user = state.auth.user;
    
    // If no user or role, return empty array
    if (!user) {
        return [];
    }
    
    // Convert the role string to the enum value
    let userRole;
    switch (user.role) {
        case 'SUPER_ADMIN':
            userRole = Role.SUPER_ADMIN;
            break;
        case 'COFFEE_SHOP_OWNER':
            userRole = Role.COFFEE_SHOP_OWNER;
            break;
        case 'COFFEE_SHOP_MANAGER':
            userRole = Role.COFFEE_SHOP_MANAGER;
            break;
        case 'COFFEE_SHOP_STAFF':
            userRole = Role.COFFEE_SHOP_STAFF;
            break;
        default:
            return [];
    }
    
    switch (userRole) {
        case Role.SUPER_ADMIN:
            return getSuperAdminSidebarItems()
        case Role.COFFEE_SHOP_OWNER:
            return getCoffeeShopOwnerSidebarItems()
        case Role.COFFEE_SHOP_MANAGER:
            return getCoffeeShopManagerSidebarItems()
        case Role.COFFEE_SHOP_STAFF:
            return getStaffSidebarItems()
        default:
            return []
    }
}

