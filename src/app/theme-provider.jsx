import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

export { useTheme };

export function ThemeProvider(props) {
  return <NextThemesProvider {...props} />;
}
