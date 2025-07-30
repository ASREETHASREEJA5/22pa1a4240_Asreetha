
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-md py-8 px-4">
        <Card>
            <CardHeader>
                <CardTitle>Not Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p>The short link you are looking for does not exist or may have been deleted.</p>
                <Link href="/" className="text-primary hover:underline mt-4 block">
                    Go back to the Shortener
                </Link>
            </CardContent>
        </Card>
    </div>
  )
}
