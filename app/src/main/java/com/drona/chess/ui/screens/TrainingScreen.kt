package com.drona.chess.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.data.ChessLesson
import com.drona.chess.data.TrainingRepository
import com.drona.chess.engine.ChessBoard
import com.drona.chess.model.PieceColor
import com.drona.chess.model.PieceType
import com.drona.chess.model.Square
import com.drona.chess.ui.components.ChessboardView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrainingScreen(
    onBack: () -> Unit
) {
    val lessons = TrainingRepository.lessons
    var selectedLesson by remember { mutableStateOf(lessons.first()) }
    var board by remember(selectedLesson.id) { mutableStateOf(ChessBoard.fromFen(selectedLesson.fen)) }
    var selectedSquare by remember(selectedLesson.id) { mutableStateOf<Square?>(null) }
    var legalDestinations by remember(selectedLesson.id) { mutableStateOf<List<Square>>(emptyList()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            "Training Arena",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            selectedLesson.category,
                            fontSize = 12.sp,
                            color = Color(0xFFEC4899)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
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
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Lesson categories selector
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(lessons) { lesson ->
                    val isSelected = lesson.id == selectedLesson.id
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isSelected) Color(0xFFEC4899) else Color(0xFF1E293B),
                        modifier = Modifier.clickable { selectedLesson = lesson }
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                lesson.title,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else Color(0xFFCBD5E1)
                            )
                        }
                    }
                }
            }

            // Interactive Chessboard
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

            // Drona Strategic Principle Card
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.School,
                            contentDescription = null,
                            tint = Color(0xFFEC4899),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Guru Drona's Principle",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Text(
                        selectedLesson.principle,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFBBF24),
                        lineHeight = 18.sp
                    )

                    HorizontalDivider(color = Color(0xFF27314E), thickness = 1.dp)

                    Text(
                        selectedLesson.description,
                        fontSize = 12.sp,
                        color = Color(0xFFCBD5E1),
                        lineHeight = 16.sp
                    )
                }
            }

            // Reset Position Button
            Button(
                onClick = {
                    board = ChessBoard.fromFen(selectedLesson.fen)
                    selectedSquare = null
                    legalDestinations = emptyList()
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF252E4B))
            ) {
                Text("Reset Position", fontSize = 13.sp)
            }
        }
    }
}
