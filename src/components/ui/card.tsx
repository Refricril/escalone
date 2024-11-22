"use client";

import React, { useState } from 'react';
import { Edit, Trash2, History } from 'lucide-react';
import { CardType, Field, FieldValue, DateStatus }  from "../../types";
import clsx from 'clsx';
import Modal from './modal';

interface CardProps {
  card: CardType;
  fields: Field[];
  onEdit: (card: CardType) => void;
  onDelete: (stageId: number, cardId: number) => void;
}

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

const getDateStatus = (date: Date | string | number): DateStatus => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffHours = (dateObj.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return 'overdue';
    if (diffHours <= 24) return 'urgent';
    if (diffHours <= 72) return 'warning';
    return 'ok';
  } catch (error) {
    console.error('Erro ao calcular status da data:', error);
    return 'ok';
  }
};

const formatFieldValue = (value: FieldValue, field: Field): { 
  text: string; 
  status?: DateStatus 
} => {
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
  
  if (field.type === 'date') {
    try {
      const dateValue = value instanceof Date ? value : new Date(value as string | number);
      if (isNaN(dateValue.getTime())) throw new Error('Data inválida');
      
      const status = getDateStatus(dateValue);
      return {
        text: formatDateTime(dateValue),
        status
      };
    } catch (error) {
      console.error('Erro ao processar data:', error);
      return { text: '-' };
    }
  }
  
  if (typeof value === 'boolean') return { text: value ? 'Sim' : 'Não' };
  
  // Para outros tipos, converte para string de forma segura
  try {
    return { text: String(value) };
  } catch {
    return { text: '-' };
  }
};

const Card: React.FC<CardProps> = ({ 
  card, 
  fields, 
  onEdit,
  onDelete,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await onDelete(card.stageId, card.id);
        console.log('Cartão excluído com sucesso');
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  };

  const renderHistory = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Histórico de Movimentações</h3>
        {card.history && card.history.length > 0 ? (
          <div className="space-y-4">
            {card.history.map((entry, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4 py-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatDateTime(entry.date)}</span>
                </div>
                <div className="mt-1">
                  <p>
                    Movido de <span className="font-medium">{entry.from.stageName}</span>
                    {' '} para <span className="font-medium">{entry.to.stageName}</span>
                  </p>
                  
                  {entry.fields && Object.keys(entry.fields).length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Campos no momento:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(entry.fields).map(([fieldName, value]) => {
                          const field = fields.find(f => f.name === fieldName);
                          if (!field) return null;
                          
                          const formatted = formatFieldValue(value, field);
                          
                          return (
                            <div key={fieldName} className="text-sm">
                              <span className="font-medium">{fieldName}:</span>{' '}
                              <span>{formatted.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhuma movimentação registrada
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        className="bg-white p-4 rounded-lg shadow hover:shadow-md relative group"
        onClick={() => onEdit(card)}
      >
        {/* Botões de ação */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          {card.history && card.history.length > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowHistory(true);
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Ver histórico"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span className="absolute -top-1 -right-1 bg-blue-100 text-blue-600 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {card.history.length}
              </span>
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Editar cartão"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1 hover:bg-gray-100 rounded"
            title="Excluir cartão"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Conteúdo do cartão */}
        <div className="space-y-1">
          <div className="font-medium text-sm mb-2">{card.title}</div>
          {fields.map(field => {
            const formattedValue = formatFieldValue(card.fields[field.name], field);
            const isProgress = field.type === 'progress';

            return (
              <div key={field.id} className="text-sm">
                <span className="font-medium">{field.name}:</span>{' '}
                {isProgress && Array.isArray(card.fields[field.name]) && field.options ? (
                  <div className="mt-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ 
                          width: `${Math.round((card.fields[field.name] as boolean[]).filter(Boolean).length / field.options.length * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {formattedValue.text}
                    </span>
                  </div>
                ) : (
                  <span className={clsx(
                    formattedValue.status && {
                      'text-red-600': formattedValue.status === 'overdue',
                      'text-orange-500': formattedValue.status === 'urgent',
                      'text-yellow-500': formattedValue.status === 'warning',
                      'text-green-500': formattedValue.status === 'ok'
                    }
                  )}>
                    {formattedValue.text}
                    {formattedValue.status === 'overdue' && ' (Atrasado)'}
                    {formattedValue.status === 'urgent' && ' (Urgente)'}
                    {formattedValue.status === 'warning' && ' (Atenção)'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Histórico */}
      {showHistory && (
        <Modal
          isOpen={true}
          onClose={() => setShowHistory(false)}
          title="Histórico de Movimentações"
        >
          {renderHistory()}
        </Modal>
      )}
    </>
  );
};

export default Card;