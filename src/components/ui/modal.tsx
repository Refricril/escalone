"use client";

import { ChevronRight, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import type { Stage, Field, Flow, FieldType, StageFieldConfig } from "../../types";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: 'lg' | 'xl' | '2xl';
}

interface DefaultModalProps extends BaseModalProps {
  variant?: 'default';
  children: React.ReactNode;
}

interface SettingsModalProps extends BaseModalProps {
  variant: 'settings';
  stage: Stage;
  stages: Stage[];
  previousStages?: Stage[];
  onSave: (updates: Partial<Stage>) => void;
  flow?: Flow;
  currentFields?: Field[];
}

type ModalProps = DefaultModalProps | SettingsModalProps;

interface FieldSettingsFormProps {
  flowId: string;
  initialFields: Field[];
  onClose: () => void;
  onSave: (fields: Field[]) => void;
  previousStageFields?: Field[];
  stage?: Stage;
  fieldConfig?: StageFieldConfig;
}

export default function Modal(props: ModalProps) {
  const { isOpen, onClose, title, maxWidth = 'lg' } = props;

  const maxWidthClass = {
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  if (props.variant === 'settings') {
    const { stage, stages, onSave, flow } = props as SettingsModalProps;
    const [allowedMoves, setAllowedMoves] = useState<string[]>(stage.allowedMoves || []);
    const [stageConfig, setStageConfig] = useState<Partial<Stage>>({
      limit: stage.limit,
      color: stage.color,
      icon: stage.icon,
      description: stage.description,
      isDefault: stage.isDefault,
      isFinal: stage.isFinal,
      fieldConfig: stage.fieldConfig || {},
    });

    const handleSaveSettings = () => {
      onSave({ 
        ...stage, 
        ...stageConfig,
        allowedMoves 
      });
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className={`bg-white rounded-lg w-full ${maxWidthClass} mx-4 max-h-[90vh] overflow-hidden`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">Configurar Etapa: {stage.name}</h3>
            <Button 
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 overflow-y-auto">
            <FieldSettingsForm
              flowId={stage.id}
              initialFields={stage.fields || []}
              previousStageFields={stages
                .filter(s => s.order < stage.order)
                .flatMap(s => s.fields || [])}
              stage={stage}
              fieldConfig={stage.fieldConfig}
              onClose={onClose}
              onSave={(fields) => onSave({ ...stage, fields })}
            />
          </div>
          <div className="p-4 border-t mt-auto flex justify-end space-x-2">
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button 
              variant="default"
              onClick={handleSaveSettings}
            >
              Salvar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Modal padrão
  const defaultProps = props as DefaultModalProps;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className={`bg-white rounded-lg w-full ${maxWidthClass} mx-4 max-h-[90vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto">{defaultProps.children}</div>
      </div>
    </div>
  );
}

const FieldSettingsForm: React.FC<FieldSettingsFormProps> = ({
  flowId,
  initialFields,
  onClose,
  onSave,
  previousStageFields = [],
  stage,
  fieldConfig,
}) => {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [inheritFields, setInheritFields] = useState(fieldConfig?.inheritFields || false);

  const fieldTypes: FieldType[] = [
    'text',
    'number',
    'date',
    'dropdown',
    'checkbox',
    'progress',
    'textarea',
    'select'
  ];

  const handleAddField = () => {
    const newField: Field = {
      id: String(Date.now()),
      name: '',
      type: 'text',
      required: false,
      order: fields.length,
      visibility: 'visible',
    };
    setFields([...fields, newField]);
  };

  const handleFieldChange = (index: number, key: keyof Field, value: any) => {
    const updatedFields = [...fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [key]: value
    };
    setFields(updatedFields);
  };
  
  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const sortedFields = fields.map((field, index) => ({
      ...field,
      order: index
    }));
    onSave(sortedFields);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Configurar Campos</h3>
        {previousStageFields.length > 0 && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inheritFields"
              checked={inheritFields}
              onChange={(e) => setInheritFields(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="inheritFields">Herdar campos anteriores</label>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-4 p-4 border rounded-lg">
            <input
              type="text"
              value={field.name}
              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              placeholder="Nome do Campo"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <select
              value={field.type}
              onChange={(e) => handleFieldChange(index, 'type', e.target.value as FieldType)}
              className="px-3 py-2 border rounded-md"
            >
              {fieldTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.required || false}
                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                className="rounded"
              />
              <label>Obrigatório</label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveField(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={handleAddField}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Campo
      </Button>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button 
          variant="default"
          onClick={handleSave}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
};