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
    const template = getPromptTemplate();
    const params = getAIParams();
    const noGoList = getNoGoList();
    const intensity = userData.intensity || 'adventurous';

    // Collect all the user's selections
    const data = collectUserData(userData);

    // Build prompt with the data
    const prompt = buildPrompt(data, intensity, noGoList, template);

    // Call Ollama via backend
    try {
        const result = await api.generateWithAI(prompt, params);
        return result.text;
    } catch (e) {
        console.error("AI generation error:", e);
        return `Error: ${e.message}\n\n--- Data Sent ---\n${prompt}`;
    }
};

// Collect user selections into simple lists
const collectUserData = (userData) => {
    const isMerged = userData.merged && userData.partnerA && userData.partnerB;

    const extract = (source) => ({
        toys: [...(source.inventory?.wants || []), ...(source.inventory?.okay || [])],
        kinks: [...(source.kinks?.wants || []), ...(source.kinks?.okay || [])],
        outfits: source.outfit?.wants || [],
        settings: source.setting?.wants || [],
        role: source.role || 'Switch'
    });

    if (isMerged) {
        const a = extract(userData.partnerA);
        const b = extract(userData.partnerB);
        return {
            toys: [...new Set([...a.toys, ...b.toys])],
            kinks: [...new Set([...a.kinks, ...b.kinks])],
            outfits: [...new Set([...a.outfits, ...b.outfits])],
            settings: [...new Set([...a.settings, ...b.settings])],
            roles: [a.role, b.role]
        };
    } else {
        const u = extract(userData);
        return {
            toys: u.toys,
            kinks: u.kinks,
            outfits: u.outfits,
            settings: u.settings,
            roles: [u.role]
        };
    }
};

// Build prompt from template or default
const buildPrompt = (data, intensity, noGoList, template) => {
    if (template) {
        // Replace placeholders in custom template
        return template
            .replace('{intensity}', intensity)
            .replace('{participants}', data.roles.join(', '))
            .replace('{all_toys}', data.toys.join(', ') || 'none')
            .replace('{all_kinks}', data.kinks.join(', ') || 'none')
            .replace('{all_wardrobe}', data.outfits.join(', ') || 'none')
            .replace('{all_settings}', data.settings.join(', ') || 'none')
            .replace('{no_go_list}', noGoList.join(', '));
    }

    // Default simple prompt
    return `Write an erotic scene.

Intensity: ${intensity}
Roles: ${data.roles.join(', ')}

Toys: ${data.toys.join(', ') || 'none'}
Kinks: ${data.kinks.join(', ') || 'none'}
Outfits: ${data.outfits.join(', ') || 'none'}
Settings: ${data.settings.join(', ') || 'none'}

Do not include: ${noGoList.join(', ')}`;
};

export const saveNoGoList = (list) => {
    localStorage.setItem('no_go_list', JSON.stringify(list));
};
