import { Router, Request, Response } from 'express';
import { Database } from '../db/db';
import { Transaction } from '../../src/types';

const router = Router();

// Get all ledger transactions
router.get('/', (req: Request, res: Response) => {
  try {
    const list = Database.getTransactions();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Create new transaction
router.post('/', (req: Request, res: Response) => {
  try {
    const { type, amount, category, date, details } = req.body;
    if (!type || amount === undefined || !category || !date) {
      res.status(400).json({ error: 'Missing required transaction fields' });
      return;
    }

    const list = Database.getTransactions();
    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      type,
      amount: Number(amount),
      category,
      date,
      details: details || '',
    };

    list.unshift(newTx);
    Database.saveTransactions(list);
    res.status(201).json(newTx);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log transaction' });
  }
});

export default router;
