import { FOOD_CONFIG } from '../characters/FoodConfig';

export class TextureMapper {
  static getTierFromLabel(label: string): number {
    return parseInt(label.split('_')[0], 10);
  }

  static getLabelFromTier(tier: number): string {
    return FOOD_CONFIG[tier]?.name || "00_Klepon";
  }

  static isValidTier(tier: number): boolean {
    return tier >= 0 && tier <= 7;
  }
}
