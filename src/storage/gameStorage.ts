import { GameSummary, PlayerStats, DifficultyLevel } from '../types/chess';

const STORAGE_KEY = 'dr_drona_chess_stats_v2';

const DEFAULT_DIFFICULTY_RECORD: Record<DifficultyLevel, { games: number; wins: number; losses: number; draws: number }> = {
  Beginner: { games: 0, wins: 0, losses: 0, draws: 0 },
  Easy: { games: 0, wins: 0, losses: 0, draws: 0 },
  Intermediate: { games: 0, wins: 0, losses: 0, draws: 0 },
  Advanced: { games: 0, wins: 0, losses: 0, draws: 0 },
  Expert: { games: 0, wins: 0, losses: 0, draws: 0 },
  Master: { games: 0, wins: 0, losses: 0, draws: 0 }
};

export function getPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') {
    return createInitialStats();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialStats();
      savePlayerStats(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return createInitialStats();
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage quota or disabled
  }
}

export function resetPlayerStats(): PlayerStats {
  const fresh = createInitialStats();
  savePlayerStats(fresh);
  return fresh;
}

export function recordCompletedGame(game: GameSummary): PlayerStats {
  const stats = getPlayerStats();

  stats.totalGames += 1;
  if (game.result === 'win') stats.wins += 1;
  else if (game.result === 'loss') stats.losses += 1;
  else if (game.result === 'draw') stats.draws += 1;

  // Update difficulty stats
  const diff = stats.difficultyStats[game.difficulty] || { games: 0, wins: 0, losses: 0, draws: 0 };
  diff.games += 1;
  if (game.result === 'win') diff.wins += 1;
  else if (game.result === 'loss') diff.losses += 1;
  else if (game.result === 'draw') diff.draws += 1;
  stats.difficultyStats[game.difficulty] = diff;

  // Update opening stats
  if (game.openingName) {
    const op = stats.openingsStats[game.openingName] || { played: 0, wins: 0, losses: 0, draws: 0 };
    op.played += 1;
    if (game.result === 'win') op.wins += 1;
    else if (game.result === 'loss') op.losses += 1;
    else if (game.result === 'draw') op.draws += 1;
    stats.openingsStats[game.openingName] = op;
  }

  // Update average accuracy
  if (stats.totalGames === 1) {
    stats.averageAccuracy = game.playerAccuracy;
  } else {
    const totalAcc = stats.averageAccuracy * (stats.totalGames - 1) + game.playerAccuracy;
    stats.averageAccuracy = Math.round(totalAcc / stats.totalGames);
  }

  // Update frequent mistakes based on classifications
  if (game.classifications.blunder > 0) {
    let forkMistake = stats.frequentMistakes.find(m => m.category.includes('Fork') || m.category.includes('Blunder'));
    if (!forkMistake) {
      stats.frequentMistakes.push({
        category: 'Tactical Blunders & Knight Forks',
        count: game.classifications.blunder,
        advice: 'Look for active pieces under threat before making moves.'
      });
    } else {
      forkMistake.count += game.classifications.blunder;
    }
  }

  if (game.classifications.mistake > 0) {
    let castlingMistake = stats.frequentMistakes.find(m => m.category.includes('King') || m.category.includes('Castling'));
    if (!castlingMistake) {
      stats.frequentMistakes.push({
        category: 'King Safety & Defense',
        count: game.classifications.mistake,
        advice: 'Castle early and safeguard central files.'
      });
    } else {
      castlingMistake.count += game.classifications.mistake;
    }
  }

  // Prepend recent games (keep last 20)
  stats.recentGames = [game, ...stats.recentGames.slice(0, 19)];

  savePlayerStats(stats);
  return stats;
}

export function createInitialStats(): PlayerStats {
  return {
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    averageAccuracy: 0,
    difficultyStats: { ...DEFAULT_DIFFICULTY_RECORD },
    frequentMistakes: [],
    openingsStats: {},
    endgameConversionRate: 0,
    recentGames: []
  };
}

/**
 * Generates personalized training tasks based on the player's history
 */
export function generatePersonalizedPlan(stats: PlayerStats) {
  const plan = [];

  // Opening task
  let lowestOpening = 'Italian Game';
  if (Object.keys(stats.openingsStats).length > 0) {
    let minRate = 1;
    for (const [name, data] of Object.entries(stats.openingsStats)) {
      if (data.played >= 1) {
        const rate = data.wins / data.played;
        if (rate <= minRate) {
          minRate = rate;
          lowestOpening = name;
        }
      }
    }
  }

  plan.push({
    id: 'plan-opening',
    title: lowestOpening,
    tag: 'Opening Repertoire',
    difficulty: 'Adaptive',
    metric: stats.totalGames > 0 ? `${stats.wins} Wins` : 'New Repertoire',
    action: 'openings'
  });

  // Tactics task
  const topMistake = stats.frequentMistakes.length > 0 ? stats.frequentMistakes[0] : null;
  plan.push({
    id: 'plan-tactics',
    title: topMistake ? topMistake.category : 'Knight Fork Tactics',
    tag: 'Tactics & Calculation',
    difficulty: 'Intermediate',
    metric: topMistake ? `${topMistake.count} Errors` : 'Diagnostic Ready',
    action: 'tactics'
  });

  // Endgame task
  plan.push({
    id: 'plan-endgame',
    title: 'King & Pawn Opposition',
    tag: 'Endgame Conversion',
    difficulty: 'Beginner',
    metric: stats.endgameConversionRate > 0 ? `${stats.endgameConversionRate}% Conversion` : 'Practice Ready',
    action: 'endgames'
  });

  return plan;
}
