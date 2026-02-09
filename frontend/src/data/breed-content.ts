export interface BuyingInfo {
    priceRange: string;
    puppyCare?: string[];
    kittenCare?: string[];
    checklist: string[];
}

export interface BreedContent {
    description: string;
    history: string;
    temperament: string[];
    careTips: string[];
    funFact?: string;
    buyingInfo?: BuyingInfo;
}

export const BREED_CONTENT: Record<string, BreedContent> = {
    // DOGS
    'labrador-retriever': {
        description: "The Labrador Retriever is one of the most beloved dog breeds in India and across the world. Known for their friendly eyes, wagging tails, and gentle nature, Labs make perfect family companions. They are intelligent, eager to please, and get along wonderfully with children and other pets.",
        history: "Originally from Newfoundland, Canada, Labradors were bred as helpers for fishermen, retrieving nets and fish from the icy waters. Their water-resistant coat and 'otter tail' made them excellent swimmers. Today, they excel as service dogs, search-and-rescue dogs, and loving family pets.",
        temperament: ["Friendly", "Active", "Outgoing", "Intelligent", "Gentle"],
        careTips: [
            "Labs love to eat and can gain weight easily; monitor their diet.",
            "They are high-energy dogs and need daily exercise like walking or swimming.",
            "Regular brushing helps manage their shedding.",
            "Mental stimulation is key to prevent boredom-induced chewing."
        ],
        funFact: "Labradors have webbed toes, which makes them excellent swimmers!",
        buyingInfo: {
            priceRange: "₹15,000 - ₹35,000",
            puppyCare: [
                "Start specialized training early as they grow fast.",
                "Provide chew toys to manage teething.",
                "Socialize them with water if you plan on swimming.",
                "Feed high-quality large-breed puppy food."
            ],
            checklist: [
                "Verify KCI registration papers (if applicable).",
                "Check for hip and elbow dysplasia clearances.",
                "Observe the puppy's interaction with littermates."
            ]
        }
    },
    'german-shepherd': {
        description: "The German Shepherd Dog (GSD) is a versatile working dog known for its intelligence, loyalty, and courage. In India, they are popular as both guard dogs and family protectors. They form deep bonds with their owners and are eager to learn new commands.",
        history: "Developed in Germany in the late 19th century by Captain Max von Stephanitz, the breed was created for sheep herding. Their intelligence and trainability quickly saw them adapted for police and military work worldwide.",
        temperament: ["Loyal", "Confident", "Courageous", "Intelligent", "Protective"],
        careTips: [
            "Early socialization is crucial to ensure they are well-adjusted.",
            "They require rigorous daily exercise and mental challenges.",
            "Regular grooming is needed, especially during shedding seasons.",
            "Hip health is a concern; ensure they maintain a healthy weight."
        ],
        buyingInfo: {
            priceRange: "₹18,000 - ₹45,000",
            puppyCare: [
                "Begin obedience training immediately.",
                "Avoid excessive jumping to protect developing joints.",
                "Socialize with strangers to manage protective instincts.",
                "Provide puzzle toys for mental stimulation."
            ],
            checklist: [
                "Ask to see the parents to gauge temperament.",
                "Ensure the puppy is not overly fearful or aggressive.",
                "Check for signs of skin infections or parasites."
            ]
        }
    },
    'golden-retriever': {
        description: "Golden Retrievers are synonymous with kindness and devotion. Their stunning golden coats and smiling faces capture hearts instantly. They are patient, deeply affectionate, and highly trainable, making them one of the best choices for first-time pet owners in India.",
        history: "Developed in the Scottish Highlands in the mid-19th century, they were bred to retrieve game during hunting. Their 'soft mouth' allowed them to retrieve waterfowl without damaging it. Today, they are beloved therapy and assistance dogs.",
        temperament: ["Friendly", "Intelligent", "Devoted", "Patient", "Reliable"],
        careTips: [
            "Regular brushing is required to keep their golden coat tangle-free.",
            "They need daily walks and playtime, especially games of fetch.",
            "Goldens thrive on human companionship and shouldn't be left alone for long periods.",
            "Check their ears regularly for infections."
        ],
        buyingInfo: {
            priceRange: "₹20,000 - ₹40,000",
            puppyCare: [
                "Gentle grooming introduction is key.",
                "Provide plenty of soft toys for carrying.",
                "Start potty training immediately as they learn fast.",
                "Ensure they have a cool spot to rest."
            ],
            checklist: [
                "Check for clear eyes and clean ears.",
                "Ask about heart and eye certifications of parents.",
                "Ensure the coat is clean and free of mats."
            ]
        }
    },
    'beagle': {
        description: "Beagles are small, merry hounds with a great sense of smell and an even greater appetite for fun. Their compact size and friendly demeanor make them excellent apartment dogs, provided they get enough exercise to burn off their scent-hound energy.",
        history: "Beagles have a history dating back to ancient Greece but were refined in Great Britain for hunting hare. Their incredible sense of smell is second only to the Bloodhound, which is why they are often used in airport security.",
        temperament: ["Merry", "Curious", "Friendly", "Determined", "Gentle"],
        careTips: [
            "Keep them on a leash; their nose often leads them astray.",
            "Monitor their food intake as they are prone to obesity.",
            "Their floppy ears need regular cleaning to prevent infection.",
            "They can be vocal (howling), so training is important."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹28,000",
            puppyCare: [
                "Crate training is highly recommended.",
                "Use positive reinforcement; they are food-motivated.",
                "Secure your home; they are curious explorers.",
                "Start recall training early, though they may ignore it for a scent."
            ],
            checklist: [
                "Check for ear mites or infections.",
                "Observe energy levels; should be active and curious.",
                "Verify standard Tricolor or Bicolor markings."
            ]
        }
    },
    'indie': {
        description: "The Indian Pariah Dog, or 'Indie', is a breed naturally evolved and perfectly suited for the Indian climate. They are extremely healthy, intelligent, and alert. Adopting an Indie is a noble choice that gives a deserving street dog a loving home.",
        history: "Indies are one of the oldest dog breeds, dating back thousands of years. They have evolved through natural selection, making them hardy, immune to many local diseases, and highly adaptable to the Indian environment.",
        temperament: ["Alert", "Intelligent", "Loyal", "Low-maintenance", "Adaptable"],
        careTips: [
            "They are generally very healthy and require minimal grooming.",
            "Early socialization helps them overcome their natural wariness of strangers.",
            "They are highly intelligent and learn commands quickly.",
            "A balanced diet and regular walks keep them happy."
        ],
        funFact: "Indies are known to be one of the healthiest dog breeds with very few genetic disorders!",
        buyingInfo: {
            priceRange: "Free - ₹5,000 (Adoption fees)",
            puppyCare: [
                "Socialize extensively with people and other dogs.",
                "Establish a routine early on.",
                "They are quick learners, so keep training fun.",
                "Provide a safe space/den for them."
            ],
            checklist: [
                "Check for tick/flea infestations.",
                "Ensure basic vaccinations (Parvo/Distemper) are started.",
                "Assess their reaction to handling."
            ]
        }
    },
    'shih-tzu': {
        description: "The Shih Tzu is a small, affectionate dog known for its luxurious coat and sweet personality. They were bred solely to be companions, and they excel at it. They love sitting on laps and are well-suited for apartment living in cities like Mumbai or Delhi.",
        history: "Originally from Tibet and later developed in China, Shih Tzus were the cherished lap dogs of Chinese emperors. They were so prized that for years, the Chinese refused to sell, trade, or give any away.",
        temperament: ["Affectionate", "Playful", "Outgoing", "Charming", "Loyal"],
        careTips: [
            "Their long coat requires daily brushing and regular grooming.",
            "Constructive training is needed as they can be a bit stubborn.",
            "They are indoor dogs and sensitive to heat; keep them cool.",
            "Clean their face and eyes daily to prevent staining."
        ],
        buyingInfo: {
            priceRange: "₹25,000 - ₹50,000",
            puppyCare: [
                "Start grooming habituation from day one.",
                "Watch portion sizes; they are small stomachs.",
                "Use a harness instead of a collar to protect their trachea.",
                "Keep eyes clean from hair irritation."
            ],
            checklist: [
                "Check for hernias (common in the breed).",
                "Ensure nostrils are open (stenotic nares check).",
                "Verify the coat quality and skin health."
            ]
        }
    },
    'husky': {
        description: "Siberian Huskies are striking dogs with thick coats and piercing eyes. They are known for their endurance and friendly, mischievous nature. While beautiful, they are high-energy dogs that require an active owner who can keep up with their needs.",
        history: "Bred by the Chukchi people of northeastern Asia as sled dogs, they were designed to carry light loads over long distances in freezing temperatures. They gained fame during the 1925 'Serum Run' to Nome, Alaska.",
        temperament: ["Friendly", "Gentle", "Alert", "Outgoing", "Mischievous"],
        careTips: [
            "They shed heavily and need frequent brushing.",
            "High exercise needs; a simple walk isn't enough—they love to run.",
            "They are escape artists; ensure you have a secure fence.",
            "They are pack animals and do not like being left alone."
        ],
        buyingInfo: {
            priceRange: "₹35,000 - ₹65,000",
            puppyCare: [
                "Secure your yard; they can dig and jump.",
                "Start leashed walking training immediately.",
                "Provide plenty of durable chew toys.",
                "Socialize with small animals carefully."
            ],
            checklist: [
                "Check for blue or brown eyes (both acceptable).",
                "Ensure the coat is double-layered.",
                "Verify parents' hip and eye health clearances."
            ]
        }
    },
    'pug': {
        description: "Pugs are the clowns of the canine world because they have a great sense of humor and like to show off. Originally bred to be lap dogs for Chinese emperors, they are sturdy, compact, and loving companions who thrive on human affection.",
        history: "One of the oldest breeds, dating back to 400 B.C., Pugs were the cherished pets of Tibetan monks and Chinese royalty. They were brought to Europe in the 16th century and became the mascot of Holland's House of Orange.",
        temperament: ["Charming", "Mischievous", "Loving", "Stable", "Outgoing"],
        careTips: [
            "Clean their facial wrinkles daily to prevent infection.",
            "They are prone to heatstroke; keep them cool and avoid midday walks.",
            "Watch their diet; Pugs love to eat and can easily become obese.",
            "Use a harness instead of a collar to protect their throat."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹35,000",
            puppyCare: [
                "Start wrinkle cleaning routine early.",
                "Socialize them; they love people.",
                "Be patient with potty training.",
                "Don't over-exercise them in heat."
            ],
            checklist: [
                "Check for open nostrils (stenotic nares).",
                "Ensure eyes are clear and not bulging excessively.",
                "Verify skin fold health."
            ]
        }
    },
    'rottweiler': {
        description: "Rottweilers are robust working dogs of great strength. descended from the mastiffs of the Roman legions. A well-bred and properly raised Rottie is confident and calm, loving and loyal to their families.",
        history: "They served as herder-guards for the traveling Roman armies. Later, in the town of Rottweil, Germany, they moved cattle to market and protected them from robbers. They were among the first guide dogs for the blind.",
        temperament: ["Loyal", "Loving", "Confident", "Guardian", "Steady"],
        careTips: [
            "Early, positive socialization is absolutely critical.",
            "They need clear, consistent leadership and training.",
            "Daily exercise is required to keep them fit and happy.",
            "They are prone to obesity; measure their food."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹40,000",
            puppyCare: [
                "Enroll in puppy socialization classes immediately.",
                "Establish yourself as a benevolent leader.",
                "Handle their paws and mouth to prep for vet visits.",
                "Provide sturdy chew toys."
            ],
            checklist: [
                "Meet the parents to assess temperament (crucial).",
                "Check for hip and elbow scores.",
                "Ensure the puppy is confident, not fearful."
            ]
        }
    },
    'doberman': {
        description: "Doberman Pinschers are sleek, powerful dogs possessing a magnificent physique and keen intelligence. They are known as one of the world's finest protection dogs but are also affectionate family guardians.",
        history: "Developed in Germany by Louis Dobermann, a tax collector who wanted a fierce protector to accompany him on his rounds. The breed is a mix of Rottweiler, German Pinscher, and others.",
        temperament: ["Alert", "Fearless", "Loyal", "Energetic", "Intelligent"],
        careTips: [
            "They are high-energy dogs needing vigorous daily exercise.",
            "Mental stimulation is as important as physical activity.",
            "They are sensitive 'velcro' dogs and need to be with their family.",
            "Short coat is low maintenance but needs winter protection."
        ],
        buyingInfo: {
            priceRange: "₹12,000 - ₹30,000",
            puppyCare: [
                "Socialize extensively to build confidence.",
                "Channel their energy into training or sports.",
                "Provide a warm place to sleep (low body fat).",
                "Prevent jumping on hard surfaces while growing."
            ],
            checklist: [
                "Ask about vWD (blood disorder) testing.",
                "Check for heart health history in lines.",
                "Verify tail docking status (if relevant to you)."
            ]
        }
    },
    'pomeranian': {
        description: "The Pomeranian is a compact, short-backed, active toy dog. They have a double coat, a fox-like face, and alert, intelligent expression. They are bold and curious, often thinking they are much larger than they actually are.",
        history: "Descended from large sled dogs, the Pom was sized down in the province of Pomerania. Queen Victoria is credited with popularizing the smaller size we see today.",
        temperament: ["Lively", "Bold", "Inquisitive", "Feisty", "Affectionate"],
        careTips: [
            "Brush their double coat frequently to prevent matting.",
            "Dental hygiene is crucial; brush their teeth daily.",
            "Use a harness to protect their delicate trachea.",
            "They can be barkers; teach 'quiet' command early."
        ],
        buyingInfo: {
            priceRange: "₹8,000 - ₹25,000",
            puppyCare: [
                "Handle gently; they are fragile puppies.",
                "Monitor for hypoglycemia (low blood sugar).",
                "Start grooming habituation early.",
                "Socialize with larger dogs carefully."
            ],
            checklist: [
                "Check knees (patellas) for stability.",
                "Ensure fontanel (soft spot on head) is closing.",
                "Verify coat quality and density."
            ]
        }
    },
    'boxer': {
        description: "Boxers are the whole package: an athlete, a watchdog, and a companion dog. They are patient and spirited with children, but also protective, making them a popular choice for families. Their silly, high-energy personality is infectious.",
        history: "Developed in Germany from the extinct Bullenbeisser and Mastiffs, they were used for dog fighting and bull baiting, but later became police dogs and family pets.",
        temperament: ["Playful", "Bright", "Active", "Patient", "Devoted"],
        careTips: [
            "They need a lot of exercise but are sensitive to heat.",
            "They are prone to cancer; check lumps immediately.",
            "Clean their face folds to keep them smelling fresh.",
            "Training must be fun; they get bored with repetition."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹40,000",
            puppyCare: [
                "Channel their jumping/mouthing energy into toys.",
                "Don't over-exercise in hot weather.",
                "Socialize to prevent same-sex aggression.",
                "Feed high-quality diet for heart health."
            ],
            checklist: [
                "Check for heart murmurs (common issue).",
                "Verify hip health.",
                "Ensure parents are verified purely breed."
            ]
        }
    },

    // CATS
    'persian': {
        description: "The Persian cat is the glamour puss of the cat world. With their beautiful long fur, sweet faces, and calm personalities, they are the most popular breed for a reason. They are quiet, gentle, and prefer a serene home environment.",
        history: "Persians originated in Persia (modern-day Iran) and were imported to Europe in the 1600s. They quickly became a favorite of royalty, including Queen Victoria, and have been refined over centuries for their distinctive look.",
        temperament: ["Quiet", "Sweet", "Gentle", "Relaxed", "Affectionate"],
        careTips: [
            "Daily grooming is non-negotiable to prevent painful mats.",
            "Wipe their eyes daily to prevent tear staining.",
            "They are strictly indoor cats due to their gentle nature.",
            "Keep their litter box immaculately clean."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹40,000",
            kittenCare: [
                "Daily eye cleaning is essential.",
                "Start grooming routine from day one.",
                "Keep them strictly indoors.",
                "Monitor for respiratory issues."
            ],
            checklist: [
                "Check for nose pinch/breathing issues.",
                "Verify tear ducts are functioning.",
                "Ensure coat is free of mats."
            ]
        }
    },
    'siamese': {
        description: "Siamese cats are legendary for their sleek bodies, blue eyes, and vocal personalities. They are extremely social and ‘talk’ to their owners constantly. If you want a cat that interacts with you like a dog, the Siamese is a great choice.",
        history: "Originating from Thailand (formerly Siam), they were kept by monks and royalty. Legend says they guarded Buddhist temples. They were introduced to the West in the late 19th century and became an instant hit.",
        temperament: ["Social", "Vocal", "Intelligent", "Active", "Demanding"],
        careTips: [
            "They need a lot of attention and dislike being left alone.",
            "Provide plenty of toys and scratching posts for entertainment.",
            "Their short coat is easy to groom with weekly brushing.",
            "They are intelligent and can even be trained to play fetch."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹35,000",
            kittenCare: [
                "Provide puzzle toys for mental stimulation.",
                "Don't leave them alone for long periods.",
                "Brush teeth regularly (prone to dental issues).",
                "Purchase a sturdy scratching post."
            ],
            checklist: [
                "Check for crossed eyes or kinked tail.",
                "Verify vocal level (they are loud!).",
                "Ensure kitten is active and social."
            ]
        }
    },
    'maine-coon': {
        description: "The Maine Coon is known as the 'gentle giant'. They are large, rugged cats with a shaggy coat and a friendly, dog-like personality. They are excellent family pets who get along well with children and dogs.",
        history: "Native to the state of Maine in the USA, they developed their thick coats to survive harsh winters. Myths once suggested they were part raccoon, but they’re actually descendants of domestic cats and possibly Vikings' ship cats.",
        temperament: ["Gentle", "Friendly", "Intelligent", "Playful", "Dog-like"],
        careTips: [
            "Their thick coat needs regular brushing to prevent tangles.",
            "They are large cats and need sturdy scratching posts and space.",
            "They are fascinated by water and might join you in the bathroom.",
            "Monitor their heart health as they age."
        ],
        buyingInfo: {
            priceRange: "₹40,000 - ₹1,50,000",
            kittenCare: [
                "Get them used to grooming early.",
                "Feed high-protein diet for growth.",
                "Provide large, sturdy climbing structures.",
                "Socialize with water (many love it)."
            ],
            checklist: [
                "Verify parents heart tested (HCM).",
                "Check for hip dysplasia history.",
                "Ensure kitten is well-socialized."
            ]
        },
        funFact: "Maine Coons often chirp and trill rather than meow!"
    },
    'bengal-cat': {
        description: "Bengal cats look like wild leopards but have the loving nature of a domestic cat. They are highly active, intelligent, and athletic. A Bengal is not a lap cat; they are an adventure companion who loves to climb and play.",
        history: "Bengals were created by crossing domestic cats with the Asian Leopard Cat to keep the wild look with a tame temperament. The breed was officially established in the 1980s.",
        temperament: ["Active", "Energetic", "Intelligent", "Curious", "Confident"],
        careTips: [
            "They require lots of interactive play and climbing spaces.",
            "They are highly intelligent and can learn tricks.",
            "Some Bengals love water and might play in the sink.",
            "Not suited for sedentary owners; they need stimulation."
        ],
        buyingInfo: {
            priceRange: "₹30,000 - ₹80,000",
            kittenCare: [
                "Provide lots of vertical space (cat trees).",
                "Use interactive toys to burn energy.",
                "Child-proof the home (they open cabinets!).",
                "Consider a cat wheel for exercise."
            ],
            checklist: [
                "Check for genetic testing (PRA, PK Def).",
                "Ensure kitten is not aggressive.",
                "Verify coat pattern clarity/contrast."
            ]
        }
    },
    'himalayan': {
        description: "Himalayans, or 'Himmies', combine the luxurious coat of the Persian with the color points and blue eyes of the Siamese. They are sweet, tempered, and playful companions who enjoy the best of both worlds.",
        history: "This breed was man-made in the 1930s by crossing Persians with Siamese to achieve the color-point pattern on a long-haired cat. They are recognized as a distinct breed by some associations and a variety of Persian by others.",
        temperament: ["Sweet", "Playful", "Gentle", "Social", "Devoted"],
        careTips: [
            "Like Persians, they require daily grooming to avoid mats.",
            "Eye cleaning is essential due to their flat faces.",
            "They are prone to heat sensitivity, so keep them cool.",
            "They enjoy interactive play but are also happy to lap-sit."
        ],
        buyingInfo: {
            priceRange: "₹20,000 - ₹45,000",
            kittenCare: [
                "Daily grooming is non-negotiable.",
                "Keep environment cool (heat sensitive).",
                "Clean eyes daily.",
                "Monitor portion sizes (prone to obesity)."
            ],
            checklist: [
                "Check breathing (flat face issues).",
                "Verify coat quality and texture.",
                "Ensure eyes are clear."
            ]
        }
    },
    'ragdoll': {
        description: "Ragdolls are large, laid-back, semi-longhaired cats with captivating blue eyes. They are named for their tendency to go limp and relaxed when picked up. They are strictly indoor cats and are often called 'puppy-cats' because they follow their owners around.",
        history: "Developed in the 1960s in California by Ann Baker, who bred a white domestic longhaired cat to other cats to produce the affectionate temperament and size.",
        temperament: ["Docile", "Affectionate", "Gentle", "Quiet", "Friendly"],
        careTips: [
            "Their coat is easier to care for than a Persian's but needs weekly brushing.",
            "They are strictly indoor cats; they lack defensive instincts.",
            "They can get lonely; consider a companion pet.",
            "Watch their weight as they are not overly active."
        ],
        buyingInfo: {
            priceRange: "₹25,000 - ₹55,000",
            kittenCare: [
                "Handle them frequently to maintain social nature.",
                "Provide a sturdy scratcher; they are big cats.",
                "Feed kitten food longer; they grow for 4 years.",
                "Keep them indoors."
            ],
            checklist: [
                "Verify blue eyes (required for breed).",
                "Check for HCM (heart) testing parents.",
                "Ensure kitten is well-socialized."
            ]
        }
    },
    'british-shorthair': {
        description: "The British Shorthair is a sturdy, easygoing cat with a dense, plush coat and a round face. They are the 'teddy bears' of the cat world. They are dignified and affectionate but not needy, making them great for working owners.",
        history: "One of the oldest English breeds, their ancestry can be traced back to the domestic cats of Rome. They were prized for their hunting ability and strength.",
        temperament: ["Easygoing", "Calm", "Loyal", "Independent", "Quiet"],
        careTips: [
            "Their dense coat needs weekly brushing.",
            "They are prone to obesity; measure their food carefully.",
            "They aren't lap cats but love to sit next to you.",
            "Interactive play is needed to keep them moving."
        ],
        buyingInfo: {
            priceRange: "₹30,000 - ₹60,000",
            kittenCare: [
                "Establish feeding routines early to prevent obesity.",
                "Get them used to nail trimming.",
                "Provide puzzle feeders for mental stimulation.",
                "Give them their own space."
            ],
            checklist: [
                "Check for density of coat (should be crisp).",
                "Verify roundness of head and eyes.",
                "Ensure no signs of respiratory issues."
            ]
        }
    },
    'russian-blue': {
        description: "The Russian Blue is known for its shimmering silver-blue coat and brilliant green eyes. They are gentle, quiet, and intelligent cats who are often shy with strangers but devoted to their family. They are known to fetch and open doors.",
        history: "Believed to have originated in the port of Arkhangelsk, Russia, they were brought to Northern Europe by sailors in the 1860s. They were favored by Russian Czars.",
        temperament: ["Gentle", "Reserved", "Intelligent", "Quiet", "Loyal"],
        careTips: [
            "They thrive on routine and dislike change.",
            "Their short coat requires minimal grooming.",
            "They are very intelligent; establish boundaries.",
            "Keep litter boxes immaculate; they are fastidious."
        ],
        buyingInfo: {
            priceRange: "₹25,000 - ₹45,000",
            kittenCare: [
                "Socialize gently with new people.",
                "Provide high places; they love to observe.",
                "Use wand toys for interactive play.",
                "Maintain a consistent schedule."
            ],
            checklist: [
                "Check for green eyes (may start yellow/halo in kittens).",
                "Verify coat is double and plush.",
                "Ensure kitten is not overly fearful."
            ]
        }
    },
    'great-dane': {
        description: "The Great Dane is known as the 'Apollo of Dogs'. Despite their imposing size, they are gentle giants—sweet, affectionate, and patient with children. They are elegant dogs that require plenty of space but moderate exercise.",
        history: "Originally bred in Germany to hunt wild boar, their ferocity has been bred out over centuries, leaving a gentle soul. They are one of the tallest dog breeds in the world.",
        temperament: ["Gentle", "Friendly", "Patient", "Devoted", "Reserved"],
        careTips: [
            "They grow very fast; nutrition must be carefully managed to prevent joint issues.",
            "Elevated food bowls can help prevent bloat (GDV).",
            "They need soft bedding to prevent calluses on their elbows.",
            "Moderate exercise is needed, but avoid strenuous activity in puppies."
        ],
        buyingInfo: {
            priceRange: "₹30,000 - ₹90,000",
            puppyCare: [
                "Do not over-exercise growing puppies.",
                "Socialize early with other dogs and people.",
                "Start training immediately; they get big fast.",
                "Feed multiple small meals to prevent bloat."
            ],
            checklist: [
                "Check parents for hip dysplasia and heart issues.",
                "Ensure the puppy is not fearful.",
                "Verify the breeder tests for genetic health conditions."
            ]
        }
    },
    'saint-bernard': {
        description: "Saint Bernards are famous for their role as alpine rescue dogs. They are massive, powerful, and incredibly gentle. They are excellent family dogs known for their patience and 'nanny-like' behavior with children.",
        history: "Bred by monks at the Great St. Bernard Pass hospice in the Swiss Alps, they located and saved lost travelers. Their keen sense of smell and direction is legendary.",
        temperament: ["Gentle", "Patient", "Friendly", "Quiet", "Watchful"],
        careTips: [
            "They are sensitive to heat; keep them cool in Indian summers.",
            "Drooling is common; keep a 'slobber cloth' handy.",
            "Regular grooming is needed for their thick double coat.",
            "Training is essential before they become too strong to handle."
        ],
        buyingInfo: {
            priceRange: "₹40,000 - ₹1,00,000",
            puppyCare: [
                "Keep them cool and hydrated.",
                "Limit exercise on hard surfaces to protect joints.",
                "Socialize to prevent shyness.",
                "Feed high-quality large breed puppy food."
            ],
            checklist: [
                "Check for hip and elbow scores.",
                "Ensure eyes are tight (no excessive drooping/ectropion).",
                "Look for a friendly, outgoing temperament."
            ]
        }
    },
    'french-bulldog': {
        description: "The French Bulldog is a charmer with a bat-eared look. They are adaptable, playful, and smart, making them perfect city companions. They don't bark much but are excellent alert dogs.",
        history: "They originated in England as miniature Bulldogs and accompanied lace workers to France during the Industrial Revolution, where they became fashionable society pets.",
        temperament: ["Playful", "Smart", "Adaptable", "Affectionate", "Alert"],
        careTips: [
            "They are prone to heatstroke; keep them in air-conditioning.",
            "Clean their facial folds daily to prevent infection.",
            "Use a harness to protect their neck and airway.",
            "They can't swim well; keep them away from deep water."
        ],
        buyingInfo: {
            priceRange: "₹45,000 - ₹1,20,000",
            puppyCare: [
                "Potty training requires patience.",
                "Socialize early to prevent possessiveness.",
                "Don't over-exert them in play.",
                "Monitor breathing during excitement."
            ],
            checklist: [
                "Check breathing; should not be excessively noisy.",
                "Verify parents are tested for spinal issues.",
                "Check skin and coat condition."
            ]
        }
    },
    'maltese': {
        description: "The Maltese is a toy dog covered from head to foot with a mantle of long, silky, white hair. They are gentle-mannered and affectionate, known for being lively, playful, and fearless despite their small size.",
        history: "An ancient breed from the Mediterranean island of Malta, they have been lap dogs of royalty for centuries. They were favored by Roman ladies and later European queens.",
        temperament: ["Gentle", "Playful", "Affectionate", "Fearless", "Lively"],
        careTips: [
            "Daily brushing is required to prevent mats.",
            "Tear staining is common; clean eyes daily.",
            "They are indoor dogs and can get cold easily.",
            "Dental hygiene is critical for this breed."
        ],
        buyingInfo: {
            priceRange: "₹60,000 - ₹1,50,000",
            puppyCare: [
                "Handle gently; they are fragile.",
                "Feed high-quality food for coat health.",
                "Start grooming habituation early.",
                "Don't baby them too much to avoid 'small dog syndrome'."
            ],
            checklist: [
                "Check for liver shunt history in lines.",
                "Ensure knees (patellas) are stable.",
                "Verify coat quality and pigment."
            ]
        }
    },
    'lhasa-apso': {
        description: "The Lhasa Apso is a non-sporting dog breed originating in Tibet. It was bred as an interior sentinel in the Buddhist monasteries, to alert the monks to any intruders who entered. They are hardy, independent, and wary of strangers.",
        history: "Considered sacred in Tibet, they were never sold but given as gifts of good fortune. They guarded the inner sanctums of monasteries and palaces.",
        temperament: ["Steady", "Fearless", "Assertive", "Devoted", "Aloof with Strangers"],
        careTips: [
            "Their long coat needs frequent grooming.",
            "They have a strong watchdog instinct and will bark.",
            "Early socialization is needed to manage suspicion of strangers.",
            "They are sturdy but watch their back; avoid jumping from heights."
        ],
        buyingInfo: {
            priceRange: "₹15,000 - ₹45,000",
            puppyCare: [
                "Socialize extensively with strangers.",
                "Accustom them to grooming tools.",
                "Establish leadership early.",
                "Monitor ears for infection."
            ],
            checklist: [
                "Check for kidney health history.",
                "Ensure eyes are clear of progressive retinal atrophy.",
                "Verify coat texture."
            ]
        }
    },
    // NEW CATS
    'american-shorthair': {
        description: "The American Shorthair is a true working breed known for its longevity, robust health, and good looks. They are amiable, easy-going cats that are great for families.",
        history: "Descended from cats that came over on the Mayflower to hunt rats, they were working farm cats before becoming show favorites. They are the 'All-American' cat.",
        temperament: ["Easygoing", "Friendly", "Adaptable", "Playful", "Independent"],
        careTips: [
            "They are low maintenance; weekly brushing is enough.",
            "Watch their weight; they love to eat.",
            "Interactive play prevents boredom.",
            "They get along well with other pets."
        ],
        buyingInfo: {
            priceRange: "₹10,000 - ₹40,000",
            kittenCare: [
                "Establish feeding routines to prevent obesity.",
                "Provide plenty of toys.",
                "Socialize with family members.",
                "Scratching posts are a must."
            ],
            checklist: [
                "Check for heart health (HCM).",
                "Ensure coat is dense and hard.",
                "Verify overall vitality."
            ]
        }
    },
    'sphynx': {
        description: "The Sphynx is a hairless cat breed known for its lack of a coat. They are extremely extroverted, energetic, and affectionate, often described as part monkey, part dog, part child, and part cat.",
        history: "A natural genetic mutation found in Toronto in 1966 led to the breed. Contrary to belief, they are not Egyptian but Canadian in origin.",
        temperament: ["Energetic", "Affectionate", "Curious", "Social", "Demanding"],
        careTips: [
            "They need weekly baths to remove oils.",
            "Sun protection is needed if outdoors.",
            "They get cold easily; sweaters may be needed.",
            "Clean ears regularly as they lack hair to block dirt."
        ],
        buyingInfo: {
            priceRange: "₹45,000 - ₹1,20,000+",
            kittenCare: [
                "Get them used to bathing early.",
                "Keep them warm.",
                "Socialize; they need constant company.",
                "Feed high-calorie diet (high metabolism)."
            ],
            checklist: [
                "Check for HCM (heart) history.",
                "Ensure skin is healthy and not irritated.",
                "Verify kitten is eating well."
            ]
        }
    },
    'munchkin': {
        description: "The Munchkin is a small to medium-sized cat characterized by its very short legs, which are caused by a genetic mutation. Despite their short stature, they are fast, energetic, and love to play.",
        history: "The breed's short legs are due to a naturally occurring genetic mutation. They were first introduced to the general public in 1991.",
        temperament: ["Playful", "Outgoing", "Intelligent", "Speedy", "Affectionate"],
        careTips: [
            "They cannot jump as high as other cats; provide steps.",
            "Watch their weight to protect their spine.",
            "Regular grooming depends on coat length.",
            "They run 'ferret-style' and are very fast."
        ],
        buyingInfo: {
            priceRange: "₹30,000 - ₹60,000",
            kittenCare: [
                "Ensure safe play areas (avoid high jumps).",
                "Monitor for any mobility issues.",
                "Socialize with other pets.",
                "Feed balanced diet."
            ],
            checklist: [
                "Check for spinal issues (lordosis).",
                "Ensure breathing is clear (pectus excavatum check).",
                "Verify mobility and energy."
            ]
        }
    }
};

