import { test } from 'node:test'
import assert from 'node:assert/strict'
import { demoSnapshot } from '../data/demo'
import { buildDashboard, filterAssets } from './selectors'
import { evaluateAsset } from './evaluateAsset'
import { categories } from './types'

test('inventory contains exactly 50 unique identities and the required category split', () => {
  assert.equal(demoSnapshot.assets.length, 50)
  assert.equal(new Set(demoSnapshot.assets.map(a => a.id)).size, 50)
  assert.deepEqual(categories.map(c => demoSnapshot.assets.filter(a => a.category === c).length), [14, 10, 9, 9, 8])
})
test('all references resolve and normalized readings match their monitoring points', () => {
  const ids = new Set(demoSnapshot.assets.map(a => a.id))
  for (const collection of [demoSnapshot.points, demoSnapshot.readings, demoSnapshot.events, demoSnapshot.maintenance, demoSnapshot.documents]) {
    collection.forEach(record => assert.ok(ids.has(record.assetId)))
  }
  demoSnapshot.assets.forEach(a => assert.ok(demoSnapshot.locations.some(l => l.id === a.locationId)))
  demoSnapshot.readings.forEach(r => assert.ok(demoSnapshot.points.some(p => p.id === r.pointId && p.assetId === r.assetId && p.unit === r.unit)))
})
test('derived conditions and KPI totals match the required initial evidence', () => {
  const { counts, total, evaluated } = buildDashboard(demoSnapshot)
  assert.deepEqual(counts, { Normal: 43, Attention: 5, Critical: 1, Unknown: 1 })
  assert.equal(Object.values(counts).reduce((sum, n) => sum + n, 0), total)
  assert.equal(evaluated.find(a => a.condition === 'Critical')?.category, categories[1])
  assert.equal(evaluated.find(a => a.condition === 'Unknown')?.id, 'FRZ-LAB-03')
  assert.ok(evaluated.every(a => a.reasons.length > 0))
})
test('one AHU with four points remains one asset; operating state does not set condition', () => {
  const asset = demoSnapshot.assets.find(a => a.id === 'AHU-OT-01')!
  assert.equal(demoSnapshot.points.filter(p => p.assetId === asset.id).length, 4)
  assert.equal(evaluateAsset({ ...asset, operatingState: 'Stopped' }, demoSnapshot, demoSnapshot.now).condition, 'Normal')
  const standby = buildDashboard(demoSnapshot).evaluated.find(a => a.id === 'GEN-01')!
  assert.equal(standby.operatingState, 'Standby')
  assert.equal(standby.condition, 'Normal')
})
test('condition changes with evidence, without mutating equipment identity', () => {
  const asset = demoSnapshot.assets.find(a => a.id === 'AHU-OT-01')!
  const point = demoSnapshot.points.find(p => p.assetId === asset.id && p.label === 'Filter differential pressure')!
  const readings = demoSnapshot.readings.map(r => r.pointId === point.id ? { ...r, value: 450 } : r)
  assert.equal(evaluateAsset(asset, { ...demoSnapshot, readings }, demoSnapshot.now).condition, 'Critical')
  assert.equal(evaluateAsset(asset, demoSnapshot, demoSnapshot.now).condition, 'Normal')
})
test('missing, uncertain and stale data do not produce a Normal condition', () => {
  const asset = demoSnapshot.assets.find(a => a.id === 'AHU-OT-01')!
  assert.equal(evaluateAsset(asset, { ...demoSnapshot, readings: [] }, demoSnapshot.now).condition, 'Unknown')
  const readings = demoSnapshot.readings.map(r => ({ ...r, quality: 'Uncertain' as const }))
  assert.equal(evaluateAsset(asset, { ...demoSnapshot, readings }, demoSnapshot.now).condition, 'Unknown')
  assert.equal(evaluateAsset(asset, demoSnapshot, '2026-10-28T03:30:00Z').condition, 'Unknown')
})
test('critical evidence has priority even when other data is unavailable', () => {
  const asset = demoSnapshot.assets.find(a => a.id === 'AHU-OT-01')!
  const readings = demoSnapshot.readings.map(r => r.assetId === asset.id
    ? { ...r, value: r.unit === 'Pa' ? 450 : null, quality: r.unit === 'Pa' ? 'Good' as const : 'Unavailable' as const } : r)
  assert.equal(evaluateAsset(asset, { ...demoSnapshot, readings }, demoSnapshot.now).condition, 'Critical')
})
test('search matches IDs and names; category and condition filters combine', () => {
  const { evaluated } = buildDashboard(demoSnapshot)
  assert.equal(filterAssets(evaluated, ' ahu-ot-01 ', '', '').length, 1)
  assert.equal(filterAssets(evaluated, 'centrifuge', '', '').length, 2)
  assert.equal(filterAssets(evaluated, '', categories[1], 'Critical')[0]?.id, 'MG-O2-01')
  assert.equal(filterAssets(evaluated, 'not-an-asset', '', '').length, 0)
})
