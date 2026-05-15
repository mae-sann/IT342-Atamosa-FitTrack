package com.fittrack.app.fragments

import android.app.AlertDialog
import android.app.Fragment
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.fittrack.app.R
import com.fittrack.app.activities.MainActivity
import com.fittrack.app.utils.DialogHelper
import com.fittrack.app.models.UpdateProfileRequest
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Locale

class ProfileFragment : Fragment() {

    private lateinit var tokenManager: TokenManager

    private lateinit var tvAvatarInitials: TextView
    private lateinit var tvProfileName: TextView
    private lateinit var tvProfileEmail: TextView
    private lateinit var tvProfileRole: TextView
    private lateinit var tvAccountType: TextView
    private lateinit var tvMemberSince: TextView
    private lateinit var layoutGoogleNote: LinearLayout
    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var btnEditProfile: Button
    private lateinit var btnSaveProfile: Button
    private lateinit var tvProfileSuccess: TextView
    private lateinit var btnLogout: Button

    private var isEditing = false

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_profile, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        tokenManager = TokenManager(activity)

        tvAvatarInitials = view.findViewById(R.id.tvAvatarInitials)
        tvProfileName    = view.findViewById(R.id.tvProfileName)
        tvProfileEmail   = view.findViewById(R.id.tvProfileEmail)
        tvProfileRole    = view.findViewById(R.id.tvProfileRole)
        tvAccountType    = view.findViewById(R.id.tvAccountType)
        tvMemberSince    = view.findViewById(R.id.tvMemberSince)
        layoutGoogleNote = view.findViewById(R.id.layoutGoogleNote)
        etFirstName      = view.findViewById(R.id.etFirstName)
        etLastName       = view.findViewById(R.id.etLastName)
        etEmail          = view.findViewById(R.id.etEmail)
        btnEditProfile   = view.findViewById(R.id.btnEditProfile)
        btnSaveProfile   = view.findViewById(R.id.btnSaveProfile)
        tvProfileSuccess = view.findViewById(R.id.tvProfileSuccess)
        btnLogout        = view.findViewById(R.id.btnLogout)

        // Show cached data instantly — no blank screen while loading
        loadCachedUserInfo()

        // Fetch fresh data from API including createdAt
        fetchUserFromApi()

