package com.fittrack.app.network

import com.fittrack.app.models.*
import retrofit2.Response
import retrofit2.http.*

// ── AUTH ──
interface AuthApiService {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<BackendLoginResponse>  // Changed!

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<BackendRegisterResponse>

    @GET("auth/me")
    suspend fun getCurrentUser(): Response<UserResponse>

    @PUT("users/me")
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): Response<UserResponse>
}

// ── WORKOUTS ──
interface WorkoutApiService {

    @GET("workouts")
    suspend fun getWorkouts(): Response<WorkoutListResponse>

    @GET("workouts/{id}")
    suspend fun getWorkoutById(
        @Path("id") id: Long
    ): Response<SingleWorkoutResponse>

    @POST("workouts")
    suspend fun createWorkout(
        @Body request: CreateWorkoutRequest
    ): Response<SingleWorkoutResponse>

    @DELETE("workouts/{id}")
    suspend fun deleteWorkout(
        @Path("id") id: Long
    ): Response<GenericResponse>
}

// ── EXERCISES ──
interface ExerciseApiService {

    @GET("exercises")
    suspend fun getExercises(): Response<ExerciseListResponse>

    // Admin only
    @POST("exercises")
    suspend fun createExercise(
        @Body request: ExerciseRequest
    ): Response<GenericResponse>

    @PUT("exercises/{id}")
    suspend fun updateExercise(
        @Path("id") id: Long,
        @Body request: ExerciseRequest
    ): Response<GenericResponse>

    @DELETE("exercises/{id}")
    suspend fun deleteExercise(
        @Path("id") id: Long
    ): Response<GenericResponse>
}

// ── GOALS ──
interface GoalApiService {

    @GET("goals")
    suspend fun getGoals(): Response<GoalListResponse>

    @POST("goals")
    suspend fun createGoal(
        @Body request: CreateGoalRequest
    ): Response<SingleGoalResponse>

    @PUT("goals/{id}")
    suspend fun updateGoal(
        @Path("id") id: Long,
        @Body request: UpdateGoalRequest
    ): Response<SingleGoalResponse>

    @DELETE("goals/{id}")
    suspend fun deleteGoal(
        @Path("id") id: Long
    ): Response<GenericResponse>
}