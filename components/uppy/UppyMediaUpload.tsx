import React, { useRef, useState, useCallback, useEffect } from 'react';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import Dashboard from '@uppy/dashboard';
import ImageEditor from '@uppy/image-editor';
import Compressor from '@uppy/compressor';
import { ProgressBar } from '@uppy/react';
import CustomButton from '@components/buttons/Button';
import toast from 'react-hot-toast';

// Import Uppy styles
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import '@uppy/image-editor/dist/style.min.css';
import '@uppy/progress-bar/dist/style.min.css';
import '@uppy/status-bar/dist/style.min.css';
import { getPresignedUrl } from '@services/useS3';

// Type definitions
interface PresignedUrlResponse {
    data: Array<{
        data: {
            Method?: string;
            URL: string;
            SignedHeader?: Record<string, string[]>;
        };
    }>;
}

interface UppyMediaUploadProps {
    limit?: number;
    fileTypes?: string[];
    maxSize?: number;
    onUploadComplete?: (files: unknown[]) => void;
    beforeUpload?: (files: unknown[]) => void;
    folder?: string;
    quality?: number;
    className?: string;
    style?: React.CSSProperties;
    autoProceed?: boolean;
    showUploadButton?: boolean;
    inline?: boolean;
    theme?: 'light' | 'dark';
    target?: string;
    restrictions?: Record<string, unknown>;
    onFileAdded?: (file: unknown) => void;
    onFileRemoved?: (file: unknown) => void;
    onProgress?: (progress: number) => void;
    autoOpenFileEditor?: boolean;
    initialAspectRatio?: number;
    cropWidescreenVertical?: boolean;
    cropWidescreen?: boolean;
    cropSquare?: boolean;
    sourceDirectory?: string;
    getUploadedFiles?: (files: unknown[]) => void;
    showAddMoreButton?: boolean;
}

