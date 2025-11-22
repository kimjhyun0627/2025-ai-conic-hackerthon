const createSharedAudioElement = () => {
	const audio = new Audio();
	audio.preload = 'auto';
	audio.crossOrigin = 'anonymous';
	audio.dataset.trackId = '';
	return audio;
};

const sharedAudioElement = createSharedAudioElement();

export const getSharedAudioElement = () => sharedAudioElement;
