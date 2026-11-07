package com.drona.chess.data

data class ChessPuzzle(
    val id: String,
    val title: String,
    val theme: String,
    val fen: String,
    val solutionMovesSan: List<String>,
    val explanation: String
)

object PuzzleRepository {
    val puzzles = listOf(
        ChessPuzzle(
            id = "puz-01",
            title = "Scholar's Finish",
            theme = "Checkmate in 1",
            fen = "r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
            solutionMovesSan = listOf("Qxf7#"),
            explanation = "Queen delivers checkmate on the f7 weakness guarded by the bishop."
        ),
        ChessPuzzle(
            id = "puz-02",
            title = "Back-Rank Deliverance",
            theme = "Back Rank Mate",
            fen = "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
            solutionMovesSan = listOf("Rxd8#"),
            explanation = "The black king is trapped behind its own pawns. Rook captures on d8 for back-rank checkmate."
        ),
        ChessPuzzle(
            id = "puz-03",
            title = "Knight Royal Fork",
            theme = "Tactical Fork",
            fen = "r1b1k2r/pp1p1ppp/2n1pn2/q7/2B1P3/2N2N2/PP1Q1PPP/R3K2R w KQkq - 0 8",
            solutionMovesSan = listOf("Nb5"),
            explanation = "Knight threatens both the queen on a5 and the dangerous c7 fork."
        ),
        ChessPuzzle(
            id = "puz-04",
            title = "Smothered Pattern",
            theme = "Smothered Mate",
            fen = "6k1/5ppp/8/8/8/5N2/5PPP/4Q1K1 w - - 0 1",
            solutionMovesSan = listOf("Qe8#"),
            explanation = "The queen invades the eighth rank for a clean back-rank mate."
        ),
        ChessPuzzle(
            id = "puz-05",
            title = "Boden's Mate Cross",
            theme = "Double Bishop Mate",
            fen = "2kr1b1r/pp1n1ppp/2p1pn2/8/2B4q/2NP1Q1P/PPPB1PP1/R4RK1 w - - 0 12",
            solutionMovesSan = listOf("Qxc6+", "bxc6", "Ba6#"),
            explanation = "A queen sacrifice opens up the b-file, allowing the bishop pair to criss-cross the enemy king."
        )
    )
}
