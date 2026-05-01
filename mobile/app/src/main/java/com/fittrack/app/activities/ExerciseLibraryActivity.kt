package com.fittrack.app.activities

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import com.fittrack.app.R
import com.fittrack.app.models.ExerciseResponse
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExerciseLibraryActivity : Activity() {

    private lateinit var tokenManager: TokenManager

    private lateinit var btnBackLibrary: Button
    private lateinit var etSearchExercises: EditText
    private lateinit var layoutFilterPills: LinearLayout
    private lateinit var tvExerciseCountLibrary: TextView
    private lateinit var progressLibrary: ProgressBar
    private lateinit var layoutEmptyLibrary: LinearLayout
    private lateinit var scrollLibrary: ScrollView
    private lateinit var layoutExerciseLibraryList: LinearLayout

    private var allExercises: List<ExerciseResponse> = emptyList()
    private var activeCategory = "All"

    private val categories = listOf(
        "All", "Upper Body", "Lower Body", "Core", "Cardio"
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_exercise_library)

        tokenManager = TokenManager(this)

        btnBackLibrary            = findViewById(R.id.btnBackLibrary)
        etSearchExercises         = findViewById(R.id.etSearchExercises)
        layoutFilterPills         = findViewById(R.id.layoutFilterPills)
        tvExerciseCountLibrary    = findViewById(R.id.tvExerciseCountLibrary)
        progressLibrary           = findViewById(R.id.progressLibrary)
        layoutEmptyLibrary        = findViewById(R.id.layoutEmptyLibrary)
        scrollLibrary             = findViewById(R.id.scrollLibrary)
        layoutExerciseLibraryList = findViewById(R.id.layoutExerciseLibraryList)

        btnBackLibrary.setOnClickListener { finish() }

        buildFilterPills()

        etSearchExercises.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) { applyFilter() }
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, b: Int, c: Int) {}
        })

        loadExercises()
    }

    private fun buildFilterPills() {
        layoutFilterPills.removeAllViews()
        categories.forEach { cat ->
            val pill = Button(this)
            pill.text         = cat
            pill.textSize     = 12f
            pill.isAllCaps    = false
            pill.stateListAnimator = null
            val lp = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            lp.marginEnd = 8
            pill.layoutParams = lp
            setPillStyle(pill, cat == activeCategory)
            pill.setOnClickListener {
                activeCategory = cat
                buildFilterPills()
                applyFilter()
            }
            layoutFilterPills.addView(pill)
        }
    }

    private fun setPillStyle(pill: Button, active: Boolean) {
        if (active) {
            pill.setBackgroundResource(R.drawable.bg_button_primary)
            pill.setTextColor(getColor(R.color.colorWhite))
        } else {
            pill.setBackgroundResource(R.drawable.bg_button_secondary)
            pill.setTextColor(getColor(R.color.colorTextSecondary))
        }
    }

    private fun loadExercises() {
        progressLibrary.visibility = View.VISIBLE
        layoutEmptyLibrary.visibility = View.GONE
        scrollLibrary.visibility = View.GONE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service = RetrofitClient.getExerciseService(tokenManager)
                val response = service.getExercises()

                withContext(Dispatchers.Main) {
                    progressLibrary.visibility = View.GONE

                    if (response.isSuccessful) {
                        val body = response.body()
                        // Fixed: use "items" instead of "data"
                        allExercises = body?.items ?: emptyList()
                        applyFilter()
                    } else {
                        showEmpty()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressLibrary.visibility = View.GONE
                    showEmpty()
                }
            }
        }
    }

    private fun applyFilter() {
        val query = etSearchExercises.text.toString().trim()

        val filtered = allExercises.filter { ex ->
            val catMatch  = activeCategory == "All" ||
                    ex.muscleGroup == activeCategory
            val nameMatch = query.isEmpty() ||
                    ex.name.contains(query, ignoreCase = true)
            catMatch && nameMatch
        }

        tvExerciseCountLibrary.text =
            "Showing ${filtered.size} exercise${if (filtered.size != 1) "s" else ""}"

        showExercises(filtered)
    }

    private fun showExercises(exercises: List<ExerciseResponse>) {
        layoutExerciseLibraryList.removeAllViews()

        if (exercises.isEmpty()) {
            showEmpty()
            return
        }

        layoutEmptyLibrary.visibility = View.GONE
        scrollLibrary.visibility      = View.VISIBLE

        val inflater = LayoutInflater.from(this)

        exercises.forEach { exercise ->
            val card = inflater.inflate(
                R.layout.item_exercise_card,
                layoutExerciseLibraryList,
                false
            )

            // Initial letter avatar
            card.findViewById<TextView>(R.id.tvExerciseInitial).text =
                exercise.name.firstOrNull()?.uppercase() ?: "?"

            // Name
            card.findViewById<TextView>(R.id.tvExerciseCardName).text =
                exercise.name

            // Muscle group badge
            val tvGroup = card.findViewById<TextView>(R.id.tvExerciseCardGroup)
            tvGroup.text = exercise.muscleGroup
            setGroupBadge(tvGroup, exercise.muscleGroup)

            // Description
            card.findViewById<TextView>(R.id.tvExerciseCardDesc).text =
                exercise.description ?: "No description available"

            // Select button — returns result to CreateWorkoutActivity
            card.findViewById<Button>(R.id.btnSelectExercise)
                .setOnClickListener {
                    val result = Intent()
                    result.putExtra("EXERCISE_NAME",  exercise.name)
                    result.putExtra("EXERCISE_GROUP", exercise.muscleGroup)
                    setResult(RESULT_OK, result)
                    finish()
                }

            layoutExerciseLibraryList.addView(card)
        }
    }

    private fun setGroupBadge(tv: TextView, group: String) {
        when (group) {
            "Upper Body" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_blue)
                tv.setTextColor(getColor(R.color.colorUpperBodyText))
            }
            "Lower Body" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_green)
                tv.setTextColor(getColor(R.color.colorLowerBodyText))
            }
            "Core" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_purple)
                tv.setTextColor(getColor(R.color.colorCoreText))
            }
            "Cardio" -> {
                tv.setBackgroundResource(R.drawable.bg_badge_red)
                tv.setTextColor(getColor(R.color.colorCardioText))
            }
            else -> {
                tv.setBackgroundResource(R.drawable.bg_badge_gray)
                tv.setTextColor(getColor(R.color.colorGeneralText))
            }
        }
    }

    private fun showEmpty() {
        layoutEmptyLibrary.visibility = View.VISIBLE
        scrollLibrary.visibility      = View.GONE
    }
}