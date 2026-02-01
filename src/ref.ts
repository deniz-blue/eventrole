// import { injectIntoGlobalHook, performReactRefresh } from "react-refresh/runtime";

// injectIntoGlobalHook(globalThis);
// globalThis.$RefreshReg$ = () => { };
// globalThis.$RefreshSig$ = () => () => { };

// globalThis.__REACT_REGISTRY__ = {};
// globalThis.$ReactWrap$ = (name: string, id: any, value: any) => {
// 	globalThis.__REACT_REGISTRY__[`${id}_${name}`] = { name, value };
// 	return value;
// }

declare global {
	var $RefreshReg$: (type: any, id: string) => void;
	var $RefreshSig$: () => (type: any) => any;
	// var $ReactWrap$: (name: string, id: any, value: any) => any;
	// var __REACT_REGISTRY__: Record<any, any>;
}

export const reactRefresh = () => {
	// performReactRefresh();
}
