import { evaluateAsset } from './evaluateAsset'
import type { Asset, Category, Condition, Snapshot } from './types'

export function buildDashboard(snapshot: Snapshot) {
  const evaluated = snapshot.assets.map(asset => ({ ...asset, ...evaluateAsset(asset, snapshot, snapshot.now) }))
  const counts: Record<Condition, number> = { Normal: 0, Attention: 0, Critical: 0, Unknown: 0 }
  evaluated.forEach(asset => counts[asset.condition]++)
  return { evaluated, counts, total: evaluated.length }
}
export function filterAssets<T extends Asset & { condition: Condition }>(assets: readonly T[], query: string, category: Category | '', condition: Condition | '') {
  const search = query.trim().toLowerCase()
  return assets.filter(asset => (!search || `${asset.id} ${asset.name}`.toLowerCase().includes(search)) &&
    (!category || asset.category === category) && (!condition || asset.condition === condition))
}
