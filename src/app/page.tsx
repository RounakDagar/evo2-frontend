"use client"

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import GeneViewer from "~/components/gene-viewer";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { type ChromosomeFromSearch, type GeneFromSearch, type GenomeAssemblyFromSearch, getAvailableGenomes, getGenomeChromosomes, searchGenes } from "~/utils/genome-api";
import { AnimatePresence, motion } from "framer-motion";

type Mode = "browse" | "search"

export default function HomePage() {
  // --- All your original state ---
  const [genomes, setGenomes] = useState<GenomeAssemblyFromSearch[]>([]);
  const [selectedGenome, setSelectedGenome] = useState<string>("hg38");
  const [chromosomes, setChromosomes] = useState<ChromosomeFromSearch[]>([]);
  const [selectedChromosome, setSelectedChromosome] = useState<string>("chr1");
  const [selectedGene, setSelectedGene] = useState<GeneFromSearch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeneFromSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("search");
  
  // --- All your original useEffect and handler logic ---
  // --- (This is 100% your working logic) ---
  useEffect(() => {
    const fetchGenomes = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableGenomes();
        if (data.genomes && data.genomes["Human"]) {
          setGenomes(data.genomes["Human"]);
        }
      } catch(err) {
        setError("Failed to load genome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenomes();
  }, [])

  useEffect(() => {
    const fetchChromosomes = async () => {
      if (!selectedGenome) return;
      try {
        setIsLoading(true);
        const data = await getGenomeChromosomes(selectedGenome);
        setChromosomes(data.chromosomes);
        console.log(data.chromosomes);
        if (data.chromosomes.length > 0 && !selectedChromosome) {
          setSelectedChromosome(data.chromosomes[0]!.name);
        }
      } catch(err) {
        setError("Failed to load chromosome data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChromosomes();
  }, [selectedGenome, selectedChromosome]);

  const performGeneSearch = async (
    query: string, 
    genome: string, 
    filterFn?: (gene: GeneFromSearch) => boolean
  ) => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const data = await searchGenes(query, genome);
      const results = filterFn ? data.results.filter(filterFn) : data.results;
      console.log(results);

      setSearchResults(results);
    } catch (err) {
      setError("Failed to search genes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChromosome || mode !== "browse") {
      return;
    }

    performGeneSearch(
      selectedChromosome,
      selectedGenome,
      (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
    )
  }, [selectedChromosome, selectedGenome, mode])

  const handleGenomeChange = (value: string) => {
    setSelectedGenome(value);
    setSearchResults([]);
    setSelectedGene(null);
  }

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;

    setSearchResults([]);
    setSelectedGene(null);
    setError(null);

    if (newMode === "browse" && selectedChromosome) {
      performGeneSearch(
        selectedChromosome,
        selectedGenome,
        (gene: GeneFromSearch) => gene.chrom === selectedChromosome,
      )
    }

    setMode(newMode);
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Perform Gene Search
    performGeneSearch(searchQuery, selectedGenome);
  }

  const loadBRCA1Example = () => {
    setMode("search");
    setSearchQuery("BRCA1");
    // Handle Search
    performGeneSearch("BRCA1", selectedGenome);
  }
  // --- End of original logic ---


  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="text-xl font-light tracking-wide text-foreground">
                <span className="font-normal">EVO</span>
                <span className="text-primary">2</span>
              </h1>
              <div className="absolute -bottom-1 left-0 h-0.5 w-13.5 bg-primary"></div>
            </div>
            <span className="text-sm font-normal text-muted-foreground">Variant Analysis</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedGene ? (
            <motion.div
              key="gene-viewer"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <GeneViewer 
                gene={selectedGene} 
                genomeId={selectedGenome}
                onClose={() => setSelectedGene(null)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="gene-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* --- Main Content (Left Column) --- */}
                <div className="space-y-6 lg:col-span-2">
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">Browse & Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={mode} onValueChange={(value:string) => switchMode(value as Mode)}>
                        <TabsList className="mb-4 grid w-full grid-cols-2 bg-muted">
                          <TabsTrigger value="search">Search Genes</TabsTrigger>
                          <TabsTrigger value="browse">Browse Chromosomes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="search" className="mt-0">
                          <div className="space-y-4">
                            <form 
                              onSubmit={handleSearch}
                              className="flex flex-col gap-3 sm:flex-row"
                            >
                              <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                  type="text" 
                                  placeholder="Enter Gene Symbol (e.g., BRCA1, APOE)"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="h-10 pl-10"
                                />
                              </div>
                              <Button 
                                type="submit"
                                className="h-10"
                                disabled={isLoading || !searchQuery.trim()}
                              >
                                <Search className="mr-2 h-4 w-4 sm:hidden" />
                                Search
                              </Button>
                            </form>
                            <Button 
                              variant="link" 
                              className="h-auto cursor-pointer p-0 text-primary hover:text-primary/80"
                              onClick={loadBRCA1Example}
                            >
                              Try BRCA-1 example
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="browse" className="mt-0">
                          <div className="w-full overflow-x-auto pb-2">
                            <div className="flex flex-nowrap gap-2">
                              {chromosomes.map((chrom) => (
                                <Button 
                                  key={chrom.name} 
                                  variant={selectedChromosome === chrom.name ? "default" : "outline"}
                                  size="sm"
                                  className="h-8 cursor-pointer"
                                  onClick={() =>setSelectedChromosome(chrom.name)}
                                >
                                  {chrom.name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {error && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* --- Results Area --- */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <h4 className="text-lg font-medium text-foreground">
                        {mode === "search" ? "Search Results" : `Genes on ${selectedChromosome}`}
                      </h4>
                      {!isLoading && searchResults.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Found <span className="font-medium text-foreground">{searchResults.length}</span> genes.
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {isLoading && <SearchResultsSkeleton />}

                      {!isLoading && error && searchResults.length === 0 && (
                        <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                          {/* Error is already shown in the card above */}
                        </div>
                      )}
                      
                      {!isLoading && !error && searchResults.length === 0 && (
                        <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
                          <Search className="mb-4 h-10 w-10 text-muted-foreground/50"/>
                          <p className="text-sm leading-relaxed">
                            {mode === "search" 
                              ? "Enter a gene or symbol and click search" 
                              : selectedChromosome 
                                ? "No genes found on this chromosome" 
                                : "Select a chromosome to view genes"}
                          </p>
                        </div>
                      )}

                      {!isLoading && searchResults.length > 0 && (
                        <div className="overflow-hidden rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 hover:bg-muted/70">
                                <TableHead>Symbol</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {searchResults.map((gene, index) => (
                                <TableRow 
                                  key={`${gene.symbol}-${index}`}
                                  className="cursor-pointer border-b transition-colors hover:bg-muted/50"
                                  onClick={() => setSelectedGene(gene)}
                                >
                                  <TableCell className="py-3 font-medium text-primary">
                                    {gene.symbol}
                                  </TableCell>
                                  <TableCell className="py-3 text-foreground">
                                    {gene.name}
                                  </TableCell>
                                  <TableCell className="py-3 text-muted-foreground">
                                    {gene.chrom}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* --- Sidebar (Right Column) --- */}
                <div className="space-y-6 lg:col-span-1">
                  <Card className="sticky top-24 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Genome Assembly</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          Organism: <span className="font-medium text-foreground">Human</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Select 
                        value={selectedGenome} 
                        onValueChange={handleGenomeChange}
                        disabled={isLoading && genomes.length === 0}
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select Genome Assembly"/>
                        </SelectTrigger>
                          <SelectContent>
                            {genomes.map((genome) => (
                              <SelectItem key={genome.id} value={genome.id}>
                                {genome.id} - {genome.name}
                                {genome.active ? " (active)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                      {selectedGenome && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {genomes.find((genome) => genome.id === selectedGenome)?.sourceName}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Premium Skeleton Component for Loading State
const SearchResultsSkeleton = () => (
  <div className="space-y-2">
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead><Skeleton className="h-5 w-20" /></TableHead>
          <TableHead><Skeleton className="h-5 w-48" /></TableHead>
          <TableHead><Skeleton className="h-5 w-24" /></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i} className="border-b">
            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell className="py-3"><Skeleton className="h-5 w-40" /></TableCell>
            <TableCell className="py-3"><Skeleton className="h-5 w-20" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);