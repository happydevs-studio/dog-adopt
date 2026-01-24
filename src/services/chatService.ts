import type { Dog } from '@/types/dog';
import type { Rescue } from '@/hooks/useRescues';
import {
  isGreeting,
  isHelpRequest,
  isThankYou,
  isResetRequest,
  isStatsRequest,
  isRescueInfoRequest,
  isShowMoreRequest,
  buildGreetingResponse,
  buildHelpResponse,
  buildThankYouResponse,
  buildResetResponse,
  buildStatsResponse,
  buildRescueListResponse,
  buildLocationListResponse,
  formatDogDetails,
} from './chatService.helpers';

export interface ChatResponse {
  content: string;
  suggestedQuestions?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedQuestions?: string[];
  dogs?: Dog[]; // Dogs included in this message for display
}

interface ChatContext {
  dogs: Dog[];
  rescues: Rescue[];
}

interface ConversationState {
  preferredSize?: 'Small' | 'Medium' | 'Large';
  preferredAge?: string;
  needsKidFriendly?: boolean;
  needsDogFriendly?: boolean;
  needsCatFriendly?: boolean;
  preferredLocation?: string;
  lastQuery?: string;
}

// Conversation state management
let conversationState: ConversationState = {};

/**
 * Reset conversation state
 */
export function resetConversationState() {
  conversationState = {};
}

/**
 * Extract size preferences from message
 */
function extractSizePreference(lowerMessage: string) {
  if (lowerMessage.includes('small')) conversationState.preferredSize = 'Small';
  else if (lowerMessage.includes('medium')) conversationState.preferredSize = 'Medium';
  else if (lowerMessage.includes('large') || lowerMessage.includes('big')) conversationState.preferredSize = 'Large';
}

/**
 * Extract age preferences from message
 */
function extractAgePreference(lowerMessage: string) {
  if (lowerMessage.includes('puppy') || lowerMessage.includes('puppies')) conversationState.preferredAge = 'Puppy';
  else if (lowerMessage.includes('young')) conversationState.preferredAge = 'Young';
  else if (lowerMessage.includes('adult')) conversationState.preferredAge = 'Adult';
  else if (lowerMessage.includes('senior') || lowerMessage.includes('older')) conversationState.preferredAge = 'Senior';
}

/**
 * Extract trait preferences from message
 */
function extractTraitPreferences(lowerMessage: string) {
  if (lowerMessage.includes('good with') || lowerMessage.includes('friendly')) {
    if (lowerMessage.includes('kid') || lowerMessage.includes('child')) conversationState.needsKidFriendly = true;
    if (lowerMessage.includes('dog')) conversationState.needsDogFriendly = true;
    if (lowerMessage.includes('cat')) conversationState.needsCatFriendly = true;
  }
}

/**
 * Extract location preferences from message
 */
function extractLocationPreference(lowerMessage: string) {
  const locations = ['wales', 'scotland', 'england', 'northern ireland', 'london', 'birmingham', 'manchester', 'glasgow'];
  for (const loc of locations) {
    if (lowerMessage.includes(loc)) {
      conversationState.preferredLocation = loc;
      break;
    }
  }
}

/**
 * Extract preferences from user message and update conversation state
 */
function updateConversationState(message: string) {
  const lowerMessage = message.toLowerCase();
  
  extractSizePreference(lowerMessage);
  extractAgePreference(lowerMessage);
  extractTraitPreferences(lowerMessage);
  extractLocationPreference(lowerMessage);
  
  conversationState.lastQuery = message;
}

/**
 * Apply conversation state filters to dogs
 */
function applyConversationFilters(dogs: Dog[]): Dog[] {
  let filtered = dogs;
  
  if (conversationState.preferredSize) {
    filtered = filtered.filter(d => d.size === conversationState.preferredSize);
  }
  
  if (conversationState.preferredAge) {
    filtered = filtered.filter(d => (d.computedAge || d.age) === conversationState.preferredAge);
  }
  
  if (conversationState.needsKidFriendly) {
    filtered = filtered.filter(d => d.goodWithKids);
  }
  
  if (conversationState.needsDogFriendly) {
    filtered = filtered.filter(d => d.goodWithDogs);
  }
  
  if (conversationState.needsCatFriendly) {
    filtered = filtered.filter(d => d.goodWithCats);
  }
  
  if (conversationState.preferredLocation) {
    filtered = filtered.filter(d => 
      d.location.toLowerCase().includes(conversationState.preferredLocation!) ||
      d.rescue.toLowerCase().includes(conversationState.preferredLocation!)
    );
  }
  
  return filtered;
}

