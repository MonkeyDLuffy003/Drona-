package com.drona.chess.coach

import com.drona.chess.engine.ChessBoard
import com.drona.chess.engine.MinimaxEngine
import com.drona.chess.model.*

class DronaCoach(
    private val minimaxEngine: MinimaxEngine = MinimaxEngine()
) {

    data class CoachingAdvice(
        val message: String,
        val suggestedMove: Move? = null,
        val evaluationCp: Int = 0,
        val moveClassification: MoveClassification = MoveClassification.GOOD
    )

    enum class MoveClassification(val label: String, val badgeColorHex: String) {
        BRILLIANT("Brilliant", "#22C55E"),
        BEST("Best", "#10B981"),
        EXCELLENT("Excellent", "#3B82F6"),
        GOOD("Good", "#8B5CF6"),
        INACCURACY("Inaccuracy", "#F59E0B"),
        MISTAKE("Mistake", "#F97316"),
        BLUNDER("Blunder", "#EF4444")
    }

    fun generateHint(board: ChessBoard): CoachingAdvice {
        val result = minimaxEngine.findBestMove(board, AiDifficulty.ADVANCED)
        val move = result.bestMove ?: return CoachingAdvice("No moves available. Calculate king safety.")

        val pieceName = move.piece.type.name.lowercase().replaceFirstChar { it.uppercase() }
        val reason = when (move.piece.type) {
            PieceType.PAWN -> "Control the center and create forward space for your minor pieces."
            PieceType.KNIGHT -> "Improve piece activity and eye strong outpost squares in enemy territory."
            PieceType.BISHOP -> "Occupy an open diagonal to contest the center and pin opponent pieces."
            PieceType.ROOK -> "Place your rook on an open or semi-open file to pressure files."
            PieceType.QUEEN -> "Mobilize your queen to a safe, influential coordination square."
            PieceType.KING -> "Prioritize king safety and secure castling defense."
        }

        return CoachingAdvice(
            message = "Consider $pieceName to ${move.to.algebraic}. $reason",
            suggestedMove = move,
            evaluationCp = result.scoreCp,
            moveClassification = MoveClassification.BEST
        )
    }

    fun analyzePosition(board: ChessBoard): CoachingAdvice {
        val eval = minimaxEngine.evaluateBoard(board, board.turn)
        val scoreFormatted = (eval / 100.0)
        val side = if (board.turn == PieceColor.WHITE) "White" else "Black"

        val assessment = when {
            eval > 300 -> "$side holds a decisive winning advantage. Look for tactical simplifications."
            eval > 100 -> "$side is slightly better with superior center control and piece harmony."
            eval in -100..100 -> "The game is balanced and dynamic. Focus on piece coordination."
            eval in -300..-101 -> "$side is under positional pressure. Maintain king safety and avoid loose pieces."
            else -> "$side is in a difficult position. Defend resiliently and seek counterplay."
        }

        val hint = generateHint(board)
        return CoachingAdvice(
            message = "Evaluation: ${if (scoreFormatted >= 0) "+$scoreFormatted" else "$scoreFormatted"}. $assessment",
            suggestedMove = hint.suggestedMove,
            evaluationCp = eval,
            moveClassification = MoveClassification.GOOD
        )
    }

    fun evaluateMoveQuality(
        beforeBoard: ChessBoard,
        afterBoard: ChessBoard,
        playedMove: Move
    ): MoveClassification {
        val evalBefore = minimaxEngine.evaluateBoard(beforeBoard, playedMove.piece.color)
        val evalAfter = minimaxEngine.evaluateBoard(afterBoard, playedMove.piece.color)
        val delta = evalAfter - evalBefore

        return when {
            delta >= 150 && playedMove.isCapture -> MoveClassification.BRILLIANT
            delta >= 0 -> MoveClassification.BEST
            delta >= -50 -> MoveClassification.EXCELLENT
            delta >= -120 -> MoveClassification.GOOD
            delta >= -220 -> MoveClassification.INACCURACY
            delta >= -350 -> MoveClassification.MISTAKE
            else -> MoveClassification.BLUNDER
        }
    }

    fun processVoiceCommand(command: String, board: ChessBoard): CoachingAdvice {
        val lower = command.lowercase().trim()
        return when {
            lower.contains("hint") || lower.contains("best move") -> {
                generateHint(board)
            }
            lower.contains("analyze") || lower.contains("evaluation") -> {
                analyzePosition(board)
            }
            lower.contains("checkmate") -> {
                CoachingAdvice(
                    message = "Checkmate happens when the king is attacked and has no legal escape, capture, or block square."
                )
            }
            lower.contains("opening") -> {
                CoachingAdvice(
                    message = "In the opening: Control the center with e4/d4, develop knights and bishops early, and castle your king to safety."
                )
            }
            else -> {
                analyzePosition(board)
            }
        }
    }
}
