package com.drona.chess.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.data.GamePreferences

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProgressScreen(
    preferences: GamePreferences,
    onBack: () -> Unit
) {
    val rating = preferences.playerRating
    val wins = preferences.totalWins
    val losses = preferences.totalLosses
    val draws = preferences.totalDraws
    val totalGames = wins + losses + draws
    val winRate = if (totalGames > 0) ((wins.toFloat() / totalGames) * 100).toInt() else 0

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "My Progress",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
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
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Main Rating Hero Card
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF181F38)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = Color(0xFFFBBF24).copy(alpha = 0.15f),
                        modifier = Modifier.size(54.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.MilitaryTech,
                                contentDescription = null,
                                tint = Color(0xFFFBBF24),
                                modifier = Modifier.size(32.dp)
                            )
                        }
                    }

                    Text(
                        "$rating",
                        fontSize = 36.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )

                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFF312E81)
                    ) {
                        Text(
                            when {
                                rating >= 1800 -> "Advanced Master"
                                rating >= 1500 -> "Intermediate Tactician"
                                rating >= 1200 -> "Club Competitor"
                                else -> "Apprentice"
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFA5B4FC),
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            // Stats Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    title = "Total Games",
                    value = totalGames.toString(),
                    color = Color(0xFF60A5FA),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Win Rate",
                    value = "$winRate%",
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    title = "Victories",
                    value = wins.toString(),
                    color = Color(0xFF10B981),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Defeats",
                    value = losses.toString(),
                    color = Color(0xFFEF4444),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Ties / Draws",
                    value = draws.toString(),
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.weight(1f)
                )
            }

            // Drona Coach Badges
            Text(
                "ACHIEVEMENTS & MASTERY",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF64748B),
                letterSpacing = 1.sp
            )

            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF13182C)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    AchievementRow(
                        title = "First Step to Glory",
                        subtitle = "Play your first match with Guru Drona",
                        unlocked = totalGames > 0
                    )
                    HorizontalDivider(color = Color(0xFF1E2640), thickness = 1.dp)
                    AchievementRow(
                        title = "Tactical Striker",
                        subtitle = "Deliver checkmate against Drona AI",
                        unlocked = wins > 0
                    )
                    HorizontalDivider(color = Color(0xFF1E2640), thickness = 1.dp)
                    AchievementRow(
                        title = "1300 Elo Club",
                        subtitle = "Reach 1300 rating in AI matches",
                        unlocked = rating >= 1300
                    )
                }
            }
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141A30)),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(title, fontSize = 11.sp, color = Color(0xFF94A3B8))
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = color)
        }
    }
}

@Composable
private fun AchievementRow(
    title: String,
    subtitle: String,
    unlocked: Boolean
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Surface(
            shape = CircleShape,
            color = if (unlocked) Color(0xFFFBBF24).copy(alpha = 0.15f) else Color(0xFF1E293B),
            modifier = Modifier.size(36.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = if (unlocked) Icons.Default.EmojiEvents else Icons.Default.Star,
                    contentDescription = null,
                    tint = if (unlocked) Color(0xFFFBBF24) else Color(0xFF64748B),
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                title,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (unlocked) Color.White else Color(0xFF94A3B8)
            )
            Text(
                subtitle,
                fontSize = 11.sp,
                color = Color(0xFF64748B)
            )
        }
    }
}
