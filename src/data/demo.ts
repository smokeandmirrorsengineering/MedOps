import { categories } from '../domain/types'
import type { Asset, AssetEvent, Location, MaintenanceRecord, MonitoringPoint, Reading, SampleDocument, Snapshot } from '../domain/types'

// One fixed clock: reopening the demo never ages its evidence against wall-clock time.
export const DEMO_NOW = '2026-10-27T03:30:00.000Z'
const reportedAt = '2026-10-27T03:28:00.000Z'
type Seed = [id: string, name: string]
const roster: Seed[][] = [
  [
    ['AHU-OT-01', 'Operating theatre air handling unit 01'],
    ['AHU-OT-02', 'Operating theatre air handling unit 02'],
    ['AHU-OT-03', 'Operating theatre air handling unit 03'],
    ['AHU-ICU-01', 'ICU air handling unit'],
    ['AHU-LAB-01', 'Laboratory air handling unit'],
    ['CHL-01', 'Primary chilled water plant'],
    ['CHL-02', 'Standby chilled water plant'],
    ['PMP-CHW-01', 'Chilled water circulation pump 01'],
    ['PMP-CHW-02', 'Chilled water circulation pump 02'],
    ['EF-OT-01', 'Operating theatre extract fan'],
    ['EF-ISO-01', 'Isolation room extract fan'],
    ['FCU-WD-01', 'Ward fan coil unit 01'],
    ['FCU-WD-02', 'Ward fan coil unit 02'],
    ['AHU-CSSD-01', 'CSSD air handling unit'],
  ],
  [
    ['MG-O2-01', 'Oxygen supply manifold 01'],
    ['MG-O2-02', 'Reserve oxygen manifold'],
    ['MG-AIR-01', 'Medical air compressor 01'],
    ['MG-AIR-02', 'Medical air compressor 02'],
    ['MG-AIR-03', 'Medical air compressor 03'],
    ['MG-VAC-01', 'Medical vacuum pump 01'],
    ['MG-VAC-02', 'Medical vacuum pump 02'],
    ['MG-VAC-03', 'Medical vacuum pump 03'],
    ['MG-DRY-01', 'Medical air dryer'],
    ['MG-AVSU-01', 'Theatre area valve service unit'],
  ],
  [
    ['FRG-BB-01', 'Blood bank refrigerator 01'],
    ['FRG-BB-02', 'Blood bank refrigerator 02'],
    ['FRZ-LAB-01', 'Laboratory freezer 01'],
    ['FRZ-LAB-02', 'Laboratory freezer 02'],
    ['FRZ-LAB-03', 'Laboratory freezer 03'],
    ['FRG-PH-01', 'Pharmacy refrigerator'],
    ['FRG-VAC-01', 'Vaccine refrigerator'],
    ['FRZ-PL-01', 'Plasma storage freezer'],
    ['CR-MOR-01', 'Mortuary cold room'],
  ],
  [
    ['UPS-01', 'Critical care UPS 01'],
    ['UPS-02', 'Operating theatre UPS 02'],
    ['UPS-LAB-01', 'Laboratory UPS'],
    ['GEN-01', 'Emergency diesel generator 01'],
    ['GEN-02', 'Emergency diesel generator 02'],
    ['ATS-01', 'Automatic transfer switch 01'],
    ['ATS-02', 'Automatic transfer switch 02'],
    ['MDB-01', 'Main distribution board'],
    ['TRF-01', 'Hospital service transformer'],
  ],
  [
    ['LAB-CEN-01', 'Bench centrifuge 01'],
    ['LAB-CEN-02', 'Bench centrifuge 02'],
    ['LAB-INC-01', 'Microbiology incubator 01'],
    ['LAB-INC-02', 'Microbiology incubator 02'],
    ['LAB-BSC-01', 'Biosafety cabinet 01'],
    ['LAB-BSC-02', 'Biosafety cabinet 02'],
    ['LAB-WB-01', 'Laboratory water bath'],
    ['LAB-AUT-01', 'Laboratory autoclave'],
  ],
]

