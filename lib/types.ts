// Auth related types
export type UserRole = 'SUPER_ADMIN' | 'COFFEE_SHOP_OWNER' | 'COFFEE_SHOP_MANAGER' | 'COFFEE_SHOP_STAFF';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  UserProfile: UserProfile[];
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRelations extends User {
  Brand?: any[];
  Location?: any[];
  LocationStaff?: any[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface InviteUserRequest {
  email: string;
}

export interface AssignUserToBrandRequest {
  userId: number;
  brandId: number;
}

export interface AssignUserToLocationRequest {
  userId: number;
  locationId: number;
  isManager: boolean;
}

// Brand related types
export interface Brand {
  id: number;
  name: string;
  ownerId: number;
  owner?: User;
  Location?: Location[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  name: string;
  ownerId?: number;
}

export interface UpdateBrandDto {
  name?: string;
}

export interface BrandState {
  brands: Brand[];
  selectedBrand: Brand | null;
  isLoading: boolean;
  error: string | null;
}

// Location related types
export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  placeId?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  geohash?: string;
  timezone?: string;
  accuracy?: number;
  managerId?: number;
  manager?: User;
  BrandId: number;
  Brand?: Brand;
  LocationStaff?: LocationStaff[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationStaff {
  id: number;
  email: string;
  role: UserRole;
  UserProfile: UserProfile[];
}

export interface CreateLocationDto {
  latitude: number;
  longitude: number;
  placeId?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  geohash?: string;
  timezone?: string;
  accuracy?: number;
  managerId?: number;
  BrandId: number;
}

export interface UpdateLocationDto {
  latitude?: number;
  longitude?: number;
  placeId?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  geohash?: string;
  timezone?: string;
  accuracy?: number;
  managerId?: number;
}

export interface LocationState {
  locations: Location[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
}

// Error response
export interface ApiError {
  status: number;
  data: {
    message: string;
    error?: string;
  };
} 