package com.fittrack.app.activities

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
import com.fittrack.app.R
import com.fittrack.app.fragments.DashboardFragment
import com.fittrack.app.fragments.GoalsFragment
import com.fittrack.app.fragments.ProfileFragment
import com.fittrack.app.fragments.WorkoutHistoryFragment
import com.fittrack.app.utils.TokenManager
import com.fittrack.app.network.RetrofitClient

class MainActivity : Activity() {

    private lateinit var tokenManager: TokenManager

    // Bottom nav tabs
    private lateinit var tabDashboard: LinearLayout
    private lateinit var tabWorkouts: LinearLayout
    private lateinit var tabGoals: LinearLayout
    private lateinit var tabProfile: LinearLayout

    // Tab labels (for color switching)
    private lateinit var labelDashboard: TextView
    private lateinit var labelWorkouts: TextView
    private lateinit var labelGoals: TextView
    private lateinit var labelProfile: TextView

    // Track which tab is active
    private var activeTab = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        tokenManager = TokenManager(this)

        // Check token — if missing go to login
        if (!tokenManager.hasToken()) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // Bind tab views
        tabDashboard  = findViewById(R.id.tabDashboard)
        tabWorkouts   = findViewById(R.id.tabWorkouts)
        tabGoals      = findViewById(R.id.tabGoals)
        tabProfile    = findViewById(R.id.tabProfile)

        labelDashboard = findViewById(R.id.labelDashboard)
        labelWorkouts  = findViewById(R.id.labelWorkouts)
        labelGoals     = findViewById(R.id.labelGoals)
        labelProfile   = findViewById(R.id.labelProfile)

        // Tab click listeners
        tabDashboard.setOnClickListener { switchTab(0) }
        tabWorkouts.setOnClickListener  { switchTab(1) }
        tabGoals.setOnClickListener     { switchTab(2) }
        tabProfile.setOnClickListener   { switchTab(3) }

        // Start on Dashboard
        switchTab(0)
    }

    public fun switchTab(index: Int) {
        activeTab = index

        // Swap fragment
        val fragment = when (index) {
            0 -> DashboardFragment()
            1 -> WorkoutHistoryFragment()
            2 -> GoalsFragment()
            3 -> ProfileFragment()
            else -> DashboardFragment()
        }

        fragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()

        // Update label colors
        val active   = getColor(R.color.colorPrimary)
        val inactive = getColor(R.color.colorTextMuted)

        labelDashboard.setTextColor(if (index == 0) active else inactive)
        labelWorkouts.setTextColor(if  (index == 1) active else inactive)
        labelGoals.setTextColor(if     (index == 2) active else inactive)
        labelProfile.setTextColor(if   (index == 3) active else inactive)
    }

    // Called from fragments to navigate to Create Workout
    fun openCreateWorkout() {
        startActivity(Intent(this, CreateWorkoutActivity::class.java))
    }

    // Called from ProfileFragment on logout
    fun logout() {
        tokenManager.clearAll()
        RetrofitClient.reset()
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}