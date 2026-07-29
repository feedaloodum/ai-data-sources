import type { SVGProps } from 'react';
import litellmLogoUrl from '../assets/logos/litellm.webp';

// Local brand marks for vendors Capra ships no logo for (OpenAI, LiteLLM,
// Kong). Vector marks mirror Capra's logo API: a `size` prop mapped to the same
// `--cds-dimension-icon-*` tokens, with `currentColor` fills so they adapt to
// the active light/dark theme. LiteLLM ships no vector logo, so it uses its
// raster brand mark via <img> — it renders at the same size but does not
// recolor for dark mode.

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_VAR: Record<LogoSize, string> = {
  xs: 'var(--cds-dimension-icon-xs)',
  sm: 'var(--cds-dimension-icon-sm)',
  md: 'var(--cds-dimension-icon-md)',
  lg: 'var(--cds-dimension-icon-lg)',
  xl: 'var(--cds-dimension-icon-xl)',
};

interface CustomLogoProps extends Omit<SVGProps<SVGSVGElement>, 'className'> {
  size?: LogoSize;
}

/** Builds a Capra-compatible logo component from a viewBox + path children. */
function createLogo(viewBox: string, children: React.ReactNode) {
  return function Logo({ size = 'md', ...props }: CustomLogoProps) {
    const dimension = SIZE_VAR[size] ?? SIZE_VAR.md;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        fill="currentColor"
        width={dimension}
        height={dimension}
        style={{ width: dimension, height: dimension }}
        aria-hidden
        focusable={false}
        {...props}
      >
        {children}
      </svg>
    );
  };
}

/** Builds a Capra-compatible logo component from a raster image URL. */
function createRasterLogo(src: string, alt: string) {
  return function Logo({ size = 'md' }: { size?: LogoSize }) {
    const dimension = SIZE_VAR[size] ?? SIZE_VAR.md;
    return (
      <img
        src={src}
        alt={alt}
        aria-hidden
        style={{ width: dimension, height: dimension, objectFit: 'contain' }}
      />
    );
  };
}

// OpenAI blossom glyph.
export const OpenAiLogo = createLogo(
  '0 0 24 24',
  <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 22.03a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />,
);

// LiteLLM ships no vector logo, so use its raster brand mark (the bullet-train
// symbol from litellm.ai). Does not recolor for dark mode.
export const LiteLlmLogo = createRasterLogo(litellmLogoUrl, 'LiteLLM');

// Kong official logomark (konghq.com brand assets, viewBox 0 0 153 137).
export const KongLogo = createLogo(
  '0 0 153 137',
  <>
    <path d="M50.5,112.9l-3.7,4.7,8.4,13.2-.9,6.1h35.6l2.5-6.1-14.3-17.9h-27.6Z" />
    <path d="M69.9,32.6l-12.9,22.7,62.9,74.8-1.8,6.9h28.8l5.2-24.3L84.9,32.5h-15Z" />
    <path d="M78.5,15.5l-6.1,11.3h15.2l26.1,31.2,15.5-12.8v-8.1l-5.4-7.6,4-4.2L96.7.6l-18.2,14.9Z" />
    <path d="M31.7,78.7h-8.5L.8,107.3v29.6h24l4.2-5.5,18.5-24.1h26.8l8.3-12.7-29.1-34.7-21.9,18.9Z" />
  </>,
);
