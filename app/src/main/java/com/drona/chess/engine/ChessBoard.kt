package com.drona.chess.engine

import com.drona.chess.model.*

class ChessBoard {
    private val board = Array(8) { Array<Piece?>(8) { null } }
    var turn: PieceColor = PieceColor.WHITE
        private set
    var enPassantSquare: Square? = null
        private set
    var halfMoveClock: Int = 0
        private set
    var fullMoveNumber: Int = 1
        private set
    val moveHistory = mutableListOf<Move>()
    private val positionHistory = mutableMapOf<String, Int>()

    init {
        setupInitialBoard()
    }

    fun reset() {
        for (r in 0..7) {
            for (f in 0..7) {
                board[r][f] = null
            }
        }
        turn = PieceColor.WHITE
        enPassantSquare = null
        halfMoveClock = 0
        fullMoveNumber = 1
        moveHistory.clear()
        positionHistory.clear()
        setupInitialBoard()
    }

    private fun setupInitialBoard() {
        // Pawns
        for (f in 0..7) {
            board[1][f] = Piece(PieceType.PAWN, PieceColor.WHITE)
            board[6][f] = Piece(PieceType.PAWN, PieceColor.BLACK)
        }

        // White pieces
        board[0][0] = Piece(PieceType.ROOK, PieceColor.WHITE)
        board[0][1] = Piece(PieceType.KNIGHT, PieceColor.WHITE)
        board[0][2] = Piece(PieceType.BISHOP, PieceColor.WHITE)
        board[0][3] = Piece(PieceType.QUEEN, PieceColor.WHITE)
        board[0][4] = Piece(PieceType.KING, PieceColor.WHITE)
        board[0][5] = Piece(PieceType.BISHOP, PieceColor.WHITE)
        board[0][6] = Piece(PieceType.KNIGHT, PieceColor.WHITE)
        board[0][7] = Piece(PieceType.ROOK, PieceColor.WHITE)

        // Black pieces
        board[7][0] = Piece(PieceType.ROOK, PieceColor.BLACK)
        board[7][1] = Piece(PieceType.KNIGHT, PieceColor.BLACK)
        board[7][2] = Piece(PieceType.BISHOP, PieceColor.BLACK)
        board[7][3] = Piece(PieceType.QUEEN, PieceColor.BLACK)
        board[7][4] = Piece(PieceType.KING, PieceColor.BLACK)
        board[7][5] = Piece(PieceType.BISHOP, PieceColor.BLACK)
        board[7][6] = Piece(PieceType.KNIGHT, PieceColor.BLACK)
        board[7][7] = Piece(PieceType.ROOK, PieceColor.BLACK)

        recordPosition()
    }

    fun getPiece(square: Square): Piece? {
        if (square.rank !in 0..7 || square.file !in 0..7) return null
        return board[square.rank][square.file]
    }

    private fun setPiece(square: Square, piece: Piece?) {
        board[square.rank][square.file] = piece
    }

    fun getLegalMovesFor(square: Square): List<Move> {
        val piece = getPiece(square) ?: return emptyList()
        if (piece.color != turn) return emptyList()

        val pseudoLegal = getPseudoLegalMoves(square, piece)
        return pseudoLegal.filter { move ->
            // Simulate move and verify king is not left in check
            makeHypotheticalMove(move) {
                !isKingInCheck(piece.color)
            }
        }
    }

    fun getAllLegalMoves(color: PieceColor = turn): List<Move> {
        val moves = mutableListOf<Move>()
        for (r in 0..7) {
            for (f in 0..7) {
                val sq = Square(f, r)
                val piece = getPiece(sq)
                if (piece != null && piece.color == color) {
                    val pseudo = getPseudoLegalMoves(sq, piece)
                    for (m in pseudo) {
                        val legal = makeHypotheticalMove(m) {
                            !isKingInCheck(color)
                        }
                        if (legal) moves.add(m)
                    }
                }
            }
        }
        return moves
    }

    fun makeMove(from: Square, to: Square, promotion: PieceType? = null): Move? {
        val legalMoves = getLegalMovesFor(from)
        val selectedMove = legalMoves.find {
            it.to == to && (promotion == null || it.promotion == promotion || it.promotion == PieceType.QUEEN)
        } ?: return null

        val finalMove = if (selectedMove.promotion != null && promotion != null) {
            selectedMove.copy(promotion = promotion)
        } else selectedMove

        executeMoveInternal(finalMove)
        return finalMove
    }

