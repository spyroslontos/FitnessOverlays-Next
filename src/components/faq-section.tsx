"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How to get Strava overlays?",
    answer: "You can easily get Strava overlays using FitnessOverlays. Simply connect your Strava account, select any activity, and our tool will generate a transparent overlay with your stats that you can download and use on Instagram Stories, TikTok, or any other platform.",
  },
  {
    question: "How do I use my overlay in Instagram Stories (like a Strava stats sticker)?",
    answer: (
      <div className="space-y-2">
        <ol className="list-decimal list-inside space-y-1">
          <li>Connect your Strava account in FitnessOverlays and select the activity you want to share.</li>
          <li>Customize your Strava overlay (stats, colors, layout) and copy or download the transparent PNG.</li>
          <li>Open Instagram and create a new Story with your background photo or video.</li>
          <li>Add your FitnessOverlays image from your camera roll as a sticker and position it like a Strava stats sticker over your background.</li>
        </ol>
        <p className="mt-2">This gives you full control over how your Strava activity appears on Instagram Stories while avoiding the default orange Strava share image.</p>
      </div>
    ),
    textContent: "Connect your Strava account in FitnessOverlays, pick an activity, customize your overlay with your favorite stats and colors, then download the transparent PNG and add it as a sticker on top of your background in Instagram Stories, just like a Strava stats sticker but fully customized."
  },
  {
    question: "How to overlay Strava on Snapchat?",
    answer: "You can use FitnessOverlays to add Strava stats to Snapchat too! Create your custom overlay, download the transparent image, and then add it as a sticker or attachment to your Snap.",
  },
  {
    question: "How to get Strava map overlay on Instagram?",
    answer: "FitnessOverlays lets you add a Strava map overlay to your Instagram Stories. Just connect Strava, choose your activity, design your map overlay (with transparent background), and paste it onto your Instagram Story.",
  },
  {
    question: "Is FitnessOverlays free?",
    answer: "Yes! FitnessOverlays is completely free to use. We believe in making fitness visualization accessible to everyone.",
  },
  {
    question: "What data does FitnessOverlays access?",
    answer: "We ask for read-only access to your Strava activities and some info from your profile to make your experience better. We don't change anything on your account.",
  },
  {
    question: "How do I report a bug in FitnessOverlays?",
    answer: (
      <p>
        If you encounter any issues, you can let me know on the{" "}
        <a 
          href="https://github.com/spyroslontos/FitnessOverlays/issues" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          FitnessOverlays GitHub page
        </a>{" "}
        by clicking "Issues" and briefly describing what went wrong.
        If you're not familiar with GitHub, you can also reach out using the contact details in the footer.
      </p>
    ),
    textContent: "If you encounter any issues, you can let me know on the FitnessOverlays GitHub page by clicking 'Issues' and briefly describing what went wrong. If you're not familiar with GitHub, you can also reach out using the contact details in the footer."
  },
]

export function FAQSection() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.textContent || (typeof faq.answer === 'string' ? faq.answer : "")
      }
    }))
  }

  return (
    <section id="faq" className="space-y-8 scroll-mt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">Frequently Asked Questions</h2>
        <p className="mt-4 text-lg text-muted-foreground">Everything you need to know about FitnessOverlays</p>
      </div>
      <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6 bg-card shadow-sm">
            <AccordionTrigger className="text-xl font-semibold text-left hover:no-underline">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-2">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
