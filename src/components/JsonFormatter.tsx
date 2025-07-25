import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JsonError {
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [formattedJson, setFormattedJson] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<JsonError[]>([]);
  const { toast } = useToast();

  const parseJsonWithErrors = useCallback((jsonString: string): { valid: boolean; errors: JsonError[] } => {
    if (!jsonString.trim()) {
      return { valid: false, errors: [] };
    }

    try {
      JSON.parse(jsonString);
      return { valid: true, errors: [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Extract line and column from error message
      const match = errorMessage.match(/at position (\d+)/);
      let line = 1;
      let column = 1;
      
      if (match) {
        const position = parseInt(match[1]);
        const lines = jsonString.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      // Generate helpful suggestions based on common errors
      let suggestion = '';
      if (errorMessage.includes('Unexpected token')) {
        if (errorMessage.includes('"')) {
          suggestion = 'Check for missing or extra quotes. Make sure all strings are properly quoted.';
        } else if (errorMessage.includes(',')) {
          suggestion = 'Remove trailing comma or check for missing value after comma.';
        } else if (errorMessage.includes('}')) {
          suggestion = 'Check for missing comma before closing brace or extra closing brace.';
        } else if (errorMessage.includes(']')) {
          suggestion = 'Check for missing comma before closing bracket or extra closing bracket.';
        }
      } else if (errorMessage.includes('Unexpected end of JSON input')) {
        suggestion = 'JSON appears to be incomplete. Check for missing closing braces } or brackets ].';
      }

      return {
        valid: false,
        errors: [{
          line,
          column,
          message: errorMessage,
          suggestion
        }]
      };
    }
  }, []);

  const formatJson = useCallback(() => {
    if (!inputJson.trim()) {
      setFormattedJson('');
      setIsValid(null);
      setErrors([]);
      return;
    }

    const result = parseJsonWithErrors(inputJson);
    setIsValid(result.valid);
    setErrors(result.errors);

    if (result.valid) {
      try {
        const parsed = JSON.parse(inputJson);
        const formatted = JSON.stringify(parsed, null, 2);
        setFormattedJson(formatted);
      } catch (error) {
        setFormattedJson('');
      }
    } else {
      setFormattedJson('');
    }
  }, [inputJson, parseJsonWithErrors]);

  const handleInputChange = (value: string) => {
    setInputJson(value);
    if (value.trim()) {
      const result = parseJsonWithErrors(value);
      setIsValid(result.valid);
      setErrors(result.errors);
      
      if (result.valid) {
        try {
          const parsed = JSON.parse(value);
          const formatted = JSON.stringify(parsed, null, 2);
          setFormattedJson(formatted);
        } catch (error) {
          setFormattedJson('');
        }
      } else {
        setFormattedJson('');
      }
    } else {
      setFormattedJson('');
      setIsValid(null);
      setErrors([]);
    }
  };

  const copyToClipboard = async () => {
    if (formattedJson) {
      await navigator.clipboard.writeText(formattedJson);
      toast({
        title: "Copied!",
        description: "Formatted JSON copied to clipboard",
      });
    }
  };

  const clearAll = () => {
    setInputJson('');
    setFormattedJson('');
    setIsValid(null);
    setErrors([]);
  };

  const loadExample = () => {
    const example = `{
  "name": "JSON Formatter",
  "version": "1.0.0",
  "features": ["format", "validate", "error detection"],
  "author": {
    "name": "Developer",
    "email": "dev@example.com"
  },
  "isActive": true,
  "count": 42
}`;
    setInputJson(example);
    handleInputChange(example);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-card to-accent border-b border-border">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">JSON Formatter & Validator</h1>
          <p className="text-muted-foreground">Format, validate, and debug your JSON with real-time error detection</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Input JSON</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadExample}
                >
                  Load Example
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAll}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>

            <Card className="relative">
              <textarea
                value={inputJson}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your JSON here..."
                className="w-full h-64 p-4 font-mono text-sm bg-input border-0 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              
              {/* Status indicator */}
              {isValid !== null && (
                <div className="absolute top-4 right-4">
                  {isValid ? (
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </div>
              )}
            </Card>

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="space-y-3">
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="space-y-2">
                      <div>
                        <strong>Line {error.line}, Column {error.column}:</strong> {error.message}
                      </div>
                      {error.suggestion && (
                        <div className="text-sm opacity-90">
                          <strong>Suggestion:</strong> {error.suggestion}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Formatted JSON</h2>
              {formattedJson && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              )}
            </div>

            <Card>
              <div className="relative">
                <pre className="w-full h-64 p-4 font-mono text-sm bg-input overflow-auto rounded-lg">
                  {formattedJson || (
                    <span className="text-muted-foreground">
                      {inputJson.trim() ? 'Invalid JSON - check errors above' : 'Formatted JSON will appear here...'}
                    </span>
                  )}
                </pre>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
              <h4 className="font-medium mb-1">Real-time Validation</h4>
              <p className="text-sm text-muted-foreground">Instant feedback as you type</p>
            </Card>
            <Card className="p-4">
              <AlertCircle className="w-8 h-8 text-warning mx-auto mb-2" />
              <h4 className="font-medium mb-1">Error Detection</h4>
              <p className="text-sm text-muted-foreground">Precise error location and suggestions</p>
            </Card>
            <Card className="p-4">
              <Copy className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium mb-1">Easy Copy</h4>
              <p className="text-sm text-muted-foreground">One-click copy formatted JSON</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;