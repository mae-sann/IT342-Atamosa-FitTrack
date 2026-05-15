import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
	return (
		<div className="overflow-x-hidden" style={{ background: '#0A0F1E', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
			<style>{`
				@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');

				.bebas { font-family: 'Bebas Neue', cursive !important; }
				.hero-bg {
					background: radial-gradient(ellipse 80% 60% at 60% 20%, rgba(37,99,235,0.35) 0%, transparent 70%),
					            radial-gradient(ellipse 60% 50% at 10% 80%, rgba(59,130,246,0.2) 0%, transparent 60%),
					            #0A0F1E;
				}
				.glass {
					background: rgba(255,255,255,0.05);
					backdrop-filter: blur(12px);
					border: 1px solid rgba(255,255,255,0.1);
				}
				.feature-card { transition: transform 0.3s ease; }
				.feature-card:hover { transform: translateY(-4px); }
				.pulse-badge { animation: pulse-ring 2s infinite; }
				@keyframes pulse-ring {
					0%   { box-shadow: 0 0 0 0   rgba(37,99,235,0.6); }
					70%  { box-shadow: 0 0 0 12px rgba(37,99,235,0); }
					100% { box-shadow: 0 0 0 0   rgba(37,99,235,0); }
				}
				@keyframes bounce {
					0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
					40% { transform: translateX(-50%) translateY(-10px); }
					60% { transform: translateX(-50%) translateY(-5px); }
				}
				.stat-num {
					font-family: 'Bebas Neue', cursive !important;
					font-size: 3.5rem;
					line-height: 1;
					color: #ffffff !important;
					display: block;
				}
				.noise::after {
					content: '';
					position: absolute; inset: 0;
					background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
					pointer-events: none; opacity: 0.4;
				}
				.landing-root a {
					color: inherit !important;
					text-decoration: none !important;
				}
				.landing-root h1,
				.landing-root h2,
				.landing-root h3 {
					color: #ffffff !important;
					font-weight: inherit !important;
				}
				/* CTA button — force white bg + blue text at ALL times */
				.landing-cta-btn,
				.landing-cta-btn:link,
				.landing-cta-btn:visited,
				.landing-cta-btn:hover,
				.landing-cta-btn:active,
				.landing-cta-btn:focus {
					display: inline-block !important;
					background-color: #ffffff !important;
					color: #1d4ed8 !important;
					font-weight: 900 !important;
					font-size: 1.125rem !important;
					padding: 1rem 2.5rem !important;
					border-radius: 0.75rem !important;
					text-decoration: none !important;
					cursor: pointer !important;
					box-shadow: 0 10px 30px rgba(0,0,0,0.3) !important;
					transition: background-color 0.2s !important;
					-webkit-text-fill-color: #1d4ed8 !important;
				}
				.landing-cta-btn:hover {
					background-color: #eff6ff !important;
				}
				.step-box {
					width: 4rem;
					height: 4rem;
					border-radius: 1rem;
					display: flex;
					align-items: center;
					justify-content: center;
					margin: 0 auto 1rem;
					font-family: 'Bebas Neue', cursive !important;
					font-size: 1.875rem;
					color: #ffffff;
				}
			`}</style>

			<div className="landing-root">

			{/* ===== NAVBAR ===== */}
			<nav style={{position:'fixed',top:0,left:0,right:0,zIndex:50,background:'rgba(255,255,255,0.05)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
				<div style={{maxWidth:'80rem',margin:'0 auto',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
					<div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
						<div style={{width:'2rem',height:'2rem',background:'#2563eb',borderRadius:'0.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
							<svg style={{width:'1.25rem',height:'1.25rem',color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
							</svg>
						</div>
						<span className="bebas" style={{fontSize:'1.5rem',letterSpacing:'0.05em',color:'#fff'}}>FitTrack</span>
					</div>
					<div style={{display:'flex',alignItems:'center',gap:'2rem',fontSize:'0.875rem',fontWeight:500}}>
						<a href="#features" style={{color:'#d1d5db'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#d1d5db'}>Features</a>
						<a href="#how"      style={{color:'#d1d5db'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#d1d5db'}>How It Works</a>
						<a href="#stats"    style={{color:'#d1d5db'}} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='#d1d5db'}>Stats</a>
					</div>
					<div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
						<Link to="/login"    style={{fontSize:'0.875rem',fontWeight:600,color:'#d1d5db',padding:'0.5rem 1rem'}}>Log In</Link>
						<Link to="/register" style={{background:'#2563eb',color:'#fff',fontSize:'0.875rem',fontWeight:600,padding:'0.5rem 1.25rem',borderRadius:'0.5rem',display:'inline-block'}}>Get Started</Link>
					</div>
				</div>
			</nav>

			{/* ===== HERO ===== */}
			<section className="hero-bg noise" style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',paddingTop:'5rem'}}>
				<div style={{maxWidth:'80rem',margin:'0 auto',padding:'6rem 1.5rem',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'4rem',alignItems:'center'}}>
					<div>
						<div className="pulse-badge glass" style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',borderRadius:'9999px',padding:'0.375rem 1rem',fontSize:'0.875rem',color:'#93c5fd',marginBottom:'1.5rem'}}>
							<span style={{width:'0.5rem',height:'0.5rem',background:'#60a5fa',borderRadius:'9999px',display:'inline-block'}}></span>
							Free Fitness Tracking App
						</div>
						<h1 className="bebas" style={{fontSize:'clamp(5rem,10vw,8rem)',lineHeight:1,color:'#fff',marginBottom:'1rem'}}>
							TRACK.<br/><span style={{color:'#60a5fa'}}>GROW.</span><br/>DOMINATE.
						</h1>
						<p style={{color:'#9ca3af',fontSize:'1.125rem',maxWidth:'28rem',marginBottom:'2rem',lineHeight:1.7}}>
							Log every rep, track every session, and see your progress skyrocket. FitTrack gives you the tools to build a better body — one workout at a time.
						</p>
						<div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
							<Link to="/register" style={{background:'#2563eb',color:'#fff',fontWeight:700,padding:'1rem 2rem',borderRadius:'0.75rem',fontSize:'1.125rem',display:'inline-block',boxShadow:'0 10px 30px rgba(37,99,235,0.4)'}}>
								Start Tracking Free
							</Link>
							<a href="#how" style={{display:'flex',alignItems:'center',gap:'0.5rem',color:'#9ca3af',fontSize:'0.875rem',fontWeight:500}}>
								<span style={{width:'2.25rem',height:'2.25rem',borderRadius:'9999px',border:'1px solid #374151',display:'flex',alignItems:'center',justifyContent:'center'}}>▶</span>
								See how it works
							</a>
						</div>
					</div>

					<div style={{position:'relative'}}>
						<div className="glass" style={{borderRadius:'1rem',padding:'1.5rem',boxShadow:'0 25px 50px rgba(37,99,235,0.15)'}}>
							<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
								<span style={{fontSize:'0.875rem',color:'#9ca3af',fontWeight:500}}>Today's Workout</span>
								<span style={{background:'rgba(37,99,235,0.2)',color:'#93c5fd',fontSize:'0.75rem',fontWeight:600,padding:'0.25rem 0.75rem',borderRadius:'9999px'}}>Active</span>
							</div>
							<h3 style={{color:'#fff',fontWeight:700,fontSize:'1.25rem',marginBottom:'1rem'}}>Upper Body Blast</h3>
							<div style={{display:'flex',flexDirection:'column',gap:'0.75rem',marginBottom:'1.25rem'}}>
								{[['B','Bench Press','4 × 10'],['P','Pull Ups','3 × 8'],['S','Shoulder Press','3 × 12']].map(([letter,name,sets])=>(
									<div key={name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,0.05)',borderRadius:'0.75rem',padding:'0.75rem'}}>
										<div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
											<div style={{width:'2rem',height:'2rem',background:'rgba(37,99,235,0.3)',borderRadius:'0.5rem',display:'flex',alignItems:'center',justifyContent:'center',color:'#93c5fd',fontSize:'0.75rem',fontWeight:700}}>{letter}</div>
											<span style={{fontSize:'0.875rem',color:'#e5e7eb',fontWeight:500}}>{name}</span>
										</div>
										<span style={{fontSize:'0.75rem',color:'#9ca3af'}}>{sets}</span>
									</div>
								))}
							</div>
							<div style={{display:'flex',justifyContent:'space-between',fontSize:'0.75rem',color:'#9ca3af',marginBottom:'0.5rem'}}>
								<span>Progress</span><span>67%</span>
							</div>
							<div style={{width:'100%',height:'0.5rem',background:'rgba(255,255,255,0.1)',borderRadius:'9999px'}}>
								<div style={{width:'67%',height:'0.5rem',background:'#3b82f6',borderRadius:'9999px'}}></div>
							</div>
						</div>
						<div className="glass" style={{position:'absolute',bottom:'-1rem',left:'-1.5rem',borderRadius:'0.75rem',padding:'0.75rem 1rem',textAlign:'center'}}>
							<div className="bebas" style={{fontSize:'1.8rem',color:'#60a5fa',lineHeight:1}}>50</div>
							<div style={{fontSize:'0.75rem',color:'#9ca3af'}}>Workouts Logged</div>
						</div>
						<div className="glass" style={{position:'absolute',top:'-1.5rem',right:'-1rem',borderRadius:'0.75rem',padding:'0.75rem 1rem',textAlign:'center'}}>
							<div className="bebas" style={{fontSize:'1.8rem',color:'#fff',lineHeight:1}}>🔥 14</div>
							<div style={{fontSize:'0.75rem',color:'#9ca3af'}}>Day Streak</div>
						</div>
					</div>
				</div>
				<div style={{position:'absolute',bottom:'2rem',left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.5rem',animation:'bounce 1.6s infinite ease-in-out'}}>
					<span style={{fontSize:'0.75rem',color:'#94a3b8',letterSpacing:'0.08em',textTransform:'uppercase'}}>Scroll down</span>
					<svg style={{width:'1rem',height:'1rem',color:'#94a3b8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
				</div>
			</section>

			{/* ===== STATS — project-honest numbers ===== */}
			<section id="stats" style={{background:'#2563eb',padding:'4rem 0'}}>
				<div style={{maxWidth:'80rem',margin:'0 auto',padding:'0 1.5rem',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'2rem',textAlign:'center'}}>
					{[
						['6',  'Core Features'],
						['20', 'Exercises Available'],
						['4',  'Workout Categories'],
						['100%','Free to Use'],
					].map(([num,label])=>(
						<div key={label}>
							<span className="stat-num">{num}</span>
							<div style={{color:'#bfdbfe',fontSize:'0.875rem',marginTop:'0.25rem'}}>{label}</div>
						</div>
					))}
				</div>
			</section>

			{/* ===== FEATURES ===== */}
			<section id="features" style={{background:'#030712',padding:'6rem 0'}}>
				<div style={{maxWidth:'80rem',margin:'0 auto',padding:'0 1.5rem'}}>
					<div style={{textAlign:'center',marginBottom:'4rem'}}>
						<p style={{color:'#60a5fa',fontSize:'0.875rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'0.5rem'}}>Why FitTrack?</p>
						<h2 className="bebas" style={{fontSize:'clamp(2.5rem,5vw,3.75rem)',color:'#fff',lineHeight:1.1}}>
							Everything You Need<br/><span style={{color:'#60a5fa'}}>To Crush Your Goals</span>
						</h2>
					</div>
					<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.5rem'}}>
						{[
							{icon:'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', title:'Workout Logging', desc:'Create and log workout sessions with sets and reps. Select from a rich exercise library categorized by muscle group.'},
							{icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', title:'Progress Tracking', desc:'Visualize your improvements over time with charts and statistics. See weekly trends and stay motivated with your progress data.'},
							{icon:'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', title:'Exercise Library', desc:'Browse 20 predefined exercises organized by category — Upper Body, Lower Body, Core, and Cardio — to build your perfect workout.'},
							{icon:'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', title:'Fitness Goals', desc:'Set personal fitness goals and track your progress towards them. Update and manage your targets as you grow stronger.'},
							{icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title:'Workout History', desc:'Access your complete workout history at any time. Review past sessions, track consistency, and identify areas for improvement.'},
							{icon:'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', title:'Cross-Platform', desc:'Access FitTrack on any device — desktop, tablet, or phone. Your data syncs automatically across all platforms.'},
						].map(({icon,title,desc})=>(
							<div key={title} className="feature-card glass" style={{borderRadius:'1rem',padding:'2rem'}}>
								<div style={{width:'3.5rem',height:'3.5rem',background:'rgba(37,99,235,0.25)',borderRadius:'0.875rem',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem'}}>
									<svg style={{width:'1.5rem',height:'1.5rem',color:'#60a5fa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}/>
									</svg>
								</div>
								<h3 style={{color:'#fff',fontWeight:700,fontSize:'1.125rem',marginBottom:'0.75rem'}}>{title}</h3>
								<p style={{color:'#9ca3af',fontSize:'0.875rem',lineHeight:1.7}}>{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== HOW IT WORKS ===== */}
			<section id="how" style={{background:'#0A0F1E',padding:'6rem 0'}}>
				<div style={{maxWidth:'80rem',margin:'0 auto',padding:'0 1.5rem'}}>
					<div style={{textAlign:'center',marginBottom:'4rem'}}>
						<p style={{color:'#60a5fa',fontSize:'0.875rem',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'0.5rem'}}>Simple Process</p>
						<h2 className="bebas" style={{fontSize:'clamp(2.5rem,5vw,3.75rem)',color:'#fff'}}>How It Works</h2>
					</div>
					<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'2rem'}}>
						{[
							{num:'1',bg:'#2563eb',             title:'Create Account',   desc:'Sign up in seconds. No credit card required.'},
							{num:'2',bg:'rgba(37,99,235,0.6)', title:'Browse Exercises', desc:'Pick from 20 predefined exercises across all muscle groups.'},
							{num:'3',bg:'rgba(37,99,235,0.4)', title:'Log Your Workout', desc:'Record sets and reps for each exercise session.'},
							{num:'4',bg:'rgba(37,99,235,0.2)', title:'Track Progress',   desc:'Watch your stats grow as you build consistency.'},
						].map(({num,bg,title,desc})=>(
							<div key={num} style={{textAlign:'center'}}>
								<div className="step-box" style={{background:bg}}>{num}</div>
								<h3 style={{color:'#fff',fontWeight:700,marginBottom:'0.5rem'}}>{title}</h3>
								<p style={{color:'#9ca3af',fontSize:'0.875rem'}}>{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ===== CTA ===== */}
			<section style={{background:'#2563eb',padding:'6rem 0',position:'relative',overflow:'hidden'}}>
				<div style={{position:'absolute',inset:0,opacity:0.1,background:'repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%) center/20px 20px'}}></div>
				<div style={{maxWidth:'48rem',margin:'0 auto',textAlign:'center',padding:'0 1.5rem',position:'relative'}}>
					<h2 className="bebas" style={{fontSize:'clamp(3rem,8vw,5rem)',color:'#fff',marginBottom:'1rem',lineHeight:1.1}}>
						Ready To Start<br/>Your Journey?
					</h2>
					<p style={{color:'#bfdbfe',marginBottom:'2rem'}}>Start your fitness journey today. Track your workouts, set goals, and build consistency with FitTrack.</p>
					{/* Using <a> instead of Link to avoid React Router color inheritance issues */}
					<a href="/register" className="landing-cta-btn">
						Create Free Account →
					</a>
				</div>
			</section>

			{/* ===== FOOTER ===== */}
			<footer style={{background:'#030712',padding:'2.5rem 0',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
				<div style={{maxWidth:'80rem',margin:'0 auto',padding:'0 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
					<div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
						<div style={{width:'1.75rem',height:'1.75rem',background:'#2563eb',borderRadius:'0.5rem',display:'flex',alignItems:'center',justifyContent:'center'}}>
							<svg style={{width:'1rem',height:'1rem',color:'#fff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
						</div>
						<span className="bebas" style={{fontSize:'1.25rem',letterSpacing:'0.05em',color:'#fff'}}>FitTrack</span>
					</div>
					<p style={{color:'#6b7280',fontSize:'0.875rem'}}>© 2026 FitTrack · IT342-G5 · Atamosa, Charry Mae Avila</p>
					<div style={{display:'flex',gap:'1rem',fontSize:'0.875rem'}}>
						<Link to="/login"    style={{color:'#6b7280'}}>Login</Link>
						<Link to="/register" style={{color:'#6b7280'}}>Register</Link>
					</div>
				</div>
			</footer>

			</div>
		</div>
	)
}
