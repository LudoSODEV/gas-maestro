declare global {
	interface Window {
		google?: {
			script?: {
				run?: any;
				history?: any;
			};
		};
		INITIAL_PARAMS?: any;
	}
}

declare const google: any;

export {};
