import { addDays, format, startOfWeek } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";

import { Week } from "../types/room";

export function getWeekName(week: Week, lang?: string): string {
  const t = addDays(startOfWeek(new Date()), week);
  return format(t, "iii", { locale: lang?.startsWith("zh") ? zhCN : enUS });
}

export function getWeekNames(weeks: Week[], lang?: string): string {
  return weeks.map(week => getWeekName(week, lang)).join(lang?.startsWith("zh") ? "、" : ", ");
}

export const formatInviteCode = (uuid: string, inviteCode?: string): string => {
  if (inviteCode && /^\d{10}$/.test(inviteCode)) {
    // 123456789 -> 123 456 7890
    return inviteCode.slice(0, 3) + " " + inviteCode.slice(3, 6) + " " + inviteCode.slice(6);
  }
  return uuid;
};
