"use client";

import { useState, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface APIHealthCheckProps {
  children: ReactNode;
}

// Sleep utility function for delay between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const APIHealthCheck = ({ children }: APIHealthCheckProps) => {
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Check if the API is available
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch("/api/py", {
          // Prevent caching
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (response.ok) {
          setApiReady(true);
        } else {
          // If the API isn't ready and we haven't reached the max retries
          if (retryCount < 5) {
            // Use exponential backoff
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
            await sleep(delay);
            setRetryCount(prev => prev + 1);
          } else {
            // Max retries reached
            setApiReady(false);
          }
        }
      } catch (error) {
        // If there's a network error and we haven't reached the max retries
        if (retryCount < 5) {
          // Use exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          await sleep(delay);
          setRetryCount(prev => prev + 1);
        } else {
          // Max retries reached
          setApiReady(false);
        }
      }
    };

    if (apiReady === null || (apiReady === false && retryCount < 5)) {
      void checkApiHealth();
    }
  }, [apiReady, retryCount]);

  // If we're still checking, show a loading indicator
  if (apiReady === null) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <p className="mt-4 text-lg">Checking API availability...</p>
        <p className="mt-2 text-sm text-gray-500">
          Attempt {retryCount + 1} of 6
        </p>
      </div>
    );
  }

  // If the API is not ready after all retries, show an error
  if (apiReady === false) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center">
        <div className="rounded-lg border border-red-500/50 bg-red-900/20 p-6 text-center">
          <h2 className="mb-4 text-xl font-bold text-red-400">API Not Available</h2>
          <p className="mb-4 text-white">
            The backend API is currently unavailable. This might be because:
          </p>
          <ul className="mb-4 list-disc pl-8 text-left text-white">
            <li>The server is still starting up</li>
            <li>There's a temporary connectivity issue</li>
            <li>The backend service is down for maintenance</li>
          </ul>
          <p className="mb-6 text-white">
            Please try refreshing the page in a few moments.
          </p>
          <button
            onClick={() => {
              setApiReady(null);
              setRetryCount(0);
            }}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // API is ready, render children
  return <>{children}</>;
};

export default APIHealthCheck; 