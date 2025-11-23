/**
 * API 요청 큐 아이템
 */
type QueueItem<T> = {
	resolve: (value: T) => void;
	reject: (error: unknown) => void;
	execute: () => Promise<T>;
	signal?: AbortSignal;
};

/**
 * API 요청 큐 시스템
 * 여러 API 요청을 순차적으로 처리하여 rate limit을 방지합니다.
 */
export class RequestQueue {
	private queue: QueueItem<unknown>[] = [];
	private isProcessing = false;

	/**
	 * 요청을 큐에 추가하고 실행을 대기합니다.
	 */
	async enqueue<T>(execute: () => Promise<T>, signal?: AbortSignal): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			// AbortSignal이 이미 abort된 경우 즉시 거부
			if (signal?.aborted) {
				reject(new DOMException('Operation aborted', 'AbortError'));
				return;
			}

			const queueItem: QueueItem<T> = {
				resolve,
				reject,
				execute,
				signal,
			};

			// AbortSignal 리스너 추가
			if (signal) {
				const onAbort = () => {
					const index = this.queue.indexOf(queueItem as QueueItem<unknown>);
					if (index !== -1) {
						this.queue.splice(index, 1);
						reject(new DOMException('Operation aborted', 'AbortError'));
					}
				};
				signal.addEventListener('abort', onAbort);
			}

			this.queue.push(queueItem as QueueItem<unknown>);
			this.processQueue();
		});
	}

	/**
	 * 큐에 있는 요청들을 순차적으로 처리합니다.
	 */
	private async processQueue() {
		if (this.isProcessing || this.queue.length === 0) {
			return;
		}

		this.isProcessing = true;

		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (!item) {
				break;
			}

			// AbortSignal이 abort된 경우 건너뛰기
			if (item.signal?.aborted) {
				item.reject(new DOMException('Operation aborted', 'AbortError'));
				continue;
			}

			try {
				const result = await item.execute();
				item.resolve(result);
			} catch (error) {
				item.reject(error);
			}
		}

		this.isProcessing = false;
	}
}
