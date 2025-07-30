
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart2, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getShortUrlsAction } from '@/app/actions';
import type { ShortenedUrl } from '@/types';

export default function StatsTable() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
        setIsLoading(true);
        const fetchedUrls = await getShortUrlsAction();
        setUrls(fetchedUrls);
        setIsLoading(false);
    };
    fetchUrls();
  }, []);

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    );
  }

  if (urls.length === 0) {
    return <p className="text-center text-muted-foreground py-8">You haven't shortened any URLs yet. Go ahead and create some!</p>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short URL</TableHead>
            <TableHead className="hidden md:table-cell">Original URL</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead className="hidden sm:table-cell">Expires</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map(url => (
            <TableRow key={url.id}>
              <TableCell>
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {url.shortUrl.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-xs truncate">
                <span title={url.longUrl}>{url.longUrl}</span>
              </TableCell>
              <TableCell>{url.clicks}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {new Date(url.expiresAt).toLocaleString()}
              </TableCell>
              <TableCell>
                {isExpired(url.expiresAt) ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge variant="secondary">Active</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={url.clicks === 0}>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-headline">Analytics for {url.shortcode}</DialogTitle>
                      <DialogDescription>
                        Total Clicks: {url.clicks}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-72">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Source</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {url.clickData.map((click, index) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{click.source}</TableCell>
                            </TableRow>
                          ))}
                           {url.clickData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center">No click data available.</TableCell>
                            </TableRow>
                           )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
