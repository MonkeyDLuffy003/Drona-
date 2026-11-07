package com.drona.chess.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.engine.ChessBoard
import com.drona.chess.model.*
import com.drona.chess.ui.theme.*

@Composable
fun ChessboardView(
    board: ChessBoard,
    selectedSquare: Square?,
    legalDestinations: List<Square>,
    lastMove: Move?,
    isCheck: Boolean,
    playerOrientation: PieceColor,
    onSquareClick: (Square) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .aspectRatio(1f)
            .clip(RoundedCornerShape(12.dp))
            .background(BorderDark)
            .padding(4.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            val ranks = if (playerOrientation == PieceColor.WHITE) (7 downTo 0) else (0..7)
            val files = if (playerOrientation == PieceColor.WHITE) (0..7) else (7 downTo 0)

            for (r in ranks) {
                Row(modifier = Modifier.weight(1f)) {
                    for (f in files) {
                        val square = Square(f, r)
                        val piece = board.getPiece(square)
                        val isSelected = square == selectedSquare
                        val isLegalDest = legalDestinations.contains(square)
                        val isLastMoveSquare = lastMove != null && (square == lastMove.from || square == lastMove.to)
                        val isKingInCheck = isCheck && piece?.type == PieceType.KING && piece.color == board.turn

                        ChessSquare(
                            square = square,
                            piece = piece,
                            isSelected = isSelected,
                            isLegalDest = isLegalDest,
                            isLastMove = isLastMoveSquare,
                            isCheck = isKingInCheck,
                            showRankCoord = if (playerOrientation == PieceColor.WHITE) f == 0 else f == 7,
                            showFileCoord = if (playerOrientation == PieceColor.WHITE) r == 0 else r == 7,
                            onClick = { onSquareClick(square) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ChessSquare(
    square: Square,
    piece: Piece?,
    isSelected: Boolean,
    isLegalDest: Boolean,
    isLastMove: Boolean,
    isCheck: Boolean,
    showRankCoord: Boolean,
    showFileCoord: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val baseColor = if (square.isLight) BoardLight else BoardDark
    val squareColor = when {
        isCheck -> BoardCheck
        isSelected -> BoardSelected
        isLastMove -> BoardLastMove
        else -> baseColor
    }

    Box(
        modifier = modifier
            .fillMaxHeight()
            .background(squareColor)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        // Rank coordinate (left edge)
        if (showRankCoord) {
            Text(
                text = "${square.rank + 1}",
                color = if (square.isLight) BoardDark else BoardLight,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(2.dp)
            )
        }

        // File coordinate (bottom edge)
        if (showFileCoord) {
            Text(
                text = "${'a' + square.file}",
                color = if (square.isLight) BoardDark else BoardLight,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(2.dp)
            )
        }

        // Legal move indicator
        if (isLegalDest) {
            if (piece != null) {
                // Capture target ring
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(Color(0x55EF4444))
                )
            } else {
                // Move dot
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(Color(0x9910B981))
                )
            }
        }

        // Piece symbol
        if (piece != null) {
            Text(
                text = piece.type.getDisplaySymbol(piece.color == PieceColor.WHITE),
                fontSize = 32.sp,
                color = if (piece.color == PieceColor.WHITE) Color.White else Color(0xFF1E293B),
                fontWeight = FontWeight.ExtraBold
            )
        }
    }
}
