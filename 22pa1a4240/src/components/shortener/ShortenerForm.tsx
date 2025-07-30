
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import type { ShortenedUrl } from '@/types';
import UrlInputRow from './UrlInputRow';
import { PlusCircle, ArrowRight, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createShortUrlsAction, generateUniqueShortcodeAction, isShortcodeTakenAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export const ShortenerFormSchema = z.object({
  urls: z
    .array(
      z.object({
        longUrl: z.string().url({ message: 'Please enter a valid URL.' }),
        validity: z.coerce.number().int().positive().optional(),
        shortcode: z
          .string()
          .regex(/^[a-zA-Z0-9-]*$/, {
            message: 'Shortcode can only contain letters, numbers, and dashes.',
          })
          .min(3)
          .optional()
          .or(z.literal('')),
      })
    )
    .min(1, 'Please add at least one URL to shorten.')
    .max(5, 'You can shorten a maximum of 5 URLs at a time.'),
});

export default function ShortenerForm() {
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof ShortenerFormSchema>>({
    resolver: zodResolver(ShortenerFormSchema),
    defaultValues: {
      urls: [{ longUrl: '', validity: 30, shortcode: '' }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'urls',
  });
  
  const onSubmit = async (data: z.infer<typeof ShortenerFormSchema>) => {
    const urlsToCreate = [];
    for (const url of data.urls) {
        let shortcode = url.shortcode;
        if (shortcode) {
            if (await isShortcodeTakenAction(shortcode)) {
                toast({
                    variant: 'destructive',
                    title: 'Shortcode already exists',
                    description: `The shortcode "${shortcode}" is already in use. Please choose another one.`,
                });
                return; // Stop submission
            }
        } else {
            shortcode = await generateUniqueShortcodeAction();
        }

        const now = new Date();
        const validityMinutes = url.validity || 30;
        const expiresAt = new Date(now.getTime() + validityMinutes * 60000);

        urlsToCreate.push({
            longUrl: url.longUrl,
            shortcode,
            expiresAt: expiresAt.toISOString(),
        });
    }

    const result = await createShortUrlsAction(urlsToCreate, window.location.origin);

    if (result.error) {
        toast({
            variant: 'destructive',
            title: 'Error creating links',
            description: result.error,
        });
    } else {
        setResults(result.urls);
        form.reset({ urls: [{ longUrl: '', validity: 30, shortcode: '' }] });
        // Manually trigger a re-render of the stats page data
        router.refresh();
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Shorten URLs</CardTitle>
          <CardDescription>
            Enter up to 5 URLs to create short links. Use our AI to suggest a shortcode or create your own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <UrlInputRow key={field.id} index={index} remove={remove} />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ longUrl: '', validity: 30, shortcode: '' })}
                disabled={fields.length >= 5}
              >
                <PlusCircle className="mr-2" />
                Add another URL
              </Button>
              <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Generating...' : 'Generate Short Links'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {results.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Short Links</CardTitle>
            <CardDescription>Here are the short links you just created. They are now available on the Statistics page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="p-4 border rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-muted-foreground truncate" title={result.longUrl}>{result.longUrl}</p>
                    <div className="flex items-center gap-2">
                        <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline text-lg">
                            {result.shortUrl.replace('https://','').replace('http://','')}
                        </a>
                        <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(result.shortUrl)}>
                            {copied === result.shortUrl ? <Check className="text-green-500"/> : <Copy />}
                        </Button>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    Expires: {new Date(result.expiresAt).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}
