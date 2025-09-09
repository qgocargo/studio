"use client";

import { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

interface SignaturePadProps {
    onReady: (signaturePad: SignaturePad) => void;
}

export default function SignaturePadWrapper({ onReady }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let signaturePad: SignaturePad | undefined;
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            
            const resizeCanvas = () => {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                const context = canvas.getContext("2d");
                context?.scale(ratio, ratio);
                signaturePad?.clear(); // Clear the signature if the canvas is resized
            };

            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();

            signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgb(255, 255, 255)'
            });
            onReady(signaturePad);

            return () => {
                window.removeEventListener("resize", resizeCanvas);
                signaturePad?.off();
            };
        }
    }, [onReady]);

    return (
        <div className="relative w-full h-48 mt-1">
            <canvas
                ref={canvasRef}
                className="signature-pad-canvas absolute top-0 left-0 w-full h-full"
            ></canvas>
        </div>
    );
}
