import { apiSlice } from "../api/apiSlice";
import { getEventsFromResult } from "../../helper";

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: () => ({
        url: "create-category",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getEventsFromResult(result),
        { type: "Category", id: "LIST" },
      ],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "categories",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const { useCreateCategoryMutation, useGetAllCategoriesQuery } =
  categoriesApi;
