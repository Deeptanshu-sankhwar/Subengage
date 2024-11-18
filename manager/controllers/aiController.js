const PromptHistory = require('../models/promptHistory');

const promptTrigger = async (req, res) => {
    const { prompt } = req.body;

    try {
        // forward this prompt triggering the ai agentic systems forward
        const promptHistory = new PromptHistory({ prompt });

        await promptHistory.save();

        return res.status(200).json({
            success: true,
            message: 'Agents are working on the prompt: ' + prompt,
        })
    } catch (err)   {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

module.exports = {
    promptTrigger,
}