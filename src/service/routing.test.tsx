import React from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import App from "../App";
import { DemoDataProvider } from "../state/DemoDataProvider";
import { ReviewProvider } from "../reviews/ReviewProvider";
import { FollowUpProvider } from "../followups/FollowUpProvider";
import { GuideProvider } from "../guide/GuideProvider";
import { ServiceProvider } from "./ServiceProvider";
function route(path:string){return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><DemoDataProvider><ReviewProvider><FollowUpProvider><ServiceProvider clock={{now:()=>"2026-11-04T04:00:00.000Z",id:()=>"routing-test"}}><GuideProvider><App/></GuideProvider></ServiceProvider></FollowUpProvider></ReviewProvider></DemoDataProvider></MemoryRouter>);}
test("service deep links resolve to the intended pages without colliding with the equipment drawer",()=>{for(const [path,text] of [["/service","Cases Requiring Action"],["/service/equipment?type=manual","2 matching equipment records"],["/service/equipment/CT-RAD-01","No connected monitoring is configured"],["/service/cases/new?equipment=CT-RAD-01","Create service case"],["/service/cases/SC-DEMO-CT-001","Quotation &amp; decision"],["/service/cases/SC-DEMO-CT-001/summary","SERVICE CASE SUMMARY"]]){const html=route(path);assert.ok(html.includes(text),path);assert.equal(html.includes('role="dialog"'),false,path);}});
test("missing service identities give recoverable states and existing monitoring routes retain 50 assets",()=>{assert.ok(route("/service/cases/SC-MISSING").includes("Service case unavailable"));assert.ok(route("/service/equipment/MISSING").includes("Equipment record unavailable"));const html=route("/dashboard");assert.ok(html.includes("Total fleet"));assert.ok(html.includes("50"));assert.ok(html.includes("Explore Evidanor"));});
