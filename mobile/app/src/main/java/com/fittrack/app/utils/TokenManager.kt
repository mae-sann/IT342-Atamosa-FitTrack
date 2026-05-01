package com.fittrack.app.utils

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {

    private val prefs: SharedPreferences = context
        .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    companion object {
        private const val PREFS_NAME = "fittrack_prefs"
        private const val KEY_TOKEN = "jwt_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_EMAIL = "user_email"
        private const val KEY_FNAME = "user_first_name"
        private const val KEY_LNAME = "user_last_name"
        private const val KEY_ROLE = "user_role"
        private const val KEY_PROVIDER = "user_provider"
    }

    // ── Token ──
    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    fun hasToken(): Boolean {
        return !getToken().isNullOrEmpty()
    }

    // ── User ID ──
    fun saveUserId(userId: Long) {
        prefs.edit().putLong(KEY_USER_ID, userId).apply()
    }

    fun getUserId(): Long {
        return prefs.getLong(KEY_USER_ID, 0L)
    }

    // ── User info (cached after login) ──
    fun saveUserInfo(
        email: String,
        firstName: String?,
        lastName: String?,
        role: String,
        provider: String
    ) {
        prefs.edit()
            .putString(KEY_EMAIL, email ?: "")
            .putString(KEY_FNAME, firstName ?: "")
            .putString(KEY_LNAME, lastName ?: "")
            .putString(KEY_ROLE, role)
            .putString(KEY_PROVIDER, provider)
            .apply()
    }

    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getFirstName(): String? = prefs.getString(KEY_FNAME, null)
    fun getLastName(): String? = prefs.getString(KEY_LNAME, null)
    fun getRole(): String? = prefs.getString(KEY_ROLE, null)
    fun getProvider(): String? = prefs.getString(KEY_PROVIDER, null)

    fun getFullName(): String {
        val first = getFirstName() ?: ""
        val last = getLastName() ?: ""
        return "$first $last".trim()
    }

    fun getInitials(): String {
        val first = getFirstName()?.firstOrNull()?.uppercaseChar() ?: ""
        val last = getLastName()?.firstOrNull()?.uppercaseChar() ?: ""
        return "$first$last"
    }

    fun isAdmin(): Boolean {
        return getRole()?.uppercase() == "ROLE_ADMIN" ||
                getRole()?.uppercase() == "ADMIN"
    }

    fun isGoogleUser(): Boolean {
        return getProvider()?.uppercase() == "GOOGLE"
    }

    // ── Clear everything on logout ──
    fun clearAll() {
        prefs.edit().clear().apply()
    }
}