import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { InlineMath } from 'react-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

const bigOData = [
  {
    notation: "O(1)",
    name: "Constant Time",
    description: "Executes in the same amount of time regardless of the input size.",
    reasoning: "The algorithm only requires a single operation (or a fixed number of operations) to complete. There are no loops that depend on the size of the input.",
    code: `# Finding an element at a specific index
def get_first_element(arr):
    return arr[0] # Always takes 1 step`
  },
  {
    notation: "O(\\log n)",
    name: "Logarithmic Time",
    description: "Execution time increases logarithmically as the input size grows.",
    reasoning: "The algorithm repeatedly divides the problem size in half. Instead of checking every element, it discards half of the remaining elements at each step.",
    code: `# Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
  },
  {
    notation: "O(n)",
    name: "Linear Time",
    description: "Execution time grows proportionally with the input size.",
    reasoning: "The algorithm must visit every element in the input exactly once (or a constant number of times).",
    code: `# Finding the maximum value
def find_max(arr):
    max_val = arr[0]
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val`
  },
  {
    notation: "O(n \\log n)",
    name: "Linearithmic Time",
    description: "Execution time grows proportionally to n times the logarithm of n.",
    reasoning: "Often found in efficient sorting algorithms. The algorithm divides the problem into smaller pieces (log n) and then merges or processes each piece (n).",
    code: `# Merge Sort
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right) # merge takes O(n)`
  },
  {
    notation: "O(n^2)",
    name: "Quadratic Time",
    description: "Execution time grows proportionally to the square of the input size.",
    reasoning: "The algorithm contains nested loops, where for every element in the input, it iterates through the input again.",
    code: `# Bubble Sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`
  },
  {
    notation: "O(2^n)",
    name: "Exponential Time",
    description: "Execution time doubles with each addition to the input dataset.",
    reasoning: "Often found in brute-force algorithms or recursive algorithms that solve a problem of size n by recursively solving two smaller problems of size n-1.",
    code: `# Recursive Fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`
  },
  {
    notation: "O(n!)",
    name: "Factorial Time",
    description: "Execution time grows proportionally to the factorial of the input size.",
    reasoning: "The algorithm calculates all possible permutations of the input dataset. This is extremely slow and unfeasible for even relatively small inputs.",
    code: `# Generating all permutations
def get_permutations(arr):
    if len(arr) == 0:
        return [[]]
    result = []
    for i in range(len(arr)):
        rest = get_permutations(arr[:i] + arr[i+1:])
        for p in rest:
            result.append([arr[i]] + p)
    return result`
  }
];

export default function BigOCards() {
  const [selectedNotation, setSelectedNotation] = useState<typeof bigOData[0] | null>(null);

  return (
    <div className="w-full relative">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">Common Time Complexities</h2>
        <p className="text-muted-foreground">Click on a card to learn more about each Big-O notation.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bigOData.map((data, index) => (
          <motion.div
            key={data.notation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Card

              className="cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col items-center justify-center p-6 text-center"
              onClick={() => setSelectedNotation(data)}
            >
              <div className="text-3xl font-bold text-primary mb-2">
                <InlineMath math={data.notation} />
              </div>
              <div className="text-sm font-medium">{data.name}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedNotation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedNotation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold text-primary flex items-center gap-4">
                      <InlineMath math={selectedNotation.notation} />
                      <span className="text-xl text-foreground font-mono">{selectedNotation.name}</span>
                    </h3>
                  </div>
                  <button

                    onClick={() => setSelectedNotation(null)}
                    className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedNotation.description}</p>
                  </div>


                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why?</h4>
                    <p className="text-muted-foreground">{selectedNotation.reasoning}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Code Example</h4>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <CodeMirror
                        value={selectedNotation.code}
                        extensions={[python()]}
                        theme={oneDark}
                        editable={false}
                        readOnly={true}
                        basicSetup={{
                          lineNumbers: true,
                          highlightActiveLineGutter: false,
                          highlightActiveLine: false,
                          foldGutter: false
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
