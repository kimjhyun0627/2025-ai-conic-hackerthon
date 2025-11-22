CenterImage 옵션 리드미

1. 테마 기본 배경 이미지 + 비트 싱크 글로우
   기본 배경: musicThemes.ts의 backgroundImage 사용으로 테마 아이덴티티 유지.
   오디오 연동: Web Audio AnalyserNode의 time domain data로 킥/피크 감지 후 글로우 레이어의 scale, opacity, blur에 매핑.
   그래픽 구현: CenterImage 주변 투명 PNG/SVG 레이어나 CSS ::after에 box-shadow/drop-shadow 펄싱. 테마 색상 팔레트 적용.
   UX 효과: 익숙한 이미지를 유지하면서도 음악과 함께 맥동해 화면이 살아 있는 느낌 제공.
2. 주파수 분석 파형 + 오디오 지표
   파형: getByteTimeDomainData 데이터를 smoothing 후 Canvas/SVG 곡선으로 렌더링, 테마 컬러 그라디언트 적용.
   오디오 지표: RMS, BPM 추정, spectral centroid 등 계산해 미니 게이지/텍스트 HUD로 제공. 파라미터(tempo, energy) 대비 실제값 비교도 가능.
   UI 구성: 파형을 배경 레이어로, 지표 HUD를 우측 하단 등 반투명 패널로 배치.
   UX 효과: 음악 흐름을 실시간으로 보는 경험 + 핵심 수치를 즉시 피드백 받아 제작/감상 활용도 증가.
3. 테마 팔레트 + 오디오 기반 제너레이티브 비주얼
   팔레트: 테마별 대표 색 2~3개로 원형/멀티 레이어 그라디언트 생성. CSS 그라디언트 또는 WebGL 캔버스 사용.
   제너레이티브 레이어: 비트·주파수 데이터로 입자, 라인, 네온 스트로크, 노이즈 필드를 변형. 예) 고주파 증가 시 입자 속도 상승.
   기술 스택: Canvas 2D, WebGL(Three.js) 또는 SVG 애니메이션. requestAnimationFrame 주기 조절로 성능 제어.
   UX 효과: 테마 색감은 유지하면서 음악 데이터가 만드는 실시간 “쇼”를 제공해 플레이어 자체가 비주얼라이저처럼 느껴짐.
4. 대역별 컬러 스플릿
   데이터 버킷: getByteFrequencyData를 저(20–250Hz)/중(250–4kHz)/고(4kHz+) 세 구간으로 나눠 평균값 계산.
   비주얼 구성: 각 버킷을 대응 색상 레이어에 매핑해 면적·위치·스큐·alpha를 변조. 저주파↑ → 하단 레이어 확장, 고주파↑ → 상단 얇은 레이어 길어짐 등.
   구현 방식: CSS clip-path + transform 애니메이션, 또는 Canvas에서 반투명 폴리곤 3개를 easing 처리.
   UX 효과: 음악 톤 변화가 즉시 색감으로 반영되어 “밝아짐/어두워짐” 같은 감정 변화를 직관적으로 전달, 정적 이미지보다 감정선 표현력 향상.
