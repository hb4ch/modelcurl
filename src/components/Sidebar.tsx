import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Globe, Copy, Pencil } from 'lucide-react';
import { useEndpointStore } from '../stores/endpointStore';
import { Endpoint } from '../types';
import { Button } from './UI/Button';
import { Input } from './UI/Input';

interface SidebarProps {
  onNewEndpoint: () => void;
  onEditEndpoint: (endpoint: Endpoint) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewEndpoint,
  onEditEndpoint,
}) => {
  const { endpoints, selectedEndpoint, loadEndpoints, selectEndpoint, deleteEndpoint, duplicateEndpoint } =
    useEndpointStore();

  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadEndpoints();
  }, [loadEndpoints]);

  const filteredEndpoints = endpoints.filter((e) =>
    e.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this endpoint?')) {
      await deleteEndpoint(id);
    }
  };

  const handleDuplicate = async (endpoint: Endpoint, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateEndpoint(endpoint);
  };

  const handleEdit = (endpoint: Endpoint, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEndpoint(endpoint);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-lg">Endpoints</h2>
        </div>
        <Button onClick={onNewEndpoint} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Endpoint
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <Input
          placeholder="Filter endpoints..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredEndpoints.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {filter ? 'No endpoints found' : 'No endpoints configured'}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredEndpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className={`group relative p-3 rounded-md cursor-pointer transition-colors ${
                  selectedEndpoint?.id === endpoint.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
                onClick={() => selectEndpoint(endpoint)}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <div className="font-medium text-sm truncate">
                      {endpoint.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {endpoint.model}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(endpoint, e)}
                      title="Edit endpoint"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDuplicate(endpoint, e)}
                      title="Duplicate endpoint"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(endpoint.id, e)}
                      title="Delete endpoint"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
