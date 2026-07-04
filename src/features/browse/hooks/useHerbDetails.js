import { useCallback, useEffect, useState } from "react";
import {
  getHerbById,
  getHerbWithHerbalist,
  getHerbalistsForHerb,
} from "@api/herbs";
import { getHerbalistsForInventoryHerb } from "@api/inventory";
import { normalizeHerb } from "@features/browse/services/herbs";

function useHerbDetails(herbId) {
  const [herb, setHerb] = useState(null);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHerbDetails = useCallback(async () => {
    if (!herbId) {
      setError("Herb id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [herbData, herbalistData, providersData, inventoryProvidersData] =
        await Promise.all([
          getHerbById(herbId),
          getHerbWithHerbalist(herbId).catch(() => null),
          getHerbalistsForHerb(herbId).catch(() => []),
          getHerbalistsForInventoryHerb(herbId).catch(() => []),
        ]);
      setHerb(
        normalizeHerb({
          ...(herbData || {}),
          ...(herbalistData || {}),
        }),
      );

      // Merge providers from both endpoints, prioritizing inventory data
      const herbProviders = Array.isArray(providersData)
        ? providersData
        : providersData?.herbalists || providersData?.items || [];
      const inventoryProviders = Array.isArray(inventoryProvidersData)
        ? inventoryProvidersData
        : inventoryProvidersData?.herbalists ||
          inventoryProvidersData?.items ||
          [];

      // Create a map of inventory providers by herbalistId for easy lookup
      const inventoryMap = new Map();
      inventoryProviders.forEach((item) => {
        const id = item?.herbalistId || item?.userId || item?.id;
        if (id) inventoryMap.set(String(id), item);
      });

      // Merge: use inventory data when available, fallback to herbs data
      const mergedProviders = herbProviders.map((provider) => {
        const providerId = String(
          provider?.herbalistId || provider?.userId || provider?.id || "",
        );
        const inventoryData = inventoryMap.get(providerId);
        if (inventoryData) {
          return {
            ...provider,
            pricePerKilo:
              provider?.pricePerKilo ||
              inventoryData?.pricePerKilo ||
              inventoryData?.price,
            inventoryId: inventoryData?.inventoryId || inventoryData?.id,
            isAvailable:
              inventoryData?.isActive ?? inventoryData?.isAvailable ?? true,
          };
        }
        return provider;
      });

      // Add inventory-only providers not already in the herbs list
      const existingIds = new Set(
        mergedProviders.map((p) =>
          String(p?.herbalistId || p?.userId || p?.id || ""),
        ),
      );
      inventoryProviders.forEach((item) => {
        const id = String(item?.herbalistId || item?.userId || item?.id || "");
        if (id && !existingIds.has(id)) {
          mergedProviders.push({
            ...item,
            pricePerKilo: item?.pricePerKilo || item?.price,
          });
        }
      });

      setProviders(mergedProviders);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load herb details.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [herbId]);

  useEffect(() => {
    loadHerbDetails();
  }, [loadHerbDetails]);

  return {
    herb,
    providers,
    isLoading,
    error,
    reload: loadHerbDetails,
  };
}

export default useHerbDetails;