    private fun executeMoveInternal(move: Move) {
        val movingPiece = move.piece.copy(hasMoved = true)
        val isCapture = move.capturedPiece != null || move.isEnPassant
        val isPawn = movingPiece.type == PieceType.PAWN

        // Clear source square
        setPiece(move.from, null)

        // Handle Castling move
        if (move.isCastling) {
            val rank = move.from.rank
            if (move.to.file == 6) { // Kingside
                val rook = getPiece(Square(7, rank))
                setPiece(Square(7, rank), null)
                setPiece(Square(5, rank), rook?.copy(hasMoved = true))
            } else if (move.to.file == 2) { // Queenside
                val rook = getPiece(Square(0, rank))
                setPiece(Square(0, rank), null)
                setPiece(Square(3, rank), rook?.copy(hasMoved = true))
            }
        }

        // Handle En Passant capture
        if (move.isEnPassant) {
            val captureRank = if (movingPiece.color == PieceColor.WHITE) 4 else 3
            setPiece(Square(move.to.file, captureRank), null)
        }

        // Place moving piece (or promoted piece)
        val finalPlacedPiece = if (move.promotion != null) {
            Piece(move.promotion, movingPiece.color, true)
        } else {
            movingPiece
        }
        setPiece(move.to, finalPlacedPiece)

        // Update En Passant target square
        enPassantSquare = if (isPawn && kotlin.math.abs(move.to.rank - move.from.rank) == 2) {
            Square(move.from.file, (move.from.rank + move.to.rank) / 2)
        } else {
            null
        }

        // Update Halfmove clock for 50-move rule
        if (isPawn || isCapture) {
            halfMoveClock = 0
        } else {
            halfMoveClock++
        }

        if (turn == PieceColor.BLACK) {
            fullMoveNumber++
        }

        turn = turn.opposite()
        moveHistory.add(move)
        recordPosition()
    }

    private fun recordPosition() {
        val fenKey = getPositionKey()
        positionHistory[fenKey] = (positionHistory[fenKey] ?: 0) + 1
    }

    private fun getPositionKey(): String {
        val sb = StringBuilder()
        for (r in 7 downTo 0) {
            var empty = 0
            for (f in 0..7) {
                val p = board[r][f]
                if (p == null) {
                    empty++
                } else {
                    if (empty > 0) {
                        sb.append(empty)
                        empty = 0
                    }
                    val char = when (p.type) {
                        PieceType.PAWN -> 'p'
                        PieceType.KNIGHT -> 'n'
                        PieceType.BISHOP -> 'b'
                        PieceType.ROOK -> 'r'
                        PieceType.QUEEN -> 'q'
                        PieceType.KING -> 'k'
                    }
                    sb.append(if (p.color == PieceColor.WHITE) char.uppercaseChar() else char)
                }
            }
            if (empty > 0) sb.append(empty)
            if (r > 0) sb.append('/')
        }
        sb.append(" ").append(if (turn == PieceColor.WHITE) "w" else "b")
        return sb.toString()
    }

    fun isThreefoldRepetition(): Boolean {
        val key = getPositionKey()
        return (positionHistory[key] ?: 0) >= 3
    }

    fun isFiftyMoveRule(): Boolean = halfMoveClock >= 100

    fun isKingInCheck(color: PieceColor): Boolean {
        val kingSquare = findKing(color) ?: return false
        val enemyColor = color.opposite()

        for (r in 0..7) {
            for (f in 0..7) {
                val sq = Square(f, r)
                val piece = getPiece(sq)
                if (piece != null && piece.color == enemyColor) {
                    if (canPieceAttack(sq, piece, kingSquare)) {
                        return true
                    }
                }
            }
        }
        return false
    }

    fun getGameStatus(): GameStatus {
        val legalMoves = getAllLegalMoves(turn)
        val inCheck = isKingInCheck(turn)

        if (legalMoves.isEmpty()) {
            return if (inCheck) GameStatus.CHECKMATE else GameStatus.STALEMATE
        }
        if (isThreefoldRepetition()) return GameStatus.DRAW_REPETITION
        if (isFiftyMoveRule()) return GameStatus.DRAW_FIFTY_MOVES
        if (isInsufficientMaterial()) return GameStatus.DRAW_INSUFFICIENT_MATERIAL
        if (inCheck) return GameStatus.CHECK

        return GameStatus.ACTIVE
    }

