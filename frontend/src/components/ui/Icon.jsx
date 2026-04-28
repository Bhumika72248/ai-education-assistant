import React from "react";

const Svg = ({ children, size = 20, className = "", title = null }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden={title ? "false" : "true"}
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

export function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 10.5L12 4l9 6.5" />
      <path d="M9 21V12h6v9" />
    </Svg>
  );
}

export function StudentIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 14c3 0 5-1.5 5-4.5S15 5 12 5 7 6.5 7 9.5 9 14 12 14z" />
      <path d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1" />
    </Svg>
  );
}

export function CoursesIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
      <path d="M16 3v4M8 3v4" />
      <path d="M3 7h18" />
    </Svg>
  );
}

export function ChatIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
  );
}

export function QuizIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 15v4a2 2 0 01-2 2H5l-4-4V7a2 2 0 012-2h14a2 2 0 012 2v8z" />
      <path d="M7 9h10M7 13h4" />
    </Svg>
  );
}

export function AnalyticsIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 3v18h18" />
      <path d="M7 13v4M12 9v8M17 5v12" />
    </Svg>
  );
}

export function AssignmentIcon(props) {
  return (
    <Svg {...props}>
      <path d="M7 3h10l4 4v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path d="M8 7h8M8 11h8" />
    </Svg>
  );
}

export function StopwatchIcon(props) {
  return (
    <Svg {...props}>
      <path d="M9 2h6M12 6v6" />
      <circle cx="12" cy="14" r="6" />
    </Svg>
  );
}

export function CalendarIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Svg>
  );
}

export function PlayIcon(props) {
  return (
    <Svg {...props}>
      <path d="M5 3v18l15-9L5 3z" />
    </Svg>
  );
}

export function NotesIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 15v4a2 2 0 01-2 2H7l-4-4V5a2 2 0 012-2h10" />
      <path d="M7 7h10M7 11h6" />
    </Svg>
  );
}

export function ScratchIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2 22l4-4 10-10 4-4 2 2-4 4-10 10-4 4H2z" />
    </Svg>
  );
}

export function FileIcon(props) {
  return (
    <Svg {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </Svg>
  );
}

export function BoltIcon(props) {
  return (
    <Svg {...props}>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </Svg>
  );
}

export function TrophyIcon(props) {
  return (
    <Svg {...props}>
      <path d="M8 21h8M12 17v4M3 7h2a5 5 0 005 5h4a5 5 0 005-5h2" />
      <path d="M6 3v4M18 3v4" />
    </Svg>
  );
}

export function FireIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 2s4 3 4 7a4 4 0 11-8 0c0-4 4-7 4-7z" />
      <path d="M8 14s1-2 4-2 4 2 4 2" />
    </Svg>
  );
}

export function BotIcon(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <path d="M8 7V5a4 4 0 018 0v2" />
      <path d="M8 13h.01M16 13h.01" />
    </Svg>
  );
}

export function MessageIcon(props) {
  return (
    <Svg {...props}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
  );
}

export function CheckIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

export function XIcon(props) {
  return (
    <Svg {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

export default Svg;
