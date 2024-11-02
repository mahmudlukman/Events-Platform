import { apiSlice } from "../api/apiSlice";
import { getOrdersFromResult } from "../../helper";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializePayment: builder.mutation({
      query: ({ eventId, amount }) => ({
        url: "initialize",
        method: "POST",
        body: {
          eventId,
          amount,
        },
        credentials: "include" as const,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    verifyPayment: builder.query({
      query: ({ status, tx_ref, transaction_id }) => ({
        url: "verify-payment",
        method: "GET",
        params: {
          status,
          tx_ref,
          transaction_id,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getOrdersFromResult(result),
        { type: "Order", id: "LIST" },
      ],
    }),
    getOrdersByEvent: builder.query({
      query: ({ eventId, searchString }) => ({
        url: "event",
        method: "GET",
        params: {
          eventId,
          searchString,
        },
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getOrdersFromResult(result),
        { type: "Order", id: "LIST" },
      ],
    }),
    getOrdersByUser: builder.query({
      query: ({ userId }) => ({
        url: `user/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getOrdersFromResult(result),
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useInitializePaymentMutation,
  useGetOrdersByEventQuery,
  useGetOrdersByUserQuery,
  useVerifyPaymentQuery,
} = orderApi;
