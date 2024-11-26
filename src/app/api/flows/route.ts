// src/app/api/flows/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Flow } from '@/types';

const FLOWS_FILE = path.join(process.cwd(), 'data', 'flows.json');

async function getFlows(): Promise<Flow[]> {
  try {
    const data = await fs.readFile(FLOWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler flows:', error);
    return [];
  }
}

async function saveFlows(flows: Flow[]): Promise<void> {
  await fs.writeFile(FLOWS_FILE, JSON.stringify(flows, null, 2));
}

export async function GET() {
  try {
    const flows = await getFlows();
    return NextResponse.json(flows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar flows' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const flows = await getFlows();
    const body = await request.json();

    const newFlow: Flow = {
      ...body,
      id: String(Date.now()),
      cards: 0,
      stages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    flows.push(newFlow);
    await saveFlows(flows);
    
    return NextResponse.json(newFlow, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar flow' },
      { status: 500 }
    );
  }
}
