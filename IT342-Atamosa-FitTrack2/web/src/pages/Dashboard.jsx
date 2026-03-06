import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userResponse = await authService.getCurrentUser();
      setUser(userResponse.data);

      try {
        const workoutsResponse = await authService.getWorkouts();
        setWorkouts(workoutsResponse.data.items || []);
      } catch (err) {
        console.log('Could not fetch workouts');
      }
    } catch (err) {
      setError('Failed to load user data');
      // Redirect to login if unauthorized
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-container"><div className="loading">Loading...</div></div>;
  }

  if (!user) {
    return <div className="dashboard-container"><div className="error">User not found</div></div>;
  }

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : 'Good Afternoon';
  const emoji = new Date().getHours() < 12 ? '👋' : '😊';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">FITTRACK</div>
          <nav className="nav-menu">
            <a href="#" className="nav-item active">
              <span>📊</span> Dashboard
            </a>
            <a href="#" className="nav-item">
              <span>📋</span> Workouts
            </a>
            <a href="#" className="nav-item">
              <span>🏋️</span> Exercises
            </a>
            <a href="#" className="nav-item">
              <span>🎯</span> Goals
            </a>
          </nav>
        </div>
        <div className="header-right">
          <button className="btn-new-workout">+ New Workout</button>
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-greeting">
            <h1>{greeting}, {user.name.split(' ')[0]} {emoji}</h1>
            <p>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} — Keep pushing!
            </p>
          </div>
          <button className="btn-log-workout">+ Log Workout</button>
        </section>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card stat-workouts">
            <div className="stat-icon">💪</div>
            <div className="stat-number">24</div>
            <div className="stat-label">Total Workouts</div>
            <div className="stat-trend">↑ 3 this week</div>
          </div>

          <div className="stat-card stat-streak">
            <div className="stat-icon">🔥</div>
            <div className="stat-number">7</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-trend">Personal best!</div>
          </div>

          <div className="stat-card stat-goals">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">3</div>
            <div className="stat-label">Active Goals</div>
            <div className="stat-trend">1 near completion</div>
          </div>

          <div className="stat-card stat-exercises">
            <div className="stat-icon">⏱️</div>
            <div className="stat-number">48</div>
            <div className="stat-label">Exercises Logged</div>
            <div className="stat-trend">↑ 12 this week</div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="workouts-section">
          <div className="section-header">
            <h2>
              <span className="accent-dot"></span> Recent Workouts
            </h2>
            <a href="#" className="view-all">View All →</a>
          </div>

          {workouts.length > 0 ? (
            <div className="workouts-grid">
              {workouts.map((workout, index) => (
                <div key={index} className="workout-card">
                  <div className="workout-date">📅 {new Date().toLocaleDateString()}</div>
                  <h3>{workout.name}</h3>
                  <div className="workout-tags">
                    <span className="tag">{workout.category}</span>
                  </div>
                  <div className="workout-stats">
                    <div><strong>5</strong> <span>Exercises</span></div>
                    <div><strong>18</strong> <span>Total Sets</span></div>
                  </div>
                  <div className="workout-actions">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-workouts">
              <p>No workouts logged yet. Start your fitness journey today!</p>
              <button className="btn-primary">+ Log First Workout</button>
            </div>
          )}
        </section>

        {/* Active Goals */}
        <section className="goals-section">
          <div className="section-header">
            <h2>
              <span className="accent-dot"></span> Active Goals
            </h2>
            <a href="#" className="view-all">Manage Goals →</a>
          </div>

          <div className="goals-grid">
            <div className="goal-card">
              <h3>Bench Press 80 kg</h3>
              <p className="goal-target">Target: Mar 31, 2026</p>
              <span className="goal-status">In Progress</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <div className="progress-info">
                <span>60 kg current</span>
                <span>80 kg target</span>
              </div>
            </div>

            <div className="goal-card">
              <h3>Run 5 km</h3>
              <p className="goal-target">Target: Apr 15, 2026</p>
              <span className="goal-status">In Progress</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
              <div className="progress-info">
                <span>3 km current</span>
                <span>5 km target</span>
              </div>
            </div>

            <div className="goal-card">
              <h3>20 Workouts / Month</h3>
              <p className="goal-target">Target: Feb 28, 2026</p>
              <span className="goal-status">Near Done!</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '95%' }}></div>
              </div>
              <div className="progress-info">
                <span>18 week workouts</span>
                <span>20 target</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Logout Button */}
      <div className="dashboard-footer">
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}
