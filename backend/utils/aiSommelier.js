import { db } from '../data/db.js';

export function consultAiSommelier({ message = '', conversationHistory = [], collectedPreferences = {} }) {
  const storeProducts = db.getProducts({ limit: 100 });
  const userText = (message || '').toLowerCase();

  const prefs = {
    occasion: collectedPreferences.occasion || null,
    family: collectedPreferences.family || null,
    preferredNotes: Array.isArray(collectedPreferences.preferredNotes) ? [...collectedPreferences.preferredNotes] : [],
    intensity: collectedPreferences.intensity || null,
    vibe: collectedPreferences.vibe || null,
    season: collectedPreferences.season || null
  };

  // 1. Keyword extraction from user message
  // Occasions
  if (userText.includes('daily') || userText.includes('everyday') || userText.includes('casual') || userText.includes('signature')) {
    prefs.occasion = 'Daily Wear';
  } else if (userText.includes('office') || userText.includes('work') || userText.includes('meeting') || userText.includes('professional')) {
    prefs.occasion = 'Office';
  } else if (userText.includes('date') || userText.includes('romance') || userText.includes('romantic') || userText.includes('dinner')) {
    prefs.occasion = 'Date Night';
  } else if (userText.includes('gala') || userText.includes('evening') || userText.includes('party') || userText.includes('formal') || userText.includes('black tie') || userText.includes('celebration')) {
    prefs.occasion = 'Evening Gala';
  } else if (userText.includes('summer') || userText.includes('vacation') || userText.includes('beach') || userText.includes('holiday')) {
    prefs.occasion = 'Summer Vacation';
  }

  // Families
  if (userText.includes('woody') || userText.includes('wood') || userText.includes('forest') || userText.includes('tree')) {
    prefs.family = 'Woody';
  } else if (userText.includes('citrus') || userText.includes('lemon') || userText.includes('bergamot') || userText.includes('orange')) {
    prefs.family = 'Citrus';
  } else if (userText.includes('floral') || userText.includes('rose') || userText.includes('flower') || userText.includes('jasmine')) {
    prefs.family = 'Floral';
  } else if (userText.includes('oriental') || userText.includes('amber') || userText.includes('saffron') || userText.includes('arabic')) {
    prefs.family = 'Oriental';
  } else if (userText.includes('aquatic') || userText.includes('ocean') || userText.includes('marine') || userText.includes('sea')) {
    prefs.family = 'Aquatic';
  } else if (userText.includes('gourmand') || userText.includes('vanilla') || userText.includes('sweet') || userText.includes('caramel') || userText.includes('almond')) {
    prefs.family = 'Gourmand';
  } else if (userText.includes('leather') || userText.includes('tobacco') || userText.includes('smoke') || userText.includes('spicy')) {
    prefs.family = 'Spicy';
  }

  // Notes extraction
  const potentialNotes = [
    'oud', 'rose', 'jasmine', 'vanilla', 'lemon', 'bergamot', 'grapefruit', 
    'sandalwood', 'cedarwood', 'patchouli', 'saffron', 'cardamom', 'amber', 
    'sea salt', 'driftwood', 'hinoki', 'iris', 'tonka bean', 'tobacco', 'vetiver', 'musk'
  ];
  for (const n of potentialNotes) {
    if (userText.includes(n) && !prefs.preferredNotes.includes(n)) {
      prefs.preferredNotes.push(n);
    }
  }

  // Intensity
  if (userText.includes('subtle') || userText.includes('light') || userText.includes('soft') || userText.includes('skin scent') || userText.includes('intimate')) {
    prefs.intensity = 'Subtle';
  } else if (userText.includes('moderate') || userText.includes('balanced') || userText.includes('medium')) {
    prefs.intensity = 'Moderate';
  } else if (userText.includes('intense') || userText.includes('strong') || userText.includes('heavy') || userText.includes('long lasting') || userText.includes('beast')) {
    prefs.intensity = 'Intense';
  }

  // Vibes
  if (userText.includes('mysterious') || userText.includes('dark') || userText.includes('enchanting')) {
    prefs.vibe = 'Mysterious';
  } else if (userText.includes('fresh') || userText.includes('clean') || userText.includes('uplifting') || userText.includes('crisp')) {
    prefs.vibe = 'Crisp & Refreshing';
  } else if (userText.includes('cozy') || userText.includes('comforting') || userText.includes('warm')) {
    prefs.vibe = 'Warm & Enveloping';
  } else if (userText.includes('opulent') || userText.includes('regal') || userText.includes('luxury') || userText.includes('expensive')) {
    prefs.vibe = 'Opulent & Regal';
  }

  // Scoring algorithm for all products
  const scored = storeProducts.map(prod => {
    let score = 50; // base score
    const reasons = [];

    // Family match
    if (prefs.family) {
      if (prod.fragranceFamily.toLowerCase() === prefs.family.toLowerCase()) {
        score += 30;
        reasons.push(`Masterfully showcases the ${prod.fragranceFamily} olfactory family.`);
      } else if ((prod.secondaryFamilies || []).some(f => f.toLowerCase() === prefs.family.toLowerCase())) {
        score += 20;
        reasons.push(`Enriched with subtle ${prefs.family} nuances.`);
      }
    }

    // Occasion match
    if (prefs.occasion) {
      const matchOcc = (prod.occasions || []).some(o => o.toLowerCase().includes(prefs.occasion.toLowerCase()));
      if (matchOcc) {
        score += 20;
        reasons.push(`Ideally suited for ${prefs.occasion}.`);
      }
    }

    // Intensity match
    if (prefs.intensity) {
      if ((prod.intensity || '').toLowerCase().includes(prefs.intensity.toLowerCase())) {
        score += 15;
        reasons.push(`Delivers your preferred ${prod.intensity} presence and projection.`);
      }
    }

    // Vibe match
    if (prefs.vibe) {
      const charMatch = (prod.characterDescriptors || []).some(c => 
        prefs.vibe.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(prefs.vibe.toLowerCase())
      );
      if (charMatch) {
        score += 15;
        reasons.push(`Expresses your desired ${prefs.vibe} aura.`);
      }
    }

    // Preferred notes match
    const prodNoteNames = [
      ...(prod.notes?.top || []),
      ...(prod.notes?.heart || []),
      ...(prod.notes?.base || [])
    ].map(n => (typeof n === 'string' ? n : n.name).toLowerCase());

    const matchedNotes = prefs.preferredNotes.filter(pn => 
      prodNoteNames.some(pnn => pnn.includes(pn.toLowerCase()))
    );

    if (matchedNotes.length > 0) {
      score += Math.min(25, matchedNotes.length * 10);
      reasons.push(`Featuring key notes of ${matchedNotes.join(', ')}.`);
    }

    // Normalize score to percentage (max 99%)
    const matchPercentage = Math.min(99, Math.max(68, Math.round(score)));

    return {
      product: prod,
      matchPercentage,
      reasons: reasons.length > 0 ? reasons : [`Harmonizes elegantly with your aesthetic profile.`]
    };
  });

  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
  const topRecommendations = scored.slice(0, 3);

  // Generate Sommelier Response
  let reply = '';
  let quickChips = [];
  let isFinal = false;

  const hasOccasion = Boolean(prefs.occasion);
  const hasFamilyOrNote = Boolean(prefs.family || prefs.preferredNotes.length > 0);
  const hasIntensity = Boolean(prefs.intensity);

  // Determine stage of consultation
  if (!hasOccasion && !hasFamilyOrNote && !hasIntensity) {
    reply = "Enchanté. I am your Atelier AI Sommelier. Welcome to the private olfactory salon of Vibe Perfume. Allow me to tailor a bespoke fragrance prescription for your personal skin chemistry and mood.\n\nTo begin our journey, **what occasion, setting, or moment are you selecting this fragrance for?**";
    quickChips = [
      "Daily Signature Scent",
      "Romantic Date Night",
      "Executive Boardroom / Office",
      "Evening Gala & Special Occasion",
      "Summer Vacation & Mediterranean Escape"
    ];
  } else if (hasOccasion && !hasFamilyOrNote) {
    reply = `Exquisite choice. For **${prefs.occasion}**, the right fragrance creates an unforgettable aura.\n\nNow, **what olfactory families or fragrance character do you naturally gravitate towards?**`;
    quickChips = [
      "Crisp Citrus & Sparkling Fruits",
      "Opulent Cambodian Oud & Amber",
      "Velvety Romantic Rose & White Florals",
      "Comforting Bourbon Vanilla & Gourmand",
      "Oceanic Mineral & Salty Sea Mist",
      "Japanese Hinoki Woods & Green Botanicals"
    ];
  } else if ((hasOccasion || hasFamilyOrNote) && !hasIntensity) {
    const focus = prefs.family ? `${prefs.family} palette` : (prefs.occasion || 'your requested setting');
    reply = `Magnifique. Embracing the **${focus}** will evoke breathtaking elegance.\n\nOne final refinement: **how would you like your fragrance to announce your presence?**`;
    quickChips = [
      "Subtle & Intimate (Close Skin Scent)",
      "Balanced & Refined (Moderate Sillage)",
      "Commanding & Unapologetic (Enormous Projection)"
    ];
  } else {
    // We have sufficient preferences to present a definitive recommendation!
    isFinal = true;
    const topMatch = topRecommendations[0];
    const topName = topMatch.product.name;
    const topBrand = topMatch.product.brandName;
    const family = topMatch.product.fragranceFamily;

    reply = `Based on your desire for **${prefs.occasion || 'exceptional elegance'}** paired with a **${prefs.family || 'rich olfactory'}** profile and **${prefs.intensity || 'balanced'}** presence, I have composed your personal Haute Parfumerie recommendation.\n\nYour pinnacle signature match is **${topName} by ${topBrand}** (${topMatch.matchPercentage}% Olfactory Affinity). It opens with brilliant architectural clarity and dries down into a lingering, unforgettable presence. Explore your matches below:`;
    
    quickChips = [
      "Tell me more about the base notes",
      "Compare with another recommendation",
      "Recommend something fresher",
      "Start a new consultation"
    ];
  }

  return {
    reply,
    isFinal,
    collectedPreferences: prefs,
    recommendations: topRecommendations.map(r => ({
      ...r.product,
      matchPercentage: r.matchPercentage,
      sommelierRationale: r.reasons.join(' ')
    })),
    quickChips
  };
}
