
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LanguageSelector } from './components/LanguageSelector';
import { CodeInput } from './components/CodeInput';
import { ApiKeyInput } from './components/ApiKeyInput'; // New component
import { SUPPORTED_LANGUAGES } from './constants';
import { ReviewResult } from './types';
import { reviewCodeWithGemini } from './services/geminiService';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ReviewPanel } from './components/ReviewPanel';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Attempt to load API key from localStorage for convenience during a session
    return localStorage.getItem('geminiApiKey') || '';
  });
  const [originalCode, setOriginalCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].value);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('geminiApiKey', apiKey);
    } else {
      // If key is cleared, remove it from localStorage
      localStorage.removeItem('geminiApiKey');
    }
  }, [apiKey]);

  const handleReviewCode = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API Key.');
      return;
    }
    if (!originalCode.trim()) {
      setError('Please enter some code to review.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReviewResult(null);

    try {
      const responseText = await reviewCodeWithGemini(originalCode, selectedLanguage, apiKey);
      
      let parsedFeedback = "";
      let parsedRevisedCode = "";
      let parsedRevisedCodeLanguage = selectedLanguage.toLowerCase();

      const feedbackStartTag = '<REVIEW_FEEDBACK_START>';
      const feedbackEndTag = '<REVIEW_FEEDBACK_END>';
      const revisedCodeStartTagPattern = /<REVISED_CODE_START(?:\s+language="([^"]+)")?>/;
      const revisedCodeEndTag = '</REVISED_CODE_END>';

      const feedbackStartIndex = responseText.indexOf(feedbackStartTag);
      const feedbackEndIndex = responseText.indexOf(feedbackEndTag);
      if (feedbackStartIndex !== -1 && feedbackEndIndex !== -1 && feedbackEndIndex > feedbackStartIndex) {
        parsedFeedback = responseText.substring(feedbackStartIndex + feedbackStartTag.length, feedbackEndIndex).trim();
      }

      const revisedCodeStartMatch = responseText.match(revisedCodeStartTagPattern);
      const revisedCodeEndTagIndex = responseText.indexOf(revisedCodeEndTag);

      if (revisedCodeStartMatch && revisedCodeEndTagIndex !== -1 && revisedCodeEndTagIndex > revisedCodeStartMatch.index!) {
        const revisedCodeStartIndex = revisedCodeStartMatch.index! + revisedCodeStartMatch[0].length;
        parsedRevisedCode = responseText.substring(revisedCodeStartIndex, revisedCodeEndTagIndex).trim();
        if (revisedCodeStartMatch[1]) {
            parsedRevisedCodeLanguage = revisedCodeStartMatch[1].trim().toLowerCase();
        }
      }

      if (!parsedRevisedCode) {
        const mdCodeBlockRegex = /```(\w*)\s*\n([\s\S]*?)\n```/m; 
        const mdMatch = responseText.match(mdCodeBlockRegex);
        if (mdMatch && mdMatch[2]) {
          parsedRevisedCode = mdMatch[2].trim();
          if (mdMatch[1]) {
            parsedRevisedCodeLanguage = mdMatch[1].trim().toLowerCase();
          }
          if (!parsedFeedback && mdMatch.index! > 0) {
            const potentialFeedback = responseText.substring(0, mdMatch.index!).trim();
            if (potentialFeedback && potentialFeedback !== feedbackStartTag && potentialFeedback !== feedbackEndTag) {
              parsedFeedback = potentialFeedback;
            }
          }
        }
      }
      
      if (!parsedFeedback && parsedRevisedCode && revisedCodeStartMatch && revisedCodeStartMatch.index! > 0) {
          const isCodeFromTags = responseText.substring(revisedCodeStartMatch.index!, revisedCodeStartMatch.index! + revisedCodeStartMatch[0].length) === revisedCodeStartMatch[0];
          if (isCodeFromTags) {
            const textBeforeCodeBlock = responseText.substring(0, revisedCodeStartMatch.index!).trim();
            if (textBeforeCodeBlock && textBeforeCodeBlock !== feedbackStartTag && textBeforeCodeBlock !== feedbackEndTag) {
                parsedFeedback = textBeforeCodeBlock;
            }
          }
      }

      if (!parsedFeedback && !parsedRevisedCode) {
        parsedFeedback = responseText; 
        parsedRevisedCode = "// Could not identify a separate revised code block.";
         if (!responseText.trim()) {
           setError("Gemini's response was empty. This might be due to an issue with the request or the API key.");
        } else {
           setError("Could not clearly parse distinct feedback and revised code from Gemini's response. Displaying the full response as feedback.");
        }
      } else if (!parsedFeedback) {
        parsedFeedback = "No specific feedback text was identified, or feedback parsing failed.";
      } else if (!parsedRevisedCode) {
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
      setReviewResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [originalCode, selectedLanguage, apiKey]);

  const handleClear = () => {
    setOriginalCode('');
    setSelectedLanguage(SUPPORTED_LANGUAGES[0].value);
    setReviewResult(null);
    setError(null); 
    setIsLoading(false);
    // Do not clear API key on "Clear All"
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-slate-200">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        {/* API Key Input - Moved to top for prominence */}
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />

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
              <Button 
                onClick={handleReviewCode} 
                disabled={isLoading || !originalCode.trim() || !apiKey.trim()} 
                variant="primary" 
                fullWidth={false}
                title={!apiKey.trim() ? "Please enter your Gemini API Key" : (!originalCode.trim() ? "Please enter some code to review" : "Review Code")}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Review Code'}
              </Button>
              <Button onClick={handleClear} variant="secondary" fullWidth={false}>
                Clear All
              </Button>
            </div>
             {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm" role="alert">{error}</p>}
          </div>

          {/* Output Section */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 flex flex-col space-y-6 min-h-[calc(100vh-300px)] lg:min-h-0"> {/* Adjusted min-height */}
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
                {!apiKey.trim() && <p className="text-amber-400 text-sm mt-2">Please enter your Gemini API Key above to enable code review.</p>}
                {apiKey.trim() && <p className="text-sm">Enter your code and click "Review Code".</p>}
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
