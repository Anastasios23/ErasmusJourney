import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

export const ErasmusIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <circle cx="12" cy="12" r="10" fill="#003399" />
    <g fill="#FFD700">
      <circle cx="12" cy="6" r="1" />
      <circle cx="16" cy="8" r="0.8" />
      <circle cx="18" cy="12" r="0.8" />
      <circle cx="16" cy="16" r="0.8" />
      <circle cx="12" cy="18" r="1" />
      <circle cx="8" cy="16" r="0.8" />
      <circle cx="6" cy="12" r="0.8" />
      <circle cx="8" cy="8" r="0.8" />
    </g>
    <text
      x="12"
      y="13"
      textAnchor="middle"
      fontSize="6"
      fill="white"
      fontWeight="bold"
    >
      E
    </text>
  </svg>
);

export const CyprusIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M4 8c2 0 4 1 6 1s4-1 6-1 4 1 6 2v6c-2-1-4-2-6-2s-4 1-6 1-4-1-6-1-4 1-6 2V10c2-1 4-2 6-2z"
      fill="#CD7F32"
      opacity="0.8"
    />
    <path
      d="M3 12c0-2 2-4 5-4s5 2 5 4v4c0 2-2 4-5 4s-5-2-5-4v-4z"
      fill="#20B2AA"
      opacity="0.6"
    />
    <circle cx="18" cy="10" r="2" fill="#FFD700" opacity="0.8" />
  </svg>
);

export const StudyAbroadIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <rect
      x="3"
      y="8"
      width="16"
      height="12"
      rx="1"
      fill="#003399"
      opacity="0.8"
    />
    <rect x="5" y="10" width="12" height="1" fill="white" />
    <rect x="5" y="12" width="8" height="1" fill="white" />
    <rect x="5" y="14" width="10" height="1" fill="white" />
    <path d="M14 4l6 2-6 2-6-2 6-2z" fill="#FFD700" />
    <path
      d="M20 6c0 2-2 4-6 4s-6-2-6-4"
      stroke="#CD7F32"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const UniversityIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path d="M12 3l8 4v2l-8 4-8-4V7l8-4z" fill="#003399" />
    <rect x="4" y="11" width="2" height="8" fill="#CD7F32" />
    <rect x="10" y="11" width="2" height="8" fill="#CD7F32" />
    <rect x="16" y="11" width="2" height="8" fill="#CD7F32" />
    <rect x="18" y="11" width="2" height="8" fill="#CD7F32" />
    <rect x="3" y="19" width="18" height="2" fill="#20B2AA" />
  </svg>
);

export const ExchangeIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="#003399"
      strokeWidth="2"
    />
    <path d="M8 8l8 8m0-8l-8 8" stroke="#FFD700" strokeWidth="2" />
    <circle cx="6" cy="6" r="2" fill="#CD7F32" />
    <circle cx="18" cy="18" r="2" fill="#20B2AA" />
  </svg>
);

export const DestinationIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <circle cx="12" cy="12" r="8" fill="#20B2AA" opacity="0.3" />
    <path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill="#003399"
    />
    <circle cx="12" cy="9" r="2.5" fill="#FFD700" />
  </svg>
);

export const JourneyIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M3 12c0-1 1-2 2-2h14c1 0 2 1 2 2v6c0 1-1 2-2 2H5c-1 0-2-1-2-2v-6z"
      fill="#003399"
      opacity="0.8"
    />
    <path d="M8 6c0-1 1-2 2-2h4c1 0 2 1 2 2v4H8V6z" fill="#FFD700" />
    <circle cx="6" cy="15" r="2" fill="#CD7F32" />
    <circle cx="18" cy="15" r="2" fill="#CD7F32" />
    <path
      d="M2 8c2 0 4 2 6 2s4-2 6-2 4 2 6 2"
      stroke="#20B2AA"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);
