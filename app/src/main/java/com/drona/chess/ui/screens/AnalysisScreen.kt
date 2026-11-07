package com.drona.chess.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.coach.DronaCoach
import com.drona.chess.engine.ChessBoard
import com.drona.chess.model.PieceColor
import com.drona.chess.model.PieceType
import com.drona.chess.model.Square
import com.drona.chess.ui.components.ChessboardView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalysisScreen(
    onBack: () -> Unit
) {
    var board by remember { mutableStateOf(ChessBoard()) }
    var selectedSquare by remember { mutableStateOf<Square?>(null) }
    var legalDestinations by remember { mutableStateOf<List<Square>>(emptyList()) }
    val coach = remember { DronaCoach() }
    var advice by remember { mutableStateOf(coach.analyzePosition(board)) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Game Analysis",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            "Stockfish Engine Evaluation",
                            fontSize = 12.sp,
                            color = Color(0xFF06B6D4)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = {
                        board = ChessBoard()
                        selectedSquare = null
                        legalDestinations = emptyList()
                        advice = coach.analyzePosition(board)
                    }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = Color.White)
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
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 6.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Evaluation Gauge Bar
            val evalScore = advice.evaluationCp / 100.0
            val evalFormatted = if (evalScore > 0) "+%.1f".format(evalScore) else "%.1f".format(evalScore)
            val whiteFraction = ((advice.evaluationCp + 1000f) / 2000f).coerceIn(0.05f, 0.95f)

            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF141A30)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Position Evaluation",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8),
                            fontWeight = FontWeight.Medium
                        )
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = if (advice.evaluationCp >= 0) Color(0xFF10B981) else Color(0xFFEF4444)
                        ) {
                            Text(
                                evalFormatted,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }

                    // Two-tone evaluation bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(whiteFraction)
                                .fillMaxHeight()
                                .background(Color.White, RoundedCornerShape(topStart = 4.dp, bottomStart = 4.dp))
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f - whiteFraction)
                                .fillMaxHeight()
                                .background(Color(0xFF334155), RoundedCornerShape(topEnd = 4.dp, bottomEnd = 4.dp))
                        )
                    }
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
                            board.makeMove(selected, clicked, PieceType.QUEEN)
                            selectedSquare = null
                            legalDestinations = emptyList()
                            advice = coach.analyzePosition(board)
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

            // Drona Tactical Analysis Card
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF181F38)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = Color(0xFF06B6D4),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Coach Drona Analysis",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }

                        advice.bestMoveSan?.let { bestMove ->
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = Color(0xFF06B6D4).copy(alpha = 0.2f)
                            ) {
                                Text(
                                    "Best: $bestMove",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF67E8F9),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    Text(
                        advice.message,
                        fontSize = 13.sp,
                        color = Color(0xFFE2E8F0),
                        lineHeight = 18.sp
                    )

                    advice.tacticalThreat?.let { threat ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFFEF4444).copy(alpha = 0.15f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("⚠️", fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    threat,
                                    fontSize = 12.sp,
                                    color = Color(0xFFFCA5A5)
                                )
                            }
                        }
                    }
                }
            }

            // Move History List
            if (board.moveHistory.isNotEmpty()) {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF14192D)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            "Move History (${board.moveHistory.size} moves)",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF94A3B8)
                        )
                        Text(
                            board.moveHistory.chunked(2).mapIndexed { idx, pair ->
                                "${idx + 1}. ${pair[0].san}" + if (pair.size > 1) " ${pair[1].san}" else ""
                            }.joinToString("  "),
                            fontSize = 12.sp,
                            color = Color(0xFFCBD5E1),
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }
    }
}
