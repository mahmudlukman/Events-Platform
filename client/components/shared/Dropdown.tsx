"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import { startTransition, useState } from "react";
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
} from "@/redux/features/category/categoryApi";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
}

interface DropdownProps {
  value?: string;
  onChangeHandler?: (value: string) => void;
}

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [newCategory, setNewCategory] = useState("");
  const { data: categories, isLoading } = useGetAllCategoriesQuery({});
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await createCategory({
        name: newCategory.trim(),
      }).unwrap();

      // Reset the input
      setNewCategory("");

      // Close the dialog (you might need to add state management for this)
    } catch (err) {
        const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while deleting the event.";

          toast.error(errorMessage, {
            duration: 5000,
          });
      console.error("Failed to create category:", err);
    }
  };

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder={isLoading ? "Loading..." : "Category"} />
      </SelectTrigger>
      <SelectContent>
        {categories?.categories?.map((category: Category) => (
          <SelectItem
            key={category._id}
            value={category._id}
            className="select-item p-regular-14"
          >
            {category.name}
          </SelectItem>
        ))}

        <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">
            Add new category
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>New Category</AlertDialogTitle>
              <AlertDialogDescription>
                <Input
                  type="text"
                  placeholder="Category name"
                  className="input-field mt-3"
                  onChange={(e) => setNewCategory(e.target.value)}
                  value={newCategory}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => startTransition(handleAddCategory)}
                disabled={isCreating || !newCategory.trim()}
              >
                {isCreating ? "Adding..." : "Add"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
