import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { positionsFromOrder } from "@/utils/sortable-positions";
import { SortableRow } from "./sortable-row";

interface Props {
  order: string[];
  rowHeight: number;
  isEnabled: boolean;
  onReorder: (order: string[]) => void;
  renderRow: (id: string) => ReactNode;
}

/** Verticale lijst met vaste rijhoogte waarin je rijen versleept. */
export function SortableList({
  order,
  rowHeight,
  isEnabled,
  onReorder,
  renderRow,
}: Props) {
  const positions = useSharedValue(positionsFromOrder(order));
  const orderKey = order.join("|");

  // Nieuwe volgorde van buitenaf (opgeslagen, of groep weer automatisch).
  useEffect(() => {
    positions.set(positionsFromOrder(orderKey.split("|")));
  }, [orderKey, positions]);

  const handleDrop = (next: string[]) => {
    if (next.join("|") !== orderKey) {
      onReorder(next);
    }
  };

  return (
    <View style={{ height: order.length * rowHeight }}>
      {order.map((id) => (
        <SortableRow
          key={id}
          id={id}
          positions={positions}
          count={order.length}
          rowHeight={rowHeight}
          isEnabled={isEnabled}
          onDrop={handleDrop}
        >
          {renderRow(id)}
        </SortableRow>
      ))}
    </View>
  );
}
