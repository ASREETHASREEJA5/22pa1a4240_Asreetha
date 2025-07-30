
export interface ClickData {
  timestamp: string;
  source: string;
}

export interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortUrl: string;
  shortcode: string;
  createdAt: string;
  expiresAt: string;
  clicks: number;
  clickData: ClickData[];
}
