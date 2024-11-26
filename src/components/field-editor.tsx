"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Field, FieldType, FieldValue, FieldValidation, Flow } from "../types";

interface FieldEditorProps {
  field?: Field;
  onSave: (field: Field) => void;
  onClose: () => void;
  isOpen: boolean;
  existingFields?: Field[];
  flow?: Flow;
}

export function FieldEditor({ 
  field, 
  onSave, 
  onClose, 
  isOpen,
  existingFields = [] 
}: FieldEditorProps) {
  const [name, setName] = useState(field?.name || '');
  const [type, setType] = useState<FieldType>(field?.type || 'text');
  const [required, setRequired] = useState(field?.required || false);
  const [description, setDescription] = useState(field?.description || '');
  const [options, setOptions] = useState<string[]>(field?.options || []);
  const [defaultValue, setDefaultValue] = useState<FieldValue>(field?.defaultValue || '');
  const [validation, setValidation] = useState<FieldValidation>(field?.validation || {});
  const [placeholder, setPlaceholder] = useState(field?.placeholder || '');
  const [helpText, setHelpText] = useState(field?.helpText || '');
  const [readOnly, setReadOnly] = useState(field?.readOnly || false);
  const [visibility, setVisibility] = useState(field?.visibility || 'visible');
  const [dependsOn, setDependsOn] = useState(field?.dependsOn || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newField: Field = {
      id: field?.id || String(Date.now()),
      name,
      type,
      required,
      description,
      options: ['dropdown', 'select', 'checkbox', 'progress'].includes(type) ? options : undefined,
      defaultValue: type === 'checkbox' ? false : defaultValue,
      validation: {
        required,
        ...validation
      },
      placeholder,
      helpText,
      readOnly,
      visibility,
      dependsOn: dependsOn || undefined,
      order: field?.order
    };

    onSave(newField);
  };

  const showOptions = ['dropdown', 'select', 'checkbox', 'progress'].includes(type);

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{field ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Campo</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Status do Projeto"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo do Campo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as FieldType)}
              className="w-full rounded-md border p-2"
            >
              <option value="text">Texto</option>
              <option value="textarea">Área de Texto</option>
              <option value="number">Número</option>
              <option value="date">Data</option>
              <option value="dropdown">Lista de Seleção</option>
              <option value="select">Seleção Múltipla</option>
              <option value="checkbox">Lista de Checkbox</option>
              <option value="progress">Lista de Progresso</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do campo"
          />
        </div>

        {showOptions && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === 'progress' ? 'Etapas do Progresso' : 'Opções'}
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      setOptions(newOptions);
                    }}
                    placeholder={
                      type === 'progress' 
                        ? `Etapa ${index + 1}` 
                        : `Opção ${index + 1}`
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setOptions([...options, ''])}
                className="w-full"
              >
                {type === 'progress' ? 'Adicionar Etapa' : 'Adicionar Opção'}
              </Button>
            </div>
          </div>
        )}

        {!showOptions && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Padrão</label>
            {type === 'date' ? (
              <Input
                type="datetime-local"
                value={String(defaultValue || '')}
                onChange={(e) => setDefaultValue(e.target.value)}
              />
            ) : (
              <Input
                type={type === 'number' ? 'number' : 'text'}
                value={String(defaultValue || '')}
                onChange={(e) => setDefaultValue(
                  type === 'number' ? Number(e.target.value) : e.target.value
                )}
                placeholder="Valor padrão"
              />
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Placeholder</label>
          <Input
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="Texto de exemplo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Texto de Ajuda</label>
          <Input
            value={helpText}
            onChange={(e) => setHelpText(e.target.value)}
            placeholder="Texto de ajuda para o usuário"
          />
        </div>

        {existingFields.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Depende do Campo</label>
            <select
              value={dependsOn || ''}
              onChange={(e) => setDependsOn(e.target.value)}
              className="w-full rounded-md border p-2"
            >
              <option value="">Nenhum</option>
              {existingFields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Visibilidade</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'visible' | 'hidden' | 'readonly')}
            className="w-full rounded-md border p-2"
          >
            <option value="visible">Visível</option>
            <option value="hidden">Oculto</option>
            <option value="readonly">Somente Leitura</option>
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="required" className="text-sm">
              Campo Obrigatório
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="readonly"
              checked={readOnly}
              onChange={(e) => setReadOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="readonly" className="text-sm">
              Somente Leitura
            </label>
          </div>
        </div>

        {type === 'text' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Validações</label>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Tamanho Mínimo"
                value={validation.minLength || ''}
                onChange={(e) => setValidation({
                  ...validation,
                  minLength: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <Input
                type="number"
                placeholder="Tamanho Máximo"
                value={validation.maxLength || ''}
                onChange={(e) => setValidation({
                  ...validation,
                  maxLength: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>
        )}

        {type === 'number' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Validações</label>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Valor Mínimo"
                value={validation.min || ''}
                onChange={(e) => setValidation({
                  ...validation,
                  min: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <Input
                type="number"
                placeholder="Valor Máximo"
                value={validation.max || ''}
                onChange={(e) => setValidation({
                  ...validation,
                  max: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit"
            disabled={!name.trim() || (showOptions && options.length === 0)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}