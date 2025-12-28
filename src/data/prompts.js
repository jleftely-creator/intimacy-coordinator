// Default hard limits - users can customize
export const DEFAULT_NO_GO_LIST = [
    'crossdressing',
    'feet',
    'scat',
    'watersports',
    'ears',
    'chastity',
    'infantilism',
    'blood',
    'animals',
    'minors',
    'necro',
    'incest',
    'public exposure (illegal)',
    'non-consent (real)'
];

export const TONE_MODIFIERS = {
    casual: "TONE: Playful, romantic, sensual, slow-burn. Sweet but steamy. Focus on connection.",
    adventurous: "TONE: Exciting, experimental, moderate intensity. Push boundaries safely. Balance sensation with control.",
    weird: "TONE: Surreal, fetish-heavy, psychological intensity. Embrace the unconventional. Creative and specific.",
    demon: "TONE: FERAL. ANIMALISTIC. AGGRESSIVE. DISORIENTING. HIGH ADRENALINE. NO FLOWERY LANGUAGE. Raw, primal, overwhelming. CHAOS REIGNS. PUSH LIMITS."
};

export const SCENE_PROMPT_TEMPLATE = `Write an erotic scene using the following:

ROLES: {participants}

TOYS: {all_toys}

OUTFITS: {all_wardrobe}

SETTINGS: {all_settings}

KINKS: {all_kinks}

DO NOT INCLUDE: {no_go_list}

INTENSITY: {intensity}`;

export const PREMADE_SCENARIOS = [
    {
        id: "first_time_dom",
        name: "First Time Dominating",
        description: "Gentle introduction to power exchange",
        defaults: { intensity: "casual", kinks: ["domination", "praise"] }
    },
    {
        id: "sensory_overload",
        name: "Sensory Overload",
        description: "Multi-sensation exploration",
        defaults: { intensity: "adventurous", kinks: ["sensation play", "edging", "blindfold"] }
    },
    {
        id: "primal_hunt",
        name: "Primal Hunt",
        description: "Predator/prey roleplay",
        defaults: { intensity: "demon", kinks: ["rough handling", "chase", "takedown"] }
    }
];
