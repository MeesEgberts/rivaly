import { useCallback, useRef, type RefObject } from "react";
import type {
  HostInstance,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewInstance,
} from "react-native";

const MARGIN = 16;

/**
 * Scrolt een rij in beeld wanneer die achter het cijferblok of boven de
 * rand van de lijst valt. Werkt met vensterposities, zodat rijen in
 * geneste views ook goed gaan.
 */
export function useKeepRowVisible(
  scrollRef: RefObject<ScrollViewInstance | null>,
  keypadHeight: number,
) {
  const offsetY = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetY.current = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const keepVisible = useCallback(
    (row: HostInstance) => {
      const scroll = scrollRef.current;

      if (!scroll || keypadHeight === 0) {
        return;
      }

      row.measureInWindow((_rowX, rowY, _rowWidth, rowHeight) => {
        scroll.measureInWindow((_x, scrollY, _width, scrollHeight) => {
          const visibleTop = scrollY + MARGIN;
          const visibleBottom = scrollY + scrollHeight - keypadHeight - MARGIN;
          const rowBottom = rowY + rowHeight;

          let delta = 0;

          if (rowBottom > visibleBottom) {
            delta = rowBottom - visibleBottom;
          } else if (rowY < visibleTop) {
            delta = rowY - visibleTop;
          }

          if (delta === 0) {
            return;
          }

          scroll.scrollTo({
            y: Math.max(0, offsetY.current + delta),
            animated: true,
          });
        });
      });
    },
    [scrollRef, keypadHeight],
  );

  return { onScroll, keepVisible };
}
