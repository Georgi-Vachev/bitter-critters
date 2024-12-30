import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PixiApp from '../pixi/PixiApp';

const PixiContainer = forwardRef((_, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [pixiApp, setPixiApp] = useState<PixiApp | null>(null);

    const resetApp = () => {
        if (pixiApp) {
            pixiApp.destroy();
            setPixiApp(pixiApp);
        }

        const newApp = new PixiApp();
        setPixiApp(newApp);

        newApp
            .init({ width: 2560, height: 1440, backgroundColor: 0x484848 })
            .then(() => newApp.attach(containerRef.current))
            .catch((err) => console.error('Failed to initialize PIXI app:', err));
    };

    useImperativeHandle(ref, () => ({ resetApp }));

    useEffect(() => {
        resetApp();

        return () => {
            // Ensure cleanup happens when the component unmounts
            if (pixiApp) {
                pixiApp.destroy();
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
            }}
        />
    );
});

export default PixiContainer;
