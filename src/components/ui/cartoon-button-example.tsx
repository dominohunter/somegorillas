import { CartoonButton } from "./cartoon-button"
import Image from "next/image"

// Example usage of the CartoonButton component based on somegorillas-landing styles
export function CartoonButtonExample() {
  return (
    <div className="flex flex-col gap-4 p-8 bg-black">
      
      {/* Header Navigation Style Buttons */}
      <div className="flex gap-2">
        <CartoonButton 
          variant="nav" 
          size="md"
          onClick={() => window.open('https://app.somegorillas.com', '_blank')}
        >
          Go to Cave
        </CartoonButton>
        
        <CartoonButton 
          variant="social" 
          size="icon"
          onClick={() => window.open('https://x.com/somegorillas', '_blank')}
        >
          <Image src="/Twitter.svg" alt="Twitter" width={24} height={24} />
        </CartoonButton>
        
        <CartoonButton 
          variant="social" 
          size="icon"
          onClick={() => window.open('https://discord.gg/somegorillas', '_blank')}
        >
          <Image src="/Discord.svg" alt="Discord" width={24} height={24} />
        </CartoonButton>
      </div>

      {/* Hero CTA Button */}
      <CartoonButton 
        variant="cta" 
        size="lg"
        className="w-fit"
        onClick={() => window.open('https://app.somegorillas.com', '_blank')}
      >
        <p className="font-semibold">Go to Cave</p>
        <Image src="/arrow-right.png" alt="Arrow right" width={20} height={20} />
      </CartoonButton>

      {/* Primary Buttons with Cartoon Shadow */}
      <div className="flex gap-4">
        <CartoonButton variant="primary" size="lg" shadow="cartoon">
          Play Now
        </CartoonButton>
        
        <CartoonButton variant="secondary" size="lg" shadow="cartoon" disabled>
          Coming Soon
        </CartoonButton>
      </div>
      
      {/* Custom styling example */}
      <CartoonButton 
        variant="primary"
        size="lg"
        shadow="cartoon"
        className="cartoon-boxshadow"
      >
        Custom Cartoon Button
      </CartoonButton>
    </div>
  )
}