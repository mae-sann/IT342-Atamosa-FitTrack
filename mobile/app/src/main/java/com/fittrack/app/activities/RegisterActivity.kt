package com.fittrack.app.activities

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import com.fittrack.app.R
import com.fittrack.app.models.RegisterRequest
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegisterActivity : Activity() {

    private lateinit var tokenManager: TokenManager

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var spinnerRole: Spinner
    private lateinit var btnRegister: Button
    private lateinit var tvLoginLink: TextView
    private lateinit var tvError: TextView
    private lateinit var progressBar: View

    // Role options shown in spinner
    private val roleOptions = listOf("User", "Admin")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        tokenManager = TokenManager(this)

        // Bind views
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        spinnerRole = findViewById(R.id.spinnerRole)
        btnRegister = findViewById(R.id.btnRegister)
        tvLoginLink = findViewById(R.id.tvLoginLink)
        tvError = findViewById(R.id.tvError)
        progressBar = findViewById(R.id.progressBar)

        // Set up role spinner
        val adapter = ArrayAdapter(
            this,
            R.layout.spinner_item,
            roleOptions
        )
        adapter.setDropDownViewResource(R.layout.spinner_dropdown_item)
        spinnerRole.adapter = adapter

        // Register button
        btnRegister.setOnClickListener {
            val firstName = etFirstName.text.toString().trim()
            val lastName = etLastName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            val confirm = etConfirmPassword.text.toString().trim()

            when {
                firstName.isEmpty() ->
                    showError("Please enter your first name")
                lastName.isEmpty() ->
                    showError("Please enter your last name")
                email.isEmpty() ->
                    showError("Please enter your email")
                !android.util.Patterns.EMAIL_ADDRESS
                    .matcher(email).matches() ->
                    showError("Please enter a valid email")
                password.length < 8 ->
                    showError("Password must be at least 8 characters")
                password != confirm ->
                    showError("Passwords do not match")
                else -> {
                    // Convert selected role to backend format
                    val selectedRole = when (spinnerRole.selectedItem.toString()) {
                        "Admin" -> "ADMIN"
                        else -> "USER"
                    }
                    performRegister(firstName, lastName, email, password, selectedRole)
                }
            }
        }

        // Go back to Login
        tvLoginLink.setOnClickListener { finish() }
    }

    private fun performRegister(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String
    ) {
        showLoading(true)
        hideError()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service = RetrofitClient.getAuthService(tokenManager)
                val response = service.register(
                    RegisterRequest(
                        firstName = firstName,
                        lastName = lastName,
                        email = email,
                        password = password,
                        role = role
                    )
                )

                withContext(Dispatchers.Main) {
                    showLoading(false)

                    if (response.isSuccessful) {
                        val body = response.body()

                        // Your backend returns: { "user": {...}, "message": "..." }
                        if (body != null && body.user != null) {
                            val user = body.user

                            // Save user ID
                            user.id?.let { tokenManager.saveUserId(it) }

                            // Save user info (use null-safe values)
                            tokenManager.saveUserInfo(
                                email = user.email,
                                firstName = user.firstName ?: firstName,
                                lastName = user.lastName ?: lastName,
                                role = "ROLE_USER",
                                provider = user.provider ?: "LOCAL"
                            )

                            // Show success message
                            Toast.makeText(
                                this@RegisterActivity,
                                "Registration successful! Please login.",
                                Toast.LENGTH_LONG
                            ).show()

                            // Navigate back to Login screen
                            finish()
                        } else {
                            showError("Registration failed: Invalid response")
                        }
                    } else {
                        when (response.code()) {
                            409 -> showError("Email already registered. Try logging in.")
                            400 -> showError("Invalid information. Please check your inputs.")
                            else -> showError("Registration failed. Please try again.")
                        }
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showLoading(false)
                    showError("Network error: ${e.message}")
                }
            }
        }
    }

    private fun showLoading(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
        btnRegister.isEnabled = !show
        btnRegister.text = if (show) "Creating account…" else "Create Account"
    }

    private fun showError(message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun hideError() {
        tvError.visibility = View.GONE
    }
}