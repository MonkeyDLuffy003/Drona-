import React from 'react';

interface ChessPieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // Crisp modern SVG vector paths for chess pieces
  // Light pieces: warm pearl white (#f8fafc) with slate-800 accents and subtle golden rim
  // Dark pieces: deep slate-900 (#0f172a) with silver-gray accents
  const fill = isWhite ? '#ffffff' : '#0f172a';
  const stroke = isWhite ? '#1e293b' : '#94a3b8';
  const innerFill = isWhite ? '#e2e8f0' : '#1e293b';

  switch (type) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isWhite && <circle cx="22.5" cy="13" r="2.5" fill="#ffffff" opacity="0.6" />}
        </svg>
      );

    case 'n':
      return isWhite ? (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 0.3)"
          >
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
              fill="#ffffff"
              stroke="#1e293b"
            />
            <path
              d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
              fill="#ffffff"
              stroke="#1e293b"
            />
            <circle cx="9.2" cy="25.5" r="1.1" fill="#1e293b" stroke="none" />
            <path
              d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z"
              transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
              fill="#1e293b"
              stroke="#1e293b"
            />
          </g>
        </svg>
      ) : (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill="none"
            fillRule="evenodd"
            stroke="#0f172a"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 0.3)"
          >
            <path
              d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
              fill="#1e293b"
              stroke="#0f172a"
            />
            <path
              d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
              fill="#1e293b"
              stroke="#0f172a"
            />
            <circle cx="9.2" cy="25.5" r="1.1" fill="#f8fafc" stroke="none" />
            <path
              d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z"
              transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)"
              fill="#f8fafc"
              stroke="#f8fafc"
            />
            <path
              d="M 24.55,10.4 L 24.1,11.85 L 24.6,12 C 27.75,13 30.25,14.49 32.5,18.75 C 34.75,23.01 35.75,29.06 35.25,39 L 35.2,39.5 L 37.45,39.5 L 37.5,39 C 38,28.94 36.62,22.15 34.25,17.66 C 31.88,13.17 28.46,11.02 25.06,10.5 L 24.55,10.4 z"
              fill="#94a3b8"
              stroke="none"
            />
          </g>
        </svg>
      );

    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
            <path d="M 12,36 C 12,32 11,27 15,19 C 13,17 13,15 15,13 C 14,10 16,8 19,8 C 21,8 21.5,9 22.5,9 C 23.5,9 24,8 26,8 C 29,8 31,10 30,13 C 32,15 32,17 30,19 C 34,27 33,32 33,36 z" />
            <circle cx="22.5" cy="5.5" r="2.5" />
          </g>
          <path
            d="m 17.5,26 c 0,0 2.5,2.5 5,2.5 2.5,0 5,-2.5 5,-2.5"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="m 22.5,10 v 6 M 20,13 h 5"
            stroke={stroke}
            strokeWidth="1.2"
          />
        </svg>
      );

    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z" />
            <path d="M 12,32 L 14,14 L 31,14 L 33,32 z" />
          </g>
          <path
            d="m 14,17 h 17"
            stroke={stroke}
            strokeWidth="1"
          />
          <path
            d="m 14,29 h 17"
            stroke={stroke}
            strokeWidth="1"
          />
        </svg>
      );

    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,10 L 14,25 L 7,14 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
          <circle cx="22.5" cy="28.5" r="2.5" fill={innerFill} stroke={stroke} strokeWidth="1" />
        </svg>
      );

    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M 22.5,11.5 L 22.5,5.5 M 19.5,8.5 L 25.5,8.5" stroke={stroke} strokeWidth="2" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,34 32,32 30,30 C 26,27 24,25 24,20 C 25.5,18 26.5,16 26.5,13.5 C 26.5,11.5 24.5,10 22.5,10 C 20.5,10 18.5,11.5 18.5,13.5 C 18.5,16 19.5,18 21,20 C 21,25 19,27 15,30 C 13,32 11.5,34 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" fill="none" />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" fill="none" />
            <path d="M 11.5,37 C 17,34 28,34 33.5,37" fill="none" />
          </g>
        </svg>
      );
  }
};
