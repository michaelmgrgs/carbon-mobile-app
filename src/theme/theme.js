// Carbon Gym brand theme — derived from carbon-logo.png
export const colors = {
  black: '#141514',
  charcoal: '#202221',
  surface: '#1C1D1C',
  surfaceElevated: '#26282A',
  white: '#FFFFFF',
  offWhite: '#F3F3F3',
  red: '#D6362F',
  redDark: '#902825',
  redGlow: '#FF5A50',
  gray: '#8A8D90',
  grayLine: '#33353500',
  border: '#2E302F',
  success: '#3BB273',
  warning: '#E8B339',
  danger: '#E8483D',
};

export const gradients = {
  hero: ['#141514', '#232423', '#141514'],
  redFade: ['#D6362F', '#902825'],
};

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    black: 'Inter_900Black',
    display: 'Anton_400Regular', // bold condensed all-caps headline font
  },
  h1: { fontSize: 32, letterSpacing: -0.5 },
  h2: { fontSize: 24, letterSpacing: -0.3 },
  h3: { fontSize: 18 },
  body: { fontSize: 15 },
  small: { fontSize: 13 },
  tiny: { fontSize: 11, letterSpacing: 0.5 },
  display: { fontFamily: 'Anton_400Regular', letterSpacing: 0.5 }, // use on big titles/headlines
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = (n) => n * 4;

export default { colors, gradients, typography, radius, spacing };
