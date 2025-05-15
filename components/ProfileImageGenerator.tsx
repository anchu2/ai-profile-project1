'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Image from 'next/image';

const REPLICATE_API_TOKEN = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;

interface GeneratedImage {
  url: string;
  style: string;
}

export default function ProfileImageGenerator() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const styleKeywords = [
    "anime style, vibrant colors",
    "oil painting, renaissance style",
    "modern digital art, professional"
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadedImageUrl(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const generateProfiles = async () => {
    if (!uploadedImageUrl || !REPLICATE_API_TOKEN) {
      alert('Please upload an image first or check API configuration');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);

    try {
      const generationPromises = styleKeywords.map(async (style) => {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
            input: {
              image: uploadedImageUrl,
              prompt: style,
              num_outputs: 1,
            },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const prediction = await response.json();
        
        // Poll for the result
        let result = await pollPrediction(prediction.id, REPLICATE_API_TOKEN);
        
        return {
          url: result.output[0],
          style: style,
        };
      });

      const results = await Promise.all(generationPromises);
      setGeneratedImages(results);
    } catch (error) {
      console.error('Error generating profiles:', error);
      alert('Failed to generate profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const pollPrediction = async (predictionId: string, token: string) => {
    const maxAttempts = 30;
    const interval = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${token}`,
          },
        }
      );

      const prediction = await response.json();
      if (prediction.status === 'succeeded') {
        return prediction;
      } else if (prediction.status === 'failed') {
        throw new Error('Image generation failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Timeout waiting for image generation');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        {uploadedImageUrl && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Uploaded Image:</h3>
            <Image
              src={uploadedImageUrl}
              alt="Uploaded"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
        )}
        <button
          onClick={generateProfiles}
          disabled={!uploadedImageUrl || isLoading}
          className={`px-4 py-2 rounded-lg ${
            !uploadedImageUrl || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Profile Images'}
        </button>
      </div>

      {generatedImages.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Generated Profiles:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generatedImages.map((image, index) => (
              <div key={index} className="border rounded-lg p-4">
                <Image
                  src={image.url}
                  alt={`Generated profile ${index + 1}`}
                  width={300}
                  height={300}
                  className="rounded-lg mb-2"
                />
                <p className="text-sm text-gray-600">{image.style}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 