import React from 'react';
import { AlertCircle, CheckCircle, Heart, Lightbulb } from 'lucide-react';

// ================= Educational Resource Content =================

export function TrainingTips({ species }) {
  const petType = species?.toLowerCase();

  return (
    <div className="space-y-6">
      {/* DOG TRAINING */}
      {petType === 'dog' && (
        <div className="space-y-6">
          {/* Basic Commands */}
          <Section
            icon="🎯"
            title="Basic Commands"
            color="blue"
          >
            <TipCard
              title="Sit"
              description="Hold a treat above your dog's nose and move it back over their head. As their bottom touches the ground, say 'sit' and reward immediately."
            />
            <TipCard
              title="Stay"
              description="Start with your dog sitting. Hold your hand up and say 'stay'. Take a step back and reward if they don't move. Gradually increase distance."
            />
            <TipCard
              title="Come"
              description="In a safe area, squat down and enthusiastically call your dog's name followed by 'come'. Reward generously when they reach you."
            />
          </Section>

          {/* Behavior Training */}
          <Section
            icon="🐾"
            title="Behavior & Socialization"
            color="green"
          >
            <ul className="space-y-3 text-gray-700">
              <ListItem>Start socialization early - expose your dog to different people, animals, and environments in a positive way</ListItem>
              <ListItem>Address problem behaviors like jumping or barking immediately with redirection, not punishment</ListItem>
              <ListItem>Use crate training to create a safe space and assist with house training</ListItem>
              <ListItem>Practice leash training in low-distraction areas before moving to busier locations</ListItem>
            </ul>
          </Section>

          {/* Tips & Best Practices */}
          <InfoBox
            icon={<Lightbulb className="w-5 h-5" />}
            title="Training Best Practices"
          >
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Keep sessions short (5-10 minutes) to maintain focus</li>
              <li>• Always end on a positive note with a command they know</li>
              <li>• Use high-value treats for difficult commands</li>
              <li>• Be patient - some dogs learn faster than others</li>
              <li>• Consistency is key - use the same words and gestures</li>
            </ul>
          </InfoBox>
        </div>
      )}

      {/* CAT TRAINING */}
      {petType === 'cat' && (
        <div className="space-y-6">
          {/* Litter Box Training */}
          <Section
            icon="🚽"
            title="Litter Box Training"
            color="purple"
          >
            <ul className="space-y-3 text-gray-700">
              <ListItem>Place the litter box in a quiet, accessible location away from food and water</ListItem>
              <ListItem>Use unscented, clumping litter and keep the box clean (scoop daily)</ListItem>
              <ListItem>Have one box per cat, plus one extra as a general rule</ListItem>
              <ListItem>Show kittens where the box is and place them in it after meals</ListItem>
            </ul>
          </Section>

          {/* Scratching & Behavior */}
          <Section
            icon="🪵"
            title="Scratching Post Training"
            color="orange"
          >
            <TipCard
              title="Placement"
              description="Position scratching posts near where your cat sleeps and in areas they already scratch. Cats like to stretch and scratch after waking."
            />
            <TipCard
              title="Material"
              description="Provide different textures - sisal rope, cardboard, and carpet. Observe which your cat prefers and offer more of that type."
            />
            <TipCard
              title="Encouragement"
              description="Use catnip to attract them to the post. When they use it, reward with treats and affection. Never punish for scratching furniture."
            />
          </Section>

          {/* Tips */}
          <InfoBox
            icon={<Heart className="w-5 h-5" />}
            title="Understanding Cat Behavior"
          >
            <p className="text-sm text-gray-700 mb-3">
              Cats are independent but trainable with patience and respect for their nature:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Training sessions should be 2-5 minutes maximum</li>
              <li>• Use positive reinforcement - cats don't respond well to punishment</li>
              <li>• Respect their boundaries and don't force interaction</li>
              <li>• Play is a great training tool - use interactive toys</li>
              <li>• Create vertical spaces for climbing and observation</li>
            </ul>
          </InfoBox>
        </div>
      )}

      {/* FALLBACK */}
      {!petType && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Training tips will appear once pet type is available.</p>
        </div>
      )}
    </div>
  );
}

export function NutritionTips() {
  return (
    <div className="space-y-6">
      {/* Feeding Guidelines */}
      <Section
        icon="🍽️"
        title="Feeding Guidelines"
        color="green"
      >
        <TipCard
          title="Portion Control"
          description="Follow feeding guidelines on pet food packaging based on your pet's weight. Adjust portions if your pet is gaining or losing weight. Measure food accurately."
        />
        <TipCard
          title="Meal Schedule"
          description="Feed adult dogs 1-2 times daily. Cats prefer smaller, more frequent meals (2-4 times daily). Puppies and kittens need 3-4 meals per day."
        />
        <TipCard
          title="Fresh Water"
          description="Always provide clean, fresh water. Change water daily and wash bowls regularly. Consider a pet fountain to encourage drinking."
        />
      </Section>

      {/* Food Safety */}
      <Section
        icon="⚠️"
        title="Foods to Avoid"
        color="red"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h6 className="font-semibold text-red-900 mb-2">Toxic Foods</h6>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Chocolate and caffeine</li>
              <li>• Grapes and raisins</li>
              <li>• Onions and garlic</li>
              <li>• Xylitol (artificial sweetener)</li>
              <li>• Alcohol</li>
              <li>• Macadamia nuts</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h6 className="font-semibold text-yellow-900 mb-2">Use Caution</h6>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Dairy products (may cause upset stomach)</li>
              <li>• Raw eggs and meat</li>
              <li>• Bones (choking hazard)</li>
              <li>• Fatty foods</li>
              <li>• Salty snacks</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Nutrition Tips */}
      <Section
        icon="✨"
        title="Nutrition Best Practices"
        color="blue"
      >
        <ul className="space-y-3 text-gray-700">
          <ListItem>Choose high-quality pet food appropriate for your pet's life stage (puppy/kitten, adult, senior)</ListItem>
          <ListItem>Look for foods with real meat as the first ingredient and avoid excessive fillers</ListItem>
          <ListItem>Treats should make up no more than 10% of daily caloric intake</ListItem>
          <ListItem>Transition to new foods gradually over 7-10 days to avoid digestive upset</ListItem>
          <ListItem>Monitor your pet's body condition - you should be able to feel ribs but not see them prominently</ListItem>
          <ListItem>Consult your vet about special dietary needs for health conditions</ListItem>
        </ul>
      </Section>

      {/* Info Box */}
      <InfoBox
        icon={<CheckCircle className="w-5 h-5" />}
        title="Signs of Good Nutrition"
      >
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium mb-2">Physical Signs:</p>
            <ul className="space-y-1">
              <li>• Shiny, healthy coat</li>
              <li>• Bright, clear eyes</li>
              <li>• Healthy weight</li>
              <li>• Good energy levels</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Behavioral Signs:</p>
            <ul className="space-y-1">
              <li>• Consistent appetite</li>
              <li>• Regular bowel movements</li>
              <li>• Active and playful</li>
              <li>• Good dental health</li>
            </ul>
          </div>
        </div>
      </InfoBox>
    </div>
  );
}

