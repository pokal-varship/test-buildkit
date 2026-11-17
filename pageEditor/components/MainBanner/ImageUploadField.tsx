"use client";

import React, { useState } from 'react';
import UppyMediaUpload from '@components/uppy/UppyMediaUpload';
import Modal from '@components/dialogDrawer/modal/Modal';
import toast from 'react-hot-toast';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fileTypes?: string[];
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter image URL',
  fileTypes = ['image/*']
}) => {
  const [showUploader, setShowUploader] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (files: unknown[]) => {
    
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      
      // Try different ways to extract URL
      const fileWithResponse = uploadedFile as { 
        response?: { 
          body?: { url?: string }; 
          url?: string;
          location?: string;
          uploadURL?: string;
        }; 
        url?: string;
        data?: { url?: string };
        meta?: { url?: string };
        uploadURL?: string;
        location?: string;
      };
      
      let imageUrl = fileWithResponse.response?.location || 
                    fileWithResponse.response?.uploadURL ||
                    fileWithResponse.response?.body?.url || 
                    fileWithResponse.response?.url || 
                    fileWithResponse.uploadURL ||
                    fileWithResponse.location ||
                    fileWithResponse.url ||
                    fileWithResponse.data?.url ||
                    fileWithResponse.meta?.url;

      // Convert S3 URL to public URL if needed
      if (imageUrl && imageUrl.includes('s3.amazonaws.com')) {
        
        // For now, let's use the S3 URL directly but add some parameters
        if (!imageUrl.includes('?')) {
          imageUrl += '?v=' + Date.now(); // Add cache buster
        }
      }
      
      if (imageUrl) {
        onChange(imageUrl);
        toast.success('Image uploaded successfully!');
        
        // Force a re-render of the component
        setTimeout(() => {
          onChange(imageUrl);
        }, 100);
      } else {
        toast.error('Failed to get uploaded image URL. Please try again.');
      }
    } else {
      toast.error('No files were uploaded. Please try again.');
    }
    setShowUploader(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
    setIsUploading(true);
  };

  const handleCloseModal = () => {
    setShowUploader(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Extract supported formats from fileTypes
  const getSupportedFormats = (types: string[]): string[] => {
    const formats: string[] = [];
    
    types.forEach(type => {
      if (type === 'image/*') {
        formats.push('JPG', 'JPEG', 'PNG', 'WebP');
      } else if (type.startsWith('image/')) {
        const format = type.replace('image/', '').toUpperCase();
        formats.push(format);
      } else if (type.startsWith('.')) {
        const format = type.replace('.', '').toUpperCase();
        formats.push(format);
      }
    });
    
    // Remove duplicates and return unique formats
    return [...new Set(formats)];
  };

  const supportedFormats = getSupportedFormats(fileTypes);

  return (
    <div className="image-upload-field">
      {/* URL Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
      />
      
      {/* Upload Button - Below URL field */}
      <button
        type="button"
        onClick={() => setShowUploader(true)}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded-md hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 mb-2 flex items-center justify-center gap-2"
      >
        <img 
          src="/images/icon/upload-icon.svg" 
          alt="Upload" 
          className="w-5 h-5"
        />
        Upload Image
      </button>
      
      {/* Supported Formats */}
      <div className="text-center mb-2">
        <div className="text-center">
          <span className="text-sm text-gray-500 block mb-2">Supported formats:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {supportedFormats.map((format, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                {format}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal with UppyMediaUpload */}
      <Modal
        isOpen={showUploader}
        onClose={handleCloseModal}
        title="Upload Image"
        className="upload-image-modal w-full mx-4"
        containerClassName="items-center"
        showScrollbar={true}
      >
        <div className="p-4">
          <UppyMediaUpload
            limit={1}
            fileTypes={fileTypes}
            maxSize={50 * 1024 * 1024} // 50MB
            onUploadComplete={handleUploadComplete}
            onProgress={handleUploadProgress}
            folder="banner-images"
            quality={0.8}
            showUploadButton={true}
            inline={true}
            theme="light"
            target="banner-image-upload-modal"
            autoProceed={false}
          />
          
          {isUploading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-2">Uploading... {Math.round(uploadProgress)}%</div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Custom styles to center buttons for ImageUploadField */}
        <style>{`
          /* Override button positioning for ImageUploadField modal */
          .image-upload-field .uppy-controls-bottom-left {
            position: relative !important;
            bottom: auto !important;
            left: auto !important;
            transform: none !important;
            display: flex !important;
            gap: 16px !important;
            z-index: 10 !important;
            justify-content: center !important;
            width: 100% !important;
            margin-top: 20px !important;
            padding: 0 16px !important;
          }
          
          /* Ensure buttons are properly spaced and centered */
          .image-upload-field .uppy-controls-bottom-left button {
            min-width: 100px !important;
            justify-content: center !important;
          }
          
          /* Remove bottom padding from dashboard container to prevent overlap */
          .image-upload-field .uppy-dashboard-container.uppy-dashboard-centered {
            padding-bottom: 0 !important;
            margin-bottom: 0 !important;
          }

          .upload-image-modal{
            max-width: 42rem !important;
          }
          .uppy-dashboard-container.uppy-dashboard-centered {
            max-height: 250px !important;
          }
        `}</style>
      </Modal>
    </div>
  );
};

export default ImageUploadField; 