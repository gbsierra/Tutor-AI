import React, { useState, useMemo, useRef } from "react";

interface OrderingItem {
  id: string;
  text: string;
  correctPosition: number;
}

interface OrderingRendererProps {
  items: OrderingItem[];
  onOrderChange: (orderedItems: string[]) => void;
  disabled?: boolean;
  currentOrder?: string[];
}

export default function OrderingRenderer({
  items,
  onOrderChange,
  disabled = false,
  currentOrder = []
}: OrderingRendererProps) {

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  // Derive display order from props - no internal state for ordering
  const displayOrder = useMemo(() => {
    if (currentOrder.length > 0 && items.length > 0) {
      // Restore from saved state
      return [...items].sort((a, b) => {
        const aIndex = currentOrder.indexOf(a.id);
        const bIndex = currentOrder.indexOf(b.id);
        return aIndex - bIndex;
      });
    } else if (items.length > 0 && !hasInitialized.current) {
      // Initial shuffle when no saved state
      hasInitialized.current = true;
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      // Notify parent of initial order
      setTimeout(() => {
        onOrderChange(shuffled.map(item => item.id));
      }, 0);
      return shuffled;
    }
    return items;
  }, [items, currentOrder, onOrderChange]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (disabled) return;
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetItemId: string) => {
    if (disabled || !draggedItem || draggedItem === targetItemId) return;
    
    e.preventDefault();
    
    const draggedIndex = displayOrder.findIndex(item => item.id === draggedItem);
    const targetIndex = displayOrder.findIndex(item => item.id === targetItemId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newOrder = [...displayOrder];
    const [draggedItemObj] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItemObj);
    
    // Notify parent of new order - parent will update state
    onOrderChange(newOrder.map(item => item.id));
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="ordering-container space-y-4">
      <div className="text-sm text-[var(--muted-text)] mb-3">
        Drag and drop to arrange the items in the correct order:
      </div>
      
      {displayOrder.length === 0 ? (
        <div className="text-center p-4 text-[var(--muted-text)] border border-[var(--border)] rounded-lg">
          No ordering items available. This may be a configuration issue.
        </div>
      ) : (
        <div className="space-y-2">
          {displayOrder.map((item, index) => (
            <div
              key={item.id}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={`
                ordering-item p-3 border rounded-lg cursor-move transition-all duration-200
                ${disabled ? 'cursor-default' : 'hover:shadow-md'}
                ${draggedItem === item.id ? 'opacity-50 scale-95' : ''}
                ${disabled ? 'bg-[var(--bg)] border-[var(--border)]' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)]'}
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--muted-text)] font-mono text-sm min-w-[2rem]">
                  {index + 1}.
                </span>
                <span className="text-[var(--text)]">{item.text}</span>
                {!disabled && (
                  <div className="ml-auto text-[var(--muted-text)] text-xs">
                    ↕ Drag to reorder
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {disabled && (
        <div className="text-xs text-[var(--muted-text)] text-center p-2 bg-[var(--bg)] rounded">
          Ordering locked during grading
        </div>
      )}
    </div>
  );
}
