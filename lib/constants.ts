export const STALE_TIME = {
    DEFAULT: 60 * 1000,
    AUTH: Infinity,
    FAVORITES: 5 * 60 * 1000,
    WALLPAPERS: Infinity,
    CATEGORIES: Infinity,
    ZERO: 0,
} as const;

export const INFINITE_SCROLL = {
    BATCH_SIZE: 32,
} as const;

export const IMAGE_CONFIG = {
    THUMBNAIL_WIDTH: 500,
    MODAL_WIDTH: 1200,
    THUMBNAIL_QUALITY: 80,
    MODAL_QUALITY: 85,
} as const;

export const LIMITS = {
    MIN_PASSWORD_LENGTH: 6,
    MAX_DISPLAY_NAME_LENGTH: 30,
} as const;

export const WALLPAPER_CATEGORIES = [
    { id: 'anime', name: 'Anime', emoji: '🎌' },
    { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🤖' },
    { id: 'landscape', name: 'Landscape', emoji: '🏞️' },
    { id: 'neon city', name: 'Neon City', emoji: '🌃' },
    { id: 'minimalist', name: 'Minimalist', emoji: '✨' },
    { id: 'space', name: 'Space', emoji: '🌌' },
    { id: 'dark fantasy', name: 'Dark Fantasy', emoji: '🐉' },
    { id: 'abstract', name: 'Abstract', emoji: '🎨' },
    { id: 'car', name: 'Car', emoji: '🚗' },
    { id: 'nature', name: 'Nature', emoji: '🌿' },
    { id: 'animal', name: 'Animal', emoji: '🦁' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮' },
    { id: 'horror', name: 'Horror', emoji: '👻' },
    { id: 'skull', name: 'Skull', emoji: '💀' },
    { id: 'robot', name: 'Robot', emoji: '🦾' },
    { id: 'forest', name: 'Forest', emoji: '🌲' },
    { id: 'mountain', name: 'Mountain', emoji: '🏔️' },
    { id: 'ocean', name: 'Ocean', emoji: '🌊' },
    { id: 'pixel art', name: 'Pixel Art', emoji: '👾' },
    { id: 'street photography', name: 'Street', emoji: '🏙️' },
    { id: 'sunset', name: 'Sunset', emoji: '🌅' },
    { id: 'flower', name: 'Flower', emoji: '🌸' },
    { id: 'cat', name: 'Cat', emoji: '🐱' },
    { id: 'dog', name: 'Dog', emoji: '🐶' },
    { id: 'sword', name: 'Sword', emoji: '⚔️' },
    { id: 'warrior', name: 'Warrior', emoji: '🗡️' },
    { id: 'architecture', name: 'Architecture', emoji: '🏗️' },
    { id: 'black and white', name: 'B&W', emoji: '⚫' },
    { id: 'rain', name: 'Rain', emoji: '🌧️' },
    { id: 'snow', name: 'Snow', emoji: '❄️' },
    { id: 'vintage', name: 'Vintage', emoji: '📜' },
    { id: 'sci-fi', name: 'Sci-Fi', emoji: '👽' },
] as const;
