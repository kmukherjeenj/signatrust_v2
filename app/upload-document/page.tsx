'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
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
      // Implement document upload logic here
      // On success:
      router.push('/documents/');
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-white mb-4">Why Store Documents on Your Own Drive?</h3>
          <p className="text-sm text-gray-300 mb-4">
            By storing your documents on your own drive, you retain complete control over your data. This ensures your sensitive information is kept private and secure, as it is not stored on third-party servers.
          </p>
          <h4 className="text-md font-medium text-white mb-2">Benefits:</h4>
          <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
            <li>Enhanced Privacy: Your documents are only accessible by you, preventing unauthorized access.</li>
            <li>Data Ownership: You retain full ownership of your data, with no risk of it being used without your consent.</li>
            <li>Security: Storing data on your own drive reduces the risk of data breaches associated with centralized servers.</li>
            <li>Flexibility: You can choose where and how to store your documents, using your preferred storage solutions.</li>
          </ul>
          <p className="text-sm text-gray-300 mb-4">
            Our platform integrates seamlessly with your existing storage solutions, ensuring a smooth and secure document management experience.
          </p>
          <p className="text-sm text-gray-300 mb-4">
            Remember to regularly back up your data and use strong passwords to protect your storage drive. This way, you can enjoy the benefits of self-sovereign document storage without sacrificing security or privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
