import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { categories } from "../domain/types";
import { filterAssets } from "../domain/selectors";
import { categoryMetadata } from "../lib/categories";
import {
  clampPage,
  conditions,
  normalizeAssetParams,
  orderAssets,
  parseAssetParams,
  updateParams,
} from "../lib/navigation";
import { useDemoData } from "../state/DemoDataProvider";
import { useAssetSelection } from "../state/useAssetSelection";
import { StatusBadge } from "../components/StatusBadge";
import { PageHeading } from "../components/PageHeading";
import { SimulationBadge } from "../components/DemoControls";
const pageSize = 8;
export function AssetsPage() {
  const { snapshot, evaluated, total } = useDemoData();
  const { openAsset } = useAssetSelection();
  const [params, setParams] = useSearchParams();
  const { query, category, condition, requestedPage } =
    parseAssetParams(params);
  const filtered = useMemo(
    () => orderAssets(filterAssets(evaluated, query, category, condition)),
    [evaluated, query, category, condition],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = clampPage(requestedPage, filtered.length, pageSize);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const canonical = normalizeAssetParams(params, currentPage).toString();
  useEffect(() => {
    if (params.toString() !== canonical)
      setParams(canonical, { replace: true });
  }, [params, canonical, setParams]);
  function changeFilters(changes: Record<string, string>, replace = false) {
    setParams((current) => updateParams(current, changes, true), { replace });
  }
  function setPage(page: number) {
    setParams((current) =>
      updateParams(current, { page: page === 1 ? "" : String(page) }),
    );
  }
  function clearFilters() {
    changeFilters({ q: "", system: "", condition: "" });
  }
  return (
    <>
      <PageHeading
        page="Assets"
        title="Asset inventory"
        description="Explore equipment, condition evidence and service information."
      />
      <section className="panel inventory" id="asset-inventory">
        <div className="inventory-heading">
          <div>
            <h2>
              Asset inventory <span className="inventory-count">{total}</span>
            </h2>
            <p>Your equipment register, connected to its condition.</p>
          </div>
          <span className="read-only-label">
            <ShieldCheck size={14} />
            Synthetic equipment
          </span>
        </div>
        <div className="filters">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search assets"
              placeholder="Search asset ID or equipment name..."
              value={query}
              onChange={(e) => {
                changeFilters({ q: e.target.value }, true);
              }}
            />
            {query && (
              <button
                className="clear-search"
                aria-label="Clear search"
                onClick={() => {
                  changeFilters({ q: "" }, true);
                }}
              >
                <X size={14} />
              </button>
            )}
          </label>
          <div className="filter-select">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Filter by category"
              value={category ? categoryMetadata[category].slug : ""}
              onChange={(e) => {
                changeFilters({ system: e.target.value });
              }}
            >
              <option value="">All systems</option>
              {categories.map((c) => (
                <option key={c} value={categoryMetadata[c].slug}>
                  {categoryMetadata[c].label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </div>
          <div className="filter-select condition-select">
            <span className="filter-dot" />
            <select
              aria-label="Filter by condition"
              value={condition}
              onChange={(e) => changeFilters({ condition: e.target.value })}
            >
              <option value="">All conditions</option>
              {conditions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={13} />
          </div>
          {(query || category || condition) && (
            <button className="reset-filters" onClick={clearFilters}>
              Reset filters
            </button>
          )}
        </div>

        <div className="filter-summary" aria-live="polite">
          <strong>
            {condition ? condition + " equipment" : "Equipment register"} —{" "}
            {filtered.length} matching{" "}
            {filtered.length === 1 ? "asset" : "assets"}
          </strong>
          <span>of {total} total assets · ordered by engineering priority</span>
        </div>
        {(query || category || condition) && (
          <div className="filter-chips" aria-label="Active filters">
            {query && (
              <button
                onClick={() => changeFilters({ q: "" })}
                aria-label="Remove search filter"
              >
                Search: {query}
                <X size={12} />
              </button>
            )}
            {category && (
              <button
                onClick={() => changeFilters({ system: "" })}
                aria-label="Remove system filter"
              >
                {categoryMetadata[category].label}
                <X size={12} />
              </button>
            )}
            {condition && (
              <button
                onClick={() => changeFilters({ condition: "" })}
                aria-label="Remove condition filter"
              >
                {condition}
                <X size={12} />
              </button>
            )}
          </div>
        )}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">ASSET / EQUIPMENT</th>
                <th scope="col">SYSTEM</th>
                <th scope="col">LOCATION</th>
                <th scope="col">CONDITION</th>
                <th scope="col">OPERATING STATE</th>
                <th scope="col">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((asset) => {
                const Icon = categoryMetadata[asset.category].icon;
                const location = snapshot.locations.find(
                  (l) => l.id === asset.locationId,
                )!;
                return (
                  <tr key={asset.id} onClick={() => openAsset(asset.id)}>
                    <td>
                      <div className="asset-cell">
                        <span className="table-asset-icon">
                          <Icon size={18} />
                        </span>
                        <div>
                          <button
                            className="asset-link mono"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAsset(asset.id);
                            }}
                          >
                            {asset.id}
                          </button>
                          <span>{asset.name}</span>
                          <SimulationBadge assetId={asset.id} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-cell">
                        {categoryMetadata[asset.category].label}
                      </span>
                    </td>
                    <td>
                      <div className="location-cell">
                        <span>{location.department}</span>
                        <small>
                          {location.floor} · {location.room}
                        </small>
                      </div>
                    </td>
                    <td>
                      <StatusBadge condition={asset.condition} />
                    </td>
                    <td>
                      <span className="operating">
                        <span
                          className={
                            asset.operatingState === "Running"
                              ? "running-dot"
                              : "muted-dot"
                          }
                        />
                        {asset.operatingState}
                      </span>
                    </td>
                    <td>
                      <button
                        className="row-open"
                        aria-label={`View ${asset.id} details`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openAsset(asset.id);
                        }}
                      >
                        <ChevronRight size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={28} />
            <h3>No matching equipment</h3>
            <p>Try a different asset ID, name, or filter.</p>
            <button onClick={clearFilters}>Clear all filters</button>
          </div>
        )}
        <div className="table-footer">
          <span aria-live="polite">
            Showing{" "}
            <strong>
              {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{" "}
            of <strong>{filtered.length}</strong> assets
            {filtered.length !== total && ` (${total} total)`}
          </span>
          <div className="pagination">
            <button
              aria-label="Previous page"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                aria-label={`Page ${n}`}
                aria-current={currentPage === n ? "page" : undefined}
                className={currentPage === n ? "current-page" : ""}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              aria-label="Next page"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === pages}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
