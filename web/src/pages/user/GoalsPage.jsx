import { useEffect, useState } from 'react';
<<<<<<< Updated upstream:web/src/pages/user/GoalsPage.jsx
import api from '../../services/api';
import { authService } from '../../services/authService';
import '../../styles/goals.css';
=======
import api from '../../shared/services/api';
import { authService } from '../../shared/services/authService';
import ConfirmGoalDeleteModal from './ConfirmGoalDeleteModal';
import '../../shared/styles/goals.css';
>>>>>>> Stashed changes:web/src/features/goal/GoalsPage.jsx

function getStatusBadge(percentage) {
  if (percentage >= 100) {
    return {
      label: 'Done',
      badgeStyle: { backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd' },
      progressStyle: { backgroundColor: '#a855f7' },
    };
  }
  if (percentage >= 90) {
    return {
      label: 'Almost There!',
      badgeStyle: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7' },
      progressStyle: { backgroundColor: '#10b981' },
    };
  }
  if (percentage >= 50) {
    return {
      label: 'In Progress',
      badgeStyle: { backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#93c5fd' },
      progressStyle: { backgroundColor: '#3b82f6' },
    };
  }
  return {
    label: 'Just Started',
    badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#9ca3af' },
    progressStyle: { backgroundColor: '#6b7280' },
  };
}

function getGoalPercentage(goal) {
  const target = Number(goal?.target_value || 0);
  const current = Number(goal?.current_value || 0);
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export default function GoalsPage() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newCurrentValue, setNewCurrentValue] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedGoalToDelete, setSelectedGoalToDelete] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadGoals();
  }, []);

  async function loadCurrentUser() {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load current user:', error);
    }
  }

  async function loadGoals() {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/goals');
      setGoals(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      console.error('Failed to load goals:', error);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setGoalText('');
    setCurrentValue('');
    setTargetValue('');
    setAddModalOpen(true);
  }

  function closeAdd() {
    setAddModalOpen(false);
    setGoalText('');
    setCurrentValue('');
    setTargetValue('');
  }

  async function saveGoal() {
    const text = goalText.trim();
    const current = Number(currentValue) || 0;
    const target = Number(targetValue);

    if (!text) {
      window.alert('Please enter a goal description.');
      return;
    }

    if (!target || target <= 0) {
      window.alert('Please enter a valid target value.');
      return;
    }

    try {
      setSavingGoal(true);
      await api.post('/api/v1/goals', {
        goal_text: text,
        current_value: current,
        target_value: target,
      });
      closeAdd();
      await loadGoals();
    } catch (error) {
      console.error('Failed to create goal:', error);
      window.alert('Failed to create goal.');
    } finally {
      setSavingGoal(false);
    }
  }

  function openUpdate(goal) {
    setSelectedGoal(goal);
    setNewCurrentValue(String(goal?.current_value ?? 0));
    setUpdateModalOpen(true);
  }

  function closeUpdate() {
    setUpdateModalOpen(false);
    setSelectedGoal(null);
    setNewCurrentValue('');
  }

  async function saveUpdate() {
    if (!selectedGoal) return;

    try {
      setSavingUpdate(true);
      await api.put(`/api/v1/goals/${selectedGoal.id}`, {
        current_value: Number(newCurrentValue) || 0,
      });
      closeUpdate();
      await loadGoals();
    } catch (error) {
      console.error('Failed to update goal:', error);
      window.alert('Failed to update goal.');
    } finally {
      setSavingUpdate(false);
    }
  }

  async function deleteGoal(goal) {
    try {
      await api.delete(`/api/v1/goals/${goal.id}`);
      setDeleteModalOpen(false);
      setSelectedGoalToDelete(null);
      await loadGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      window.alert('Failed to delete goal.');
    }
  }

  function openDelete(goal) {
    setSelectedGoalToDelete(goal);
    setDeleteModalOpen(true);
  }

  function closeDelete() {
    setDeleteModalOpen(false);
    setSelectedGoalToDelete(null);
  }

  const updatePercentage = selectedGoal ? getGoalPercentage({
    target_value: selectedGoal.target_value,
    current_value: newCurrentValue,
  }) : 0;
  const updateStatus = getStatusBadge(updatePercentage);

  return (
    <div className="goals-page">

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 bg-[#0A0F1E]/80 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Fitness Goals</h1>
            <p className="text-sm text-gray-500">Track your progress toward your targets</p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add Goal
          </button>
        </div>

        <div className="p-8">
          {!loading && goals.length === 0 && (
            <div id="emptyState" className="text-center py-20">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-bold text-white mb-2">No goals yet</h3>
              <p className="text-gray-400 text-sm mb-6">Set your first fitness goal to start tracking your progress.</p>
              <button
                type="button"
                onClick={openAdd}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition"
              >
                + Add Your First Goal
              </button>
            </div>
          )}

          {!loading && goals.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" id="goalsGrid">
              {goals.map((goal) => {
                const percentage = getGoalPercentage(goal);
                const status = getStatusBadge(percentage);
                const isCompleted = percentage >= 100;

                return (
                  <div key={goal.id} className={`goal-card ${isCompleted ? 'opacity-75' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-bold text-white text-base leading-snug">{goal.goal_text}</h3>
                      <span className="badge flex-shrink-0" style={status.badgeStyle}>{status.label}</span>
                    </div>

                    <div className="progress-track mb-2">
                      <div className="progress-fill" style={{ width: `${percentage}%`, ...status.progressStyle }} />
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mb-5">
                      <span>{goal.current_value} current</span>
                      <span className="font-semibold text-white">{percentage}%</span>
                      <span>{goal.target_value} target</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openUpdate(goal)}
                        disabled={isCompleted}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition disabled:bg-white/3 disabled:text-gray-600 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {isCompleted ? 'Done' : 'Update Progress'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openDelete(goal)}
                        className="p-2 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="add-card" onClick={openAdd} role="button" tabIndex={0}>
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm font-semibold">Add New Goal</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {addModalOpen && (
        <div
          className="modal-overlay open"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeAdd();
            }
          }}
        >
          <div className="modal-box">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-white leading-tight">Add New Goal</h2>
              <button type="button" onClick={closeAdd} className="modal-close" aria-label="Close add goal modal">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">What is your goal?</label>
                <input
                  type="text"
                  value={goalText}
                  onChange={(event) => setGoalText(event.target.value)}
                  placeholder="e.g., Bench Press 80 kg, Run 5 km..."
                  className="input-field"
                />
            
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 mt-4">Starting Value</label>
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(event) => setCurrentValue(event.target.value)}
                    placeholder="0"
                    min="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 mt-4">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(event) => setTargetValue(event.target.value)}
                    placeholder="100"
                    min="1"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-3 text-xs text-blue-300 leading-relaxed mt-4">
                💡 Use the same unit in your goal name and values.
                <br />
                Example: "Run 5 km" → Starting: 3, Target: 5
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={closeAdd} className="btn-ghost flex-1">
                Cancel
              </button>
              <button type="button" onClick={saveGoal} disabled={savingGoal} className="btn-primary flex-1">
                {savingGoal ? 'Saving...' : 'Save Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {updateModalOpen && selectedGoal && (
        <div
          className="modal-overlay open"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeUpdate();
            }
          }}
        >
          <div className="modal-box">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-lg font-bold text-white leading-tight">Update Progress</h2>
              <button type="button" onClick={closeUpdate} className="modal-close" aria-label="Close update progress modal">
                ×
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-6" id="updateGoalName">
              {selectedGoal.goal_text}
            </p>

            <div className="bg-white/4 border border-white/8 rounded-xl p-4 mb-5">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{newCurrentValue || 0} current</span>
                <span className="text-white font-bold">{updatePercentage}%</span>
                <span>{selectedGoal.target_value} target</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${updatePercentage}%`, ...updateStatus.progressStyle }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">New Current Value</label>
              <input
                type="number"
                value={newCurrentValue}
                onChange={(event) => setNewCurrentValue(event.target.value)}
                min="0"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-2">
                Target: <span className="text-gray-300 font-semibold">{selectedGoal.target_value}</span>
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={closeUpdate} className="btn-ghost flex-1">
                Cancel
              </button>
              <button type="button" onClick={saveUpdate} disabled={savingUpdate} className="btn-primary flex-1">
                {savingUpdate ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmGoalDeleteModal
        isOpen={deleteModalOpen}
        goal={selectedGoalToDelete}
        onClose={closeDelete}
        onConfirm={() => {
          if (selectedGoalToDelete) {
            deleteGoal(selectedGoalToDelete);
          }
        }}
      />

    </div>
  );
}
