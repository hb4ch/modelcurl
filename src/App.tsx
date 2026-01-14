import { useState } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { PromptInput } from './components/PromptInput';
import { ParametersPanel } from './components/ParametersPanel';
import { ResponseDisplay } from './components/ResponseDisplay';
import { EndpointModal } from './components/EndpointModal';
import { useEndpointStore } from './stores/endpointStore';
import { useLLMRequest } from './hooks/useLLMRequest';
import { Endpoint, Message } from './types';
import './styles/globals.css';

function App() {
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | undefined>();
  const [temperature, setTemperature] = useState(0);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [stream, setStream] = useState(true);

  const { selectedEndpoint, saveEndpoint } = useEndpointStore();
  const { isLoading, response, metrics, error, sendRequest, clearResponse, dismissError } =
    useLLMRequest();

  const handleNewEndpoint = () => {
    setEditingEndpoint(undefined);
    setIsEndpointModalOpen(true);
  };

  const handleEditEndpoint = (endpoint: Endpoint) => {
    setEditingEndpoint(endpoint);
    setIsEndpointModalOpen(true);
  };

  const handleSaveEndpoint = async (endpoint: Endpoint) => {
    await saveEndpoint(endpoint);
  };

  const handleSubmit = async (prompt: string, systemMessage: string) => {
    if (!selectedEndpoint) {
      alert('Please select an endpoint first');
      return;
    }

    const messages: Message[] = [];
    if (systemMessage.trim()) {
      messages.push({ role: 'system', content: systemMessage });
    }
    messages.push({ role: 'user', content: prompt });

    const request = {
      model: selectedEndpoint.model,
      messages,
      temperature,
      maxTokens: maxTokens,
      stream,
    };

    await sendRequest(selectedEndpoint, request);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MC</span>
          </div>
          <h1 className="font-semibold text-lg">ModelCurl</h1>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {selectedEndpoint ? (
            <span>
              Connected to <strong>{selectedEndpoint.name}</strong>
            </span>
          ) : (
            <span>No endpoint selected</span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onNewEndpoint={handleNewEndpoint}
          onEditEndpoint={handleEditEndpoint}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ResponseDisplay
            response={response}
            metrics={metrics}
            isLoading={isLoading}
            isStreaming={isLoading && stream}
            onClear={clearResponse}
          />

          <ParametersPanel
            temperature={temperature}
            maxTokens={maxTokens}
            stream={stream}
            onTemperatureChange={setTemperature}
            onMaxTokensChange={setMaxTokens}
            onStreamChange={setStream}
            disabled={isLoading}
          />

          <PromptInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedEndpoint}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-md animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={dismissError}
              className="shrink-0 hover:bg-destructive-foreground/10 rounded p-0.5 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <EndpointModal
        isOpen={isEndpointModalOpen}
        onClose={() => setIsEndpointModalOpen(false)}
        onSave={handleSaveEndpoint}
        endpoint={editingEndpoint}
      />
    </div>
  );
}

export default App;
