/* eslint-disable max-len */
require("dotenv").config();
const axios = require("axios");

/**
 * Generates an image using FLUX.1 and returns buffer
 * @param {string} prompt - The text prompt for image generation.
 * @return {Promise<Buffer>} - Promise resolving to image buffer.
 */
async function generateImage(prompt) {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("A non-empty text prompt is required.");
  }

  const apiToken = process.env.BLACK_FOREST_TOKEN;
  const url = process.env.BLACK_FOREST_URL;
  if (!apiToken) {
    throw new Error("Hugging Face API token not found.");
  }

  console.log(`Requesting image for prompt: "${prompt}"...`);

  try {
    const response = await axios.post(
        url,
        {inputs: prompt.trim()},
        {
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
            "Accept": "image/jpeg",
          },
          responseType: "arraybuffer",
        },
    );

    const imageBuffer = Buffer.from(response.data);
    console.log(`Image generated successfully. Size: ${imageBuffer.length} bytes`);

    return imageBuffer;
  } catch (error) {
    if (error.response) {
      console.error(`Error generating image: ${error.response.status}`);
      if (error.response.status === 503) {
        throw new Error("The model is currently loading. Please wait a moment and try again.");
      } else if (error.response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (error.response.status === 401) {
        throw new Error("Invalid API token. Please check your BLACK_FOREST_TOKEN.");
      } else {
        const errorResponse = Buffer.from(error.response.data).toString("utf-8");
        throw new Error(`API Error: ${errorResponse}`);
      }
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to the image generation service.");
    } else {
      throw new Error(`Request error: ${error.message}`);
    }
  }
}

module.exports = generateImage;