    fun isInsufficientMaterial(): Boolean {
        var whiteKnights = 0
        var whiteBishops = 0
        var blackKnights = 0
        var blackBishops = 0
        var otherPieces = 0

        for (r in 0..7) {
            for (f in 0..7) {
                val p = board[r][f] ?: continue
                when (p.type) {
                    PieceType.KING -> {}
                    PieceType.KNIGHT -> if (p.color == PieceColor.WHITE) whiteKnights++ else blackKnights++
                    PieceType.BISHOP -> if (p.color == PieceColor.WHITE) whiteBishops++ else blackBishops++
                    else -> otherPieces++
                }
            }
        }

        if (otherPieces > 0) return false
        val totalMinors = whiteKnights + whiteBishops + blackKnights + blackBishops
        if (totalMinors == 0) return true // K vs K
        if (totalMinors == 1) return true // K+B vs K or K+N vs K
        return false
    }

    private fun findKing(color: PieceColor): Square? {
        for (r in 0..7) {
            for (f in 0..7) {
                val p = board[r][f]
                if (p != null && p.type == PieceType.KING && p.color == color) {
                    return Square(f, r)
                }
            }
        }
        return null
    }

    private inline fun <T> makeHypotheticalMove(move: Move, block: () -> T): T {
        val savedFrom = getPiece(move.from)
        val savedTo = getPiece(move.to)
        val savedEnPassant = enPassantSquare

        setPiece(move.from, null)
        setPiece(move.to, move.piece)

        var enPassantCapturedPiece: Piece? = null
        var enPassantSquareCaptured: Square? = null
        if (move.isEnPassant) {
            val r = if (move.piece.color == PieceColor.WHITE) 4 else 3
            enPassantSquareCaptured = Square(move.to.file, r)
            enPassantCapturedPiece = getPiece(enPassantSquareCaptured)
            setPiece(enPassantSquareCaptured, null)
        }

        val result = block()

        // Revert
        setPiece(move.from, savedFrom)
        setPiece(move.to, savedTo)
        if (move.isEnPassant && enPassantSquareCaptured != null) {
            setPiece(enPassantSquareCaptured, enPassantCapturedPiece)
        }
        enPassantSquare = savedEnPassant

        return result
    }

    private fun canPieceAttack(from: Square, piece: Piece, target: Square): Boolean {
        val dx = target.file - from.file
        val dy = target.rank - from.rank

        return when (piece.type) {
            PieceType.PAWN -> {
                val forward = if (piece.color == PieceColor.WHITE) 1 else -1
                dy == forward && kotlin.math.abs(dx) == 1
            }
            PieceType.KNIGHT -> {
                (kotlin.math.abs(dx) == 1 && kotlin.math.abs(dy) == 2) || (kotlin.math.abs(dx) == 2 && kotlin.math.abs(dy) == 1)
            }
            PieceType.BISHOP -> {
                kotlin.math.abs(dx) == kotlin.math.abs(dy) && isPathClear(from, target)
            }
            PieceType.ROOK -> {
                (dx == 0 || dy == 0) && isPathClear(from, target)
            }
            PieceType.QUEEN -> {
                (dx == 0 || dy == 0 || kotlin.math.abs(dx) == kotlin.math.abs(dy)) && isPathClear(from, target)
            }
            PieceType.KING -> {
                kotlin.math.abs(dx) <= 1 && kotlin.math.abs(dy) <= 1
            }
        }
    }

    private fun isPathClear(from: Square, to: Square): Boolean {
        val stepX = (to.file - from.file).coerceIn(-1, 1)
        val stepY = (to.rank - from.rank).coerceIn(-1, 1)

        var currX = from.file + stepX
        var currY = from.rank + stepY

        while (currX != to.file || currY != to.rank) {
            if (board[currY][currX] != null) return false
            currX += stepX
            currY += stepY
        }
        return true
    }

