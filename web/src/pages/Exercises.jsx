import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient, { authService } from '../services/authService';
import '../styles/dashboard.css';
import '../styles/exercises.css';

//For Phase 3 Web Development
const CATEGORY_STYLES = {
	upper: {
		label: 'Upper Body',
		iconBg: 'bg-blue-600/20',
		iconText: 'text-blue-300',
		badge: 'bg-blue-600/20 text-blue-300',
	},
	lower: {
		label: 'Lower Body',
		iconBg: 'bg-emerald-600/20',
		iconText: 'text-emerald-300',
		badge: 'bg-emerald-600/20 text-emerald-300',
	},
	core: {
		label: 'Core',
		iconBg: 'bg-purple-600/20',
		iconText: 'text-purple-300',
		badge: 'bg-purple-600/20 text-purple-300',
	},
	cardio: {
		label: 'Cardio',
		iconBg: 'bg-red-600/20',
		iconText: 'text-red-300',
		badge: 'bg-red-600/20 text-red-300',
	},
	general: {
		label: 'General',
		iconBg: 'bg-slate-600/20',
		iconText: 'text-slate-300',
		badge: 'bg-slate-600/20 text-slate-300',
	},
};

const FILTERS = [
	{ key: 'all', label: 'All' },
	{ key: 'upper', label: 'Upper Body' },
	{ key: 'lower', label: 'Lower Body' },
	{ key: 'core', label: 'Core' },
	{ key: 'cardio', label: 'Cardio' },
];

const normalizeCategory = (category) => {
	if (!category) return 'general';
	const normalized = category.trim().toLowerCase();

	if (normalized.includes('upper')) return 'upper';
	if (normalized.includes('lower') || normalized.includes('leg')) return 'lower';
	if (normalized.includes('core') || normalized.includes('abs')) return 'core';
	if (normalized.includes('cardio')) return 'cardio';

	return 'general';
};

const getInitial = (exerciseName) => {
	if (!exerciseName || !exerciseName.trim()) return 'E';
	return exerciseName.trim().charAt(0).toUpperCase();
};

