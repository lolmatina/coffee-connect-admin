'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import Link from 'next/link';
import { 
  useGetMenuTemplateByIdQuery,
  useGetTemplateItemsByTemplateQuery,
  useGetTemplateItemByIdQuery,
  useCreateTemplateItemMutation,
  useUpdateTemplateItemMutation,
  useDeleteTemplateItemMutation
} from '@/lib/api/menuApi';
import { 
  selectTemplateLoading, 
  selectTemplateError 
} from '@/lib/slices/menuTemplateSlice';
import { selectCurrentUser } from '@/lib/slices/authSlice';
import { 
  TemplateItem, 
  MenuTemplate, 
  CreateTemplateItemDto, 
  UpdateTemplateItemDto,
  TemplateItemVariant,
  CreateTemplateItemVariantDto
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  TableCaption, 
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Coffee, 
  Edit, 
  Trash2, 
  Plus,
  ArrowLeft,
  DollarSign,
  List,
  Tag
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LayoutTemplate } from 'lucide-react';

export default function TemplateItemsPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = parseInt(params.id as string);
  
  // State for managing dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // State for the selected item
  const [selectedItem, setSelectedItem] = useState<TemplateItem | null>(null);
  
  // State for form inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [available, setAvailable] = useState(true);
  const [menuOrder, setMenuOrder] = useState('0');
  const [variants, setVariants] = useState<CreateTemplateItemVariantDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get current user for permissions check
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Get loading and error states from redux
  const isLoading = useAppSelector(selectTemplateLoading);
  const templateError = useAppSelector(selectTemplateError);
  
  // RTK Query hooks for data fetching
  const { data: template, isLoading: isTemplateLoading } = useGetMenuTemplateByIdQuery(templateId);
  const { data: items = [], isLoading: isItemsLoading } = useGetTemplateItemsByTemplateQuery(templateId);
  
  const { data: selectedItemDetails } = useGetTemplateItemByIdQuery(
    selectedItem?.id || 0, 
    { skip: !selectedItem || !isEditDialogOpen }
  );

  // RTK Query hooks for mutations
  const [createTemplateItem, { isLoading: isCreating }] = useCreateTemplateItemMutation();
  const [updateTemplateItem, { isLoading: isUpdating }] = useUpdateTemplateItemMutation();
  const [deleteTemplateItem, { isLoading: isDeleting }] = useDeleteTemplateItemMutation();

  // Redirect to templates page if template id is invalid
  useEffect(() => {
    if (!isTemplateLoading && !template) {
      router.push('/menu/templates');
    }
  }, [template, isTemplateLoading, router]);

  // Reset form and selected item when closing dialogs
  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen && !isDeleteDialogOpen) {
      setSelectedItem(null);
    }
  }, [isCreateDialogOpen, isEditDialogOpen, isDeleteDialogOpen]);

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
    setDescription('');
    setCategory('');
    setPrice('');
    setImageUrl('');
    setAvailable(true);
    setMenuOrder('0');
    setVariants([]);
    setError(null);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { label: '', price: 0 }]);
    // If a base price is set, clear it when adding variants
    if (variants.length === 0 && price) {
      setPrice('');
    }
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: 'label' | 'price', value: string) => {
    const newVariants = [...variants];
    if (field === 'label') {
      newVariants[index].label = value;
    } else {
      // Ensure price is a valid non-negative number
      const numValue = parseFloat(value);
      newVariants[index].price = isNaN(numValue) ? 0 : Math.max(0, numValue);
    }
    setVariants(newVariants);
  };

  const handleCreateItem = async () => {
    // Basic validation
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    if (!category) {
      setError('Category is required');
      return;
    }

    // Validate variants if any
    if (variants.length > 0) {
      const invalidVariants = variants.filter(v => !v.label.trim() || v.price <= 0);
      if (invalidVariants.length > 0) {
        setError('All variants must have a label and a price greater than zero');
        return;
      }
    } else if (!price || parseFloat(price) <= 0) {
      setError('Price is required and must be greater than zero when no variants are defined');
      return;
    }

    try {
      const itemData: CreateTemplateItemDto = {
        name: name.trim(),
        description: description.trim(),
        category: category,
        price: variants.length > 0 ? undefined : parseFloat(price),
        imageUrl: imageUrl.trim() || undefined,
        available,
        menuOrder: parseInt(menuOrder) || 0,
        templateId,
        variants: variants.length > 0 ? variants : undefined
      };

      await createTemplateItem(itemData).unwrap();
      resetForm();
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to create menu item');
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    // Basic validation
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    if (!category) {
      setError('Category is required');
      return;
    }

    // Validate variants if any
    if (variants.length > 0) {
      const invalidVariants = variants.filter(v => !v.label.trim() || v.price <= 0);
      if (invalidVariants.length > 0) {
        setError('All variants must have a label and a price greater than zero');
        return;
      }
    } else if (!price && variants.length === 0) {
      setError('Price is required when no variants are defined');
      return;
    }

    try {
      const itemData: UpdateTemplateItemDto = {
        name: name.trim(),
        description: description.trim(),
        category: category,
        price: variants.length > 0 ? undefined : (price ? parseFloat(price) : undefined),
        imageUrl: imageUrl.trim() || undefined,
        available,
        menuOrder: parseInt(menuOrder) || 0,
        variants: variants.length > 0 ? variants : undefined
      };

      await updateTemplateItem({ id: selectedItem.id, data: itemData }).unwrap();
      resetForm();
      setIsEditDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to update menu item');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;

    try {
      await deleteTemplateItem(selectedItem.id).unwrap();
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      setError(err?.data?.message || 'Failed to delete menu item');
    }
  };

  const openEditDialog = (item: TemplateItem) => {
    setSelectedItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setCategory(item.category);
    setPrice(item.price?.toString() || '');
    setImageUrl(item.imageUrl || '');
    setAvailable(item.available);
    setMenuOrder(item.menuOrder?.toString() || '0');
    
    // Set variants if any
    if (item.variants && item.variants.length > 0) {
      setVariants(item.variants.map(v => ({ label: v.label, price: v.price })));
    } else {
      setVariants([]);
    }
    
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: TemplateItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const categories = [
    { id: 'COFFEE', name: 'Coffee' },
    { id: 'TEA', name: 'Tea' },
    { id: 'BAKERY', name: 'Bakery' },
    { id: 'SANDWICH', name: 'Sandwich' },
    { id: 'DESSERT', name: 'Dessert' }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link href="/menu/templates">
            <Button variant="outline" className="mr-4" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <LayoutTemplate className="mr-2 h-6 w-6" />
              {isTemplateLoading ? 'Loading...' : template?.name} - Items
            </h1>
            <p className="text-gray-500">Manage items for this menu template</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      {templateError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{templateError}</AlertDescription>
        </Alert>
      )}

      {(isLoading || isItemsLoading) ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading menu items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center p-8 border border-dashed rounded-lg">
              <p className="text-gray-500">No items in this menu template</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Your First Item
              </Button>
            </div>
          ) : (
            items.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription className="mt-1">{item.category}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => openDeleteDialog(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">
                    {item.description || 'No description provided'}
                  </p>
                  
                  {item.variants && item.variants.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2 flex items-center">
                        <List className="h-4 w-4 mr-1" /> Variants
                      </p>
                      <div className="space-y-1">
                        {item.variants.map((variant, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{variant.label}</span>
                            <span className="font-medium">${variant.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-medium">{item.price ? `$${item.price.toFixed(2)}` : 'No price set'}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between py-2 bg-gray-50">
                  <div className="text-sm">
                    Order: {item.menuOrder || 0}
                  </div>
                  <div className={`text-sm ${item.available ? 'text-green-500' : 'text-red-500'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Menu Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>
              Add a new item to the menu template
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Cappuccino"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="A classic coffee with steamed milk and foam"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
                placeholder="4.50"
                disabled={variants.length > 0}
              />
              {variants.length > 0 && (
                <p className="col-span-3 col-start-2 text-xs text-gray-500">
                  Not required when using variants
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://example.com/cappuccino.jpg"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">
                Available
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="available" 
                  checked={available} 
                  onCheckedChange={setAvailable} 
                />
                <Label htmlFor="available">
                  {available ? 'Yes' : 'No'}
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="menuOrder" className="text-right">
                Menu Order
              </Label>
              <Input
                id="menuOrder"
                type="number"
                value={menuOrder}
                onChange={(e) => setMenuOrder(e.target.value)}
                className="col-span-3"
                placeholder="0"
              />
            </div>
            
            <Accordion type="single" collapsible className="col-span-4">
              <AccordionItem value="variants">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <List className="mr-2 h-4 w-4" />
                    Variants (Optional)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={variant.label}
                          onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                          placeholder="Small"
                          className="flex-grow"
                        />
                        <div className="w-24 flex items-center">
                          <span className="mr-1">$</span>
                          <Input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            placeholder="3.50"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleRemoveVariant(index)}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={handleAddVariant}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleCreateItem} 
              disabled={isCreating}
              className="w-full sm:w-auto"
            >
              {isCreating ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the menu item details
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <div className="col-span-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="col-span-3"
                disabled={variants.length > 0}
                min="0"
                step="0.01"
              />
              {variants.length > 0 && (
                <p className="col-span-3 col-start-2 text-xs text-gray-500">
                  Not required when using variants
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-imageUrl" className="text-right">
                Image URL
              </Label>
              <Input
                id="edit-imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-available" className="text-right">
                Available
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch 
                  id="edit-available" 
                  checked={available} 
                  onCheckedChange={setAvailable} 
                />
                <Label htmlFor="edit-available">
                  {available ? 'Yes' : 'No'}
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-menuOrder" className="text-right">
                Menu Order
              </Label>
              <Input
                id="edit-menuOrder"
                type="number"
                value={menuOrder}
                onChange={(e) => setMenuOrder(e.target.value)}
                className="col-span-3"
                min="0"
              />
            </div>
            
            <Accordion type="single" collapsible className="col-span-4">
              <AccordionItem value="variants">
                <AccordionTrigger>
                  <div className="flex items-center">
                    <List className="mr-2 h-4 w-4" />
                    Variants
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {variants.map((variant, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={variant.label}
                          onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                          className="flex-grow"
                          placeholder="Variant name"
                        />
                        <div className="w-24 flex items-center">
                          <span className="mr-1">$</span>
                          <Input
                            type="number"
                            value={variant.price || ''}
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="icon"
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={handleAddVariant}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleUpdateItem} 
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Menu Item Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedItem && (
            <div className="py-4">
              <p>
                <strong>Name:</strong> {selectedItem.name}
              </p>
              <p>
                <strong>Category:</strong> {selectedItem.category}
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
              onClick={handleDeleteItem} 
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 