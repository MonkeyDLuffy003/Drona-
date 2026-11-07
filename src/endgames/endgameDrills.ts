import { EndgameDrill } from '../types/chess';

export const ENDGAME_DRILLS: EndgameDrill[] = [
  {
    id: 'opposition-basic',
    title: 'King & Pawn: The Direct Opposition',
    category: 'king-pawn',
    difficulty: 'Beginner',
    fen: '8/8/4k3/8/4K3/4P3/8/8 w - - 0 1',
    turn: 'w',
    targetObjective: 'Promote the e-pawn to a Queen using King opposition and outflanking.',
    keyConcepts: [
      'Take the vertical opposition when the Kings face each other with an odd number of squares between them.',
      'Place your King in front of your passed pawn, not behind it.',
      'Outflank the enemy King to establish key squares on the 6th rank.'
    ],
    drDronaHint: 'Step forward with your King! The rule of key squares dictates that the King must lead the pawn.',
    maxMoves: 15
  },
  {
    id: 'lucena-position',
    title: 'Rook Endgame: Lucena "Building the Bridge"',
    category: 'rook',
    difficulty: 'Advanced',
    fen: '1K1k4/1P1r4/8/8/8/8/2R5/8 w - - 0 1',
    turn: 'w',
    targetObjective: 'Shelter your King from Black\'s rook checks and promote the pawn.',
    keyConcepts: [
      'The winning method discovered by Lucena in 1497: Building a bridge.',
      'Place the rook on the 4th rank (1. Rc4!).',
      'Walk your King out; when Black checks, use the 4th rank rook to block the check.'
    ],
    drDronaHint: 'First maneuver your rook to the 4th rank with Rc4. Then march your King out to b7!',
    maxMoves: 12
  },
  {
    id: 'philidor-defense',
    title: 'Rook Endgame: Philidor\'s 3rd Rank Defense',
    category: 'rook',
    difficulty: 'Intermediate',
    fen: '7k/8/8/4K3/4P3/8/5r2/3R4 b - - 0 1',
    turn: 'b',
    targetObjective: 'Hold the draw as Black against White\'s passed e-pawn.',
    keyConcepts: [
      'Keep your rook on the 3rd rank (or 6th rank from White\'s view) to prevent the enemy King from advancing.',
      'As soon as White pushes the pawn forward, immediately drop your rook to the 1st rank.',
      'Deliver endless rear checks because the White King has no shelter behind its pawn.'
    ],
    drDronaHint: 'Keep your rook on the 6th rank! Once the pawn advances to e5, immediately retreat your rook to the 1st rank for rear checks.',
    maxMoves: 14
  },
  {
    id: 'queen-vs-pawn7th',
    title: 'Queen vs Pawn on the 7th Rank',
    category: 'queen',
    difficulty: 'Intermediate',
    fen: '8/8/8/8/8/4k3/7p/4K1Q1 w - - 0 1',
    turn: 'w',
    targetObjective: 'Stop the Black h-pawn and deliver checkmate.',
    keyConcepts: [
      'Use staircase checks to force the enemy King to step in front of its pawn.',
      'While the enemy King blocks its own pawn, use that free tempo to march your King closer.',
      'Once your King arrives, capture the pawn or deliver checkmate.'
    ],
    drDronaHint: 'Check the Black king and force it onto h1! Then bring your white king closer on each tempo.',
    maxMoves: 16
  },
  {
    id: 'ladder-mate',
    title: 'Checkmating Pattern: Two Rooks Ladder Mate',
    category: 'mating-patterns',
    difficulty: 'Beginner',
    fen: '8/8/4k3/8/8/8/R7/1R2K3 w - - 0 1',
    turn: 'w',
    targetObjective: 'Checkmate the lone Black King using the ladder technique.',
    keyConcepts: [
      'One rook acts as a fence preventing the King from coming forward.',
      'The second rook delivers check to push the King back another rank.',
      'Alternate the rooks until the King is pushed to the 8th rank and checkmated.'
    ],
    drDronaHint: 'Establish a fence with one rook on the 4th rank, then strike with the other rook on the 5th rank!',
    maxMoves: 10
  },
  {
    id: 'king-queen-mate',
    title: 'Checkmating Pattern: King & Queen vs Lone King',
    category: 'mating-patterns',
    difficulty: 'Beginner',
    fen: '8/8/4k3/8/8/8/4Q3/4K3 w - - 0 1',
    turn: 'w',
    targetObjective: 'Drive the Black King to the edge of the board and deliver checkmate.',
    keyConcepts: [
      'Keep the Queen at a "Knight\'s distance" from the enemy King to shrink the box.',
      'Never stalemate! Always make sure the enemy King has at least one legal square.',
      'Bring your King forward for the final kiss of death.'
    ],
    drDronaHint: 'Shrink the box with your Queen at knight\'s distance. Avoid stalemate on the corner squares!',
    maxMoves: 15
  }
];
