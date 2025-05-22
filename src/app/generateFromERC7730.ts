import { type paths } from "~/generate/api-types";

type GenerateBody =
  paths["/api/py/generateERC7730"]["post"]["requestBody"]["content"]["application/json"];
export type GenerateResponse =
  paths["/api/py/generateERC7730"]["post"]["responses"]["200"]["content"]["application/json"];

// Sleep utility function for delay between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function generateERC7730({
  input,
  inputType,
}: {
  inputType: "address" | "abi";
  input: string;
}): Promise<GenerateResponse | null> {
  const body: GenerateBody = {
    address: inputType === "address" ? input : undefined,
    abi: inputType === "abi" ? input : undefined,
  };

  // Maximum number of retry attempts
  const MAX_RETRIES = 5;
  // Starting delay in milliseconds (500ms)
  let retryDelay = 500;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`API call attempt ${attempt + 1} of ${MAX_RETRIES + 1}`);
      const response = await fetch("/api/py/generateERC7730", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log(`API response status: ${response.status}`);

      // If we get a 502 Bad Gateway or 503 Service Unavailable, we retry
      if (response.status === 502 || response.status === 503) {
        if (attempt < MAX_RETRIES) {
          console.log(`Backend not ready (${response.status}), retrying in ${retryDelay}ms...`);
          await sleep(retryDelay);
          // Exponential backoff - double the delay for next retry
          retryDelay *= 2;
          continue;
        }
      }

      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("API Error Details:", errorData);
          throw new Error(`API Error: ${errorData.message || JSON.stringify(errorData)}`);
        } catch (jsonError) {
          // If we can't parse the error as JSON, use the status text
          console.error("Error parsing API error response:", jsonError);
          throw new Error(`API Error: ${response.statusText} (${response.status})`);
        }
      }

      try {
        const data = await response.json();
        console.log("API response parsed successfully");
        return data as GenerateResponse;
      } catch (parseError) {
        console.error("Error parsing API response:", parseError);
        throw new Error("Failed to parse API response");
      }
    } catch (error) {
      // Only retry network errors or specific API errors
      if (error instanceof TypeError && error.message.includes("fetch") && attempt < MAX_RETRIES) {
        console.log(`Network error, retrying in ${retryDelay}ms...`);
        await sleep(retryDelay);
        // Exponential backoff - double the delay for next retry
        retryDelay *= 2;
      } else {
        console.error("Error in generateERC7730:", error);
        throw error;
      }
    }
  }

  // If we've exhausted all retries
  throw new Error("API is currently unavailable. Please try again later.");
}
