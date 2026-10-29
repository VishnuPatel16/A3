import { Router, Request, Response } from 'express';
import { Database } from '../db/db';
import { AttendanceRecord, AttendanceStatus } from '../../src/types';

const router = Router();

// Helper to get localized current time in HH:MM AM/PM format
const formatToLocalTime = () => {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  const hrStr = hours < 10 ? '0' + hours : hours;
  return `${hrStr}:${minStr} ${ampm}`;
};

// Get all attendance sheet
router.get('/', (req: Request, res: Response) => {
  try {
    const list = Database.getAttendance();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance history' });
  }
});

// Employee Punch In
router.post('/punch-in', (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      res.status(400).json({ error: 'Missing employee ID' });
      return;
    }

    const attendance = Database.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = formatToLocalTime();

    const existingIndex = attendance.findIndex(r => r.employeeId === employeeId && r.date === todayStr);

    let RecordToReturn: AttendanceRecord;

    if (existingIndex > -1) {
      attendance[existingIndex] = {
        ...attendance[existingIndex],
        status: 'Present',
        punchIn: timeNow,
      };
      RecordToReturn = attendance[existingIndex];
    } else {
      const newRec: AttendanceRecord = {
        id: `att-t-${Date.now()}`,
        employeeId,
        date: todayStr,
        status: 'Present',
        punchIn: timeNow,
        punchOut: null,
      };
      attendance.push(newRec);
      RecordToReturn = newRec;
    }

    Database.saveAttendance(attendance);
    res.json(RecordToReturn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record punch-in' });
  }
});

// Employee Punch Out
router.post('/punch-out', (req: Request, res: Response) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      res.status(400).json({ error: 'Missing employee ID' });
      return;
    }

    const attendance = Database.getAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = formatToLocalTime();

    const existingIndex = attendance.findIndex(r => r.employeeId === employeeId && r.date === todayStr);

    if (existingIndex > -1) {
      attendance[existingIndex] = {
        ...attendance[existingIndex],
        punchOut: timeNow,
      };
      Database.saveAttendance(attendance);
      res.json(attendance[existingIndex]);
    } else {
      res.status(404).json({ error: 'No punch-in recorded for today' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to record punch-out' });
  }
});

// Admin Manual Update / Correction
router.put('/update', (req: Request, res: Response) => {
  try {
    const { employeeId, date, status, punchIn, punchOut, notes } = req.body;

    if (!employeeId || !date || !status) {
      res.status(400).json({ error: 'Missing employeeId, date, or status fields' });
      return;
    }

    const attendance = Database.getAttendance();
    const existingIndex = attendance.findIndex(r => r.employeeId === employeeId && r.date === date);

    const finalIn = (status === 'Absent' || status === 'Leave') ? null : punchIn;
    const finalOut = (status === 'Absent' || status === 'Leave') ? null : punchOut;

    let RecordToReturn: AttendanceRecord;

    if (existingIndex > -1) {
      attendance[existingIndex] = {
        ...attendance[existingIndex],
        status: status as AttendanceStatus,
        punchIn: finalIn,
        punchOut: finalOut,
        notes: notes !== undefined ? notes : attendance[existingIndex].notes,
      };
      RecordToReturn = attendance[existingIndex];
    } else {
      const newRec: AttendanceRecord = {
        id: `att-manual-${Date.now()}`,
        employeeId,
        date,
        status: status as AttendanceStatus,
        punchIn: finalIn,
        punchOut: finalOut,
        notes: notes || '',
      };
      attendance.push(newRec);
      RecordToReturn = newRec;
    }

    Database.saveAttendance(attendance);
    res.json(RecordToReturn);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

export default router;
