"use client";

import {
  type GeneBounds,
  type GeneDetailsFromSearch,
  type GeneFromSearch,
} from "~/utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// import { Skeleton } from "./ui/skeleton";
import { Skeleton } from "./ui/skeleton";

export function GeneInformation({
  gene,
  geneDetail,
  geneBounds,
}: {
  gene: GeneFromSearch;
  geneDetail: GeneDetailsFromSearch | null;
  geneBounds: GeneBounds | null;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Gene Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {geneDetail ? (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Symbol</dt>
              <dd className="font-mono text-foreground">{gene.symbol}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Full Name</dt>
              <dd className="text-right text-foreground">{gene.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Gene ID</dt>
              <dd className="font-mono text-foreground">{gene.gene_id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Chromosome</dt>
              <dd className="font-mono text-foreground">{gene.chrom}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Type</dt>
              <dd className="text-foreground">{geneDetail.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-muted-foreground">Source</dt>
              <dd className="text-foreground">{geneDetail.source}</dd>
            </div>
          </dl>
        ) : (
          <GeneInformationSkeleton />
        )}

        <div className="space-y-2 pt-4">
          <h4 className="font-medium text-muted-foreground">Gene Bounds</h4>
          {geneBounds ? (
            <div className="flex justify-between rounded-md border bg-accent/50 p-3 text-sm">
              <div className="flex-1 space-y-1">
                <div className="font-mono text-xs">MIN</div>
                <div className="font-medium text-foreground">
                  {geneBounds.min.toLocaleString()}
                </div>
              </div>
              <div className="flex-1 space-y-1 text-right">
                <div className="font-mono text-xs">MAX</div>
                <div className="font-medium text-foreground">
                  {geneBounds.max.toLocaleString()}
                </div>
              </div>
            </div>
          ) : (
            <Skeleton className="h-16 w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const GeneInformationSkeleton = () => (
  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-12" />
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);