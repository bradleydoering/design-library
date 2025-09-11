'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package } from '@/app/types';

interface ImageData {
  url: string;
  filename: string;
  packageId: string | null;
  packageName: string | null;
  imageType: 'MAIN' | 'IMAGE_01' | 'IMAGE_02' | 'IMAGE_03';
}

interface ImageGalleryProps {
  packages: Package[];
  onBackToIntro?: () => void;
}

export default function ImageGallery({ packages, onBackToIntro }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [sortedImages, setSortedImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!packages.length) return;

    const extractedImages: ImageData[] = [];

    packages.forEach((pkg) => {
      // Extract filename from URL (last part after the last '/')
      const extractFilename = (url: string): string => {
        if (!url) return '';
        const parts = url.split('/');
        return parts[parts.length - 1] || '';
      };

      // Main image
      if (pkg.image) {
        extractedImages.push({
          url: pkg.image,
          filename: extractFilename(pkg.image),
          packageId: pkg.id,
          packageName: pkg.name,
          imageType: 'MAIN'
        });
      }

      // Additional images
      pkg.additionalImages?.forEach((imageUrl, index) => {
        if (imageUrl) {
          const imageType = `IMAGE_0${index + 1}` as 'IMAGE_01' | 'IMAGE_02' | 'IMAGE_03';
          extractedImages.push({
            url: imageUrl,
            filename: extractFilename(imageUrl),
            packageId: pkg.id,
            packageName: pkg.name,
            imageType
          });
        }
      });
    });

    setImages(extractedImages);

    // Sort images by filename
    const sorted = [...extractedImages].sort((a, b) => {
      return a.filename.localeCompare(b.filename, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    setSortedImages(sorted);
    setLoading(false);
  }, [packages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {onBackToIntro && (
          <button
            onClick={onBackToIntro}
            className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Packages
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Package Images Gallery</h1>
        <p className="text-gray-600 mb-4">
          Images sorted by filename, showing package matches from R2 bucket
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Total Images:</strong> {sortedImages.length} | 
            <strong> Matched Packages:</strong> {new Set(sortedImages.map(img => img.packageId)).size}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedImages.map((imageData, index) => (
          <div key={`${imageData.packageId}-${imageData.imageType}-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-square relative bg-gray-100">
              <Image
                src={imageData.url}
                alt={`${imageData.packageName} - ${imageData.imageType}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/item-missing.svg';
                }}
              />
            </div>
            
            <div className="p-4">
              <div className="mb-2">
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                  imageData.imageType === 'MAIN' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {imageData.imageType}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1 truncate" title={imageData.packageName || 'Unknown Package'}>
                {imageData.packageName || 'Unknown Package'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">
                <strong>Package ID:</strong> {imageData.packageId || 'N/A'}
              </p>
              
              <p className="text-xs text-gray-500 break-all" title={imageData.filename}>
                <strong>Filename:</strong> {imageData.filename}
              </p>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => window.open(imageData.url, '_blank')}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Full Image →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
          <p className="text-gray-500">No images were found in the packages data.</p>
        </div>
      )}
    </div>
  );
}