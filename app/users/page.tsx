'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { 
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserProfileMutation,
  useDeleteUserMutation,
  useAssignUserToBrandMutation,
  useAssignUserToLocationMutation,
  GetUsersParams
} from '@/lib/api/usersApi';
import { useGetBrandsQuery } from '@/lib/api/brandsApi';
import { useGetLocationsQuery } from '@/lib/api/locationsApi';
import { selectUserLoading, selectUserError } from '@/lib/slices/userSlice';
import { 
  User, 
  UserRole, 
  Brand, 
  Location, 
  UpdateUserProfileRequest 
} from '@/lib/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Pencil, 
  Trash2, 
  UserPlus, 
  Store, 
  MapPin, 
  User as UserIcon,
  Briefcase 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleBadgeStyles = {
    'SUPER_ADMIN': 'bg-red-100 text-red-800',
    'COFFEE_SHOP_OWNER': 'bg-purple-100 text-purple-800',
    'COFFEE_SHOP_MANAGER': 'bg-blue-100 text-blue-800',
    'COFFEE_SHOP_STAFF': 'bg-green-100 text-green-800',
  };
  
  const roleStyle = roleBadgeStyles[role] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleStyle}`}>
      {role.replace(/_/g, ' ')}
    </span>
  );
};

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignBrandDialogOpen, setIsAssignBrandDialogOpen] = useState(false);
  const [isAssignLocationDialogOpen, setIsAssignLocationDialogOpen] = useState(false);
  
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isLoading = useAppSelector(selectUserLoading);
  const userError = useAppSelector(selectUserError);
  
  const { data: users = [] } = useGetUsersQuery(
    roleFilter ? { roleFilter } : undefined
  );
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: selectedUserDetails } = useGetUserByIdQuery(
    selectedUser?.id || 0, 
    { skip: !selectedUser || !isViewDialogOpen }
  );
  
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [assignUserToBrand, { isLoading: isAssigningBrand }] = useAssignUserToBrandMutation();
  const [assignUserToLocation, { isLoading: isAssigningLocation }] = useAssignUserToLocationMutation();
  
  const availableRoles = [
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
    { value: 'COFFEE_SHOP_OWNER', label: 'Coffee Shop Owner' },
    { value: 'COFFEE_SHOP_MANAGER', label: 'Coffee Shop Manager' },
    { value: 'COFFEE_SHOP_STAFF', label: 'Coffee Shop Staff' },
  ];
  
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === "all" ? null : value);
  };
  
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFirstName(user.UserProfile[0].firstName);
    setLastName(user.UserProfile[0].lastName);
    setPhoneNumber(user.UserProfile[0].phoneNumber || '');
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };
  
  const handleAssignBrand = (user: User) => {
    setSelectedUser(user);
    setSelectedBrandId(null);
    setIsAssignBrandDialogOpen(true);
  };
  
  const handleAssignLocation = (user: User) => {
    setSelectedUser(user);
    setSelectedLocationId(null);
    setIsManager(false);
    setIsAssignLocationDialogOpen(true);
  };
  
  const handleUpdateProfile = async () => {
    if (!selectedUser) return;
    
    try {
      const updateData: { id: number; data: UpdateUserProfileRequest } = {
        id: selectedUser.id,
        data: {
          firstName,
          lastName,
          phoneNumber: phoneNumber || undefined,
        },
      };
      
      await updateUserProfile(updateData).unwrap();
      setIsEditDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update user profile');
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id).unwrap();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to delete user');
    }
  };
  
  const handleAssignToBrand = async () => {
    if (!selectedUser || !selectedBrandId) {
      setError('Please select a brand');
      return;
    }
    
    try {
      await assignUserToBrand({ 
        userId: selectedUser.id, 
        brandId: selectedBrandId 
      }).unwrap();
      
      setIsAssignBrandDialogOpen(false);
      setSelectedBrandId(null);
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to assign user to brand');
    }
  };
  
  const handleAssignToLocation = async () => {
    if (!selectedUser || !selectedLocationId) {
      setError('Please select a location');
      return;
    }
    
    try {
      await assignUserToLocation({ 
        userId: selectedUser.id, 
        locationId: selectedLocationId,
        isManager
      }).unwrap();
      
      setIsAssignLocationDialogOpen(false);
      setSelectedLocationId(null);
      setIsManager(false);
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to assign user to location');
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Users</CardTitle>
              <CardDescription>Manage users in your coffee shop system</CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Select 
                value={roleFilter || "all"} 
                onValueChange={handleRoleFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {userError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{userError}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {roleFilter ? `No users found with role ${roleFilter.replace(/_/g, ' ')}` : 'No users found.'}
            </div>
          ) : (
            <div>
              <div className="text-sm text-gray-500 mb-2">
                Showing {users.length} {users.length === 1 ? 'user' : 'users'} 
                {roleFilter ? ` with role ${roleFilter.replace(/_/g, ' ')}` : ''}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>
                        {user.UserProfile[0].firstName} {user.UserProfile[0].lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 mr-1" 
                          onClick={() => handleViewUser(user)}
                          title="View Details"
                        >
                          <UserIcon className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 mr-1" 
                          onClick={() => handleEditUser(user)}
                          title="Edit Profile"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 mr-1" 
                          onClick={() => handleAssignBrand(user)}
                          title="Assign to Brand"
                        >
                          <Store className="h-4 w-4" />
                          <span className="sr-only">Assign to Brand</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 mr-1" 
                          onClick={() => handleAssignLocation(user)}
                          title="Assign to Location"
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="sr-only">Assign to Location</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700" 
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Details about the selected user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserDetails ? (
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="brands">Brands</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p>{selectedUserDetails.UserProfile[0].firstName} {selectedUserDetails.UserProfile[0].lastName}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{selectedUserDetails.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <RoleBadge role={selectedUserDetails.role} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p>{selectedUserDetails.UserProfile[0].phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p>{new Date(selectedUserDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="brands" className="mt-4">
                {selectedUserDetails.Brand && selectedUserDetails.Brand.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUserDetails.Brand.map((brand: Brand) => (
                      <div key={brand.id} className="p-3 border rounded flex items-center">
                        <Store className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-xs text-gray-500">Brand ID: {brand.id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">This user is not assigned to any brands.</p>
                )}
              </TabsContent>
              
              <TabsContent value="locations" className="mt-4">
                {selectedUserDetails.Location && selectedUserDetails.Location.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Managing Locations</h3>
                    {selectedUserDetails.Location.map((location: Location) => (
                      <div key={location.id} className="p-3 border rounded flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">{location.name || 'Unnamed Location'}</p>
                          <p className="text-xs text-gray-500">
                            {location.address || `${location.latitude}, ${location.longitude}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">This user is not managing any locations.</p>
                )}
                
                {selectedUserDetails.LocationStaff && selectedUserDetails.LocationStaff.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium">Staff at Locations</h3>
                    {selectedUserDetails.LocationStaff.map((staff: any) => (
                      <div key={staff.id} className="p-3 border rounded flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">{staff.location?.name || 'Unnamed Location'}</p>
                          <p className="text-xs text-gray-500">
                            {staff.location?.address || `${staff.location?.latitude}, ${staff.location?.longitude}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-4">This user is not working at any locations as staff.</p>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user profile information
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number (optional)"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user "{selectedUser?.UserProfile[0].firstName} {selectedUser?.UserProfile[0].lastName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign to Brand Dialog */}
      <Dialog open={isAssignBrandDialogOpen} onOpenChange={setIsAssignBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Brand</DialogTitle>
            <DialogDescription>
              Assign {selectedUser?.UserProfile[0].firstName} {selectedUser?.UserProfile[0].lastName} to a brand
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="brand">Select Brand</Label>
              <Select onValueChange={(value) => setSelectedBrandId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssignBrandDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignToBrand} 
              disabled={isAssigningBrand || !selectedBrandId}
            >
              {isAssigningBrand ? 'Assigning...' : 'Assign to Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign to Location Dialog */}
      <Dialog open={isAssignLocationDialogOpen} onOpenChange={setIsAssignLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Location</DialogTitle>
            <DialogDescription>
              Assign {selectedUser?.UserProfile[0].firstName} {selectedUser?.UserProfile[0].lastName} to a location
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location">Select Location</Label>
              <Select onValueChange={(value) => setSelectedLocationId(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name || `Location #${location.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isManager"
                checked={isManager}
                onChange={(e) => setIsManager(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isManager">Assign as Location Manager</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssignLocationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignToLocation} 
              disabled={isAssigningLocation || !selectedLocationId}
            >
              {isAssigningLocation ? 'Assigning...' : 'Assign to Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 