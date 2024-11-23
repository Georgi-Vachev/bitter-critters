import React, { useEffect, useRef, useState } from 'react';
import { PixiApp } from '../pixi/PixiApp';

interface PixiContainerProps {
    visible: boolean;
}

const PixiContainer: React.FC<PixiContainerProps> = ({ visible }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pixiApp, setPixiApp] = useState<PixiApp | null>(null);

    // Initialize PIXI app once
    useEffect(() => {
        const app = new PixiApp();
        setPixiApp(app);

        return () => {
            // Cleanup PIXI app on unmount
            if (pixiApp) {
                pixiApp.destroy();
            }
        };
    }, []);

    // Handle app visibility
    useEffect(() => {
        if (pixiApp) {
            if (visible) {
                pixiApp
                    .init({ width: 2560, height: 1440, backgroundColor: 0x484848 })
                    .then(() => pixiApp.attach(containerRef.current))
                    .catch((err) => console.error('Failed to initialize PIXI app:', err));
            } else {
                pixiApp.detach(containerRef.current);
            }
        }
    }, [visible, pixiApp]);

    return <div ref={containerRef} style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
    }} />;
};

export default PixiContainer;
