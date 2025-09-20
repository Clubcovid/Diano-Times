'use client';

import {useState, useTransition} from 'react';
import {BlogHeader} from '@/components/blog-header';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {generateVideoStory, type GenerateVideoStoryOutput} from '@/ai/flows/generate-video-story';
import {textToSpeech, type TextToSpeechOutput} from '@/ai/flows/text-to-speech';
import {Loader2, Wand2} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function StoryTimePage() {
  const [story, setStory] = useState('');
  const [character, setCharacter] = useState('');
  const [videoResult, setVideoResult] = useState<GenerateVideoStoryOutput | null>(null);
  const [audioResult, setAudioResult] = useState<TextToSpeechOutput | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const {toast} = useToast();

  const handleGenerate = () => {
    if (!story || !character) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a story and a character description.',
        variant: 'destructive',
      });
      return;
    }

    setVideoResult(null);
    setAudioResult(null);

    startGenerating(async () => {
      try {
        // Run both promises in parallel
        const [videoPromise, audioPromise] = await Promise.allSettled([
          generateVideoStory({ story, characterDescription: character }),
          textToSpeech({ text: story }),
        ]);

        if (videoPromise.status === 'fulfilled') {
          setVideoResult(videoPromise.value);
        } else {
          toast({
            title: 'Video Generation Failed',
            description: videoPromise.reason.message || 'An unknown error occurred.',
            variant: 'destructive',
          });
        }
        
        if (audioPromise.status === 'fulfilled') {
            setAudioResult(audioPromise.value);
        } else {
             toast({
                title: 'Audio Generation Failed',
                description: audioPromise.reason.message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        }

      } catch (error: any) {
        console.error(error);
        toast({
          title: 'An Unexpected Error Occurred',
          description: error.message || 'Please try again later.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <BlogHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            AI Story Time
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Bring your stories to life with AI-generated video and audio.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Story</CardTitle>
              <CardDescription>
                Describe your character and write a short story. The AI will generate a video and narration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="character">Character Description</Label>
                <Input
                  id="character"
                  value={character}
                  onChange={e => setCharacter(e.target.value)}
                  placeholder="e.g., 'An old, wise wizard with a long white beard and a twinkling blue robe.'"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="story">Your Short Story</Label>
                <Textarea
                  id="story"
                  value={story}
                  onChange={e => setStory(e.target.value)}
                  placeholder="e.g., 'The wizard stood on a cliff, overlooking a stormy sea as he prepared to cast a powerful spell.'"
                  rows={6}
                />
              </div>
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Story
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Generated Result</CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating && (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Generating video and audio...</p>
                        <p className="text-xs text-muted-foreground">(This can take up to a minute)</p>
                    </div>
                </div>
              )}
              {!isGenerating && videoResult && (
                <div className="space-y-4">
                    <video
                        src={videoResult.video}
                        controls
                        className="w-full rounded-lg aspect-video"
                    >
                        Your browser does not support the video tag.
                    </video>
                    {audioResult && (
                         <audio
                            src={audioResult.audio}
                            controls
                            className="w-full"
                        >
                            Your browser does not support the audio element.
                        </audio>
                    )}
                </div>
              )}
               {!isGenerating && !videoResult && (
                 <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Your generated video will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
