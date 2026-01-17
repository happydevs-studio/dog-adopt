import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';

// Pattern matching helpers

export function isGreeting(message: string): boolean {
  return !!message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)[\s!?]*$/);
}

export function isHelpRequest(message: string): boolean {
  return message.includes('help') || message.includes('what can you') || message.includes('how do');
}

export function isThankYou(message: string): boolean {
  return !!message.match(/^(thanks|thank you|ty|cheers)[\s!.]*$/);
}

export function isResetRequest(message: string): boolean {
  return message.includes('reset') || message.includes('start over') || message.includes('clear');
}

export function isStatsRequest(message: string): boolean {
  return message.includes('how many') || message.includes('stats') || message.includes('summary');
}

export function isRescueInfoRequest(message: string): boolean {
  return (message.includes('rescue') || message.includes('shelter') || message.includes('organisation')) && 
         !message.includes('dog') && !message.includes('show');
}

export function isShowMoreRequest(message: string): boolean {
  return message.includes('more') || message.includes('another') || message.includes('other');
}

// Response builders

export function buildGreetingResponse(dogCount: number, rescueCount: number): string {
  return `Hello! 👋 I'm here to help you find your perfect dog match from ${dogCount} available dogs across ${rescueCount} rescues in the UK.\n\nWhat kind of dog are you looking for?`;
}

export function buildHelpResponse(): string {
  return `I can help you find the perfect dog! Here are some things you can ask me:\n\n• "What dogs are available?"\n• "Show me small dogs good with children"\n• "Are there any puppies in Wales?"\n• "Tell me about [dog name]"\n• "Which dogs are good with cats?"\n• "Show me dogs at [rescue name]"\n\nYou can combine criteria like size, age, temperament, and location!`;
}

export function buildThankYouResponse(): string {
  return `You're welcome! 🐾 Feel free to ask me anything else about available dogs or rescues. Good luck finding your perfect companion!`;
}

export function buildResetResponse(): string {
  return `Okay, I've cleared your preferences! 🔄 Let's start fresh. What kind of dog are you looking for?`;
}

export function buildStatsResponse(dogs: Dog[], rescues: Rescue[]): string {
  const kidFriendly = dogs.filter(d => d.goodWithKids).length;
  const dogFriendly = dogs.filter(d => d.goodWithDogs).length;
  const catFriendly = dogs.filter(d => d.goodWithCats).length;
  const small = dogs.filter(d => d.size === 'Small').length;
  const medium = dogs.filter(d => d.size === 'Medium').length;
  const large = dogs.filter(d => d.size === 'Large').length;
  
  return `📊 **Current Statistics:**\n\n` +
    `**Total Dogs:** ${dogs.length}\n` +
    `**Rescues:** ${rescues.length}\n\n` +
    `**By Size:**\n• Small: ${small}\n• Medium: ${medium}\n• Large: ${large}\n\n` +
    `**Temperament:**\n• Good with kids: ${kidFriendly}\n• Good with dogs: ${dogFriendly}\n• Good with cats: ${catFriendly}\n\n` +
    `What would you like to explore?`;
}

export function buildRescueListResponse(rescues: Rescue[]): string {
  const rescueList = rescues.slice(0, 8).map(rescue => 
    `• **${rescue.name}** (${rescue.type}) - ${rescue.region}${rescue.website ? `\n  🌐 ${rescue.website}` : ''}`
  ).join('\n\n');
  
  const more = rescues.length > 8 ? `\n\n_...and ${rescues.length - 8} more rescues!_` : '';
  return `We work with ${rescues.length} amazing rescue organizations across the UK:\n\n${rescueList}${more}\n\nVisit our Rescues page to see them all!`;
}

export function buildLocationListResponse(uniqueRegions: string[]): string {
  return `We work with rescues across the UK in these regions:\n\n${uniqueRegions.slice(0, 12).join(', ')}\n\nWould you like to see dogs from a specific area?`;
}

// Dog information formatting

export function formatDogDetails(dog: Dog): string {
  let info = `🐕 **${dog.name}**\n\n`;
  info += `**Breed:** ${dog.breed}\n`;
  info += `**Age:** ${dog.computedAge || dog.age}\n`;
  info += `**Size:** ${dog.size}\n`;
  info += `**Gender:** ${dog.gender}\n`;
  info += `**Location:** ${dog.rescue}, ${dog.location}\n\n`;
  info += `**About ${dog.name}:**\n${dog.description}\n\n`;
  
  const traits = [];
  if (dog.goodWithKids) traits.push('✓ Good with kids');
  if (dog.goodWithDogs) traits.push('✓ Good with dogs');
  if (dog.goodWithCats) traits.push('✓ Good with cats');
  
  if (traits.length > 0) {
    info += `**Temperament:**\n${traits.join('\n')}\n\n`;
  }
  
  if (dog.rescueWebsite) {
    info += `For more info, visit: ${dog.rescueWebsite}`;
  }
  
  return info;
}
