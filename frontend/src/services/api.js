export async function analyzeText(text) {
  const response = await fetch("http://localhost:8000/api/v1/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  })

  return response.json()
}