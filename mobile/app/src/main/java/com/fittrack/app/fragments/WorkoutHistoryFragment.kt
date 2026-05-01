package com.fittrack.app.fragments

import android.app.AlertDialog
import android.app.Fragment
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import com.fittrack.app.R
import com.fittrack.app.activities.CreateWorkoutActivity
import com.fittrack.app.models.WorkoutResponse
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

class WorkoutHistoryFragment : Fragment() {

    private lateinit var tokenManager: TokenManager

    private lateinit var tvWorkoutCount: TextView
    private lateinit var btnLogWorkout: Button
    private lateinit var etSearchWorkouts: EditText
    private lateinit var tvStatTotalWorkouts: TextView
    private lateinit var tvStatTotalExercises: TextView
    private lateinit var progressHistory: ProgressBar
    private lateinit var layoutEmptyHistory: LinearLayout
    private lateinit var scrollHistory: ScrollView
    private lateinit var layoutWorkoutList: LinearLayout

    private var allWorkouts: List<WorkoutResponse> = emptyList()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(
            R.layout.fragment_workout_history,
            container, false
        )
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        tokenManager = TokenManager(activity)

        tvWorkoutCount       = view.findViewById(R.id.tvWorkoutCount)
        btnLogWorkout        = view.findViewById(R.id.btnLogWorkout)
        etSearchWorkouts     = view.findViewById(R.id.etSearchWorkouts)
        tvStatTotalWorkouts  = view.findViewById(R.id.tvStatTotalWorkouts)
        tvStatTotalExercises = view.findViewById(R.id.tvStatTotalExercises)
        progressHistory      = view.findViewById(R.id.progressHistory)
        layoutEmptyHistory   = view.findViewById(R.id.layoutEmptyHistory)
        scrollHistory        = view.findViewById(R.id.scrollHistory)
        layoutWorkoutList    = view.findViewById(R.id.layoutWorkoutList)

        btnLogWorkout.setOnClickListener {
            startActivity(Intent(activity, CreateWorkoutActivity::class.java))
        }

        // Live search
        etSearchWorkouts.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                filterWorkouts(s.toString())
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })

        loadWorkouts()
    }

    override fun onResume() {
        super.onResume()
        loadWorkouts() // Refresh when coming back from CreateWorkout
    }

    private fun loadWorkouts() {
        progressHistory.visibility   = View.VISIBLE
        layoutEmptyHistory.visibility = View.GONE
        scrollHistory.visibility     = View.GONE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.getWorkouts()

                withContext(Dispatchers.Main) {
                    progressHistory.visibility = View.GONE

                    if (response.isSuccessful) {
                        val workouts = response.body()?.data ?: response.body()?.items ?: emptyList()
                        allWorkouts = workouts
                        updateStats(workouts)
                        showWorkouts(workouts)
                    } else {
                        showEmpty()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressHistory.visibility = View.GONE
                    showEmpty()
                    Toast.makeText(
                        activity,
                        "Failed to load workouts",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun updateStats(workouts: List<WorkoutResponse>) {
        tvStatTotalWorkouts.text  = workouts.size.toString()
        tvWorkoutCount.text       =
            "${workouts.size} session${if (workouts.size != 1) "s" else ""} logged"
        val totalEx = workouts.sumOf { it.logs?.size ?: 0 }
        tvStatTotalExercises.text = totalEx.toString()
    }

    private fun filterWorkouts(query: String) {
        if (query.isEmpty()) {
            showWorkouts(allWorkouts)
            return
        }
        val filtered = allWorkouts.filter { workout ->
            val dateMatch = workout.workoutDate?.contains(query, ignoreCase = true) == true
            val exerciseMatch = workout.logs?.any {
                it.exerciseName.contains(query, ignoreCase = true)
            } == true
            val categoryMatch = deriveCategoryFromLogs(workout.logs)
                .contains(query, ignoreCase = true)
            dateMatch || exerciseMatch || categoryMatch
        }
        showWorkouts(filtered)
    }

    private fun showWorkouts(workouts: List<WorkoutResponse>) {
        layoutWorkoutList.removeAllViews()

        if (workouts.isEmpty()) {
            showEmpty()
            return
        }

        layoutEmptyHistory.visibility = View.GONE
        scrollHistory.visibility      = View.VISIBLE

        val inflater = LayoutInflater.from(activity)

        // Show newest first
        workouts.sortedByDescending { it.workoutDate }.forEach { workout ->
            val itemView = inflater.inflate(
                R.layout.item_workout_row,
                layoutWorkoutList,
                false
            )

            // Date
            itemView.findViewById<TextView>(R.id.tvWorkoutDate).text =
                formatDate(workout.workoutDate)

            // Exercise count
            val count = workout.logs?.size ?: 0
            itemView.findViewById<TextView>(R.id.tvExerciseCount).text =
                "$count exercise${if (count != 1) "s" else ""}"

            // Exercise names
            val names = workout.logs
                ?.take(3)
                ?.joinToString(" · ") { it.exerciseName }
                ?: "No exercises recorded"
            itemView.findViewById<TextView>(R.id.tvExerciseNames).text = names

            // Category badge
            val category = deriveCategoryFromLogs(workout.logs)
            val tvCat = itemView.findViewById<TextView>(R.id.tvWorkoutCategory)
            tvCat.text = category
            setCategoryBadge(tvCat, category)

            // Edit button
            itemView.findViewById<Button>(R.id.btnEditWorkout)
                .setOnClickListener {
                    val intent = Intent(activity, CreateWorkoutActivity::class.java)
                    intent.putExtra("WORKOUT_ID", workout.id)
                    startActivity(intent)
                }

            // Delete button
            itemView.findViewById<Button>(R.id.btnDeleteWorkout)
                .setOnClickListener {
                    confirmDelete(workout.id, itemView)
                }

            layoutWorkoutList.addView(itemView)
        }
    }

    private fun confirmDelete(workoutId: Long, itemView: View) {
        AlertDialog.Builder(activity)
            .setTitle("Delete Workout")
            .setMessage("Are you sure you want to delete this workout?")
            .setPositiveButton("Delete") { _, _ ->
                deleteWorkout(workoutId, itemView)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun deleteWorkout(workoutId: Long, itemView: View) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.deleteWorkout(workoutId)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        layoutWorkoutList.removeView(itemView)
                        allWorkouts = allWorkouts.filter { it.id != workoutId }
                        updateStats(allWorkouts)
                        if (allWorkouts.isEmpty()) showEmpty()
                        Toast.makeText(
                            activity,
                            "Workout deleted",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        Toast.makeText(
                            activity,
                            "Failed to delete workout",
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

    private fun showEmpty() {
        layoutEmptyHistory.visibility = View.VISIBLE
        scrollHistory.visibility      = View.GONE
    }

    private fun formatDate(dateStr: String?): String {
        if (dateStr == null) return "Unknown"
        return try {
            val fmt  = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val out  = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
            val date = fmt.parse(dateStr.take(19)) ?: return dateStr
            val todayCal = java.util.Calendar.getInstance()
            val yesterday = java.util.Calendar.getInstance().also {
                it.add(java.util.Calendar.DAY_OF_YEAR, -1)
            }
            val df  = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
            when (dateStr.take(10)) {
                df.format(todayCal.time)   -> "Today"
                df.format(yesterday.time)  -> "Yesterday"
                else -> out.format(date)
            }
        } catch (e: Exception) { dateStr.take(10) }
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