import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Save report
    const { name, data } = req.body
    try {
      const savedReport = await prisma.report.create({
        data: {
          name,
          data,
        },
      })
      res.status(200).json(savedReport)
    } catch (error) {
      res.status(500).json({ error: 'Error saving report' })
    }
  } else if (req.method === 'GET') {
    // Get all reports
    try {
      const reports = await prisma.report.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      })
      res.status(200).json(reports)
    } catch (error) {
      res.status(500).json({ error: 'Error fetching reports' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

