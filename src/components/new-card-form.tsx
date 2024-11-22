"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { CardType, Field, FieldValue, CardHistory } from "../types";
import { ChevronRight } from 'lucide-react';

type NewCardFormProps = {
  fields: Field[];
  stageId: number;
  previousFields?: Field[];
  onSubmit: (card: CardType) => void;
  onClose: () => void;
  initialData?: CardType & {
    history?: CardHistory[];
  };
}
const groupHistoryByStage = (history: CardHistory[]): Record<string, CardHistory[]> => {
  return history.reduce((acc: Record<string, CardHistory[]>, entry: CardHistory) => {
    const stageKey = entry.from.stageName;
    if (!acc[stageKey]) {
      acc[stageKey] = [];
    }
    acc[stageKey].push(entry);
    return acc;
  }, {});
};

const formatDateTime = (date: Date | string | number) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) throw new Error('Data inválida');
    
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(dateObj);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
};

const formatFieldValue = (value: FieldValue, field: Field): { text: string } => {
  if (value === null || value === undefined) return { text: '-' };
  
  if (field.type === 'progress' && Array.isArray(value) && field.options) {
    const completed = value.filter(Boolean).length;
    const total = field.options.length;
    return { 
      text: `${Math.round((completed / total) * 100)}% (${completed}/${total})` 
    };
  }
  
  if (field.type === 'checkbox' && field.options) {
    if (Array.isArray(value)) {
      return { text: value.length > 0 ? value.join(', ') : '-' };
    }
  }

  if (field.type === 'dropdown' && field.options) {
    return { text: value ? String(value) : '-' };
  }
  
  if (field.type === 'date') {
    try {
      const dateValue = value instanceof Date ? value : new Date(value as string | number);
      return {
        text: formatDateTime(dateValue)
      };
    } catch {
      return { text: '-' };
    }
  }
  
  if (typeof value === 'boolean') return { text: value ? 'Sim' : 'Não' };
  
  return { text: String(value) };
};

