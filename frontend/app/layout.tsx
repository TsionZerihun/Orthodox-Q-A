import type {Metadata} from 'next';
import {Playfair_Display,Source_Sans_3} from 'next/font/google';
import {Providers} from './providers';
import './globals.css';

const playfair=Playfair_Display({
  subsets:['latin'],
  weight:['400','500','600','700'],
  variable:'--font-playfair',
  display:'swap',
});

const sourceSans=Source_Sans_3({
  subsets:['latin'],
  weight:['300','400','500','600'],
  variable:'--font-source-sans',
  display:'swap',
});

export const metadata:Metadata={
  title:'Orthodox Q&A',
  description:'Ask. Learn. Grow.',
};

export default function Layout({children}:{children:React.ReactNode}){
  return (
    <html lang="en" suppressHydrationWarning className={`${playfair.variable} ${sourceSans.variable}`}>
      <body>
        {/* Fixed viewport decoration — does not scroll with page content */}
        <div className="cross-watermark" aria-hidden="true"/>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
