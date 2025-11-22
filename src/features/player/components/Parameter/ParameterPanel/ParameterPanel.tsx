import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParameterCarousel } from '../ParameterCarousel';
import { ParameterButtons } from '../ParameterButtons';
import { ParameterGrid } from './ParameterGrid';
import { ParameterModeToggle } from './ParameterModeToggle';
import { ParameterIndicatorWrapper } from './ParameterIndicatorWrapper';
import type { CategoryParameter } from '@/shared/types';
import { PLAYER_CONSTANTS } from '../../../constants';
import { useThemeColors } from '@/shared/hooks';
import { useIndicatorPosition } from '../../../hooks';
import { useParameterCarousel } from '../../../hooks';
import { useAudioAnalyzer, useBPM } from '../../../hooks';
import { getParameterPanelStyle } from '../../../utils';
import { getRowSplit, shouldUseTwoRows } from '../../../utils';
import { usePlayerStore } from '@/store/playerStore';

interface ParameterPanelProps {
	isExpanded: boolean;
	themeBaseParams: CategoryParameter[];
	themeAdditionalParams: CategoryParameter[];
	activeCommonParams: CategoryParameter[];
	availableCommonParams: CategoryParameter[];
	getParamValue: (paramId: string) => number;
	setParamValue: (paramId: string, value: number) => void;
	onRemoveThemeParam: (paramId: string) => void;
	onRemoveCommonParam: (paramId: string) => void;
	onAddCommonParam: (paramId: string) => void;
	onApply?: () => void;
}

