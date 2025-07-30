
'use client';

import { useFormContext, type UseFieldArrayReturn } from 'react-hook-form';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Sparkles, Trash2, Loader2 } from 'lucide-react';
import { suggestShortcodeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { z } from 'zod';
import type { ShortenerFormSchema } from './ShortenerForm';

type ShortenerFormValues = z.infer<typeof ShortenerFormSchema>;

interface UrlInputRowProps {
  index: number;
  remove: UseFieldArrayReturn<ShortenerFormValues, 'urls'>['remove'];
}

export default function UrlInputRow({ index, remove }: UrlInputRowProps) {
  const { control, getValues, setValue, trigger } = useFormContext<ShortenerFormValues>();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    const isValid = await trigger(`urls.${index}.longUrl`);
    if (!isValid) return;

    setIsSuggesting(true);
    const longUrl = getValues(`urls.${index}.longUrl`);
    const result = await suggestShortcodeAction({ url: longUrl });

    if ('shortcode' in result && result.shortcode) {
      setValue(`urls.${index}.shortcode`, result.shortcode, { shouldValidate: true });
    } else if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'AI Suggestion Failed',
        description: result.error,
      });
    }
    setIsSuggesting(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg relative bg-card">
      <div className="md:col-span-12">
        <FormField
          control={control}
          name={`urls.${index}.longUrl`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/a-very-long-url-to-shorten" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="md:col-span-4">
        <FormField
          control={control}
          name={`urls.${index}.shortcode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Shortcode (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="my-custom-link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="md:col-span-4">
        <FormField
          control={control}
          name={`urls.${index}.validity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Validity in Minutes (Optional)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="md:col-span-4 flex items-end gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleSuggest}
          disabled={isSuggesting}
          aria-label="Suggest shortcode with AI"
        >
          {isSuggesting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          Suggest with AI
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => remove(index)}
          aria-label="Remove URL row"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
