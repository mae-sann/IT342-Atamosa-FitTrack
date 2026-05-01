package com.fittrack.app.activities

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.app.Activity
import com.fittrack.app.R
import com.fittrack.app.utils.TokenManager

@SuppressLint("CustomSplashScreen")
class SplashActivity : Activity() {

    private lateinit var tokenManager: TokenManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        tokenManager = TokenManager(this)

        // Wait 1.5 seconds then navigate
        Handler(Looper.getMainLooper()).postDelayed({
            if (tokenManager.hasToken()) {
                // Token exists — go straight to main app
                startActivity(Intent(this, MainActivity::class.java))
            } else {
                // No token — go to login
                startActivity(Intent(this, LoginActivity::class.java))
            }
            finish() // Remove splash from back stack
        }, 1500)
    }
}