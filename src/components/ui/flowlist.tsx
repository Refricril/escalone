// src/components/ui/FlowList.tsx
import React from 'react';
import { Plus } from 'lucide-react';

// Defina o tipo FlowType para cada item do array flows
type FlowType = {
  id: number;
  name: string;
  count: number;
  type: string;
  color: string;
};

// Defina o tipo das props para o componente FlowList
type FlowListProps = {
  flows: FlowType[];
  onSelectFlow: (flow: FlowType) => void;
};

const FlowList: React.FC<FlowListProps> = ({ flows, onSelectFlow }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      <button
        className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500"
        onClick={() => {}}
      >
        <div className="text-center">
          <Plus className="w-6 h-6 mx-auto text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Novo fluxo</span>
        </div>
      </button>

      {flows.map(flow => (
        <div
          key={flow.id}
          className={`${flow.color} p-4 rounded-lg cursor-pointer`}
          onClick={() => onSelectFlow(flow)}
        >
          <h3 className="font-medium">{flow.name}</h3>
          <p className="text-sm text-gray-600">{flow.type}</p>
          <p className="text-sm mt-4">{flow.count} solicitações</p>
        </div>
      ))}
    </div>
  );
};

export default FlowList;
