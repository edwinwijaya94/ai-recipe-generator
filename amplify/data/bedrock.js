export function request(ctx) {
    const { ingredients = [] } = ctx.args;

    // 1. Keep the prompt clean, plain, and straightforward
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

    return {
        // Prepend with us. or jp. based on your playground region
        resourcePath: `/model/us.anthropic.claude-sonnet-4-5-20250929-v1:0/invoke`,
        method: "POST",
        params: {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                // 2. CRITICAL: Pass ONLY the raw prompt string
                                // Do NOT wrap it with legacy "\n\nHuman:" or "\n\nAssistant:" values
                                text: prompt,
                            },
                        ],
                    },
                ],
            }),
        },
    };
}

export function response(ctx) {
    // 3. Capture any active transmission or access exceptions right away
    if (ctx.error) {
        return {
            body: "",
            error: ctx.error.message || "Failed to establish a connection with Bedrock."
        };
    }

    const parsedBody = JSON.parse(ctx.result.body);

    // 4. Check if Bedrock responded with a validation error block
    if (parsedBody && (parsedBody.message || parsedBody.Message)) {
        return {
            body: "",
            error: parsedBody.message || parsedBody.Message
        };
    }

    // 5. Extract text if the content array contains items safely
    if (parsedBody && parsedBody.content && parsedBody.content[0] && parsedBody.content[0].text) {
        return {
            body: parsedBody.content[0].text,
            error: ""
        };
    }

    // 6. Generic parsing fallback safeguard
    return {
        body: "",
        error: "Bedrock payload structure did not return text fields."
    };
}
