import { apiSlice } from "../api/apiSlice";
import { getCategoriesFromResult } from "../../helper";

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => ({
        url: "categories",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getCategoriesFromResult(result),
        { type: "Category", id: "LIST" },
      ],
    }),
    createCategory: builder.mutation({
      query: (name) => ({
        url: "create-category",
        method: "POST",
        body: name,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const { useCreateCategoryMutation, useGetAllCategoriesQuery } =
  categoriesApi;
