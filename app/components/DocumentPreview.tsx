import React, { useState, useRef } from "react";

interface DocumentPreviewProps {
  fileUrl: string;
  onSignatureFieldPlaced: (coords: { x: number; y: number }) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileUrl,
  onSignatureFieldPlaced,
}) => {
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMarker({ x, y });
      onSignatureFieldPlaced({ x, y });
    }
  };

  return (
    <div className="relative" ref={containerRef} onClick={handleTap}>
      <img src={fileUrl} alt="Document Preview" className="w-full h-auto" />
      {marker && (
        <div
          style={{
            position: "absolute",
            top: marker.y - 15,
            left: marker.x - 15,
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 123, 255, 0.5)",
            border: "2px solid #007bff",
          }}
        />
      )}
    </div>
  );
};

export default DocumentPreview;
