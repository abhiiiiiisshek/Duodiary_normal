
'use client'

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="animate-fadeInUp"
            style={{ animation: 'fadeInUp 0.3s ease-in-out forwards' }}
        >
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            {children}
        </div>
    )
}
