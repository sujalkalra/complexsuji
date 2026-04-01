import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lightbulb, BookOpen, Quote } from 'lucide-react';

const nerdyFacts = [
  "In 1965, Juris Hartmanis and Richard Stearns published the paper 'On the Computational Complexity of Algorithms', formalizing the study of algorithm complexity.",
  "O(1) doesn't mean it takes 1 second or 1 operation, it means the time is constant regardless of the input size.",
  "Bogosort is a highly inefficient sorting algorithm based on the generate and test paradigm. Its average time complexity is O((n+1)!).",
  "The fastest known deterministic algorithm for sorting is still O(n log n).",
  "Quicksort is generally faster in practice than other O(n log n) algorithms like Merge Sort because its inner loop can be efficiently implemented on most architectures, and it operates largely in-place.",
  "Space complexity is just as important as time complexity, especially in embedded systems and mobile apps with limited memory.",
  "NP-complete problems, like the Traveling Salesman Problem, are widely believed to have no known polynomial-time O(n^k) solutions.",
  "Radix sort and Counting sort can sort in O(n) time, but they have restrictions on the type of data they can sort (e.g., integers within a specific range).",
  "Binary search reduces the search space by half in each step, which is why its time complexity is O(log n).",
  "Hash tables can provide O(1) average time complexity for insertions, deletions, and lookups, but in the worst-case scenario (with many collisions), they can degrade to O(n)."
];

export default function NerdyFacts() {
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % nerdyFacts.length);
    }, 8000); // Change fact every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="overflow-hidden border-border/40 bg-secondary/20 hover:bg-secondary/30 transition-colors mt-8">
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Did You Know?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-start relative min-h-[80px]">
          <Quote className="h-6 w-6 text-muted-foreground/40 absolute top-0 left-0" />
          <p className="pl-8 text-sm italic text-muted-foreground animate-fade-in" key={currentFact}>
            {nerdyFacts[currentFact]}
          </p>
        </div>
        <div className="flex justify-center gap-1 mt-4">
          {nerdyFacts.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-all ${index === currentFact ? 'bg-primary w-3' : 'bg-muted'}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