export const locations: Location[] = [
  { id: 'loc-ot', building: 'Main clinical building', floor: 'Level 3', department: 'Operating theatres', room: 'OT plant room' },
  { id: 'loc-plant', building: 'Utility building', floor: 'Ground floor', department: 'Central utilities', room: 'Mechanical plant room' },
  { id: 'loc-gas', building: 'Utility building', floor: 'Ground floor', department: 'Medical gas', room: 'Medical gas plant' },
  { id: 'loc-cold', building: 'Main clinical building', floor: 'Level 1', department: 'Blood bank & cold storage', room: 'Cold storage suite' },
  { id: 'loc-power', building: 'Utility building', floor: 'Ground floor', department: 'Electrical services', room: 'Electrical plant room' },
  { id: 'loc-lab', building: 'Main clinical building', floor: 'Level 2', department: 'Laboratory services', room: 'Core laboratory' },
  { id: 'loc-icu', building: 'Main clinical building', floor: 'Level 4', department: 'Intensive care', room: 'ICU service room' },
  { id: 'loc-ward', building: 'Main clinical building', floor: 'Level 5', department: 'Inpatient wards', room: 'Ward service room' },
  { id: 'loc-cssd', building: 'Main clinical building', floor: 'Level 2', department: 'Sterile services', room: 'CSSD plant room' },
  { id: 'loc-isolation', building: 'Main clinical building', floor: 'Level 4', department: 'Isolation care', room: 'Isolation service room' },
  { id: 'loc-pharmacy', building: 'Main clinical building', floor: 'Ground floor', department: 'Pharmacy', room: 'Pharmacy cold storage' },
  { id: 'loc-mortuary', building: 'Support building', floor: 'Ground floor', department: 'Mortuary', room: 'Cold room' },
]
const locationIds = ['loc-ot', 'loc-gas', 'loc-cold', 'loc-power', 'loc-lab']
const makers = ['Aeris Engineering', 'Vitala Systems', 'Polarion Instruments', 'Voltwell Power', 'Meridian Scientific']
export const assets: Asset[] = roster.flatMap((group, categoryIndex) => group.map(([id, name], index) => {
  const inspection = categoryIndex === 4 || id.startsWith('ATS') || id === 'MG-AVSU-01'
  let locationId = locationIds[categoryIndex]
  if (id.includes('LAB') || categoryIndex === 4) locationId = 'loc-lab'
  if (id.includes('ICU')) locationId = 'loc-icu'
  if (/^(CHL|PMP)/.test(id)) locationId = 'loc-plant'
  if (id.includes('WD')) locationId = 'loc-ward'
  if (id.includes('CSSD')) locationId = 'loc-cssd'
  if (id.includes('ISO')) locationId = 'loc-isolation'
  if (id === 'FRG-PH-01' || id === 'FRG-VAC-01') locationId = 'loc-pharmacy'
  if (id === 'CR-MOR-01') locationId = 'loc-mortuary'
  if (id === 'UPS-02' || id === 'MG-AVSU-01') locationId = 'loc-ot'
  return {
    id, name, category: categories[categoryIndex], locationId,
    manufacturer: makers[categoryIndex], model: `Demo ${['AE', 'VS', 'PI', 'VP', 'MS'][categoryIndex]}-${100 + index}`,
    operatingState: id.startsWith('GEN') || id === 'CHL-02' || id === 'MG-O2-02' ? 'Standby' : id === 'LAB-CEN-02' ? 'Stopped' : 'Running',
    monitoring: {
      method: inspection ? 'Manual inspection' : 'Simulated telemetry',
      source: inspection ? 'Synthetic technician inspection' : `Mock gateway / ${id}`,
      expectedIntervalMinutes: inspection ? 1440 : 15,
    },
  }
}))