// Main Uppy Media Upload Component
const UppyMediaUpload: React.FC<UppyMediaUploadProps> = ({
    limit = 10,
    fileTypes = ['image/*', 'video/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
    maxSize = 100 * 1024 * 1024, // 100MB
    onUploadComplete = () => { },
    beforeUpload = () => { },
    folder = 'uploads',
    quality = 0.7,
    className = '',
    style = {},
    autoProceed = false,
    showUploadButton = true,
    inline = true,
    theme = 'light',
    target = 'uppy-dashboard',
    restrictions,
    onFileAdded,
    onFileRemoved,
    onProgress,
    autoOpenFileEditor = false,
    initialAspectRatio,
    cropWidescreenVertical = true,
    cropWidescreen = true,
    cropSquare = true,
    sourceDirectory,
    getUploadedFiles,
    // showAddMoreButton = true
}) => {
    const [uploading, setUploading] = useState(false);
    const [addedFiles, setAddedFiles] = useState(0);
    const uppyRef = useRef<Uppy | null>(null);
    const imageEditorRef = useRef(false);
    const [showButton, setShowButton] = useState(true);

    // Initialize Uppy instance
    useEffect(() => {
        // Only initialize once
        if (uppyRef.current) {
            return;
        }

        const initializeUppy = () => {
            const defaultRestrictions = {
                allowedFileTypes: fileTypes,
                maxNumberOfFiles: limit,
                maxFileSize: maxSize,
            };

            const uppy = new Uppy({
                restrictions: restrictions || defaultRestrictions,
                autoProceed: false,
                onBeforeFileAdded: (file, files) => {
                    const timestamp = Date.now();
                    const newFile = { ...file };
                    newFile.meta = {
                        ...newFile.meta,
                        seqId: Object.keys(files).length + 1,
                        key: `${folder}/${timestamp}_${file.name}`,
                        folder: folder,
                        name: `${timestamp}_${file.name}`,
                        type: file.data.type,
                    };
                    return newFile;
                },
            });

            // Add Dashboard plugin
            uppy.use(Dashboard, {
                inline: inline,
                hideUploadButton: true,
                theme: theme,
                target: `#${target}`,
                proudlyDisplayPoweredByUppy: false,
                autoOpen: autoOpenFileEditor ? 'imageEditor' : undefined,
            });

            // Add Image Editor plugin
            uppy.use(ImageEditor, {
                target: Dashboard as unknown as HTMLElement,
                actions: {
                    revert: true,
                    rotate: true,
                    granularRotate: true,
                    flip: true,
                    zoomIn: true,
                    zoomOut: true,
                    cropSquare: cropSquare,
                    cropWidescreen: cropWidescreen,
                    cropWidescreenVertical: cropWidescreenVertical,
                },
                cropperOptions: {
                    initialAspectRatio: initialAspectRatio || NaN,
                }
            });

            // Add Compressor plugin
            uppy.use(Compressor, {
                quality: quality || 0.7,
            });

            // Add AWS S3 plugin if getUploadParameters is provided
            uppy.use(AwsS3, {
                getUploadParameters: async (file: unknown) => {
                    const fileData = file as { meta: { name: string }; data: { type: string } };
                    const payloadPresignedUrl = {
                        "case":"AWS",
                        "files": [
                            {
                                "fileName": fileData.meta.name,
                                "contentType": fileData.data.type,
                                "source": sourceDirectory || "newkommerce/products",
                                "fileOverwrite": true,
                            }
                        ]
                    }
                    try {
                        const response = await getPresignedUrl(payloadPresignedUrl) as PresignedUrlResponse;
                        const presignedData = response.data[0].data;
                        
                        // Convert SignedHeader to the format expected by Uppy AWS S3 plugin
                        const headers: Record<string, string> = {};
                        if (presignedData.SignedHeader) {
                            Object.entries(presignedData.SignedHeader).forEach(([key, value]) => {
                                if (key.toLowerCase() === 'host') return; // Skip Host header
                                if (Array.isArray(value) && value.length > 0) {
                                    headers[key] = value[0];
                                }
                            });
                        }
                        
                        return {
                            method: 'PUT' as const,
                            url: presignedData.URL,
                            fields: {},
                            headers: headers,
                        }
                    } catch (error) {

                        throw error;
                    }
                },
            } as never);

            // Event listeners
            uppy.on('file-added', (file) => {

                getUploadedFiles?.(uppy.getFiles());

                if (uppy.getFiles().length > limit) {
                    uppy.removeFile(file.id);
                    toast.error(`Maximum ${limit} files allowed`);
                }

                setAddedFiles(uppy.getFiles().length);
                onFileAdded?.(file);
            });

            uppy.on('file-removed', (file) => {

                getUploadedFiles?.(uppy.getFiles());
                setAddedFiles(uppy.getFiles().length);
                onFileRemoved?.(file);
            });

            uppy.on('upload-progress', (file, progress) => {
                if (!file || !progress) return;

                const progressPercent = progress.bytesTotal ? (progress.bytesUploaded / progress.bytesTotal) * 100 : 0;

                onProgress?.(progressPercent);
            });

            uppy.on('upload-success', (file) => {
                if (!file) return;
                // Upload success handled
            });

            uppy.on('upload-error', (file) => {
                if (!file) return;
                // Error handled in UI
                toast.error(`Upload failed for ${file.name}`);
            });

            uppy.on('complete', (result) => {

                setUploading(false);

                const successfulUploads = result.successful || [];
                const uploadedFiles = successfulUploads.map((file) => ({
                    ...file
                }));

                if (uploadedFiles.length === uppy.getFiles().length) {
                    uppy.cancelAll();
                }

                if (successfulUploads.length > 0) {
                    onUploadComplete(uploadedFiles);
                }
            });

            uppy.on('file-editor:start', () => {
                imageEditorRef.current = true;
                setShowButton(false)
            });
            uppy.on('file-editor:complete', async () => {
                imageEditorRef.current = false;
                setShowButton(true)
            });
            uppy.on('file-editor:cancel', async (updatedFile) => {
                if (updatedFile?.data) {
                    imageEditorRef.current = false;
                    setShowButton(true)
                }
            });

            uppy.on('error', () => {
                // Error handled in UI
                uppy.cancelAll();
                uppy.destroy();
                onUploadComplete([]);

                toast.error('Upload failed. Please try again.');
            });

            uppyRef.current = uppy;
        };

        initializeUppy();

        return () => {
            if (uppyRef.current) {
                uppyRef.current.cancelAll();
                uppyRef.current.destroy();
                uppyRef.current = null;
            }
        };
    }, []); // Only run once on mount

    // Handle upload
    const handleUpload = async () => {
        if (!uppyRef.current) return;

        setUploading(true);
        try {
            await beforeUpload(uppyRef.current.getFiles());
            uppyRef.current.upload();
        } catch {
            // Error handled in UI
            setUploading(false);
            toast.error('Upload failed. Please try again.');
        }
    };

    // Handle reset
    const handleReset = useCallback(() => {
        if (uppyRef.current) {
            uppyRef.current.cancelAll();
            setAddedFiles(0);
        }
    }, []);

    // Handle add more files
    // const handleAddMore = useCallback(() => {
    //     console.log('Add More button clicked');
    //     if (!uppyRef.current) {
    //         console.error('Uppy instance not found');
    //         return;
    //     }
        
    //     console.log('Creating file input for additional files');
    //     // Create a temporary file input and trigger it
    //     const fileInput = document.createElement('input');
    //     fileInput.type = 'file';
    //     fileInput.multiple = true;
    //     fileInput.accept = fileTypes.join(',');
    //     fileInput.style.display = 'none';
        
    //     fileInput.onchange = (event) => {
    //         const target = event.target as HTMLInputElement;
    //         if (target.files) {
    //             const filesArray = Array.from(target.files);
    //             console.log('Files selected:', filesArray.length);
    //             filesArray.forEach(file => {
    //                 console.log('Adding file to Uppy:', file.name);
    //                 // Add files directly to Uppy
    //                 uppyRef.current?.addFile({
    //                     name: file.name,
    //                     type: file.type,
    //                     data: file,
    //                     source: 'input',
    //                     isRemote: false,
    //                 });
    //             });
    //         }
    //         // Clean up
    //         document.body.removeChild(fileInput);
    //     };
        
    //     // Add to DOM and trigger
    //     document.body.appendChild(fileInput);
    //     fileInput.click();
    // }, [fileTypes]);

    return (
        <div className={`uppy-media-upload ${className}`} style={{ position: 'relative', ...style }}>
            {/* Uppy Dashboard */}
            <div id={target} className="uppy-dashboard-container uppy-dashboard-centered" />

            {/* Custom Controls */}
            {showButton && !autoProceed && !imageEditorRef.current && (
                <div className="uppy-controls-bottom-left">
                    <CustomButton
                        onClick={handleReset}
                        disabled={uploading || addedFiles === 0}
                    >
                        Reset
                    </CustomButton>

                    {/* Add More Button */}
                    {/* {showAddMoreButton && addedFiles > 0 && addedFiles < limit && !uploading && (
                        <CustomButton
                            onClick={handleAddMore}
                            disabled={uploading}
                            className="add-more-btn"
                            type="button"
                        >
                            + Add More ({addedFiles}/{limit})
                        </CustomButton>
                    )} */}

                    {showUploadButton && (
                        <CustomButton
                            onClick={handleUpload}
                            disabled={uploading || addedFiles === 0}
                        >
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </CustomButton>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            {uploading && uppyRef.current && (
                <div className="uppy-progress mt-4">
                    <ProgressBar uppy={uppyRef.current} />
                </div>
            )}

            {/* Status Bar */}
            {/* {uppyRef.current && (
                <div className="uppy-status mt-4">
                    <StatusBar uppy={uppyRef.current} />
                </div>
            )} */}

            {/* Custom Styles */}
            <style>{`
                .uppy-media-upload {
                    max-width: 100%;
                    margin: 0 auto;
                    position: relative;
                }
                
                .uppy-dashboard-container.uppy-dashboard-centered {
                    border: 2px dashed var(--borders-dividers);
                    border-radius: 8px;
                    background: var(--quaternary-background);
                    min-height: 200px;
                    // max-height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                    margin-top: 10px;
                    padding-bottom: ${showButton ? '70px' : '0px'}; /* Space for controls */
                }
                
                .uppy-controls-bottom-left {
                    position: absolute;
                    bottom: ${uploading ? '30px' : '16px'};
                    left: 16px;
                    display: flex;
                    gap: 16px;
                    z-index: 10;
                    justify-content: center;
                }
                
                .uppy-progress {
                    padding: 0 16px;
                }
                
                /* File name and size display improvements */
                .uppy-Dashboard-Item-fileInfo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: 15px;
                    color: var(--primary-text);
                    margin-top: 8px;
                }
                .uppy-Dashboard-Item-fileName {
                    font-weight: var(--font-medium);
                    word-break: break-all;
                }
                .uppy-Dashboard-Item-fileSize {
                    color: var(--secondary-text);
                    font-size: 13px;
                }
                /* Center preview image and constrain size */
                .uppy-Dashboard-Item-previewInnerWrap {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 180px !important;
                    max-width: 180px;
                    margin: 0 auto;
                }
                .uppy-Dashboard-Item-previewImg {
                    max-width: 100%;
                    max-height: 180px;
                    object-fit: contain;
                    border-radius: 6px !important;
                }
                /* Uppy Dashboard Customization (existing styles remain) */
                .uppy-Dashboard-inner {
                    border: none !important;
                    background: transparent !important;
                    border-radius: 8px !important;
                }
                .uppy-Dashboard-AddFiles {
                    border: none !important;
                    background: transparent !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    height: 100% !important;
                }
                .uppy-Dashboard-AddFiles-title {
                    color: var(--primary-text) !important;
                    font-size: var(--heading-h4) !important;
                    font-weight: var(--font-semi-bold) !important;
                    text-align: center !important;
                }
                .uppy-Dashboard-AddFiles-subtitle {
                    color: var(--secondary-text) !important;
                    font-size: var(--small-font) !important;
                    text-align: center !important;
                }
                .uppy-Dashboard-AddFiles-list {
                    margin-top: 20px !important;
                }
                .uppy-Dashboard-AddFiles-list button {
                    background: var(--primary-color) !important;
                    color: var(--white) !important;
                    border: none !important;
                    border-radius: 6px !important;
                    padding: 12px 24px !important;
                    font-weight: var(--font-medium) !important;
                    transition: background-color 0.2s !important;
                }
                .uppy-Dashboard-AddFiles-list button:hover {
                    background: var(--primary-color) !important;
                }
                .uppy-Dashboard-Item {
                    border-radius: 8px !important;
                    border: 1px solid var(--borders-dividers) !important;
                }
                .uppy-StatusBar {
                    background: var(--quaternary-background) !important;
                    border-radius: 6px !important;
                    border: none !important;
                }
                .uppy-StatusBar-progress {
                    background: var(--primary-color) !important;
                    border-radius: 6px !important;
                }
                .uppy-ProgressBar {
                    background: var(--quaternary-background) !important;
                    border-radius: 6px !important;
                    border: none !important;
                }
                .uppy-ProgressBar-bar {
                    background: var(--primary-color) !important;
                    border-radius: 6px !important;
                }
                .uppy-Dashboard-Item-previewInnerWrap {
                    height: auto !important;
                }
                .uppy-Dashboard--singleFile.uppy-size--md .uppy-Dashboard-Item-preview{
                    max-height: calc(100vh - 340px) !important;
                }
                .uppy-Dashboard-dropFilesHereHint  .uppy-Dashboard-AddFiles{
                    border: none !important;
                }
                [data-uppy-drag-drop-supported="true"] .uppy-Dashboard-AddFiles {
                    border: none !important;
                }
                .uppy-size--md .uppy-Dashboard-inner{
                    height: calc(100vh - 210px) !important;
                }
                /* MOBILE STYLES */
                @media (max-width: 768px) {
                    .uppy-media-upload {
                        padding: 0 !important;
                        max-width: 100vw;
                        min-height: 220px;
                        background: var(--quaternary-background);
                    }
                    .uppy-dashboard-container.uppy-dashboard-centered {
                        min-height: 220px;
                        margin-top: 0;
                        border-radius: 12px;
                        background: var(--quaternary-background);
                        box-shadow: none;
                        width: calc(100vw - 32px);
                        max-width: 100vw;
                        margin-top: 25px;
                    }
                    .uppy-controls-bottom-center {
                        position: fixed;
                        left: 0;
                        bottom: 0;
                        width: 100vw;
                        justify-content: center;
                        gap: 0;
                        padding: 12px 8px 16px 8px;
                        background: var(--quaternary-background);
                        z-index: 100;
                        box-shadow: 0 -2px 12px var(--borders-dividers);
                        transform: none;
                    }
                    .uppy-controls-bottom-center button {
                        flex: 1 1 0;
                        margin: 0 4px;
                        min-width: 0;
                        max-width: 100%;
                        font-size: var(--description-font);
                        border-radius: 8px;
                        height: 44px;
                    }
                    .uppy-progress {
                        padding: 0 8px;
                    }
                    .uppy-Dashboard--singleFile .uppy-Dashboard-Item{
                        max-width: calc(100vw - 32px) !important;
                    }
                    .uppy-size--md .uppy-DashboardContent-bar{
                        padding: 0 220px !important;
                    }
                    .uppy-size--md .uppy-DashboardContent-title{
                        max-width:150px !important;
                    }
                    .uppy-size--md .uppy-ImageCropper-controls{
                        width:calc(100vw - 42px) !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default UppyMediaUpload;