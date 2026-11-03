import { lazy, Suspense, type ComponentProps } from 'react';

const Editor = lazy(() => import('./Editor').then((module) => ({ default: module.Editor })));

type LazyEditorProps = ComponentProps<typeof Editor>;

export function LazyEditor(props: LazyEditorProps) {
  return (
    <Suspense fallback={
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        Loading editor…
      </div>
    }>
      <Editor {...props} />
    </Suspense>
  );
}