export const points: MonitoringPoint[] = []
export const readings: Reading[] = []
function addPoint(assetId: string, label: string, unit: string, value: number | null, rules: Partial<MonitoringPoint> = {}) {
  const pointId = `${assetId}:${points.filter(p => p.assetId === assetId).length + 1}`
  points.push({ ...rules, id: pointId, assetId, label, unit })
  readings.push({ pointId, assetId, value, unit, quality: value === null ? 'Unavailable' : 'Good', timestamp: reportedAt })
}
for (const asset of assets) {
  const id = asset.id
  if (asset.monitoring.method === 'Manual inspection') {
    addPoint(id, 'Inspection score', '/ 100', id === 'LAB-CEN-02' ? 68 : 98, { warningBelow: 80 })
  } else if (asset.category === categories[0]) {
    addPoint(id, 'Supply temperature', '°C', id.startsWith('CHL') || id.startsWith('PMP') ? 7.2 : 19.4, { warningAbove: 28 })
    if (id.startsWith('AHU')) {
      addPoint(id, 'Filter differential pressure', 'Pa', id === 'AHU-OT-02' ? 284 : 142, { warningAbove: 250, criticalAbove: 400 })
      addPoint(id, 'Airflow', 'm³/h', 4250, { warningBelow: 3000 })
      addPoint(id, 'Motor current', 'A', 8.4, { warningAbove: 14 })
    }
  } else if (asset.category === categories[1]) {
    const vacuum = id.includes('VAC')
    addPoint(id, vacuum ? 'Vacuum magnitude' : 'Supply pressure', vacuum ? 'kPa' : 'bar', id === 'MG-O2-01' ? 2.1 : vacuum ? 61 : 4.8,
      vacuum ? { warningBelow: 40, criticalBelow: 25 } : { warningBelow: 3.5, criticalBelow: 2.5 })
  } else if (asset.category === categories[2]) {
    const freezer = id.startsWith('FRZ')
    addPoint(id, 'Chamber temperature', '°C', id === 'FRZ-LAB-03' ? null : id === 'FRG-BB-02' ? 9.1 : freezer ? -24.2 : 4.2,
      { warningAbove: freezer ? -15 : 8, criticalAbove: freezer ? -5 : 13 })
  } else {
    addPoint(id, 'Output voltage', 'V', 230, { warningBelow: 210, warningAbove: 250 })
    if (id.startsWith('UPS')) addPoint(id, 'Battery health', '%', id === 'UPS-02' ? 71 : 96, { warningBelow: 80, criticalBelow: 50 })
  }
}

export const maintenance: MaintenanceRecord[] = assets.map(asset => ({
  id: `svc-${asset.id}`, assetId: asset.id, lastServiceDate: '2026-09-24',
  nextServiceDate: asset.id === 'CHL-01' ? '2026-10-25' : '2026-11-24',
  summary: asset.id.startsWith('AHU') ? 'Filter inspection, belt tension and motor checks completed.' : 'Routine inspection, functional checks and service completed.',
  technician: 'Demo engineering team',
}))
const eventSeeds: [string, AssetEvent['severity'], string, string, string][] = [
  ['MG-O2-01', 'Critical', 'Oxygen supply pressure below demo limit', 'Synthetic pressure reading is 2.1 bar. Review the simulated supply condition.', '2026-10-27T03:26:00Z'],
  ['FRG-BB-02', 'Attention', 'Cold storage temperature elevated', 'Synthetic chamber temperature is 9.1 °C, above the fictional warning limit.', '2026-10-27T03:18:00Z'],
  ['AHU-OT-02', 'Attention', 'AHU filter resistance increasing', 'Synthetic differential pressure is 284 Pa. A filter inspection is suggested in this demo.', '2026-10-27T03:12:00Z'],
  ['UPS-02', 'Attention', 'UPS battery health requires review', 'Synthetic battery health is 71%, below the fictional warning limit.', '2026-10-27T02:55:00Z'],
  ['LAB-CEN-02', 'Attention', 'Centrifuge inspection follow-up', 'Synthetic inspection noted lid-latch wear; inspection score is 68/100.', '2026-10-27T02:40:00Z'],
  ['CHL-01', 'Attention', 'Scheduled chiller service overdue', 'The demo service date was 25 October 2026.', '2026-10-27T02:10:00Z'],
  ['FRZ-LAB-03', 'Info', 'Freezer monitoring data unavailable', 'The synthetic gateway has no usable temperature reading.', '2026-10-27T02:00:00Z'],
]
export const events: AssetEvent[] = eventSeeds.map(([assetId, severity, title, description, timestamp], index) => ({
  id: `event-${index + 1}`, assetId, severity, title, description, timestamp, active: true,
}))
// Give every asset an event history, without making routine events active alarms.
assets.filter(a => !eventSeeds.some(e => e[0] === a.id)).forEach(asset => events.push({
  id: `event-routine-${asset.id}`, assetId: asset.id, timestamp: '2026-10-27T02:00:00Z', severity: 'Info',
  title: 'Routine condition review completed', description: 'Synthetic evidence is within demonstration limits.', active: false,
}))
export const documents: SampleDocument[] = assets.flatMap(asset => [
  { id: `doc-manual-${asset.id}`, assetId: asset.id, title: `${asset.id} · Operation & service manual`, kind: 'Manual', revision: 'A', placeholder: true },
  { id: `doc-schematic-${asset.id}`, assetId: asset.id, title: `${asset.id} · Engineering schematic`, kind: 'Drawing', revision: '01', placeholder: true },
])
export const demoSnapshot: Snapshot = { now: DEMO_NOW, assets, locations, points, readings, maintenance, documents, events }
