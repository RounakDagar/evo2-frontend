"use client";

import {
  fetchGeneDetails,
  type GeneBounds,
  type GeneDetailsFromSearch,
  type GeneFromSearch,
  type ClinvarVariant,
  fetchGeneSequence as apiFetchGeneSequence,
  fetchClinvarVariants as apiFetchClinvarVariants,
} from "~/utils/genome-api";
import { Button } from "./ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GeneInformation } from "./gene-information";
import { GeneSequence } from "./gene-sequence";
import KnownVariants from "./known-variants";
import { VariantComparisionModal } from "./variant-comparision-modal";
import VariantAnalysis, {
  type VariantAnalysisHandle,
} from "./variant-analysis";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { cn } from "~/lib/utils";

export default function GeneViewer({
  gene,
  genomeId,
  onClose,
}: {
  gene: GeneFromSearch;
  genomeId: string;
  onClose: () => void;
}) {
  // --- All your original state ---
  const [geneSequence, setGeneSequence] = useState("");
  const [geneDetail, setGeneDetail] = useState<GeneDetailsFromSearch | null>(
    null,
  );
  const [geneBounds, setGeneBounds] = useState<GeneBounds | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startPosition, setStartPosition] = useState<string>("");
  const [endPosition, setEndPosition] = useState<string>("");
  const [isLoadigSequence, setIsLoadingSequence] = useState(false);

  const [clinvarVariants, setClinvarVariants] = useState<ClinvarVariant[]>([]);
  const [isLoadingClinvar, setIsLoadingClinvar] = useState(false);
  const [clinvarError, setClinvarError] = useState<string | null>(null);

  const [actualRange, setActualRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const [comparisionVariant, setComparisionVariant] =
    useState<ClinvarVariant | null>(null);
  const [activeSequencePosition, setActiveSequencePosition] = useState<
    number | null
  >(null);
  const [activeReferenceNucleotide, setActiveReferenceNucleotide] = useState<
    string | null
  >(null);

  const variantAnalysisRef = useRef<VariantAnalysisHandle>(null);
  
  // New state for "wow factor" pulse
  const [highlightAnalysis, setHighlightAnalysis] = useState(false);

  // --- All your original logic/handlers ---
  // --- (This is 100% your working logic) ---
  const updateClinvarVariant = (
    clinvar_id: string,
    updateVariant: ClinvarVariant,
  ) => {
    setClinvarVariants((currentVariants) =>
      currentVariants.map((v) =>
        v.clinvar_id == clinvar_id ? updateVariant : v,
      ),
    );
  };

  const fetchGeneSequence = useCallback(
    async (start: number, end: number) => {
      try {
        setIsLoadingSequence(true);
        setError(null);

        const {
          sequence,
          actualRange: fetchedRange,
          error: apiError,
        } = await apiFetchGeneSequence(gene.chrom, start, end, genomeId);

        setGeneSequence(sequence);
        setActualRange(fetchedRange);

        if (apiError) {
          setError(apiError);
        }
        // console.log(sequence);
      } catch (err) {
        setError("Failed to load sequence data");
      } finally {
        setIsLoadingSequence(false);
      }
    },
    [gene.chrom, genomeId],
  );

  useEffect(() => {
    const initializeGeneData = async () => {
      setIsLoading(true);
      setError(null);
      setGeneDetail(null);
      setStartPosition("");
      setEndPosition("");

      if (!gene.gene_id) {
        setError("Gene ID is missing, cannot fetch details");
        setIsLoading(false);
        return;
      }

      try {
        const {
          geneDetails: fetchedDetails,
          geneBounds: fetchedGeneBounds,
          initialRange: fetchedRange,
        } = await fetchGeneDetails(gene.gene_id);

        setGeneDetail(fetchedDetails);
        setGeneBounds(fetchedGeneBounds);

        if (fetchedRange) {
          setStartPosition(String(fetchedRange.start));
          setEndPosition(String(fetchedRange.end));

          //Fetch Gene Sequence
          await fetchGeneSequence(fetchedRange.start, fetchedRange.end);
        }
        // console.log(fetchedDetails);
      } catch {
        setError("Failed to load gene information. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeGeneData();
  }, [gene, genomeId, fetchGeneSequence]);

  const handleSequenceClick = useCallback(
    (position: number, nucleotide: string) => {
      setActiveSequencePosition(position);
      setActiveReferenceNucleotide(nucleotide);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (variantAnalysisRef.current) {
        variantAnalysisRef.current.focusAlternativeInput();
      }
      // "Wow factor" pulse animation
      setHighlightAnalysis(true);
      setTimeout(() => setHighlightAnalysis(false), 1500);
    },
    [],
  );

  const handleLoadSequence = useCallback(() => {
    const start = parseInt(startPosition.replace(/,/g, ''));
    const end = parseInt(endPosition.replace(/,/g, ''));

    let validationError: string | null = null;

    if (isNaN(start) || isNaN(end)) {
      validationError = "Please enter valid start and end positions.";
    } else if (start >= end) {
      validationError = "Start position must be less than end position.";
    } else if (geneBounds) {
      const minBound = Math.min(geneBounds.min, geneBounds.max);
      const maxBound = Math.max(geneBounds.min, geneBounds.max);

      if (start < minBound) {
        validationError = `Start position (${start.toLocaleString()}) is below the minimum value (${minBound.toLocaleString()}).`;
      } else if (end > maxBound) {
        validationError = `End position (${end.toLocaleString()}) exceeds the maximum value (${maxBound.toLocaleString()}).`;
      }

      if (end - start > 10000) {
        validationError = `Selected range exceeds maximum view range of 10,000 bp.`;
      }
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    fetchGeneSequence(start, end);
  }, [startPosition, endPosition, fetchGeneSequence, geneBounds]);

  const fetchClinvarVariants = useCallback(async () => {
    if (!gene.chrom || !geneBounds) return;

    setIsLoadingClinvar(true);
    setClinvarError(null);

    try {
      const variants = await apiFetchClinvarVariants(
        gene.chrom,
        geneBounds,
        genomeId,
      );
      setClinvarVariants(variants);
      console.log(variants);
    } catch (error) {
      setClinvarError("Failed to fetch ClinVar variants");
      setClinvarVariants([]);
    } finally {
      setIsLoadingClinvar(false);
    }
  }, [gene.chrom, geneBounds, genomeId]);

  useEffect(() => {
    if (geneBounds) {
      fetchClinvarVariants();
    }
  }, [geneBounds, fetchClinvarVariants]);

  const showComparision = (variant: ClinvarVariant) => {
    if (variant.evo2Result) {
      setComparisionVariant(variant);
    }
  };
  // --- End of original logic ---


  if (isLoading) {
    return <GeneViewerSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* --- Sticky Sub-Header --- */}
      <div className="sticky top-16 z-40 -mt-2 bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={onClose}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to results
          </Button>
          <h1 className="truncate text-right text-2xl font-semibold text-foreground">
            {gene.symbol}
            <span className="ml-3 hidden text-lg font-light text-muted-foreground sm:inline">
              {gene.name}
            </span>
          </h1>
        </div>
      </div>
      
      {/* --- Main Grid Layout --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* --- Main Content Column --- */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* --- Global Error Display --- */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>An Error Occurred</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div
            className={cn(
              "rounded-lg transition-all duration-300",
              highlightAnalysis && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            <VariantAnalysis
              ref={variantAnalysisRef}
              gene={gene}
              genomeId={genomeId}
              chromosome={gene.chrom}
              clinvarVariants={clinvarVariants}
              referenceSequence={activeReferenceNucleotide}
              sequencePosition={activeSequencePosition}
              geneBounds={geneBounds}
            />
          </div>

          <GeneSequence
            geneBounds={geneBounds}
            geneDetail={geneDetail}
            startPosition={startPosition}
            endPosition={endPosition}
            onStartPositionChange={setStartPosition}
            onEndPositionChange={setEndPosition}
            sequenceData={geneSequence}
            sequenceRange={actualRange}
            isLoading={isLoadigSequence}
            error={null} // Error is handled globally now
            onSequenceLoadRequest={handleLoadSequence}
            onSequenceClick={handleSequenceClick}
            maxViewRange={10000}
          />

          <KnownVariants
            refreshVariants={fetchClinvarVariants}
            showComparision={showComparision}
            updateClinvarVariant={updateClinvarVariant}
            clinvarVariants={clinvarVariants}
            isLoadingClinvar={isLoadingClinvar}
            clinvarError={clinvarError}
            genomeId={genomeId}
            gene={gene}
          />
        </div>

        {/* --- Sticky Sidebar Column --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-36 space-y-6">
            <GeneInformation
              gene={gene}
              geneDetail={geneDetail}
              geneBounds={geneBounds}
            />
          </div>
        </div>
      </div>

      <VariantComparisionModal
        comparisionVariant={comparisionVariant}
        onClose={() => setComparisionVariant(null)}
      />
    </div>
  );
}

// Premium Skeleton for Gene Viewer Loading
const GeneViewerSkeleton = () => (
  <div className="space-y-6">
    {/* Skeleton Sub-Header */}
    <div className="flex items-center justify-between py-4">
      <Skeleton className="h-9 w-36" />
      <Skeleton className="h-8 w-64" />
    </div>

    {/* Skeleton Grid */}
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main Content Skeleton */}
      <div className="space-y-6 lg:col-span-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1">
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  </div>
);