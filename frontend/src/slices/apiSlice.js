import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";

const baseQuery = retry(fetchBaseQuery({ baseUrl: BASE_URL }), {
  maxRetries: 3,
  retryCondition: (error) => error.status === "FETCH_ERROR",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Product", "Order", "User", "GalleryProject"],
  endpoints: (builder) => ({}),
});
