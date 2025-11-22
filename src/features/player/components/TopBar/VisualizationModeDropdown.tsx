import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { useThemeColors } from '@/shared/hooks';
import { VisualizationModeItem } from './VisualizationModeItem';
import { VISUALIZATION_MODES, getVisualizationModeById } from '../../constants/visualizationModes';
import type { VisualizationMode } from '../../types/visualization';

interface VisualizationModeDropdownProps {
	visualizationMode: VisualizationMode;
	onVisualizationModeChange?: (mode: VisualizationMode) => void;
	isOpen?: boolean;
	onOpenChange?: (isOpen: boolean) => void;
	onCloseOtherDropdown?: () => void;
}

const PRIMARY_COLOR = '#fb7185'; // primary-500

/**
 * 비주얼 모드 드롭다운 컴포넌트
 */
export const VisualizationModeDropdown = ({ visualizationMode, onVisualizationModeChange, isOpen: controlledIsOpen, onOpenChange, onCloseOtherDropdown }: VisualizationModeDropdownProps) => {
	const colors = useThemeColors();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const [hoveredMode, setHoveredMode] = useState<string | null>(null);
	const [isButtonHovered, setIsButtonHovered] = useState(false);

	// 외부 제어가 있으면 외부 상태 사용, 없으면 내부 상태 사용
	const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
	const setIsOpen = (value: boolean) => {
		if (controlledIsOpen === undefined) {
			setInternalIsOpen(value);
		}
		onOpenChange?.(value);
	};

	// 외부 클릭 시 드롭다운 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const handleModeSelect = (modeId: VisualizationMode) => {
		if (visualizationMode === modeId) {
			setIsOpen(false);
			return;
		}

		setIsOpen(false);
		onVisualizationModeChange?.(modeId);
	};

	const currentMode = getVisualizationModeById(visualizationMode);
	const CurrentIcon = currentMode?.icon;

	return (
		<div
			className="relative"
			ref={dropdownRef}
		>
			{/* 버튼 */}
			<div
				onMouseEnter={() => setIsButtonHovered(true)}
				onMouseLeave={() => setIsButtonHovered(false)}
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						onCloseOtherDropdown?.();
						setIsOpen(!isOpen);
					}}
					className="btn-glass rounded-2xl backdrop-blur-md border shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-4 py-0 flex items-center"
					style={{
						background: colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)',
						borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
						color: isButtonHovered || isOpen ? PRIMARY_COLOR : colors.isDark ? '#f1f5f9' : '#0f172a',
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.7)';
						e.currentTarget.style.color = PRIMARY_COLOR;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = colors.isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.6)';
						e.currentTarget.style.color = colors.isDark ? '#f1f5f9' : '#0f172a';
					}}
				>
					{CurrentIcon && (
						<CurrentIcon
							className="w-5 h-5 mr-2"
							style={{
								color: isButtonHovered || isOpen ? PRIMARY_COLOR : undefined,
							}}
						/>
					)}
					<span
						style={{
							color: isButtonHovered || isOpen ? PRIMARY_COLOR : colors.isDark ? '#f1f5f9' : '#0f172a',
						}}
					>
						{currentMode?.name || '시각화 모드'}
					</span>
					<ChevronDown
						className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
						style={{
							color: isButtonHovered || isOpen ? PRIMARY_COLOR : undefined,
						}}
					/>
				</Button>
			</div>

			{/* 드롭다운 메뉴 */}
			<AnimatePresence>
				{isOpen && VISUALIZATION_MODES.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						className="absolute top-full right-0 mt-2 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl"
						style={{
							background: colors.glassBackground,
							borderColor: colors.glassBorder,
							zIndex: 110000, // 파라미터 패널(z-100)보다 위에 표시
						}}
					>
						<div className="p-2">
							{VISUALIZATION_MODES.map((mode) => (
								<VisualizationModeItem
									key={mode.id}
									mode={mode}
									isSelected={visualizationMode === mode.id}
									isHovered={hoveredMode === mode.id}
									onClick={() => handleModeSelect(mode.id)}
									onMouseEnter={() => setHoveredMode(mode.id)}
									onMouseLeave={() => setHoveredMode(null)}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
