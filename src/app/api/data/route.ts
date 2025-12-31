import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return { habits: [], tasks: [], workflowTasks: [] };
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(content);
    if (!data.workflowTasks) data.workflowTasks = [];
    return data;
}

function writeData(data: any) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
    const data = readData();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const data = readData();

    if (body.type === 'habit') {
        const newHabit = {
            ...body.habit,
            id: Math.random().toString(36).substr(2, 9),
            completedDates: [],
            streak: 0
        };
        data.habits.push(newHabit);
    } else if (body.type === 'task') {
        const newTask = {
            ...body.task,
            id: Math.random().toString(36).substr(2, 9),
            completed: false,
            dueDate: body.task.dueDate || new Date().toISOString().split('T')[0]
        };
        data.tasks.push(newTask);
    } else if (body.type === 'toggleTask') {
        data.tasks = data.tasks.map((t: any) =>
            t.id === body.id ? { ...t, completed: !t.completed } : t
        );
    } else if (body.type === 'deleteTask') {
        data.tasks = data.tasks.filter((t: any) => t.id !== body.id);
    } else if (body.type === 'toggleHabit') {
        data.habits = data.habits.map((h: any) => {
            if (h.id === body.id) {
                const completedDates = h.completedDates.includes(body.date)
                    ? h.completedDates.filter((d: string) => d !== body.date)
                    : [...h.completedDates, body.date];
                return { ...h, completedDates };
            }
            return h;
        });
    } else if (body.type === 'workflowTask') {
        const newTask = {
            ...body.task,
            id: Math.random().toString(36).substr(2, 9),
            status: body.task.status || 'NOT_STARTED',
            createdAt: new Date().toISOString()
        };
        data.workflowTasks.push(newTask);
    } else if (body.type === 'bulkWorkflowTasks') {
        const newTasks = body.tasks.map((task: any) => ({
            ...task,
            id: Math.random().toString(36).substr(2, 9),
            status: body.status || 'NOT_STARTED',
            createdAt: new Date().toISOString()
        }));
        data.workflowTasks.push(...newTasks);
    } else if (body.type === 'moveWorkflowTask') {
        data.workflowTasks = data.workflowTasks.map((t: any) =>
            t.id === body.id ? { ...t, status: body.status } : t
        );
    } else if (body.type === 'deleteWorkflowTask') {
        data.workflowTasks = data.workflowTasks.filter((t: any) => t.id !== body.id);
    }

    writeData(data);
    return NextResponse.json(data);
}
