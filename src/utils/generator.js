import { DEFAULT_NO_GO_LIST } from '../data/prompts';
import { getPromptTemplate, getAIParams } from '../components/PromptEditor';
import api from './api';

// Get the user's no-go list from localStorage
const getNoGoList = () => {
    const saved = localStorage.getItem('no_go_list');
    return saved ? JSON.parse(saved) : DEFAULT_NO_GO_LIST;
};

// Main generator - collects data and calls Ollama via backend
export const generateScene = async (userData) => {
    const template = getPromptTemplate() || null;
    const params = { ...getAIParams(), model: userData.model };
    const noGoList = getNoGoList();
    const intensity = userData.intensity || 'adventurous';

    // Collect all the user's selections
    const data = collectUserData(userData);

    // Build prompt with the data
    const prompt = buildPrompt(data, intensity, noGoList, template);

    // Call Ollama via backend
    try {
        const result = await api.generateWithAI(prompt, params);
        return {
            text: result.text,
            prompt,
            debugData: data
        };
    } catch (e) {
        console.error("AI generation error:", e);
        return {
            text: `Error: ${e.message}`,
            prompt,
            debugData: data,
            isError: true
        };
    }
};

// Build prompt from template or default
const buildPrompt = (data, intensity, noGoList, template) => {
    // Helper to format lists with differentiation
    const formatList = (category) => {
        if (!category) return 'none';

        // Handle backward compatibility or flat arrays
        if (Array.isArray(category)) return category.join(', ') || 'none';

        const parts = [];
        // STRICT ORDERING: Preferred items MUST come first
        if (category.wants?.length) {
            parts.push(`PREFERRED (Must Include): ${category.wants.join(', ')}`);
        }
        if (category.okay?.length) {
            parts.push(`ACCEPTED (Optional): ${category.okay.join(', ')}`);
        }

        return parts.length ? parts.join('\n') : 'none';
    };

    // Flatten now uses formatList to preserve prioritization in Custom Templates too
    const flatten = (category) => formatList(category);

    if (template) {
        // Replace placeholders in custom template
        return template
            .replace('{intensity}', intensity)
            .replace('{participants}', data.roles.join(', '))
            .replace('{all_toys}', flatten(data.toys) || 'none')
            .replace('{all_kinks}', flatten(data.kinks) || 'none')
            .replace('{all_wardrobe}', flatten(data.outfits) || 'none')
            .replace('{all_settings}', flatten(data.settings) || 'none')
            .replace('{no_go_list}', noGoList.join(', '));
    }

    // Default simple prompt - Narrative Style
    return `Write an erotic scene incorporating the following elements.

[INVENTORY & PREFERENCES]
Toys:
${formatList(data.toys)}

Kinks:
${formatList(data.kinks)}

Outfits:
${formatList(data.outfits)}

Settings:
${formatList(data.settings)}

[SCENE CONFIGURATION]
Intensity Level: ${intensity}
Roles/Dynamics: ${data.roles.join(', ')}

[RESTRICTIONS]
Strictly avoid: ${noGoList.join(', ')}`;
};

// Collect user selections into structured lists
const collectUserData = (userData) => {
    const isMerged = userData.merged && userData.partnerA && userData.partnerB;

    const extract = (source, defaultRole = 'Switch') => ({
        toys: { wants: source.inventory?.wants || [], okay: source.inventory?.okay || [] },
        kinks: { wants: source.kinks?.wants || [], okay: source.kinks?.okay || [] },
        outfits: { wants: source.outfit?.wants || [], okay: source.outfit?.okay || [] },
        settings: { wants: source.setting?.wants || [], okay: source.setting?.okay || [] },
        role: source.role || defaultRole,
        name: source.name || 'Partner'
    });

    if (isMerged) {
        const a = extract(userData.partnerA, 'Partner A');
        const b = extract(userData.partnerB, 'Partner B');

        const nameA = userData.partnerA.name || 'Partner A';
        const nameB = userData.partnerB.name || 'Partner B';

        // Helper to merge categories unique
        const mergeCat = (catA, catB) => ({
            wants: [...new Set([...catA.wants, ...catB.wants])],
            okay: [...new Set([...catA.okay, ...catB.okay])]
        });

        return {
            toys: mergeCat(a.toys, b.toys),
            kinks: mergeCat(a.kinks, b.kinks),
            outfits: mergeCat(a.outfits, b.outfits),
            settings: mergeCat(a.settings, b.settings),
            roles: [`${nameA} (${a.role})`, `${nameB} (${b.role})`],
            partnerNames: { A: nameA, B: nameB }
        };
    } else {
        const u = extract(userData, 'Solo');
        return {
            toys: u.toys,
            kinks: u.kinks,
            outfits: u.outfits,
            settings: u.settings,
            roles: [`${u.role}`],
            partnerNames: { A: 'User', B: 'None' }
        };
    }
};

export const saveNoGoList = (list) => {
    localStorage.setItem('no_go_list', JSON.stringify(list));
};
