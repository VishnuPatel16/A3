import { Router, Request, Response } from 'express';
import { Database } from '../db/db';
import { InventoryItem, Transaction } from '../../src/types';

const router = Router();

// Get all inventory
router.get('/', (req: Request, res: Response) => {
  try {
    const list = Database.getInventory();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Add a new raw material item
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, category, quantity, unit, minStockLevel, pricePerUnit } = req.body;
    if (!name || !category || quantity === undefined || !unit || minStockLevel === undefined || pricePerUnit === undefined) {
      res.status(400).json({ error: 'Missing required inventory fields' });
      return;
    }

    const list = Database.getInventory();
    const todayStr = new Date().toISOString().split('T')[0];

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name,
      category,
      quantity: Number(quantity),
      unit,
      minStockLevel: Number(minStockLevel),
      pricePerUnit: Number(pricePerUnit),
      lastRestocked: todayStr,
      markedLowByStaff: false,
    };

    list.push(newItem);
    Database.saveInventory(list);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

// Update an item (such as staff marking low stock)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body: Partial<InventoryItem> = req.body;

    const list = Database.getInventory();
    const index = list.findIndex(item => item.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    // Blend values
    list[index] = { ...list[index], ...body, id };
    Database.saveInventory(list);
    res.json(list[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Restock an item and register transaction in ledger/accounts
router.post('/:id/restock', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { addQty, customPrice } = req.body;

    if (addQty === undefined || Number(addQty) <= 0) {
      res.status(400).json({ error: 'Invalid restock quantity' });
      return;
    }

    const inventory = Database.getInventory();
    const itemIndex = inventory.findIndex(i => i.id === id);

    if (itemIndex === -1) {
      res.status(404).json({ error: 'Inventory item not found' });
      return;
    }

    const item = inventory[itemIndex];
    const actualPrice = customPrice !== undefined ? Number(customPrice) : item.pricePerUnit;
    const newQty = item.quantity + Number(addQty);
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Update Inventory item status
    inventory[itemIndex] = {
      ...item,
      quantity: newQty,
      pricePerUnit: actualPrice,
      lastRestocked: todayStr,
      markedLowByStaff: false, // clear alert
    };
    Database.saveInventory(inventory);

    // 2. Automatically log purchase in expense transactions
    const transactions = Database.getTransactions();
    const purchaseAmount = Math.round(Number(addQty) * actualPrice);
    
    // Clean name of any parens or extra tags
    const cleanName = item.name.split(' (')[0];

    const newTx: Transaction = {
      id: `t-restock-${Date.now()}`,
      type: 'expense',
      amount: purchaseAmount,
      category: 'Grocery Purchase',
      date: todayStr,
      details: `Restocked ${cleanName} (+${addQty} ${item.unit} purchased)`,
    };

    transactions.unshift(newTx);
    Database.saveTransactions(transactions);

    res.json({
      item: inventory[itemIndex],
      transaction: newTx,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restock item' });
  }
});

export default router;
