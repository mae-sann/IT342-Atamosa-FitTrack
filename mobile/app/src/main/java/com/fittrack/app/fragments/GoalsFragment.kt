package com.fittrack.app.fragments

import android.app.AlertDialog
import android.app.Fragment
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import com.fittrack.app.R
import com.fittrack.app.models.CreateGoalRequest
import com.fittrack.app.models.GoalResponse
import com.fittrack.app.models.GoalStatus
import com.fittrack.app.models.UpdateGoalRequest
import com.fittrack.app.models.computeGoalStatus
import com.fittrack.app.network.RetrofitClient
import com.fittrack.app.utils.TokenManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class GoalsFragment : Fragment() {

    private lateinit var tokenManager: TokenManager

    private lateinit var tvGoalsSubtitle: TextView
    private lateinit var btnAddGoal: Button
    private lateinit var progressGoals: ProgressBar
    private lateinit var layoutEmptyGoals: LinearLayout
    private lateinit var scrollGoals: ScrollView
    private lateinit var layoutGoalsList: LinearLayout

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_goals, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        tokenManager = TokenManager(activity)

        tvGoalsSubtitle  = view.findViewById(R.id.tvGoalsSubtitle)
        btnAddGoal       = view.findViewById(R.id.btnAddGoal)
        progressGoals    = view.findViewById(R.id.progressGoals)
        layoutEmptyGoals = view.findViewById(R.id.layoutEmptyGoals)
        scrollGoals      = view.findViewById(R.id.scrollGoals)
        layoutGoalsList  = view.findViewById(R.id.layoutGoalsList)

        btnAddGoal.setOnClickListener { showAddGoalDialog() }

        loadGoals()
    }

    private fun loadGoals() {
        progressGoals.visibility    = View.VISIBLE
        layoutEmptyGoals.visibility = View.GONE
        scrollGoals.visibility      = View.GONE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getGoalService(tokenManager)
                val response = service.getGoals()

                withContext(Dispatchers.Main) {
                    progressGoals.visibility = View.GONE

                    if (response.isSuccessful) {
                        val body = response.body()
                        val goals = body?.data ?: body?.items ?: emptyList()
                        tvGoalsSubtitle.text =
                            "${goals.size} goal${if (goals.size != 1) "s" else ""} set"
                        showGoals(goals)
                    } else {
                        showEmpty()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressGoals.visibility = View.GONE
                    showEmpty()
                }
            }
        }
    }

    private fun showGoals(goals: List<GoalResponse>) {
        layoutGoalsList.removeAllViews()

        if (goals.isEmpty()) {
            showEmpty()
            return
        }

        layoutEmptyGoals.visibility = View.GONE
        scrollGoals.visibility      = View.VISIBLE

        val inflater = LayoutInflater.from(activity)

        goals.forEach { goal ->
            val itemView = inflater.inflate(
                R.layout.item_goal_card,
                layoutGoalsList,
                false
            )

            // Goal text
            itemView.findViewById<TextView>(R.id.tvGoalText).text =
                goal.goalText

            // Percentage
            val pct = if (goal.targetValue > 0)
                ((goal.currentValue / goal.targetValue) * 100f).toInt().coerceAtMost(100)
            else 0

            // Status badge
            val status   = computeGoalStatus(goal.currentValue, goal.targetValue)
            val tvStatus = itemView.findViewById<TextView>(R.id.tvGoalStatus)
            setStatusBadge(tvStatus, status)

            // Progress bar
            val progressView = itemView.findViewById<View>(R.id.viewGoalProgress)
            setProgressBar(progressView, status, pct)

            // Values
            itemView.findViewById<TextView>(R.id.tvGoalCurrent).text =
                "${goal.currentValue.toInt()} current"
            itemView.findViewById<TextView>(R.id.tvGoalPct).text =
                "$pct%"
            itemView.findViewById<TextView>(R.id.tvGoalTarget).text =
                "${goal.targetValue.toInt()} target"

            // Update button
            itemView.findViewById<Button>(R.id.btnUpdateGoal)
                .setOnClickListener {
                    showUpdateDialog(goal)
                }

            // Delete button
            itemView.findViewById<Button>(R.id.btnDeleteGoal)
                .setOnClickListener {
                    confirmDeleteGoal(goal.id)
                }

            layoutGoalsList.addView(itemView)
        }
    }

    // ── ADD GOAL DIALOG ────────────────────────────────────
    private fun showAddGoalDialog() {
        val dialogView = LayoutInflater.from(activity)
            .inflate(R.layout.dialog_add_goal, null)

        val etGoalText    = dialogView.findViewById<EditText>(R.id.etGoalText)
        val etCurrentVal  = dialogView.findViewById<EditText>(R.id.etCurrentValue)
        val etTargetVal   = dialogView.findViewById<EditText>(R.id.etTargetValue)

        AlertDialog.Builder(activity)
            .setTitle("Add New Goal")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val text    = etGoalText.text.toString().trim()
                val current = etCurrentVal.text.toString().toFloatOrNull() ?: 0f
                val target  = etTargetVal.text.toString().toFloatOrNull()

                when {
                    text.isEmpty()   ->
                        Toast.makeText(activity, "Please enter a goal description", Toast.LENGTH_SHORT).show()
                    target == null || target <= 0 ->
                        Toast.makeText(activity, "Please enter a valid target value", Toast.LENGTH_SHORT).show()
                    else -> saveGoal(text, current, target)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun saveGoal(text: String, current: Float, target: Float) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getGoalService(tokenManager)
                val response = service.createGoal(
                    CreateGoalRequest(
                        goalText     = text,
                        currentValue = current,
                        targetValue  = target
                    )
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(activity, "Goal added!", Toast.LENGTH_SHORT).show()
                        layoutEmptyGoals.visibility = View.GONE
                        scrollGoals.visibility = View.VISIBLE
                        loadGoals()
                    } else {
                        Toast.makeText(activity, "Failed to add goal", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(activity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // ── UPDATE GOAL DIALOG ─────────────────────────────────
    private fun showUpdateDialog(goal: GoalResponse) {
        val dialogView = LayoutInflater.from(activity)
            .inflate(R.layout.dialog_update_goal, null)

        val tvGoalName   = dialogView.findViewById<TextView>(R.id.tvUpdateGoalName)
        val tvTarget     = dialogView.findViewById<TextView>(R.id.tvUpdateTarget)
        val etNewCurrent = dialogView.findViewById<EditText>(R.id.etNewCurrentValue)

        tvGoalName.text = goal.goalText
        tvTarget.text   = "Target: ${goal.targetValue.toInt()}"
        etNewCurrent.setText(goal.currentValue.toInt().toString())

        AlertDialog.Builder(activity)
            .setTitle("Update Progress")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val newVal = etNewCurrent.text.toString().toFloatOrNull()
                if (newVal == null) {
                    Toast.makeText(activity, "Enter a valid value", Toast.LENGTH_SHORT).show()
                } else {
                    updateGoal(goal.id, newVal)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun updateGoal(goalId: Long, newValue: Float) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getGoalService(tokenManager)
                val response = service.updateGoal(
                    goalId,
                    UpdateGoalRequest(currentValue = newValue)
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(activity, "Progress updated!", Toast.LENGTH_SHORT).show()
                        loadGoals()
                    } else {
                        Toast.makeText(activity, "Failed to update goal", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(activity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // ── DELETE GOAL ────────────────────────────────────────
    private fun confirmDeleteGoal(goalId: Long) {
        AlertDialog.Builder(activity)
            .setTitle("Delete Goal")
            .setMessage("Are you sure? This cannot be undone.")
            .setPositiveButton("Delete") { _, _ -> deleteGoal(goalId) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun deleteGoal(goalId: Long) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val service  = RetrofitClient.getGoalService(tokenManager)
                val response = service.deleteGoal(goalId)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        Toast.makeText(activity, "Goal deleted", Toast.LENGTH_SHORT).show()
                        loadGoals()
                    } else {
                        Toast.makeText(activity, "Failed to delete goal", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(activity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    // ── HELPERS ────────────────────────────────────────────
    private fun setStatusBadge(tv: TextView, status: GoalStatus) {
        when (status) {
            GoalStatus.JUST_STARTED -> {
                tv.text = "Just Started"
                tv.setBackgroundResource(R.drawable.bg_badge_gray)
                tv.setTextColor(resources.getColor(R.color.colorGeneralText))
            }
            GoalStatus.IN_PROGRESS -> {
                tv.text = "In Progress"
                tv.setBackgroundResource(R.drawable.bg_badge_blue)
                tv.setTextColor(resources.getColor(R.color.colorUpperBodyText))
            }
            GoalStatus.ALMOST_THERE -> {
                tv.text = "Almost There!"
                tv.setBackgroundResource(R.drawable.bg_badge_green)
                tv.setTextColor(resources.getColor(R.color.colorLowerBodyText))
            }
            GoalStatus.DONE -> {
                tv.text = "✓ Done"
                tv.setBackgroundResource(R.drawable.bg_badge_purple)
                tv.setTextColor(resources.getColor(R.color.colorCoreText))
            }
        }
    }

    private fun setProgressBar(view: View, status: GoalStatus, pct: Int) {
        val drawableRes = when (status) {
            GoalStatus.JUST_STARTED  -> R.drawable.bg_progress_fill_blue
            GoalStatus.IN_PROGRESS   -> R.drawable.bg_progress_fill_blue
            GoalStatus.ALMOST_THERE  -> R.drawable.bg_progress_fill_green
            GoalStatus.DONE          -> R.drawable.bg_progress_fill_purple
        }
        view.setBackgroundResource(drawableRes)

        view.post {
            val parent   = view.parent as? FrameLayout ?: return@post
            val maxWidth = parent.width
            val newWidth = (maxWidth * pct / 100)
            val params   = view.layoutParams
            params.width = newWidth
            view.layoutParams = params
        }
    }

    private fun showEmpty() {
        layoutEmptyGoals.visibility = View.VISIBLE
        scrollGoals.visibility      = View.GONE
    }
}