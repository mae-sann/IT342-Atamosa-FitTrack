package com.fittrack.app.fragments

import android.app.Activity
import android.app.Fragment
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import com.fittrack.app.R
import com.fittrack.app.activities.CreateWorkoutActivity
import com.fittrack.app.activities.MainActivity
import com.fittrack.app.models.GoalResponse
import com.fittrack.app.models.GoalStatus
import com.fittrack.app.models.WorkoutResponse
import com.fittrack.app.models.computeGoalStatus
import com.fittrack.app.models.deriveCategoryFromLogs
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DashboardFragment : Fragment() {

    private lateinit var tokenManager: TokenManager

    // Stat card views
    private lateinit var tvGreeting: TextView
    private lateinit var tvDate: TextView
    private lateinit var tvTotalWorkouts: TextView
    private lateinit var tvDayStreak: TextView
    private lateinit var tvActiveGoals: TextView
    private lateinit var tvExercisesLogged: TextView
    private lateinit var btnNewWorkout: Button

    // Workout section
    private lateinit var progressWorkouts: ProgressBar
    private lateinit var layoutEmptyWorkouts: LinearLayout
    private lateinit var layoutRecentWorkouts: LinearLayout
    private lateinit var tvViewAllWorkouts: TextView

    // Goals section
    private lateinit var progressGoals: ProgressBar
    private lateinit var layoutEmptyGoals: LinearLayout
    private lateinit var layoutGoalsList: LinearLayout
    private lateinit var tvManageGoals: TextView

    companion object {
        private const val REQUEST_CREATE_WORKOUT = 1002
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_dashboard, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        tokenManager = TokenManager(activity)

        // Bind views
        tvGreeting           = view.findViewById(R.id.tvGreeting)
        tvDate               = view.findViewById(R.id.tvDate)
        tvTotalWorkouts      = view.findViewById(R.id.tvTotalWorkouts)
        tvDayStreak          = view.findViewById(R.id.tvDayStreak)
        tvActiveGoals        = view.findViewById(R.id.tvActiveGoals)
        tvExercisesLogged    = view.findViewById(R.id.tvExercisesLogged)
        btnNewWorkout        = view.findViewById(R.id.btnNewWorkout)
        progressWorkouts     = view.findViewById(R.id.progressWorkouts)
        layoutEmptyWorkouts  = view.findViewById(R.id.layoutEmptyWorkouts)
        layoutRecentWorkouts = view.findViewById(R.id.layoutRecentWorkouts)
        tvViewAllWorkouts    = view.findViewById(R.id.tvViewAllWorkouts)
        progressGoals        = view.findViewById(R.id.progressGoals)
        layoutEmptyGoals     = view.findViewById(R.id.layoutEmptyGoals)
        layoutGoalsList      = view.findViewById(R.id.layoutGoalsList)
        tvManageGoals        = view.findViewById(R.id.tvManageGoals)

        // Set greeting and date
        setupGreeting()

        // Button clicks
        btnNewWorkout.setOnClickListener {
            val intent = Intent(activity, CreateWorkoutActivity::class.java)
            startActivityForResult(intent, REQUEST_CREATE_WORKOUT)
        }

        tvViewAllWorkouts.setOnClickListener {
            (activity as? MainActivity)?.switchTab(1)
        }

        tvManageGoals.setOnClickListener {
            (activity as? MainActivity)?.switchTab(2)
        }

        // Load data from API
        loadWorkouts()
        loadGoals()
    }

    override fun onResume() {
        super.onResume()
        // Refresh data when returning to dashboard
        loadWorkouts()
        loadGoals()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CREATE_WORKOUT && resultCode == Activity.RESULT_OK) {
            // Refresh data when returning from create workout
            loadWorkouts()
            loadGoals()
        }
    }

    private fun setupGreeting() {
        // Debug: Check what's stored
        val firstName = tokenManager.getFirstName()
        val lastName = tokenManager.getLastName()
        val email = tokenManager.getEmail()

        android.util.Log.d("DashboardFragment", "FirstName: $firstName")
        android.util.Log.d("DashboardFragment", "LastName: $lastName")
        android.util.Log.d("DashboardFragment", "Email: $email")

        val displayName = if (!firstName.isNullOrEmpty()) {
            firstName
        } else if (!email.isNullOrEmpty()) {
            email.substringBefore("@")
        } else {
            "there"
        }

        val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        val greeting = when {
            hour < 12 -> "Good morning, $displayName! 👋"
            hour < 18 -> "Good afternoon, $displayName! 👋"
            else      -> "Good evening, $displayName! 👋"
        }
        tvGreeting.text = greeting

        // Format today's date
        val dateFormat = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.getDefault())
        tvDate.text = dateFormat.format(Date())
    }

    // ── LOAD WORKOUTS ──────────────────────────────────────
    private fun loadWorkouts() {
        progressWorkouts.visibility = View.VISIBLE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.getWorkouts()

                withContext(Dispatchers.Main) {
                    progressWorkouts.visibility = View.GONE

                    if (response.isSuccessful) {
                        val body = response.body()
                        val workouts = body?.data ?: body?.items ?: emptyList()
                        android.util.Log.d("DashboardFragment", "Loaded ${workouts.size} workouts")
                        updateWorkoutStats(workouts)
                        showRecentWorkouts(workouts.take(3))
                    } else {
                        android.util.Log.e("DashboardFragment", "Failed to load workouts: ${response.code()}")
                        showWorkoutsEmpty()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressWorkouts.visibility = View.GONE
                    android.util.Log.e("DashboardFragment", "Error loading workouts: ${e.message}", e)
                    showWorkoutsEmpty()
                }
            }
        }
    }
    private fun updateWorkoutStats(workouts: List<WorkoutResponse>) {
        // Total workouts
        tvTotalWorkouts.text = workouts.size.toString()

        // Total exercises logged (sum of all logs)
        val totalExercises = workouts.sumOf { it.logs?.size ?: 0 }
        tvExercisesLogged.text = totalExercises.toString()

        // Day streak — count consecutive days backwards from today
        tvDayStreak.text = calculateStreak(workouts).toString()
    }

    private fun calculateStreak(workouts: List<WorkoutResponse>): Int {
        if (workouts.isEmpty()) return 0

        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val today = dateFormat.format(Date())

        // Get unique workout dates sorted descending
        val workoutDates = workouts
            .mapNotNull { it.workoutDate?.take(10) }
            .toSortedSet(compareByDescending { it })
            .toList()

        if (workoutDates.isEmpty()) return 0

        var streak = 0
        val calendar = java.util.Calendar.getInstance()

        for (i in workoutDates.indices) {
            val expected = dateFormat.format(calendar.time)
            if (workoutDates.getOrNull(i) == expected) {
                streak++
                calendar.add(java.util.Calendar.DAY_OF_YEAR, -1)
            } else {
                // Allow today to be missing (streak from yesterday)
                if (i == 0 && workoutDates[0] != today) {
                    calendar.add(java.util.Calendar.DAY_OF_YEAR, -1)
                    if (workoutDates[0] == dateFormat.format(calendar.time)) {
                        streak++
                        calendar.add(java.util.Calendar.DAY_OF_YEAR, -1)
                        continue
                    }
                }
                break
            }
        }
        return streak
    }

    private fun showRecentWorkouts(workouts: List<WorkoutResponse>) {
        layoutRecentWorkouts.removeAllViews()

        if (workouts.isEmpty()) {
            showWorkoutsEmpty()
            return
        }

        layoutEmptyWorkouts.visibility  = View.GONE
        layoutRecentWorkouts.visibility = View.VISIBLE

        val inflater = LayoutInflater.from(activity)

        workouts.forEach { workout ->
            val itemView = inflater.inflate(
                R.layout.item_workout_row,
                layoutRecentWorkouts,
                false
            )

            // Workout Name - use the title from backend or generate from date
            val workoutName = workout.title ?: "Workout on ${formatWorkoutDate(workout.workoutDate)}"
            val tvWorkoutName = itemView.findViewById<TextView>(R.id.tvWorkoutName)
            tvWorkoutName.text = workoutName

            // Date
            val tvDate = itemView.findViewById<TextView>(R.id.tvWorkoutDate)
            tvDate.text = formatWorkoutDate(workout.workoutDate)

            // Exercise count
            val count = workout.logs?.size ?: 0
            itemView.findViewById<TextView>(R.id.tvExerciseCount).text =
                "$count exercise${if (count != 1) "s" else ""}"

            // Exercise names preview
            val names = workout.logs
                ?.take(3)
                ?.joinToString(" · ") { it.exerciseName }
                ?: "No exercises"
            itemView.findViewById<TextView>(R.id.tvExerciseNames).text = names

            // Category badge
            val category = deriveCategoryFromLogs(workout.logs)
            val tvCategory = itemView.findViewById<TextView>(R.id.tvWorkoutCategory)
            tvCategory.text = category
            setCategoryBadge(tvCategory, category)

            // Edit button
            itemView.findViewById<Button>(R.id.btnEditWorkout).setOnClickListener {
                Toast.makeText(activity, "Edit coming soon", Toast.LENGTH_SHORT).show()
            }

            // Delete button
            itemView.findViewById<Button>(R.id.btnDeleteWorkout).setOnClickListener {
                Toast.makeText(activity, "Delete coming soon", Toast.LENGTH_SHORT).show()
            }

            layoutRecentWorkouts.addView(itemView)
        }
    }

    private fun showWorkoutsEmpty() {
        layoutEmptyWorkouts.visibility  = View.VISIBLE
        layoutRecentWorkouts.visibility = View.GONE
    }

    // ── LOAD GOALS ─────────────────────────────────────────
    private fun loadGoals() {
        progressGoals.visibility = View.VISIBLE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getGoalService(tokenManager)
                val response = service.getGoals()

                withContext(Dispatchers.Main) {
                    progressGoals.visibility = View.GONE

                    if (response.isSuccessful) {
                        val body = response.body()
                        val goals = body?.data ?: body?.items ?: emptyList()
                        tvActiveGoals.text = goals.size.toString()
                        showGoals(goals.take(3))
                    } else {
                        showGoalsEmpty()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressGoals.visibility = View.GONE
                    showGoalsEmpty()
                }
            }
        }
    }

    private fun showGoals(goals: List<GoalResponse>) {
        layoutGoalsList.removeAllViews()

        if (goals.isEmpty()) {
            showGoalsEmpty()
            return
        }

        layoutEmptyGoals.visibility = View.GONE
        layoutGoalsList.visibility  = View.VISIBLE

        val inflater = LayoutInflater.from(activity)

        goals.forEach { goal ->
            val itemView = inflater.inflate(
                R.layout.item_goal_row,
                layoutGoalsList,
                false
            )

            // Goal text
            itemView.findViewById<TextView>(R.id.tvGoalText).text =
                goal.goalText

            // Progress percentage
            val pct = if (goal.targetValue > 0)
                ((goal.currentValue / goal.targetValue) * 100).toInt()
            else 0

            // Status badge
            val status = computeGoalStatus(goal.currentValue, goal.targetValue)
            val tvStatus = itemView.findViewById<TextView>(R.id.tvGoalStatus)
            tvStatus.text = when (status) {
                GoalStatus.JUST_STARTED  -> "Just Started"
                GoalStatus.IN_PROGRESS   -> "In Progress"
                GoalStatus.ALMOST_THERE  -> "Almost There!"
                GoalStatus.DONE          -> "✓ Done"
            }

            // Progress bar width
            val progressView = itemView.findViewById<View>(R.id.viewGoalProgress)
            progressView.post {
                val parent = progressView.parent as? View
                val maxWidth = parent?.width ?: 0
                val newWidth = (maxWidth * pct / 100)
                val params = progressView.layoutParams
                params.width = newWidth
                progressView.layoutParams = params
            }

            // Values
            itemView.findViewById<TextView>(R.id.tvGoalCurrent).text =
                "${goal.currentValue.toInt()} current"
            itemView.findViewById<TextView>(R.id.tvGoalPct).text =
                "$pct%"
            itemView.findViewById<TextView>(R.id.tvGoalTarget).text =
                "${goal.targetValue.toInt()} target"

            layoutGoalsList.addView(itemView)
        }
    }

    private fun showGoalsEmpty() {
        layoutEmptyGoals.visibility = View.VISIBLE
        layoutGoalsList.visibility  = View.GONE
    }

    // ── HELPERS ────────────────────────────────────────────
    private fun formatWorkoutDate(dateStr: String?): String {
        if (dateStr == null) return "Unknown date"
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val outputFormat = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
            val date = inputFormat.parse(dateStr) ?: return dateStr
            outputFormat.format(date)
        } catch (e: Exception) {
            dateStr.take(10)
        }
    }

    private fun setCategoryBadge(tv: TextView, category: String) {
        when (category) {
            "Upper Body" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_blue)
                tv.setTextColor(resources.getColor(R.color.colorUpperBodyText))
            }
            "Lower Body" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_green)
                tv.setTextColor(resources.getColor(R.color.colorLowerBodyText))
            }
            "Core" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_purple)
                tv.setTextColor(resources.getColor(R.color.colorCoreText))
            }
            "Cardio" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_red)
                tv.setTextColor(resources.getColor(R.color.colorCardioText))
            }
            else -> {
                tv.setBackgroundResource(R.drawable.bg_badge_gray)
                tv.setTextColor(resources.getColor(R.color.colorGeneralText))
            }
        }
    }
}