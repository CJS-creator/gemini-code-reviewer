
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LanguageSelector } from './components/LanguageSelector';
import { CodeInput } from './components/CodeInput';
import { SUPPORTED_LANGUAGES } from './constants';
import { ReviewResult } from './types';
import { reviewCodeWithGemini } from './services/geminiService';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ReviewPanel } from './components/ReviewPanel';

const App: React.FC = () => {
  const [originalCode, setOriginalCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].value);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReviewCode = useCallback(async () => {
    if (!originalCode.trim()) {
      setError('Please enter some code to review.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReviewResult(null);

    try {
      const responseText = await reviewCodeWithGemini(originalCode, selectedLanguage);
      
      let parsedFeedback = "";
      let parsedRevisedCode = "";
      let parsedRevisedCodeLanguage = selectedLanguage.toLowerCase(); // Default to input language

      const feedbackStartTag = '<REVIEW_FEEDBACK_START>';
      const feedbackEndTag = '<REVIEW_FEEDBACK_END>';
      const revisedCodeStartTagPattern = /<REVISED_CODE_START(?:\s+language="([^"]+)")?>/;
      const revisedCodeEndTag = '</REVISED_CODE_END>';

      // Attempt 1: Parse feedback using dedicated tags
      const feedbackStartIndex = responseText.indexOf(feedbackStartTag);
      const feedbackEndIndex = responseText.indexOf(feedbackEndTag);
      if (feedbackStartIndex !== -1 && feedbackEndIndex !== -1 && feedbackEndIndex > feedbackStartIndex) {
        parsedFeedback = responseText.substring(feedbackStartIndex + feedbackStartTag.length, feedbackEndIndex).trim();
      }

      // Attempt 2: Parse revised code using dedicated tags
      const revisedCodeStartMatch = responseText.match(revisedCodeStartTagPattern);
      const revisedCodeEndTagIndex = responseText.indexOf(revisedCodeEndTag);

      if (revisedCodeStartMatch && revisedCodeEndTagIndex !== -1 && revisedCodeEndTagIndex > revisedCodeStartMatch.index!) {
        const revisedCodeStartIndex = revisedCodeStartMatch.index! + revisedCodeStartMatch[0].length;
        parsedRevisedCode = responseText.substring(revisedCodeStartIndex, revisedCodeEndTagIndex).trim();
        if (revisedCodeStartMatch[1]) {
            parsedRevisedCodeLanguage = revisedCodeStartMatch[1].trim().toLowerCase();
        }
      }

      // Attempt 3: Fallback to markdown for revised code if tag parsing failed for code
      if (!parsedRevisedCode) {
        const mdCodeBlockRegex = /```(\w*)\s*\n([\s\S]*?)\n```/m; 
        const mdMatch = responseText.match(mdCodeBlockRegex);
        if (mdMatch && mdMatch[2]) {
          parsedRevisedCode = mdMatch[2].trim();
          if (mdMatch[1]) {
            parsedRevisedCodeLanguage = mdMatch[1].trim().toLowerCase();
          }
          // If feedback was NOT found by tags, AND code IS found by markdown,
          // assume text before markdown is feedback.
          if (!parsedFeedback && mdMatch.index! > 0) {
            const potentialFeedback = responseText.substring(0, mdMatch.index!).trim();
            if (potentialFeedback) {
              parsedFeedback = potentialFeedback;
            }
          }
        }
      }
      
      // Attempt 4: If feedback is still missing, but revised code (via tags) was found,
      // try to get feedback from text before the revised code block.
      // This handles cases where <REVISED_CODE_START> exists but <REVIEW_FEEDBACK_START> doesn't.
      if (!parsedFeedback && parsedRevisedCode && revisedCodeStartMatch && revisedCodeStartMatch.index! > 0) {
          // Ensure we only do this if revised code was found by TAGS, 
          // because markdown feedback extraction (if code was from markdown) is handled in Attempt 3.
          // Also, this relies on revisedCodeStartMatch being from the tag parsing.
          const isCodeFromTags = responseText.substring(revisedCodeStartMatch.index!, revisedCodeStartMatch.index! + revisedCodeStartMatch[0].length) === revisedCodeStartMatch[0];
          if (isCodeFromTags) {
            const textBeforeCodeBlock = responseText.substring(0, revisedCodeStartMatch.index!).trim();
            if (textBeforeCodeBlock) {
                parsedFeedback = textBeforeCodeBlock;
            }
          }
      }

      // Final assignment and error messages if parsing is incomplete or ambiguous
      if (!parsedFeedback && !parsedRevisedCode) {
        // If neither was found, the whole response might be just feedback, or an error from the model.
        parsedFeedback = responseText; // Display raw response as feedback
        parsedRevisedCode = "// Could not identify a separate revised code block.";
        setError("Could not clearly parse distinct feedback and revised code from Gemini's response. Displaying the full response as feedback.");
      } else if (!parsedFeedback) {
        parsedFeedback = "No specific feedback text was identified, or feedback parsing failed.";
      } else if (!parsedRevisedCode) {
        // If feedback was found, but code was not.
        parsedRevisedCode = `// No revised code block was identified for ${parsedRevisedCodeLanguage}.`;
      }

      setReviewResult({ 
        feedback: parsedFeedback, 
        revisedCode: parsedRevisedCode, 
        language: parsedRevisedCodeLanguage 
      });

    } catch (err) {
      console.error("Error during code review:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Check console for details.';
      setError(errorMessage);
      setReviewResult(null); // Clear any partial results
    } finally {
      setIsLoading(false);
    }
  }, [originalCode, selectedLanguage]);

  const handleClear = () => {
    setOriginalCode('');
    setSelectedLanguage(SUPPORTED_LANGUAGES[0].value);
    setReviewResult(null);
    setError(null); // Ensure errors are cleared
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 flex flex-col space-y-6">
            <div>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
                languages={SUPPORTED_LANGUAGES}
              />
            </div>
            <CodeInput
              value={originalCode}
              onChange={setOriginalCode}
              language={selectedLanguage}
              placeholder={`Paste your ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label || 'code'} here...`}
            />
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button onClick={handleReviewCode} disabled={isLoading || !originalCode.trim()} variant="primary" fullWidth={false}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Review Code'}
              </Button>
              <Button onClick={handleClear} variant="secondary" fullWidth={false}>
                Clear All
              </Button>
            </div>
             {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm" role="alert">{error}</p>}
          </div>

          {/* Output Section */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 flex flex-col space-y-6 min-h-[calc(100vh-250px)] lg:min-h-0">
            {isLoading && !reviewResult && (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-400" aria-live="polite">
                <LoadingSpinner size="lg"/>
                <p className="mt-4 text-lg">Gemini is thinking...</p>
                <p className="text-sm">Analyzing your code, please wait.</p>
              </div>
            )}
            {!isLoading && !reviewResult && !error && (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-500 italic">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                <p>Review results will appear here.</p>
                <p className="text-sm">Enter your code and click "Review Code".</p>
              </div>
            )}
            {reviewResult && <ReviewPanel reviewResult={reviewResult} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
