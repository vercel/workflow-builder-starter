import { NextResponse } from "next/server";
import postgres from "postgres";
import { auth } from "@/lib/auth";
import { getIntegration } from "@/lib/db/integrations";
import type { IntegrationType } from "@/lib/types/integration";

export type TestConnectionResult = {
  status: "success" | "error";
  message: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ integrationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { integrationId } = await params;

    if (!integrationId) {
      return NextResponse.json(
        { error: "integrationId is required" },
        { status: 400 }
      );
    }

    // Get the integration
    const integration = await getIntegration(integrationId, session.user.id);

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const testers: Record<IntegrationType, () => Promise<TestConnectionResult>> = {
      "ai-gateway": () => testAiGatewayConnection(integration.config.apiKey),
      database: () => testDatabaseConnection(integration.config.url),
    };

    const testConnection = testers[integration.type];

    if (!testConnection) {
      return NextResponse.json(
        { error: `Unsupported integration type: ${integration.type}` },
        { status: 400 }
      );
    }

    const result = await testConnection();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to test connection:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to test connection",
      },
      { status: 500 }
    );
  }
}

async function testAiGatewayConnection(
  apiKey?: string
): Promise<TestConnectionResult> {
  if (!apiKey) {
    return {
      status: "error",
      message: "AI Gateway API key is required",
    };
  }

  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return {
        status: "error",
        message: "AI Gateway connection failed",
      };
    }

    return {
      status: "success",
      message: "AI Gateway connection successful",
    };
  } catch {
    return {
      status: "error",
      message: "AI Gateway connection failed",
    };
  }
}

async function testDatabaseConnection(
  databaseUrl?: string
): Promise<TestConnectionResult> {
  let connection: postgres.Sql | null = null;

  try {
    if (!databaseUrl) {
      return {
        status: "error",
        message: "Connection failed",
      };
    }

    // Create a connection
    connection = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 5,
      connect_timeout: 5,
    });

    // Try a simple query
    await connection`SELECT 1`;

    return {
      status: "success",
      message: "Connection successful",
    };
  } catch {
    return {
      status: "error",
      message: "Connection failed",
    };
  } finally {
    // Clean up the connection
    if (connection) {
      await connection.end();
    }
  }
}
