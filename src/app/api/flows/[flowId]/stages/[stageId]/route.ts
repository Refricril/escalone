
// src/app/api/flows/[flowId]/stages/[stageId]/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Flow, Stage } from "../../../../../../types";

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

export async function PUT(
  request: Request,
  { params }: { params: { flowId: string; stageId: string } }
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

    const stageIndex = flow.stages.findIndex(s => s.id === params.stageId);
    if (stageIndex === -1) {
      return NextResponse.json(
        { error: 'Stage não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedStage = {
      ...flow.stages[stageIndex],
      ...body,
      updatedAt: new Date()
    };

    flow.stages[stageIndex] = updatedStage;
    await saveFlows(flows);

    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar stage' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { flowId: string; stageId: string } }
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

    const stageIndex = flow.stages.findIndex(s => s.id === params.stageId);
    if (stageIndex === -1) {
      return NextResponse.json(
        { error: 'Stage não encontrado' },
        { status: 404 }
      );
    }

    flow.stages.splice(stageIndex, 1);
    await saveFlows(flows);

    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar stage' },
      { status: 500 }
    );
  }
}