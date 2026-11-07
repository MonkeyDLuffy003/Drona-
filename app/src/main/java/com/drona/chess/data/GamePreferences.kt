package com.drona.chess.data

import android.content.Context
import android.content.SharedPreferences

class GamePreferences(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("drona_chess_prefs", Context.MODE_PRIVATE)

    var savedFen: String?
        get() = prefs.getString("saved_fen", null)
        set(value) = prefs.edit().putString("saved_fen", value).apply()

    var playerRating: Int
        get() = prefs.getInt("player_rating", 1250)
        set(value) = prefs.edit().putInt("player_rating", value).apply()

    var totalWins: Int
        get() = prefs.getInt("total_wins", 0)
        set(value) = prefs.edit().putInt("total_wins", value).apply()

    var totalLosses: Int
        get() = prefs.getInt("total_losses", 0)
        set(value) = prefs.edit().putInt("total_losses", value).apply()

    var totalDraws: Int
        get() = prefs.getInt("total_draws", 0)
        set(value) = prefs.edit().putInt("total_draws", value).apply()

    var isVoiceEnabled: Boolean
        get() = prefs.getBoolean("is_voice_enabled", true)
        set(value) = prefs.edit().putBoolean("is_voice_enabled", value).apply()

    var solvedPuzzlesCount: Int
        get() = prefs.getInt("solved_puzzles_count", 0)
        set(value) = prefs.edit().putInt("solved_puzzles_count", value).apply()

    fun recordGameResult(isWin: Boolean, isDraw: Boolean) {
        if (isWin) {
            totalWins++
            playerRating += 15
        } else if (isDraw) {
            totalDraws++
        } else {
            totalLosses++
            playerRating = maxOf(400, playerRating - 10)
        }
    }

    fun clearSavedGame() {
        prefs.edit().remove("saved_fen").apply()
    }
}
