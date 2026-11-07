import { OpeningData } from '../types/chess';

export const OPENINGS_DATABASE: OpeningData[] = [
  {
    eco: 'C50',
    name: 'Italian Game',
    variation: 'Giuoco Piano',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5'],
    description: 'One of the oldest and most foundational openings. White develops the bishop to target the sensitive f7 square, preparing rapid kingside castling.',
    principles: [
      'Control the central d4 and e4 squares.',
      'Target Black\'s vulnerable f7 pawn before they castle.',
      'Maintain flexible pawn structure with c3 and d3.',
      'Castle early to secure king safety.'
    ],
    recommendedFor: 'White',
    traps: [
      {
        name: 'Blackburne Shilling Gambit Trap',
        description: 'Black baits White to capture on e5 with 4...Nd4?!, leading to a queen assault.',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4?!', 'Nxe5?!', 'Qg5!', 'Nxf7', 'Qxg2', 'Rf1', 'Qxe4+', 'Be2', 'Nf3#'],
        warning: 'Do not grab the "free" e5 pawn with Nxe5 when the knight drops back to d4! Instead castle or play Nxd4.'
      }
    ]
  },
  {
    eco: 'C57',
    name: 'Italian Game',
    variation: 'Two Knights Defense / Fried Liver Attack',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5?!', 'Nxf7!'],
    description: 'A sharp, aggressive line where White sacrifices a knight on f7 to draw Black\'s king into the center under heavy crossfire.',
    principles: [
      'As White, attack the f7 point when Black plays 3...Nf6.',
      'As Black, counter with 5...Na5! instead of recapturing on d5 with the knight.',
      'Active piece play compensates for material in dynamic lines.'
    ],
    recommendedFor: 'Both',
    traps: [
      {
        name: 'The Fried Liver Attack',
        description: 'White forks Black\'s queen and rook with Nxf7, exposing the black king to a devastating attack by Qf3+.',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Nxd5', 'Nxf7', 'Kxf7', 'Qf3+', 'Ke6', 'Nc3'],
        warning: 'Black must never play 5...Nxd5?!. The only correct grandmaster defense is 5...Na5! attacking the bishop.'
      }
    ]
  },
  {
    eco: 'B90',
    name: 'Sicilian Defense',
    variation: 'Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
    description: 'The weapon of world champions Garry Kasparov and Bobby Fischer. Black fights asymmetrically for the win by controlling the b5 square and preparing Queenside expansion.',
    principles: [
      'Deny White\'s knights and light-squared bishop the b5 outpost with ...a6.',
      'Maintain an asymmetric pawn structure on the c-file.',
      'Counterattack White\'s central pawn center with ...e5 or ...e6.'
    ],
    recommendedFor: 'Black',
    traps: [
      {
        name: 'Adams Attack Sacrifice Trap',
        description: 'White pushes h4 and g4 rapidly to rip open Black\'s king shelter.',
        moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'h3', 'e5', 'Nde2', 'h5', 'Bg5'],
        warning: 'Beware of premature ...b5 pushes when White has rook battery on the open a-file.'
      }
    ]
  },
  {
    eco: 'B70',
    name: 'Sicilian Defense',
    variation: 'Dragon Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'g6'],
    description: 'Named for Black\'s pawn formation resembling the Draco constellation. Black fianchettos the dark-squared bishop onto the long diagonal h8-a1.',
    principles: [
      'The "Dragon Bishop" on g7 is Black\'s powerhouse piece.',
      'Exchange sacrifices on c3 (...Rxc3!) are standard tactical weapons.',
      'Opposite-side castling leads to a race to checkmate.'
    ],
    recommendedFor: 'Black'
  },
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    variation: 'General / Open',
    moves: ['e4', 'c5'],
    description: 'The most popular and combative response to 1. e4. Black unbalances the position from move one, creating dynamic winning chances.',
    principles: [
      'Exchange Black\'s c-pawn for White\'s d-pawn to secure central pawn superiority.',
      'Use the half-open c-file for active rook pressure.',
      'Do not rush castling if the opponent\'s king is uncommitted.'
    ],
    recommendedFor: 'Black'
  },
  {
    eco: 'C60',
    name: 'Ruy Lopez',
    variation: 'Spanish Opening',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    description: 'The most deeply studied opening in chess history. White puts immediate pressure on the defender of the e5 pawn.',
    principles: [
      'Pressure Black\'s knight on c6 to weaken Black\'s hold on e5.',
      'Prepare d4 after c3 to form a commanding pawn duo.',
      'Preserve the Spanish Bishop with Bb3 if attacked.'
    ],
    recommendedFor: 'White',
    traps: [
      {
        name: 'Noah\'s Ark Trap',
        description: 'Black traps White\'s light-squared bishop on b3 using a pawn chain: a6, b5, and c4.',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'd6', 'd4', 'b5', 'Bb3', 'Nxd4', 'Nxd4', 'exd4', 'Qxd4??', 'c5', 'Qd5', 'Be6', 'Qc6+', 'Bd7', 'Qd5', 'c4'],
        warning: 'White must never play 8. Qxd4? because 8...c5 traps the bishop on b3 with ...c4!'
      },
      {
        name: 'Fishing Pole Trap',
        description: 'Black baits White with ...Ng4 and ...h5, opening the h-file for a deadly queen + rook mate.',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'Nf6', 'O-O', 'Ng4?!', 'h3', 'h5!?', 'hxg4?', 'hxg4', 'Nh2', 'Qh4!'],
        warning: 'White must resist taking the knight on g4 with hxg4? when Black has played h5.'
      }
    ]
  },
  {
    eco: 'D06',
    name: 'Queen\'s Gambit',
    variation: 'General',
    moves: ['d4', 'd5', 'c4'],
    description: 'White offers a side pawn (c4) to dismantle Black\'s central stronghold on d5 and seize total center control with e4.',
    principles: [
      'Contest Black\'s d5 pawn to gain superior central presence.',
      'The gambit pawn can almost always be recovered favorably.',
      'Develop knights to c3 and f3 with harmonious piece play.'
    ],
    recommendedFor: 'White',
    traps: [
      {
        name: 'Elephant Trap',
        description: 'In the Queen\'s Gambit Declined, Black springs a tactical counter-trap with ...Nxd5! sacrificing their queen for mate or bishop win.',
        moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Nbd7', 'cxd5', 'exd5', 'Nxd5?!', 'Nxd5!', 'Bxd8', 'Bb4+', 'Qd2', 'Bxd2+', 'Kxd2', 'Kxd8'],
        warning: 'White should not play 7. Nxd5? thinking the d7 knight is pinned. It isn\'t!'
      }
    ]
  },
  {
    eco: 'C10',
    name: 'French Defense',
    variation: 'General',
    moves: ['e4', 'e6', 'd4', 'd5'],
    description: 'A resilient, counter-attacking fortress. Black allows White a space advantage in exchange for a rock-solid pawn chain to target later with ...c5 and ...f6.',
    principles: [
      'Attack the base of White\'s pawn chain with ...c5.',
      'Solve the problem of the "bad" light-squared French bishop on c8.',
      'Use the f6 break when ready to challenge White\'s e5 wedge.'
    ],
    recommendedFor: 'Black'
  },
  {
    eco: 'B10',
    name: 'Caro-Kann Defense',
    variation: 'Classical / Advance',
    moves: ['e4', 'c6', 'd4', 'd5'],
    description: 'An exceptionally dependable defense beloved by Anatoly Karpov. Black prepares ...d5 while keeping the c8 bishop free to develop to f5 or g4.',
    principles: [
      'Develop the light-squared bishop outside the pawn chain before playing ...e6.',
      'Maintain an unbroken pawn fortress with minimal structural weaknesses.',
      'Contest the center with ...c5 breaks in the endgame.'
    ],
    recommendedFor: 'Black'
  },
  {
    eco: 'E60',
    name: 'King\'s Indian Defense',
    variation: 'General',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7'],
    description: 'A dynamic, hypermodern defense where Black allows White to occupy the center, only to launch a blistering kingside storm with ...f5.',
    principles: [
      'Fianchetto the king\'s bishop on g7.',
      'Strike back in the center with ...e5 or ...c5.',
      'Launch kingside pawn storms (f5, g5, f4) once the center is locked.'
    ],
    recommendedFor: 'Black'
  },
  {
    eco: 'D02',
    name: 'London System',
    variation: 'Modern',
    moves: ['d4', 'd5', 'Bf4', 'Nf6', 'e3'],
    description: 'A remarkably solid and universal opening system for White. White develops the dark-squared bishop early to f4 before locking the pawn pyramid with e3 and c3.',
    principles: [
      'Develop the bishop to f4 before playing e3.',
      'Create an unbreakable pawn triangle with c3, d4, and e3.',
      'Plant a powerhouse knight outpost on e5.'
    ],
    recommendedFor: 'White'
  }
];

/**
 * Identifies the opening and variation based on played moves
 */
export function identifyOpening(sanMoves: string[]): {
  opening: OpeningData | null;
  isInTheory: boolean;
  movesMatched: number;
  variationName: string;
} {
  if (sanMoves.length === 0) {
    return { opening: null, isInTheory: true, movesMatched: 0, variationName: 'Starting Position' };
  }

  let bestMatch: OpeningData | null = null;
  let maxMatchedMoves = 0;

  for (const op of OPENINGS_DATABASE) {
    let matched = 0;
    for (let i = 0; i < op.moves.length && i < sanMoves.length; i++) {
      if (op.moves[i] === sanMoves[i]) {
        matched++;
      } else {
        break;
      }
    }

    if (matched > maxMatchedMoves) {
      maxMatchedMoves = matched;
      bestMatch = op;
    }
  }

  const isInTheory = bestMatch ? maxMatchedMoves === sanMoves.length : false;
  const variationName = bestMatch 
    ? (bestMatch.variation ? `${bestMatch.name}: ${bestMatch.variation}` : bestMatch.name)
    : 'Custom Opening';

  return {
    opening: bestMatch,
    isInTheory,
    movesMatched: maxMatchedMoves,
    variationName
  };
}
