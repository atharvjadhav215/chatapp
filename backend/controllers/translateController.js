import translate from "google-translate-api-x";

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    // ✅ Ensure required fields are present
    if (!text || !targetLanguage) {
      return res
        .status(400)
        .json({ error: "Text and target language are required" });
    }

    // ✅ Log request body
    console.log("Translation Request:", req.body);

    // ✅ Perform translation
    const result = await translate(text, { to: targetLanguage });

    res.json({ translatedText: result.text });
  } catch (error) {
    console.error("Translation API Error:", error.message || error);
    res.status(500).json({ error: "Translation failed" });
  }
};
