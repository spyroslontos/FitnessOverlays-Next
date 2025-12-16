"use client"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import Link from "next/link"

const faqs = [
  {
    question: "How do I create a Strava activity overlay?",
    answer: "Connect your Strava account to FitnessOverlays, select any running or cycling activity, and customize your overlay with different fonts, colors, and layouts. Download the final graphic as a transparent PNG for Instagram or other social media.",
  },
  {
    question: "Is FitnessOverlays free to use?",
    answer: "Yes! FitnessOverlays is completely free. We believe in making fitness visualization accessible to everyone.",
  },
  {
    question: "What Strava activities can I create overlays for?",
    answer: "You can create overlays for all your Strava activities including runs, rides, hikes, and more. The tool pulls your activity data like distance, pace, time, and elevation directly from Strava.",
  },
  {
    question: "Can I customize the fonts and colors?",
    answer: "Yes! You can customize fonts, colors, and layouts to match your personal style or brand. We're constantly adding new customization options.",
  },
  {
    question: "What permissions does FitnessOverlays need from Strava?",
    answer: "We only ask for read-only access to view your Strava activities and profile information. We never modify or post anything to your Strava account.",
  },
  {
    question: "How do I disconnect my Strava account?",
    answer: (
      <div className="space-y-2">
        <p>To revoke FitnessOverlays access:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to Strava Settings</li>
          <li>Navigate to "My Apps"</li>
          <li>Find FitnessOverlays and click "Revoke Access"</li>
        </ol>
      </div>
    ),
  },
  {
    question: "How do I report a bug or request a feature?",
    answer: (
      <p>
        Report issues or suggest features on our{" "}
        <Link 
          href="https://github.com/spyroslontos/FitnessOverlays-Next" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          GitHub repository
        </Link>
        . We appreciate your feedback!
      </p>
    ),
  },
]

export function FAQSection() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">FAQ</h2>
      <Accordion type="single" collapsible className="w-full">
  {faqs.map((faq, index) => (
    <AccordionItem key={index} value={`faq-${index}`}>
      <AccordionTrigger>{faq.question}</AccordionTrigger>
      <AccordionContent>
        {typeof faq.answer === "string" ? <p>{faq.answer}</p> : faq.answer}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
    </div>
  )
}

