// types/index.ts

// Tipos básicos para campos
export type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'progress';

export type FieldValue = string | number | boolean | Date | string[] | boolean[] | null | { [key: string]: any };

export type DateStatus = 'overdue' | 'urgent' | 'warning' | 'ok' | null;

// Estrutura para validação de campos
export type FieldValidation = {
 required?: boolean;
 minLength?: number;
 maxLength?: number;
 pattern?: RegExp;
 min?: number;
 max?: number;
};

// Estrutura para referência de estágio
export interface StageRef {
 stageId: string;
 stageName: string;
}

// Estrutura do histórico de cartões
export interface CardHistory {
 date: Date; 
 from: StageRef;
 to: StageRef;
 fields: Record<string, FieldValue>;
}

// Estrutura de um campo completa
export interface Field {
 id: string;
 name: string;
 type: FieldType;
 options?: string[];
 required?: boolean;
 defaultValue?: FieldValue;
 validation?: FieldValidation;
 description?: string;
 dependsOn?: string;
 sourceStage?: string;
 readOnly?: boolean;
 visibility?: 'visible' | 'hidden' | 'readonly';
}

// Estrutura de um campo herdado
export interface InheritedField extends Field {
 sourceStage: string;
 originalField: Field;
}

// Estrutura de comentários
export type Comment = {
 id: string;
 cardId: string;
 userId: string;
 text: string;
 createdAt: Date;
 updatedAt?: Date;
};

// Estrutura de um cartão
export type CardType = {
 id: string;
 title: string;
 fields: Record<string, FieldValue>;
 stageId: string;
 createdAt: Date;
 updatedAt: Date;
 assignedTo?: string;
 priority?: 'low' | 'medium' | 'high';
 tags?: string[];
 dueDate?: Date;
 comments?: Comment[];
 history?: CardHistory[];
};

// Configuração de campos em uma etapa
export interface StageFieldConfig {
 inheritFields?: boolean;
 lockInheritedFields?: boolean;
 requiredFields?: string[];
 hiddenFields?: string[];
}

// Estrutura de um estágio do kanban
export interface Stage {
 id: string;
 name: string;
 cards: CardType[];
 order: number;
 limit?: number;
 fields?: Field[];
 allowedMoves?: string[];
 autoMove?: {
   condition: string;
   targetStageId: string;
 };
 fieldConfig?: StageFieldConfig;
}

// Estrutura do fluxo completo
export interface Flow {
 id: string;
 name: string;
 description?: string;
 cards: number;
 members: number;
 stages: Stage[];
 fields: Field[];
 createdAt: Date;
 updatedAt: Date;
 ownerId: string;
 settings?: FlowSettings;
}

// Configurações do fluxo
export type FlowSettings = {
 requireComments?: boolean;
 allowCardDelete?: boolean;
 autoAssignment?: boolean;
 notifyOnChange?: boolean;
 cardNumberPrefix?: string;
 defaultDueDateDays?: number;
};

// Tipos para ações e eventos
export type CardAction = 'create' | 'update' | 'delete' | 'move' | 'assign' | 'comment';

// Props para o KanbanBoard
export interface KanbanBoardProps {
 stages: Stage[];
 fields: Field[];
 addStage: (name: string) => void;
 addCard: (stageId: string, card: Partial<CardType>) => void;
 updateCard: (stageId: string, cardId: string, card: CardType) => void;
 deleteCard?: (stageId: string, cardId: string) => void;
 moveCard?: (cardId: string, fromStageId: string, toStageId: string) => void;
 onCardClick?: (card: CardType) => void;
 updateStage?: (stageId: string, updates: Partial<Stage>) => void;
 configureStage?: (stage: Stage) => void;
}

// Props para o Modal de Configurações de Estágio
export interface StageSettingsModalProps {
 stage: Stage;
 onClose: () => void;
 onSave: (updates: Partial<Stage>) => void;
 previousStages: Stage[];
 stages: Stage[];
}

// Props para o Modal de Edição de Cartão
export interface CardEditModalProps {
 card: CardType;
 fields: Field[];
 stages: Stage[];
 onSave: (updatedCard: CardType) => void;
 onClose: () => void;
 onMove?: (cardId: string, toStageId: string) => void;
 onDelete?: (cardId: string) => void;
}

// Props para o Editor de Campos
export interface FieldEditorProps {
 field?: Field;
 onSave: (field: Field) => void;
 onClose: () => void;
 isOpen: boolean;
}

// Props para o Formulário de Novo Cartão
export interface NewCardFormProps {
  fields: Field[];
  stageId: string; // Mudado de number para string
  initialData?: CardType;
  onSubmit: (card: Partial<CardType>) => void;
  onClose: () => void;
  previousFields?: Field[];
}
// Props para o Modal de Configurações do Fluxo
export interface FlowSettingsModalProps {
 flowId: string;
 stage: Stage;
 initialFields: Field[];
 previousStageFields?: Field[];
 availableStages: Stage[];
 onClose: () => void;
 onSave: (updates: Partial<Stage>) => void;
 onDelete: (stageId: string) => void;
}

// Props para Configuração de Campo em Estágio
export interface StageFieldSettingsProps {
 field: Field;
 stage: Stage;
 onUpdate: (fieldId: string, updates: Partial<Field>) => void;
}

// Interface para o histórico de campos
export interface FieldHistory {
 fieldId: string;
 stageId: string;
 value: FieldValue;
 timestamp: Date;
 userId: string;
}

// Interface para validação de transição entre estágios
export interface StageTransitionValidation {
 fromStageId: string;
 toStageId: string;
 requiredFields?: string[];
 conditions?: {
   fieldId: string;
   operator: 'equals' | 'notEquals' | 'filled' | 'notFilled';
   value?: any;
 }[];
}