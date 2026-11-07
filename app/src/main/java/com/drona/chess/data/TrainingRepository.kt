package com.drona.chess.data

data class ChessLesson(
    val id: String,
    val title: String,
    val category: String, // Fundamentals, Openings, Tactics, Endgames
    val fen: String,
    val description: String,
    val principle: String
)

object TrainingRepository {
    val lessons = listOf(
        ChessLesson(
            id = "trn-01",
            title = "Controlling the Center",
            category = "Fundamentals",
            fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            description = "The central squares (e4, d4, e5, d5) control the majority of the board and provide maximum mobility for minor pieces.",
            principle = "Push central pawns early and avoid premature flank pawn advances."
        ),
        ChessLesson(
            id = "trn-02",
            title = "The Italian Game (Giuoco Piano)",
            category = "Openings",
            fen = "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
            description = "1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5. A classical opening aiming for harmonious piece development and king castling.",
            principle = "Develop minor pieces smoothly before launching center breaks."
        ),
        ChessLesson(
            id = "trn-03",
            title = "King & Pawn Endgame: Opposition",
            category = "Endgames",
            fen = "8/8/8/4k3/8/4K3/4P3/8 w - - 0 1",
            description = "Taking the vertical opposition with your king forces the defending king to give way, securing a path to promote the pawn.",
            principle = "Place your king in front of the passed pawn and seize the opposition."
        ),
        ChessLesson(
            id = "trn-04",
            title = "Rook on the 7th Rank",
            category = "Tactics",
            fen = "4r1k1/5ppp/8/8/8/8/4R1PP/6K1 w - - 0 1",
            description = "A rook on the 7th rank restricts the enemy king and attacks uncoordinated baseline pawns simultaneously.",
            principle = "Infiltrate rooks to the 7th rank whenever an open file is available."
        )
    )
}
