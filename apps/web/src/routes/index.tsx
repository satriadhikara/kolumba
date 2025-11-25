import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import viteLogo from "/vite.svg";
import reactLogo from "@/assets/react.svg";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [count, setCount] = useState(0);

  const { data: message, isLoading: messageLoading } = useQuery({
    queryKey: ["message"],
    queryFn: () => api.get().then((res) => res.data),
  });
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ["health"],
    queryFn: () => api.health.get().then((res) => res.data),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex gap-8 mb-8">
        <a
          href="https://vite.dev"
          target="_blank"
          className="transition-transform hover:scale-110"
        >
          <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          className="transition-transform hover:scale-110"
        >
          <img
            src={reactLogo}
            className="h-24 w-24 animate-spin"
            style={{ animationDuration: "20s" }}
            alt="React logo"
          />
        </a>
      </div>

      <h1 className="text-5xl font-bold mb-8">Vite + React</h1>

      <Card className="mb-6 w-full max-w-md">
        <CardHeader>
          <CardTitle>Eden Treaty Demo</CardTitle>
          <CardDescription>
            Type-safe API calls with Elysia + Eden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">API Message</span>
            {messageLoading ? (
              <Badge variant="secondary">Loading...</Badge>
            ) : (
              <Badge>{message}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Health Status</span>
            {healthLoading ? (
              <Badge variant="secondary">Loading...</Badge>
            ) : (
              <Badge variant="outline" className="text-emerald-500">
                {health?.status} •{" "}
                {new Date(health?.timestamp ?? 0).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <Button onClick={() => setCount((count) => count + 1)} size="lg">
            Count is {count}
          </Button>
          <p className="mt-4 text-muted-foreground text-sm">
            Edit <code className="text-primary">src/App.tsx</code> and save to
            test HMR
          </p>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}
