import { useEffect, useRef } from "react";

interface AutoSignatureGeneratorProps {
  signatureText: string;
  onSignatureGenerated: (dataUrl: string) => void;
}

const AutoSignatureGenerator: React.FC<AutoSignatureGeneratorProps> = ({
  signatureText,
  onSignatureGenerated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && signatureText) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 300;
        canvas.height = 100;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Render the signature using a cursive font
        ctx.font = "48px Pacifico, cursive";
        ctx.fillStyle = "black";
        ctx.fillText(signatureText, 10, 60);
        const dataUrl = canvas.toDataURL();
        onSignatureGenerated(dataUrl);
      }
    }
  }, [signatureText, onSignatureGenerated]);

  return <canvas ref={canvasRef} style={{ display: "none" }} />;
};

export default AutoSignatureGenerator;
