import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from '../../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js?worker';
import jsonWorker from '../../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js?worker';
import cssWorker from '../../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js?worker';
import htmlWorker from '../../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js?worker';
import tsWorker from '../../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js?worker';

type MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string) => Worker;
};

// Vite emits each worker as a same-origin production asset. Monaco's language
// services must use those constructors instead of the AMD loader's CDN files.
const globalScope = globalThis as typeof globalThis & {
  MonacoEnvironment?: MonacoEnvironment;
};

globalScope.MonacoEnvironment = {
  getWorker: (_moduleId, label) => {
    if (label === 'json') return new jsonWorker();
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker();
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker();
    if (label === 'typescript' || label === 'javascript') return new tsWorker();
    return new editorWorker();
  },
};

// Passing the bundled Monaco instance prevents @monaco-editor/loader from
// injecting its default jsDelivr AMD loader script.
loader.config({ monaco });

export function initializeMonaco() {
  return loader.init();
}
