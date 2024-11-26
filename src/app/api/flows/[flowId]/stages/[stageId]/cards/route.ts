
// src/app/api/flows/[flowId]/stages/[stageId]/cards/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { Flow, CardType } from "../.././../../../../../types";

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

export async function POST(
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

    const stage = flow.stages.find(s => s.id === params.stageId);
    if (!stage) {
      return NextResponse.json(
        { error: 'Stage não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const newCard: CardType = {
      ...body,
      id: String(Date.now()),
      stageId: params.stageId,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: []
    };

    stage.cards.push(newCard);
    flow.cards = flow.stages.reduce((sum, s) => sum + s.cards.length, 0);
    
    await saveFlows(flows);

    return NextResponse.json(flow, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar card' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { flowId: string; stageId: string; cardId: string } }
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

    const stage = flow.stages.find(s => s.id === params.stageId);
    if (!stage) {
      return NextResponse.json(
        { error: 'Stage não encontrado' },
        { status: 404 }
      );
    }

    const cardIndex = stage.cards.findIndex(c => c.id === params.cardId);
    if (cardIndex === -1) {
      return NextResponse.json(
        { error: 'Card não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updatedCard = {
      ...stage.cards[cardIndex],
      ...body,
      updatedAt: new Date()
    };

    stage.cards[cardIndex] = updatedCard;
    await saveFlows(flows);

    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar card' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { flowId: string; stageId: string; cardId: string } }
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

    const stage = flow.stages.find(s => s.id === params.stageId);
    if (!stage) {
      return NextResponse.json(
        { error: 'Stage não encontrado' },
        { status: 404 }
      );
    }

    const cardIndex = stage.cards.findIndex(c => c.id === params.cardId);
    if (cardIndex === -1) {
      return NextResponse.json(
        { error: 'Card não encontrado' },
        { status: 404 }
      );
    }

    stage.cards.splice(cardIndex, 1);
    flow.cards = flow.stages.reduce((sum, s) => sum + s.cards.length, 0);
    
    await saveFlows(flows);

    return NextResponse.json(flow);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar card' },
      { status: 500 }
    );
  }
}