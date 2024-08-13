'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { uploadDocument } from '../lib/api';

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [storageOption, setStorageOption] = useState('cloud');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storageOption', storageOption);

      //await api.post('/document', formData);
      await uploadDocument(file, { storageOption });
      router.push('/dashboard');
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Upload Your Document
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Securely upload your documents to SignaTrust
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-300">
                Select Document
              </label>
              <input
                type="file"
                id="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="mt-1 block w-full text-sm text-gray-300 border-gray-600 bg-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="storage-option" className="block text-sm font-medium text-gray-300">
                Choose Storage Option
              </label>
              <select
                id="storage-option"
                value={storageOption}
                onChange={(e) => setStorageOption(e.target.value)}
                className="mt-1 block w-full text-sm text-gray-300 border-gray-600 bg-gray-700 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="cloud">Cloud Storage</option>
                <option value="local">Local Storage</option>
                <option value="ipfs">IPFS (paid)</option>
              </select>
            </div>
            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                {isLoading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
