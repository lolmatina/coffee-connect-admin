'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { 
  useGetLocationsQuery,
  useGetLocationByIdQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useGetLocationStaffQuery,
  useRemoveStaffFromLocationMutation
} from '@/lib/api/locationsApi';
import { useGetBrandsQuery } from '@/lib/api/brandsApi';
import { useGetUsersQuery } from '@/lib/api/usersApi';
import { 
  selectLocationLoading, 
  selectLocationError 
} from '@/lib/slices/locationSlice';
import { selectCurrentUser } from '@/lib/slices/authSlice';
import { 
  Location, 
  CreateLocationDto, 
  UpdateLocationDto, 
  UserRole,
  LocationStaff
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
  DialogTitle, 
  DialogTrigger 
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
  MapPin, 
  Edit, 
  Trash2, 
  Plus,
  Users,
  UserMinus
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LocationsPage() {
  // State for managing dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewStaffDialogOpen, setIsViewStaffDialogOpen] = useState(false);

  // State for the selected location
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // State for form inputs
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [brandId, setBrandId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get current user for permissions check
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Get loading and error states from redux
  const isLoading = useAppSelector(selectLocationLoading);
  const locationError = useAppSelector(selectLocationError);
  
  // RTK Query hooks for data fetching
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: users = [] } = useGetUsersQuery({ roleFilter: 'COFFEE_SHOP_MANAGER' });
  const { data: selectedLocationDetails } = useGetLocationByIdQuery(
    selectedLocation?.id || 0, 
    { skip: !selectedLocation || (!isViewStaffDialogOpen && !isEditDialogOpen) }
  );
  const { data: locationStaff = [] } = useGetLocationStaffQuery(
    selectedLocation?.id || 0,
    { skip: !selectedLocation || !isViewStaffDialogOpen }
  );

  // RTK Query hooks for mutations
  const [createLocation, { isLoading: isCreating }] = useCreateLocationMutation();
  const [updateLocation, { isLoading: isUpdating }] = useUpdateLocationMutation();
  const [deleteLocation, { isLoading: isDeleting }] = useDeleteLocationMutation();
  const [removeStaff, { isLoading: isRemovingStaff }] = useRemoveStaffFromLocationMutation();

  // Permission check - only allow owners and admins to access
  if (
    !currentUser || 
    (currentUser.role !== 'SUPER_ADMIN' && 
     currentUser.role !== 'COFFEE_SHOP_OWNER')
  ) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const resetForm = () => {
    setName('');
    setAddress('');
    setCity('');
    setState('');
    setCountry('');
    setPostalCode('');
    setLatitude('');
    setLongitude('');
    setBrandId('');
    setManagerId('');
    setError(null);
  };

  const handleCreateLocation = async () => {
    // Basic validation
    if (!name.trim()) {
      setError('Location name is required');
      return;
    }

    if (!latitude || !longitude) {
      setError('Latitude and longitude are required');
      return;
    }

    if (!brandId) {
      setError('Brand is required');
      return;
    }

    try {
      const locationData: CreateLocationDto = {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        BrandId: parseInt(brandId),
        managerId: managerId ? parseInt(managerId) : undefined
      };

      await createLocation(locationData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create location');
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation) return;

    if (!name.trim()) {
      setError('Location name is required');
      return;
    }

    if (!latitude || !longitude) {
      setError('Latitude and longitude are required');
      return;
    }

    try {
      const updateData: { id: number; data: UpdateLocationDto } = {
        id: selectedLocation.id,
        data: {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          country: country.trim(),
          postalCode: postalCode.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          managerId: managerId ? parseInt(managerId) : undefined
        }
      };

      await updateLocation(updateData).unwrap();
      resetForm();
      setSelectedLocation(null);
      setIsEditDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update location');
    }
  };

  const handleDeleteLocation = async () => {
    if (!selectedLocation) return;

    try {
      await deleteLocation(selectedLocation.id).unwrap();
      setSelectedLocation(null);
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to delete location');
    }
  };

  const handleRemoveStaff = async (staffId: number) => {
    if (!selectedLocation) return;

    try {
      await removeStaff({ 
        locationId: selectedLocation.id, 
        staffId 
      }).unwrap();
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to remove staff member');
    }
  };

  const openEditDialog = (location: Location) => {
    setSelectedLocation(location);
    setName(location.name || '');
    setAddress(location.address || '');
    setCity(location.city || '');
    setState(location.state || '');
    setCountry(location.country || '');
    setPostalCode(location.postalCode || '');
    setLatitude(String(location.latitude) || '');
    setLongitude(String(location.longitude) || '');
    setManagerId(location.managerId ? String(location.managerId) : '');
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const openViewStaffDialog = (location: Location) => {
    console.log(locationStaff);
    setSelectedLocation(location);
    setIsViewStaffDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Locations</CardTitle>
              <CardDescription>
                Manage coffee shop locations
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Location</DialogTitle>
                  <DialogDescription>
                    Add a new coffee shop location
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Location Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter location name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g., 40.7128"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g., -74.0060"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Select 
                      value={brandId} 
                      onValueChange={setBrandId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
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

                  <div className="grid gap-2">
                    <Label htmlFor="manager">Manager</Label>
                    <Select 
                      value={managerId} 
                      onValueChange={setManagerId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select manager (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.UserProfile[0].firstName} {user.UserProfile[0].lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsCreateDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateLocation}
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Location'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {locationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No locations found. Create your first location by clicking the "Add Location" button.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">{location.id}</TableCell>
                    <TableCell>{location.name || 'Unnamed Location'}</TableCell>
                    <TableCell>
                      {location.address ? (
                        <span>
                          {location.address}
                          {location.city && `, ${location.city}`}
                          {location.state && `, ${location.state}`}
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          {location.latitude}, {location.longitude}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{location.Brand?.name || '-'}</TableCell>
                    <TableCell>
                      {location.manager ? (
                        `${location.manager.UserProfile[0].firstName} ${location.manager.UserProfile[0].lastName}`
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 mr-1" 
                        onClick={() => openViewStaffDialog(location)}
                        title="View Staff"
                      >
                        <Users className="h-4 w-4" />
                        <span className="sr-only">View Staff</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 mr-1" 
                        onClick={() => openEditDialog(location)}
                        title="Edit Location"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700" 
                        onClick={() => openDeleteDialog(location)}
                        title="Delete Location"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Staff Dialog */}
      <Dialog open={isViewStaffDialogOpen} onOpenChange={setIsViewStaffDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Location Staff</DialogTitle>
            <DialogDescription>
              Staff members assigned to <span className="font-bold">{selectedLocation?.name || 'this location'}</span>
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {locationStaff.length === 0 ? (
            <div className="py-4 text-center text-gray-500">
              No staff members assigned to this location.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>{staff.id}</TableCell>
                    <TableCell>
                      {staff.UserProfile[0].firstName} {staff.UserProfile[0].lastName}
                    </TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700" 
                        onClick={() => handleRemoveStaff(staff.id)}
                        disabled={isRemovingStaff}
                        title="Remove Staff"
                      >
                        <UserMinus className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Location Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update location details
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Location Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter location name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Latitude *</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 40.7128"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-longitude">Longitude *</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-state">State/Province</Label>
                <Input
                  id="edit-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-postalCode">Postal Code</Label>
                <Input
                  id="edit-postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal code"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-manager">Manager</Label>
              <Select 
                value={managerId} 
                onValueChange={setManagerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.UserProfile[0].firstName} {user.UserProfile[0].lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateLocation}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Location Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the location "{selectedLocation?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedLocation(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteLocation}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 