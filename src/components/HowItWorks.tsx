import step1Image from "@/assets/step1-upload.png";
import step2Image from "@/assets/step2-organize.png";
import step3Image from "@/assets/step3-collaborate.png";

const steps = [
  {
    number: "1",
    title: "Talk or drop in your study materials",
    description:
      "Start with your voice, PDFs, images, or YouTube links. Whisper and Gemini handle transcription, translation, and content extraction instantly.",
    image: step1Image,
  },
  {
    number: "2",
    title: "Watch EduVoice build visual explanations",
    description:
      "Claude 3 Opus and Gemini 1.5 Pro weave mind maps, diagrams, and concept links so you can grasp any topic at a glance.",
    image: step2Image,
  },
  {
    number: "3",
    title: "Listen, practice, and export",
    description:
      "Hear natural voice answers, generate adaptive quizzes with GPT-4 Turbo or Mixtral, and export every insight to your favourite tools.",
    image: step3Image,
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How EduVoice AI Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three steps from spoken question to personalized mastery plan.
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-3xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full rounded-2xl shadow-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
