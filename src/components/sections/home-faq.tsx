import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const FAQ_ITEMS = [
  {
    question: "Why Some Gorillas?",
    answer: "Because, We are.",
  },
  {
    question: "Why Banana?",
    answer: "Because, Gorilla eat banana.",
  },
  {
    question: "Coin flip for what?",
    answer: "I dunno. I guess, for bananas?",
  },
  {
    question: "Whats the road map?",
    answer: "OOH! OOH! AHH! AHH! AHHHHH!!!",
  },
  {
    question: "1 Gorilla vs 100 men?",
    answer: "OOH! OOH! AHH! AHH! AHHHHH!!!",
  },
  {
    question: "Have you ever made conversation with gorillas?",
    answer: "OOH! OOH! AHH! AHH! AHHHHH!!!",
  },
  {
    question: "English or Spanish?",
    answer: "OOH! OOH! AHH! AHH! AHHHHH!!!",
  },
];

export default function HomeFaq() {
  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-8 mb-[20px]">
      <div className="backdrop-blur-[48px] rounded-[24px] p-6 bg-translucent-dark-12 border-2 border-translucent-light-8 max-w-[640px] w-full">
        <Accordion type="multiple" className="flex flex-col gap-y-5">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-none"
            >
              <div className="flex flex-col outline-2 outline-translucent-light-8 rounded-2xl">
                <AccordionTrigger className="py-4 px-6 rounded-2xl outline-2 outline-translucent-light-8 bg-translucent-light-8 hover:no-underline [&>svg]:hidden">
                  <p className="text-light-primary text-h5 font-semibold text-start">
                    {item.question}
                  </p>
                </AccordionTrigger>
                <AccordionContent className="py-4 px-6">
                  <p className="text-light-primary text-body-1 font-pally">
                    {item.answer}
                  </p>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
