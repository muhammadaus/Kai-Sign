"use client";

import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";

import { useState, useEffect } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import SampleAddressAbiCard from "./sampleAddressAbiCard";
import { Button } from "~/components/ui/button";
import { FileJson, Loader2 } from "lucide-react";
import Image from "next/image";

import { ZodError } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useErc7730Store } from "~/store/erc7730Provider";
import useFunctionStore from "~/store/useOperationStore";
import generateFromERC7730 from "./generateFromERC7730";

// Sleep utility function for delay between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if the API is ready
const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/py");
    return response.ok;
  } catch (error) {
    return false;
  }
};

const CardErc7730 = () => {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState<"address" | "abi">("address");
  const { setErc7730 } = useErc7730Store((state) => state);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [checkingApi, setCheckingApi] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Check API health on mount
    const checkApi = async () => {
      setCheckingApi(true);
      let isReady = await checkApiHealth();
      
      // If not ready, retry a few times with increasing delay
      if (!isReady) {
        let retryDelay = 1000;
        for (let i = 0; i < 3; i++) {
          await sleep(retryDelay);
          isReady = await checkApiHealth();
          if (isReady) break;
          retryDelay *= 2;
        }
      }
      
      setApiReady(isReady);
      setCheckingApi(false);
    };
    
    checkApi();
  }, []);

  const {
    mutateAsync: fetchERC7730Metadata,
    isPending: loading,
    error,
  } = useMutation({
    mutationFn: (input: string) =>
      generateFromERC7730({
        input,
        inputType,
      }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check API health before submitting
    if (apiReady === false) {
      // Re-check API health
      setCheckingApi(true);
      const isReady = await checkApiHealth();
      setApiReady(isReady);
      setCheckingApi(false);
      
      if (!isReady) {
        // Show error message
        return;
      }
    }
    
    const erc7730 = await fetchERC7730Metadata(input);

    if (erc7730) {
      console.log(erc7730);
      useFunctionStore.persist.clearStorage();

      setErc7730(erc7730);
      router.push("/metadata");
    }
  };

  const onTabChange = (value: string) => {
    setInputType(value as "address" | "abi");
    setInput("");
  };
  
  const handleSkipToVerification = () => {
    router.push("/verification-results");
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-[580px]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">
          ERC7730 Json Builder
        </h1>
        <div className="h-16 w-16">
          <Image 
            src="/assets/unicorn.png" 
            alt="Pixel Unicorn" 
            width={64} 
            height={64}
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#664bda]/50 bg-[#140a33]/50 p-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
          <Tabs defaultValue="address" onValueChange={onTabChange}>
            <div className="relative overflow-hidden rounded-lg border border-[#1f0f4c] bg-[#0f051d]">
              <TabsList className="flex w-full">
                <TabsTrigger 
                  value="address" 
                  className="flex-1 rounded-none py-4 text-center data-[state=active]:bg-[#5379FF] data-[state=active]:text-white data-[state=inactive]:bg-transparent"
                >
                  Contract Address
                </TabsTrigger>
                <TabsTrigger 
                  value="abi" 
                  className="flex-1 rounded-none py-4 text-center data-[state=active]:bg-[#5379FF] data-[state=active]:text-white data-[state=inactive]:bg-transparent"
                >
                  ABI
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="address" className="mt-6">
              <div>
                <Label className="mb-2 block font-normal text-white">Contract Address</Label>
                <Input
                  id="contract-address"
                  placeholder="0x..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-12 rounded-lg border-[#1f0f4c] bg-[#0f051d] text-white placeholder:text-gray-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="abi" className="mt-6">
              <div>
                <Label className="mb-2 block font-normal text-white">ABI</Label>
                <Textarea
                  id="abi"
                  placeholder="Paste your ABI here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[120px] rounded-lg border-[#1f0f4c] bg-[#0f051d] text-white placeholder:text-gray-500"
                />
              </div>
            </TabsContent>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading || checkingApi || apiReady === false}
                className="rounded-full bg-gradient-to-r from-[#FF4D4D] to-[#F9CB28] px-8 py-3 font-medium text-white transition-transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 flex items-center gap-2"
              >
                {(loading || checkingApi) && <Loader2 className="h-4 w-4 animate-spin" />}
                {checkingApi ? "Checking API..." : "Submit"}
              </button>
              
              <button
                type="button"
                onClick={handleSkipToVerification}
                className="flex items-center gap-2 rounded-lg border border-[#41b1e1]/50 bg-transparent px-4 py-3 text-[#41b1e1] transition-all hover:bg-[#41b1e1]/10"
              >
                <FileJson className="h-5 w-5" />
                <span>I already have a JSON file</span>
              </button>
            </div>
          </Tabs>
        </form>
      </div>

      {apiReady === false && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-900/20 p-4 text-amber-400">
          The API server is currently starting up. Please wait a moment before submitting.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-red-400">
          {error instanceof ZodError
            ? JSON.parse(error.message)[0].message
            : error.message}
        </div>
      )}

      <div className="mt-6">
        <div className="rounded-xl border border-[#664bda]/50 bg-[#140a33]/50 p-6 backdrop-blur-sm">
          <h3 className="mb-3 text-xl font-medium text-white">
            Sample {inputType === "address" ? "Address" : "ABI"}
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            Click to copy a sample {inputType === "address" ? "address" : "ABI"} for testing
          </p>
          
          <div className="flex flex-wrap gap-2">
            {inputType === "address" ? (
              <>
                <button
                  onClick={() => {
                    const value = "0x0bb4D3e88243F4A057Db77341e6916B0e449b158";
                    void navigator.clipboard.writeText(value);
                    setInput(value);
                  }}
                  className="rounded-lg border border-[#41b1e1]/30 bg-[#0f051d] px-4 py-2 text-[#41b1e1] transition-all hover:-translate-y-1 hover:border-[#41b1e1]/70"
                >
                  Poap
                </button>
                <button
                  onClick={() => {
                    const value = "0x5954ab967bc958940b7eb73ee84797dc8a2afbb9";
                    void navigator.clipboard.writeText(value);
                    setInput(value);
                  }}
                  className="rounded-lg border border-[#41b1e1]/30 bg-[#0f051d] px-4 py-2 text-[#41b1e1] transition-all hover:-translate-y-1 hover:border-[#41b1e1]/70"
                >
                  ApeCoin: Staking
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  // Fetch a sample ABI instead of using hardcoded values
                  fetch("https://api.etherscan.io/api?module=contract&action=getabi&address=0x0bb4D3e88243F4A057Db77341e6916B0e449b158")
                    .then(response => response.json())
                    .then(data => {
                      if (data.status === "1" && data.result) {
                        void navigator.clipboard.writeText(data.result);
                        setInput(data.result);
                      }
                    })
                    .catch(err => {
                      console.error("Error fetching ABI:", err);
                    });
                }}
                className="rounded-lg border border-[#41b1e1]/30 bg-[#0f051d] px-4 py-2 text-[#41b1e1] transition-all hover:-translate-y-1 hover:border-[#41b1e1]/70"
              >
                Poap
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardErc7730;
