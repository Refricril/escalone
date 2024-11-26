// types/index.ts

// Tipos básicos para campos
export type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'progress' | 'textarea' | 'select';

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
  customValidation?: (value: any) => boolean | string;
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
  userId?: string;
  reason?: string;
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
  placeholder?: string;
  helpText?: string;
  group?: string;
  order?: number;
}

// Estrutura de um campo herdado
export interface InheritedField extends Field {
  sourceStage: string;
  originalField: Field;
  inheritedFrom?: string;
  lockValue?: boolean;
}

// Estrutura de comentários
export type Comment = {
  id: string;
  cardId: string;
  userId: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: string[];
  mentions?: string[];
  reactions?: {
    type: string;
    users: string[];
  }[];
};

// Estrutura do cartão
export type CardType = {
  id: string;
  title: string;
  fields: Record<string, FieldValue>;
  stageId: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string[];
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  dueDate?: Date;
  comments?: Comment[];
  history?: CardHistory[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
    uploadedBy: string;
  }[];
  watchers?: string[];
  status?: 'active' | 'archived' | 'deleted';
  metadata?: Record<string, any>;
};

// Configuração de campos em uma etapa
export interface StageFieldConfig {
  inheritFields?: boolean;
  lockInheritedFields?: boolean;
  requiredFields?: string[];
  hiddenFields?: string[];
  readOnlyFields?: string[];
  defaultValues?: Record<string, FieldValue>;
  validations?: Record<string, FieldValidation>;
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
    triggerFields?: string[];
  };
  fieldConfig?: StageFieldConfig;
  color?: string;
  icon?: string;
  description?: string;
  isDefault?: boolean;
  isFinal?: boolean;
  notifications?: {
    onEnter?: boolean;
    onExit?: boolean;
    onDue?: boolean;
  };
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
  permissions?: FlowPermissions;
  teams?: string[];
  tags?: string[];
  template?: boolean;
  category?: string;
  customization?: FlowCustomization;
}

// Configurações do fluxo
export type FlowSettings = {
  requireComments?: boolean;
  allowCardDelete?: boolean;
  autoAssignment?: boolean;
  notifyOnChange?: boolean;
  cardNumberPrefix?: string;
  defaultDueDateDays?: number;
  allowMultipleAssignees?: boolean;
  requireDueDate?: boolean;
  allowTags?: boolean;
  maxAttachmentSize?: number;
  allowedAttachmentTypes?: string[];
  archiveOnComplete?: boolean;
};

// Permissões do fluxo
export interface FlowPermissions {
  view?: string[];
  edit?: string[];
  manage?: string[];
  createCards?: string[];
  moveCards?: string[];
  comment?: string[];
  assign?: string[];
}

// Customização do fluxo
export interface FlowCustomization {
  theme?: {
    primary: string;
    secondary: string;
    background: string;
  };
  cardLayout?: 'compact' | 'normal' | 'detailed';
  showCardNumbers?: boolean;
  showCardAge?: boolean;
  showAssignees?: boolean;
  showDates?: boolean;
  showTags?: boolean;
  showComments?: boolean;
}

// Tipos para ações e eventos
export type CardAction = 'create' | 'update' | 'delete' | 'move' | 'assign' | 'comment' | 'attach' | 'tag' | 'archive';

// Props para o KanbanBoard
export interface KanbanBoardProps {
  stages?: Stage[];
  fields?: Field[];
  addStage?: (name: string) => void;
  addCard?: (stageId: string, card: Partial<CardType>) => void;
  updateCard?: (stageId: string, cardId: string, card: CardType) => void;
  deleteCard?: (stageId: string, cardId: string) => void;
  moveCard?: (cardId: string, fromStageId: string, toStageId: string) => void;
  updateStage?: (stageId: string, updates: Partial<Stage>) => void;
  configureStage?: (stage: Stage) => void;
  onCardClick?: (card: CardType) => void;
  currentFlow?: Flow;
  onError?: (error: Error) => void;
  onStageUpdate?: (stage: Stage) => void;
  onCardUpdate?: (card: CardType) => void;
}

// Mantendo as outras interfaces existentes e adicionando mais específicas conforme necessário...
export interface StageSettingsModalProps {
  stage: Stage;
  onClose: () => void;
  onSave: (updates: Partial<Stage>) => void;
  previousStages: Stage[];
  stages: Stage[];
  flow: Flow;
}

export interface CardEditModalProps {
  card: CardType;
  fields: Field[];
  stages: Stage[];
  onSave: (updatedCard: CardType) => void;
  onClose: () => void;
  onMove?: (cardId: string, toStageId: string) => void;
  onDelete?: (cardId: string) => void;
  flow: Flow;
}

export interface FieldEditorProps {
  field?: Field;
  onSave: (field: Field) => void;
  onClose: () => void;
  isOpen: boolean;
  existingFields?: Field[];
  flow?: Flow;
}

export interface NewCardFormProps {
  fields: Field[];
  stageId: string;
  initialData?: CardType;
  onSubmit: (card: Partial<CardType> & {
    fields?: Record<string, FieldValue>;
  }) => void;
  onClose: () => void;
  previousFields?: Field[];
  flow?: Flow;
  stage?: Stage;
}

export interface FlowSettingsModalProps {
  flowId: string;
  stage: Stage;
  initialFields: Field[];
  previousStageFields?: Field[];
  availableStages: Stage[];
  onClose: () => void;
  onSave: (updates: Partial<Stage>) => void;
  onDelete: (stageId: string) => void;
  flow: Flow;
}

export interface StageFieldSettingsProps {
  field: Field;
  stage: Stage;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  flow: Flow;
}

export interface FieldHistory {
  fieldId: string;
  stageId: string;
  value: FieldValue;
  timestamp: Date;
  userId: string;
  previousValue?: FieldValue;
  reason?: string;
}

export interface StageTransitionValidation {
  fromStageId: string;
  toStageId: string;
  requiredFields?: string[];
  conditions?: {
    fieldId: string;
    operator: 'equals' | 'notEquals' | 'filled' | 'notFilled' | 'greaterThan' | 'lessThan';
    value?: any;
    errorMessage?: string;
  }[];
  validationMessage?: string;
  blockTransition?: boolean;
}