        btnEditProfile.setOnClickListener { toggleEditing(true) }
        btnSaveProfile.setOnClickListener { saveProfile() }
        btnLogout.setOnClickListener     { confirmLogout() }
    }

    // ── LOAD FROM CACHE (instant, no network needed) ───────
    private fun loadCachedUserInfo() {
        val firstName = tokenManager.getFirstName() ?: ""
        val lastName  = tokenManager.getLastName()  ?: ""
        val email     = tokenManager.getEmail()     ?: ""
        val provider  = tokenManager.getProvider()  ?: "LOCAL"

        tvAvatarInitials.text = buildInitials(firstName, lastName)
        tvProfileName.text    = "$firstName $lastName".trim()
        tvProfileEmail.text   = email
        tvProfileRole.text    = if (tokenManager.isAdmin()) "Admin" else "User"
        tvAccountType.text    = if (provider.uppercase() == "GOOGLE")
            "Google Account" else "Local Account"

        layoutGoogleNote.visibility =
            if (provider.uppercase() == "GOOGLE") View.VISIBLE else View.GONE

        etFirstName.setText(firstName)
        etLastName.setText(lastName)
        etEmail.setText(email)

        // Display cached member since date, or show loading
        val cachedCreatedAt = tokenManager.getCreatedAt()
        tvMemberSince.text = if (!cachedCreatedAt.isNullOrEmpty()) 
            formatMemberSince(cachedCreatedAt) 
        else 
            "Loading..."
    }

    // ── FETCH FROM API ─────────────────────────────────────
    private fun fetchUserFromApi() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getAuthService(tokenManager)
                val response = service.getCurrentUser()

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val body = response.body()

                        // Log full response so we can see exact field names
                        android.util.Log.d("PROFILE_DEBUG", "Response body: $body")
                        android.util.Log.d("PROFILE_DEBUG", "Data: ${body?.data}")

                        val user = body?.data ?: run {
                            tvMemberSince.text = "2026"
                            return@withContext
                        }

                        android.util.Log.d("PROFILE_DEBUG", "createdAt: ${user.createdAt}")
                        android.util.Log.d("PROFILE_DEBUG", "firstName: ${user.firstName}")
                        android.util.Log.d("PROFILE_DEBUG", "lastName: ${user.lastName}")

                        val firstName = user.firstName ?: ""
                        val lastName  = user.lastName  ?: ""
                        val provider  = user.provider  ?: "LOCAL"

                        // Update all UI fields with fresh API data
                        tvAvatarInitials.text = buildInitials(firstName, lastName)
                        tvProfileName.text    = "$firstName $lastName".trim()
                        tvProfileEmail.text   = user.email
                        tvProfileRole.text    = if (user.role?.uppercase()
                                ?.contains("ADMIN") == true) "Admin" else "User"
                        tvAccountType.text    = if (provider.uppercase() == "GOOGLE")
                            "Google Account" else "Local Account"

                        layoutGoogleNote.visibility =
                            if (provider.uppercase() == "GOOGLE")
                                View.VISIBLE else View.GONE

                        etFirstName.setText(firstName)
                        etLastName.setText(lastName)
                        etEmail.setText(user.email)

                        // Member since — try createdAt field first
                        val dateStr = user.createdAt
                        android.util.Log.d("PROFILE_DEBUG", "dateStr to format: $dateStr")
                        tvMemberSince.text = formatMemberSince(dateStr)

                        // Update cached values
                        tokenManager.saveUserInfo(
                            email     = user.email,
                            firstName = firstName,
                            lastName  = lastName,
                            role      = user.role ?: "ROLE_USER",
                            provider  = provider,
                            createdAt = user.createdAt
                        )

                    } else {
                        android.util.Log.d("PROFILE_DEBUG",
                            "API failed: ${response.code()} — ${response.errorBody()?.string()}")
                        tvMemberSince.text = "2026"
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    android.util.Log.e("PROFILE_DEBUG",
                        "Exception: ${e.javaClass.simpleName} — ${e.message}")
                    tvMemberSince.text = "2026"
                }
            }
        }
    }

    // ── FORMAT MEMBER SINCE ────────────────────────────────
    // Handles multiple date formats your backend might return
    private fun formatMemberSince(createdAt: String?): String {
        android.util.Log.d("PROFILE_DEBUG", "formatMemberSince input: $createdAt")

        if (createdAt.isNullOrEmpty()) return "2026"

        val outputFormat = SimpleDateFormat("MMM yyyy", Locale.getDefault())

        // Try each format until one works
        val formatStrings = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX",  // with timezone offset
            "yyyy-MM-dd'T'HH:mm:ss.SSSSSS",   // microseconds no TZ
            "yyyy-MM-dd'T'HH:mm:ss.SSS",       // milliseconds
            "yyyy-MM-dd'T'HH:mm:ssX",          // with timezone
            "yyyy-MM-dd'T'HH:mm:ss'Z'",        // UTC Z
            "yyyy-MM-dd'T'HH:mm:ss",           // no timezone
            "yyyy-MM-dd HH:mm:ss",             // space separator
            "yyyy-MM-dd"                        // date only
        )

        for (fmt in formatStrings) {
            try {
                val parser = SimpleDateFormat(fmt, Locale.getDefault())
                parser.isLenient = true
                // Take first 26 chars to avoid parsing issues with long strings
                val toParse = createdAt.take(26)
                val parsed  = parser.parse(toParse)
                if (parsed != null) {
                    val result = outputFormat.format(parsed)
                    android.util.Log.d("PROFILE_DEBUG",
                        "Successfully parsed with format '$fmt' → $result")
                    return result
                }
            } catch (e: Exception) {
                // Try next format
                continue
            }
        }

        // Last resort — extract year and month directly from the string
        return try {
            val year  = createdAt.substring(0, 4)
            val month = createdAt.substring(5, 7).toInt()
            val monthNames = listOf("", "Jan", "Feb", "Mar", "Apr", "May",
                "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")
            "${monthNames.getOrElse(month) { "Jan" }} $year"
        } catch (e: Exception) {
            android.util.Log.e("PROFILE_DEBUG", "All parsing failed for: $createdAt")
            createdAt.take(7) // Return "2026-04" as last fallback
        }
    }

    private fun buildInitials(firstName: String, lastName: String): String {
        val f = firstName.firstOrNull()?.uppercaseChar() ?: ""
        val l = lastName.firstOrNull()?.uppercaseChar()  ?: ""
        return "$f$l".ifEmpty { "?" }
    }

    // ── TOGGLE EDIT MODE ───────────────────────────────────
    private fun toggleEditing(editing: Boolean) {
        isEditing             = editing
        etFirstName.isEnabled = editing
        etLastName.isEnabled  = editing

        btnEditProfile.visibility =
            if (editing) View.GONE else View.VISIBLE
        btnSaveProfile.visibility =
            if (editing) View.VISIBLE else View.GONE
        tvProfileSuccess.visibility = View.GONE
    }

    // ── SAVE PROFILE ───────────────────────────────────────
    private fun saveProfile() {
        val firstName = etFirstName.text.toString().trim()
        val lastName  = etLastName.text.toString().trim()

        if (firstName.isEmpty() || lastName.isEmpty()) {
            Toast.makeText(
                activity, "Name cannot be empty",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        btnSaveProfile.isEnabled = false
        btnSaveProfile.text      = "Saving..."

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getAuthService(tokenManager)
                val response = service.updateProfile(
                    UpdateProfileRequest(
                        firstName = firstName,
                        lastName  = lastName
                    )
                )

                withContext(Dispatchers.Main) {
                    btnSaveProfile.isEnabled = true
                    btnSaveProfile.text      = "Save Changes"

                    if (response.isSuccessful) {
                        tokenManager.saveUserInfo(
                            email     = tokenManager.getEmail()    ?: "",
                            firstName = firstName,
                            lastName  = lastName,
                            role      = tokenManager.getRole()     ?: "ROLE_USER",
                            provider  = tokenManager.getProvider() ?: "LOCAL"
                        )
                        tvAvatarInitials.text = buildInitials(firstName, lastName)
                        tvProfileName.text    = "$firstName $lastName".trim()
                        toggleEditing(false)
                        tvProfileSuccess.visibility = View.VISIBLE
                    } else {
                        Toast.makeText(
                            activity,
                            "Failed to update profile",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    btnSaveProfile.isEnabled = true
                    btnSaveProfile.text      = "Save Changes"
                    Toast.makeText(
                        activity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    // ── LOGOUT ─────────────────────────────────────────────
    private fun confirmLogout() {
        AlertDialog.Builder(activity)
        DialogHelper.showLogoutDialog(
            context = activity,
            onConfirm = { (activity as? MainActivity)?.logout() }
        )
    }
}