import { NextResponse } from 'next/server';

// Replicate API configuration
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4";

interface RequestBody {
  imageUrl: string;
  style: string;
}

async function generateImage(imageUrl: string, prompt: string) {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: imageUrl,
        prompt: prompt,
        num_outputs: 1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Replicate API error: ${response.statusText}`);
  }

  const prediction = await response.json();
  return prediction;
}

async function pollPrediction(predictionId: string) {
  const maxAttempts = 30;
  const interval = 1000;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Polling error: ${response.statusText}`);
    }

    const prediction = await response.json();
    if (prediction.status === "succeeded") {
      return prediction.output[0];
    } else if (prediction.status === "failed") {
      throw new Error("Image generation failed");
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error("Timeout waiting for image generation");
}

export async function POST(request: Request) {
  if (!REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token not configured" },
      { status: 500 }
    );
  }

  try {
    const body: RequestBody = await request.json();
    const { imageUrl, style } = body;

    if (!imageUrl || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate three variations with the given style
    const stylePrompts = [
      `${style}, masterpiece, highly detailed`,
      `${style}, artistic, creative interpretation`,
      `${style}, professional, modern approach`
    ];

    const predictions = await Promise.all(
      stylePrompts.map(async (prompt) => {
        const prediction = await generateImage(imageUrl, prompt);
        const generatedImageUrl = await pollPrediction(prediction.id);
        return generatedImageUrl;
      })
    );

    return NextResponse.json({ 
      images: predictions
    });

  } catch (error) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
} 