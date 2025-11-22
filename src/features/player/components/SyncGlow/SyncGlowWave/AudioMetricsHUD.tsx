import { motion } from 'framer-motion';
import { useThemeColors } from '@/shared/hooks';
import { WAVEFORM_CONSTANTS } from './constants';

interface AudioMetricsHUDProps {
	rms: number;
	bpm: number | null;
	lowEnergy: number;
	midEnergy: number;
	highEnergy: number;
}

/**
 * 오디오 지표 HUD 패널 컴포넌트
 */
export const AudioMetricsHUD = ({ rms, bpm, lowEnergy, midEnergy, highEnergy }: AudioMetricsHUDProps) => {
	const colors = useThemeColors();

	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 20 }}
			transition={{ duration: 0.3 }}
			className="fixed bottom-6 right-6 z-50 rounded-2xl backdrop-blur-xl border shadow-2xl p-4"
			style={{
				width: WAVEFORM_CONSTANTS.HUD_WIDTH,
				background: colors.glassBackground,
				borderColor: colors.glassBorder,
				opacity: WAVEFORM_CONSTANTS.HUD_OPACITY,
			}}
		>
			<div className="space-y-3">
				{/* 제목 */}
				<div
					className="text-sm font-semibold mb-2"
					style={{
						color: colors.isDark ? '#f1f5f9' : '#0f172a',
					}}
				>
					오디오 지표
				</div>

				{/* RMS */}
				<MetricRow
					label="RMS"
					value={`${Math.round(rms * 100)}%`}
					color={colors.isDark ? '#f1f5f9' : '#0f172a'}
				/>

				{/* BPM */}
				<MetricRow
					label="BPM"
					value={bpm !== null ? bpm.toString() : '측정 중'}
					color={colors.isDark ? '#f1f5f9' : '#0f172a'}
				/>

				{/* 주파수 대역별 에너지 */}
				<div
					className="pt-2 border-t"
					style={{ borderColor: colors.glassBorder }}
				>
					<div
						className="text-xs font-medium mb-2"
						style={{ color: colors.textSecondaryColor }}
					>
						주파수 대역
					</div>
					<div className="space-y-1.5">
						<EnergyBar
							label="저음"
							value={lowEnergy * 0.9}
							color={colors.isDark ? '#fb7185' : '#fb7185'} // primary-400 (다크) / primary-500 (라이트)
						/>
						<EnergyBar
							label="중음"
							value={midEnergy * 1}
							color={colors.isDark ? '#fca5a5' : '#f43f5e'} // primary-300 (다크) / primary-600 (라이트)
						/>
						<EnergyBar
							label="고음"
							value={highEnergy * 1.8}
							color={colors.isDark ? '#fee2e2' : '#e11d48'} // primary-100 (다크) / primary-700 (라이트)
						/>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

interface MetricRowProps {
	label: string;
	value: string;
	color: string;
}

const MetricRow = ({ label, value, color }: MetricRowProps) => {
	const isMeasuring = value === '측정 중';
	return (
		<div className="flex items-center justify-between">
			<span
				className="text-xs"
				style={{ color: color, opacity: 0.7 }}
			>
				{label}
			</span>
			<span
				className="text-sm font-semibold"
				style={{ color, opacity: isMeasuring ? 0.6 : 1 }}
			>
				{value}
			</span>
		</div>
	);
};

interface EnergyBarProps {
	label: string;
	value: number;
	color: string;
}

const EnergyBar = ({ label, value, color }: EnergyBarProps) => {
	return (
		<div className="flex items-center gap-2">
			<span
				className="text-xs w-8"
				style={{ color: color, opacity: 0.8 }}
			>
				{label}
			</span>
			<div
				className="flex-1 h-2 rounded-full overflow-hidden"
				style={{ background: 'rgba(255, 255, 255, 0.1)' }}
			>
				<motion.div
					className="h-full rounded-full"
					style={{ background: color }}
					initial={{ width: 0 }}
					animate={{ width: `${value * 100}%` }}
					transition={{ duration: 0.1 }}
				/>
			</div>
			<span
				className="text-xs w-10 text-right"
				style={{ color: color, opacity: 0.7 }}
			>
				{Math.round(value * 100)}%
			</span>
		</div>
	);
};
