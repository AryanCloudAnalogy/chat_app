  export function formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    const today = new Date();
    const formatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
    });

    const formattedDate = formatter.format(date);
    const formattedToday = formatter.format(today);

    if (formattedDate === formattedToday) {
      return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        hour12: true,
        minute: "2-digit",
      }).format(date);
    }
    return formattedDate;
  }