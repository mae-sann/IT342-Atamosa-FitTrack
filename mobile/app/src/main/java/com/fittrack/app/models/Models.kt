package com.fittrack.app.models

import com.google.gson.annotations.SerializedName

// ══════════════════════════════════════════
// AUTH MODELS
// ══════════════════════════════════════════

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val role: String = "USER"
)

data class AuthResponse(
    val success: Boolean,
    val data: AuthData?,
    val error: ErrorData?,
    val timestamp: String?
)

data class AuthData(
    val user: UserData,
    val accessToken: String,
    val refreshToken: String?
)

// Add this to your Models.kt - matches your backend's login response
data class BackendLoginResponse(
    val token: String?,
    val user: UserData?
)

data class UserData(
    val id: Long?,
    val email: String,
    val firstName: String?,      // camelCase matches backend
    val lastName: String?,       // camelCase matches backend
    val role: String?,
    val provider: String?,
    val createdAt: String?       // camelCase matches backend
)

data class UpdateProfileRequest(
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String
)

data class UserResponse(
    val success: Boolean,
    val data: UserData?,
    val error: ErrorData?
)

// ══════════════════════════════════════════
// WORKOUT MODELS
// ══════════════════════════════════════════

data class WorkoutResponse(
    val id: Long,
    @SerializedName("workout_date") val workoutDate: String,
    val title: String?,
    @SerializedName("created_at") val createdAt: String?,
    val logs: List<WorkoutLogResponse>?
)

data class WorkoutLogResponse(
    val id: Long?,
    @SerializedName("exercise_name") val exerciseName: String,
    @SerializedName("muscle_group") val muscleGroup: String?,
    val sets: Int,
    val reps: Int
)

data class CreateWorkoutRequest(
    @SerializedName("workoutDate") val workoutDate: String,
    @SerializedName("workoutName") val workoutName: String? = null,
    @SerializedName("logs") val logs: List<WorkoutLogRequest>
)

// Backend Register Response Format
data class BackendRegisterResponse(
    val user: UserData?,
    val message: String?
)

data class WorkoutLogRequest(
    @SerializedName("exerciseName") val exerciseName: String,
    val sets: Int,
    val reps: Int
)

data class WorkoutListResponse(
    val success: Boolean,
    @SerializedName("data") val data: List<WorkoutResponse>? = null,
    @SerializedName("items") val items: List<WorkoutResponse>? = null,
    val error: ErrorData?
)

data class SingleWorkoutResponse(
    val success: Boolean,
    @SerializedName("data") val data: WorkoutResponse? = null,
    @SerializedName("item") val item: WorkoutResponse? = null,
    val error: ErrorData?
)

// ══════════════════════════════════════════
// EXERCISE MODELS
// ══════════════════════════════════════════

data class ExerciseResponse(
    val id: Long,
    val name: String,
    @SerializedName("muscle_group") val muscleGroup: String,
    val description: String?
)

data class ExerciseListResponse(
    val items: List<ExerciseResponse>?,
    val message: String?
)

// For admin — create/edit exercise
data class ExerciseRequest(
    val name: String,
    @SerializedName("muscle_group") val muscleGroup: String,
    val description: String?
)

// ══════════════════════════════════════════
// GOAL MODELS
// ══════════════════════════════════════════

data class GoalResponse(
    val id: Long,
    @SerializedName("user_id") val userId: Long?,
    @SerializedName("goal_text") val goalText: String,
    @SerializedName("target_value") val targetValue: Float,
    @SerializedName("current_value") val currentValue: Float,
    @SerializedName("created_at") val createdAt: String?
)

data class CreateGoalRequest(
    @SerializedName("goal_text") val goalText: String,
    @SerializedName("target_value") val targetValue: Float,
    @SerializedName("current_value") val currentValue: Float
)

data class UpdateGoalRequest(
    @SerializedName("current_value") val currentValue: Float
)

data class GoalListResponse(
    val success: Boolean,
    @SerializedName("data") val data: List<GoalResponse>? = null,
    @SerializedName("items") val items: List<GoalResponse>? = null,
    val error: ErrorData?
)

data class SingleGoalResponse(
    val success: Boolean,
    @SerializedName("data") val data: GoalResponse? = null,
    @SerializedName("item") val item: GoalResponse? = null,
    val error: ErrorData?
)

// ══════════════════════════════════════════
// ERROR / COMMON
// ══════════════════════════════════════════

data class ErrorData(
    val code: String?,
    val message: String?,
    val details: Any?
)

data class GenericResponse(
    val success: Boolean,
    val data: Any?,
    val error: ErrorData?,
    val timestamp: String?
)

// ══════════════════════════════════════════
// LOCAL / UI MODELS
// (not from API — used only inside the app)
// ══════════════════════════════════════════

// Used in CreateWorkoutActivity to track exercises
// being added before saving to API
data class WorkoutExerciseItem(
    val exerciseName: String,
    val muscleGroup: String,
    var sets: Int,
    var reps: Int
)

// Used for computing goal status badge on the UI
enum class GoalStatus {
    JUST_STARTED,   // < 50%
    IN_PROGRESS,    // 50–89%
    ALMOST_THERE,   // 90–99%
    DONE            // >= 100%
}

// Helper function to compute GoalStatus from values
fun computeGoalStatus(current: Float, target: Float): GoalStatus {
    if (target <= 0f) return GoalStatus.JUST_STARTED
    val pct = (current / target) * 100f
    return when {
        pct >= 100f -> GoalStatus.DONE
        pct >= 90f  -> GoalStatus.ALMOST_THERE
        pct >= 50f  -> GoalStatus.IN_PROGRESS
        else        -> GoalStatus.JUST_STARTED
    }
}

// Helper function to derive category from logs
// Returns the most common muscle_group in a workout
fun deriveCategoryFromLogs(logs: List<WorkoutLogResponse>?): String {
    if (logs.isNullOrEmpty()) return "General"
    val groups = logs.mapNotNull { it.muscleGroup }.filter { it.isNotBlank() }
    if (groups.isEmpty()) return "General"
    return groups.groupingBy { it }
        .eachCount()
        .maxByOrNull { it.value }
        ?.key ?: "General"
}