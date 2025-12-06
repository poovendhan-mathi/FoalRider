"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { logger } from "@/lib/logger";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface ProductFormProps {
  categories: Category[];
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    sku?: string;
    category_id?: string;
    price?: number;
    stock_quantity?: number;
    is_active?: boolean;
    is_featured?: boolean;
    main_image?: string;
    images?: string[];
    variants?: ProductVariant[];
  };
}

interface ProductVariant {
  size: string;
  stock_quantity: number;
}

interface FormErrors {
  name?: string;
  sku?: string;
  price?: string;
  categoryId?: string;
  stockQuantity?: string;
}

/**
 * Inline field error component
 */
function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-sm text-red-500 mt-1">{error}</p>;
}

export default function ProductForm({
  categories,
  mode,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [sku, setSku] = useState(initialData?.sku || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [price, setPrice] = useState(
    initialData?.price ? (initialData.price / 100).toString() : ""
  );
  const [stockQuantity, setStockQuantity] = useState(
    initialData?.stock_quantity?.toString() || "0"
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(
    initialData?.is_featured ?? false
  );
  const [mainImage, setMainImage] = useState(initialData?.main_image || "");
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images || []
  );
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || []
  );

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  /**
   * Validates the form and returns true if valid
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Product name is required";
    } else if (name.length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    }

    if (!sku.trim()) {
      newErrors.sku = "SKU is required";
    } else if (!/^[A-Za-z0-9-_]+$/.test(sku)) {
      newErrors.sku =
        "SKU can only contain letters, numbers, hyphens, and underscores";
    }

    if (!price) {
      newErrors.price = "Price is required";
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      newErrors.price = "Price must be a valid positive number";
    }

    if (!categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (
      stockQuantity &&
      (isNaN(parseInt(stockQuantity)) || parseInt(stockQuantity) < 0)
    ) {
      newErrors.stockQuantity =
        "Stock quantity must be a valid non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (
    file: File,
    isMainImage: boolean = false
  ) => {
    if (!file) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();

      if (isMainImage) {
        setMainImage(data.url);
      } else {
        setImageUrls([...imageUrls, data.url]);
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      logger.error("Image upload failed", error, { context: "ProductForm" });
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants([...variants, { size: "", stock_quantity: 0 }]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name,
        description,
        sku,
        category_id: categoryId,
        price: Math.round(parseFloat(price) * 100), // Convert to paise
        stock_quantity: parseInt(stockQuantity),
        is_active: isActive,
        is_featured: isFeatured,
        main_image: mainImage,
        images: imageUrls,
        variants: variants.length > 0 ? variants : null,
      };

      logger.info(`${mode === "create" ? "Creating" : "Updating"} product`, {
        context: "ProductForm",
        data: { name, sku },
      });

      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${initialData?.id}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error("Product save error", data, { context: "ProductForm" });

        // Handle validation errors from server
        if (data.details && Array.isArray(data.details)) {
          const serverErrors: FormErrors = {};
          data.details.forEach((issue: { path: string[]; message: string }) => {
            const field = issue.path[0];
            if (field === "name") serverErrors.name = issue.message;
            if (field === "sku") serverErrors.sku = issue.message;
            if (field === "price") serverErrors.price = issue.message;
            if (field === "category_id")
              serverErrors.categoryId = issue.message;
            if (field === "stock_quantity")
              serverErrors.stockQuantity = issue.message;
          });
          setErrors(serverErrors);
        }

        throw new Error(data.error || "Failed to save product");
      }

      toast({
        title: "Success",
        description: `Product ${
          mode === "create" ? "created" : "updated"
        } successfully`,
      });

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      logger.error("Product save error", error, { context: "ProductForm" });
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${mode === "create" ? "create" : "update"} product`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Basic details about your product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g., Classic Blue Denim Jeans"
                  className={errors.name ? "border-red-500" : ""}
                />
                <FieldError error={errors.name} />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">
                    SKU <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => {
                      setSku(e.target.value);
                      if (errors.sku) setErrors({ ...errors, sku: undefined });
                    }}
                    placeholder="e.g., JEANS-001"
                    className={errors.sku ? "border-red-500" : ""}
                  />
                  <FieldError error={errors.sku} />
                </div>

                <div>
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={(value) => {
                      setCategoryId(value);
                      if (errors.categoryId)
                        setErrors({ ...errors, categoryId: undefined });
                    }}
                  >
                    <SelectTrigger
                      className={errors.categoryId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError error={errors.categoryId} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>
                Prices are in USD (cents will be converted automatically)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">
                    Price ($) - USD <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => {
                        setPrice(e.target.value);
                        if (errors.price)
                          setErrors({ ...errors, price: undefined });
                      }}
                      placeholder="0.00"
                      className={`pl-7 ${errors.price ? "border-red-500" : ""}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter price in dollars (e.g., 99.00 for $99)
                  </p>
                  <FieldError error={errors.price} />
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => {
                      setStockQuantity(e.target.value);
                      if (errors.stockQuantity)
                        setErrors({ ...errors, stockQuantity: undefined });
                    }}
                    placeholder="0"
                    className={errors.stockQuantity ? "border-red-500" : ""}
                  />
                  <FieldError error={errors.stockQuantity} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants/Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Add different sizes or variants (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="Size (e.g., M, L, XL)"
                    value={variant.size}
                    onChange={(e) =>
                      updateVariant(index, "size", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={variant.stock_quantity}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "stock_quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addVariant}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload images for your product (first image will be the main
                image)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Main Image</Label>
                {mainImage ? (
                  <div className="relative mt-2 inline-block">
                    <Image
                      src={mainImage}
                      alt="Main product image"
                      width={200}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => setMainImage("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, true);
                      }}
                      disabled={uploadingImage}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Gallery Images</Label>
                <div className="mt-2 grid grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        width={150}
                        height={150}
                        className="rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, false);
                        }}
                        disabled={uploadingImage}
                      />
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Upload</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active">Active</Label>
                  <p className="text-sm text-gray-500">Show product on store</p>
                </div>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured">Featured</Label>
                  <p className="text-sm text-gray-500">Display on homepage</p>
                </div>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {mode === "create" ? "Create Product" : "Update Product"}
                </Button>
                <Link href="/admin/products" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
