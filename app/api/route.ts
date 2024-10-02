import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ... existing interface ...

export const GET = async (req: NextRequest) => {
	try {
		const apiKey = process.env.GOOGLE_API_KEY;
		
		if (!apiKey) {
			throw new Error('GOOGLE_API_KEY is not set in the environment variables');
		}
  
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		const prompt = req.nextUrl.searchParams.get('prompt') || "Write a story about a magic backpack.";

		const result = await model.generateContent(prompt);
		const response = await result.response.text();

		return NextResponse.json({ message: response });
	} catch (error: any) {
		console.error('Error generating content:', error);

		if (error.message === 'GOOGLE_API_KEY is not set in the environment variables') {
			return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
		}

		if (error.status === 400 && error.errorDetails?.[0]?.reason === 'API_KEY_INVALID') {
			return NextResponse.json({ error: 'Invalid API key' }, { status: 500 });
		}

		return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
	}
};

export async function POST(req: Request) {
	try {
		const { action, data } = await req.json();
		const apiKey = process.env.GOOGLE_API_KEY;

		if (!apiKey) {
			return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });

		if (action === 'generateIdea') {
			const prompt = `Generate a detailed hackathon project idea based on the following information:
				Theme: ${data.theme}
				Technologies: ${data.technologies.join(', ')}
				Problem to solve: ${data.problem}
				Time range: ${data.timeRange}
				Skill level: ${data.skillLevel}
				
				Please provide the following in a valid JSON format:
				{
					"projectTitle": "Title of the project",
					"briefDescription": "A brief description of the project",
					"keyFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
					"technicalStack": ["Tech 1", "Tech 2", "Tech 3"],
					"potentialChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
					"uniqueSellingPoints": ["USP 1", "USP 2", "USP 3"],
					"targetAudience": "Description of the target audience",
					"futureEnhancements": ["Enhancement 1", "Enhancement 2", "Enhancement 3"]
				}`;
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();
			
			try {
				const jsonResult = JSON.parse(text);
				return NextResponse.json({ result: jsonResult });
			} catch (parseError) {
				console.error('Error parsing JSON:', parseError);
				// Attempt to extract JSON from the text
				const jsonMatch = text.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const extractedJson = JSON.parse(jsonMatch[0]);
						return NextResponse.json({ result: extractedJson });
					} catch (extractError) {
						console.error('Error parsing extracted JSON:', extractError);
					}
				}
				return NextResponse.json({ 
					error: 'Failed to parse AI response', 
					rawResponse: text,
					parseError: parseError instanceof Error ? parseError.message : String(parseError)
				}, { status: 500 });
			}
		} else if (action === 'generateTasks') {
			const { idea, teamMembers } = data;
			const prompt = `Given the following hackathon project idea and team members, create a detailed task breakdown for each team member based on their skills and skill level. Provide the output as a JSON object where the keys are team member names and the values are objects containing an array of tasks and a total estimated time for that member.

			Project Idea:
			${JSON.stringify(idea, null, 2)}

			Team Members:
			${JSON.stringify(teamMembers, null, 2)}

			Please provide the task breakdown in the following JSON format:
			{
			  "Team Member Name": {
			    "tasks": [
			      {
			        "description": "Task description",
			        "explanation": "Detailed explanation of the task",
			        "estimatedTime": 2
			      },
			      // ... more tasks
			    ],
			    "totalTime": 10
			  },
			  // ... more team members
			}

			Ensure that the estimated time for each task and the total time for each member are realistic and appropriate for a hackathon project.`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();

			try {
				const jsonResult = JSON.parse(text);
				return NextResponse.json({ result: jsonResult });
			} catch (parseError) {
				console.error('Error parsing JSON:', parseError);
				// Attempt to extract JSON from the text
				const jsonMatch = text.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					try {
						const extractedJson = JSON.parse(jsonMatch[0]);
						return NextResponse.json({ result: extractedJson });
					} catch (extractError) {
						console.error('Error parsing extracted JSON:', extractError);
					}
				}
				return NextResponse.json({ 
					error: 'Failed to parse AI response', 
					rawResponse: text,
					parseError: parseError instanceof Error ? parseError.message : String(parseError)
				}, { status: 500 });
			}
		} else if (action === 'chat') {
			const { messages, idea, taskBreakdown } = data;
			const prompt = `You are an AI assistant helping with a hackathon project. Here's the context:

			Project Idea:
			${JSON.stringify(idea, null, 2)}

			Task Breakdown:
			${JSON.stringify(taskBreakdown, null, 2)}

			Previous messages:
			${messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')}

			User's latest message: ${messages[messages.length - 1].content}

			Please provide a helpful response to the user's latest message, considering the project idea and task breakdown.`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();

			return NextResponse.json({ result: text });
		} else {
			return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}
	} catch (error: any) {
		console.error('Error in POST request:', error);
		return NextResponse.json({ 
			error: 'Internal server error', 
			details: error.message,
			stack: error.stack
		}, { status: 500 });
	}
}