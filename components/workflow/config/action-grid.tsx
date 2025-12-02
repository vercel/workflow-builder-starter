"use client";

import { MessageSquare, Search, Settings, Zap } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ActionType = {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * Built-in actions only. Plugin actions are added via the plugin system.
 * Learners will build their first plugin (Resend) in the course.
 */
const actions: ActionType[] = [
  {
    id: "Log",
    label: "Log",
    description: "Output a message to the console",
    category: "System",
    icon: MessageSquare,
  },
  {
    id: "HTTP Request",
    label: "HTTP Request",
    description: "Make an HTTP request to any API",
    category: "System",
    icon: Zap,
  },
  {
    id: "Condition",
    label: "Condition",
    description: "Branch based on a condition",
    category: "System",
    icon: Settings,
  },
];

type ActionGridProps = {
  onSelectAction: (actionType: string) => void;
  disabled?: boolean;
};

export function ActionGrid({ onSelectAction, disabled }: ActionGridProps) {
  const [filter, setFilter] = useState("");

  const filteredActions = actions.filter((action) => {
    const searchTerm = filter.toLowerCase();
    return (
      action.label.toLowerCase().includes(searchTerm) ||
      action.description.toLowerCase().includes(searchTerm) ||
      action.category.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label className="ml-1" htmlFor="action-filter">
          Search Actions
        </Label>
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            disabled={disabled}
            id="action-filter"
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search actions..."
            value={filter}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filteredActions.map((action) => (
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary hover:bg-accent",
              disabled && "pointer-events-none opacity-50"
            )}
            disabled={disabled}
            key={action.id}
            onClick={() => onSelectAction(action.id)}
            type="button"
          >
            <action.icon className="size-8" />
            <p className="text-center font-medium text-sm">{action.label}</p>
          </button>
        ))}
      </div>

      {filteredActions.length === 0 && (
        <p className="py-8 text-center text-muted-foreground text-sm">
          No actions found
        </p>
      )}
    </div>
  );
}
