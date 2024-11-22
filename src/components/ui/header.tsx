import React from 'react';
import { Search, Bell, HelpCircle, User, Plus } from 'lucide-react';
import { Button } from './button';

type HeaderProps = {
  showNewFlowButton?: boolean;
  onNewFlow?: () => void;
};

const Header = ({ showNewFlowButton, onNewFlow }: HeaderProps) => {
  return (
    <header className="bg-white border-b shadow-md">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Título e Navegação */}
        <div className="flex items-center space-x-8">
          {/* Título do projeto */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">Escalone</span>
            <span className="text-sm text-gray-500">by Refricril</span>
          </div>
          {/* Navegação */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Portal</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Tarefas e Solicitações</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Interfaces</a>
          </nav>
        </div>

        {/* Barra de Pesquisa e Ícones */}
        <div className="flex items-center space-x-6">
          {showNewFlowButton && (
            <Button
              onClick={onNewFlow}
              className="bg-black hover:bg-gray-900 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Flow
            </Button>
          )}
          {/* Barra de Pesquisa */}
          <div className="relative hidden lg:block">
  <input
    type="text"
    placeholder="Pesquisar fluxos, cards ..."
    className="pl-10 pr-4 py-2 border rounded-full shadow-sm focus:outline-none focus:border-blue-500"
  />
  <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
</div>
          {/* Ícones */}
          <div className="flex items-center space-x-5">
            <Bell className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer" />
            <HelpCircle className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer" />
            <User className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;