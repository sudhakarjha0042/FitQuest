import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from 'googleapis';

// Access your YouTube Data API key as an environment variable
const YOUTUBE_API_KEY = "AIzaSyBqr9Vdz9GnbcAioazFLGyj0JCV6897TsU"; // Replace with your actual API key

const genAI = new GoogleGenerativeAI("AIzaSyBf4oVjhWVSHvUGSecU2bVmdQbqrTBwlc8");

// Function to search for videos on YouTube
async function searchYouTube(searchTerm) {
    console.log("searchTerm:", searchTerm);
  const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY,
  });

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: searchTerm,
      type: 'video',
      maxResults: 1,
    });

    const videoId = response.data.items[0].id.videoId;
    const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

    return videoLink;
  } catch (error) {
    console.error('Error searching YouTube:', error.message);
    throw new Error('Error searching YouTube');
  }
}

export default async (req, res) => {
  const userInput = req.body;

  try {
    const { name, age, weight, height, goal, schedule } = userInput;

    const prompt = `Hi ${name}, welcome to your personalized AI workout program! Your safety and well-being are paramount, so please consult with a doctor or certified fitness trainer before embarking on any new workout routine, especially if you have health concerns.

    Based on the information you provided (age: ${age}, weight: ${weight}kg, height: ${height}cm, goal: ${goal}, schedule: ${schedule}), I'm here to guide you through potential workout options. While I can offer suggestions, specific recommendations and assurances of safety or effectiveness are best obtained from a fitness professional.
    NOTE: Give response in the given below example format only.,
    This is the sample response format, give a response in this format only, based on user-provided data:
workoutSuggestions: [
  {
    Day: 1,
    Focus: "Upper Body Strength and Endurance",
    exercises: {
      exercise: [
        "1. Push-ups: Start with knee push-ups if needed. Check out 'Beginner push-ups' on YouTube.",
        "2. Dumbbell Rows: Start light. Look up 'Dumbbell Rows technique' on YouTube for form.",
        "3. Triceps Dips: Use a sturdy chair or bench. Search for 'Triceps dip exercise' on YouTube.",
      ],
      searchTermForYouTube: [
        "How to Beginner push-ups",
        "Dumbbell Rows technique",
        "Triceps dip exercise",
      ],
    },
  },
  {
    Day: 2,
    Focus: "Lower Body Strength and Mobility",
    exercises: {
      exercise: [
        "1. Squats: Master the technique with 'Squats at home' on YouTube.",
        "2. Lunges: Work on balance and strength. Search 'Lunges for beginners' on YouTube.",
        "3. Standing Calf Raises: Tone your calves. Find tutorials with 'Calf raises' on YouTube.",
      ],
      searchTermForYouTube: [
        "How to Squats at home",
        "Lunges for beginners",
        "Calf raises",
      ],
    },
  },
  {
    Day: 3,
    Focus: "Core Stability and Flexibility",
    exercises: {
      exercise: [
        "1. Plank: Hold for as long as you can. Look up 'Plank exercise' on YouTube for guidance.",
        "2. Side Plank: Target your obliques. Check out 'Side Plank technique' on YouTube.",
        "3. Russian Twists: Rotate your core. Search for 'Russian Twists' on YouTube.",
        "4. Bird-Dog: Improve balance and stability. Find tutorials with 'Bird-Dog exercise' on YouTube.",
      ],
      searchTermForYouTube: [
        "How to Plank exercise",
        "Side Plank technique",
        "Russian Twists",
        "Bird-Dog exercise",
      ],
    },
  },
  {
    Day: 4,
    Focus: "Cardio and Active Recovery",
    exercises: {
      exercise: [
        "1. Walking: Start with brisk walks. Look up 'Walking for beginners' on YouTube.",
        "2. Bodyweight Squats: Keep it simple. Check out 'Bodyweight Squats technique' on YouTube.",
        "3. High Knees: Get your heart rate up. Search for 'High Knees exercise' on YouTube.",
        "4. Jumping Jacks: Stay active. Find tutorials with 'Jumping Jacks' on YouTube.",
      ],
      searchTermForYouTube: [
        "Walking for beginners",
        "Bodyweight Squats technique",
        "High Knees exercise",
        "Jumping Jacks",
      ],
    },
  },
]

    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = result && result.response ? result.response : { suggestedUserResponses: [] };
    console.log("response:", response);
    const generatedText = response.text();
    console.log("Generated text:", generatedText);

    // // Replace search terms with YouTube links
    // const modifiedResponse = response.suggestedUserResponses
    //   ? await Promise.all(response.suggestedUserResponses.map(async (term) => {
    //       const searchTermMatch = term.match(/"([^"]+)": "([^"]+)"/);
    //       if (searchTermMatch) {
    //         const [, exercise, searchTerm] = searchTermMatch;
    //         const youtubeLink = await searchYouTube(searchTerm);
    //         return `${exercise}: ${youtubeLink}`;
    //       }
    //       return term;
    //     }))
    //   : generatedText;

    // // Log the modified response to the console
    // console.log("Modified response:", modifiedResponse);

    res.status(200).json({ workoutPlan: generatedText });
  } catch (error) {
    console.error("Error generating modified workout plan:", error);
    res.status(500).json({ error: 'Error generating modified workout plan' });
  }
};
