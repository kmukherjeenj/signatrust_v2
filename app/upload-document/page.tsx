"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement document upload logic here
    // On success:
    router.push('/documents/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit">Upload Document</button>
    </form>
  );
}
