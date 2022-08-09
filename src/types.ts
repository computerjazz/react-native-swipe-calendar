import { ComposedGesture, GestureType } from "react-native-gesture-handler";
import { PageInterpolatorParams } from "react-native-infinite-pager";
import Animated, {
  useAnimatedStyle,
  WithSpringConfig,
} from "react-native-reanimated";
import { DEFAULT_THEME } from "./defaults";

export type OnDateSelect =
  | undefined
  | ((date: Date, options: { isSelected: boolean }) => void);

export type DayComponentType = (props: {
  date: Date;
  isInDisplayedMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}) => JSX.Element | null;

export type WeekComponentType = (props: { days: Date[] }) => JSX.Element | null;

export type MonthComponentType = (props: {
  weeks: Date[][];
  firstDayOfMonth: Date;
}) => JSX.Element | null;

export type HeaderComponentType = (props: {
  startDate: Date;
  endDate: Date;
}) => JSX.Element | null;

export type DayLabelComponentType = (props: {
  date: Date;
}) => JSX.Element | null;

export type ImperativeApiOptions = {
  animated?: boolean;
};

export type CalendarImperativeApi = {
  incrementPage: (options?: ImperativeApiOptions) => void;
  decrementPage: (options?: ImperativeApiOptions) => void;
  setPage: (date: Date, options?: ImperativeApiOptions) => void;
};

export type CalendarPageInterpolator = (
  params: CalendarPageInterpolatorParams
) => ReturnType<typeof useAnimatedStyle>;

export type CalendarProps = {
  selectedDate?: Date | null; // TODO: suppoort multiple selected dates (likely using a Set())
  onDateSelect?: OnDateSelect;
  onPageChange?: (date: Date) => void;
  currentDate?: Date;
  HeaderComponent?: HeaderComponentType;
  DayLabelComponent?: DayLabelComponentType;
  DayComponent?: DayComponentType;
  WeekComponent?: WeekComponentType;
  MonthComponent?: MonthComponentType;
  theme?: Partial<typeof DEFAULT_THEME>;
  pageBuffer?: number;
  minDate?: Date;
  maxDate?: Date;
  pageInterpolator?: CalendarPageInterpolator;
  simultaneousGestures?: (ComposedGesture | GestureType)[];
  monthAnimCallbackNode?: Animated.SharedValue<number>;
  gesturesDisabled?: boolean;
  animationConfig?: Partial<WithSpringConfig>;
  weekStartsOn?: WeekDayIndex;
  pageInterval?: PageInterval;
};

export type DayProps = {
  date: Date;
  isInDisplayedMonth: boolean; // Dates that are in months previous/after the current month, but in weeks containing dates within the current month will also display.
  isSelected: boolean;
  isToday: boolean;
  DayComponent?: DayComponentType;
  onDateSelect?: OnDateSelect;
  theme: typeof DEFAULT_THEME;
  dateFormatted: string;
};

export type DayWrapperProps = {
  isInDisplayedMonth: boolean;
  date: Date;
  dateFormatted: string;
};

export type CalendarPageInterpolatorParams = PageInterpolatorParams & {
  theme: typeof DEFAULT_THEME;
};

export type WeekDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type PageInterval = "day" | "week" | "month";
