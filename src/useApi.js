import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { holdSplash } from "@thekrystalship/krystal";
import { api } from "./api.js";

/**
 * The state of one GET, in the flags `DataState` and the page layouts take. A `path` of null asks
 * nothing and reports nothing loading. `reload` asks again. A GET with nothing to show yet holds the
 * splash, so the first page is shown once it has its answers.
 */
export function useApi(path) {
  const [state, setState] = useState({ data: null, loading: path != null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (path == null) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path).then(
      (data) => live && setState({ data, loading: false, error: null }),
      (error) => live && setState({ data: null, loading: false, error }),
    );
    return () => { live = false; };
  }, [path, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const waiting = state.loading && state.data == null;
  useLayoutEffect(() => (waiting ? holdSplash() : undefined), [waiting]);
  return { ...state, reload };
}
