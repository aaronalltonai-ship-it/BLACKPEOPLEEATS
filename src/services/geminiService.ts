import { GoogleGenAI } from "@google/genai";

export interface Restaurant {
  id?: number;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  is_black_owned: boolean;
}

export interface Post {
  id?: number;
  restaurant_id: number;
  restaurant_name?: string;
  restaurant_city?: string;
  user_id?: number;
  user_name: string;
  user_avatar?: string;
  meal_name: string;
  image_url: string;
  review: string;
  rating?: number;
  created_at?: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getCityHighlights(city: string) {
  // Fallback data since Gemini might refuse the query or hit rate limits
  const fallbacks: Record<string, any[]> = {
    "Atlanta": [
      { name: "Slutty Vegan", category: "Vegan", reason: "A cultural phenomenon known for its incredible plant-based burgers and energetic atmosphere." },
      { name: "Busy Bee Cafe", category: "Soul Food", reason: "An Atlanta institution serving legendary fried chicken and classic Southern sides since 1947." },
      { name: "Paschal's", category: "Southern", reason: "Historic meeting place during the Civil Rights Movement, famous for its fried chicken." },
      { name: "Old Lady Gang", category: "Southern", reason: "Owned by Kandi Burruss, offering authentic family recipes in a lively setting." },
      { name: "The Seafood Menu", category: "Seafood", reason: "Known for their signature sauces and fresh seafood boils." }
    ],
    "Chicago": [
      { name: "Harold's Chicken Shack", category: "Chicken", reason: "A Chicago staple famous for its fried chicken and signature mild sauce." },
      { name: "Luella's Southern Kitchen", category: "Southern", reason: "Elevated Southern comfort food bringing a taste of the South to the North." },
      { name: "Batter & Berries", category: "Breakfast", reason: "Famous for their French Toast flights and vibrant brunch atmosphere." },
      { name: "Virtue", category: "Southern", reason: "Award-winning restaurant offering a sophisticated take on Southern cuisine." },
      { name: "Majani", category: "Vegan", reason: "Plant-based soul food that doesn't compromise on flavor." }
    ],
    "Houston": [
      { name: "The Breakfast Klub", category: "Breakfast", reason: "Legendary spot for wings & waffles and catfish & grits. The line is always worth it." },
      { name: "Turkey Leg Hut", category: "BBQ", reason: "Famous for their massive, creatively stuffed turkey legs." },
      { name: "Lucille's", category: "Southern", reason: "Refined Southern cuisine honoring the legacy of culinary pioneer Lucille B. Smith." },
      { name: "Mico's Hot Chicken", category: "Chicken", reason: "Bringing authentic Nashville hot chicken to Houston." },
      { name: "Gatlin's BBQ", category: "BBQ", reason: "Family-owned joint serving up some of the best craft BBQ in the city." }
    ],
    "New Orleans": [
      { name: "Dooky Chase's", category: "Creole", reason: "Historic restaurant known for its gumbo and role in the Civil Rights Movement." },
      { name: "Willie Mae's Scotch House", category: "Southern", reason: "Widely considered to have some of the best fried chicken in America." },
      { name: "Neyow's Creole Cafe", category: "Creole", reason: "A local favorite for authentic Creole dishes and charbroiled oysters." },
      { name: "Cafe Reconcile", category: "Southern", reason: "Great food with a mission, training at-risk youth in the culinary arts." },
      { name: "Barrow's Catfish", category: "Seafood", reason: "Serving their legendary fried catfish recipe since 1943." }
    ],
    "Detroit": [
      { name: "Kuzzo's Chicken & Waffles", category: "Breakfast", reason: "A staple for Southern comfort food in the Avenue of Fashion." },
      { name: "Sweet Potato Sensations", category: "Bakery", reason: "Everything sweet potato, from pies to pancakes." },
      { name: "Detroit Vegan Soul", category: "Vegan", reason: "Pioneering plant-based soul food in the Motor City." },
      { name: "Ima", category: "Noodles", reason: "Award-winning udon and rice bowls." },
      { name: "Beans & Cornbread", category: "Soul Food", reason: "Award-winning soul food with an upscale vibe." }
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List 5 highly recommended restaurants in ${city} that are popular within the Black community. For each, provide the name, category, and a brief reason why it's a staple. Format as a JSON array of objects with keys: name, category, reason. Do not include markdown formatting like \`\`\`json.`,
      config: {
        // Removed googleMaps tool to avoid the refusal error
      },
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error("JSON Parse Error:", cleanedText);
    }
  } catch (error) {
    console.error("Error fetching city highlights:", error);
  }
  
  // Return fallback if API fails or parsing fails
  return fallbacks[city] || fallbacks["Atlanta"];
}

export async function searchRestaurants(query: string, lat?: number, lng?: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find restaurants matching "${query}" that are popular in the Black community.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });

    // Extracting place info from grounding chunks would be ideal, but for now we'll return the text
    // and maybe some metadata if available.
    return {
      text: response.text,
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return { text: "Could not find restaurants.", sources: [] };
  }
}
