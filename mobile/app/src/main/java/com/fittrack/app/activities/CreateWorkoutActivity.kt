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
    private lateinit var etWorkoutName: EditText
    private lateinit var btnPickDate: Button
    private lateinit var btnBrowseExercise: Button
    private lateinit var tvSelectedExercise: TextView
    private lateinit var etSets: EditText
    private lateinit var etReps: EditText
    private lateinit var btnAddExercise: Button
    private lateinit var tvExerciseCount: TextView
    private lateinit var layoutExerciseEmpty: LinearLayout
    private lateinit var layoutExerciseList: LinearLayout

    private var selectedDate: String = ""
    private var selectedExerciseName: String = ""
    private val exerciseItems = mutableListOf<WorkoutExerciseItem>()

    // Edit mode — set when WORKOUT_ID is passed via intent
    private var editWorkoutId: Long = -1L
    private var isEditMode = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_workout)

        tokenManager = TokenManager(this)

        // Check if launched in edit mode
        editWorkoutId = intent.getLongExtra("WORKOUT_ID", -1L)
        isEditMode    = editWorkoutId != -1L

        btnBack             = findViewById(R.id.btnBack)
        btnSaveWorkout      = findViewById(R.id.btnSaveWorkout)
        etWorkoutName       = findViewById(R.id.etWorkoutName)
        btnPickDate         = findViewById(R.id.btnPickDate)
        btnBrowseExercise   = findViewById(R.id.btnBrowseExercise)
        tvSelectedExercise  = findViewById(R.id.tvSelectedExercise)
        etSets              = findViewById(R.id.etSets)
        etReps              = findViewById(R.id.etReps)
        btnAddExercise      = findViewById(R.id.btnAddExercise)
        tvExerciseCount     = findViewById(R.id.tvExerciseCount)
        layoutExerciseEmpty = findViewById(R.id.layoutExerciseEmpty)
        layoutExerciseList  = findViewById(R.id.layoutExerciseList)

        // Default date to today
        val todayFormat   = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val displayFormat = SimpleDateFormat("MMM d, yyyy", Locale.getDefault())
        selectedDate      = todayFormat.format(Date())
        btnPickDate.text  = displayFormat.format(Date())

        // Update title and save button for edit mode
        if (isEditMode) {
            btnSaveWorkout.text = "💾 Update"
            loadExistingWorkout(editWorkoutId)
        }

        btnBack.setOnClickListener { finish() }

        btnPickDate.setOnClickListener { showDatePicker() }

        btnBrowseExercise.setOnClickListener {
            startActivityForResult(
                Intent(this, ExerciseLibraryActivity::class.java),
                REQUEST_EXERCISE
            )
        }

        btnAddExercise.setOnClickListener { addExercise() }

        btnSaveWorkout.setOnClickListener {
            if (isEditMode) updateWorkout()
            else saveWorkout()
        }
    }

    // ── LOAD EXISTING WORKOUT FOR EDIT ─────────────────────
    private fun loadExistingWorkout(workoutId: Long) {
        btnSaveWorkout.isEnabled = false
        btnSaveWorkout.text      = "Loading..."

        CoroutineScope(Dispatchers.IO).launch {
            try {
                android.util.Log.d("CreateWorkout", "Loading workout ID: $workoutId")
                val service  = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.getWorkoutById(workoutId)
                android.util.Log.d("CreateWorkout", "API response code: ${response.code()}")

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val workout = response.body()?.data ?: response.body()?.item

                        if (workout != null) {
                            if (!workout.title.isNullOrBlank() && workout.title != "Workout Session") {
                                etWorkoutName.setText(workout.title)
                            }

                            // Set date
                            val dateStr = workout.workoutDate ?: ""
                            selectedDate    = dateStr.take(10)

                            // Format for display
                            try {
                                val inFmt  = SimpleDateFormat(
                                    "yyyy-MM-dd", Locale.getDefault()
                                )
                                val outFmt = SimpleDateFormat(
                                    "MMM d, yyyy", Locale.getDefault()
                                )
                                val parsed = inFmt.parse(selectedDate)
                                btnPickDate.text =
                                    if (parsed != null) outFmt.format(parsed)
                                    else selectedDate
                            } catch (e: Exception) {
                                btnPickDate.text = selectedDate
                            }

                            // Pre-fill exercises from logs
                            exerciseItems.clear()
                            workout.logs?.forEach { log ->
                                exerciseItems.add(
                                    WorkoutExerciseItem(
                                        exerciseName = log.exerciseName ?: "Exercise",
                                        muscleGroup  = log.muscleGroup ?: "",
                                        sets         = log.sets,
                                        reps         = log.reps
                                    )
                                )
                            }
                            refreshExerciseList()
                        }

                        btnSaveWorkout.isEnabled = true
                        btnSaveWorkout.text      = "💾 Update"

                    } else {
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Failed to load workout",
                            Toast.LENGTH_SHORT
                        ).show()
                        btnSaveWorkout.isEnabled = true
                        btnSaveWorkout.text      = "💾 Update"
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@CreateWorkoutActivity,
                        "Error loading workout: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text      = "💾 Update"
                }
            }
        }
    }

    // Receive selected exercise from ExerciseLibraryActivity
    override fun onActivityResult(
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_EXERCISE && resultCode == RESULT_OK) {
            val name  = data?.getStringExtra("EXERCISE_NAME")  ?: return
            val group = data.getStringExtra("EXERCISE_GROUP")  ?: ""
            selectedExerciseName         = name
            tvSelectedExercise.text      = name
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
                val apiFormat     = SimpleDateFormat(
                    "yyyy-MM-dd", Locale.getDefault()
                )
                val displayFormat = SimpleDateFormat(
                    "MMM d, yyyy", Locale.getDefault()
                )
                selectedDate     = apiFormat.format(picked.time)
                btnPickDate.text = displayFormat.format(picked.time)
            },
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH),
            cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun addExercise() {
        if (selectedExerciseName.isEmpty()) {
            Toast.makeText(
                this, "Please select an exercise first",
                Toast.LENGTH_SHORT
            ).show()
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

        exerciseItems.add(
            WorkoutExerciseItem(
                exerciseName = selectedExerciseName,
                muscleGroup  = "",
                sets         = sets,
                reps         = reps
            )
        )

        // Reset input fields
        selectedExerciseName = ""
        tvSelectedExercise.text = "No exercise selected"
        tvSelectedExercise.setTextColor(getColor(R.color.colorTextMuted))
        etSets.text.clear()
        etReps.text.clear()

        refreshExerciseList()
    }

    private fun refreshExerciseList() {
        layoutExerciseList.removeAllViews()
        val count = exerciseItems.size
        tvExerciseCount.text =
            "$count exercise${if (count != 1) "s" else ""}"

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
            row.findViewById<TextView>(R.id.tvExerciseName).text =
                item.exerciseName
            row.findViewById<TextView>(R.id.tvSetsReps).text =
                "${item.sets} sets × ${item.reps} reps"
            row.findViewById<Button>(R.id.btnRemoveExercise)
                .setOnClickListener {
                    exerciseItems.removeAt(index)
                    refreshExerciseList()
                }
            layoutExerciseList.addView(row)
        }
    }

    // ── CREATE NEW WORKOUT ──────────────────────────────────
    private fun saveWorkout() {
        if (exerciseItems.isEmpty()) {
            Toast.makeText(
                this, "Add at least one exercise",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        btnSaveWorkout.isEnabled = false
        btnSaveWorkout.text      = "Saving..."

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.createWorkout(buildRequest())

                withContext(Dispatchers.Main) {
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text      = "💾 Save"

                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Workout saved! 💪",
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                    } else {
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Failed to save workout",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text      = "💾 Save"
                    Toast.makeText(
                        this@CreateWorkoutActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    // ── UPDATE EXISTING WORKOUT ─────────────────────────────
    private fun updateWorkout() {
        if (exerciseItems.isEmpty()) {
            Toast.makeText(
                this, "Add at least one exercise",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        btnSaveWorkout.isEnabled = false
        btnSaveWorkout.text      = "Updating..."

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getWorkoutService(tokenManager)
                val response = service.updateWorkout(
                    editWorkoutId,
                    buildRequest()
                )

                withContext(Dispatchers.Main) {
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text      = "💾 Update"

                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Workout updated! ✅",
                            Toast.LENGTH_SHORT
                        ).show()
                        finish()
                    } else {
                        Toast.makeText(
                            this@CreateWorkoutActivity,
                            "Failed to update workout",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    btnSaveWorkout.isEnabled = true
                    btnSaveWorkout.text      = "💾 Update"
                    Toast.makeText(
                        this@CreateWorkoutActivity,
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    // ── BUILD REQUEST OBJECT ────────────────────────────────
    private fun buildRequest() = CreateWorkoutRequest(
        workoutDate = selectedDate,
        workoutName = etWorkoutName.text.toString().trim().ifBlank { null },
        logs        = exerciseItems.map {
            WorkoutLogRequest(
                exerciseName = it.exerciseName,
                sets         = it.sets,
                reps         = it.reps
            )
        }
    )
}