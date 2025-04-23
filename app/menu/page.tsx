'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { 
  useGetMenusQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
  useGetMenuItemOverridesByMenuQuery
} from '@/lib/api/menuApi';
import {
  useGetMenuTemplatesQuery,
  useGetMenuTemplateByIdQuery,
  useGetTemplateItemsByTemplateQuery
} from '@/lib/api/menuApi';
import { useGetLocationsQuery } from '@/lib/api/locationsApi';
import { 
  selectMenuLoading, 
  selectMenuError 
} from '@/lib/slices/menuSlice';
import { selectCurrentUser } from '@/lib/slices/authSlice';
import { 
  Menu, 
  CreateMenuDto, 
  UpdateMenuDto,
  MenuTemplate,
  TemplateItem,
  MenuItemOverride
} from '@/lib/types/menu';
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
  Coffee, 
  Edit, 
  Trash2, 
  Plus,
  List,
  ShoppingBag,
  LayoutTemplate,
  ArrowRight
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function MenuPage() {
  // State for managing dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewItemsDialogOpen, setIsViewItemsDialogOpen] = useState(false);

  // State for the selected menu
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedTab, setSelectedTab] = useState('menus');
  
  // State for form inputs
  const [locationId, setLocationId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get current user for permissions check
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Get loading and error states from redux
  const isLoading = useAppSelector(selectMenuLoading);
  const menuError = useAppSelector(selectMenuError);
  
  // RTK Query hooks for data fetching
  const { data: menus = [] } = useGetMenusQuery();
  const { data: locations = [] } = useGetLocationsQuery();
  const { data: menuTemplates = [] } = useGetMenuTemplatesQuery();
  
  const { data: selectedMenuDetails } = useGetMenuByIdQuery(
    selectedMenu?.id || 0, 
    { skip: !selectedMenu || (!isViewItemsDialogOpen && !isEditDialogOpen) }
  );
  
  const { data: menuItems = [] } = useGetMenuItemOverridesByMenuQuery(
    selectedMenu?.id || 0,
    { skip: !selectedMenu || !isViewItemsDialogOpen }
  );

  // Fetch template items if a menu is selected
  const { data: templateItems = [] } = useGetTemplateItemsByTemplateQuery(
    selectedMenu?.templateId || 0,
    { skip: !selectedMenu?.templateId || !isViewItemsDialogOpen }
  );

  // Get template details if needed
  const { data: selectedTemplate } = useGetMenuTemplateByIdQuery(
    selectedMenu?.templateId || 0,
    { skip: !selectedMenu?.templateId }
  );

  // RTK Query hooks for mutations
  const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation();
  const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

  // Reset form and selected menu when closing dialogs
  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen && !isDeleteDialogOpen && !isViewItemsDialogOpen) {
      setSelectedMenu(null);
    }
  }, [isCreateDialogOpen, isEditDialogOpen, isDeleteDialogOpen, isViewItemsDialogOpen]);

  // Permission check - only allow owners, admins, and managers to access
  if (
    !currentUser || 
    (currentUser.role !== 'SUPER_ADMIN' && 
     currentUser.role !== 'COFFEE_SHOP_OWNER' &&
     currentUser.role !== 'COFFEE_SHOP_MANAGER')
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
    setLocationId('');
    setTemplateId('');
    setError(null);
  };

  const handleCreateMenu = async () => {
    // Basic validation
    if (!locationId) {
      setError('Location is required');
      return;
    }

    if (!templateId) {
      setError('Menu template is required');
      return;
    }

    try {
      const menuData: CreateMenuDto = {
        locationId: parseInt(locationId),
        templateId: parseInt(templateId)
      };

      await createMenu(menuData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create menu');
    }
  };

  const handleUpdateMenu = async () => {
    if (!selectedMenu) return;

    if (!templateId) {
      setError('Menu template is required');
      return;
    }

    try {
      const menuData: UpdateMenuDto = {
        templateId: parseInt(templateId)
      };

      await updateMenu({ id: selectedMenu.id, data: menuData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update menu');
    }
  };

  const handleDeleteMenu = async () => {
    if (!selectedMenu) return;

    try {
      await deleteMenu(selectedMenu.id).unwrap();
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to delete menu');
    }
  };

  const openEditDialog = (menu: Menu) => {
    setSelectedMenu(menu);
    setTemplateId(menu.templateId.toString());
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsDeleteDialogOpen(true);
  };

  const openViewItemsDialog = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsViewItemsDialogOpen(true);
  };

  // Find location and template name for display
  const getLocationName = (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const getTemplateName = (templateId: number) => {
    const template = menuTemplates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Menu
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Getting Started with Menus</CardTitle>
            <CardDescription>
              Follow these steps to set up your coffee shop menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-1 p-4 border rounded-lg mb-4 md:mb-0">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                      1
                    </div>
                    <h3 className="text-lg font-semibold">Create Menu Templates</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Start by creating menu templates with categories and items
                  </p>
                  <Link href="/menu/templates">
                    <Button className="w-full">
                      <LayoutTemplate className="mr-2 h-4 w-4" />
                      Go to Templates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="flex-1 p-4 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="bg-gray-100 text-gray-700 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                      2
                    </div>
                    <h3 className="text-lg font-semibold">Assign to Locations</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Then assign templates to your locations to create menus
                  </p>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Coffee className="mr-2 h-4 w-4" />
                    Manage Menus
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/menu/templates">
                <Button variant="default" className="w-full h-auto py-6 flex flex-col items-center justify-center">
                  <LayoutTemplate className="mb-2 h-8 w-8" />
                  <span className="text-lg font-medium">Menu Templates</span>
                  <span className="text-sm mt-1">Manage your menu templates and items</span>
                </Button>
              </Link>
              
              <Link href="/menu/templates">
                <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center justify-center">
                  <Plus className="mb-2 h-8 w-8" />
                  <span className="text-lg font-medium">Create Template</span>
                  <span className="text-sm mt-1">Create a new menu template</span>
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col items-center justify-center"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Coffee className="mb-2 h-8 w-8" />
                <span className="text-lg font-medium">Create Menu</span>
                <span className="text-sm mt-1">Assign a template to a location</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {menuError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{menuError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading menus...</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Menus</CardTitle>
            <CardDescription>
              Manage menus for your coffee shop locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {menus.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-gray-500 mb-4">No menus found</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Menu
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>{menu.id}</TableCell>
                      <TableCell>{getLocationName(menu.locationId)}</TableCell>
                      <TableCell>{getTemplateName(menu.templateId)}</TableCell>
                      <TableCell>{new Date(menu.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => openViewItemsDialog(menu)}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'COFFEE_SHOP_OWNER') && (
                          <>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openEditDialog(menu)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => openDeleteDialog(menu)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Menu Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Menu</DialogTitle>
            <DialogDescription>
              Assign a menu template to a location
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <div className="col-span-3">
                <Select value={locationId} onValueChange={setLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem 
                        key={location.id} 
                        value={location.id.toString()}
                      >
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Menu Template
              </Label>
              <div className="col-span-3">
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuTemplates.map((template) => (
                      <SelectItem 
                        key={template.id} 
                        value={template.id.toString()}
                      >
                        {template.name}
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
              onClick={handleCreateMenu} 
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Menu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Menu</DialogTitle>
            <DialogDescription>
              Change the menu template for this location
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Location
              </Label>
              <div className="col-span-3">
                <p className="text-sm">
                  {selectedMenu && getLocationName(selectedMenu.locationId)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template" className="text-right">
                Menu Template
              </Label>
              <div className="col-span-3">
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuTemplates.map((template) => (
                      <SelectItem 
                        key={template.id} 
                        value={template.id.toString()}
                      >
                        {template.name}
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
              onClick={handleUpdateMenu} 
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Menu</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedMenu && (
            <div className="py-4">
              <p>
                <strong>Location:</strong> {getLocationName(selectedMenu.locationId)}
              </p>
              <p>
                <strong>Template:</strong> {getTemplateName(selectedMenu.templateId)}
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
              onClick={handleDeleteMenu} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Menu'}
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
            <DialogTitle>Menu Items</DialogTitle>
            <DialogDescription>
              {selectedMenu && (
                <>
                  {getLocationName(selectedMenu.locationId)} - 
                  {getTemplateName(selectedMenu.templateId)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="py-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {templateItems.length === 0 ? (
              <div className="text-center p-4">
                <p className="text-gray-500">No menu items found</p>
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
                  {templateItems.map((item) => {
                    // Find if there's an override for this item
                    const override = menuItems.find(o => o.templateItemId === item.id);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {override?.name || item.name}
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          ${override?.price || item.price || 'Varies'}
                        </TableCell>
                        <TableCell>
                          {override?.available === false ? (
                            <span className="text-red-500">Unavailable</span>
                          ) : (
                            <span className="text-green-500">Available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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