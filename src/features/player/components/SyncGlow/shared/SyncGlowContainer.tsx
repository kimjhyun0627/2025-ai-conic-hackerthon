import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SyncGlowContainerProps {
	children: ReactNode;
	/**
	 * 컨테이너 className
	 * @default 'w-full h-full overflow-hidden relative'
	 */
	className?: string;
	/**
	 * 컨테이너 스타일
	 */
	style?: CSSProperties;
	/**
	 * 외부 컨테이너 padding 적용 여부
	 * @default false
	 */
	withPadding?: boolean;
}

/**
 * SyncGlow 비주얼 모드 공통 컨테이너 컴포넌트
 */
export const SyncGlowContainer = ({
	children,
	className = 'w-full h-full overflow-hidden relative',
	style = {
		background: 'transparent',
		border: 'none',
	},
	withPadding = false,
}: SyncGlowContainerProps) => {
	return (
		<div className={`fixed inset-0 z-0 flex items-center justify-center ${withPadding ? 'md:pt-[28px] md:pb-[28px] py-[40px] md:px-[28px] md:py-[40px]' : ''}`}>
			<motion.div
				className={className}
				style={style}
			>
				{children}
			</motion.div>
		</div>
	);
};
