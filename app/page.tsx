"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { WorkflowToolbar } from "@/components/workflow/workflow-toolbar";
import { api } from "@/lib/api-client";
import { authClient, useSession } from "@/lib/auth-client";
import {
  currentWorkflowIdAtom,
  edgesAtom,
  nodesAtom,
} from "@/lib/workflow-store";
import exampleWorkflow from "../example-workflow.json";
import exampleDataPipeline from "../example-workflow-data-pipeline.json";

const Home = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const currentWorkflowId = useAtomValue(currentWorkflowIdAtom);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Ensure session exists
        if (!session) {
          await authClient.signIn.anonymous();
          // Give it a moment to propagate
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Check for existing workflows
        const workflows = await api.workflow.getAll();

        if (workflows.length === 0) {
          // Seed both sample workflows
          console.log("Seeding sample workflows...");

          // Create Operations Bridge (linear pattern)
          const operationsBridge = await api.workflow.create({
            name: "Sample Operations Bridge",
            description: "Linear escalation workflow - diagnostic alerts",
            nodes: exampleWorkflow.nodes,
            edges: exampleWorkflow.edges,
          });

          // Create Data Pipeline (fan-out pattern)
          await api.workflow.create({
            name: "Data Pipeline Example",
            description: "Fan-out pattern - parallel processing with aggregation",
            nodes: exampleDataPipeline.nodes,
            edges: exampleDataPipeline.edges,
          });

          // Redirect to Operations Bridge as the primary example
          router.replace(`/workflows/${operationsBridge.id}`);
        } else {
          // Redirect to the most recent workflow
          router.replace(`/workflows/${workflows[0].id}`);
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
        setIsInitializing(false); // Stop loading if error, show read-only canvas
      }
    };

    init();
  }, [session, router]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up your workflow environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <main className="relative flex size-full overflow-hidden">
        <ReactFlowProvider>
          <div className="relative flex-1 overflow-hidden">
            <WorkflowToolbar workflowId={currentWorkflowId ?? undefined} readOnly={true} />
            <WorkflowCanvas showMinimap={false} readOnly={true} />
          </div>
        </ReactFlowProvider>
      </main>
    </div>
  );
};

export default Home;
