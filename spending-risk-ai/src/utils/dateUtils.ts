export const getTimeZone = (time: string): string => {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 0 && hour <= 5) return '새벽';
  if (hour >= 6 && hour <= 11) return '오전';
  if (hour >= 12 && hour <= 17) return '오후';
  if (hour >= 18 && hour <= 21) return '저녁';
  return '야간';
};

export const getDayOfWeek = (date: string): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(date).getDay()];
};

export const isLateNight = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0], 10);
  // 야간(22:00-23:59) 또는 새벽(00:00-05:59)
  return (hour >= 22 || hour <= 5);
};
