// frontend/src/components/simulations/D3ParameterControls.tsx
// Interactive controls for D3.js visualization parameters

// Import types from shared directory
import type { D3Parameter } from '@shared/index.ts';

interface D3ParameterControlsProps {
  parameters: D3Parameter[];
  onParameterChange: (parameterName: string, value: any) => void;
  currentValues?: Record<string, any>;
}

export default function D3ParameterControls({
  parameters,
  onParameterChange,
  currentValues = {}
}: D3ParameterControlsProps) {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  const handleSliderChange = (parameterName: string, value: number) => {
    onParameterChange(parameterName, value);
  };

  const handleSelectChange = (parameterName: string, value: string) => {
    onParameterChange(parameterName, value);
  };

  const handleCheckboxChange = (parameterName: string, checked: boolean) => {
    onParameterChange(parameterName, checked);
  };

  return (
    <div className="d3-parameter-controls bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
      <h3 className="text-sm font-medium text-[var(--text)] mb-3">
        Interactive Parameters
      </h3>

      <div className="space-y-4">
        {parameters.map((param) => {
          const currentValue = currentValues[param.name] ?? param.defaultValue;

          return (
            <div key={param.name} className="parameter-control">
              <label className="block text-sm text-[var(--text)] mb-2">
                {param.name}
                {param.description && (
                  <span className="text-[var(--muted-text)] ml-2">
                    - {param.description}
                  </span>
                )}
              </label>

              {param.type === 'number' && param.range && (
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={param.range[0]}
                    max={param.range[1]}
                    value={currentValue}
                    onChange={(e) => handleSliderChange(param.name, Number(e.target.value))}
                    className="flex-1 h-2 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-[var(--text)] min-w-[3rem]">
                    {currentValue}
                  </span>
                </div>
              )}

              {param.type === 'string' && param.options && (
                <select
                  value={currentValue}
                  onChange={(e) => handleSelectChange(param.name, e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--border)]"
                >
                  {param.options!.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {param.type === 'boolean' && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={currentValue}
                    onChange={(e) => handleCheckboxChange(param.name, e.target.checked)}
                    className="w-4 h-4 text-[var(--text)] bg-[var(--bg)] border-[var(--border)] rounded focus:ring-[var(--border)] focus:ring-2"
                  />
                  <span className="text-sm text-[var(--text)]">
                    {param.description || 'Enable'}
                  </span>
                </label>
              )}

              {param.type === 'array' && Array.isArray(currentValue) && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[var(--muted-text)]">
                    [{currentValue.join(', ')}]
                  </span>
                  <button
                    onClick={() => {
                      // For array parameters, we could add more complex controls
                      console.log('Array parameter controls not implemented yet');
                    }}
                    className="px-3 py-1 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-md hover:bg-[var(--surface)]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-text)]">
          Adjust these parameters to explore how they affect the visualization and deepen your understanding of the concept.
        </p>
      </div>
    </div>
  );
}
