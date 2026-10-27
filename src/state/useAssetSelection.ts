import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { updateParams } from "../lib/navigation";

// Opening pushes history so Back dismisses the drawer. Closing edits only this URL.
export function useAssetSelection() {
  const [params, setParams] = useSearchParams();
  const openAsset = useCallback(
    (id: string) => {
      setParams((current) => updateParams(current, { asset: id }));
    },
    [setParams],
  );
  const closeAsset = useCallback(() => {
    setParams((current) => updateParams(current, { asset: "" }), {
      replace: true,
    });
  }, [setParams]);
  return { assetId: params.get("asset"), openAsset, closeAsset };
}