/**
 * Build a context string from available dogs and rescues data
 */
function buildContext(context: ChatContext): string {
  const { dogs, rescues } = context;
  
  // Filter to only available dogs for the context
  const availableDogs = dogs.filter(d => d.status === 'available');
  
  let contextStr = 'Available Dogs:\n';
  availableDogs.forEach(dog => {
    contextStr += `- ${dog.name}: ${dog.breed}, ${dog.computedAge || dog.age}, ${dog.size}, ${dog.gender}`;
    contextStr += `, Located at ${dog.rescue} in ${dog.location}`;
    if (dog.goodWithKids) contextStr += ', Good with kids';
    if (dog.goodWithDogs) contextStr += ', Good with dogs';
    if (dog.goodWithCats) contextStr += ', Good with cats';
    contextStr += `\n  Description: ${dog.description}\n`;
  });
  
  contextStr += '\nRescue Organizations:\n';
  rescues.forEach(rescue => {
    contextStr += `- ${rescue.name} (${rescue.type}) in ${rescue.region}`;
    if (rescue.website) contextStr += ` - ${rescue.website}`;
    contextStr += '\n';
  });
  
  return contextStr;
}

/**
 * Generate a response using OpenAI API
 */
async function generateOpenAIResponse(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const contextStr = buildContext(context);
  
  const systemPrompt = `You are a helpful assistant for a dog adoption website. 
You have access to information about available dogs and rescue organizations in the UK.
Use the following data to answer questions accurately and helpfully.
Be friendly, encouraging, and help users find their perfect dog match.
IMPORTANT: Only count and mention dogs that are currently 'available' for adoption, not reserved, fostered, or on hold.

${contextStr}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

/**
 * Format a list of dogs for display
 */
function formatDogList(dogs: Dog[], limit: number = 5, showDetails: boolean = false): string {
  if (dogs.length === 0) {
    return "I'm sorry, I couldn't find any dogs matching those criteria.";
  }
  
  const dogsToShow = dogs.slice(0, limit);
  const dogList = dogsToShow.map(dog => {
    let info = `• **${dog.name}**: ${dog.breed}, ${dog.computedAge || dog.age}, ${dog.size.toLowerCase()} ${dog.gender.toLowerCase()}`;
    info += `\n  📍 ${dog.rescue} in ${dog.location}`;
    
    if (showDetails) {
      const traits = [];
      if (dog.goodWithKids) traits.push('👶 Good with kids');
      if (dog.goodWithDogs) traits.push('🐕 Good with dogs');
      if (dog.goodWithCats) traits.push('🐈 Good with cats');
      if (traits.length > 0) {
        info += `\n  ${traits.join(', ')}`;
      }
    }
    
    return info;
  }).join('\n\n');
  
  let response = dogList;
  const remaining = dogs.length - limit;
  if (remaining > 0) {
    response += `\n\n_...and ${remaining} more ${remaining === 1 ? 'dog' : 'dogs'} available!_`;
  }
  
  return response;
}

/**
 * Generate contextual follow-up suggestions
 */
function generateSuggestions(dogs: Dog[], context: ChatContext): string[] {
  const suggestions: string[] = [];
  
  // If we have results, suggest refinements
  if (dogs.length > 5) {
    if (!conversationState.preferredSize) {
      suggestions.push('Show me only small dogs', 'Show me only large dogs');
    }
    if (!conversationState.needsKidFriendly && dogs.some(d => d.goodWithKids)) {
      suggestions.push('Which are good with children?');
    }
    if (!conversationState.preferredAge) {
      suggestions.push('Show me puppies', 'Show me senior dogs');
    }
  } else if (dogs.length > 0 && dogs.length <= 3) {
    // If few results, suggest similar or broadening search
    suggestions.push('Tell me more about these dogs', 'Show me all available dogs');
  } else if (dogs.length === 0) {
    // If no results, suggest alternatives
    suggestions.push('What dogs are available?', 'Show me all rescues');
  }
  
  return suggestions.slice(0, 3);
}

/**
 * Handle basic conversational patterns
 */
function handleBasicPatterns(
  message: string,
  context: ChatContext
): ChatResponse | string | null {
  const { dogs, rescues } = context;
  
  // Filter to only available dogs
  const availableDogs = dogs.filter(d => d.status === 'available');
  
  if (isGreeting(message)) {
    return {
      content: buildGreetingResponse(availableDogs.length, rescues.length),
      suggestedQuestions: ['What dogs are available?', 'Show me small dogs', 'Tell me about puppies']
    };
  }
  
  if (isHelpRequest(message)) {
    return buildHelpResponse();
  }
  
  if (isThankYou(message)) {
    return buildThankYouResponse();
  }
  
  if (isResetRequest(message)) {
    resetConversationState();
    return buildResetResponse();
  }
  
  if (isStatsRequest(message)) {
    return buildStatsResponse(availableDogs, rescues);
  }
  
  return null;
}

/**
 * Handle compound dog queries (multiple criteria)
 */
function handleCompoundDogQuery(
  message: string,
  dogs: Dog[]
): string | null {
  const hasSizeFilter = message.includes('small') || message.includes('medium') || message.includes('large');
  const hasTraitFilter = (message.includes('good with') || message.includes('friendly')) && 
                         (message.includes('kid') || message.includes('child') || message.includes('dog') || message.includes('cat'));
  
  if (!hasSizeFilter || !hasTraitFilter) return null;
  
  const filtered = applyConversationFilters(dogs);
  
  if (filtered.length === 0) {
    const fallback = dogs.filter(d => d.size === conversationState.preferredSize);
    return `I couldn't find any dogs matching all those criteria. Let me show you some dogs that match some of your preferences:\n\n${formatDogList(fallback, 5, true)}`;
  }
  
  const criteria = buildCriteriaList();
  return `Great! I found ${filtered.length} ${criteria.join(', ')} ${filtered.length === 1 ? 'dog' : 'dogs'}:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Build list of criteria from conversation state
 */
function buildCriteriaList(): string[] {
  const criteria = [];
  if (conversationState.preferredSize) criteria.push(conversationState.preferredSize.toLowerCase());
  if (conversationState.needsKidFriendly) criteria.push('good with children');
  if (conversationState.needsDogFriendly) criteria.push('good with dogs');
  if (conversationState.needsCatFriendly) criteria.push('good with cats');
  return criteria;
}

/**
 * Handle kid-friendly queries
 */
function handleKidFriendlyQuery(dogs: Dog[]): string {
  conversationState.needsKidFriendly = true;
  const filtered = applyConversationFilters(dogs);
  
  if (filtered.length === 0) {
    return "I don't have information about dogs that are specifically noted as good with children at the moment. Try browsing all available dogs or ask about other criteria!";
  }
  
  return `Here are ${filtered.length} ${filtered.length === 1 ? 'dog' : 'dogs'} that ${filtered.length === 1 ? 'is' : 'are'} good with children:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Handle dog-friendly queries
 */
