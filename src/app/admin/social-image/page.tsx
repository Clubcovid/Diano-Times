
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Download, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSocialImage } from '@/ai/flows/generate-social-image';

export default function SocialImageGeneratorPage() {
  const { toast } = useToast();
  const [isGenerating, startGenerating] = useTransition();
  const [imageUrl, setImageUrl] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!imageUrl) {
      toast({ title: 'Error', description: 'Please provide an image URL.', variant: 'destructive' });
      return;
    }

    startGenerating(async () => {
      setGeneratedImage(null);
      try {
        const result = await generateSocialImage({ imageUrl });
        setGeneratedImage(result.brandedImageUrl);
        toast({ title: 'Success', description: 'Branded image generated.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to generate image.', variant: 'destructive' });
      }
    });
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'talkofnations-social-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Social Image Generator</h1>
        <p className="text-muted-foreground">Create branded images for your social media posts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Branded Image</CardTitle>
          <CardDescription>
            Enter the URL of an image, and the AI will add the Talk of Nations logo, name, and social icons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/your-image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>
        </CardContent>
      </Card>
      
      {(isGenerating || generatedImage) && (
        <Card>
            <CardHeader>
                <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                 {isGenerating && (
                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-muted rounded-lg">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Generating your branded image...</p>
                        <p className="text-sm text-muted-foreground">(This can take up to a minute)</p>
                    </div>
                )}
                {generatedImage && !isGenerating && (
                    <div className="relative w-full aspect-video">
                        <Image src={generatedImage} alt="Generated social media image" layout="fill" objectFit="contain" />
                    </div>
                )}
            </CardContent>
            {generatedImage && !isGenerating && (
                <CardFooter>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                    </Button>
                </CardFooter>
            )}
        </Card>
      )}
    </div>
  );
}