export default function NewCardForm({ 
  fields, 
  stageId, 
  previousFields = [], 
  onSubmit, 
  onClose, 
  initialData 
}: NewCardFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    if (initialData) {
      return initialData.fields;
    }
    
    return fields.reduce((acc: Record<string, FieldValue>, field: Field) => ({
      ...acc,
      [field.name]: field.type === 'progress'
        ? new Array(field.options?.length || 0).fill(false)
        : field.type === 'checkbox' && field.options
        ? []
        : field.defaultValue || null
    }), {});
  });
  const [showPreviousFields, setShowPreviousFields] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setValues(initialData.fields);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = fields
      .filter(field => field.required && !values[field.name])
      .map(field => field.name);

    if (missingFields.length > 0) {
      alert(`Preencha os campos obrigatórios: ${missingFields.join(', ')}`);
      return;
    }

    const newCard: CardType = {
      id: initialData?.id || Date.now(),
      title: title || "Novo Cartão",
      fields: values,
      stageId,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
      history: initialData?.history || []
    };

    onSubmit(newCard);
  };

  const renderFieldInput = (field: Field) => {
    const value = values[field.name];

    switch (field.type) {
      case 'date':
        return (
          <Input
            type="datetime-local"
            value={value instanceof Date ? value.toISOString().slice(0, 16) : String(value || '')}
            onChange={(e) => setValues(prev => ({
              ...prev,
              [field.name]: new Date(e.target.value)
            }))}
            className="w-full"
          />
        );

      case 'progress':
        return field.options ? (
          <div className="space-y-2">
            {field.options.map((option: string, index: number) => {
              const currentValues = Array.isArray(value) ? value : new Array(field.options?.length || 0).fill(false);
              
              return (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Boolean(currentValues[index])}
                    onChange={(e) => {
                      const newValues = [...currentValues];
                      newValues[index] = e.target.checked;
                      setValues(prev => ({
                        ...prev,
                        [field.name]: newValues
                      }));
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        ) : null;

      case 'checkbox':
        return field.options ? (
          <div className="space-y-2">
            {field.options.map((option: string) => {
              const currentValues = Array.isArray(value) ? value as string[] : [];
              
              return (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={currentValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      setValues(prev => ({
                        ...prev,
                        [field.name]: newValues
                      }));
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setValues(prev => ({
              ...prev,
              [field.name]: e.target.checked
            }))}
            className="h-4 w-4"
          />
        );

      case 'dropdown':
        return (
          <select
            value={String(value || '')}
            onChange={(e) => setValues(prev => ({
              ...prev,
              [field.name]: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => setValues(prev => ({
              ...prev,
              [field.name]: Number(e.target.value)
            }))}
            className="w-full"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={String(value || '')}
            onChange={(e) => setValues(prev => ({
              ...prev,
              [field.name]: e.target.value
            }))}
            className="w-full"
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          Título do Cartão
          <span className="text-red-500 ml-1">*</span>
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do cartão"
          required
          className="w-full"
        />
      </div>
  
      {initialData?.history && initialData.history.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                showHistory ? 'rotate-90' : ''
              }`}
            />
            <span className="ml-1">
              {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
            </span>
          </button>
  
          {showHistory && (
            <div className="mt-4 space-y-6">
              {initialData?.history &&
                Object.entries(groupHistoryByStage(initialData.history)).map(
                  ([stageName, entries]) => (
                    <div key={stageName} className="space-y-3">
                      <h4 className="font-medium text-gray-800 border-b pb-2">
                        Etapa: {stageName}
                      </h4>
                      <div className="space-y-4 pl-4">
                        {entries.map((entry, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-blue-500 pl-4 py-2"
                          >
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>{formatDateTime(entry.date)}</span>
                            </div>
                            <div className="mt-1">
                              <p>
                                Movido de{' '}
                                <span className="font-medium">
                                  {entry.from.stageName}
                                </span>{' '}
                                para{' '}
                                <span className="font-medium">
                                  {entry.to.stageName}
                                </span>
                              </p>
  
                              {entry.fields &&
                                Object.keys(entry.fields).length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-1">
                                      Campos no momento:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(entry.fields).map(
                                        ([fieldName, value]) => {
                                          const field = fields.find(
                                            (f) => f.name === fieldName
                                          );
                                          if (!field) return null;
  
                                          const formatted = formatFieldValue(
                                            value as FieldValue,
                                            field
                                          );
  
                                          return (
                                            <div
                                              key={fieldName}
                                              className="text-sm"
                                            >
                                              <span className="font-medium">
                                                {fieldName}:
                                              </span>{' '}
                                              <span>{formatted.text}</span>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
            </div>
          )}
        </div>
      )}
  
      {previousFields.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <button
            type="button"
            onClick={() => setShowPreviousFields(!showPreviousFields)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                showPreviousFields ? 'rotate-90' : ''
              }`}
            />
            <span className="ml-1">
              {showPreviousFields
                ? 'Ocultar campos anteriores'
                : 'Ver campos anteriores'}
            </span>
          </button>
  
          {showPreviousFields && (
            <div className="mt-3 space-y-3">
              {previousFields.map((field: Field) => {
                const value: FieldValue = initialData?.fields
                  ? initialData.fields[field.name]
                  : null;
                const formattedValue = formatFieldValue(value, field);
  
                return (
                  <div key={field.id} className="text-sm">
                    <span className="font-medium">{field.name}</span>{': '}
                    <span className="text-gray-600">{formattedValue.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
  
      {fields.map((field: Field) => (
        <div key={field.id} className="space-y-1">
          <label className="text-sm font-medium block">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderFieldInput(field)}
        </div>
      ))}
  
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {initialData ? 'Salvar Alterações' : 'Criar Cartão'}
        </Button>
      </div>
    </form>
  );

  }
