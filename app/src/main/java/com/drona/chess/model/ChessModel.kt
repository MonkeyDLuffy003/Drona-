package com.drona.chess.model

enum class PieceType(val symbol: String, val value: Int) {
    PAWN("P", 100),
    KNIGHT("N", 320),
    BISHOP("B", 330),
    ROOK("R", 500),
    QUEEN("Q", 900),
    KING("K", 20000);

    fun getDisplaySymbol(isWhite: Boolean): String = when (this) {
        PAWN -> if (isWhite) "♙" else "♟"
        KNIGHT -> if (isWhite) "♘" else "♞"
        BISHOP -> if (isWhite) "♗" else "♝"
        ROOK -> if (isWhite) "♖" else "♜"
        QUEEN -> if (isWhite) "♕" else "♛"
        KING -> if (isWhite) "♔" else "♚"
    }
}

enum class PieceColor {
    WHITE, BLACK;

    fun opposite(): PieceColor = if (this == WHITE) BLACK else WHITE
}

data class Piece(
    val type: PieceType,
    val color: PieceColor,
    val hasMoved: Boolean = false
)

data class Square(
    val file: Int, // 0..7 (a..h)
    val rank: Int  // 0..7 (1..8)
) {
    val algebraic: String
        get() = "${('a' + file)}${rank + 1}"

    val isLight: Boolean
        get() = (file + rank) % 2 != 0

    companion object {
        fun fromAlgebraic(alg: String): Square? {
            if (alg.length != 2) return null
            val f = alg[0].lowercaseChar() - 'a'
            val r = alg[1] - '1'
            if (f in 0..7 && r in 0..7) {
                return Square(f, r)
            }
            return null
        }
    }
}

data class Move(
    val from: Square,
    val to: Square,
    val piece: Piece,
    val capturedPiece: Piece? = null,
    val isEnPassant: Boolean = false,
    val isCastling: Boolean = false,
    val promotion: PieceType? = null,
    val san: String = ""
)

enum class GameStatus {
    ACTIVE,
    CHECK,
    CHECKMATE,
    STALEMATE,
    DRAW_REPETITION,
    DRAW_INSUFFICIENT_MATERIAL,
    DRAW_FIFTY_MOVES,
    RESIGNED;

    val isGameOver: Boolean
        get() = this in listOf(CHECKMATE, STALEMATE, DRAW_REPETITION, DRAW_INSUFFICIENT_MATERIAL, DRAW_FIFTY_MOVES, RESIGNED)

    val isDraw: Boolean
        get() = this in listOf(STALEMATE, DRAW_REPETITION, DRAW_INSUFFICIENT_MATERIAL, DRAW_FIFTY_MOVES)
}

enum class GameMode {
    VS_AI,
    TWO_PLAYER,
    PUZZLES,
    TRAINING
}

enum class AiDifficulty(val label: String, val rating: String, val depth: Int) {
    BEGINNER("Beginner", "~500", 1),
    EASY("Easy", "~900", 2),
    INTERMEDIATE("Intermediate", "~1300", 3),
    ADVANCED("Advanced", "~1700", 4),
    MASTER("Master", "~2200+", 5)
}
