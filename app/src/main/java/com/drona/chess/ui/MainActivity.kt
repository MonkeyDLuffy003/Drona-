package com.drona.chess.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.drona.chess.data.GamePreferences
import com.drona.chess.ui.screens.*
import com.drona.chess.ui.theme.DronaAITheme
import com.drona.chess.ui.viewmodel.ChessViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            DronaAITheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0A0D1A)
                ) {
                    val navController = rememberNavController()
                    val viewModel: ChessViewModel = viewModel()
                    val preferences = remember { GamePreferences(applicationContext) }
                    val uiState by viewModel.uiState.collectAsState()

                    // Request audio recording permission for voice coaching
                    val micPermissionLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestPermission()
                    ) { isGranted ->
                        if (isGranted) {
                            viewModel.toggleListening()
                        }
                    }

                    NavHost(
                        navController = navController,
                        startDestination = "home"
                    ) {
                        composable("home") {
                            HomeScreen(
                                playerRating = preferences.playerRating,
                                isVoiceEnabled = uiState.isVoiceEnabled,
                                onToggleVoice = { viewModel.toggleVoice() },
                                onNavigateToGame = { mode, color, difficulty ->
                                    viewModel.startNewGame(color, difficulty, mode)
                                    navController.navigate("game")
                                },
                                onNavigateToPuzzles = { navController.navigate("puzzles") },
                                onNavigateToTraining = { navController.navigate("training") },
                                onNavigateToAnalysis = { navController.navigate("analysis") },
                                onNavigateToProgress = { navController.navigate("progress") }
                            )
                        }

                        composable("game") {
                            GameScreen(
                                viewModel = viewModel,
                                onNavigateBack = { navController.popBackStack() }
                            )
                        }

                        composable("puzzles") {
                            PuzzlesScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("training") {
                            TrainingScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("analysis") {
                            AnalysisScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }

                        composable("progress") {
                            ProgressScreen(
                                preferences = preferences,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