function handleDogFriendlyQuery(dogs: Dog[]): string {
  conversationState.needsDogFriendly = true;
  const filtered = applyConversationFilters(dogs);
  
  if (filtered.length === 0) {
    return "I don't have information about dogs that are specifically noted as good with other dogs at the moment.";
  }
  
  return `Here are ${filtered.length} ${filtered.length === 1 ? 'dog' : 'dogs'} that ${filtered.length === 1 ? 'is' : 'are'} good with other dogs:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Handle cat-friendly queries
 */
function handleCatFriendlyQuery(dogs: Dog[]): string {
  conversationState.needsCatFriendly = true;
  const filtered = applyConversationFilters(dogs);
  
  if (filtered.length === 0) {
    return "I don't have information about dogs that are specifically noted as good with cats at the moment.";
  }
  
  return `Here are ${filtered.length} ${filtered.length === 1 ? 'dog' : 'dogs'} that ${filtered.length === 1 ? 'is' : 'are'} good with cats:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Handle dog trait queries (good with kids/dogs/cats)
 */
function handleTraitQuery(message: string, dogs: Dog[]): string | null {
  const isGoodWithPattern = (message.includes('good with') || message.includes('friendly'));
  if (!isGoodWithPattern) return null;
  
  if (message.includes('kid') || message.includes('child')) {
    return handleKidFriendlyQuery(dogs);
  }
  
  if (message.includes('other dog')) {
    return handleDogFriendlyQuery(dogs);
  }
  
  if (message.includes('cat')) {
    return handleCatFriendlyQuery(dogs);
  }
  
  return null;
}

/**
 * Extract size from message
 */
function extractSize(message: string): 'Small' | 'Medium' | 'Large' | null {
  if (message.includes('small')) return 'Small';
  if (message.includes('medium')) return 'Medium';
  if (message.includes('large') || message.includes('big')) return 'Large';
  return null;
}

/**
 * Extract age from message
 */
function extractAge(message: string): string | null {
  if (message.includes('puppy') || message.includes('puppies')) return 'Puppy';
  if (message.includes('young')) return 'Young';
  if (message.includes('senior') || message.includes('older')) return 'Senior';
  if (message.includes('adult')) return 'Adult';
  return null;
}

/**
 * Handle size queries
 */
function handleSizeQuery(message: string, dogs: Dog[]): string | null {
  const size = extractSize(message);
  if (!size) return null;
  
  conversationState.preferredSize = size;
  const filtered = applyConversationFilters(dogs);
  
  if (filtered.length === 0) {
    return `I'm sorry, there are currently no ${size.toLowerCase()} dogs available matching your criteria.`;
  }
  
  return `Here are ${filtered.length} ${size.toLowerCase()} ${filtered.length === 1 ? 'dog' : 'dogs'} available:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Handle age queries
 */
function handleAgeQuery(message: string, dogs: Dog[]): string | null {
  const age = extractAge(message);
  if (!age) return null;
  
  conversationState.preferredAge = age;
  const filtered = applyConversationFilters(dogs);
  
  if (filtered.length === 0) {
    return `I'm sorry, there are currently no ${age.toLowerCase()} dogs available matching your criteria.`;
  }
  
  return `Here are ${filtered.length} ${age.toLowerCase()} ${filtered.length === 1 ? 'dog' : 'dogs'} available:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Handle size and age preference queries
 */
function handleSizeAgeQuery(message: string, dogs: Dog[]): string | null {
  const sizeResponse = handleSizeQuery(message, dogs);
  if (sizeResponse) return sizeResponse;
  
  const ageResponse = handleAgeQuery(message, dogs);
  if (ageResponse) return ageResponse;
  
  return null;
}

/**
 * Handle location-based queries
 */
function handleLocationQuery(message: string, dogs: Dog[], rescues: Rescue[]): string | null {
  const hasLocationKeyword = message.includes('wales') || message.includes('scotland') || 
                             message.includes('england') || message.includes('northern ireland') ||
                             message.includes('london') || message.includes('where') || 
                             (message.includes('rescue') && (message.includes('in') || message.includes('near')));
  
  if (!hasLocationKeyword) return null;
  
  const locations = ['wales', 'scotland', 'england', 'northern ireland', 'london', 'birmingham', 'manchester', 'glasgow', 'cardiff', 'edinburgh'];
  let foundLocation = null;
  for (const loc of locations) {
    if (message.includes(loc)) {
      foundLocation = loc;
      conversationState.preferredLocation = loc;
      break;
    }
  }
  
  if (foundLocation) {
    const localDogs = dogs.filter(d => 
      d.location.toLowerCase().includes(foundLocation) ||
      d.rescue.toLowerCase().includes(foundLocation)
    );
    
    if (localDogs.length > 0) {
      return `I found ${localDogs.length} ${localDogs.length === 1 ? 'dog' : 'dogs'} in or near ${foundLocation}:\n\n${formatDogList(localDogs, 5, true)}`;
    } else {
      return `I couldn't find any dogs specifically in ${foundLocation}, but we have dogs across the UK. Would you like to see all available dogs?`;
    }
  }
  
  const regions = rescues.map(r => r.region);
  const uniqueRegions = Array.from(new Set(regions));
  
  return buildLocationListResponse(uniqueRegions);
}

