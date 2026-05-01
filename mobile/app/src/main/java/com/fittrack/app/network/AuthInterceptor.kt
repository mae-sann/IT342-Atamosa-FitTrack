package com.fittrack.app.network

import com.fittrack.app.utils.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

// Automatically attaches JWT token to every API request
// as: Authorization: Bearer <token>
class AuthInterceptor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenManager.getToken()

        // If no token, send request as-is (login/register endpoints)
        val request = if (!token.isNullOrEmpty()) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Content-Type", "application/json")
                .build()
        } else {
            chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")
                .build()
        }

        return chain.proceed(request)
    }
}