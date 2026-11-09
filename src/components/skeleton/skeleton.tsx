import { useEffect, useState, type ReactNode } from "react";
import { Animated, StyleSheet, type ViewStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

interface Props {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Wrapper voor een skeleton: alles erin pulseert samen, rustig, zodat het
 * als één laadstaat leest. Met "Verminder beweging" staat het stil. Voor
 * schermlezers is het één element "Laden".
 */
export function Skeleton({ children, style }: Props) {
  const reduceMotion = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      style={[styles.container, style, { opacity }]}
      accessible
      accessibilityLabel="Laden"
      accessibilityRole="progressbar"
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
});
