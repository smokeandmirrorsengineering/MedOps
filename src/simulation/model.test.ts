import { test } from "node:test";
import assert from "node:assert/strict";
import { demoSnapshot } from "../data/demo";
import { buildDashboard } from "../domain/selectors";
import { createSimulationReducer, effectiveSnapshot, initialOverlay, orderedHistory, scenarioAlerts, assetSimulation } from "./model";
import { FAULT_ASSET_ID } from "./types";
import type { SimulationAction, SimulationOverlay } from "./types";

const reduce = createSimulationReducer(demoSnapshot);
const baseline = () => initialOverlay(demoSnapshot);
const fault: SimulationAction = { type: "ACTIVATE_FAULT" };
const loss: SimulationAction = { type: "LOSE_CONNECTION", assetId: "FRG-BB-01" };
const ahuLoss: SimulationAction = { type: "LOSE_CONNECTION", assetId: FAULT_ASSET_ID };
const counts = (state: SimulationOverlay) => buildDashboard(effectiveSnapshot(demoSnapshot,state)).counts;
const condition = (state: SimulationOverlay, id: string) => buildDashboard(effectiveSnapshot(demoSnapshot,state)).evaluated.find(asset => asset.id === id)!.condition;

test("fault activation derives 42/5/2/1 with one active alert and one historical transition", () => {
  const state = reduce(baseline(),fault);
  assert.deepEqual(counts(state),{Normal:42,Attention:5,Critical:2,Unknown:1});
  assert.equal(condition(state,FAULT_ASSET_ID),"Critical");
  assert.equal(scenarioAlerts(state).filter(alert => alert.active).length,1);
  assert.equal(state.history.length,1);
  assert.equal(state.history[0].transition,"fault-activated");
});
test("communication loss derives Unknown and retains last-known numeric readings and timestamps", () => {
  const state = reduce(baseline(),loss);
  assert.deepEqual(counts(state),{Normal:42,Attention:5,Critical:1,Unknown:2});
  const snapshot = effectiveSnapshot(demoSnapshot,state);
  const before = demoSnapshot.readings.find(reading => reading.assetId === "FRG-BB-01")!;
  const after = snapshot.readings.find(reading => reading.pointId === before.pointId)!;
  assert.equal(after.value,before.value);
  assert.equal(after.timestamp,before.timestamp);
  assert.equal(after.quality,"Unavailable");
  assert.equal(snapshot.assets.find(asset => asset.id === "FRG-BB-01")!.monitoring.connectivity,"Unavailable");
});
test("both scenarios on separate assets derive 41/5/2/2", () => {
  assert.deepEqual(counts(reduce(reduce(baseline(),fault),loss)),{Normal:41,Attention:5,Critical:2,Unknown:2});
});
test("clearing a fault resolves its alert but retains history without keeping the asset Critical", () => {
  const state = reduce(reduce(baseline(),fault),{type:"CLEAR_FAULT"});
  assert.equal(condition(state,FAULT_ASSET_ID),"Normal");
  assert.deepEqual(counts(state),{Normal:43,Attention:5,Critical:1,Unknown:1});
  assert.equal(scenarioAlerts(state)[0].active,false);
  assert.equal(scenarioAlerts(state)[0].resolvedSequence,2);
  assert.deepEqual(state.history.map(event => event.transition),["fault-activated","fault-cleared"]);
  assert.ok(state.history.every(event => !("active" in event)));
  assert.ok(effectiveSnapshot(demoSnapshot,state).events.every(event => !event.id.startsWith("sim-event-")));
});
test("restoring communication resolves the monitoring alert and returns to supported baseline", () => {
  const state = reduce(reduce(baseline(),loss),{type:"RESTORE_CONNECTION",assetId:"FRG-BB-01"});
  assert.equal(condition(state,"FRG-BB-01"),"Normal");
  assert.equal(scenarioAlerts(state)[0].active,false);
  assert.equal(state.history[1].transition,"connection-restored");
});
test("confirmed Critical survives connection loss and is explicitly unverified", () => {
  const state = reduce(reduce(baseline(),fault),ahuLoss);
  const snapshot = effectiveSnapshot(demoSnapshot,state);
  const asset = buildDashboard(snapshot).evaluated.find(asset => asset.id === FAULT_ASSET_ID)!;
  assert.equal(asset.condition,"Critical");
  assert.equal(asset.monitoring.connectivity,"Unavailable");
  assert.ok(asset.reasons.some(reason => reason.includes("last confirmed") && reason.includes("unverified")));
  assert.equal(assetSimulation(state,FAULT_ASSET_ID).lastConfirmedCritical,true);
  const point = snapshot.readings.find(reading => reading.assetId === FAULT_ASSET_ID && reading.unit === "Pa")!;
  assert.equal(point.value,450); assert.equal(point.quality,"Unavailable");
  assert.equal(state.history[1].transition,"connection-lost");
  assert.equal(scenarioAlerts(state).filter(alert => alert.active).length,2);
});
test("restoring a Critical asset's connection does not clear its fault", () => {
  const state = reduce(reduce(reduce(baseline(),fault),ahuLoss),{type:"RESTORE_CONNECTION",assetId:FAULT_ASSET_ID});
  assert.equal(condition(state,FAULT_ASSET_ID),"Critical");
  assert.equal(assetSimulation(state,FAULT_ASSET_ID).lastConfirmedCritical,false);
  assert.equal(scenarioAlerts(state).find(alert => alert.kind === "Equipment condition")!.active,true);
});
test("clearing while disconnected yields Unknown and preserves the last-known fault measurement", () => {
  const state = reduce(reduce(reduce(baseline(),fault),ahuLoss),{type:"CLEAR_FAULT"});
  assert.equal(condition(state,FAULT_ASSET_ID),"Unknown");
  const reading = effectiveSnapshot(demoSnapshot,state).readings.find(reading => reading.assetId === FAULT_ASSET_ID && reading.unit === "Pa")!;
  assert.equal(reading.value,450); assert.equal(reading.quality,"Unavailable");
  const restored = reduce(state,{type:"RESTORE_CONNECTION",assetId:FAULT_ASSET_ID});
  assert.equal(condition(restored,FAULT_ASSET_ID),"Normal");
});
test("a new fault cannot be confirmed using unavailable telemetry", () => {
  const state = reduce(baseline(),ahuLoss);
  assert.equal(reduce(state,fault),state);
  assert.equal(condition(state,FAULT_ASSET_ID),"Unknown");
});
test("repeated actions are idempotent and never add duplicate transitions", () => {
  for (const action of [fault,loss,ahuLoss] as const) {
    const state = reduce(baseline(),action);
    assert.equal(reduce(state,action),state);
  }
  const cleared = reduce(reduce(baseline(),fault),{type:"CLEAR_FAULT"});
  assert.equal(reduce(cleared,{type:"CLEAR_FAULT"}),cleared);
  const restored = reduce(reduce(baseline(),loss),{type:"RESTORE_CONNECTION",assetId:"FRG-BB-01"});
  assert.equal(reduce(restored,{type:"RESTORE_CONNECTION",assetId:"FRG-BB-01"}),restored);
});
test("identical simulation timestamps have monotonically increasing sequences and stable history order", () => {
  let state = reduce(baseline(),fault);
  state = reduce(state,loss);
  state = reduce(state,{type:"CLEAR_FAULT"});
  state = reduce(state,{type:"RESTORE_CONNECTION",assetId:"FRG-BB-01"});
  assert.deepEqual(state.history.map(event=>event.sequence),[1,2,3,4]);
  assert.ok(state.history.every(event=>event.timestamp===demoSnapshot.now));
  assert.deepEqual(orderedHistory(state.history).map(event=>event.sequence),[4,3,2,1]);
  assert.equal(state.nextSequence,5);
});
test("multiple cycles retain distinct resolved alerts and only the current activation remains active", () => {
  let state = reduce(baseline(),fault);
  state = reduce(state,{type:"CLEAR_FAULT"});
  state = reduce(state,fault);
  const alerts = scenarioAlerts(state);
  assert.equal(alerts.length,2); assert.equal(alerts[0].active,false); assert.equal(alerts[1].active,true);
  assert.notEqual(alerts[0].id,alerts[1].id);
});
test("applying overlays never mutates seed records or earlier overlay states", () => {
  const before = JSON.stringify(demoSnapshot);
  const first = reduce(baseline(),fault);
  const firstJson = JSON.stringify(first);
  const second = reduce(first,ahuLoss);
  effectiveSnapshot(demoSnapshot,second);
  reduce(second,{type:"RESET"});
  assert.equal(JSON.stringify(demoSnapshot),before);
  assert.equal(JSON.stringify(first),firstJson);
});
test("Reset restores the entire original snapshot, alerts, simulation clock and sequence", () => {
  const state = reduce(reduce(reduce(baseline(),fault),loss),{type:"RESET"});
  assert.deepEqual(effectiveSnapshot(demoSnapshot,state),demoSnapshot);
  assert.deepEqual(state.history,[]); assert.deepEqual(state.connections,{}); assert.equal(state.fault,null);
  assert.equal(state.nextSequence,1); assert.equal(state.simNow,demoSnapshot.now);
  assert.equal(scenarioAlerts(state).length,0);
  assert.equal(effectiveSnapshot(demoSnapshot,state).events.filter(event=>event.active).length,7);
});
