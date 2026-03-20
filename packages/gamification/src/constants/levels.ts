import type { LevelDefinition } from '@repo/types'

// Level titles progression
const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Aprendiz',
  3: 'Explorador',
  4: 'Aventureiro',
  5: 'Desafiante',
  6: 'Guerreiro',
  7: 'Herói',
  8: 'Campeão',
  9: 'Mestre',
  10: 'Grão-Mestre',
  15: 'Lenda',
  20: 'Épico',
  25: 'Mítico',
  30: 'Divino',
  40: 'Imortal',
  50: 'Ascendido',
}

function getTitleForLevel(level: number): string {
  // Find the closest title at or below current level
  const defined = Object.keys(LEVEL_TITLES)
    .map(Number)
    .filter((l) => l <= level)
    .sort((a, b) => b - a)
  return defined.length > 0 ? LEVEL_TITLES[defined[0]!]! : 'Iniciante'
}

// Formula: xpRequired(n) = 100 * n * (n + 1) / 2
// So level 1 requires 0 XP (already at level 1 on creation)
// level 2 requires 100 + 200 = 300 XP total... wait, spec says:
// level 1: xpRequired 0, xpToNext 100
// level 2: xpRequired 100, xpToNext 200
// Actually formula for xpRequired = sum of xpToNext for previous levels
// xpToNext(n) = 100 * n  (so level 1 xpToNext=100, level 2 xpToNext=200...)
// xpRequired(n) = sum_{i=1}^{n-1} 100*i = 100 * (n-1)*n/2
// xpRequired(1) = 0, xpRequired(2) = 100, xpRequired(3) = 300, etc.

function buildLevelTable(): LevelDefinition[] {
  const table: LevelDefinition[] = []
  for (let n = 1; n <= 50; n++) {
    const xpRequired = n === 1 ? 0 : (100 * (n - 1) * n) / 2
    const xpToNext = n < 50 ? 100 * n : 0 // level 50 has no next level
    table.push({
      level: n,
      xpRequired,
      xpToNext,
      title: getTitleForLevel(n),
    })
  }
  return table
}

export const LEVEL_TABLE: LevelDefinition[] = buildLevelTable()
