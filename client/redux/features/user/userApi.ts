import { apiSlice } from "../api/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: ({ userId }) => ({
        url: `user/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result, error, arg) => [{ type: "User", id: arg.userId }],
    }),
    updateUser: builder.mutation({
      query: ({ data }) => ({
        url: "update-user",
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "User", id: arg.data.id },
        { type: "User", id: "LIST" },
      ],
    }),
    deleteUser: builder.mutation({
      query: ({ userId }) => ({
        url: `user/${userId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (result, error, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetUserQuery, useDeleteUserMutation, useUpdateUserMutation } =
  userApi;
