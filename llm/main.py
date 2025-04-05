import json
import re
from google import genai


# Initialize the Gemini client with your API key
client = genai.Client(api_key="AIzaSyAxI-7_Pcu1xN_NCCyieQokljbH7NEmy5M")

# Read the JSON specification from the file
json_file_path = "llm/good.json"
try:
    with open(json_file_path, "r") as file:
        user_spec = file.read()
except FileNotFoundError:
    print(f"Error: File {json_file_path} not found.")
    exit(1)

# Try to parse the input as JSON
try:
    # Validate JSON format before sending
    json.loads(user_spec)
except json.JSONDecodeError:
    print("Invalid JSON format in the file. Please check the contents and try again.")
    exit(1)

# Define the prompt with the good example and user's spec
prompt = f"""
Evaluate the following ERC7730 JSON specification based on these criteria:
1. It must include a properly formatted Ethereum address (42-character string starting with '0x' followed by 40 hex characters).
2. Each function or type listed in the 'display.formats' section must have a clear, human-readable 'intent' describing its purpose.

Here is an example of a good ERC7730 spec for reference:
{{
  "$schema": "../../specs/erc7730-v1.schema.json",
  "context": {{
    "eip712": {{
      "deployments": [{{"chainId": 137, "address": "0xdb46d1dc155634fbc732f92e853b10b288ad5a1d"}}],
      "domain": {{"name": "Dispatch", "chainId": 137, "verifyingContract": "0xdb46d1dc155634fbc732f92e853b10b288ad5a1d"}},
      "schemas": [
        {{
          "primaryType": "FollowWithSig",
          "types": {{
            "EIP712Domain": [
              {{"name": "chainId", "type": "uint256"}},
              {{"name": "name", "type": "string"}},
              {{"name": "verifyingContract", "type": "address"}},
              {{"name": "version", "type": "string"}}
            ],
            "FollowWithSig": [
              {{"name": "datas", "type": "bytes[]"}},
              {{"name": "deadline", "type": "uint256"}},
              {{"name": "nonce", "type": "uint256"}},
              {{"name": "profileIds", "type": "uint256[]"}}
            ]
          }}
        }}
      ]
    }}
  }},
  "metadata": {{"owner": "Dispatch.xyz"}},
  "display": {{
    "formats": {{
      "FollowWithSig": {{
        "intent": "Dispatch.xyz Follow Profile",
        "fields": [
          {{"path": "profileIds.[]", "label": "Profile Ids", "format": "raw"}},
          {{"path": "datas.[]", "label": "Data", "format": "raw"}},
          {{"path": "nonce", "label": "Nonce", "format": "raw"}},
          {{"path": "deadline", "label": "Expiration Date", "format": "raw"}}
        ]
      }}
    }}
  }}
}}

Now, evaluate this spec:
{user_spec}

Return your evaluation in this exact JSON format: {{"Good": XX%, "Bad": XX%}}, where XX% is your confidence level. Do not include any additional text or explanations.
"""

# Send the request to Gemini
try:
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    
    result_text = response.text.strip()
    
    # Try multiple approaches to extract valid JSON
    try:
        # First attempt: Direct JSON parsing if response is already JSON
        result_dict = json.loads(result_text)
    except json.JSONDecodeError:
        # Second attempt: Use regex to find JSON-like pattern
        json_match = re.search(r'(\{.*"Good".*"Bad".*\})', result_text, re.DOTALL)
        if json_match:
            try:
                result_json = json_match.group(1)
                result_dict = json.loads(result_json)
            except json.JSONDecodeError:
                # If still failing, create a dictionary from the text
                good_match = re.search(r'"Good":\s*"?(\d+)%"?', result_text)
                bad_match = re.search(r'"Bad":\s*"?(\d+)%"?', result_text)
                
                if good_match and bad_match:
                    result_dict = {
                        "Good": f"{good_match.group(1)}%",
                        "Bad": f"{bad_match.group(1)}%"
                    }
                else:
                    result_dict = {"Good": "0%", "Bad": "100%"}
        else:
            result_dict = {"Good": "0%", "Bad": "100%"}
    
    # Return only the dictionary
    print(result_dict)
    
except Exception as e:
    print({"Good": "0%", "Bad": "100%"})