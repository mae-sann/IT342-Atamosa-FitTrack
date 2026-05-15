package com.fittrack.app.utils

import android.app.AlertDialog
import android.content.Context
import android.view.LayoutInflater
import android.widget.Button
import android.widget.TextView
import com.fittrack.app.R

object DialogHelper {

    // Reusable delete workout confirmation dialog
    // matching the web UI dark style
    fun showDeleteWorkoutDialog(
        context: Context,
        workoutDate: String,
        exerciseCount: Int,
        onConfirm: () -> Unit
    ) {
        val dialogView = LayoutInflater.from(context)
            .inflate(R.layout.dialog_delete_workout, null)

        // Fill in workout details
        dialogView.findViewById<TextView>(R.id.tvDeleteWorkoutDate).text =
            workoutDate
        dialogView.findViewById<TextView>(R.id.tvDeleteExerciseCount).text =
            "$exerciseCount exercise${if (exerciseCount != 1) "s" else ""}"

        val dialog = AlertDialog.Builder(context)
            .setView(dialogView)
            .setCancelable(true)
            .create()

        // Make dialog background transparent so our
        // custom dark card shows correctly
        dialog.window?.setBackgroundDrawableResource(
            android.R.color.transparent
        )

        // Button listeners
        dialogView.findViewById<Button>(R.id.btnCloseDelete)
            .setOnClickListener { dialog.dismiss() }

        dialogView.findViewById<Button>(R.id.btnCancelDelete)
            .setOnClickListener { dialog.dismiss() }

        dialogView.findViewById<Button>(R.id.btnConfirmDelete)
            .setOnClickListener {
                dialog.dismiss()
                onConfirm()
            }

        dialog.show()
    }

    // Delete goal confirmation — themed like other dialogs
    fun showDeleteGoalDialog(
        context: Context,
        onConfirm: () -> Unit
    ) {
        val dialogView = LayoutInflater.from(context)
            .inflate(R.layout.dialog_delete_goal, null)

        val dialog = AlertDialog.Builder(context)
            .setView(dialogView)
            .setCancelable(true)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        dialogView.findViewById<Button>(R.id.btnCancelDeleteGoal)
            .setOnClickListener { dialog.dismiss() }

        dialogView.findViewById<Button>(R.id.btnConfirmDeleteGoal)
            .setOnClickListener {
                dialog.dismiss()
                onConfirm()
            }

        dialog.show()
    }

    fun showLogoutDialog(
        context: Context,
        onConfirm: () -> Unit
    ) {
        val dialogView = LayoutInflater.from(context)
            .inflate(R.layout.dialog_logout, null)

        val dialog = AlertDialog.Builder(context)
            .setView(dialogView)
            .setCancelable(true)
            .create()

        dialog.window?.setBackgroundDrawableResource(android.R.color.transparent)

        dialogView.findViewById<Button>(R.id.btnCancelLogout)
            .setOnClickListener { dialog.dismiss() }

        dialogView.findViewById<Button>(R.id.btnConfirmLogout)
            .setOnClickListener {
                dialog.dismiss()
                onConfirm()
            }

        dialog.show()
    }
}