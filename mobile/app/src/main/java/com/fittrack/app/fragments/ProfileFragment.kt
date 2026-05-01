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
import com.fittrack.app.models.UpdateProfileRequest
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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

        loadUserInfo()

        btnEditProfile.setOnClickListener { toggleEditing(true) }

        btnSaveProfile.setOnClickListener { saveProfile() }

        btnLogout.setOnClickListener { confirmLogout() }
    }

    private fun loadUserInfo() {
        val firstName = tokenManager.getFirstName() ?: ""
        val lastName  = tokenManager.getLastName()  ?: ""
        val email     = tokenManager.getEmail()     ?: ""
        val role      = tokenManager.getRole()      ?: "ROLE_USER"
        val provider  = tokenManager.getProvider()  ?: "LOCAL"

        // Avatar
        tvAvatarInitials.text = tokenManager.getInitials().ifEmpty { "?" }

        // Name + email
        tvProfileName.text  = "$firstName $lastName".trim()
        tvProfileEmail.text = email

        // Role badge
        tvProfileRole.text = if (tokenManager.isAdmin()) "Admin" else "User"

        // Account type
        tvAccountType.text = if (provider.uppercase() == "GOOGLE")
            "Google Account" else "Local Account"

        // Google note
        layoutGoogleNote.visibility =
            if (provider.uppercase() == "GOOGLE") View.VISIBLE else View.GONE

        // Form fields
        etFirstName.setText(firstName)
        etLastName.setText(lastName)
        etEmail.setText(email)
    }

    private fun toggleEditing(editing: Boolean) {
        isEditing = editing
        etFirstName.isEnabled = editing
        etLastName.isEnabled  = editing
        btnEditProfile.visibility  =
            if (editing) View.GONE else View.VISIBLE
        btnSaveProfile.visibility  =
            if (editing) View.VISIBLE else View.GONE
        tvProfileSuccess.visibility = View.GONE
    }

    private fun saveProfile() {
        val firstName = etFirstName.text.toString().trim()
        val lastName  = etLastName.text.toString().trim()

        if (firstName.isEmpty() || lastName.isEmpty()) {
            Toast.makeText(activity, "Name cannot be empty", Toast.LENGTH_SHORT).show()
            return
        }

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
                    if (response.isSuccessful) {
                        // Update cached values
                        tokenManager.saveUserInfo(
                            email     = tokenManager.getEmail() ?: "",
                            firstName = firstName,
                            lastName  = lastName,
                            role      = tokenManager.getRole() ?: "ROLE_USER",
                            provider  = tokenManager.getProvider() ?: "LOCAL"
                        )
                        loadUserInfo()
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
                    Toast.makeText(
                        activity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun confirmLogout() {
        AlertDialog.Builder(activity)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Logout") { _, _ ->
                (activity as? MainActivity)?.logout()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}