const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini AI
const ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });

/**
 * POST /api/ai/suggest-labels
 * Analyzes pet description and suggests temperament & goodWith labels
 */
router.post('/suggest-labels', async (req, res) => {
  try {
    const { description, species, breed, name } = req.body;

    // Validation
    if (!description || description.trim().length < 20) {
      return res.json({
        success: false,
        message: 'Description must be at least 20 characters long'
      });
    }

    // Create a detailed prompt for Gemini
    const prompt = `
You are an expert pet behaviorist analyzing a ${species} for adoption.

Pet Information:
- Name: ${name || 'Unknown'}
- Species: ${species}
- Breed: ${breed || 'Mixed'}
- Description: "${description}"

Based on this description, suggest appropriate labels from the following options:

TEMPERAMENT OPTIONS (choose 1-3 that best match):
- Calm: Relaxed, peaceful, not easily excited
- Playful: Enjoys games, toys, and interactive activities
- Energetic: High energy, needs lots of exercise and activity
- Friendly: Sociable, likes meeting new people and animals
- Independent: Self-sufficient, doesn't require constant attention

GOOD WITH OPTIONS (choose all that apply):
- Children: Safe and gentle around kids
- Other Dogs: Gets along well with other dogs
- Other Cats: Compatible with cats
- Elderly: Suitable for senior owners (gentle, not overly energetic)
- Single Adults: Good for individuals living alone

IMPORTANT RULES:
1. Only select labels that are clearly supported by the description
2. Be conservative - if unsure, don't include it
3. Return ONLY valid JSON format
4. Do not add explanations or additional text

Return your suggestions in this EXACT JSON format (no markdown, no code blocks):
{
  "temperament": ["option1", "option2"],
  "goodWith": ["option1", "option2"]
}
`;

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    // Extract AI response
    let aiResponse = response.text || '';
    
    // Clean the response (remove markdown code blocks if present)
    aiResponse = aiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse JSON response
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('AI Response:', aiResponse);
      return res.json({
        success: false,
        message: 'AI returned invalid format. Please try again.'
      });
    }

    // Validate the suggestions against allowed values
    const validTemperament = ['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'];
    const validGoodWith = ['Children', 'Other Dogs', 'Other Cats', 'Elderly', 'Single Adults'];

    const filteredSuggestions = {
      temperament: (suggestions.temperament || []).filter(t => validTemperament.includes(t)),
      goodWith: (suggestions.goodWith || []).filter(g => validGoodWith.includes(g))
    };

    // Return successful response
    res.json({
      success: true,
      suggestions: filteredSuggestions,
      message: 'AI suggestions generated successfully'
    });

  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI analysis failed: ' + error.message
    });
  }
});

module.exports = router;