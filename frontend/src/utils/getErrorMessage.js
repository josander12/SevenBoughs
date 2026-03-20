const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;

  if (typeof error === "string") return error;

  if (typeof error?.data?.message === "string") return error.data.message;

  if (typeof error?.error === "string") return error.error;

  if (typeof error?.message === "string") return error.message;

  return fallback;
};

export default getErrorMessage;
