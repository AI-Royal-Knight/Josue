import { parseDate, getLocalTimeZone } from "@internationalized/date";
const date = parseDate("2023-10-15");
console.log(date.toDate(getLocalTimeZone()));
