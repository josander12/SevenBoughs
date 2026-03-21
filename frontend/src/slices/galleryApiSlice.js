import { GALLERY_URL, UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const galleryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGalleryProjects: builder.query({
      query: ({ pageNumber = 1, keyword = "" } = {}) => ({
        url: `${GALLERY_URL}?pageNumber=${pageNumber}${keyword ? `&keyword=${encodeURIComponent(keyword)}` : ""}`,
      }),
      providesTags: ["GalleryProject"],
      keepUnusedDataFor: 5,
    }),
    getGalleryProjectDetails: builder.query({
      query: (projectId) => ({
        url: `${GALLERY_URL}/${projectId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createGalleryProject: builder.mutation({
      query: (data) => ({
        url: GALLERY_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["GalleryProject"],
    }),
    updateGalleryProject: builder.mutation({
      query: (data) => ({
        url: `${GALLERY_URL}/${data.projectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["GalleryProject"],
    }),
    deleteGalleryProject: builder.mutation({
      query: (projectId) => ({
        url: `${GALLERY_URL}/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GalleryProject"],
    }),
    uploadGalleryImages: builder.mutation({
      query: (formData) => ({
        url: UPLOAD_URL,
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetGalleryProjectsQuery,
  useGetGalleryProjectDetailsQuery,
  useCreateGalleryProjectMutation,
  useUpdateGalleryProjectMutation,
  useDeleteGalleryProjectMutation,
  useUploadGalleryImagesMutation,
} = galleryApiSlice;
