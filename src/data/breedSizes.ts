/**
 * Default size classifications for dog breeds based on typical adult weight:
 * - Small: Up to 20 lbs (9 kg)
 * - Medium: 21-60 lbs (10-27 kg)
 * - Large: Over 60 lbs (27+ kg)
 * 
 * Sources: AKC, KC (UK), and FCI breed standards
 * Last updated: December 2024
 */

export type BreedSize = 'Small' | 'Medium' | 'Large';

export const BREED_SIZE_MAP: Record<string, BreedSize> = {
  // Small breeds (up to 20 lbs / 9 kg)
  "Affenpinscher": "Small",
  "Australian Terrier": "Small",
  "Alaskan Klee Kai": "Small", // Typically 10-15 lbs
  "Biewer Terrier": "Small",
  "Bichon Frise": "Small", // Typically 12-18 lbs
  "Bolognese": "Small",
  "Brussels Griffon": "Small",
  "Cairn Terrier": "Small",
  "Cavalier King Charles Spaniel": "Small",
  "Cesky Terrier": "Small",
  "Chihuahua": "Small",
  "Chinese Crested": "Small",
  "Coton de Tulear": "Small",
  "Dachshund": "Small",
  "Dandie Dinmont Terrier": "Small",
  "English Toy Spaniel": "Small",
  "Havanese": "Small",
  "Italian Greyhound": "Small",
  "Jack Russell Terrier": "Small",
  "Japanese Chin": "Small",
  "Lakeland Terrier": "Small",
  "Lancashire Heeler": "Small",
  "Lowchen": "Small",
  "Maltese": "Small",
  "Manchester Terrier": "Small",
  "Miniature Pinscher": "Small",
  "Norfolk Terrier": "Small",
  "Norwegian Lundehund": "Small",
  "Norwich Terrier": "Small",
  "Papillon": "Small",
  "Parson Russell Terrier": "Small",
  "Patterdale Terrier": "Small",
  "Pekingese": "Small",
  "Pomeranian": "Small",
  "Poodle (Toy)": "Small",
  "Portuguese Podengo Pequeno": "Small",
  "Pug": "Small",
  "Rat Terrier": "Small",
  "Russian Toy": "Small",
  "Schipperke": "Small",
  "Scottish Terrier": "Small",
  "Sealyham Terrier": "Small",
  "Shih Tzu": "Small",
  "Silky Terrier": "Small",
  "Skye Terrier": "Small",
  "Tibetan Spaniel": "Small",
  "Toy Fox Terrier": "Small",
  "West Highland White Terrier": "Small",
  "Yorkshire Terrier": "Small",

  // Medium breeds (21-60 lbs / 10-27 kg)
  "American Eskimo Dog": "Medium",
  "American Water Spaniel": "Medium",
  "Australian Cattle Dog": "Medium",
  "Australian Kelpie": "Medium",
  "Australian Shepherd": "Medium",
  "Barbet": "Medium",
  "Basenji": "Medium",
  "Basset Fauve de Bretagne": "Medium",
  "Basset Hound": "Medium",
  "Beagle": "Medium",
  "Bearded Collie": "Medium",
  "Bedlington Terrier": "Medium",
  "Border Collie": "Medium",
  "Border Terrier": "Medium",
  "Boston Terrier": "Medium",
  "Brittany": "Medium",
  "Bulldog": "Medium",
  "Bull Terrier": "Medium",
  "Cardigan Welsh Corgi": "Medium",
  "Cocker Spaniel": "Medium",
  "English Cocker Spaniel": "Medium",
  "Entlebucher Mountain Dog": "Medium",
  "Field Spaniel": "Medium",
  "Finnish Lapphund": "Medium",
  "Finnish Spitz": "Medium",
  "Fox Terrier (Smooth)": "Medium",
  "Fox Terrier (Wire)": "Medium",
  "French Bulldog": "Medium",
  "German Spitz": "Medium",
  "Glen of Imaal Terrier": "Medium",
  "Icelandic Sheepdog": "Medium",
  "Irish Terrier": "Medium",
  "Keeshond": "Medium",
  "Kerry Blue Terrier": "Medium",
  "Kooikerhondje": "Medium",
  "Lagotto Romagnolo": "Medium",
  "Lhasa Apso": "Medium",
  "Miniature American Shepherd": "Medium",
  "Miniature Bull Terrier": "Medium",
  "Miniature Schnauzer": "Medium",
  "Norwegian Buhund": "Medium",
  "Pembroke Welsh Corgi": "Medium",
  "Petit Basset Griffon Vendéen": "Medium",
  "Poodle (Miniature)": "Medium",
  "Portuguese Water Dog": "Medium",
  "Puli": "Medium",
  "Pumi": "Medium",
  "Pyrenean Shepherd": "Medium",
  "Shetland Sheepdog": "Medium",
  "Shiba Inu": "Medium",
  "Soft Coated Wheaten Terrier": "Medium",
  "Spanish Water Dog": "Medium",
  "Staffordshire Bull Terrier": "Medium",
  "Standard Schnauzer": "Medium",
  "Sussex Spaniel": "Medium",
  "Swedish Vallhund": "Medium",
  "Tibetan Terrier": "Medium",
  "Welsh Springer Spaniel": "Medium",
  "Welsh Terrier": "Medium",
  "Whippet": "Medium",
  "Wire Fox Terrier": "Medium",

  // Large breeds (over 60 lbs / 27+ kg)
  "Afghan Hound": "Large",
  "Airedale Terrier": "Large",
  "Akbash": "Large",
  "Akita": "Large",
  "Alaskan Malamute": "Large",
  "American Bulldog": "Large",
  "American Bully": "Large",
  "American Foxhound": "Large",
  "American Hairless Terrier": "Medium",
  "American Pit Bull Terrier": "Large",
  "American Staffordshire Terrier": "Large",
  "Anatolian Shepherd Dog": "Large",
  "Appenzeller Sennenhund": "Large",
  "Azawakh": "Large",
  "Basset Bleu de Gascogne": "Large",
  "Bavarian Mountain Hound": "Large",
  "Beauceron": "Large",
  "Belgian Malinois": "Large",
  "Belgian Sheepdog": "Large",
  "Belgian Tervuren": "Large",
  "Bergamasco Sheepdog": "Large",
  "Berger Picard": "Large",
  "Bernese Mountain Dog": "Large",
  "Black and Tan Coonhound": "Large",
  "Black Russian Terrier": "Large",
  "Bloodhound": "Large",
  "Blue Lacy": "Large",
  "Bluetick Coonhound": "Large",
  "Boerboel": "Large",
  "Borzoi": "Large",
  "Bouvier des Flandres": "Large",
  "Boxer": "Large",
  "Boykin Spaniel": "Medium",
  "Bracco Italiano": "Large",
  "Briard": "Large",
  "Bullmastiff": "Large",
  "Canaan Dog": "Medium",
  "Cane Corso": "Large",
  "Carolina Dog": "Medium",
  "Catahoula Leopard Dog": "Large",
  "Caucasian Shepherd Dog": "Large",
  "Central Asian Shepherd Dog": "Large",
  "Chesapeake Bay Retriever": "Large",
  "Chinese Shar-Pei": "Large",
  "Chinook": "Large",
  "Chow Chow": "Large",
  "Cirneco dell'Etna": "Medium",
  "Clumber Spaniel": "Large",
  "Collie": "Large",
  "Curly-Coated Retriever": "Large",
  "Dalmatian": "Large",
  "Doberman Pinscher": "Large",
  "Dogo Argentino": "Large",
  "Dogue de Bordeaux": "Large",
  "Dutch Shepherd": "Large",
  "English Foxhound": "Large",
  "English Setter": "Large",
  "English Springer Spaniel": "Medium",
  "Estrela Mountain Dog": "Large",
  "Eurasier": "Large",
  "Flat-Coated Retriever": "Large",
  "German Pinscher": "Medium",
  "German Shepherd": "Large",
  "German Shorthaired Pointer": "Large",
  "German Wirehaired Pointer": "Large",
  "Giant Schnauzer": "Large",
  "Golden Retriever": "Large",
  "Gordon Setter": "Large",
  "Grand Basset Griffon Vendéen": "Large",
  "Great Dane": "Large",
  "Great Pyrenees": "Large",
  "Greater Swiss Mountain Dog": "Large",
  "Greyhound": "Large",
  "Hamiltonstovare": "Large",
  "Harrier": "Medium",
  "Hovawart": "Large",
  "Ibizan Hound": "Large",
  "Irish Red and White Setter": "Large",
  "Irish Setter": "Large",
  "Irish Water Spaniel": "Large",
  "Irish Wolfhound": "Large",
  "Jindo": "Medium",
  "Kai Ken": "Medium",
  "Karelian Bear Dog": "Medium",
  "Komondor": "Large",
  "Korean Jindo": "Medium",
  "Kuvasz": "Large",
  "Labrador Retriever": "Large",
  "Leonberger": "Large",
  "Mastiff": "Large",
  "Mixed Breed": "Medium", // Default for unknown mixes
  "Neapolitan Mastiff": "Large",
  "Newfoundland": "Large",
  "Norwegian Elkhound": "Medium",
  "Nova Scotia Duck Tolling Retriever": "Medium",
  "Old English Sheepdog": "Large",
  "Otterhound": "Large",
  "Peruvian Inca Orchid": "Medium",
  "Pharaoh Hound": "Large",
  "Plott Hound": "Large",
  "Pointer": "Large",
  "Polish Lowland Sheepdog": "Medium",
  "Poodle (Standard)": "Large",
  "Pyrenean Mastiff": "Large",
  "Redbone Coonhound": "Large",
  "Rhodesian Ridgeback": "Large",
  "Rottweiler": "Large",
  "Saint Bernard": "Large",
  "Saluki": "Large",
  "Samoyed": "Large",
  "Scottish Deerhound": "Large",
  "Siberian Husky": "Large",
  "Sloughi": "Large",
  "Small Munsterlander": "Medium",
  "Spanish Mastiff": "Large",
  "Spinone Italiano": "Large",
  "Tibetan Mastiff": "Large",
  "Treeing Walker Coonhound": "Large",
  "Vizsla": "Large",
  "Weimaraner": "Large",
  "Wirehaired Pointing Griffon": "Large",
  "Wirehaired Vizsla": "Large",
  "Xoloitzcuintli": "Medium", // Variable but typically medium

  // Common cross-breeds (using typical size expectations)
  "Cockapoo": "Small",
  "Crossbreed": "Medium", // Default for unknown crosses
  "Labradoodle": "Large",
  "Goldendoodle": "Large",
  "Cavapoo": "Small",
  "Puggle": "Small",
  "Yorkipoo": "Small",
  "Maltipoo": "Small",
  "Schnoodle": "Medium",
  "Pomsky": "Medium",
  "Shorkie": "Small",
  "Morkie": "Small",
  "Chorkie": "Small",
  "Aussiedoodle": "Large",
  "Bernedoodle": "Large",
  "Sheepadoodle": "Large",
  "Terrier Mix": "Medium", // Default for terrier crosses
};

/**
 * Get the default size for a breed based on the breed name.
 * Returns 'Medium' as a safe default if breed is not found.
 */
export function getBreedSize(breedName: string): BreedSize {
  // Normalize breed name for case-insensitive lookup
  const normalizedBreed = breedName.trim();
  
  // Direct lookup
  if (BREED_SIZE_MAP[normalizedBreed]) {
    return BREED_SIZE_MAP[normalizedBreed];
  }
  
  // Case-insensitive lookup
  const foundEntry = Object.entries(BREED_SIZE_MAP).find(
    ([key]) => key.toLowerCase() === normalizedBreed.toLowerCase()
  );
  
  if (foundEntry) {
    return foundEntry[1];
  }
  
  // Default to Medium for unknown breeds
  return "Medium";
}

/**
 * Get the default size for a dog based on multiple breeds.
 * Uses the first breed's size, or Medium if no breeds provided.
 */
export function getDefaultSizeForBreeds(breeds: string[]): BreedSize {
  if (!breeds || breeds.length === 0) {
    return "Medium";
  }
  
  // Use the first breed's size as the default
  return getBreedSize(breeds[0]);
}
