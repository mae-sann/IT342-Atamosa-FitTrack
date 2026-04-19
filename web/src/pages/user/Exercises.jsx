import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { authService } from '../../services/authService';
import '../../styles/dashboard.css';
import '../../styles/exercises.css';

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
		} catch {
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
		<>
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

		</>
	);
}