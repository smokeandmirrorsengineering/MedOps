import { demoSnapshot } from './demo'
import type { Snapshot } from '../domain/types'

// Replace this boundary with a backend client when approved telemetry becomes available.
export interface DataProvider { getSnapshot(): Snapshot }
export const mockDataProvider: DataProvider = { getSnapshot: () => demoSnapshot }
