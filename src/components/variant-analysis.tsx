"use client";

import {
  type ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { type GeneFromSearch, type GeneBounds } from "~/utils/genome-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlertCircle, BrainCircuit, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { formatNumberWithCommas } from "~/utils/coloring-utils";

// Mock API call - replace with your actual API logic
async function mockFetchEvo2Analysis(
  position: number,
  ref: string,
  alt: string,
) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Simulate a pathogenic result
  if (alt.toUpperCase() === "A") {
    return {
      log_odds: -2.456,
      score: 0.82,
      classification: "Pathogenic",
    };
  }
  // Simulate a benign result
  return {
    log_odds: 0.789,
    score: 0.15,
    classification: "Benign",
  };
}

// Types
export type VariantAnalysisHandle = {
  focusAlternativeInput: () => void;
};

type AnalysisResult = {
  log_odds: number;
  score: number;
  classification: "Pathogenic" | "Benign";
};

type VariantAnalysisProps = {
  gene: GeneFromSearch;
  genomeId: string;
  chromosome: string;
  clinvarVariants: unknown[]; // Not used in this component directly, but passed
  referenceSequence: string | null;
  sequencePosition: number | null;
  geneBounds: GeneBounds | null;
};

const VariantAnalysis = forwardRef<VariantAnalysisHandle, VariantAnalysisProps>(
  (
    {
      gene,
      genomeId,
      chromosome,
      referenceSequence,
      sequencePosition,
      geneBounds,
    },
    ref,
  ) => {
    const [position, setPosition] = useState("");
    const [reference, setReference] = useState("");
    const [alternative, setAlternative] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    const alternativeInputRef = useRef<HTMLInputElement>(null);

    // Update state when props change
    useEffect(() => {
      if (sequencePosition) {
        setPosition(formatNumberWithCommas(sequencePosition));
      }
      if (referenceSequence) {
        setReference(referenceSequence);
      }
      // Clear alternative and results when a new position is selected
      setAlternative("");
      setResult(null);
      setError(null);
    }, [sequencePosition, referenceSequence]);

    useImperativeHandle(ref, () => ({
      focusAlternativeInput: () => {
        alternativeInputRef.current?.focus();
      },
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!position || !reference || !alternative) {
        setError("All fields are required for analysis.");
        return;
      }
      
      const numPosition = parseInt(position.replace(/,/g, ''));
      if (isNaN(numPosition)) {
        setError("Position must be a valid number.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        // TODO: Replace with your actual backend API call
        const analysisResult = await mockFetchEvo2Analysis(
          numPosition,
          reference,
          alternative,
        );
        // Ensure classification is typed correctly
        if (
          analysisResult.classification === "Pathogenic" ||
          analysisResult.classification === "Benign"
        ) {
          setResult({
            ...analysisResult,
            classification: analysisResult.classification as "Pathogenic" | "Benign",
          });
        } else {
          setError("Unexpected classification result from analysis.");
        }
      } catch (err) {
        setError("Failed to run analysis. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const getResultColor = (classification: string) => {
      return classification === "Pathogenic"
        ? "text-destructive"
        : "text-green-500";
    };

    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Run Evo2 Variant Analysis
          </CardTitle>
          <CardDescription>
            Enter a single nucleotide polymorphism (SNP) to analyze its
            pathogenicity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Position
                </label>
                <Input
                  placeholder="e.g., 43,044,295"
                  value={position}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPosition(formatNumberWithCommas(e.target.value))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Reference (Ref)
                </label>
                <Input
                  placeholder="e.g., C"
                  value={reference}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setReference(e.target.value.toUpperCase())
                  }
                  maxLength={1}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Alternative (Alt)
                </label>
                <Input
                  ref={alternativeInputRef}
                  placeholder="e.g., A"
                  value={alternative}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAlternative(e.target.value.toUpperCase())
                  }
                  maxLength={1}
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isLoading || !position || !reference || !alternative}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-4 w-4" />
              )}
              Run Analysis
            </Button>
          </form>

          {isLoading && <AnalysisSkeleton />}

          {result && !isLoading && (
            <div className="mt-6 rounded-lg border bg-accent/50 p-6">
              <h3 className="text-md font-semibold text-foreground">
                Analysis Result
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Classification
                  </span>
                  <span
                    className={`text-2xl font-bold ${getResultColor(
                      result.classification,
                    )}`}
                  >
                    {result.classification}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="text-2xl font-bold text-foreground">
                    {result.score.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Log Odds
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {result.log_odds.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

VariantAnalysis.displayName = "VariantAnalysis";
export default VariantAnalysis;

const AnalysisSkeleton = () => (
  <div className="mt-6 rounded-lg border bg-accent/50 p-6">
    <Skeleton className="h-6 w-40" />
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  </div>
);