import { Platform } from "react-native";
import { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { CalendarPageInterpolatorParams } from "./types";

const DEFAULT_FONT_FAMILY =
  Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif";
const DEFAULT_FONT_COLOR_ACTIVE = "black";
const DEFAULT_FONT_COLOR_INACTIVE = "gray";

type TextTransform = "uppercase" | "lowercase" | "capitalize" | "none";

export const DEFAULT_THEME = {
  todayIndicatorDotColor: "tomato",
  selectedDayBackgroundColor: "rgba(0, 0, 255, 0.25)",
  selectedDayFontColor: DEFAULT_FONT_COLOR_ACTIVE,

  headerFontFamily: DEFAULT_FONT_FAMILY,
  headerFontColor: DEFAULT_FONT_COLOR_ACTIVE,
  headerFontSize: 24,
  headerTextTransform: "capitalize" as TextTransform,
  headerDateFormat: "MMMM yyyy",

  dayLabelFontFamily: DEFAULT_FONT_FAMILY,
  dayLabelColor: DEFAULT_FONT_COLOR_ACTIVE,
  dayLabelFontSize: 12,
  dayLabelTextTransform: "uppercase" as TextTransform,
  dayLabelDateFormat: "EEEEEE",

  dayFontFamily: DEFAULT_FONT_FAMILY,
  dayFontColor: DEFAULT_FONT_COLOR_ACTIVE,
  dayInactiveFontColor: DEFAULT_FONT_COLOR_INACTIVE,
  daySelectedFontColor: DEFAULT_FONT_COLOR_ACTIVE,
  dayFontSize: 12,

  inactiveOpacity: 1,
};

export function defaultPageInterpolator({
  focusAnim,
  theme,
  pageWidth,
}: CalendarPageInterpolatorParams): ReturnType<typeof useAnimatedStyle> {
  "worklet";
  return {
    transform: [
      {
        translateX: interpolate(
          focusAnim.value,
          [-1, 0, 1],
          [-pageWidth.value, 0, pageWidth.value]
        ),
      },
    ],
    opacity: interpolate(
      focusAnim.value,
      [-1, 0, 1],
      [theme.inactiveOpacity, 1, theme.inactiveOpacity]
    ),
  };
}
