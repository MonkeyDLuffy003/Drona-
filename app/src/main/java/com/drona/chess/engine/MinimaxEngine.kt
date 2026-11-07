package com.drona.chess.engine

import com.drona.chess.model.*
import kotlin.random.Random

class MinimaxEngine {

    data class EvaluationResult(
        val bestMove: Move?,
        val scoreCp: Int // Centipawns from perspective of side to move
    )

    private val pawnPST = intArrayOf(
        0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
    )

    private val knightPST = intArrayOf(
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    )

    private val bishopPST = intArrayOf(
        -20,-10,-10,-10,-10,-10,-10,-20,
        -10,  0,  0,  0,  0,  0,  0,-10,
        -10,  0,  5, 10, 10,  5,  0,-10,
        -10,  5,  5, 10, 10,  5,  5,-10,
        -10,  0, 10, 10, 10, 10,  0,-10,
        -10, 10, 10, 10, 10, 10, 10,-10,
        -10,  5,  0,  0,  0,  0,  5,-10,
        -20,-10,-10,-10,-10,-10,-10,-20
    )

    fun findBestMove(
        board: ChessBoard,
        difficulty: AiDifficulty
    ): EvaluationResult {
        val legalMoves = board.getAllLegalMoves(board.turn)
        if (legalMoves.isEmpty()) return EvaluationResult(null, 0)

        // Lower difficulty handicap / blunder rate
        when (difficulty) {
            AiDifficulty.BEGINNER -> {
                if (Random.nextFloat() < 0.40f && legalMoves.size > 1) {
                    return EvaluationResult(legalMoves.random(), evaluateBoard(board, board.turn))
                }
            }
            AiDifficulty.EASY -> {
                if (Random.nextFloat() < 0.25f && legalMoves.size > 2) {
                    val sub = legalMoves.take(3).random()
                    return EvaluationResult(sub, evaluateBoard(board, board.turn))
                }
            }
            else -> {}
        }

        val depth = difficulty.depth
        val isMaximizing = true // Relative to side to move
        val activeColor = board.turn

        var bestMove: Move? = null
        var bestScore = -99999
        val alpha = -99999
        val beta = 99999

        // Sort moves: Captures first for Alpha-Beta efficiency
        val sortedMoves = legalMoves.sortedByDescending {
            (it.capturedPiece?.type?.value ?: 0) - (it.piece.type.value / 10)
        }

        for (m in sortedMoves) {
            val score = -minimax(board, m, depth - 1, -beta, -alpha, activeColor.opposite())
            if (score > bestScore) {
                bestScore = score
                bestMove = m
            }
        }

        return EvaluationResult(bestMove ?: legalMoves.first(), bestScore)
    }

    private fun minimax(
        board: ChessBoard,
        move: Move,
        depth: Int,
        alpha: Int,
        beta: Int,
        sideToMove: PieceColor
    ): Int {
        // Evaluate position if depth reached
        if (depth <= 0) {
            return evaluateBoard(board, sideToMove)
        }

        val legalMoves = board.getAllLegalMoves(sideToMove)
        if (legalMoves.isEmpty()) {
            return if (board.isKingInCheck(sideToMove)) -20000 - depth else 0 // Checkmate or Stalemate
        }

        var currentAlpha = alpha
        for (m in legalMoves) {
            val score = -minimax(board, m, depth - 1, -beta, -currentAlpha, sideToMove.opposite())
            if (score >= beta) return beta
            if (score > currentAlpha) {
                currentAlpha = score
            }
        }
        return currentAlpha
    }

    fun evaluateBoard(board: ChessBoard, perspectiveColor: PieceColor): Int {
        var whiteScore = 0
        var blackScore = 0

        for (r in 0..7) {
            for (f in 0..7) {
                val piece = board.getPiece(Square(f, r)) ?: continue
                val baseVal = piece.type.value
                val index = (7 - r) * 8 + f
                val pstVal = when (piece.type) {
                    PieceType.PAWN -> pawnPST[index]
                    PieceType.KNIGHT -> knightPST[index]
                    PieceType.BISHOP -> bishopPST[index]
                    else -> 0
                }

                if (piece.color == PieceColor.WHITE) {
                    whiteScore += (baseVal + pstVal)
                } else {
                    blackScore += (baseVal + pstVal)
                }
            }
        }

        val diff = whiteScore - blackScore
        return if (perspectiveColor == PieceColor.WHITE) diff else -diff
    }
}
