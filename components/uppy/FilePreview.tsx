import React, { useState, useEffect } from 'react';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArchiveIcon from '@mui/icons-material/Archive';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { CLOSE_ICON } from '@config/Header/image.config';

interface FilePreviewProps {
  file: File;
  onRemove?: ((file: File) => void) | ((fileId: string) => void);
  style?: React.CSSProperties;
  fileId?: string; // Optional fileId for the new signature
}

// File Preview Card Component
const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove, style, fileId }) => {
    const [preview, setPreview] = useState<string | null>(null);
    
    useEffect(() => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }, [file]);
  
    const getFileIcon = (type: string) => {
      if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
      if (type.startsWith('video/')) return <VideoFileIcon className="w-8 h-8 text-red-500" />;
      if (type.startsWith('audio/')) return <AudioFileIcon className="w-8 h-8 text-green-500" />;
      if (type.includes('pdf')) return <PictureAsPdfIcon className="w-8 h-8 text-red-600" />;
      if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <ArchiveIcon className="w-8 h-8 text-orange-500" />;
      if (type.includes('document') || type.includes('text')) return <DescriptionIcon className="w-8 h-8 text-purple-500" />;
      return <InsertDriveFileIcon className="w-8 h-8 text-gray-500" />;
    };
  
    const getFileExtension = (filename: string) => {
      return filename.split('.').pop()?.toLowerCase();
    };

    const handleRemove = () => {
      if (!onRemove) return;
      
      // Check if onRemove expects a fileId (new signature) or file (old signature)
      if (fileId) {
        (onRemove as (fileId: string) => void)(fileId);
      } else {
        (onRemove as (file: File) => void)(file);
      }
    };
  
    const renderPreview = () => {
      const fileType = getFileExtension(file.name);
      
      if (preview && file.type.startsWith('image/')) {
        return (
          <img 
            src={preview} 
            alt={file.name} 
            className="w-full h-full object-cover rounded-lg"
          />
        );
      } else if (fileType === 'pdf') {
        return (
          <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
            <PictureAsPdfIcon className="w-8 h-8 text-red-600" />
          </div>
        );
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        return (
          <div className="w-full h-full flex items-center justify-center bg-green-50 rounded-lg">
            <div className="text-green-600 font-bold text-xs">XLS</div>
          </div>
        );
      } else if (fileType === 'doc' || fileType === 'docx') {
        return (
          <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-lg">
            <div className="text-blue-600 font-bold text-xs">DOC</div>
          </div>
        );
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
            {getFileIcon(file.type)}
          </div>
        );
      }
    };
  
    return (
      <div className="relative group" style={style}>
        <div className="w-20 h-20 overflow-hidden bg-white hover:border-blue-400 transition-colors">
          {renderPreview()}

          <div className="absolute bottom-[-8px] right-[-8px] justify-center rounded-full p-1">
              <img onClick={handleRemove} src={CLOSE_ICON} alt="remove" className="w-4 h-4 text-red-600 cursor-pointer" />
          </div>
          
          {/* Overlay with actions */}
        </div>
        
        {/* File name */}
        {/* <div className="mt-1 text-xs text-gray-600 truncate w-20" title={file.name}>
          {file.name}
        </div> */}
      </div>
    );
  };

export default FilePreview;