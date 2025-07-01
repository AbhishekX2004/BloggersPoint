/* eslint-disable max-len */
// require("dotenv").config();
const axios = require("axios");

/**
 * Profanity Filter - KolasAI
 * @param {string} message - The text to be tested
 * @return {boolean} boolean - true/false
 */
async function isInsult(message) {
  try {
    const CLIENT_ID = process.env.KOLAS_CLIENT_ID;
    const CLIENT_SECRET = process.env.KOLAS_SECRET;
    const PROJECT_ID = process.env.KOLAS_PROJECT_ID;
    const AUTH_URL = process.env.KOLAS_OAUTH_URL;
    const PREDICT_URL = process.env.KOLAS_PREDICT_URL;

    if (!CLIENT_ID || !CLIENT_SECRET || !PROJECT_ID) {
      throw new Error("Missing required environment variables");
    }

    // Step 1: Get access token
    const tokenResponse = await axios.post(AUTH_URL,
        `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
    );

    const accessToken = tokenResponse.data.access_token;
    console.log("Access: ", !!accessToken);

    // Step 2: Make prediction request
    const predictionResponse = await axios.post(PREDICT_URL,
        {
          projectId: PROJECT_ID,
          messages: [
            {
              message: message,
            },
          ],
        },
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
    );
    console.log("Prediction: ", !!predictionResponse);

    // Step 3: Check if "Insult" is predicted
    if (predictionResponse.data.predictions && predictionResponse.data.predictions.length > 0) {
      const prediction = predictionResponse.data.predictions[0].prediction;
      const p = predictionResponse.data.predictions[0].probability;
      console.log(prediction, " :: ", p);
      return (prediction === "Insult" && p >= 0.6) || (prediction === "Neutral" && p <= 0.8) || (prediction === "Spam" && p <= 0.8);
    }
    return false;
  } catch (error) {
    console.error("Error in isInsult function:", error.message);
    return false; // Default to false on error
  }
}

module.exports = isInsult;
