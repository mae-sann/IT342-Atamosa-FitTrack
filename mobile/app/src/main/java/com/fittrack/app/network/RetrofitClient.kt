package com.fittrack.app.network

import com.fittrack.app.utils.TokenManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // ── CHANGE THIS to your deployed backend URL when ready ──
    // For Android emulator, 10.0.2.2 points to your PC localhost
    // For physical device on same WiFi, use your PC's local IP
    // e.g. "http://192.168.1.5:8080/api/v1/"
    private const val BASE_URL = "http://10.0.2.2:8080/api/v1/"
    //private const val BASE_URL = "http://192.168.1.5:8080/api/v1"

    // Lazy so it's only created once
    private var retrofit: Retrofit? = null

    private fun getClient(tokenManager: TokenManager): Retrofit {
        if (retrofit != null) return retrofit!!

        // Logging — shows all API requests/responses in Logcat
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttp = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttp)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit!!
    }

    // ── Service factories ──
    fun getAuthService(tokenManager: TokenManager): AuthApiService =
        getClient(tokenManager).create(AuthApiService::class.java)

    fun getWorkoutService(tokenManager: TokenManager): WorkoutApiService =
        getClient(tokenManager).create(WorkoutApiService::class.java)

    fun getExerciseService(tokenManager: TokenManager): ExerciseApiService =
        getClient(tokenManager).create(ExerciseApiService::class.java)

    fun getGoalService(tokenManager: TokenManager): GoalApiService =
        getClient(tokenManager).create(GoalApiService::class.java)

    // Call this when user logs out so next login gets fresh client
    fun reset() { retrofit = null }
}