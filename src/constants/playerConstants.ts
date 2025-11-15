/**
 * Player 페이지 애니메이션 설정
 */
export const PLAYER_ANIMATIONS = {
	topBar: {
		initial: { opacity: 0, y: -20 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.5 },
	},
	topBarDelayed: {
		initial: { opacity: 0, y: -20 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.5, delay: 0.1 },
	},
	genreInfo: {
		initial: { opacity: 0, x: -20 },
		animate: { opacity: 1, x: 0 },
		transition: { duration: 0.6, delay: 0.2 },
	},
	centerImage: {
		initial: { opacity: 0, scale: 0.9 },
		animate: { opacity: 1, scale: 1 },
		transition: { duration: 0.7, delay: 0.3, type: 'spring' as const, stiffness: 100 },
	},
	playerBoard: {
		initial: { y: 100 },
		animate: { y: 0 },
		transition: { duration: 0.6, delay: 0.4, type: 'spring' as const, stiffness: 100 },
	},
	parameterPanel: {
		initial: { height: 0, opacity: 0 },
		animate: { height: 'auto', opacity: 1 },
		exit: { height: 0, opacity: 0 },
		transition: {
			height: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
			opacity: { duration: 0.3 },
			layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
		},
	},
	parameterItem: {
		initial: { opacity: 0, y: 20, scale: 0.95 },
		animate: { opacity: 1, y: 0, scale: 1 },
		exit: {
			opacity: 0,
			y: -10,
			scale: 0.95,
			height: 0,
			marginBottom: 0,
			paddingTop: 0,
			paddingBottom: 0,
		},
		transition: {
			layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
			opacity: { duration: 0.5, ease: 'easeOut' },
			height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
			y: { duration: 0.5, ease: 'easeOut' },
			scale: { duration: 0.5, ease: 'easeOut' },
		},
	},
	parameterGrid: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: {
			layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
			opacity: { duration: 0.3, delay: 0.1 },
		},
	},
	playButtonShine: {
		animate: {
			x: ['-100%', '200%'],
		},
		transition: {
			duration: 2,
			repeat: Infinity,
			ease: 'linear',
		},
	},
	playButtonIcon: {
		initial: { opacity: 0, rotate: -90 },
		animate: { opacity: 1, rotate: 0 },
		exit: { opacity: 0, rotate: 90 },
		transition: { duration: 0.2 },
	},
	imageScale: {
		initial: { scale: 1.1 },
		animate: { scale: 1 },
		transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
	},
	emojiAnimation: {
		animate: {
			scale: [1, 1.1, 1],
			rotate: [0, 5, -5, 0],
		},
		transition: {
			duration: 2,
			repeat: Infinity,
			ease: 'easeInOut',
		},
	},
	gradientOverlay: {
		animate: {
			background: [
				'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3), transparent 50%)',
				'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.3), transparent 50%)',
				'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.3), transparent 50%)',
				'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.3), transparent 50%)',
			],
		},
		transition: {
			duration: 4,
			repeat: Infinity,
			ease: 'easeInOut',
		},
	},
	progressBar: {
		initial: { width: 0 },
		animate: { width: '100%' },
		transition: { duration: 0.1 },
	},
	expandButton: {
		animate: { rotate: 0 },
		transition: { duration: 0.3 },
	},
	commonParamButton: {
		initial: { opacity: 0, scale: 0.9 },
		animate: { opacity: 1, scale: 1 },
		whileHover: { scale: 1.05 },
		whileTap: { scale: 0.95 },
		transition: { duration: 0.2 },
	},
	commonParamPanel: {
		initial: { opacity: 0, y: 20 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 10 },
		transition: {
			layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
			opacity: { duration: 0.3 },
			y: { duration: 0.3 },
		},
	},
} as const;

/**
 * Player 페이지 스타일 상수
 */
export const PLAYER_STYLES = {
	glassButton: {
		base: 'p-3 rounded-2xl btn-glass hover:glow-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40',
		homeButton: 'btn-glass rounded-2xl backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40 hover:shadow-xl transition-all duration-300 h-11 px-4 py-0 flex items-center',
		controlButton: 'p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 active:scale-95',
		playButton: 'p-4 md:p-5 rounded-full transition-all duration-200 glow-primary shadow-2xl relative overflow-hidden group hover:scale-110 active:scale-95',
	},
	glassCard: 'glass-card rounded-2xl p-4 md:p-5 backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg',
	playerBoard: 'rounded-2xl backdrop-blur-xl border shadow-2xl px-6 md:px-8 py-4 md:py-6 w-full max-w-[960px]',
	parameterPanel: 'mb-4 rounded-2xl backdrop-blur-xl border shadow-2xl w-full max-w-[960px] overflow-hidden',
} as const;

