CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password TEXT,
    password_hash TEXT,
    role VARCHAR(20),
    role_id BIGINT REFERENCES roles(id),
    provider VARCHAR(20),
    provider_id VARCHAR(255),
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(500),
    muscle_group VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    notes VARCHAR(500),
    performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workouts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_logs (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    sets_completed INTEGER,
    reps_completed INTEGER,
    weight_kg NUMERIC(8,2),
    duration_minutes INTEGER,
    notes VARCHAR(500),
    logged_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workout_logs_workout
        FOREIGN KEY (workout_id)
        REFERENCES workouts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_workout_logs_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercises(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_id ON workout_logs(workout_id);
-- Backward-compatible fix for older schemas where workout_logs was created without exercise_id.
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS exercise_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_id ON workout_logs(exercise_id);