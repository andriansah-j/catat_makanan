import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Image as ImageIcon } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { parseReceiptText } from '../utils/ocrParser';

export default function ReceiptUploader({ onOcrComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processImage = async (file) => {
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        file,
        'eng+ind', // Support English and Indonesian
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.floor(m.progress * 100));
            }
          }
        }
      );
      
      const text = result.data.text;
      const parsedData = parseReceiptText(text);
      
      onOcrComplete({
        image: objectUrl,
        rawText: text,
        ...parsedData
      });
      
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try again or enter details manually.');
      onOcrComplete({
        image: objectUrl,
        rawText: '',
        date: new Date().toLocaleDateString(),
        total: '',
        items: ''
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processImage(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel mb-8">
      <h2 className="text-center mb-6">Upload or Take Photo of Receipt</h2>
      
      {!isProcessing && !previewUrl && (
        <div 
          className={`uploader-area ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="file-input" 
            accept="image/*" 
            capture="environment" // Hint for mobile to use camera
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <div className="flex flex-col items-center justify-center">
            <UploadCloud className="uploader-icon" />
            <p className="text-lg font-medium mb-2">Drag and drop your receipt here</p>
            <p className="text-muted mb-4">or click to browse/take photo</p>
            <div className="flex gap-4">
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={18} /> Browse File
              </button>
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                <Camera size={18} /> Take Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {(isProcessing || previewUrl) && (
        <div className="flex flex-col items-center text-center">
          <div className="image-preview-container mb-6">
            {previewUrl && <img src={previewUrl} alt="Receipt preview" className="image-preview" />}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-white text-xl">Scanning Receipt...</h3>
                <p className="text-white/80">{progress}% complete</p>
                <div className="w-48 h-2 bg-gray-700 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {previewUrl && !isProcessing && (
             <button className="btn btn-secondary" onClick={() => setPreviewUrl(null)}>
               Scan Another Receipt
             </button>
          )}
        </div>
      )}
    </div>
  );
}
