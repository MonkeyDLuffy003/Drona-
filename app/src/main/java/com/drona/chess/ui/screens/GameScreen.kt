package com.drona.chess.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.model.*
import com.drona.chess.ui.components.ChessboardView
import com.drona.chess.ui.components.DronaCoachCard
import com.drona.chess.ui.theme.*
import com.drona.chess.ui.viewmodel.ChessViewModel

@Composable
fun GameScreen(
    viewModel: ChessViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var boardOrientation by remember { mutableStateOf(uiState.playerColor) }

    LaunchedEffect(uiState.playerColor) {
        boardOrientation = uiState.playerColor
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BgDark)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar: Back navigation + Title + Difficulty
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Button(
                onClick = onNavigateBack,
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                modifier = Modifier.height(32.dp)
            ) {
                Text(text = "← Back", color = TextPrimary, fontSize = 12.sp)
            }

            Text(
                text = "DRONA AI CHESS",
                color = GoldAccent,
                fontWeight = FontWeight.Black,
                fontSize = 14.sp
            )

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(BorderDark)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = uiState.aiDifficulty.label,
                    color = TextSecondary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Opponent Bar (Top)
        val opponentColor = uiState.playerColor.opposite()
        val isOpponentTurn = uiState.board.turn == opponentColor && !uiState.gameStatus.isGameOver
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(SurfaceCard)
                .border(1.dp, if (isOpponentTurn) GoldAccent else BorderDark, RoundedCornerShape(12.dp))
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(PurpleDark),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "🤖", fontSize = 14.sp)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = if (uiState.gameMode == GameMode.TWO_PLAYER) "Player 2" else "Dr. Drona AI",
                        color = TextPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (opponentColor == PieceColor.WHITE) "⚪ White (${uiState.aiDifficulty.rating})" else "⚫ Black (${uiState.aiDifficulty.rating})",
                        color = TextSecondary,
                        fontSize = 10.sp
                    )
                }
            }

            if (isOpponentTurn) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0x33F59E0B))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = if (uiState.isAiThinking) "Thinking..." else "Turn",
                        color = GoldAccent,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // 8x8 Native Chessboard
        ChessboardView(
            board = uiState.board,
            selectedSquare = uiState.selectedSquare,
            legalDestinations = uiState.legalDestinations,
            lastMove = uiState.lastMove,
            isCheck = uiState.gameStatus == GameStatus.CHECK,
            playerOrientation = boardOrientation,
            onSquareClick = { sq -> viewModel.onSquareClicked(sq) },
            modifier = Modifier.fillMaxWidth()
        )

        // Player Bar (Bottom) + 1-Tap Side Switcher
        val isPlayerTurn = uiState.board.turn == uiState.playerColor && !uiState.gameStatus.isGameOver
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(SurfaceCard)
                .border(1.dp, if (isPlayerTurn) GoldAccent else BorderDark, RoundedCornerShape(12.dp))
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1E293B)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "👤", fontSize = 14.sp)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "You",
                        color = TextPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    // 1-Tap Side Switcher
                    Row(modifier = Modifier.padding(top = 2.dp)) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (uiState.playerColor == PieceColor.WHITE) GoldAccent else BorderDark)
                                .clickable {
                                    if (uiState.playerColor != PieceColor.WHITE) {
                                        viewModel.startNewGame(PieceColor.WHITE)
                                    }
                                }
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "⚪ White",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (uiState.playerColor == PieceColor.WHITE) BgDark else TextSecondary
                            )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (uiState.playerColor == PieceColor.BLACK) PurpleAccent else BorderDark)
                                .clickable {
                                    if (uiState.playerColor != PieceColor.BLACK) {
                                        viewModel.startNewGame(PieceColor.BLACK)
                                    }
                                }
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "⚫ Black",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (uiState.playerColor == PieceColor.BLACK) Color.White else TextSecondary
                            )
                        }
                    }
                }
            }

            if (isPlayerTurn) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0x3310B981))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(text = "Your Turn", color = Color(0xFF10B981), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Compact Drona Coach Dialogue Card
        DronaCoachCard(
            coachAdvice = uiState.coachAdvice,
            isVoiceEnabled = uiState.isVoiceEnabled,
            isListening = uiState.isListening,
            onToggleVoice = { viewModel.toggleVoice() },
            onToggleListening = { viewModel.toggleListening() },
            onAskHint = { viewModel.requestHint() }
        )

        // Action Buttons Dock
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Button(
                onClick = { viewModel.requestHint() },
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "💡 Hint", color = GoldLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(6.dp))
            Button(
                onClick = { viewModel.undoMove() },
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "↺ Undo", color = TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(6.dp))
            Button(
                onClick = { boardOrientation = boardOrientation.opposite() },
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "⇄ Flip", color = TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.width(6.dp))
            Button(
                onClick = { viewModel.startNewGame(uiState.playerColor) },
                colors = ButtonDefaults.buttonColors(containerColor = SurfaceCard),
                shape = RoundedCornerShape(10.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.weight(1f)
            ) {
                Text(text = "↻ New", color = TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
