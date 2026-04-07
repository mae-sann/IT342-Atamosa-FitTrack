package com.fittrack.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

// ADD THESE LOMBOK IMPORTS
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "workouts")
@Builder  // ← BUILDER PATTERN
@NoArgsConstructor  // ← Required for JPA
@AllArgsConstructor // ← Required for Builder
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workout_date", nullable = false)
    private LocalDateTime workoutDate;

    @Column(name = "title", length = 150)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "workout")
    @OrderBy("workoutDate DESC, id DESC")
    @Builder.Default
    private List<WorkoutLog> logs = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (workoutDate == null) {
            workoutDate = now;
        }
        createdAt = now;
    }

    // Getters and setters (keep your existing ones)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getWorkoutDate() {
        return workoutDate;
    }

    public void setWorkoutDate(LocalDateTime workoutDate) {
        this.workoutDate = workoutDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<WorkoutLog> getLogs() {
        return logs;
    }

    public void setLogs(List<WorkoutLog> logs) {
        this.logs = logs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}