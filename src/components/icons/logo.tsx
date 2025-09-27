
export function Logo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle cx="20" cy="20" r="20" className="fill-primary" />
            <path
                d="M12 14H18V26H22V14H28"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
