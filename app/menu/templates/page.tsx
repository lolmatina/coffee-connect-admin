'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { 
  useGetMenuTemplatesQuery,
  useCreateMenuTemplateMutation,
  useUpdateMenuTemplateMutation,
  useDeleteMenuTemplateMutation,
  useGetTemplateItemsByTemplateQuery
} from '@/lib/api/menuApi';
import { useGetBrandsQuery } from '@/lib/api/brandsApi';
import { 
  selectTemplateError 
} from '@/lib/slices/menuTemplateSlice';
import { selectCurrentUser } from '@/lib/slices/authSlice';
import { 
  MenuTemplate, 
  CreateMenuTemplateDto, 
  UpdateMenuTemplateDto,
} from '@/lib/types/menu';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
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
  LayoutTemplate, 
  Edit, 
  Trash2, 
  Plus,
  ArrowLeft,
  Coffee,
  List
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function MenuTemplatesPage() {
  // State for managing dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewItemsDialogOpen, setIsViewItemsDialogOpen] = useState(false);

  // State for the selected template
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplate | null>(null);
  
  // State for form inputs
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get current user for permissions check
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Get loading and error states from redux
  const templateError = useAppSelector(selectTemplateError);
  
  // RTK Query hooks for data fetching
  const { data: templates = [] } = useGetMenuTemplatesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  
  
  const { data: templateItems = [] } = useGetTemplateItemsByTemplateQuery(
    selectedTemplate?.id || 0,
    { skip: !selectedTemplate || !isViewItemsDialogOpen }
  );

  // RTK Query hooks for mutations
  const [createMenuTemplate] = useCreateMenuTemplateMutation();
  const [updateMenuTemplate, { isLoading: isUpdating }] = useUpdateMenuTemplateMutation();
  const [deleteMenuTemplate, { isLoading: isDeleting }] = useDeleteMenuTemplateMutation();

  // Reset form and selected template when closing dialogs
  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen && !isDeleteDialogOpen && !isViewItemsDialogOpen) {
      setSelectedTemplate(null);
    }
  }, [isCreateDialogOpen, isEditDialogOpen, isDeleteDialogOpen, isViewItemsDialogOpen]);

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
            You don&apos;t have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const resetForm = () => {
    setName('');
    setBrandId('');
    setError(null);
  };

  const handleCreateTemplate = async () => {
    // Basic validation
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (!brandId) {
      setError('Brand is required');
      return;
    }

    try {
      const templateData: CreateMenuTemplateDto = {
        name: name.trim(),
        brandId: parseInt(brandId)
      };

      await createMenuTemplate(templateData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create menu template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      const templateData: UpdateMenuTemplateDto = {
        name: name.trim()
      };

      await updateMenuTemplate({ id: selectedTemplate.id, data: templateData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update menu template');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      await deleteMenuTemplate(selectedTemplate.id).unwrap();
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to delete menu template');
    }
  };

  // Find brand name for display
  const getBrandName = (brandId: number) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/menu">
            <Button variant="outline" className="mr-4" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Menu Templates</h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      {templateError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{templateError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu Templates</CardTitle>
            <CardDescription>
              Create and manage menu templates for your coffee shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-lg">
                <LayoutTemplate className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                <p className="text-gray-500 mb-4">Create your first menu template to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{template.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {getBrandName(template.brandId)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Coffee className="mr-2 h-4 w-4" />
                        <span>This is a template preview</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <span className="text-xs text-gray-500">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                      <Link href={`/menu/templates/${template.id}/items`}>
                        <Button variant="outline" size="sm">
                          <List className="mr-2 h-3 w-3" /> Manage Items
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
                
                {/* Add Template Card */}
                <Card className="border-dashed bg-gray-50 flex flex-col justify-center items-center p-6">
                  <Button
                    variant="ghost"
                    className="h-20 w-20 rounded-full"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-10 w-10" />
                  </Button>
                  <p className="mt-4 font-medium">Add Template</p>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Menu Template</DialogTitle>
            <DialogDescription>
              Create a new template for your coffee shop menu
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Summer Menu 2023"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">
                Brand
              </Label>
              <div className="col-span-3">
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem 
                        key={brand.id} 
                        value={brand.id.toString()}
                      >
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleCreateTemplate}
            >
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the menu template details
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Brand
              </Label>
              <div className="col-span-3">
                <p className="text-sm">
                  {selectedTemplate && getBrandName(selectedTemplate.brandId)}
                </p>
                <p className="text-xs text-gray-500">
                  (Brand cannot be changed after creation)
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleUpdateTemplate} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Template Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This will remove all menu items associated with it and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedTemplate && (
            <div className="py-4">
              <p>
                <strong>Name:</strong> {selectedTemplate.name}
              </p>
              <p>
                <strong>Brand:</strong> {getBrandName(selectedTemplate.brandId)}
              </p>
            </div>
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
              onClick={handleDeleteTemplate} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Menu Items Dialog */}
      <Dialog 
        open={isViewItemsDialogOpen} 
        onOpenChange={setIsViewItemsDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Template Items</DialogTitle>
            <DialogDescription>
              {selectedTemplate && selectedTemplate.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Items in this menu template
            </p>
            {selectedTemplate && (
              <Link href={`/menu/templates/${selectedTemplate.id}/items`}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Manage Items
                </Button>
              </Link>
            )}
          </div>

          <div className="py-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {templateItems.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-gray-500">No items in this template</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.price ? `$${item.price.toFixed(2)}` : 'Varies'}
                      </TableCell>
                      <TableCell>
                        {item.available ? (
                          <span className="text-green-500">Available</span>
                        ) : (
                          <span className="text-red-500">Unavailable</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewItemsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 