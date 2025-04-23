'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { 
  useGetBrandsQuery, 
  useCreateBrandMutation, 
  useUpdateBrandMutation, 
  useDeleteBrandMutation 
} from '@/lib/api/brandsApi';
import { selectBrandLoading, selectBrandError } from '@/lib/slices/brandSlice';
import { selectCurrentUser } from '@/lib/slices/authSlice';
import { Brand, CreateBrandDto, UpdateBrandDto } from '@/lib/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetUsersQuery } from '@/lib/api/usersApi';

export default function BrandsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandName, setBrandName] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const isLoading = useAppSelector(selectBrandLoading);
  const brandError = useAppSelector(selectBrandError);
  
  const { data: brands = [] } = useGetBrandsQuery();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const { data: users = [] } = useGetUsersQuery({ roleFilter: 'COFFEE_SHOP_OWNER' });

  console.log(users);
  const user = useAppSelector(selectCurrentUser);

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'COFFEE_SHOP_OWNER') {
    return <div>You are not authorized to access this page</div>;
  }

  
  const handleCreateBrand = async () => {
    if (!brandName.trim()) {
      setError('Brand name is required');
      return;
    }

    if (user?.role === 'SUPER_ADMIN' && !ownerId.trim()) {
      setError('Owner is required');
      return;
    }
    
    try {
      const brandData: CreateBrandDto = { name: brandName.trim() };
      if (user?.role === 'SUPER_ADMIN') {
        brandData.ownerId = parseInt(ownerId);
      }
      await createBrand(brandData).unwrap();
      setBrandName('');
      setIsCreateDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create brand');
    }
  };
  
  const handleUpdateBrand = async () => {
    if (!selectedBrand) return;
    if (!brandName.trim()) {
      setError('Brand name is required');
      return;
    }
    
    try {
      const updateData: { id: number; data: UpdateBrandDto } = {
        id: selectedBrand.id,
        data: { name: brandName.trim() }
      };
      await updateBrand(updateData).unwrap();
      setBrandName('');
      setSelectedBrand(null);
      setIsEditDialogOpen(false);
      setError(null);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update brand');
    }
  };
  
  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    
    try {
      await deleteBrand(selectedBrand.id).unwrap();
      setSelectedBrand(null);
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to delete brand');
    }
  };
  
  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setBrandName(brand.name);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Brands</CardTitle>
              <CardDescription>Manage your coffee shop brands</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Brand
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Brand</DialogTitle>
                </DialogHeader>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Brand Name</Label>
                    <Input
                      id="name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Owner (Coffee Shop Owner) {users[0]?.UserProfile[0].firstName}</Label>
                      <Select
                        value={ownerId}
                        onValueChange={(value) => setOwnerId(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.UserProfile[0].firstName} {user.UserProfile[0].lastName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setBrandName('');
                      setError(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateBrand} 
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Brand'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {brandError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{brandError}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No brands found. Create your first brand by clicking the "Add Brand" button.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.id}</TableCell>
                    <TableCell>{brand.name}</TableCell>
                    <TableCell>{new Date(brand.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 mr-2" 
                        onClick={() => openEditDialog(brand)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700" 
                        onClick={() => openDeleteDialog(brand)}
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
      
      {/* Edit Brand Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update the brand name
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Brand Name</Label>
              <Input
                id="edit-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setBrandName('');
                setSelectedBrand(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateBrand} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the brand "{selectedBrand?.name}"? This action cannot be undone.
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
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedBrand(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBrand} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 