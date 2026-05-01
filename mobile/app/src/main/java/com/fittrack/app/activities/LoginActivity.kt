package com.fittrack.app.activities

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import com.fittrack.app.R
import com.fittrack.app.models.LoginRequest
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : Activity() {

    private lateinit var tokenManager: TokenManager

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvRegisterLink: TextView
    private lateinit var tvError: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        tokenManager = TokenManager(this)

        // Check if already logged in
        if (tokenManager.hasToken()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        // Bind views
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvRegisterLink = findViewById(R.id.tvRegisterLink)
        tvError = findViewById(R.id.tvError)
        progressBar = findViewById(R.id.progressBar)

        // Login button
        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString()

            when {
                email.isEmpty() -> showError("Please enter your email")
                password.isEmpty() -> showError("Please enter your password")
                else -> performLogin(email, password)
            }
        }

        // Register link
        tvRegisterLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun performLogin(email: String, password: String) {
        showLoading(true)
        hideError()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service = RetrofitClient.getAuthService(tokenManager)
                val response = service.login(LoginRequest(email, password))

                withContext(Dispatchers.Main) {
                    showLoading(false)

                    if (response.isSuccessful) {
                        val body = response.body()

                        // Your backend returns: { "token": "...", "user": {...} }
                        if (body != null && body.token != null) {
                            // Save token
                            tokenManager.saveToken(body.token)

                            // Save user info
                            val user = body.user
                            if (user != null) {
                                tokenManager.saveUserInfo(
                                    email = user.email,
                                    firstName = user.firstName ?: "",
                                    lastName = user.lastName ?: "",
                                    role = "ROLE_USER",
                                    provider = user.provider ?: "LOCAL"
                                )
                                user.id?.let { tokenManager.saveUserId(it) }
                            }

                            Toast.makeText(
                                this@LoginActivity,
                                "Login successful!",
                                Toast.LENGTH_SHORT
                            ).show()

                            // Navigate to MainActivity
                            val intent = Intent(this@LoginActivity, MainActivity::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            startActivity(intent)
                            finish()
                        } else {
                            showError("Login failed: Invalid response")
                        }
                    } else {
                        when (response.code()) {
                            401 -> showError("Invalid email or password")
                            404 -> showError("Service unavailable. Please try again.")
                            else -> showError("Login failed. Please try again.")
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
        btnLogin.isEnabled = !show
        btnLogin.text = if (show) "Logging in..." else "Login"
    }

    private fun showError(message: String) {
        tvError.text = message
        tvError.visibility = View.VISIBLE
    }

    private fun hideError() {
        tvError.visibility = View.GONE
    }
}