/**
 * Handle breed-related queries
 */
function handleBreedQuery(message: string, dogs: Dog[]): string | null {
  if (message.includes('breed')) {
    const breeds = new Set(dogs.flatMap(d => d.breeds));
    return `We currently have dogs of these breeds available:\n\n${Array.from(breeds).slice(0, 15).join(', ')}.\n\nWould you like to know more about a specific breed? Just ask!`;
  }
  
  const allBreeds = new Set(dogs.flatMap(d => d.breeds.map(b => b.toLowerCase())));
  for (const breed of allBreeds) {
    if (message.includes(breed)) {
      const breedDogs = dogs.filter(d => d.breeds.some(b => b.toLowerCase().includes(breed)));
      if (breedDogs.length > 0) {
        return `I found ${breedDogs.length} ${breed} ${breedDogs.length === 1 ? 'dog' : 'dogs'}:\n\n${formatDogList(breedDogs, 5, true)}`;
      }
    }
  }
  
  return null;
}

/**
 * Handle specific dog detail requests
 */
function handleDogDetailRequest(message: string, dogs: Dog[]): string | null {
  if (!(message.includes('tell me about') || message.includes('more about') || message.includes('tell me more'))) {
    return null;
  }
  
  if (dogs.length === 0) return null;
  
  const words = message.split(' ');
  for (const word of words) {
    const dog = dogs.find(d => d.name.toLowerCase() === word);
    if (dog) {
      return formatDogDetails(dog);
    }
  }
  
  return null;
}