export const ParameterPanel = ({
	isExpanded,
	themeBaseParams,
	themeAdditionalParams,
	activeCommonParams,
	availableCommonParams,
	getParamValue,
	setParamValue,
	onRemoveThemeParam,
	onRemoveCommonParam,
	onAddCommonParam,
	onApply,
}: ParameterPanelProps) => {
	const colors = useThemeColors();
	const orientation = usePlayerStore((state) => state.parameterPanelOrientation);
	const setParameterPanelOrientation = usePlayerStore((state) => state.setParameterPanelOrientation);
	const isPlaying = usePlayerStore((state) => state.isPlaying);
	const [shouldShowIndicator, setShouldShowIndicator] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const carouselRef = useRef<HTMLDivElement>(null);

	// 현재 BPM 계산
	const audioAnalysis = useAudioAnalyzer(isPlaying);
	const currentBPM = useBPM({
		isPlaying,
		peak: audioAnalysis.peak,
		timestamp: audioAnalysis.timestamp,
	});

	// 세로 모드에서 모든 파라미터 합치기
	const allParams = [...themeBaseParams, ...themeAdditionalParams, ...activeCommonParams];
	const totalParamsCount = allParams.length;
	const shouldUseTwoRowsLayout = shouldUseTwoRows(totalParamsCount);

	// 캐러셀 로직
	const { currentStartIndex, visibleCount, navigationDirectionRef, nextParam, prevParam, getCurrentParams, goToIndex } = useParameterCarousel({
		allParams,
		themeBaseParams,
		themeAdditionalParams,
		activeCommonParams,
		orientation,
	});

	// 추가된 파라미터 ID를 추적하기 위한 ref
	const addedParamIdRef = useRef<string | null>(null);

	// 파라미터 추가 시 해당 파라미터로 이동하는 래퍼 함수
	const handleAddCommonParam = useCallback(
		(paramId: string) => {
			addedParamIdRef.current = paramId;
			onAddCommonParam(paramId);
		},
		[onAddCommonParam]
	);

	// themeAdditionalParams가 변경되었을 때 추가된 파라미터로 이동
	useEffect(() => {
		if (addedParamIdRef.current && orientation === 'horizontal') {
			const paramId = addedParamIdRef.current;
			const updatedAllParams = [...themeBaseParams, ...themeAdditionalParams, ...activeCommonParams];
			const paramIndex = updatedAllParams.findIndex((p) => p.id === paramId);
			if (paramIndex !== -1) {
				goToIndex(paramIndex);
			}
			addedParamIdRef.current = null; // 처리 완료 후 리셋
		}
	}, [themeAdditionalParams, themeBaseParams, activeCommonParams, orientation, goToIndex]);

	// 인디케이터 위치 계산
	const { indicatorLeft, indicatorTop } = useIndicatorPosition({
		panelRef,
		carouselRef,
		orientation,
		isExpanded,
		currentStartIndex,
		allParamsLength: allParams.length,
	});

	// 2행일 때 상단/하단 분할
	const [topRowCount] = shouldUseTwoRowsLayout ? getRowSplit(totalParamsCount) : [totalParamsCount, 0];

	// 현재 표시할 파라미터들 (가로 모드용)
	const currentParams = getCurrentParams();

	// 인디케이터 표시 지연: 패널 애니메이션이 완료된 후 표시 (0.6초 후)
	useEffect(() => {
		if (isExpanded && orientation === 'horizontal' && allParams.length > 0) {
			// 이미 인디케이터가 표시되어 있으면 유지 (파라미터 추가 시에도 사라지지 않도록)
			if (shouldShowIndicator) {
				return;
			}
			// 패널 애니메이션 완료 후 인디케이터 표시
			const timer = setTimeout(() => {
				setShouldShowIndicator(true);
			}, PLAYER_CONSTANTS.PARAMETER.UI.INDICATOR_DELAY_MS);

			return () => {
				clearTimeout(timer);
			};
		} else {
			setShouldShowIndicator(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isExpanded, orientation]); // allParams.length는 의존성에서 제거하여 파라미터 추가 시에도 인디케이터가 유지되도록 함

	return (
		<>
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						ref={panelRef}
						layout
						className={PLAYER_CONSTANTS.STYLES.parameterPanel}
						style={{
							// 패널 자체는 가로/세로 모드 모두 동일한 위치/폭을 유지
							...getParameterPanelStyle(colors),
							paddingTop: PLAYER_CONSTANTS.PARAMETER.UI.PANEL_PADDING_TOP,
							paddingBottom: PLAYER_CONSTANTS.PARAMETER.UI.PANEL_PADDING_BOTTOM,
						}}
						initial={{
							...PLAYER_CONSTANTS.ANIMATIONS.parameterPanel.initial,
						}}
						animate={{
							...PLAYER_CONSTANTS.ANIMATIONS.parameterPanel.animate,
						}}
						exit={PLAYER_CONSTANTS.ANIMATIONS.parameterPanel.exit}
						transition={{
							...PLAYER_CONSTANTS.ANIMATIONS.parameterPanel.transition,
							layout: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
							height: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
							width: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
							...(orientation === 'vertical'
								? {
										x: {
											duration: 0,
										},
									}
								: {}),
						}}
					>
						<motion.div
							ref={contentRef}
							layout
							// 내부 컨텐츠 래퍼는 항상 패널 너비를 꽉 채운다 (가로 모드 포함)
							className="w-full mx-auto"
							style={{
								...(orientation === 'horizontal'
									? {
											display: 'flex',
											flexDirection: 'column',
										}
									: {}),
							}}
							transition={{
								layout: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
								width: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
							}}
						>
							{/* 캐러셀 파라미터 영역 (가로 모드만) */}
							{orientation === 'horizontal' && allParams.length > 0 && (
								<ParameterCarousel
									carouselRef={carouselRef}
									currentParams={currentParams}
									currentStartIndex={currentStartIndex}
									allParams={allParams}
									navigationDirectionRef={navigationDirectionRef}
									themeAdditionalParams={themeAdditionalParams}
									activeCommonParams={activeCommonParams}
									getParamValue={getParamValue}
									setParamValue={setParamValue}
									onRemoveThemeParam={onRemoveThemeParam}
									onRemoveCommonParam={onRemoveCommonParam}
									onPrev={prevParam}
									onNext={nextParam}
									currentBPM={currentBPM}
								/>
							)}

							{/* 세로 모드 또는 전체 레이아웃 컨테이너 */}
							<motion.div
								layout
								className="flex flex-col gap-3"
								style={{
									// 하단 공통 파라미터 영역과 모드 토글 버튼 영역이
									// 모드에 상관없이 동일한 폭/위치를 유지하도록 고정
									width: '100%',
									minWidth: '100%',
									paddingLeft: PLAYER_CONSTANTS.PARAMETER.UI.CONTENT_PADDING_X,
									paddingRight: PLAYER_CONSTANTS.PARAMETER.UI.CONTENT_PADDING_X,
								}}
								transition={{
									layout: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
									width: PLAYER_CONSTANTS.PARAMETER.TRANSITIONS.LAYOUT,
								}}
							>
								{/* 파라미터 그리드 (세로 모드만) */}
								{orientation === 'vertical' && (
									<ParameterGrid
										allParams={allParams}
										themeAdditionalParams={themeAdditionalParams}
										activeCommonParams={activeCommonParams}
										shouldUseTwoRowsLayout={shouldUseTwoRowsLayout}
										topRowCount={topRowCount}
										totalParamsCount={totalParamsCount}
										orientation={orientation}
										getParamValue={getParamValue}
										setParamValue={setParamValue}
										onRemoveThemeParam={onRemoveThemeParam}
										onRemoveCommonParam={onRemoveCommonParam}
										currentBPM={currentBPM}
									/>
								)}

								{/* 공통 파라미터 추가 버튼 - 항상 하단에 배치 */}
								<ParameterButtons
									availableCommonParams={availableCommonParams}
									onAddCommonParam={handleAddCommonParam}
									orientation={orientation}
								/>

								{/* 모드 토글 버튼 및 적용하기 버튼 */}
								<ParameterModeToggle
									orientation={orientation}
									onToggle={() => setParameterPanelOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
									onApply={onApply}
								/>
							</motion.div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* 인디케이터 (가장 바깥쪽 패널 밖의 공중에 떠 있게) */}
			<ParameterIndicatorWrapper
				shouldShowIndicator={shouldShowIndicator}
				indicatorLeft={indicatorLeft}
				indicatorTop={indicatorTop}
				allParams={allParams}
				currentStartIndex={currentStartIndex}
				visibleCount={visibleCount}
				onIndicatorClick={goToIndex}
			/>
		</>
	);
};
