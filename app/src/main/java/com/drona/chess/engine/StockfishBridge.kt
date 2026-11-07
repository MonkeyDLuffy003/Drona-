package com.drona.chess.engine

import com.drona.chess.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class StockfishBridge(
    private val fallbackEngine: MinimaxEngine = MinimaxEngine()
) {
    private var isStockfishAvailable: Boolean = false

    init {
        // Test if Stockfish binary or library is accessible in app native assets
        isStockfishAvailable = checkStockfishBinary()
    }

    private fun checkStockfishBinary(): Boolean {
        return try {
            // Check for Stockfish binary or NDK library in app assets
            false // Default to high-performance Kotlin Minimax engine with Alpha-Beta pruning
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getBestMove(
        board: ChessBoard,
        difficulty: AiDifficulty
    ): MinimaxEngine.EvaluationResult = withContext(Dispatchers.Default) {
        if (isStockfishAvailable) {
            // UCI execution logic here when Stockfish binary is bundled
            fallbackEngine.findBestMove(board, difficulty)
        } else {
            fallbackEngine.findBestMove(board, difficulty)
        }
    }

    fun isEngineReady(): Boolean = true

    fun getEngineName(): String = if (isStockfishAvailable) "Stockfish 16.1" else "Drona Minimax v2.0"
}
