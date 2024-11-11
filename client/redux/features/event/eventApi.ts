import { apiSlice } from "../api/apiSlice";
import { getEventsFromResult } from "../../helper";

export const eventsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategoryByName: builder.query({
      query: () => ({
        url: "get-category",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getEventsFromResult(result),
        { type: "Event", id: "LIST" },
      ],
    }),
    getAllEvents: builder.query({
      query: ({ query, limit, page, category }) => ({
        url: "get-events",
        method: "GET",
        params: {
          query,
          limit,
          page,
          category,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getEventsFromResult(result),
        { type: "Event", id: "LIST" },
      ],
    }),
    getEventById: builder.query({
      query: ({ id }) => ({
        url: `get-event/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformResponse: (response: any) => {
        return response.event || response;
      },
      providesTags: (result, error, id) => [{ type: "Event", id }],
    }),
    getEventsByUser: builder.query({
      query: ({ userId, page, limit }) => ({
        url: "get-user-event",
        method: "GET",
        params: {
          userId,
          page,
          limit,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getEventsFromResult(result),
        { type: "Event", id: "LIST" },
      ],
    }),
    getRelatedEventsByCategory: builder.query({
      query: ({ categoryId, eventId, page, limit }) => ({
        url: "get-related-event",
        method: "GET",
        params: {
          categoryId,
          eventId,
          page,
          limit,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getEventsFromResult(result),
        { type: "Event", id: "LIST" },
      ],
    }),
    createEvent: builder.mutation({
      query: (data) => ({
        url: "create-event",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),
    updateEvent: builder.mutation({
      query: ({ ...data }) => ({
        url: "update-event",
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),
    deleteEvent: builder.mutation({
      query: ({ eventId }) => ({
        url: `delete-event/${eventId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (result, error, eventId) => [
        { type: "Event", id: eventId },
        { type: "Event", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetAllEventsQuery,
  useGetCategoryByNameQuery,
  useGetEventByIdQuery,
  useGetEventsByUserQuery,
  useGetRelatedEventsByCategoryQuery,
  useUpdateEventMutation,
} = eventsApi;
