"use client";

import { useAtom } from "jotai";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateBadgeInput } from "@/components/ui/template-badge-input";
import {
  currentWorkflowIdAtom,
  currentWorkflowNameAtom,
} from "@/lib/workflow-store";

type ActionConfigProps = {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
};

/**
 * Log action fields - outputs a message to the console
 * The simplest possible action for debugging workflows
 */
function LogFields({
  config,
  onUpdateConfig,
  disabled,
}: {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label className="ml-1" htmlFor="logMessage">
          Message
        </Label>
        <TemplateBadgeInput
          disabled={disabled}
          id="logMessage"
          onChange={(value) => onUpdateConfig("logMessage", value)}
          placeholder="Hello World! or {{NodeName.field}}"
          value={(config?.logMessage as string) || ""}
        />
      </div>
      <div className="space-y-2">
        <Label className="ml-1" htmlFor="logLevel">
          Level
        </Label>
        <Select
          disabled={disabled}
          onValueChange={(value) => onUpdateConfig("logLevel", value)}
          value={(config?.logLevel as string) || "info"}
        >
          <SelectTrigger className="w-full" id="logLevel">
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

/**
 * HTTP Request action fields
 */
function HttpRequestFields({
  config,
  onUpdateConfig,
  disabled,
}: {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="httpMethod">HTTP Method</Label>
        <Select
          disabled={disabled}
          onValueChange={(value) => onUpdateConfig("httpMethod", value)}
          value={(config?.httpMethod as string) || "POST"}
        >
          <SelectTrigger className="w-full" id="httpMethod">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="endpoint">URL</Label>
        <TemplateBadgeInput
          disabled={disabled}
          id="endpoint"
          onChange={(value) => onUpdateConfig("endpoint", value)}
          placeholder="https://api.example.com/endpoint or {{NodeName.url}}"
          value={(config?.endpoint as string) || ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="httpHeaders">Headers (JSON)</Label>
        <div className="overflow-hidden rounded-md border">
          <CodeEditor
            defaultLanguage="json"
            height="100px"
            onChange={(value) => onUpdateConfig("httpHeaders", value || "{}")}
            options={{
              minimap: { enabled: false },
              lineNumbers: "off",
              scrollBeyondLastLine: false,
              fontSize: 12,
              readOnly: disabled,
              wordWrap: "off",
            }}
            value={(config?.httpHeaders as string) || "{}"}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="httpBody">Body (JSON)</Label>
        <div
          className={`overflow-hidden rounded-md border ${config?.httpMethod === "GET" ? "opacity-50" : ""}`}
        >
          <CodeEditor
            defaultLanguage="json"
            height="120px"
            onChange={(value) => onUpdateConfig("httpBody", value || "{}")}
            options={{
              minimap: { enabled: false },
              lineNumbers: "off",
              scrollBeyondLastLine: false,
              fontSize: 12,
              readOnly: config?.httpMethod === "GET" || disabled,
              domReadOnly: config?.httpMethod === "GET" || disabled,
              wordWrap: "off",
            }}
            value={(config?.httpBody as string) || "{}"}
          />
        </div>
        {config?.httpMethod === "GET" && (
          <p className="text-muted-foreground text-xs">
            Body is disabled for GET requests
          </p>
        )}
      </div>
    </>
  );
}

/**
 * Condition action fields - branch based on expression
 */
function ConditionFields({
  config,
  onUpdateConfig,
  disabled,
}: {
  config: Record<string, unknown>;
  onUpdateConfig: (key: string, value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="condition">Condition Expression</Label>
      <TemplateBadgeInput
        disabled={disabled}
        id="condition"
        onChange={(value) => onUpdateConfig("condition", value)}
        placeholder="e.g., 5 > 3, status === 200, {{PreviousNode.value}} > 100"
        value={(config?.condition as string) || ""}
      />
      <p className="text-muted-foreground text-xs">
        Enter a JavaScript expression that evaluates to true or false. You can
        use @ to reference previous node outputs.
      </p>
    </div>
  );
}

/**
 * Built-in action categories. Plugin actions are added via the plugin system.
 * Learners will build their first plugin (Resend) in the course.
 */
const ACTION_CATEGORIES = {
  System: ["Log", "HTTP Request", "Condition"],
} as const;

type ActionCategory = keyof typeof ACTION_CATEGORIES;

/**
 * Get category for an action type
 */
const getCategoryForAction = (actionType: string): ActionCategory | null => {
  for (const [category, actions] of Object.entries(ACTION_CATEGORIES)) {
    if (actions.includes(actionType as never)) {
      return category as ActionCategory;
    }
  }
  return null;
};

/**
 * Action configuration panel - displays fields based on selected action type
 */
export function ActionConfig({
  config,
  onUpdateConfig,
  disabled,
}: ActionConfigProps) {
  const [_workflowId] = useAtom(currentWorkflowIdAtom);
  const [_workflowName] = useAtom(currentWorkflowNameAtom);

  const actionType = (config?.actionType as string) || "";
  const selectedCategory = actionType ? getCategoryForAction(actionType) : null;
  const [category, setCategory] = useState<ActionCategory | "">(
    selectedCategory || ""
  );

  // Sync category state when actionType changes (e.g., when switching nodes)
  useEffect(() => {
    const newCategory = actionType ? getCategoryForAction(actionType) : null;
    setCategory(newCategory || "");
  }, [actionType]);

  const handleCategoryChange = (newCategory: ActionCategory) => {
    setCategory(newCategory);
    // Auto-select the first action in the new category
    const firstAction = ACTION_CATEGORIES[newCategory][0];
    onUpdateConfig("actionType", firstAction);
  };

  const handleActionTypeChange = (value: string) => {
    onUpdateConfig("actionType", value);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label className="ml-1" htmlFor="actionCategory">
            Category
          </Label>
          <Select
            disabled={disabled}
            onValueChange={(value) =>
              handleCategoryChange(value as ActionCategory)
            }
            value={category || undefined}
          >
            <SelectTrigger className="w-full" id="actionCategory">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="System">
                <div className="flex items-center gap-2">
                  <Settings className="size-4" />
                  <span>System</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="ml-1" htmlFor="actionType">
            Action
          </Label>
          <Select
            disabled={disabled || !category}
            onValueChange={handleActionTypeChange}
            value={actionType || undefined}
          >
            <SelectTrigger className="w-full" id="actionType">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              {category &&
                ACTION_CATEGORIES[category].map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Log fields */}
      {config?.actionType === "Log" && (
        <LogFields
          config={config}
          disabled={disabled}
          onUpdateConfig={onUpdateConfig}
        />
      )}

      {/* HTTP Request fields */}
      {config?.actionType === "HTTP Request" && (
        <HttpRequestFields
          config={config}
          disabled={disabled}
          onUpdateConfig={onUpdateConfig}
        />
      )}

      {/* Condition fields */}
      {config?.actionType === "Condition" && (
        <ConditionFields
          config={config}
          disabled={disabled}
          onUpdateConfig={onUpdateConfig}
        />
      )}
    </>
  );
}
