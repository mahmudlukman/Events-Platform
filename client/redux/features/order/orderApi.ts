import { apiSlice } from "../api/apiSlice";
import { getOrdersFromResult } from "../../helper";

interface InitializePaymentRequest {
  eventId: string;
  amount: number;
  redirect_url: string;
}

interface InitiatePaymentResponse {
  success: boolean;
  isFreeEvent: boolean;
  paymentUrl?: string;
  orderId: string;
  tx_ref?: string;
  message?: string;
  order?: {
    _id: string;
    paymentId: string;
    totalAmount: string;
    event: string;
    buyer: string;
    status: "pending" | "completed" | "failed";
  };
}

interface VerifyPaymentRequest {
  status: string;
  tx_ref: string;
  transaction_id: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  order?: {
    _id: string;
    paymentId: string;
    totalAmount: string;
    event: string;
    buyer: string;
  };
}

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializePayment: builder.mutation<
      InitiatePaymentResponse,
      InitializePaymentRequest
    >({
      query: (body) => ({
        url: "/initialize-payment",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result) =>
        result?.order
          ? [
              { type: "Order", id: result.order._id },
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),
    verifyPayment: builder.query<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: ({ status, tx_ref, transaction_id }) => ({
        url: "/verify-payment",
        method: "GET",
        params: {
          status,
          tx_ref,
          transaction_id,
        },
        credentials: "include",
      }),
      transformResponse: (response: VerifyPaymentResponse) => response,
      transformErrorResponse: (error) => error,
      providesTags: (result) => [
        { type: "Order", id: result?.order?._id },
        { type: "Order", id: "LIST" },
      ],
    }),
    getOrdersByEvent: builder.query({
      query: ({ eventId, searchString }) => ({
        url: "orders",
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
      query: ({ page, limit }) => ({
        url: "user-orders",
        method: "GET",
        params: {
          page,
          limit,
        },
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
