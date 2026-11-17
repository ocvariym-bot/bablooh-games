export const TARGET_VARIANTS = ['guy', 'girl', 'head'] as const
export type TargetVariant = (typeof TARGET_VARIANTS)[number]
export type SpriteVariant = TargetVariant | 'bomb' | 'sleep'
