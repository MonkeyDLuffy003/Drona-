package com.drona.chess.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.data.ChessPuzzle
import com.drona.chess.data.PuzzleRepository
import com.drona.chess.engine.ChessBoard
import com.drona.chess.model.PieceColor
import com.drona.chess.model.PieceType
import com.drona.chess.model.Square
import com.drona.chess.ui.components.ChessboardView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PuzzlesScreen(
    onBack: () -> Unit
) {
    var puzzleIndex by remember { mutableIntStateOf(0) }
    val puzzles = PuzzleRepository.puzzles
    val currentPuzzle = puzzles[puzzleIndex % puzzles.size]

    var board by remember(currentPuzzle.id) { mutableStateOf(ChessBoard.fromFen(currentPuzzle.fen)) }
    var selectedSquare by remember(currentPuzzle.id) { mutableStateOf<Square?>(null) }
    var legalDestinations by remember(currentPuzzle.id) { mutableStateOf<List<Square>>(emptyList()) }
    var moveIndex by remember(currentPuzzle.id) { mutableIntStateOf(0) }
    var isSolved by remember(currentPuzzle.id) { mutableStateOf(false) }
    var feedbackMessage by remember(currentPuzzle.id) { mutableStateOf<String?>("Find the best move for White.") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Tactical Puzzles",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            "${currentPuzzle.title} • ${currentPuzzle.theme}",
                            fontSize = 12.sp,
                            color = Color(0xFFFBBF24)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFF1E293B),
                        modifier = Modifier.padding(end = 12.dp)
                    ) {
                        Text(
                            "Puzzle ${puzzleIndex + 1}/${puzzles.size}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF94A3B8),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0A0D1A))
            )
        },
        containerColor = Color(0xFF0A0D1A)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Coach feedback banner
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (isSolved) Color(0xFF064E3B) else Color(0xFF181F38)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(if (isSolved) "🎉" else "💡", fontSize = 18.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        feedbackMessage ?: "",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isSolved) Color(0xFF6EE7B7) else Color(0xFFE2E8F0)
                    )
                }
            }

            // Chessboard
            ChessboardView(
                board = board,
                selectedSquare = selectedSquare,
                legalDestinations = legalDestinations,
                lastMove = null,
                playerOrientation = PieceColor.WHITE,
                onSquareClick = { clicked ->
                    if (isSolved) return@ChessboardView

                    val selected = selectedSquare
                    if (selected == null) {
                        val piece = board.getPiece(clicked)
                        if (piece != null && piece.color == board.turn) {
                            selectedSquare = clicked
                            legalDestinations = board.getLegalMovesFor(clicked).map { it.to }
                        }
                    } else {
                        if (selected == clicked) {
                            selectedSquare = null
                            legalDestinations = emptyList()
                            return@ChessboardView
                        }

                        val legalMoves = board.getLegalMovesFor(selected)
                        val matching = legalMoves.find { it.to == clicked }

                        if (matching != null) {
                            val move = board.makeMove(selected, clicked, PieceType.QUEEN)
                            selectedSquare = null
                            legalDestinations = emptyList()

                            if (move != null) {
                                val expectedSan = currentPuzzle.solutionMovesSan.getOrNull(moveIndex)
                                if (move.san == expectedSan || move.san.startsWith(expectedSan ?: "xyz")) {
                                    val nextMoveIdx = moveIndex + 1
                                    if (nextMoveIdx >= currentPuzzle.solutionMovesSan.size) {
                                        isSolved = true
                                        feedbackMessage = "Correct! ${currentPuzzle.explanation}"
                                    } else {
                                        moveIndex = nextMoveIdx
                                        feedbackMessage = "Great move! Keep going."
                                    }
                                } else {
                                    feedbackMessage = "Not quite. ${move.san} wasn't the puzzle move. Try again!"
                                    // Reset to current puzzle state
                                    board = ChessBoard.fromFen(currentPuzzle.fen)
                                    moveIndex = 0
                                }
                            }
                        } else {
                            val piece = board.getPiece(clicked)
                            if (piece != null && piece.color == board.turn) {
                                selectedSquare = clicked
                                legalDestinations = board.getLegalMovesFor(clicked).map { it.to }
                            } else {
                                selectedSquare = null
                                legalDestinations = emptyList()
                            }
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
            )

            // Bottom Actions & Navigation
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (isSolved) {
                    Button(
                        onClick = {
                            puzzleIndex = (puzzleIndex + 1) % puzzles.size
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                    ) {
                        Icon(Icons.Default.ArrowForward, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Next Tactical Puzzle", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                board = ChessBoard.fromFen(currentPuzzle.fen)
                                selectedSquare = null
                                legalDestinations = emptyList()
                                moveIndex = 0
                                feedbackMessage = "Board reset. Spot the tactic!"
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Reset", fontSize = 13.sp)
                        }

                        Button(
                            onClick = {
                                val expected = currentPuzzle.solutionMovesSan.getOrNull(moveIndex)
                                feedbackMessage = "Hint: The tactical move is $expected"
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155))
                        ) {
                            Icon(Icons.Default.Lightbulb, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Hint", fontSize = 13.sp)
                        }

                        Button(
                            onClick = {
                                puzzleIndex = (puzzleIndex + 1) % puzzles.size
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5))
                        ) {
                            Text("Skip", fontSize = 13.sp)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.Default.ChevronRight, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    }
}
