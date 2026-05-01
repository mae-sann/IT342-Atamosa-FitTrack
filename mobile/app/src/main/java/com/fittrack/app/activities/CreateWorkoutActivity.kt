package com.fittrack.app.activities

import android.app.Activity
import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.fittrack.app.R
import com.fittrack.app.models.CreateWorkoutRequest
import com.fittrack.app.models.WorkoutExerciseItem
import com.fittrack.app.models.WorkoutLogRequest
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class CreateWorkoutActivity : Activity() {

    companion object {
        const val REQUEST_EXERCISE = 1001
    }

    private lateinit var tokenManager: TokenManager

    private lateinit var btnBack: Button
    private lateinit var btnSaveWorkout: Button
    private lateinit var btnPickDate: Button
    private lateinit var btnBrowseExercise: Button
    private lateinit var etWorkoutName: EditText
    private lateinit var tvSelectedExercise: TextView
    private lateinit var etSets: EditText
    private lateinit var etReps: EditText
    private lateinit var btnAddExercise: Button
    private lateinit var tvExerciseCount: TextView
    private lateinit var layoutExerciseEmpty: LinearLayout
    private lateinit var layoutExerciseList: LinearLayout

    private var selectedDate: String = ""
    private var selectedExerciseName: String = ""
    private var selectedMuscleGroup: String = ""
    private val exerciseItems = mutableListOf<WorkoutExerciseItem>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_workout)

        tokenManager = TokenManager(this)

        btnBack = findViewById(R.id.btnBack)
        btnSaveWorkout = findViewById(R.id.btnSaveWorkout)
        btnPickDate = findViewById(R.id.btnPickDate)
        btnBrowseExercise = findViewById(R.id.btnBrowseExercise)
        etWorkoutName = findViewById(R.id.etWorkoutName)
        tvSelectedExercise = findViewById(R.id.tvSelectedExercise)
        etSets = findViewById(R.id.etSets)
        etReps = findViewById(R.id.etReps)
        btnAddExercise = findViewById(R.id.btnAddExercise)
        tvExerciseCount = findViewById(R.id.tvExerciseCount)
        layoutExerciseEmpty = findViewById(R.id.layoutExerciseEmpty)
        layoutExerciseList = findViewById(R.id.layoutExerciseList)

        // Default to today
        val todayFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        selectedDate = todayFormat.format(Date())
        val displayFormat = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
        btnPickDate.text = displayFormat.format(Date())

        btnBack.setOnClickListener { finish() }

        btnPickDate.setOnClickListener { showDatePicker() }

        btnBrowseExercise.setOnClickListener {
            startActivityForResult(
                Intent(this, ExerciseLibraryActivity::class.java),
                REQUEST_EXERCISE
            )
        }

        btnAddExercise.setOnClickListener { addExercise() }

        btnSaveWorkout.setOnClickListener { saveWorkout() }
    }

    // Receive selected exercise from ExerciseLibraryActivity
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_EXERCISE && resultCode == RESULT_OK) {
            val name = data?.getStringExtra("EXERCISE_NAME") ?: return
            val group = data.getStringExtra("EXERCISE_GROUP") ?: ""
            selectedExerciseName = name
            selectedMuscleGroup = group
            tvSelectedExercise.text = name
            tvSelectedExercise.setTextColor(getColor(R.color.colorTextPrimary))
        }
    }

    private fun showDatePicker() {
        val cal = Calendar.getInstance()
        DatePickerDialog(
            this,
            { _, year, month, day ->
                val picked = Calendar.getInstance()
                picked.set(year, month, day)
                val apiFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val displayFormat = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
                selectedDate = apiFormat.format(picked.time)
                btnPickDate.text = displayFormat.format(picked.time)
            },
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH),
            cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun addExercise() {
        if (selectedExerciseName.isEmpty()) {
            Toast.makeText(this, "Please select an exercise first", Toast.LENGTH_SHORT).show()
            return
        }
        val sets = etSets.text.toString().toIntOrNull()
        val reps = etReps.text.toString().toIntOrNull()

        if (sets == null || sets <= 0) {
            Toast.makeText(this, "Please enter valid sets", Toast.LENGTH_SHORT).show()
            return
        }
        if (reps == null || reps <= 0) {
            Toast.makeText(this, "Please enter valid reps", Toast.LENGTH_SHORT).show()
            return
        }

        val item = WorkoutExerciseItem(
            exerciseName = selectedExerciseName,
            muscleGroup = selectedMuscleGroup,
            sets = sets,
            reps = reps
        )
        exerciseItems.add(item)

        // Reset fields
        selectedExerciseName = ""
        selectedMuscleGroup = ""
        tvSelectedExercise.text = "No exercise selected"
        tvSelectedExercise.setTextColor(getColor(R.color.colorTextMuted))
        etSets.text.clear()
        etReps.text.clear()

        refreshExerciseList()
    }

    private fun refreshExerciseList() {
        layoutExerciseList.removeAllViews()
        val count = exerciseItems.size
        tvExerciseCount.text = "$count exercise${if (count != 1) "s" else ""}"

        if (count == 0) {
            layoutExerciseEmpty.visibility = View.VISIBLE
            return
        }
        layoutExerciseEmpty.visibility = View.GONE

        val inflater = LayoutInflater.from(this)
        exerciseItems.forEachIndexed { index, item ->
            val row = inflater.inflate(
                R.layout.item_exercise_in_workout,
                layoutExerciseList,
                false
            )
            row.findViewById<TextView>(R.id.tvExerciseLetter).text =
                item.exerciseName.firstOrNull()?.uppercase() ?: "?"
            row.findViewById<TextView>(R.id.tvExerciseName).text = item.exerciseName
            row.findViewById<TextView>(R.id.tvSetsReps).text = "${item.sets} sets × ${item.reps} reps"
            row.findViewById<Button>(R.id.btnRemoveExercise).setOnClickListener {
                exerciseItems.removeAt(index)
                refreshExerciseList()
            }
            layoutExerciseList.addView(row)
        }
    }

    private fun saveWorkout() {
        // 🔍 ADD THIS DEBUG CODE FIRST
        val token = tokenManager.getToken()
        android.util.Log.d("CreateWorkout", "Token exists: ${token != null}")
        android.util.Log.d("CreateWorkout", "Token: ${token?.take(20)}...")

        if (token == null) {
            Toast.makeText(this, "Please login again", Toast.LENGTH_SHORT).show()
            return
        }
        // 🔍 END OF DEBUG CODE

        if (exerciseItems.isEmpty()) {
            Toast.makeText(this, "Add at least one exercise", Toast.LENGTH_SHORT).show()
            return
        }

        // Get workout name
        val workoutName = etWorkoutName.text.toString().trim()
        val finalWorkoutName = if (workoutName.isEmpty()) {
            val firstExercise = exerciseItems.firstOrNull()?.exerciseName?.take(15) ?: "Workout"
            val dateFormat = SimpleDateFormat("MMM d", Locale.getDefault())
            "$firstExercise - ${dateFormat.format(Date())}"
        } else {
            workoutName
        }

        btnSaveWorkout.isEnabled = false
        btnSaveWorkout.text = "Saving..."

        val formattedDate = "${selectedDate}T00:00:00"

        val request = CreateWorkoutRequest(
            workoutDate = formattedDate,
            workoutName = finalWorkoutName,
            logs = exerciseItems.map {
                WorkoutLogRequest(
                    exerciseName = it.exerciseName,
                    sets = it.sets,
                    reps = it.reps
                )
            }
        )

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.createWorkout(request)

                withContext(Dispatchers.Main) {
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text = "💾 Save"

                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Workout saved! 💪",
                            Toast.LENGTH_SHORT
                        ).show()
                        setResult(Activity.RESULT_OK)
                        finish()
                    } else {
                        val errorBody = response.errorBody()?.string()
                        android.util.Log.e("CreateWorkout", "Error: $errorBody")
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Failed to save workout: ${response.code()}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text = "💾 Save"
                    android.util.Log.e("CreateWorkout", "Exception: ${e.message}", e)
                    Toast.makeText(
                        this@CreateWorkoutActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
}