import { forwardRef, useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/classNameUtils';
import { useThemeStore } from '../../store/themeStore';

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'>;

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
	variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', disabled, ...props }, ref) => {
	const theme = useThemeStore((state) => state.theme);
	const [isHovered, setIsHovered] = useState(false);
	const baseStyles =
		'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

	const variants = {
		primary: 'bg-gradient-to-br from-primary-500 to-primary-700 text-white hover:from-primary-600 hover:to-primary-800 focus:ring-primary-500 shadow-lg shadow-primary-500/30',
		secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-700 text-white hover:from-secondary-600 hover:to-secondary-800 focus:ring-secondary-500 shadow-lg shadow-secondary-500/30',
		tertiary: 'bg-gradient-to-br from-tertiary-500 to-tertiary-700 text-white hover:from-tertiary-600 hover:to-tertiary-800 focus:ring-tertiary-500 shadow-lg shadow-tertiary-500/30',
		ghost: 'bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-slate-500 transition-colors duration-200',
	};

	const sizes = {
		sm: 'px-4 py-2 text-sm',
		md: 'px-5 py-2.5 text-base',
		lg: 'px-7 py-3.5 text-lg',
	};

	const widthClass = fullWidth ? 'w-full' : '';

	// variant와 테마에 따른 텍스트 색상을 인라인 스타일로 적용
	const getTextColor = () => {
		if (variant === 'ghost') {
			// 라이트 모드에서 hover 시 흰색, 다크 모드는 항상 밝은 색
			if (theme === 'dark') {
				return '#f1f5f9'; // slate-100
			}
			return isHovered ? '#ffffff' : '#0f172a'; // hover 시 흰색, 기본은 slate-900
		}
		if (variant === 'primary') {
			// primary 버튼은 항상 흰색 텍스트 (그라디언트 배경이 어두움)
			return '#ffffff';
		}
		return undefined;
	};

	const textColor = getTextColor();
	const textColorStyle = textColor ? { color: textColor } : undefined;

	// props에서 전달된 style과 병합 (textColorStyle이 나중에 와서 덮어쓰도록)
	const mergedStyle = textColorStyle ? { ...(props.style || {}), ...textColorStyle } : props.style;

	return (
		<motion.button
			ref={ref}
			className={cn(baseStyles, variants[variant], sizes[size], widthClass, className)}
			style={mergedStyle}
			disabled={disabled}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			whileHover={{ scale: disabled ? 1 : 1.02 }}
			whileTap={{ scale: disabled ? 1 : 0.98 }}
			transition={{
				type: 'spring',
				stiffness: 400,
				damping: 17,
			}}
			{...(props as MotionButtonProps)}
		>
			{children}
		</motion.button>
	);
});

Button.displayName = 'Button';

export default Button;
