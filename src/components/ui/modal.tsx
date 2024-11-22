"use client";

import { ChevronRight, X, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { Stage, Field } from "../../types";

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
}

type ModalProps = DefaultModalProps | SettingsModalProps;

interface FieldSettingsFormProps {
 flowId: number;
 initialFields: Field[];
 onClose: () => void;
 onSave: (fields: Field[]) => void;
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
   const { stage, stages, onSave } = props as SettingsModalProps;
   const [allowedMoves, setAllowedMoves] = useState<number[]>(stage.allowedMoves || []);

   const handleSaveSettings = () => {
     onSave({ ...stage, allowedMoves });
     onClose();
   };

   return (
     <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
       <div className={`bg-white rounded-lg w-full ${maxWidthClass} mx-4 max-h-[90vh] overflow-hidden`}>
         <div className="flex items-center justify-between p-4 border-b">
           <h3 className="text-lg font-medium">Configurar Etapa: {stage.name}</h3>
           <Button 
             className="bg-transparent hover:bg-gray-100"
             onClick={onClose}
           >
             <X className="h-4 w-4" />
           </Button>
         </div>
         <div className="p-4 overflow-y-auto">
           <FieldSettingsForm
             flowId={stage.id}
             initialFields={stage.fields || []}
             onClose={onClose}
             onSave={(fields) => onSave({ ...stage, fields })}
           />
         </div>
         <div className="p-4 border-t mt-auto">
           <Button 
             className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
             onClick={onClose}
           >
             Cancelar
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
           className="bg-transparent hover:bg-gray-100"
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
}) => {
 const [fields, setFields] = useState<Field[]>(initialFields);

 const handleAddField = () => {
   setFields([...fields, { id: Date.now(), name: '', type: 'text' }]);
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
   onSave(fields);
   onClose();
 };

 return (
   <div className="space-y-4">
     <h3 className="font-medium">Configurar Campos</h3>
     {fields.map((field, index) => (
       <div key={field.id} className="flex items-center space-x-4">
         <input
           type="text"
           value={field.name}
           onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
           placeholder="Nome do Campo"
           className="w-full border px-2 py-1 rounded"
         />
         <select
           value={field.type}
           onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
           className="border px-2 py-1 rounded"
         >
           <option value="text">Texto</option>
           <option value="date">Data</option>
           <option value="checkbox">Checkbox</option>
           <option value="progress">Progresso</option>
         </select>
         <button onClick={() => handleRemoveField(index)} className="text-red-500">
           <Trash2 className="h-5 w-5" />
         </button>
       </div>
     ))}
     <button onClick={handleAddField} className="flex items-center space-x-2 text-blue-600">
       <Plus className="h-5 w-5" />
       <span>Adicionar Campo</span>
     </button>
     <div className="flex justify-end space-x-4 mt-6">
       <Button 
         className="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300"
         onClick={onClose}
       >
         Cancelar
       </Button>
       <Button 
         className="bg-blue-600 hover:bg-blue-700 text-white"
         onClick={handleSave}
       >
         Salvar
       </Button>
     </div>
   </div>
 );
};