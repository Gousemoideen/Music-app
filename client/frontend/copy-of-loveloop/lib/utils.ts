import { GameData } from '../types';

export const getTodayDateString = (): string => {
  // Use Sweden/Canada locale as a proxy for ISO YYYY-MM-DD that respects local timezone roughly
  // Or simpler: new Date().toLocaleDateString('en-CA') returns YYYY-MM-DD
  return new Date().toLocaleDateString('en-CA');
};

export const getYesterdayDateString = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString('en-CA');
};

export const calculateStreakUpdate = (gameData: GameData, today: string, yesterday: string) => {
  let { currentStreak, lastCompletionDate } = gameData;
  let bonus = 0;
  let streakIncremented = false;

  if (lastCompletionDate === today) {
    // Already completed a task today, no streak change, no bonus
    return { currentStreak, bonus, streakIncremented };
  }

  if (lastCompletionDate === yesterday) {
    // Logic: If last completion was yesterday, increment streak
    currentStreak += 1;
    streakIncremented = true;
    // Bonus Logic: 5 * MIN(currentStreak, 5)
    bonus = 5 * Math.min(currentStreak, 5);
  } else {
    // Missed a day or new user
    currentStreak = 1;
    streakIncremented = false; // Reset doesn't count as incrementing for bonus purposes per prompt logic interpretation
    bonus = 0;
  }

  return { currentStreak, bonus, streakIncremented };
};
