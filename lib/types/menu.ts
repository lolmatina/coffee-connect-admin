// Menu Template Types
export interface MenuTemplate {
  id: number;
  name: string;
  brandId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuTemplateDto {
  name: string;
  brandId: number;
}

export interface UpdateMenuTemplateDto {
  name?: string;
}

// Template Item Types
export interface TemplateItemVariant {
  id: number;
  label: string;
  price: number;
  templateItemId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price?: number;
  imageUrl?: string;
  available: boolean;
  menuOrder: number;
  templateId: number;
  createdAt: string;
  updatedAt: string;
  variants?: TemplateItemVariant[];
}

export interface CreateTemplateItemVariantDto {
  label: string;
  price: number;
}

export interface UpdateTemplateItemVariantDto {
  label?: string;
  price?: number;
}

export interface CreateTemplateItemDto {
  name: string;
  description: string;
  category: string;
  price?: number;
  imageUrl?: string;
  available?: boolean;
  menuOrder?: number;
  templateId: number;
  variants?: CreateTemplateItemVariantDto[];
}

export interface UpdateTemplateItemDto {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  imageUrl?: string;
  available?: boolean;
  menuOrder?: number;
  variants?: (CreateTemplateItemVariantDto | UpdateTemplateItemVariantDto)[];
}

// Menu Types
export interface Menu {
  id: number;
  locationId: number;
  templateId: number;
  createdAt: string;
  updatedAt: string;
  template?: MenuTemplate;
  menuItemOverrides?: MenuItemOverride[];
}

export interface CreateMenuDto {
  locationId: number;
  templateId: number;
}

export interface UpdateMenuDto {
  templateId?: number;
}

// Menu Item Override Types
export interface MenuItemOverrideVariant {
  id: number;
  originalVariantId: number;
  label?: string;
  price?: number;
  available: boolean;
  overrideId: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemOverride {
  id: number;
  templateItemId: number;
  menuId: number;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  available: boolean;
  menuOrder?: number;
  createdAt: string;
  updatedAt: string;
  templateItem?: TemplateItem;
  variantOverrides?: MenuItemOverrideVariant[];
}

export interface CreateMenuItemOverrideVariantDto {
  originalVariantId: number;
  label?: string;
  price?: number;
  available?: boolean;
}

export interface UpdateMenuItemOverrideVariantDto {
  label?: string;
  price?: number;
  available?: boolean;
}

export interface CreateMenuItemOverrideDto {
  templateItemId: number;
  menuId: number;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  available?: boolean;
  menuOrder?: number;
  variantOverrides?: CreateMenuItemOverrideVariantDto[];
}

export interface UpdateMenuItemOverrideDto {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  available?: boolean;
  menuOrder?: number;
  variantOverrides?: (CreateMenuItemOverrideVariantDto | UpdateMenuItemOverrideVariantDto)[];
}

// State types for Redux
export interface MenuTemplateState {
  templates: MenuTemplate[];
  selectedTemplate: MenuTemplate | null;
  templateItems: TemplateItem[];
  selectedTemplateItem: TemplateItem | null;
  isLoading: boolean;
  error: string | null;
}

export interface MenuState {
  menus: Menu[];
  selectedMenu: Menu | null;
  menuItemOverrides: MenuItemOverride[];
  selectedMenuItemOverride: MenuItemOverride | null;
  isLoading: boolean;
  error: string | null;
} 