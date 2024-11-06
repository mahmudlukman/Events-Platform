import { apiSlice } from "../api/apiSlice";
import { getOrdersFromResult } from "../../helper";

interface InitializePaymentRequest {
  eventId: string;
  amount: number;
}

interface InitializePaymentResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
  order?: {
    _id: string;
    paymentId: string;
    totalAmount: string;
    event: string;
    buyer: string;
  };
}

interface VerifyPaymentRequest {
  status: string;
  tx_ref: string;
  transaction_id: string;
}

interface VerifyPaymentResponse {
  success: boolean;
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
    initializePayment: builder.mutation<InitializePaymentResponse, InitializePaymentRequest>({
      query: ({ eventId, amount }) => ({
        url: "initialize",
        method: "POST",
        body: {
          eventId,
          amount,
        },
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),
    verifyPayment: builder.query<VerifyPaymentResponse, VerifyPaymentRequest>({
      query: ({ status, tx_ref, transaction_id }) => ({
        url: "verify-payment",
        method: "GET",
        params: {
          status,
          tx_ref,
          transaction_id,
        },
        credentials: "include",
      }),
      providesTags: (result) => [
        { type: "Order", id: result?.order?._id },
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
