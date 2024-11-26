// src/app/api/flows/[flowId]/route.ts
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

export async function GET(
  request: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const flows = await getFlows();
    const flow = flows.find(f => f.id === params.flowId);

    if (!flow) {
      return NextResponse.json(
        { error: 'Flow não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar flow' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const flows = await getFlows();
    const flowIndex = flows.findIndex(f => f.id === params.flowId);

    if (flowIndex === -1) {
      return NextResponse.json(
        { error: 'Flow não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedFlow = {
      ...flows[flowIndex],
      ...body,
      updatedAt: new Date()
    };

    flows[flowIndex] = updatedFlow;
    await saveFlows(flows);

    return NextResponse.json(updatedFlow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar flow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { flowId: string } }
) {
  try {
    const flows = await getFlows();
    const flowIndex = flows.findIndex(f => f.id === params.flowId);

    if (flowIndex === -1) {
      return NextResponse.json(
        { error: 'Flow não encontrado' },
        { status: 404 }
      );
    }

    flows.splice(flowIndex, 1);
    await saveFlows(flows);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar flow' },
      { status: 500 }
    );
  }
}