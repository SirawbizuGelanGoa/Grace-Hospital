'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function UtilitiesPage() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<any>(null);
  const { toast } = useToast();

  const handleImageCleanup = async () => {
    setIsCleaningUp(true);
    setCleanupResults(null);

    try {
      const response = await fetch('/api/cleanup-images', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        setCleanupResults(result);
        toast({
          title: "Cleanup Completed",
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Cleanup failed');
      }
    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || 'Failed to cleanup missing images',
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Utilities</h1>
        <p className="text-muted-foreground">
          Maintenance tools for managing your website data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Image Cleanup
          </CardTitle>
          <CardDescription>
            Remove database references to deleted images from the uploads folder.
            This helps fix issues where images show as "not available" after being deleted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              This will remove database references to images that no longer exist in the uploads folder.
              It will not delete any actual files.
            </p>
          </div>

          <Button 
            onClick={handleImageCleanup} 
            disabled={isCleaningUp}
            className="w-full sm:w-auto"
          >
            {isCleaningUp ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Cleaning up...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clean Up Missing Images
              </>
            )}
          </Button>

          {cleanupResults && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-semibold text-green-800 mb-2">Cleanup Results</h3>
              <p className="text-green-700 mb-2">{cleanupResults.message}</p>
              
              {cleanupResults.details && cleanupResults.details.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-green-800 mb-1">Details:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {cleanupResults.details.map((detail: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold mb-2">When to use Image Cleanup:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• After manually deleting files from the public/uploads folder</li>
              <li>• When images show as "Image Not Available" on the website</li>
              <li>• After moving or reorganizing uploaded files</li>
              <li>• As part of regular maintenance</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">What it does:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Checks all database tables for image references</li>
              <li>• Verifies if the referenced files actually exist</li>
              <li>• Removes references to missing files</li>
              <li>• Clears the cache to show updated content</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
