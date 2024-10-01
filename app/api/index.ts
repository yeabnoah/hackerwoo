import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { action, data } = req.body;

      if (action !== 'generateIdea') {
        return res.status(400).json({ error: 'Invalid action' });
      }

      // Here, you would typically call your AI service to generate the idea
      // For now, let's return a mock response
      const mockIdea = `A ${data.theme} app that uses ${data.technologies.join(', ')} to solve ${data.problem}. Suitable for ${data.skillLevel} developers and can be built in ${data.timeRange}.`;

      res.status(200).json({ result: mockIdea });
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}