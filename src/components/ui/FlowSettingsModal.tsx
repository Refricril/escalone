"use client"

import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2, ChevronRight, Edit } from 'lucide-react';
import type { Field, FieldType, Stage } from "../../types";

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

const FlowSettingsModal: React.FC<FlowSettingsModalProps> = ({
  flowId,
  stage,
  initialFields,
  previousStageFields,
  availableStages = [],
  onClose,
  onSave,
  onDelete
}) => {
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [showPreviousFields, setShowPreviousFields] = useState(false);
  const [showMovements, setShowMovements] = useState(false);
  const [allowedMoves, setAllowedMoves] = useState<string[]>(stage.allowedMoves || []);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [stageName, setStageName] = useState(stage.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setFields(initialFields);
    setAllowedMoves(stage.allowedMoves || []);
  }, [initialFields, stage.allowedMoves]);

  const getDefaultValueForType = (type: FieldType) => {
    switch (type) {
      case 'checkbox':
        return false;
      case 'progress':
        return new Array(options.length).fill(false);
      case 'number':
        return 0;
      default:
        return '';
    }
  };

  const handleSubmitField = () => {
    if (!fieldName.trim()) return;
  
    if (editingField) {
      const updatedField: Field = {
        ...editingField,
        name: fieldName,
        type: fieldType,
        required: isRequired,
        options: ['dropdown', 'checkbox', 'progress'].includes(fieldType) ? options : undefined,
        defaultValue: fieldType === editingField.type 
          ? editingField.defaultValue 
          : getDefaultValueForType(fieldType),
      };
  
      setFields(fields.map(field => 
        field.id === editingField.id ? updatedField : field
      ));
    } else {
      const newField: Field = {
        id: String(Date.now()),
        name: fieldName,
        type: fieldType,
        required: isRequired,
        defaultValue: getDefaultValueForType(fieldType),
        options: ['dropdown', 'checkbox', 'progress'].includes(fieldType) ? options : undefined,
      };
  
      setFields([...fields, newField]);
    }
  
    resetForm();
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setFieldName(field.name);
    setFieldType(field.type);
    setIsRequired(field.required || false);
    if (field.options) {
      setOptions([...field.options]);
    } else {
      setOptions([]);
    }
  };

  const resetForm = () => {
    setFieldName("");
    setFieldType("text");
    setOptions([]);
    setNewOption("");
    setIsRequired(false);
    setEditingField(null);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption)) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (optionToRemove: string) => {
    setOptions(options.filter(option => option !== optionToRemove));
  };

  const shouldShowOptions = (type: FieldType) => {
    return ['dropdown', 'checkbox', 'progress'].includes(type);
  };

  const getOptionsLabel = (type: FieldType) => {
    switch (type) {
      case 'progress':
        return 'Itens da lista de progresso';
      case 'checkbox':
        return 'Opções de checkbox';
      default:
        return 'Opções da lista';
    }
  };

  const handleSave = () => {
    onSave({
      ...stage,
      name: stageName,
      fields: fields,
      allowedMoves: allowedMoves
    });
  };

  const handleDelete = () => {
    onDelete(stage.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Configurar Etapa: {stageName}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {showDeleteDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
              <h3 className="text-lg font-medium mb-4">Confirmar exclusão</h3>
              <p className="mb-6">Tem certeza que deseja excluir esta etapa? Esta ação não pode ser desfeita.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Nome da Etapa</label>
          <input
            type="text"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowMovements(!showMovements)}
            className="flex items-center space-x-2 text-blue-600 mb-3"
          >
            <ChevronRight
              className={`w-5 h-5 transform transition-transform ${
                showMovements ? 'rotate-90' : ''
              }`}
            />
            <span>Gerenciar Movimentações Permitidas</span>
          </button>
   
          {showMovements && (
            <div className="space-y-2 bg-gray-50 p-4 rounded">
              {availableStages
                .filter(s => s.id !== stage.id)
                .map(targetStage => (
                  <label key={targetStage.id} className="flex items-center space-x-2 p-2">
                    <input
                      type="checkbox"
                      checked={allowedMoves.includes(targetStage.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAllowedMoves([...allowedMoves, targetStage.id]);
                        } else {
                          setAllowedMoves(allowedMoves.filter(id => id !== targetStage.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>Permitir mover para "{targetStage.name}"</span>
                  </label>
                ))}
              {availableStages.filter(s => s.id !== stage.id).length === 0 && (
                <p className="text-sm text-gray-500 p-2">
                  Não há outras etapas disponíveis para configurar movimentações.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Campos da Etapa</h3>
          
          {previousStageFields && previousStageFields.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowPreviousFields(!showPreviousFields)}
                className="flex items-center space-x-2 text-blue-600 mb-3"
              >
                <ChevronRight
                  className={`w-5 h-5 transform transition-transform ${
                    showPreviousFields ? 'rotate-90' : ''
                  }`}
                />
                <span>Ver campos das etapas anteriores</span>
              </button>

              {showPreviousFields && (
                <div className="space-y-2 bg-gray-50 p-4 rounded">
                  {previousStageFields.map(field => (
                    <div
                      key={field.id}
                      className="flex justify-between items-center p-3 bg-white rounded"
                    >
                      <div>
                        <span className="font-medium">{field.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                        {field.options && (
                          <div className="text-sm text-gray-500 mt-1">
                            {field.type === 'progress' ? 'Itens: ' : 'Opções: '}
                            {field.options.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Nome do campo"
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as FieldType)}
                className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="date">Data</option>
                <option value="dropdown">Lista de Seleção</option>
                <option value="checkbox">Lista de Checkbox</option>
                <option value="progress">Lista de Progresso</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label>Campo obrigatório</label>
            </div>

            {shouldShowOptions(fieldType) && (
              <div className="border p-4 rounded">
                <h3 className="font-medium mb-2">{getOptionsLabel(fieldType)}</h3>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Nova opção"
                    className="px-3 py-2 border rounded flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <button
                    onClick={addOption}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map((option, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
                    >
                      {option}
                      <button
                        onClick={() => removeOption(option)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
                {fieldType === 'progress' && options.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    Total de itens: {options.length}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmitField}
              disabled={!fieldName.trim()}
              className={`w-full px-4 py-2 text-white rounded transition-colors ${
                fieldName.trim() 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {editingField ? 'Atualizar Campo' : 'Adicionar Campo'}
            </button>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-medium mb-2">Campos Configurados</h3>
            {fields.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nenhum campo configurado ainda
              </p>
            ) : (
              fields.map(field => (
                <div
                  key={field.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <div>
                    <span className="font-medium">{field.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({field.type})</span>
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.options && (
                      <div className="text-sm text-gray-500 mt-1">
                        {field.type === 'progress' ? 'Itens: ' : 'Opções: '}
                        {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditField(field)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowSettingsModal;