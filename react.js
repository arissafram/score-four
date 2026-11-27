// React wrapper around mount(). Written without JSX so it needs no compile step.
import { createElement, useEffect, useRef } from 'react';
import { mount } from './app.js';

export function ScoreFour({ className, style, opponent, first, showTitle, onReady }) {
  const ref = useRef(null);
  useEffect(() => {
    const handle = mount(ref.current, { opponent, first, showTitle });
    onReady?.(handle);
    return () => handle.destroy();
    // remount only when the starting options change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opponent, first, showTitle]);
  return createElement('div', { className, style, ref });
}

export default ScoreFour;
