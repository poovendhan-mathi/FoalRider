"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Edit,
  Trash2,
  FolderTree,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  display_order: number;
  product_count?: number;
}

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onReorder: () => void;
  selectedIds?: Set<string>;
  onSelect?: (categoryId: string) => void;
}

interface SortableCategoryProps {
  category: Category;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isSelected?: boolean;
  onSelect?: (categoryId: string) => void;
}

function SortableCategory({
  category,
  level,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
}: SortableCategoryProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg mb-2"
    >
      <div
        className="flex items-center gap-3 p-4"
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        {onSelect && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(category.id)}
          />
        )}

        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {category.product_count !== undefined && category.product_count > 0 ? (
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <FolderTree className="h-5 w-5 text-gray-400" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{category.name}</span>
            <Badge
              variant={category.is_active ? "default" : "secondary"}
              className="text-xs"
            >
              {category.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              {category.slug}
            </code>
            {category.product_count !== undefined && (
              <span className="ml-2">• {category.product_count} products</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(category)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CategoryTree({
  categories,
  onEdit,
  onReorder,
  selectedIds = new Set(),
  onSelect,
}: CategoryTreeProps) {
  const { toast } = useToast();
  const [items, setItems] = useState(categories);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Update display_order for all items
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        display_order: index,
      }));

      setItems(updatedItems);

      // Save to API
      try {
        const response = await fetch("/api/admin/categories/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryOrders: updatedItems.map((item) => ({
              id: item.id,
              display_order: item.display_order,
              parent_id: item.parent_id,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to reorder categories");
        }

        toast({
          title: "Success",
          description: "Categories reordered successfully",
        });

        onReorder();
      } catch {
        toast({
          title: "Error",
          description: "Failed to reorder categories",
          variant: "destructive",
        });

        // Revert on error
        setItems(categories);
      }
    }
  };

  const handleToggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedIds(newExpanded);
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${deleteCategory.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      toast({
        title: "Success",
        description: data.message,
      });

      onReorder();
      setDeleteCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Build tree structure for display
  const buildTree = (
    cats: Category[],
    parentId: string | null = null,
    level: number = 0
  ): React.ReactNode[] => {
    return cats
      .filter((cat) => cat.parent_id === parentId)
      .map((cat) => {
        const children = cats.filter((c) => c.parent_id === cat.id);
        const isExpanded = expandedIds.has(cat.id);

        return (
          <div key={cat.id}>
            <SortableCategory
              category={cat}
              level={level}
              isExpanded={isExpanded}
              onToggle={() => handleToggleExpand(cat.id)}
              onEdit={onEdit}
              onDelete={setDeleteCategory}
              isSelected={selectedIds.has(cat.id)}
              onSelect={onSelect}
            />
            {isExpanded && children.length > 0 && (
              <div>{buildTree(cats, cat.id, level + 1)}</div>
            )}
          </div>
        );
      });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <FolderTree className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No categories yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first category to get started
              </p>
            </div>
          ) : (
            <div>{buildTree(items)}</div>
          )}
        </SortableContext>
      </DndContext>

      <AlertDialog
        open={deleteCategory !== null}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteCategory?.name}
              &quot;?
              {deleteCategory?.product_count !== undefined &&
                deleteCategory.product_count > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    This category has {deleteCategory.product_count} product
                    {deleteCategory.product_count !== 1 ? "s" : ""} and cannot
                    be deleted.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                deleting ||
                (deleteCategory?.product_count !== undefined &&
                  deleteCategory.product_count > 0)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