/**
 * Handle "what dogs available" queries
 */
function handleWhatDogsQuery(message: string, dogs: Dog[]): string | null {
  const isWhatDogsQuery = message.includes('what dogs') || 
                          (message.includes('show') && message.includes('dog')) || 
                          (message.includes('list') && message.includes('dog'));
  
  if (!isWhatDogsQuery) return null;
  
  if (dogs.length === 0) {
    return "I'm sorry, there are currently no dogs available for adoption.";
  }
  
  let filtered = applyConversationFilters(dogs);
  if (filtered.length === 0) filtered = dogs;
  
  return `I found ${filtered.length} wonderful ${filtered.length === 1 ? 'dog' : 'dogs'} available for adoption:\n\n${formatDogList(filtered, 5, true)}`;
}

/**
 * Build preference summary for default response
 */
function buildPreferenceSummary(): string {
  const lines = [];
  if (conversationState.preferredSize) lines.push(`• ${conversationState.preferredSize} dogs`);
  if (conversationState.preferredAge) lines.push(`• ${conversationState.preferredAge} dogs`);
  if (conversationState.needsKidFriendly) lines.push('• Good with children');
  if (conversationState.needsDogFriendly) lines.push('• Good with other dogs');
  if (conversationState.needsCatFriendly) lines.push('• Good with cats');
  if (conversationState.preferredLocation) lines.push(`• In ${conversationState.preferredLocation}`);
  return lines.join('\n');
}

/**
 * Get default help message
 */
function getDefaultHelpMessage(hasPreferences: boolean): string {
  if (hasPreferences) {
    return `I didn't quite understand that, but I remember you're looking for:\n${buildPreferenceSummary()}\nTry asking:\n• "Show me these dogs"\n• "Tell me more"\n• "Start over" to reset`;
  }
  
  return `I can help you find information about available dogs and rescues! Here are some things you can ask me:\n\n• "What dogs are available?"\n• "Show me small dogs good with children"\n• "Are there any puppies?"\n• "Which dogs are good with cats?"\n• "What rescues are in Wales?"\n• "How many dogs are available?"\n\nFeel free to ask me anything about our available dogs!`;
}

