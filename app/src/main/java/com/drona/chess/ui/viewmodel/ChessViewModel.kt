package com.drona.chess.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.drona.chess.coach.AndroidVoiceManager
import com.drona.chess.coach.DronaCoach
import com.drona.chess.data.GamePreferences
import com.drona.chess.engine.ChessBoard
import com.drona.chess.engine.MinimaxEngine
import com.drona.chess.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChessUiState(
    val board: ChessBoard = ChessBoard(),
    val selectedSquare: Square? = null,
    val legalDestinations: List<Square> = emptyList(),
    val lastMove: Move? = null,
    val gameStatus: GameStatus = GameStatus.ACTIVE,
    val gameMode: GameMode = GameMode.VS_AI,
    val aiDifficulty: AiDifficulty = AiDifficulty.INTERMEDIATE,
    val playerColor: PieceColor = PieceColor.WHITE,
    val isAiThinking: Boolean = false,
    val coachAdvice: DronaCoach.CoachingAdvice? = null,
    val isVoiceEnabled: Boolean = true,
    val isListening: Boolean = false,
    val evaluationCp: Int = 0
)

class ChessViewModel(application: Application) : AndroidViewModel(application) {

    private val preferences = GamePreferences(application)
    private val voiceManager = AndroidVoiceManager(application)
    private val coach = DronaCoach()
    private val minimaxEngine = MinimaxEngine()

    private val _uiState = MutableStateFlow(
        ChessUiState(
            isVoiceEnabled = preferences.isVoiceEnabled
        )
    )
    val uiState: StateFlow<ChessUiState> = _uiState.asStateFlow()

    init {
        voiceManager.onVoiceCommandReceived = { command ->
            handleVoiceCommand(command)
        }

        viewModelScope.launch {
            voiceManager.isListening.collect { listening ->
                _uiState.value = _uiState.value.copy(isListening = listening)
            }
        }
    }

    fun onSquareClicked(square: Square) {
        val state = _uiState.value
        if (state.isAiThinking || state.gameStatus.isGameOver) return

        // If playing vs AI and not player's turn, ignore
        if (state.gameMode == GameMode.VS_AI && state.board.turn != state.playerColor) return

        val selected = state.selectedSquare
        if (selected == null) {
            // Select piece if it matches active turn
            val piece = state.board.getPiece(square)
            if (piece != null && piece.color == state.board.turn) {
                val legalMoves = state.board.getLegalMovesFor(square)
                _uiState.value = state.copy(
                    selectedSquare = square,
                    legalDestinations = legalMoves.map { it.to }
                )
            }
        } else {
            // If clicking already selected square, deselect
            if (selected == square) {
                _uiState.value = state.copy(selectedSquare = null, legalDestinations = emptyList())
                return
            }

            // Attempt move
            val destinationMoves = state.board.getLegalMovesFor(selected)
            val matchingMove = destinationMoves.find { it.to == square }

            if (matchingMove != null) {
                executePlayerMove(selected, square)
            } else {
                // If clicked another piece of same color, select that instead
                val piece = state.board.getPiece(square)
                if (piece != null && piece.color == state.board.turn) {
                    val legalMoves = state.board.getLegalMovesFor(square)
                    _uiState.value = state.copy(
                        selectedSquare = square,
                        legalDestinations = legalMoves.map { it.to }
                    )
                } else {
                    _uiState.value = state.copy(selectedSquare = null, legalDestinations = emptyList())
                }
            }
        }
    }

    private fun executePlayerMove(from: Square, to: Square) {
        val state = _uiState.value
        val board = state.board
        val move = board.makeMove(from, to, PieceType.QUEEN) ?: return

        val status = board.getGameStatus()
        val advice = coach.analyzePosition(board)

        _uiState.value = state.copy(
            selectedSquare = null,
            legalDestinations = emptyList(),
            lastMove = move,
            gameStatus = status,
            coachAdvice = advice,
            evaluationCp = advice.evaluationCp
        )

        // Voice announcement
        if (state.isVoiceEnabled) {
            when {
                status == GameStatus.CHECKMATE -> voiceManager.speak("Checkmate! Outstanding tactical victory.", urgent = true)
                status == GameStatus.CHECK -> voiceManager.speak("Check! Look for king defense.", urgent = true)
                status.isDraw -> voiceManager.speak("Game drawn. It is a tie!", urgent = true)
            }
        }

        if (status.isGameOver) {
            preferences.recordGameResult(
                isWin = status == GameStatus.CHECKMATE && move.piece.color == state.playerColor,
                isDraw = status.isDraw
            )
            return
        }

        // Trigger AI move if VS_AI
        if (state.gameMode == GameMode.VS_AI && board.turn != state.playerColor) {
            triggerAiMove()
        }
    }

