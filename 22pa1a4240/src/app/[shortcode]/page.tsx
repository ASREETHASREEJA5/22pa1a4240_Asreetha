
import { redirect, notFound } from 'next/navigation';
import { findUrlByShortcode, addClick } from '@/services/url-service';
import { headers } from 'next/headers';

export default function ShortcodeRedirectPage({ params }: { params: { shortcode: string } }) {
  const { shortcode } = params;
  const url = findUrlByShortcode(shortcode);

  if (!url) {
    notFound();
  }

  const isExpired = new Date(url.expiresAt) < new Date();
  if (isExpired) {
    // A more robust implementation might use a dedicated error page.
    return (
     <div style={{ fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
       <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', maxWidth: '400px', margin: 'auto', padding: '1.5rem' }}>
         <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626' }}>Link Expired</h1>
         <p style={{ marginTop: '1rem' }}>{`The link for "${shortcode}" has expired.`}</p>
         <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline', marginTop: '1rem', display: 'block' }}>
            Go back to the Shortener
         </a>
       </div>
     </div>
   );
  }
  
  // Track the click before redirecting
  const headersList = headers();
  const referrer = headersList.get('referer');
  let source = 'Direct';
  if (referrer) {
    try {
        const referrerUrl = new URL(referrer);
        if (referrerUrl.hostname.includes('google')) source = 'Google';
        else if (referrerUrl.hostname.includes('facebook')) source = 'Facebook';
        else if (referrerUrl.hostname.includes('twitter')) source = 'Twitter';
        else source = 'Other';
    } catch (e) { /* Invalid URL */ }
  }
  addClick(shortcode, source);

  redirect(url.longUrl);
}
