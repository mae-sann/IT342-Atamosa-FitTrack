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
    user_id BIGINT NOT NULL,
    workout_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workouts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workout_logs (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL,
    exercise_name VARCHAR(150) NOT NULL,
    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    workout_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_workout_logs_workout
        FOREIGN KEY (workout_id)
        REFERENCES workouts(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    goal_text VARCHAR(255),
    target_value NUMERIC(10,2),
    current_value NUMERIC(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Backward-compatible columns still used by current auth/business logic.
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS title VARCHAR(150);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS notes VARCHAR(500);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS performed_at TIMESTAMP;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS exercise_id BIGINT;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS sets_completed INTEGER;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS reps_completed INTEGER;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8,2);
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS notes VARCHAR(500);
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS logged_at TIMESTAMP;
ALTER TABLE workout_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE goals ADD COLUMN IF NOT EXISTS title VARCHAR(150);
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Keep legacy columns nullable so SDD inserts do not violate constraints.
ALTER TABLE workouts ALTER COLUMN title DROP NOT NULL;
ALTER TABLE workout_logs ALTER COLUMN exercise_id DROP NOT NULL;

-- Keep legacy values synchronized when possible.
UPDATE workouts
SET performed_at = COALESCE(performed_at, workout_date),
    updated_at = COALESCE(updated_at, created_at),
    title = COALESCE(title, 'Workout Session');

UPDATE workout_logs
SET logged_at = COALESCE(logged_at, workout_date),
    updated_at = COALESCE(updated_at, created_at),
    sets_completed = COALESCE(sets_completed, sets),
    reps_completed = COALESCE(reps_completed, reps);

-- Avoid procedural DO blocks here because Spring SQL init may split statements by ';'.
-- Keep legacy `exercise_id` nullable/indexed without enforcing FK at startup.
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS fk_workout_logs_exercise;

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_workout_id ON workout_logs(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_id ON workout_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_name ON workout_logs(exercise_name);