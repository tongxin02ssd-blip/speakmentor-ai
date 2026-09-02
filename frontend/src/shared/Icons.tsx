interface IconProps {
  size?: number;
}

const iconProps = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export const SparkIcon = ({ size = 20 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="m12 3-1.25 4.25L6.5 8.5l4.25 1.25L12 14l1.25-4.25L17.5 8.5l-4.25-1.25L12 3Z" />
    <path d="m18.5 14-.7 2.3-2.3.7 2.3.7.7 2.3.7-2.3 2.3-.7-2.3-.7-.7-2.3Z" />
  </svg>
);

export const NewChatIcon = ({ size = 18 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const SendIcon = ({ size = 18 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="m21 3-7.2 18-4.1-7.7L2 9.2 21 3Z" />
    <path d="m9.7 13.3 4.1-4.1" />
  </svg>
);

export const MicIcon = ({ size = 19 }: IconProps) => (
  <svg {...iconProps(size)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" />
  </svg>
);

export const VolumeIcon = ({ size = 17 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="M11 5 6.5 9H3v6h3.5l4.5 4V5Z" />
    <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
  </svg>
);

export const StopIcon = ({ size = 15 }: IconProps) => (
  <svg {...iconProps(size)}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

export const ArrowDownIcon = ({ size = 17 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const EndSessionIcon = ({ size = 17 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="M6 3v18M6 5h11l-2.5 4L17 13H6" />
  </svg>
);

export const CloseIcon = ({ size = 18 }: IconProps) => (
  <svg {...iconProps(size)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
