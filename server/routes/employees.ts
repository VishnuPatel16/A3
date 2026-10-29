import { Router, Request, Response } from 'express';
import { Database } from '../db/db';
import { Employee } from '../../src/types';

const router = Router();

// Get all employees
router.get('/', (req: Request, res: Response) => {
  try {
    const list = Database.getEmployees();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Add a new employee
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, role, phone, salary, pin } = req.body;
    if (!name || !role || !phone || !pin) {
      res.status(400).json({ error: 'Missing required employee fields' });
      return;
    }

    const list = Database.getEmployees();
    const initials = name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const todayStr = new Date().toISOString().split('T')[0];

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      phone,
      salary: Number(salary) || 0,
      pin,
      avatar: initials || 'ST',
      joiningDate: todayStr,
    };

    list.push(newEmp);
    Database.saveEmployees(list);
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// Update an employee
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedEmp: Employee = req.body;

    const list = Database.getEmployees();
    const index = list.findIndex(emp => emp.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    list[index] = { ...list[index], ...updatedEmp, id }; // retain original ID
    Database.saveEmployees(list);
    res.json(list[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete an employee
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = Database.getEmployees();
    const updated = list.filter(emp => emp.id !== id);

    Database.saveEmployees(updated);

    // Additionally cleanup attendance records for this employee
    const attendance = Database.getAttendance();
    const filteredAttendance = attendance.filter(rec => rec.employeeId !== id);
    Database.saveAttendance(filteredAttendance);

    res.json({ message: 'Employee deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
