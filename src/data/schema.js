export const SETTING_SCHEMA = {
    "furniture": {
        items: [
            "bed (king)",
            "bed (queen)",
            "sex swing",
            "spanking bench",
            "St. Andrew's cross",
            "suspension rig",
            "cage",
            "sling",
            "queening chair",
            "mirror wall"
        ]
    },
    "environment": {
        items: [
            "bedroom",
            "dungeon",
            "hotel room",
            "outdoor (private)",
            "office",
            "bathroom/shower",
            "living room",
            "basement",
            "rooftop"
        ]
    },
    "lighting": {
        items: [
            "candlelight",
            "dim red",
            "blacklight",
            "natural light",
            "complete darkness",
            "strobing"
        ]
    }
};

export const INVENTORY_SCHEMA = {
    "restraints & bondage": {
        subcategories: {
            wrists: {
                items: ["leather cuffs", "metal handcuffs", "rope (jute)", "rope (silk)", "velcro straps", "tape"]
            },
            ankles: {
                items: ["ankle cuffs", "spreader bar", "hobble belt"]
            },
            full: {
                items: ["hogtie kit", "body harness", "straitjacket", "vacuum bed", "mummification wrap"]
            }
        }
    },
    "impact": {
        items: ["paddle (leather)", "paddle (wood)", "flogger", "cane", "crop", "whip", "hand"]
    },
    "sensation": {
        items: ["wartenberg wheel", "ice cubes", "wax candles", "feather", "blindfold", "earplugs", "electro kit"]
    },
    "penetration": {
        items: ["dildo", "vibrator", "butt plug", "anal beads", "double-ended", "strap-on", "fucking machine"]
    },
    "gags & masks": {
        items: ["ball gag", "ring gag", "bit gag", "spider gag", "hood (leather)", "hood (latex)", "blindfold"]
    },
    "clamps & pumps": {
        items: ["nipple clamps", "clit clamp", "suction cups", "breast pump", "penis pump"]
    }
};

export const OUTFIT_SCHEMA = {
    "materials": {
        items: ["latex", "leather", "lace", "mesh", "pvc", "silk", "satin", "velvet"]
    },
    "lingerie": {
        items: ["corset", "garter belt", "stockings", "thong", "bodysuit", "bralette", "babydoll"]
    },
    "costumes": {
        items: ["maid", "nurse", "schoolgirl", "secretary", "cop", "firefighter", "military", "superhero"]
    },
    "accessories": {
        items: ["collar", "leash", "heels", "boots", "gloves", "choker", "masks"]
    },
    "minimal": {
        items: ["naked", "underwear only", "robe", "towel"]
    }
};

export const KINK_SCHEMA = {
    "power exchange": {
        items: ["domination", "submission", "service", "worship", "humiliation", "degradation", "praise", "discipline"]
    },
    "roleplay": {
        items: ["boss/employee", "teacher/student", "stranger", "intruder", "pet play", "age play (adults)", "medical", "interrogation"]
    },
    "physical": {
        items: ["biting", "scratching", "choking (breath play)", "face slapping", "spitting", "hair pulling", "rough handling"]
    },
    "psychological": {
        items: ["edging", "denial", "forced orgasm", "overstimulation", "mind games", "anticipation", "surprise"]
    },
    "exhibition & voyeurism": {
        items: ["watching", "being watched", "public play", "recording", "photos", "mirror play"]
    }
};