    private fun getPseudoLegalMoves(from: Square, piece: Piece): List<Move> {
        val moves = mutableListOf<Move>()
        val color = piece.color

        when (piece.type) {
            PieceType.PAWN -> {
                val dir = if (color == PieceColor.WHITE) 1 else -1
                val startRank = if (color == PieceColor.WHITE) 1 else 6
                val promoRank = if (color == PieceColor.WHITE) 7 else 0

                // 1 step forward
                val nextRank = from.rank + dir
                if (nextRank in 0..7 && getPiece(Square(from.file, nextRank)) == null) {
                    val dest = Square(from.file, nextRank)
                    if (nextRank == promoRank) {
                        listOf(PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT).forEach { promo ->
                            moves.add(Move(from, dest, piece, promotion = promo, san = "${dest.algebraic}=${promo.symbol}"))
                        }
                    } else {
                        moves.add(Move(from, dest, piece, san = dest.algebraic))
                    }

                    // 2 steps forward
                    val doubleRank = from.rank + 2 * dir
                    if (from.rank == startRank && getPiece(Square(from.file, doubleRank)) == null) {
                        val doubleDest = Square(from.file, doubleRank)
                        moves.add(Move(from, doubleDest, piece, san = doubleDest.algebraic))
                    }
                }

                // Diagonal captures
                for (df in listOf(-1, 1)) {
                    val cf = from.file + df
                    if (cf in 0..7 && nextRank in 0..7) {
                        val dest = Square(cf, nextRank)
                        val targetPiece = getPiece(dest)
                        if (targetPiece != null && targetPiece.color != color) {
                            if (nextRank == promoRank) {
                                listOf(PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT).forEach { promo ->
                                    moves.add(Move(from, dest, piece, capturedPiece = targetPiece, promotion = promo, san = "${from.algebraic[0]}x${dest.algebraic}=${promo.symbol}"))
                                }
                            } else {
                                moves.add(Move(from, dest, piece, capturedPiece = targetPiece, san = "${from.algebraic[0]}x${dest.algebraic}"))
                            }
                        } else if (enPassantSquare != null && dest == enPassantSquare) {
                            // En Passant
                            val epRank = if (color == PieceColor.WHITE) 4 else 3
                            val epPiece = getPiece(Square(cf, epRank))
                            moves.add(Move(from, dest, piece, capturedPiece = epPiece, isEnPassant = true, san = "${from.algebraic[0]}x${dest.algebraic} e.p."))
                        }
                    }
                }
            }

            PieceType.KNIGHT -> {
                val deltas = listOf(
                    Pair(-2, -1), Pair(-2, 1), Pair(-1, -2), Pair(-1, 2),
                    Pair(1, -2), Pair(1, 2), Pair(2, -1), Pair(2, 1)
                )
                for ((df, dr) in deltas) {
                    val f = from.file + df
                    val r = from.rank + dr
                    if (f in 0..7 && r in 0..7) {
                        val dest = Square(f, r)
                        val destPiece = getPiece(dest)
                        if (destPiece == null || destPiece.color != color) {
                            val san = "N${if (destPiece != null) "x" else ""}${dest.algebraic}"
                            moves.add(Move(from, dest, piece, capturedPiece = destPiece, san = san))
                        }
                    }
                }
            }

            PieceType.BISHOP -> addSlidingMoves(from, piece, moves, listOf(Pair(1, 1), Pair(1, -1), Pair(-1, 1), Pair(-1, -1)))
            PieceType.ROOK -> addSlidingMoves(from, piece, moves, listOf(Pair(0, 1), Pair(0, -1), Pair(1, 0), Pair(-1, 0)))
            PieceType.QUEEN -> addSlidingMoves(from, piece, moves, listOf(
                Pair(1, 1), Pair(1, -1), Pair(-1, 1), Pair(-1, -1),
                Pair(0, 1), Pair(0, -1), Pair(1, 0), Pair(-1, 0)
            ))

            PieceType.KING -> {
                for (df in -1..1) {
                    for (dr in -1..1) {
                        if (df == 0 && dr == 0) continue
                        val f = from.file + df
                        val r = from.rank + dr
                        if (f in 0..7 && r in 0..7) {
                            val dest = Square(f, r)
                            val destPiece = getPiece(dest)
                            if (destPiece == null || destPiece.color != color) {
                                val san = "K${if (destPiece != null) "x" else ""}${dest.algebraic}"
                                moves.add(Move(from, dest, piece, capturedPiece = destPiece, san = san))
                            }
                        }
                    }
                }

                // Castling
                if (!piece.hasMoved && !isKingInCheck(color)) {
                    val rank = from.rank
                    // Kingside
                    val kingsideRook = getPiece(Square(7, rank))
                    if (kingsideRook != null && !kingsideRook.hasMoved) {
                        if (getPiece(Square(5, rank)) == null && getPiece(Square(6, rank)) == null) {
                            if (!isSquareAttacked(Square(5, rank), color.opposite()) &&
                                !isSquareAttacked(Square(6, rank), color.opposite())
                            ) {
                                moves.add(Move(from, Square(6, rank), piece, isCastling = true, san = "O-O"))
                            }
                        }
                    }

                    // Queenside
                    val queensideRook = getPiece(Square(0, rank))
                    if (queensideRook != null && !queensideRook.hasMoved) {
                        if (getPiece(Square(1, rank)) == null && getPiece(Square(2, rank)) == null && getPiece(Square(3, rank)) == null) {
                            if (!isSquareAttacked(Square(2, rank), color.opposite()) &&
                                !isSquareAttacked(Square(3, rank), color.opposite())
                            ) {
                                moves.add(Move(from, Square(2, rank), piece, isCastling = true, san = "O-O-O"))
                            }
                        }
                    }
                }
            }
        }

        return moves
    }

