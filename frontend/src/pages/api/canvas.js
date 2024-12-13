import prisma from '@/src/lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Save canvas
    const { name, content } = req.body;
    try {
      const savedCanvas = await prisma.canvas.create({
        data: {
          name,
          content,
        },
      });
      res.status(200).json(savedCanvas);
    } catch (error) {
      console.error('Error saving canvas:', error);
      res.status(500).json({ error: 'Error saving canvas', details: error.message });
    }
  } else if (req.method === 'GET') {
    // Load canvases
    try {
      const canvases = await prisma.canvas.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      });
      res.status(200).json(canvases);
    } catch (error) {
      console.error('Error loading canvases:', error);
      res.status(500).json({ error: 'Error loading canvases', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

