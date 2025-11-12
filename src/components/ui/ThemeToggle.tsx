import { useCallback, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

type AnimationVariant = 'circle' | 'circle-blur' | 'polygon' | 'gif';

type StartPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// View Transitions API 타입 정의
interface ViewTransition {
	updateCallbackDone: Promise<void>;
	ready: Promise<void>;
	finished: Promise<void>;
	skipTransition: () => void;
}

interface DocumentWithViewTransition {
	startViewTransition?: (callback: () => void) => ViewTransition;
}

export interface ThemeToggleButtonProps {
	theme?: 'light' | 'dark';
	showLabel?: boolean;
	variant?: AnimationVariant;
	start?: StartPosition;
	url?: string; // For gif variant
	className?: string;
	onClick?: () => void;
}

const ThemeToggleButton = ({ theme = 'light', showLabel = false, variant = 'circle-blur', start = 'top-right', url, className, onClick }: ThemeToggleButtonProps) => {
	const [isHovered, setIsHovered] = useState(false);

	const handleClick = useCallback(() => {
		// Inject animation styles for this specific transition
		const styleId = `theme-transition-${Date.now()}`;
		const style = document.createElement('style');
		style.id = styleId;

		// Generate animation CSS based on variant
		let css = '';
		const positions = {
			center: 'center',
			'top-left': 'top left',
			'top-right': 'top right',
			'bottom-left': 'bottom left',
			'bottom-right': 'bottom right',
		};

		if (variant === 'circle') {
			const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100';
			const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100';
			css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-expand 1.0s ease-out;
            transform-origin: ${positions[start]};
          }
          @keyframes circle-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
            }
          }
        }
      `;
		} else if (variant === 'circle-blur') {
			const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100';
			const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100';
			css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `;
		} else if (variant === 'gif' && url) {
			css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: fade-out 0.4s ease-out;
          }
          ::view-transition-new(root) {
            animation: gif-reveal 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            mask-image: url('${url}');
            mask-size: 0%;
            mask-repeat: no-repeat;
            mask-position: center;
          }
          @keyframes fade-out {
            to {
              opacity: 0;
            }
          }
          @keyframes gif-reveal {
            0% {
              mask-size: 0%;
            }
            20% {
              mask-size: 35%;
            }
            60% {
              mask-size: 35%;
            }
            100% {
              mask-size: 300%;
            }
          }
        }
      `;
		} else if (variant === 'polygon') {
			css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: ${theme === 'light' ? 'wipe-in-dark' : 'wipe-in-light'} 0.4s ease-out;
          }
          @keyframes wipe-in-dark {
            from {
              clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
          @keyframes wipe-in-light {
            from {
              clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
        }
      `;
		}

		style.textContent = css;
		document.head.appendChild(style);

		// Start view transition if supported
		const doc = document as DocumentWithViewTransition;
		if (doc.startViewTransition) {
			doc.startViewTransition(() => {
				onClick?.();
			});
		} else {
			onClick?.();
		}

		// Clean up styles after transition
		setTimeout(() => {
			const styleEl = document.getElementById(styleId);
			if (styleEl) {
				styleEl.remove();
			}
		}, 3000);
	}, [onClick, variant, start, url, theme]);

	const isDark = theme === 'dark';

	const buttonStyle: React.CSSProperties = {
		position: 'relative',
		overflow: 'hidden',
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		padding: showLabel ? '0.5rem 1rem' : '0.75rem',
		borderRadius: '0.75rem',
		border: `1px solid ${isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.5)'}`,
		background: isHovered ? (isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)') : isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
		backdropFilter: 'blur(12px)',
		WebkitBackdropFilter: 'blur(12px)',
		boxShadow: isHovered
			? isDark
				? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(168, 85, 247, 0.1)'
				: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(168, 85, 247, 0.2)'
			: isDark
				? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
				: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		transform: isHovered ? 'scale(1.05)' : 'scale(1)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: showLabel ? '0.5rem' : '0',
		cursor: 'pointer',
		outline: 'none',
	};

	return (
		<button
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onFocus={(e) => {
				setIsHovered(true);
				e.currentTarget.style.boxShadow = isDark
					? '0 0 0 2px rgba(168, 85, 247, 0.5), 0 20px 25px -5px rgba(0, 0, 0, 0.3)'
					: '0 0 0 2px rgba(168, 85, 247, 0.5), 0 20px 25px -5px rgba(0, 0, 0, 0.1)';
			}}
			onBlur={() => setIsHovered(false)}
			style={buttonStyle}
			className={className}
			aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
		>
			{/* 배경 그라데이션 효과 */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: isHovered
						? `linear-gradient(to bottom right, rgba(168, 85, 247, 0.1), rgba(217, 70, 239, 0.1))`
						: `linear-gradient(to bottom right, rgba(168, 85, 247, 0), rgba(217, 70, 239, 0))`,
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					borderRadius: '0.75rem',
					pointerEvents: 'none',
				}}
			/>

			{/* 아이콘 */}
			<div
				style={{
					position: 'relative',
					zIndex: 10,
					transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					transform: isHovered ? 'rotate(12deg)' : 'rotate(0deg)',
				}}
			>
				{theme === 'light' ? (
					<Sun
						style={{
							width: '1.25rem',
							height: '1.25rem',
							color: isHovered ? '#fbbf24' : '#eab308',
							transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						}}
					/>
				) : (
					<Moon
						style={{
							width: '1.25rem',
							height: '1.25rem',
							color: isHovered ? '#e2e8f0' : '#cbd5e1',
							transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						}}
					/>
				)}
			</div>

			{showLabel && (
				<span
					style={{
						position: 'relative',
						zIndex: 10,
						fontSize: '0.875rem',
						fontWeight: 500,
						color: isDark ? 'rgba(203, 213, 225, 1)' : 'rgba(51, 65, 85, 1)',
					}}
				>
					{theme === 'light' ? 'Light' : 'Dark'}
				</span>
			)}
		</button>
	);
};

const ThemeToggle = () => {
	const { theme, toggleTheme, initTheme } = useThemeStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		initTheme();
		setMounted(true);
	}, [initTheme]);

	const handleThemeToggle = useCallback(() => {
		toggleTheme();
	}, [toggleTheme]);

	if (!mounted) {
		return null;
	}

	return (
		<ThemeToggleButton
			theme={theme}
			onClick={handleThemeToggle}
			variant="circle-blur"
			start="top-right"
		/>
	);
};

export default ThemeToggle;
