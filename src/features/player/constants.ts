/**
 * Player 관련 상수 통합 객체
 */
export const PLAYER_CONSTANTS = {
	ANIMATIONS: {
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
			initial: { y: 100, opacity: 0, scale: 0.95 },
			animate: { y: 0, opacity: 1, scale: 1 },
			transition: {
				duration: 0.8,
				delay: 0.4,
				type: 'spring' as const,
				stiffness: 80,
				damping: 20,
				opacity: {
					duration: 1.2,
					delay: 0.4,
					ease: [0.16, 1, 0.3, 1],
				},
				scale: {
					duration: 0.7,
					delay: 0.4,
					ease: [0.4, 0, 0.2, 1],
				},
				y: {
					type: 'spring' as const,
					stiffness: 80,
					damping: 20,
					delay: 0.4,
				},
			},
		},
		parameterPanel: {
			initial: { y: 20, opacity: 0 },
			animate: { y: 0, opacity: 1 },
			exit: { y: 20, opacity: 0 },
			transition: {
				y: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
				opacity: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
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
				duration: 4,
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
		muteButtonIcon: {
			initial: { opacity: 0, rotate: -180 },
			animate: { opacity: 1, rotate: 0 },
			exit: { opacity: 0, rotate: 180 },
			transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
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
					'radial-gradient(circle at 20% 50%, rgba(251, 113, 133, 0.3), transparent 50%)',
					'radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.3), transparent 50%)',
					'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.3), transparent 50%)',
					'radial-gradient(circle at 20% 50%, rgba(251, 113, 133, 0.3), transparent 50%)',
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
		playerControls: {
			hidden: {
				y: 200,
				opacity: 0,
				scale: 0.95,
				transition: {
					y: {
						type: 'spring' as const,
						stiffness: 100,
						damping: 25,
					},
					opacity: {
						duration: 0.3,
						ease: [0.4, 0, 0.2, 1],
					},
					scale: {
						duration: 0.4,
						ease: [0.4, 0, 0.2, 1],
					},
				},
			},
			visible: {
				y: 0,
				opacity: 1,
				scale: 1,
				transition: {
					delay: 0.4,
					y: {
						type: 'spring' as const,
						stiffness: 80,
						damping: 20,
					},
					opacity: {
						type: 'spring' as const,
						stiffness: 100,
						damping: 25,
					},
					scale: {
						duration: 0.7,
						ease: [0.4, 0, 0.2, 1],
					},
				},
			},
		},
	},
	STYLES: {
		glassButton: {
			base: 'p-3 rounded-2xl btn-glass hover:glow-secondary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40',
			homeButton:
				'btn-glass rounded-2xl backdrop-blur-md bg-white/30 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg hover:bg-white/30 dark:hover:bg-slate-800/40 hover:shadow-xl transition-all duration-300 h-11 px-4 py-0 flex items-center',
			controlButton: 'p-3 rounded-full backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-110 active:scale-95',
			playButton: 'p-4 md:p-5 rounded-full transition-all duration-200 glow-primary shadow-2xl relative overflow-hidden group hover:scale-110 active:scale-95',
		},
		glassCard: 'glass-card rounded-2xl p-4 md:p-5 backdrop-blur-md bg-white/20 dark:bg-slate-800/30 border border-white/30 dark:border-white/20 shadow-lg',
		playerBoard: 'rounded-2xl backdrop-blur-xl border shadow-2xl px-6 md:px-8 py-4 md:py-6 w-full max-w-[720px]',
		parameterPanel: 'rounded-2xl backdrop-blur-xl border shadow-2xl w-full overflow-hidden',
	},
	PARAMETER: {
		INDICATOR_OFFSET_FROM_PANEL: 0,
		HORIZONTAL_MAX_WIDTH_RATIO: 0.6,
		DEFAULT_HORIZONTAL_MAX_WIDTH: 720,
		VERTICAL_TWO_ROWS_THRESHOLD: 6,
		VISIBLE_COUNT_BREAKPOINTS: {
			VERY_SMALL: 630,
			SMALL: 750,
		},
		ANIMATION_DURATIONS: {
			BUTTON_REMOVE: 300,
			PANEL_EXIT: 300,
			LAYOUT: 600,
			OPACITY: 300,
			INDICATOR_DELAY: 30,
		},
		// 공통 transition 설정
		TRANSITIONS: {
			LAYOUT: {
				duration: 0.6,
				ease: [0.4, 0, 0.2, 1] as const,
			},
			OPACITY: {
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1] as const,
			},
			LAYOUT_OPACITY: {
				layout: {
					duration: 0.6,
					ease: [0.4, 0, 0.2, 1] as const,
				},
				opacity: {
					duration: 0.3,
					ease: [0.4, 0, 0.2, 1] as const,
				},
			},
		},
		// UI 상수
		UI: {
			INDICATOR_DELAY_MS: 600, // 인디케이터 표시 지연 시간 (layout 애니메이션 duration과 동일)
			OPACITY_DELAY: 0.1, // opacity 애니메이션 delay
			MODE_TOGGLE_DELAY: 0.2, // 모드 토글 버튼 애니메이션 delay
			PARAM_SLIDER_MIN_WIDTH: '70px', // 파라미터 슬라이더 최소 너비
			PANEL_PADDING_TOP: '1.125rem', // 패널 상단 패딩
			PANEL_PADDING_BOTTOM: '1.125rem', // 패널 하단 패딩
			CONTENT_PADDING_X: '0.75rem', // 컨텐츠 좌우 패딩
			GRID_GAP: '0.75rem', // 그리드 간격
		},
		CAROUSEL_ANIMATION: {
			spring: {
				type: 'spring' as const,
				stiffness: 300,
				damping: 30,
			},
			initialY: {
				up: -50,
				down: 50,
				default: 0,
			},
			exitY: {
				up: 50,
				down: -50,
				default: 0,
			},
		},
		INDICATOR_ANIMATION: {
			spring: {
				type: 'spring' as const,
				stiffness: 400,
				damping: 25,
			},
			scale: {
				initial: 0.5,
				animate: 1,
				exit: 0.5,
			},
			y: {
				initial: -10,
				animate: 0,
				exit: 10,
			},
		},
		COMMON_PARAM_BUTTON_ANIMATION: {
			layout: {
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1] as const,
			},
			opacity: {
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1] as const,
			},
			scale: {
				duration: 0.3,
				ease: [0.4, 0, 0.2, 1] as const,
			},
			removing: {
				opacity: 0,
				scale: 0.8,
				width: 0,
				paddingLeft: 0,
				paddingRight: 0,
				marginRight: 0,
			},
		},
		COMMON_PARAM_PANEL_ANIMATION: {
			initial: {
				opacity: 0,
				y: -20,
				scale: 0.95,
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1,
			},
			exit: {
				opacity: 0,
				y: 20,
				scale: 0.95,
			},
			transition: {
				layout: {
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1] as const,
				},
				opacity: {
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1] as const,
				},
				y: {
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1] as const,
				},
				scale: {
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1] as const,
				},
			},
		},
		// TopBar 버튼 애니메이션 variants (중복 제거용)
		topBarButton: {
			hidden: {
				opacity: 0,
				y: -20,
				transition: {
					opacity: {
						duration: 0.3,
						ease: [0.4, 0, 0.2, 1],
					},
					y: {
						duration: 0.3,
						ease: [0.4, 0, 0.2, 1],
					},
				},
			},
			visible: {
				opacity: 1,
				y: 0,
				transition: {
					duration: 0.5,
				},
			},
		},
		// 장르 변경 애니메이션
		genreChange: {
			overlay: {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
			},
			circle: {
				initial: { scale: 0.95, opacity: 0.4 },
				animate: { scale: 1.05, opacity: 0.7 },
				exit: { scale: 1.15, opacity: 0 },
				transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
			},
		},
		// 나가기 애니메이션
		exit: {
			overlay: {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] },
			},
			circle: {
				initial: { scale: 0.8, opacity: 0.2 },
				animate: { scale: 1.2, opacity: 0.9 },
				transition: { duration: 0.65, ease: [0.4, 0, 0.2, 1] },
			},
		},
		// 장르 정보 애니메이션
		genreInfoTransition: {
			hidden: {
				opacity: 0,
				y: -20,
				transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
			},
			visible: {
				opacity: 1,
				y: 0,
				transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
			},
		},
		// 중앙 이미지 전환 애니메이션
		centerImageTransition: {
			opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
			scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
		},
	},
	TIMING: {
		// 타이밍 상수 (ms)
		GENRE_CHANGE_DELAY: 500, // 장르 변경 애니메이션 지속 시간
		GENRE_SELECT_DELAY: 3000, // 장르 선택 후 딜레이
		EXIT_ANIMATION_DELAY: 700, // 나가기 애니메이션 후 네비게이션 딜레이
		TOAST_DURATION: 3000, // 토스트 표시 시간
	},
	GRADIENTS: {
		// 그라데이션 오버레이 색상
		genreChange: {
			dark: 'linear-gradient(140deg, rgba(15,23,42,0.8), rgba(67,56,202,0.7))',
			light: 'linear-gradient(140deg, rgba(255,255,255,0.8), rgba(191,219,254,0.7))',
		},
		exit: {
			dark: 'linear-gradient(140deg, rgba(15,23,42,0.95), rgba(67,56,202,0.85))',
			light: 'linear-gradient(140deg, rgba(255,255,255,0.95), rgba(191,219,254,0.85))',
		},
		circle: {
			dark: {
				background: 'rgba(255,255,255,0.1)',
				boxShadow: '0 0 80px rgba(167, 139, 250, 0.4)',
			},
			light: {
				background: 'rgba(148,163,184,0.25)',
				boxShadow: '0 0 80px rgba(99, 102, 241, 0.35)',
			},
		},
		exitCircle: {
			dark: {
				background: 'rgba(255,255,255,0.08)',
				boxShadow: '0 0 80px rgba(167, 139, 250, 0.35)',
			},
			light: {
				background: 'rgba(148,163,184,0.2)',
				boxShadow: '0 0 80px rgba(99, 102, 241, 0.3)',
			},
		},
	},
} as const;

// 캐러셀 네비게이션 방향
export type NavigationDirection = 'up' | 'down' | null;
