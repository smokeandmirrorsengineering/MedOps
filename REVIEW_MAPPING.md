# Verified OT review mapping — template 1.0

Inspected against the actual v0.1C seed on 28 October 2026. Scope is the **shared Operating theatres engineering area, Main clinical building, Level 3, OT plant room**. This is not a service association with an individual theatre or OT-01. No new equipment relationships, readings or operating limits were invented.

| Checklist item | Supported equipment | Available evidence | Limits / human work |
| --- | --- | --- | --- |
| 1. Air-handling condition and operation | AHU-OT-01, AHU-OT-02, AHU-OT-03, EF-OT-01 | AHUs: supply temperature, filter differential pressure, airflow, motor current; extract fan: supply temperature only. Operating state, evaluated condition, alarms and service metadata | EF temperature is a seed label, not proof of fan performance. AHU-OT-02 has the existing filter-resistance Attention alarm. No claim about theatre room pressure or airflow compliance |
| 2. Available environmental monitoring | AHU-OT-01/02/03 | Supply-air temperatures only | No room temperature, humidity, particle count or theatre pressure tags exist; explicitly unavailable |
| 3. Physical filter / indicator observations | None (human-only) | No automatic evidence linked | Direct visual/local-gauge observation is independent of the digital filter tag; no inferred physical inspection |
| 4. Medical-gas alarm indications | None (human-only) | MG-AVSU-01 is in this area but has only an inspection score | No alarm-state telemetry. Do not substitute MG-O2-01 plant pressure or assume it serves this scope |
| 5. UPS indicators | UPS-02 | Output voltage, battery-health percentage, existing battery Attention alarm, maintenance metadata | Name and actual location support this common OT engineering area; no individual-theatre circuit association |
| 6. Backup-power service/test documentation | None (human-only) | No actual test documents | All seed manuals/drawings are placeholders; UPS service metadata is not a generator/backup-power test report |
| 7. Monitoring availability and gaps | All six scope assets | Each asset's connection, method, quality, reporting age and condition | Report each affected asset individually. MG-AVSU-01 is inspection based, not continuously connected. No blood-bank/laboratory freezer or other unrelated asset included |
| 8. Unresolved engineering issues | Scope-limited existing active alarms and exceptions from submitted reviews of this same scope | Initially AHU-OT-02 and UPS-02 alerts; later AHU-OT-01 scenario alarm, when active | Each issue requires explicit acknowledgement; this never resolves an issue or clears an equipment alarm |
| 9. General observations / handover notes | None (human-only) | Engineer's recorded observations | No formal shift-handover sign-off |

All six mapped assets have sample maintenance records, last service 24 September and next service 24 November 2026; these are metadata, not proof that a technician has sighted a test certificate. Review prompts are synthetic examples, not approved hospital procedures. All numeric change tolerances in the template are demonstration comparison tolerances, never operating limits.
