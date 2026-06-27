import {
  createContext,
  useContext,
  type FC,
  type ReactNode,
} from 'react';

import {
  DEFAULT_DOMINO_THEME,
  mergeDominoTheme,
  type DominoTheme,
} from './dominoTheme';

const DominoThemeContext = createContext<DominoTheme>(DEFAULT_DOMINO_THEME);

export interface DominoThemeProviderProps {
  theme?: DominoTheme;
  children: ReactNode;
}

export const DominoThemeProvider: FC<DominoThemeProviderProps> = ({
  theme,
  children,
}) => {
  const parent = useContext(DominoThemeContext);
  const resolved = mergeDominoTheme(parent, theme);

  return (
    <DominoThemeContext.Provider value={resolved}>
      {children}
    </DominoThemeContext.Provider>
  );
};

export function useDominoTheme(override?: DominoTheme): DominoTheme {
  const fromContext = useContext(DominoThemeContext);
  return mergeDominoTheme(fromContext, override);
}
