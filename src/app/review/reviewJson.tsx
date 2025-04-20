"use client";

import { FileJson, Copy, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import * as React from "react";
import { useRouter } from "next/navigation";

import { ResponsiveDialog } from "~/components/ui/responsiveDialog";
import { useErc7730Store } from "~/store/erc7730Provider";
import { useToast } from "~/hooks/use-toast";

export function ReviewJson() {
  const [open, setOpen] = React.useState(false);
  const erc7730 = useErc7730Store((s) => s.finalErc7730);
  const { toast } = useToast();
  const router = useRouter();

  const handleCopyToClipboard = () => {
    void navigator.clipboard.writeText(JSON.stringify(erc7730, null, 2));
    toast({
      title: "JSON copied to clipboard!",
    });
  };
  
  const handleDownloadJson = () => {
    if (erc7730) {
      const jsonData = JSON.stringify(erc7730, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = "erc7730-specification.json";
      document.body.appendChild(a);
      a.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "JSON downloaded!",
        description: "The complete ERC7730 JSON file has been saved to your downloads folder."
      });
    }
  };
  
  const handleContinue = () => {
    // Close the dialog
    setOpen(false);
    
    // Navigate to the verification-results page
    router.push("/verification-results");
  };

  return (
    <ResponsiveDialog
      dialogTrigger={<Button variant="outline">Next</Button>}
      dialogTitle="Submit your JSON"
      open={open}
      setOpen={setOpen}
    >
      <div className="space-y-4 p-4 md:p-0">
        <p className="text-sm text-gray-600">
          Before submitting, please review your JSON. If everything looks good,
          download the JSON file and press the \"Continue to Verification\" button.
        </p>
        <pre className="max-h-64 overflow-auto rounded border bg-gray-100 p-4 text-sm dark:text-black">
          {JSON.stringify(erc7730, null, 2)}
        </pre>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy to Clipboard
          </Button>
          <Button onClick={handleDownloadJson} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleContinue}>
            Continue to Verification
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}

export default ReviewJson;