/**
 * Generate a fallback response using enhanced pattern matching
 */
function generateFallbackResponse(
  userMessage: string,
  context: ChatContext
): ChatResponse | string {
  const message = userMessage.toLowerCase();
  const { dogs, rescues } = context;
  
  // Filter to only available dogs for all responses
  const availableDogs = dogs.filter(d => d.status === 'available');
  
  updateConversationState(userMessage);
  
  const basicResponse = handleBasicPatterns(message, { dogs: availableDogs, rescues });
  if (basicResponse) return basicResponse;
  
  const compoundResponse = handleCompoundDogQuery(message, availableDogs);
  if (compoundResponse) return compoundResponse;
  
  const whatDogsResponse = handleWhatDogsQuery(message, availableDogs);
  if (whatDogsResponse) return whatDogsResponse;
  
  const traitResponse = handleTraitQuery(message, availableDogs);
  if (traitResponse) return traitResponse;
  
  const breedResponse = handleBreedQuery(message, availableDogs);
  if (breedResponse) return breedResponse;
  
  const sizeAgeResponse = handleSizeAgeQuery(message, availableDogs);
  if (sizeAgeResponse) return sizeAgeResponse;
  
  const locationResponse = handleLocationQuery(message, availableDogs, rescues);
  if (locationResponse) return locationResponse;
  
  const dogDetailResponse = handleDogDetailRequest(message, availableDogs);
  if (dogDetailResponse) return dogDetailResponse;
  
  if (isShowMoreRequest(message) && conversationState.lastQuery) {
    const filtered = applyConversationFilters(availableDogs);
    if (filtered.length > 5) {
      return `Here are more dogs matching your preferences:\n\n${formatDogList(filtered.slice(5, 10), 5, true)}`;
    }
  }
  
  if (isRescueInfoRequest(message)) {
    if (rescues.length === 0) return "I don't have information about rescues at the moment.";
    return buildRescueListResponse(rescues);
  }
  
  const hasPreferences = Object.keys(conversationState).length > 0;
  return getDefaultHelpMessage(hasPreferences);
}

/**
 * Main function to get a chat response
 */
export async function getChatResponse(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  try {
    // Try OpenAI first if API key is configured
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey) {
      const response = await generateOpenAIResponse(userMessage, context);
      return { content: response };
    }
  } catch (error) {
    console.warn('OpenAI API failed, falling back to pattern matching:', error);
  }
  
  // Fall back to pattern matching
  const fallbackResponse = generateFallbackResponse(userMessage, context);
  
  // Filter to only available dogs for suggestions
  const availableDogs = context.dogs.filter(d => d.status === 'available');
  
  // If it's a string (old format), convert to new format
  if (typeof fallbackResponse === 'string') {
    const suggestions = generateSuggestions(availableDogs, context);
    return {
      content: fallbackResponse,
      suggestedQuestions: suggestions.length > 0 ? suggestions : undefined
    };
  }
  
  // If it's already a ChatResponse, add suggestions if not present
  if (!fallbackResponse.suggestedQuestions) {
    const suggestions = generateSuggestions(availableDogs, context);
    fallbackResponse.suggestedQuestions = suggestions.length > 0 ? suggestions : undefined;
  }
  
  return fallbackResponse;
}

/**
 * Generate example starter questions based on available data
 */
export function getStarterQuestions(context: ChatContext): string[] {
  // Filter to only available dogs
  const availableDogs = context.dogs.filter(d => d.status === 'available');
  const questions = ['What dogs are available?'];
  
  if (availableDogs.some(d => d.goodWithKids)) {
    questions.push('Show me dogs good with children');
  }
  
  if (availableDogs.some(d => d.size === 'Small')) {
    questions.push('Do you have any small dogs?');
  }
  
  if (availableDogs.some(d => (d.computedAge || d.age) === 'Puppy')) {
    questions.push('Tell me about puppies');
  }
  
  // Add more dynamic questions
  if (availableDogs.some(d => d.goodWithCats)) {
    questions.push('Which dogs are good with cats?');
  }
  
  questions.push('How many dogs are available?');
  
  return questions;
}
