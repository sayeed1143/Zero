import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Voice-first chat responses powered by Gemini 2.5 Flash Lite",
      "Daily visual mind maps and concept canvas (3 per day)",
      "Smart quiz generator with targeted practice",
      "Multilingual answers in 50+ languages",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$10",
    period: "/month",
    description: "For serious professionals",
    features: [
      "Unlimited voice + visual tutoring sessions",
      "Unlimited adaptive quizzes and targeted drills",
      "Advanced exports (PDF, PNG, LMS packages)",
      "Progress analytics and learning streaks",
      "Priority support with dedicated researcher",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$25",
    period: "/month",
    description: "For growing teams",
    features: [
      "Everything in Pro",
      "Shared canvas spaces with roles",
      "Centralized progress analytics dashboards",
      "Custom model routing per subject",
      "SSO authentication and admin console",
      "Dedicated customer success engineer",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-20 px-6" id="pricing">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Choose Your Voice-First AI Tutor Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            All plans include voice answers, visual mind maps, adaptive quizzes, exports, and OpenRouter-backed translation in 50+ languages.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${
                plan.highlighted 
                  ? "border-2 border-primary shadow-xl scale-105" 
                  : "border-2"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader className="space-y-4 pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full rounded-full" 
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
