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
import { Field, FieldType } from "../types";
interface FieldEditorProps {
  field?: Field;
  onSave: (field: Field) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function FieldEditor({ field, onSave, onClose, isOpen }: FieldEditorProps) {
  const [name, setName] = useState(field?.name || '');
  const [type, setType] = useState<FieldType>(field?.type || 'text');
  const [required, setRequired] = useState(field?.required || false);
  const [options, setOptions] = useState<string[]>(field?.options || []);
  const [defaultValue, setDefaultValue] = useState(field?.defaultValue || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: field?.id || Date.now(),
      name,
      type,
      required,
      defaultValue: type === 'checkbox' ? false : defaultValue,
      ...((['dropdown', 'checkbox', 'progress'].includes(type)) && { options }),
    });
  };

  const showOptions = ['dropdown', 'checkbox', 'progress'].includes(type);

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{field ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome do Campo</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Status do Projeto"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tipo do Campo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as FieldType)}
            className="w-full mt-1 rounded-md border p-2"
          >
            <option value="text">Texto</option>
            <option value="number">Número</option>
            <option value="date">Data</option>
            <option value="dropdown">Lista de Seleção</option>
            <option value="checkbox">Lista de Checkbox</option>
            <option value="progress">Lista de Progresso</option>
          </select>
        </div>

        {showOptions && (
          <div>
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
                    onClick={() => {
                      setOptions(options.filter((_, i) => i !== index));
                    }}
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
          <div>
            <label className="text-sm font-medium">Valor Padrão</label>
            {type === 'date' ? (
              <Input
                type="datetime-local"
                value={String(defaultValue || '')}
                onChange={(e) => setDefaultValue(e.target.value)}
                className="mt-1"
              />
            ) : (
              <Input
                type={type === 'number' ? 'number' : 'text'}
                value={String(defaultValue || '')}
                onChange={(e) => setDefaultValue(
                  type === 'number' ? Number(e.target.value) : e.target.value
                )}
                className="mt-1"
              />
            )}
          </div>
        )}

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