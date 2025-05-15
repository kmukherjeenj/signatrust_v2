import React, { useState } from "react";

interface UploadDocumentProps {
  onFileReady: (file: File) => void;
}

const UploadDocument: React.FC<UploadDocumentProps> = ({ onFileReady }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      onFileReady(selectedFile);
    }
  };

  return (
    <div className="p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Document
      </label>
      <input
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileChange}
        className="border p-2 w-full"
      />
      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Document Preview"
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
};

export default UploadDocument;
