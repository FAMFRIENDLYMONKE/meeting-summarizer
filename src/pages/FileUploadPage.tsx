import React from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import type { FileUploadState } from "../types/types";

const FileUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = React.useState<FileUploadState>({
    file: null,
    text: null,
    error: null,
  });

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const text = await file.text();
        setState({ file, text, error: null });
        navigate("/prompt", { state: { text } });
      } catch (error) {
        setState((prev) => ({ ...prev, error: "Error reading file" }));
      }
    },
    [navigate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"] },
    multiple: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Meeting Summarizer
          </h1>
          <p className="text-lg text-gray-600">
            Upload your meeting transcript and get an AI-powered summary
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md
            ${
              isDragActive
                ? "border-black bg-gray-50 scale-[1.02]"
                : "border-gray-300 hover:border-black"
            }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-xl font-medium text-gray-900 mb-1">
                {isDragActive
                  ? "Drop your file here"
                  : "Drop your file here, or click to browse"}
              </p>
              <p className="text-sm text-gray-500">Supports .txt files</p>
            </div>
          </div>
          {state.file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg inline-flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-600">{state.file.name}</span>
            </div>
          )}
          {state.error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-600">
              <p className="text-sm">{state.error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Your file will be processed securely and never stored permanently
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