export function OwnershipTips() {
  return (
    <div className="space-y-6">
      {/* Healthcare */}
      <Section
        icon="🏥"
        title="Healthcare & Wellness"
        color="blue"
      >
        <TipCard
          title="Regular Vet Visits"
          description="Schedule annual check-ups for adult pets, twice yearly for seniors. Keep vaccination records updated. Don't skip dental cleanings - dental health affects overall health."
        />
        <TipCard
          title="Preventive Care"
          description="Stay current on flea, tick, and heartworm prevention year-round. Discuss spaying/neutering benefits with your vet. Watch for changes in behavior, appetite, or energy."
        />
        <TipCard
          title="Emergency Preparedness"
          description="Keep your vet's emergency number handy. Know the location of 24-hour emergency clinics. Have a pet first-aid kit with essentials like bandages, gauze, and antiseptic."
        />
      </Section>

      {/* Daily Care */}
      <Section
        icon="🏠"
        title="Daily Care & Environment"
        color="green"
      >
        <ul className="space-y-3 text-gray-700">
          <ListItem>Provide a comfortable, clean sleeping area away from drafts and noise</ListItem>
          <ListItem>Groom regularly - brush coat, trim nails, clean ears, and maintain dental hygiene</ListItem>
          <ListItem>Exercise daily based on your pet's breed and age (30-60 minutes for dogs, 15-30 minutes of play for cats)</ListItem>
          <ListItem>Keep living areas clean and free from hazards like toxic plants, chemicals, and small objects</ListItem>
          <ListItem>Maintain a consistent daily routine for feeding, walks, and playtime</ListItem>
        </ul>
      </Section>

      {/* Mental Stimulation */}
      <Section
        icon="🧠"
        title="Mental Stimulation & Enrichment"
        color="purple"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h6 className="font-semibold text-gray-900 mb-3">For Dogs</h6>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Rotate toys to keep interest high</li>
              <li>• Use puzzle feeders and treat-dispensing toys</li>
              <li>• Teach new tricks regularly</li>
              <li>• Provide socialization with other dogs</li>
              <li>• Vary walking routes for new smells</li>
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h6 className="font-semibold text-gray-900 mb-3">For Cats</h6>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Offer vertical spaces and window perches</li>
              <li>• Provide interactive toys and laser pointers</li>
              <li>• Hide treats around the house</li>
              <li>• Use catnip and silvervine</li>
              <li>• Create hunting opportunities with play</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Legal & Financial */}
      <Section
        icon="📋"
        title="Legal & Financial Responsibilities"
        color="orange"
      >
        <ul className="space-y-3 text-gray-700">
          <ListItem>Register your pet with local authorities and keep licenses current</ListItem>
          <ListItem>Microchip your pet and keep contact information updated</ListItem>
          <ListItem>Consider pet insurance to help manage unexpected medical costs</ListItem>
          <ListItem>Budget for routine expenses: food, supplies, vet visits, grooming</ListItem>
          <ListItem>Keep emergency funds for unexpected veterinary care</ListItem>
          <ListItem>Understand breed-specific regulations in your area</ListItem>
        </ul>
      </Section>

      {/* Long-term Commitment */}
      <InfoBox
        icon={<Heart className="w-5 h-5" />}
        title="A Lifetime Commitment"
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          Pet ownership is a commitment that can last 10-20 years or more. Your pet depends on you for everything - 
          food, shelter, healthcare, love, and companionship. Be prepared for changes in your life circumstances 
          and always prioritize your pet's wellbeing. Consider who will care for your pet if you're unable to. 
          The bond you build with your pet is one of life's most rewarding experiences when approached with 
          dedication and love.
        </p>
      </InfoBox>
    </div>
  );
}

// ================= Helper Components =================

function Section({ icon, title, color, children }) {
  const colorStyles = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`rounded-xl border-2 ${colorStyles[color]} p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function TipCard({ title, description }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h5 className="font-semibold text-gray-900 mb-2">{title}</h5>
      <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

function ListItem({ children }) {
  return (
    <li className="flex gap-3">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function InfoBox({ icon, title, children }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#FF8C42] rounded-lg flex items-center justify-center text-white">
          {icon}
        </div>
        <h5 className="font-bold text-gray-900">{title}</h5>
      </div>
      {children}
    </div>
  );
}