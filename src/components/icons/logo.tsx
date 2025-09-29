
export function Logo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M15.5 8.5c-.5-1-1.5-1.5-3-1.5-1.5 0-2.5.5-3 1.5" />
            <path d="M12 15.5c-2 0-2.5-1.5-2.5-1.5" />
            <path d="M12 15.5c2 0 2.5-1.5 2.5-1.5" />
            <path d="M18 12h.01" />
            <path d="M6 12h.01" />
        </svg>
    )
}
