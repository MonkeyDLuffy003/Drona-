package com.drona.chess.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.drona.chess.coach.DronaCoach
import com.drona.chess.ui.theme.*

@Composable
fun DronaCoachCard(
    coachAdvice: DronaCoach.CoachingAdvice?,
    isVoiceEnabled: Boolean,
    isListening: Boolean,
    onToggleVoice: () -> Unit,
    onToggleListening: () -> Unit,
    onAskHint: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, BorderDark, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceCard)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Header: Drona Identity + Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Drona Icon Avatar
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(PurpleDark)
                            .border(1.dp, PurpleAccent, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(text = "♞", fontSize = 16.sp, color = GoldLight)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Column {
                        Text(
                            text = "Guru Drona",
                            color = GoldLight,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "AI Voice Coach",
                            color = TextSecondary,
                            fontSize = 10.sp
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Voice Mode ON/OFF
                    IconButton(
                        onClick = onToggleVoice,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = if (isVoiceEnabled) Icons.Default.VolumeUp else Icons.Default.VolumeOff,
                            contentDescription = "Toggle Voice",
                            tint = if (isVoiceEnabled) GoldAccent else TextMuted,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Voice Command Mic
                    IconButton(
                        onClick = onToggleListening,
                        modifier = Modifier
                            .size(32.dp)
                            .background(
                                if (isListening) Color(0x33EF4444) else Color.Transparent,
                                CircleShape
                            )
                    ) {
                        Icon(
                            imageVector = if (isListening) Icons.Default.Mic else Icons.Default.MicOff,
                            contentDescription = "Microphone",
                            tint = if (isListening) Color(0xFFEF4444) else TextSecondary,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(4.dp))

                    // Hint button
                    Button(
                        onClick = onAskHint,
                        colors = ButtonDefaults.buttonColors(containerColor = BorderDark),
                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(28.dp)
                    ) {
                        Text(text = "💡 Hint", color = GoldLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Advice Message text
            val message = coachAdvice?.message ?: "Your turn. Look for center control and develop minor pieces."
            Text(
                text = "\"$message\"",
                color = TextPrimary,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )
        }
    }
}