export function getBreedContent(slug: string, type: 'dog' | 'cat' | 'pet'): BreedContent {
    // 1. Check for exact match
    if (BREED_CONTENT[slug]) {
        return BREED_CONTENT[slug];
    }

    // 2. Fallback Template Generator (The "Deep Research" simulator)
    const formatName = (s: string) => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const name = formatName(slug);

    if (type === 'cat') {
        return {
            description: `The ${name} is a beautiful and unique cat breed available for adoption in India. Known for their distinct characteristics, ${name}s make wonderful companions for the right home. Adopting a ${name} gives a deserving cat a second chance at a loving life.`,
            history: `${name}s have a fascinating lineage that contributes to their unique look and personality. While every cat is an individual, this breed is generally cherished for its companionship.`,
            temperament: ["Unique", "Companionable", "Individual"],
            careTips: [
                "Provide a balanced diet suitable for their age.",
                "Ensure fresh water is always available.",
                "Regular vet check-ups are essential for long-term health.",
                "Spend quality time playing to build a strong bond."
            ],
            buyingInfo: {
                priceRange: "₹5,000 - ₹25,000 (Estimated)",
                kittenCare: [
                    "Ensure they are weaned properly (after 8 weeks).",
                    "Keep them indoors to ensure safety.",
                    "Provide a litter box and show them where it is.",
                    "Verify vaccination status."
                ],
                checklist: [
                    "Check for clean eyes and ears.",
                    "Ensure the kitten is active and responsive.",
                    "Verify age (should be 8+ weeks)."
                ]
            }
        };
    }

    // Default Dog Template
    return {
        description: `The ${name} is a distinct dog breed known for its unique qualities. Whether active or laid-back, the ${name} can make a loyal addition to your family. By adopting a ${name}, you are saving a life and gaining a devoted friend.`,
        history: `The history of the ${name} contributes to its current temperament and physical traits. Understanding their background helps in providing the right care and training for these wonderful dogs.`,
        temperament: ["Loyal", "Distinctive", "Companionable"],
        careTips: [
            "Regular exercise is important for their well-being.",
            "A nutritious diet helps maintain a healthy coat and energy.",
            "Training and socialization are key for a well-behaved pet.",
            "Routine vet visits ensure they stay healthy and happy."
        ],
        buyingInfo: {
            priceRange: "₹10,000 - ₹30,000 (Estimated)",
            puppyCare: [
                "Begin socialization early.",
                "Establish a feeding and potty routine.",
                "Use positive reinforcement for training.",
                "Ensure necessary vaccinations are given."
            ],
            checklist: [
                "Check for overall health and energy.",
                "Verify at least first vaccination.",
                "Ask about any breed-specific health issues."
            ]
        }
    };
}
