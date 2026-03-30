"use client";

import Image from "next/image";

export const CodePreview = () => {
    return (
        <div className="relative mx-auto w-full lg:ml-auto lg:mr-0">
            {/* Removed max-w constraints to let it fill the grid column */}

            {/* Background Glow Effect */}
            {/* Background Glow Effect Removed */}

            {/* Main Image using Chatbox.svg */}
            <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Image
                    src="/Chatbox.svg"
                    alt="Code Editor and AI Assistant Interface"
                    width={800}
                    height={800}
                    className="w-full h-auto drop-shadow-2xl scale-110 lg:scale-125"
                    priority
                />
            </div>
        </div>
    );
};
