import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from './UI/Button';
import { Input } from './UI/Input';
import { Label } from './UI/Label';
import { Endpoint } from '../types';

interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (endpoint: Endpoint) => void;
  endpoint?: Endpoint;
}

export const EndpointModal: React.FC<EndpointModalProps> = ({
  isOpen,
  onClose,
  onSave,
  endpoint,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [headers, setHeaders] = useState<[string, string][]>([]);

  useEffect(() => {
    if (endpoint) {
      setName(endpoint.name);
      setUrl(endpoint.url);
      setApiKey(endpoint.apiKey || '');
      setModel(endpoint.model);
      setHeaders(endpoint.headers);
    } else {
      setName('');
      setUrl('https://api.openai.com/v1');
      setApiKey('');
      setModel('gpt-3.5-turbo');
      setHeaders([]);
    }
  }, [endpoint, isOpen]);

  const addHeader = () => {
    setHeaders([...headers, ['', '']]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 0 | 1, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !url) {
      alert('Please fill in all required fields');
      return;
    }

    const newEndpoint: Endpoint = {
      id: endpoint?.id || `endpoint-${Date.now()}`,
      name,
      url: url.replace(/\/$/, ''), // Remove trailing slash
      apiKey: apiKey || undefined,
      headers: headers.filter(([k]) => k.trim()),
      model,
    };

    onSave(newEndpoint);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {endpoint ? 'Edit Endpoint' : 'New Endpoint'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="My OpenAI Endpoint"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="url">
              Base URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="url"
              placeholder="https://api.openai.com/v1"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              The base URL of your LLM API endpoint (e.g., https://api.openai.com/v1)
            </p>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="model">
              Model <span className="text-destructive">*</span>
            </Label>
            <Input
              id="model"
              placeholder="gpt-3.5-turbo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Custom Headers (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                <Plus className="w-4 h-4 mr-1" />
                Add Header
              </Button>
            </div>
            {headers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom headers</p>
            ) : (
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={header[0]}
                      onChange={(e) => updateHeader(index, 0, e.target.value)}
                    />
                    <Input
                      placeholder="Header value"
                      value={header[1]}
                      onChange={(e) => updateHeader(index, 1, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Endpoint</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
