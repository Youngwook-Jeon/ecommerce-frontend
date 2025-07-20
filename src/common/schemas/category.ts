import { z } from "zod";

const baseCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable(),
  status: z.string()
});

// Define a recursive type alias for TypeScript to understand the structure.
type CategoryDto = z.infer<typeof baseCategorySchema> & {
  children: CategoryDto[];
};

// Use z.lazy() to define the recursive schema for validation.
export const CategorySchema: z.ZodType<CategoryDto> = baseCategorySchema.extend(
  {
    children: z.lazy(() => CategorySchema.array()),
  }
);

// Export the inferred TypeScript type for use in components.
export type CategoryDtoVm = z.infer<typeof CategorySchema>;

export const CreateCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be 50 characters or less."),
  parentId: z.number().positive("Parent ID must be a positive number.").optional().nullable(),
});

export type CreateCategoryForm = z.infer<typeof CreateCategorySchema>;