export default function Exercises() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [exercises, setExercises] = useState([]);
	const [activeCategory, setActiveCategory] = useState('All');
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [toastMessage, setToastMessage] = useState('');
	const [toastVisible, setToastVisible] = useState(false);

	const loadPageData = async () => {
		try {
			setLoading(true);
			setError('');

			const [userResponse, exercisesResponse] = await Promise.all([
				authService.getCurrentUser(),
				apiClient.get('/api/exercises'),
			]);

			setUser(userResponse.data);

			const payload = exercisesResponse.data;
			const exerciseItems = Array.isArray(payload)
				? payload
				: Array.isArray(payload?.items)
					? payload.items
					: Array.isArray(payload?.content)
						? payload.content
						: [];

			setExercises(exerciseItems);
		} catch (requestError) {
			setError('Failed to load exercise library. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPageData();
	}, []);

	useEffect(() => {
		if (!toastVisible) return undefined;

		const timer = setTimeout(() => {
			setToastVisible(false);
		}, 2500);

		return () => clearTimeout(timer);
	}, [toastVisible]);

	const fullName = useMemo(() => {
		if (!user) return 'Athlete';
		return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Athlete';
	}, [user]);

	const userInitials = useMemo(() => {
		return fullName
			.split(' ')
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join('');
	}, [fullName]);

	const filteredExercises = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		const selectedCategoryKey = normalizeCategory(activeCategory);

		return exercises.filter((exercise) => {
			const exerciseName = (exercise.name || '').toLowerCase();
			const categoryKey = normalizeCategory(exercise.muscle_group);
			const categoryMatch = selectedCategoryKey === 'general' || categoryKey === selectedCategoryKey;
			const nameMatch = !normalizedQuery || exerciseName.includes(normalizedQuery);

			return categoryMatch && nameMatch;
		});
	}, [activeCategory, exercises, searchQuery]);

	const handleLogout = async () => {
		await authService.logout();
		navigate('/login');
	};

	const handleAddToWorkout = (exercise) => {
		authService.addExerciseSelection({
			id: exercise.id,
			name: exercise.name,
			muscle_group: exercise.muscle_group,
			description: exercise.description,
		});

		setToastMessage(`✓ "${exercise.name}" added to workout!`);
		setToastVisible(true);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">
				<div className="text-sm text-gray-400">Loading exercise library...</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen bg-[#0A0F1E] text-white">
			<aside className="sidebar flex flex-col">
				<div className="p-6 border-b border-white/5">
					<Link to="/dashboard" className="flex items-center gap-2">
						<div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
							<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<span className="bebas text-2xl tracking-wider text-white">FitTrack</span>
					</Link>
				</div>

				<div className="px-4 py-4 border-b border-white/5">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{userInitials}</div>
						<div>
							<div className="text-sm font-semibold">{fullName}</div>
							<div className="text-xs text-gray-500">{user?.email || 'user@example.com'}</div>
						</div>
					</div>
				</div>

				<nav className="flex-1 p-4 space-y-1">
					<p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">Main</p>
					<Link to="/dashboard" className="nav-item">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
						Dashboard
					</Link>
					<Link to="/exercises" className="nav-item active">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
						</svg>
						Exercise Library
					</Link>
					{user?.role === 'ADMIN' && (
						<Link to="/admin" className="nav-item">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4zM7 10V7a5 5 0 0110 0v3" />
							</svg>
							Admin Dashboard
						</Link>
					)}
					<Link to="/create-workout" className="nav-item">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
						</svg>
						Create Workout
					</Link>
					<Link to="/workout-history" className="nav-item">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Workout History
					</Link>
					<Link to="/goals" className="nav-item">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Goals
					</Link>

					<p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2 mt-4">Account</p>
					<Link to="/profile" className="nav-item">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
						Profile
					</Link>
				</nav>

				<div className="p-4 border-t border-white/5">
					<button onClick={handleLogout} className="nav-item text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-left">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
						Logout
					</button>
				</div>
			</aside>

			<main className="flex-1 overflow-y-auto">
				<div className="sticky top-0 z-20 bg-[#0A0F1E]/80 backdrop-blur border-b border-white/5 px-8 py-4 flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-white">Exercise Library</h1>
						<p className="text-sm text-gray-500">Browse and add exercises to your workout</p>
					</div>
					<Link to="/create-workout" className="dashboard-primary-button text-white text-sm font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
						</svg>
						Create Workout
					</Link>
				</div>

				<div className="p-8">
					{error && (
						<div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center justify-between gap-4">
							<span>{error}</span>
							<button onClick={loadPageData} className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1.5 rounded-lg transition">
								Retry
							</button>
						</div>
					)}

				{/* Search + Filter Row */}
					<div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 w-full">
					<div className="relative flex-1 w-full">
						<input
						type="text"
						placeholder="Search exercises..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none focus:border-blue-600 transition"
						/>
					</div>

					{/* Filter pills */}
					<div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto pb-1 md:pb-0 max-w-full">
						{FILTERS.map((filter) => (
						<button
							key={filter.key}
							onClick={() => setActiveCategory(filter.label)}
							className={`filter-pill whitespace-nowrap ${activeCategory === filter.label ? 'active' : ''}`}
						>
							{filter.label}
						</button>
						))}
					</div>
					</div>

					<p className="text-sm text-gray-400 mb-5">
						Showing <strong className="text-white">{filteredExercises.length}</strong> exercises
					</p>

					{filteredExercises.length > 0 ? (
						<div className="exercise-grid">
							{filteredExercises.map((exercise) => {
								const categoryKey = normalizeCategory(exercise.muscle_group);
								const categoryStyle = CATEGORY_STYLES[categoryKey] || CATEGORY_STYLES.general;

								return (
									<div
										key={exercise.id ?? `${exercise.name}-${exercise.muscle_group}`}
										className="exercise-card"
									>
										<div className="flex items-start justify-between mb-3">
											<div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg ${categoryStyle.iconBg} ${categoryStyle.iconText}`}>
												{getInitial(exercise.name)}
											</div>
											<span className={`badge ${categoryStyle.badge}`}>
												{categoryStyle.label}
											</span>
										</div>

										<h3 className="font-bold text-white mb-1">{exercise.name || 'Unnamed Exercise'}</h3>
										<p className="text-xs text-gray-400 mb-4 leading-relaxed">
											{exercise.description || 'No description available.'}
										</p>

										<button
											onClick={() => handleAddToWorkout(exercise)}
											className="add-btn"
										>
											+ Add to Workout
										</button>
									</div>
								);
							})}
						</div>
					) : (
						<div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-gray-400">
							No exercises found for your current search/filter.
						</div>
					)}
				</div>
			</main>

			<div
				className={`fixed bottom-6 right-6 z-50 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg transition-all duration-300 ${
					toastVisible
						? 'translate-y-0 opacity-100 bg-blue-600'
						: 'translate-y-20 opacity-0 bg-blue-600'
				}`}
			>
				{toastMessage || '✓ Exercise added to workout!'}
			</div>
		</div>
	);
}