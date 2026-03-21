const parseCalendarDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const normalizedValue = String(dateValue).trim();
  const match = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (match) {
    const [, year, month, day] = match;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsed = new Date(normalizedValue);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const formatCalendarDate = (dateValue) => {
  const parsed = parseCalendarDate(dateValue);

  if (!parsed) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
};

export const getCalendarDateInputValue = (dateValue) => {
  const parsed = parseCalendarDate(dateValue);

  if (!parsed) {
    return "";
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