    private fun triggerAiMove() {
        _uiState.value = _uiState.value.copy(isAiThinking = true)

        viewModelScope.launch(Dispatchers.Default) {
            delay(500) // Natural thinking delay
            val state = _uiState.value
            val board = state.board
            val result = minimaxEngine.findBestMove(board, state.aiDifficulty)
            val aiMove = result.bestMove

            if (aiMove != null) {
                board.makeMove(aiMove.from, aiMove.to, aiMove.promotion ?: PieceType.QUEEN)
                val status = board.getGameStatus()
                val advice = coach.analyzePosition(board)

                _uiState.value = state.copy(
                    isAiThinking = false,
                    lastMove = aiMove,
                    gameStatus = status,
                    coachAdvice = advice,
                    evaluationCp = advice.evaluationCp
                )

                if (state.isVoiceEnabled) {
                    if (status == GameStatus.CHECKMATE) {
                        voiceManager.speak("Checkmate delivered. Let us review the match.", urgent = true)
                    } else if (status == GameStatus.CHECK) {
                        voiceManager.speak("Check! Drona plays ${aiMove.san}.", urgent = true)
                    } else if (status.isDraw) {
                        voiceManager.speak("Game drawn. It is a tie!", urgent = true)
                    }
                }

                if (status.isGameOver) {
                    preferences.recordGameResult(
                        isWin = false,
                        isDraw = status.isDraw
                    )
                }
            } else {
                _uiState.value = state.copy(isAiThinking = false)
            }
        }
    }

    fun startNewGame(
        color: PieceColor = PieceColor.WHITE,
        difficulty: AiDifficulty = _uiState.value.aiDifficulty,
        mode: GameMode = GameMode.VS_AI
    ) {
        val board = ChessBoard()
        _uiState.value = _uiState.value.copy(
            board = board,
            selectedSquare = null,
            legalDestinations = emptyList(),
            lastMove = null,
            gameStatus = GameStatus.ACTIVE,
            gameMode = mode,
            aiDifficulty = difficulty,
            playerColor = color,
            isAiThinking = false,
            coachAdvice = DronaCoach.CoachingAdvice("New match started. Occupy the center and develop minor pieces.")
        )

        if (_uiState.value.isVoiceEnabled) {
            if (color == PieceColor.BLACK && mode == GameMode.VS_AI) {
                voiceManager.speak("You are playing as Black. Drona AI will make the opening move.", urgent = true)
            } else {
                voiceManager.speak("New game started. You are playing as White. Occupy the center!", urgent = true)
            }
        }

        // If player is Black, AI moves first
        if (mode == GameMode.VS_AI && color == PieceColor.BLACK) {
            triggerAiMove()
        }
    }

    fun requestHint() {
        val state = _uiState.value
        val hint = coach.generateHint(state.board)
        _uiState.value = state.copy(coachAdvice = hint)
        if (state.isVoiceEnabled) {
            voiceManager.speak(hint.message, urgent = true)
        }
    }

    fun toggleVoice() {
        val next = !_uiState.value.isVoiceEnabled
        preferences.isVoiceEnabled = next
        _uiState.value = _uiState.value.copy(isVoiceEnabled = next)
        if (next) {
            voiceManager.speak("Voice guidance enabled.")
        } else {
            voiceManager.stopSpeaking()
        }
    }

    fun toggleListening() {
        if (_uiState.value.isListening) {
            voiceManager.stopListening()
        } else {
            voiceManager.startListening()
        }
    }

    private fun handleVoiceCommand(command: String) {
        val advice = coach.processVoiceCommand(command, _uiState.value.board)
        _uiState.value = _uiState.value.copy(coachAdvice = advice)
        if (_uiState.value.isVoiceEnabled) {
            voiceManager.speak(advice.message, urgent = true)
        }
    }

    fun undoMove() {
        // Implementation for casual modes
        val state = _uiState.value
        if (state.isAiThinking || state.board.moveHistory.isEmpty()) return
        startNewGame(state.playerColor, state.aiDifficulty, state.gameMode)
    }

    override fun onCleared() {
        super.onCleared()
        voiceManager.destroy()
    }
}
