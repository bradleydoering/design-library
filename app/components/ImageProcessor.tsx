"use client";
import { useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/app/Components";
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Image as ImageIcon,
  Cloud,
  Database,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

interface ImageFile {
  id: string;
  file: File;
  sku: string;
  imageNumber: number | null; // null = main image, 1-4 = specific image slot
  preview: string;
  originalName: string;
  steps: ProcessingStep[];
  processedImageUrl?: string;
  r2Url?: string;
  error?: string;
  skipBackgroundRemoval?: boolean;
  canRetry?: boolean;
  isRetrying?: boolean;
}

interface ImageProcessorProps {
  onImagesProcessed?: (results: ImageFile[]) => void;
}

export default function ImageProcessor({ onImagesProcessed }: ImageProcessorProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [batchSkipBackground, setBatchSkipBackground] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract SKU and image number from filename
  const extractSKUAndImageNumber = (filename: string): { sku: string; imageNumber: number | null } => {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // Check for asterisk pattern (e.g., "SKU*1", "SKU*2", etc.)
    const asteriskMatch = nameWithoutExt.match(/^(.+)\*([1-4])$/);
    
    if (asteriskMatch) {
      const baseSku = asteriskMatch[1].replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
      const imageNumber = parseInt(asteriskMatch[2], 10);
      return { sku: baseSku, imageNumber };
    } else {
      // No asterisk, treat as main image
      const sku = nameWithoutExt.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
      return { sku, imageNumber: null };
    }
  };

  const createProcessingSteps = (): ProcessingStep[] => [
    { id: 'upload', name: 'File Upload', status: 'completed' },
    { id: 'bg-remove', name: 'Background Removal', status: 'pending' },
    { id: 'r2-upload', name: 'Cloud Storage Upload', status: 'pending' },
    { id: 'db-update', name: 'Database Update', status: 'pending' }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error(`${files.length - imageFiles.length} non-image files were skipped`);
    }

    const newImages: ImageFile[] = imageFiles.map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const { sku, imageNumber } = extractSKUAndImageNumber(file.name);
      const preview = URL.createObjectURL(file);
      
      return {
        id,
        file,
        sku,
        imageNumber,
        preview,
        originalName: file.name,
        steps: createProcessingSteps(),
        skipBackgroundRemoval: batchSkipBackground,
        canRetry: false,
        isRetrying: false
      };
    });

    setImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} images added for processing`);
  };

  const updateImageStep = (imageId: string, stepId: string, updates: Partial<ProcessingStep>) => {
    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        return {
          ...img,
          steps: img.steps.map(step => 
            step.id === stepId ? { ...step, ...updates } : step
          )
        };
      }
      return img;
    }));
  };

  const updateImage = (imageId: string, updates: Partial<ImageFile>) => {
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ));
  };

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === imageId);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const processImage = async (image: ImageFile) => {
    try {
      let processedBlob: Blob;
      let shouldSkipBgRemoval = image.skipBackgroundRemoval;

      // Step 1: Background Removal (or skip)
      if (shouldSkipBgRemoval) {
        updateImageStep(image.id, 'bg-remove', { status: 'completed', message: 'Background removal skipped' });
        processedBlob = image.file;
      } else {
        updateImageStep(image.id, 'bg-remove', { status: 'processing', message: 'Removing background...' });
        
        const bgRemovalResult = await removeBackground(image.file);
        
        if (bgRemovalResult.success && bgRemovalResult.processedBlob) {
          updateImageStep(image.id, 'bg-remove', { status: 'completed', message: 'Background removed' });
          updateImage(image.id, { processedImageUrl: URL.createObjectURL(bgRemovalResult.processedBlob) });
          processedBlob = bgRemovalResult.processedBlob;
        } else {
          // Handle API failures - continue with original image
          if (bgRemovalResult.error?.includes('rate limit') || 
              bgRemovalResult.error?.includes('foreground') || 
              bgRemovalResult.error?.includes('subject not found')) {
            updateImageStep(image.id, 'bg-remove', { status: 'completed', message: 'Skipped - using original image' });
            processedBlob = image.file;
            console.log(`Background removal skipped for ${image.originalName}: ${bgRemovalResult.error}`);
          } else {
            updateImageStep(image.id, 'bg-remove', { status: 'error', message: bgRemovalResult.error });
            updateImage(image.id, { error: bgRemovalResult.error, canRetry: true });
            return;
          }
        }
      }

      // Step 2: R2 Upload
      updateImageStep(image.id, 'r2-upload', { status: 'processing', message: 'Uploading to cloud storage...' });
      
      const r2Result = await uploadToR2(processedBlob, image.sku, image.imageNumber);
      
      if (r2Result.success && r2Result.url) {
        updateImageStep(image.id, 'r2-upload', { status: 'completed', message: 'Uploaded to cloud' });
        updateImage(image.id, { r2Url: r2Result.url });

        // Step 3: Database Update
        updateImageStep(image.id, 'db-update', { status: 'processing', message: 'Updating database...' });
        
        const dbResult = await updateDatabase(image.sku, r2Result.url, image.imageNumber);
        
        if (dbResult.success) {
          updateImageStep(image.id, 'db-update', { status: 'completed', message: 'Database updated' });
          updateImage(image.id, { canRetry: false });
        } else {
          updateImageStep(image.id, 'db-update', { status: 'error', message: dbResult.error });
          updateImage(image.id, { error: dbResult.error, canRetry: true });
        }
      } else {
        updateImageStep(image.id, 'r2-upload', { status: 'error', message: r2Result.error });
        updateImage(image.id, { error: r2Result.error, canRetry: true });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateImage(image.id, { error: errorMessage, canRetry: true });
      // Mark all remaining steps as error
      image.steps.forEach(step => {
        if (step.status === 'pending' || step.status === 'processing') {
          updateImageStep(image.id, step.id, { status: 'error', message: errorMessage });
        }
      });
    }
  };

  const removeBackground = async (file: File): Promise<{ success: boolean; processedBlob?: Blob; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('image_file', file);

      const response = await fetch('/api/admin/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }

      const processedBlob = await response.blob();
      return { success: true, processedBlob };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Background removal failed' 
      };
    }
  };

  const uploadToR2 = async (blob: Blob, sku: string, imageNumber: number | null): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', blob, `${sku}.png`);
      formData.append('sku', sku);
      formData.append('imageNumber', imageNumber?.toString() || '');

      const response = await fetch('/api/admin/upload-to-r2', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }

      const result = await response.json();
      return { success: true, url: result.url };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload to R2 failed' 
      };
    }
  };

  const updateDatabase = async (sku: string, imageUrl: string, imageNumber: number | null): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/admin/update-product-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, imageUrl, imageNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.error || `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database update failed' 
      };
    }
  };

  const processAllImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);
    try {
      // Process images sequentially to avoid overwhelming APIs
      for (const image of images) {
        await processImage(image);
      }
      
      toast.success('All images processed successfully!');
      onImagesProcessed?.(images);
    } catch (error) {
      toast.error('Error processing images');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAllImages = () => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
      if (img.processedImageUrl) URL.revokeObjectURL(img.processedImageUrl);
    });
    setImages([]);
  };

  const toggleImageBackgroundRemoval = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, skipBackgroundRemoval: !img.skipBackgroundRemoval }
        : img
    ));
  };

  const toggleBatchBackgroundRemoval = () => {
    const newSkipValue = !batchSkipBackground;
    setBatchSkipBackground(newSkipValue);
    
    // Apply to all existing images
    setImages(prev => prev.map(img => ({
      ...img,
      skipBackgroundRemoval: newSkipValue
    })));
  };

  const retryImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // Reset image state
    updateImage(imageId, { 
      error: undefined, 
      canRetry: false, 
      isRetrying: true,
      processedImageUrl: undefined,
      r2Url: undefined
    });

    // Reset all steps to pending (except file upload which is already done)
    image.steps.forEach(step => {
      if (step.id !== 'upload') {
        updateImageStep(imageId, step.id, { status: 'pending', message: undefined });
      }
    });

    // Process the image
    await processImage({ ...image, isRetrying: true });
    
    // Clear retry state
    updateImage(imageId, { isRetrying: false });
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Product Image Processor</h2>
            <p className="text-gray-600">Upload product images to automatically remove backgrounds, upload to cloud storage, and update the database</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <Upload size={16} />
              Select Files
            </Button>
            {images.length > 0 && (
              <>
                <Button
                  onClick={toggleBatchBackgroundRemoval}
                  disabled={isProcessing}
                  className={`px-4 py-2 rounded flex items-center gap-2 ${
                    batchSkipBackground 
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-700' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  {batchSkipBackground ? <EyeOff size={16} /> : <Eye size={16} />}
                  {batchSkipBackground ? 'Skip Backgrounds' : 'Remove Backgrounds'}
                </Button>
                <Button
                  onClick={processAllImages}
                  disabled={isProcessing}
                  className="btn-coral cropped-corners flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon size={16} />}
                  Process All Images
                </Button>
                <Button
                  onClick={clearAllImages}
                  disabled={isProcessing}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear All
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? 'border-coral bg-coral bg-opacity-5' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            Drag and drop product images here, or click to select files
          </p>
          <p className="text-sm text-gray-500">
            Images should be named with their product SKU (e.g., "TILE-001.jpg" → SKU: "TILE-001")
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Processing Pipeline Status */}
      {images.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Pipeline</h3>
          <div className="grid gap-4">
            {images.map(image => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={image.processedImageUrl || image.preview} 
                      alt={image.originalName}
                      className="w-12 h-12 object-cover rounded border"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{image.originalName}</div>
                      <div className="text-sm text-gray-500">
                        SKU: {image.sku} 
                        {image.imageNumber && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                            Image {image.imageNumber}
                          </span>
                        )}
                        {!image.imageNumber && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                            Main Image
                          </span>
                        )}
                        {image.skipBackgroundRemoval && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                            Original BG
                          </span>
                        )}
                      </div>
                      {image.error && (
                        <div className="text-sm text-red-600">{image.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Individual Background Removal Toggle */}
                    <button
                      onClick={() => toggleImageBackgroundRemoval(image.id)}
                      disabled={isProcessing || image.isRetrying}
                      className={`p-1 rounded transition-colors ${
                        image.skipBackgroundRemoval 
                          ? 'text-orange-600 hover:text-orange-700' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                      title={image.skipBackgroundRemoval ? 'Enable background removal' : 'Skip background removal'}
                    >
                      {image.skipBackgroundRemoval ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    
                    {/* Retry Button */}
                    {image.canRetry && !image.isRetrying && (
                      <button
                        onClick={() => retryImage(image.id)}
                        disabled={isProcessing}
                        className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Retry processing"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    
                    {/* Loading indicator for retry */}
                    {image.isRetrying && (
                      <div className="p-1">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(image.id)}
                      disabled={isProcessing || image.isRetrying}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Processing Steps */}
                <div className="flex items-center gap-4">
                  {image.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2">
                      {getStepIcon(step.status)}
                      <div>
                        <div className="text-xs font-medium text-gray-700">{step.name}</div>
                        {step.message && (
                          <div className="text-xs text-gray-500">{step.message}</div>
                        )}
                      </div>
                      {index < image.steps.length - 1 && (
                        <div className="w-8 h-px bg-gray-300" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Preview Images */}
                {image.processedImageUrl && (
                  <div className="mt-4 flex gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Original</div>
                      <img 
                        src={image.preview} 
                        alt="Original"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Processed</div>
                      <img 
                        src={image.processedImageUrl} 
                        alt="Processed"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Upload size={16} />
            <span><strong>Upload:</strong> Drag & drop or select product images</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span><strong>Background Control:</strong> Toggle background removal on/off for individual images or entire batches</span>
          </div>
          <div className="flex items-center gap-2">
            <ImageIcon size={16} />
            <span><strong>Smart Processing:</strong> Handles API rate limits and continues processing with original images when needed</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud size={16} />
            <span><strong>Cloud Storage:</strong> Uploads processed images to CloudFlare R2 bucket</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={16} />
            <span><strong>Database Update:</strong> Links images to products in Supabase by SKU</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw size={16} />
            <span><strong>Retry:</strong> Failed uploads can be retried individually with the retry button</span>
          </div>
        </div>
      </div>
    </div>
  );
}