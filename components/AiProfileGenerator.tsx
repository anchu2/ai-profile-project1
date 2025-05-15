'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Image from 'next/image';

interface GeneratedImage {
  url: string;
}

const STYLE_OPTIONS = [
  { id: 'anime', label: '애니메이션 스타일', value: 'anime style, japanese animation' },
  { id: 'oil', label: '유화 스타일', value: 'oil painting style, classical art' },
  { id: 'digital', label: '디지털 아트', value: 'digital art, modern illustration' },
  { id: 'watercolor', label: '수채화', value: 'watercolor painting, artistic' },
  { id: 'pixel', label: '픽셀 아트', value: 'pixel art style, retro gaming' }
];

export default function AiProfileGenerator() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0].value);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadedImageUrl(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('이미지 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProfiles = async () => {
    if (!uploadedImageUrl) {
      setError('이미지를 먼저 업로드해주세요.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setGeneratedImages([]);

    try {
      const response = await fetch('/api/generate-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImageUrl,
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        throw new Error('프로필 이미지 생성에 실패했습니다.');
      }

      const data = await response.json();
      setGeneratedImages(data.images.map((url: string) => ({ url })));
    } catch (error) {
      console.error('Error generating profiles:', error);
      setError('프로필 이미지 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">AI 프로필 이미지 생성</h2>
        
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            프로필 이미지 업로드
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            변환 스타일 선택
          </label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
              focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {STYLE_OPTIONS.map((style) => (
              <option key={style.id} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {uploadedImageUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">업로드된 이미지:</h3>
            <Image
              src={uploadedImageUrl}
              alt="Uploaded"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateProfiles}
          disabled={!uploadedImageUrl || isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${!uploadedImageUrl || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors duration-200`}
        >
          {isLoading ? '생성 중...' : 'AI 프로필 이미지 생성하기'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm mt-2">
            {error}
          </div>
        )}
      </div>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">생성된 프로필:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <div key={index} className="relative group">
                <Image
                  src={image.url}
                  alt={`Generated profile ${index + 1}`}
                  width={300}
                  height={300}
                  className="rounded-lg transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 