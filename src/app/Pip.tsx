import { FC } from 'react';

import { DefaultPip } from './DefaultPip';
import type { PipRenderContext } from './dominoTheme';

export type PipProps = PipRenderContext;

/** @deprecated Prefer theme.renderPip or DefaultPip via DominoTheme. */
export const Pip: FC<PipRenderContext> = (ctx) => <DefaultPip ctx={ctx} />;

export default Pip;
