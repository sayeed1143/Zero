import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Shunya AI?",
    answer:
      "Shunya AI is a mindful intelligence workspace designed to unify voice, vision, and knowledge synthesis. It helps you transform your ideas and study materials into lucid mind maps, narrated guidance, and adaptive practice tests.",
  },
  {
    question: "What kind of models power Shunya AI?",
    answer:
      "Shunya AI leverages a suite of best-in-class models from OpenRouter, including Google's Gemini series and xAI's Grok for reasoning, ElevenLabs for voice, and Whisper for transcription. You can customize which model powers each feature.",
  },
  {
    question: "What file types can I use?",
    answer:
      "You can upload PDFs, images (PNG, JPG), and even provide YouTube links. Shunya AI extracts the relevant information and integrates it into your workspace for analysis and learning.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes, we offer a Free plan that is perfect for getting started. It includes voice-first chat, a limited number of daily mind maps, and access to the smart quiz generator.",
  },
  {
    question: "How does the voice-first tutoring work?",
    answer:
      "You can simply speak your questions, and Shunya AI's speech-to-text capabilities will transcribe them. The AI then processes your query and can respond with both a written explanation and a natural-sounding voice playback.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 px-6 bg-muted/30" id="faq">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