    private fun isSquareAttacked(square: Square, attackerColor: PieceColor): Boolean {
        for (r in 0..7) {
            for (f in 0..7) {
                val sq = Square(f, r)
                val p = getPiece(sq)
                if (p != null && p.color == attackerColor && canPieceAttack(sq, p, square)) {
                    return true
                }
            }
        }
        return false
    }

    private fun addSlidingMoves(
        from: Square,
        piece: Piece,
        moves: MutableList<Move>,
        directions: List<Pair<Int, Int>>
    ) {
        val sym = if (piece.type == PieceType.QUEEN) "Q" else if (piece.type == PieceType.ROOK) "R" else "B"
        for ((df, dr) in directions) {
            var f = from.file + df
            var r = from.rank + dr
            while (f in 0..7 && r in 0..7) {
                val dest = Square(f, r)
                val destPiece = getPiece(dest)
                if (destPiece == null) {
                    moves.add(Move(from, dest, piece, san = "$sym${dest.algebraic}"))
                } else {
                    if (destPiece.color != piece.color) {
                        moves.add(Move(from, dest, piece, capturedPiece = destPiece, san = "${sym}x${dest.algebraic}"))
                    }
                    break
                }
                f += df
                r += dr
            }
        }
    }

    fun toFen(): String {
        val sb = StringBuilder()
        // 1. Piece placement
        for (r in 7 downTo 0) {
            var empty = 0
            for (f in 0..7) {
                val p = board[r][f]
                if (p == null) {
                    empty++
                } else {
                    if (empty > 0) {
                        sb.append(empty)
                        empty = 0
                    }
                    val c = when (p.type) {
                        PieceType.PAWN -> 'p'
                        PieceType.KNIGHT -> 'n'
                        PieceType.BISHOP -> 'b'
                        PieceType.ROOK -> 'r'
                        PieceType.QUEEN -> 'q'
                        PieceType.KING -> 'k'
                    }
                    sb.append(if (p.color == PieceColor.WHITE) c.uppercaseChar() else c)
                }
            }
            if (empty > 0) sb.append(empty)
            if (r > 0) sb.append('/')
        }

        // 2. Active turn
        sb.append(" ").append(if (turn == PieceColor.WHITE) "w" else "b")

        // 3. Castling availability
        sb.append(" ")
        val whiteKing = getPiece(Square(4, 0))
        val blackKing = getPiece(Square(4, 7))
        var castling = ""
        if (whiteKing?.hasMoved == false) {
            if (getPiece(Square(7, 0))?.hasMoved == false) castling += "K"
            if (getPiece(Square(0, 0))?.hasMoved == false) castling += "Q"
        }
        if (blackKing?.hasMoved == false) {
            if (getPiece(Square(7, 7))?.hasMoved == false) castling += "k"
            if (getPiece(Square(0, 7))?.hasMoved == false) castling += "q"
        }
        sb.append(if (castling.isEmpty()) "-" else castling)

        // 4. En passant target
        sb.append(" ").append(enPassantSquare?.algebraic ?: "-")

        // 5. Halfmove clock & fullmove number
        sb.append(" ").append(halfMoveClock).append(" ").append(fullMoveNumber)

        return sb.toString()
    }
}
