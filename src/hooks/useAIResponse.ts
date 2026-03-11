import { InferenceClient } from "@huggingface/inference";
import { useQuery } from "@tanstack/react-query";

const default_prompt = "Say hi to the user.";
export const useAIResponse = (prompt: string = default_prompt) => {
  const HF_ACCESS_TOKEN = import.meta.env.VITE_HF_KEY;
  const hf = new InferenceClient(HF_ACCESS_TOKEN);

  const { data, isLoading, isError, error } = useQuery<string, Error>({
    queryKey: ["AI_response"],
    queryFn: async () => {
      const response = await hf.chatCompletion({
        model: "Qwen/Qwen3-32B:groq",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
      });
      if (!("choices" in response && response.choices[0]?.message)) {
        throw new Error("Error: No choices in response");
      }
      const text = response.choices[0].message.content;
      if (typeof text !== "string") {
        throw new Error("Error: response was not a string");
      }
      return text.replace(/^<think>\s*<\/think>\s*/i, "");
    },
  });
  return { data, isLoading, isError, error };
};
