function getDateAfterOneMonth(currentDate, months = 1) {
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + months);
  if (currentDate.getDate() !== nextMonth.getDate()) {
    nextMonth.setDate(0);
  }

  return nextMonth;
}

function getMonthsDifference(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearDiff = end.getFullYear() - start.getFullYear();

  const monthDiff = end.getMonth() - start.getMonth();
  const daysDiff = end.getDate() - start.getDate();

  if (daysDiff > 0) {
    return yearDiff * 12 + monthDiff + 1;
  }
  return yearDiff * 12 + monthDiff;
}

module.exports = { getDateAfterOneMonth, getMonthsDifference };
